"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X, Loader2, Clock } from "lucide-react"
import { cn } from "@/render/lib/utils"
import { Button } from "@/render/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/render/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/render/components/ui/popover"

export interface AsyncComboboxOption<T = any> {
  value: string
  label: string
  data?: T
}

interface HistoryItem<T = any> {
  query: string                     // The search query that was used
  option: AsyncComboboxOption<T>    // The actual selected option
  timestamp: number                 // When it was selected
}

interface AsyncComboboxProps<T = any> {
  // Core props
  value?: string
  onValueChange?: (value: string | undefined, option?: AsyncComboboxOption<T> | undefined) => void

  // Async data loading
  loadOptions: (query: string) => Promise<AsyncComboboxOption<T>[]>
  initialOptions?: AsyncComboboxOption<T>[]

  // Display props
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  loadingText?: string
  noResultsText?: string
  typeToSearchText?: string

  // Behavior props
  debounceMs?: number
  minSearchLength?: number
  loadOnMount?: boolean
  clearable?: boolean
  disabled?: boolean
  closeOnSelect?: boolean
  allowCustomValue?: boolean  // Allow arbitrary input values

  // History props
  enableHistory?: boolean
  historyKey?: string  // Required when enableHistory is true - must be unique per combobox instance
  maxHistoryItems?: number
  recentSearchesLabel?: string

  // Style props
  className?: string
  buttonClassName?: string
  popoverClassName?: string
}

export function AsyncCombobox<T = any>({
  value: controlledValue,
  onValueChange,

  loadOptions,
  initialOptions = [],

  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  loadingText = "Loading...",
  noResultsText = "No results found.",
  typeToSearchText = "Type to search...",

  debounceMs = 300,
  minSearchLength = 0,
  loadOnMount = false,
  clearable = true,
  disabled = false,
  closeOnSelect = true,
  allowCustomValue = false,

  enableHistory = false,
  historyKey,
  maxHistoryItems = 5,
  recentSearchesLabel = "Recent searches",

  className,
  buttonClassName,
  popoverClassName,
}: AsyncComboboxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState<string | undefined>(undefined)
  const [searchValue, setSearchValue] = React.useState("")
  const [options, setOptions] = React.useState<AsyncComboboxOption<T>[]>(initialOptions)
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasSearched, setHasSearched] = React.useState(false)
  const [searchHistory, setSearchHistory] = React.useState<HistoryItem<T>[]>([])

  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = React.useRef<AbortController | null>(null)

  // Validate history configuration
  React.useEffect(() => {
    if (enableHistory && !historyKey) {
      console.error('AsyncCombobox: historyKey is required when enableHistory is true. Each combobox instance must have a unique key.')
    }
  }, [enableHistory, historyKey])

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  // Find selected option (from current options or initial options)
  const selectedOption = React.useMemo(() => {
    const allOptions = [...options, ...initialOptions]
    const uniqueOptions = Array.from(
      new Map(allOptions.map(opt => [opt.value, opt])).values()
    )
    return uniqueOptions.find((option) => option.value === value)
  }, [options, initialOptions, value])

  // Get display value - either from selected option or the raw value if custom
  const displayValue = React.useMemo(() => {
    if (selectedOption) {
      return selectedOption.label
    }
    // If allowCustomValue and we have a value but no matching option, show the raw value
    if (allowCustomValue && value) {
      return value
    }
    return null
  }, [selectedOption, value, allowCustomValue])

  // Load search history from localStorage
  React.useEffect(() => {
    if (!enableHistory || !historyKey) return

    try {
      const stored = localStorage.getItem(historyKey)
      if (stored) {
        const history = JSON.parse(stored) as HistoryItem<T>[]
        // Only keep items from the last 30 days and up to maxHistoryItems
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
        const validHistory = history
          .filter(item => item.timestamp > thirtyDaysAgo)
          .slice(0, maxHistoryItems)
        setSearchHistory(validHistory)
      }
    } catch (error) {
      console.error('Failed to load search history:', error)
    }
  }, [enableHistory, historyKey, maxHistoryItems])

  // Save selected item to history
  const saveToHistory = React.useCallback((query: string, option: AsyncComboboxOption<T>) => {
    if (!enableHistory || !historyKey || !query || !option) return

    try {
      const historyItem: HistoryItem<T> = {
        query,
        option,
        timestamp: Date.now()
      }

      // Remove duplicates (same value) and add new item at the beginning
      const newHistory = [
        historyItem,
        ...searchHistory.filter(item => item.option.value !== option.value)
      ].slice(0, maxHistoryItems)

      setSearchHistory(newHistory)
      localStorage.setItem(historyKey, JSON.stringify(newHistory))
    } catch (error) {
      console.error('Failed to save search history:', error)
    }
  }, [enableHistory, searchHistory, maxHistoryItems, historyKey])

  // Load options with debouncing
  const performSearch = React.useCallback(async (query: string) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Check minimum search length
    if (query.length < minSearchLength) {
      setOptions([])
      setHasSearched(false)
      return
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    setHasSearched(true)

    try {
      const results = await loadOptions(query)

      // Check if request was aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setOptions(results)
      }
    } catch (error: any) {
      // Ignore aborted requests
      if (error?.name !== 'AbortError') {
        console.error('Failed to load options:', error)
        setOptions([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [loadOptions, minSearchLength])

  // Handle search input with debouncing
  const handleSearchChange = React.useCallback((value: string) => {
    setSearchValue(value)

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer for debounced search
    if (value || minSearchLength === 0) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch(value)
      }, debounceMs)
    } else {
      setOptions([])
      setHasSearched(false)
    }
  }, [performSearch, debounceMs, minSearchLength])

  // Load initial data on mount if requested
  React.useEffect(() => {
    if (loadOnMount && open && !hasSearched && !searchValue) {
      performSearch("")
    }
  }, [loadOnMount, open, hasSearched, searchValue, performSearch])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Handle selecting from history - directly use the saved option
  const handleHistorySelect = React.useCallback((historyItem: HistoryItem<T>) => {
    const { option } = historyItem

    if (!isControlled) {
      setInternalValue(option.value)
    }

    onValueChange?.(option.value, option)

    if (closeOnSelect) {
      setOpen(false)
    }

    // Clear search after selection
    setSearchValue("")
    setHasSearched(false)
  }, [isControlled, onValueChange, closeOnSelect])

  // Handle selection
  const handleSelect = React.useCallback((selectedValue: string) => {
    const option = options.find(opt => opt.value === selectedValue)

    if (!isControlled) {
      setInternalValue(selectedValue)
    }

    onValueChange?.(selectedValue, option)

    // Save the selected option with the search query to history
    if (searchValue && option) {
      saveToHistory(searchValue, option)
    }

    if (closeOnSelect) {
      setOpen(false)
    }

    // Clear search after selection
    setSearchValue("")
    setHasSearched(false)
  }, [options, isControlled, onValueChange, closeOnSelect, searchValue, saveToHistory])

  // Handle clear
  const handleClear = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()

    if (!isControlled) {
      setInternalValue(undefined)
    }

    onValueChange?.(undefined, undefined)
    setSearchValue("")
    setOptions([])
    setHasSearched(false)
  }, [isControlled, onValueChange])

  // Handle open change
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    // If closing and allowCustomValue is true, accept the search value as a custom value
    if (!newOpen && allowCustomValue && searchValue && !selectedOption) {
      // Set the custom value
      if (!isControlled) {
        setInternalValue(searchValue)
      }
      onValueChange?.(searchValue, undefined)
    }

    setOpen(newOpen)

    if (!newOpen) {
      // Clear search when closing
      setSearchValue("")
      // Optionally reset options
      if (!loadOnMount) {
        setOptions([])
        setHasSearched(false)
      }
    }
  }, [loadOnMount, allowCustomValue, searchValue, selectedOption, isControlled, onValueChange])

  // Determine empty message
  const getEmptyMessage = () => {
    if (!hasSearched && minSearchLength > 0) {
      return typeToSearchText
    }

    if (hasSearched && options.length === 0) {
      return searchValue ? noResultsText : emptyText
    }

    return emptyText
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={displayValue || placeholder}
          disabled={disabled}
          className={cn("w-full justify-between", buttonClassName, className)}
        >
          <span className="truncate">
            {displayValue || placeholder}
          </span>
          <div className="ml-2 flex items-center gap-1 shrink-0">
            {clearable && (value || displayValue) && !disabled && (
              <X
                className="h-3 w-3 opacity-50 hover:opacity-100"
                onClick={handleClear}
                aria-label="Clear selection"
              />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("p-0 z-[1100]", popoverClassName)}
        align="start"
        sideOffset={4}
        style={{
          width: "var(--radix-popover-trigger-width)",
          zIndex: 1100
        }}
      >
        <Command shouldFilter={false}>
          <div className="relative">
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={handleSearchChange}
            />
            {isLoading && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <CommandList>
            {isLoading ? (
              // Show nothing while loading - the spinner is in the input
              null
            ) : (
              <>
                {/* Show recent selections when no search is active */}
                {enableHistory && !searchValue && !hasSearched && searchHistory.length > 0 && (
                  <>
                    <CommandGroup heading={recentSearchesLabel}>
                      {searchHistory.map((historyItem, index) => (
                        <CommandItem
                          key={`history-${index}-${historyItem.option.value}`}
                          value={`history-${historyItem.option.value}`}
                          onSelect={() => handleHistorySelect(historyItem)}
                        >
                          <Clock className="mr-2 h-4 w-4 opacity-50" />
                          <div className="flex-1">
                            <div>{historyItem.option.label}</div>
                            {historyItem.query && (
                              <div className="text-xs text-muted-foreground">
                                Searched: "{historyItem.query}"
                              </div>
                            )}
                          </div>
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4",
                              value === historyItem.option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {(minSearchLength > 0 || options.length > 0) && <CommandSeparator />}
                  </>
                )}

                {/* Show search results or empty state */}
                {((!hasSearched && minSearchLength > 0) || (hasSearched && options.length === 0)) ? (
                  <CommandEmpty>{getEmptyMessage()}</CommandEmpty>
                ) : options.length > 0 ? (
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={handleSelect}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === option.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}