"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X, Loader2 } from "lucide-react"
import { cn } from "@/render/lib/utils"
import { Button } from "@/render/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/render/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/render/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string | undefined) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  clearable?: boolean
  loading?: boolean
  loadingText?: string
  noResultsText?: string
  typeToSearchText?: string
  onSearch?: (value: string) => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  closeOnSelect?: boolean
}

export function Combobox({
  options,
  value: controlledValue,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  className,
  disabled = false,
  clearable = true,
  loading = false,
  loadingText = "Loading...",
  noResultsText = "No results found.",
  typeToSearchText = "Type to search...",
  onSearch,
  searchValue: controlledSearchValue,
  onSearchChange,
  closeOnSelect = true,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState<string | undefined>(undefined)
  const [internalSearchValue, setInternalSearchValue] = React.useState("")

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  // Use controlled or internal search value
  const searchValue = controlledSearchValue !== undefined ? controlledSearchValue : internalSearchValue
  const setSearchValue = React.useCallback((newValue: string) => {
    if (onSearchChange) {
      onSearchChange(newValue)
    } else {
      setInternalSearchValue(newValue)
    }
    // Trigger onSearch callback if provided
    onSearch?.(newValue)
  }, [onSearchChange, onSearch])

  // Find selected option
  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  )

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options

    const search = searchValue.toLowerCase()
    return options.filter((option) =>
      option.label.toLowerCase().includes(search) ||
      option.value.toLowerCase().includes(search)
    )
  }, [options, searchValue])

  // Handle selection
  const handleSelect = React.useCallback((selectedValue: string) => {
    // Don't toggle - just set the value
    const newValue = selectedValue

    // Update internal state for uncontrolled component
    if (!isControlled) {
      setInternalValue(newValue)
    }

    // Call onChange callback
    onValueChange?.(newValue)

    if (closeOnSelect) {
      setOpen(false)
    }

    // Clear search on selection
    setSearchValue("")
  }, [isControlled, onValueChange, closeOnSelect, setSearchValue])

  // Handle clear
  const handleClear = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()

    // Update internal state for uncontrolled component
    if (!isControlled) {
      setInternalValue(undefined)
    }

    onValueChange?.(undefined)
    setSearchValue("")
  }, [isControlled, onValueChange, setSearchValue])

  // Handle open change
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    setOpen(newOpen)
    // Clear search when closing
    if (!newOpen) {
      setSearchValue("")
    }
  }, [setSearchValue])

  // Determine what to show in CommandEmpty
  const getEmptyContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      )
    }

    if (searchValue && filteredOptions.length === 0) {
      return noResultsText
    }

    if (!searchValue && options.length === 0) {
      return typeToSearchText
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
          aria-label={selectedOption ? selectedOption.label : placeholder}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="ml-2 flex items-center gap-1 shrink-0">
            {clearable && selectedOption && !disabled && (
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
        className="p-0"
        align="start"
        sideOffset={4}
        style={{
          width: "var(--radix-popover-trigger-width)",
        }}
      >
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {(loading || filteredOptions.length === 0) ? (
              <CommandEmpty>{getEmptyContent()}</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => (
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
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}