import * as React from 'react'
import { cn } from '../lib/utils'
import { Icon } from './Icon'

/**
 * Dropdown menu item
 */
export interface DropdownItem {
  label: React.ReactNode
  value?: string
  onClick?: () => void
  disabled?: boolean
  separator?: boolean
  checkbox?: boolean
  checked?: boolean
  icon?: React.ReactNode
}

/**
 * Dropdown props
 */
export interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'start' | 'center' | 'end'
  className?: string
  contentClassName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * Dropdown component with keyboard navigation
 */
export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      trigger,
      items,
      align = 'start',
      className,
      contentClassName,
      open: controlledOpen,
      onOpenChange,
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const [focusedIndex, setFocusedIndex] = React.useState(-1)
    const triggerRef = React.useRef<HTMLDivElement>(null)
    const contentRef = React.useRef<HTMLDivElement>(null)

    // Use controlled or internal state
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = (value: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(value)
      }
      onOpenChange?.(value)
    }

    // Handle click outside
    React.useEffect(() => {
      if (!open) return

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node
        if (
          !triggerRef.current?.contains(target) &&
          !contentRef.current?.contains(target)
        ) {
          setOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    // Handle keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (!open) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setOpen(true)
          setFocusedIndex(0)
        }
        return
      }

      const enabledItems = items.filter(item => !item.separator && !item.disabled)
      const enabledIndexes = items
        .map((item, index) => (!item.separator && !item.disabled ? index : null))
        .filter((index): index is number => index !== null)

      switch (event.key) {
        case 'Escape':
          setOpen(false)
          setFocusedIndex(-1)
          triggerRef.current?.focus()
          break

        case 'ArrowDown':
          event.preventDefault()
          if (focusedIndex === -1) {
            setFocusedIndex(enabledIndexes[0] || 0)
          } else {
            const currentEnabledIndex = enabledIndexes.indexOf(focusedIndex)
            const nextIndex = enabledIndexes[
              (currentEnabledIndex + 1) % enabledIndexes.length
            ]
            setFocusedIndex(nextIndex)
          }
          break

        case 'ArrowUp':
          event.preventDefault()
          if (focusedIndex === -1) {
            setFocusedIndex(enabledIndexes[enabledIndexes.length - 1] || 0)
          } else {
            const currentEnabledIndex = enabledIndexes.indexOf(focusedIndex)
            const prevIndex = enabledIndexes[
              (currentEnabledIndex - 1 + enabledIndexes.length) % enabledIndexes.length
            ]
            setFocusedIndex(prevIndex)
          }
          break

        case 'Enter':
        case ' ':
          event.preventDefault()
          if (focusedIndex >= 0 && items[focusedIndex]) {
            const item = items[focusedIndex]
            if (!item.disabled && !item.separator) {
              item.onClick?.()
              if (!item.checkbox) {
                setOpen(false)
                setFocusedIndex(-1)
              }
            }
          }
          break

        case 'Home':
          event.preventDefault()
          setFocusedIndex(enabledIndexes[0] || 0)
          break

        case 'End':
          event.preventDefault()
          setFocusedIndex(enabledIndexes[enabledIndexes.length - 1] || 0)
          break
      }
    }

    // Alignment classes
    const alignmentClasses = {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    }

    return (
      <div ref={ref} className={cn('relative inline-block', className)}>
        <div
          ref={triggerRef}
          onClick={() => setOpen(!open)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {trigger}
        </div>

        {open && (
          <div
            ref={contentRef}
            className={cn(
              'absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
              alignmentClasses[align],
              contentClassName
            )}
            role="menu"
            onKeyDown={handleKeyDown}
          >
            {items.map((item, index) => {
              if (item.separator) {
                return (
                  <div
                    key={`separator-${index}`}
                    className="my-1 h-px bg-muted"
                    role="separator"
                  />
                )
              }

              const isFocused = focusedIndex === index

              return (
                <div
                  key={`item-${index}`}
                  className={cn(
                    'flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
                    item.disabled && 'pointer-events-none opacity-50',
                    isFocused && 'bg-accent text-accent-foreground',
                    !item.disabled && !isFocused && 'hover:bg-accent hover:text-accent-foreground'
                  )}
                  role="menuitem"
                  aria-disabled={item.disabled}
                  tabIndex={item.disabled ? -1 : 0}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick?.()
                      if (!item.checkbox) {
                        setOpen(false)
                        setFocusedIndex(-1)
                      }
                    }
                  }}
                  onMouseEnter={() => !item.disabled && setFocusedIndex(index)}
                >
                  {item.checkbox && (
                    <div className="mr-2">
                      {item.checked ? (
                        <Icon name="check" size="xs" />
                      ) : (
                        <div className="h-3 w-3" />
                      )}
                    </div>
                  )}
                  {item.icon && <div className="mr-2">{item.icon}</div>}
                  {item.label}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
)

Dropdown.displayName = 'Dropdown'