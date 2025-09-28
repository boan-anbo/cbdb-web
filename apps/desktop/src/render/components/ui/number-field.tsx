"use client"

import * as React from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/render/lib/utils"
import { Button } from "@/render/components/ui/button"
import { Input } from "@/render/components/ui/input"

interface NumberFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value?: number
  onChange?: (value: number | undefined) => void
  min?: number
  max?: number
  step?: number
  showButtons?: boolean
  allowScroll?: boolean
  className?: string
}

export function NumberField({
  value,
  onChange,
  min,
  max,
  step = 1,
  showButtons = true,
  allowScroll = true,
  className,
  disabled,
  ...props
}: NumberFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [internalValue, setInternalValue] = React.useState<string>(value?.toString() || '')

  React.useEffect(() => {
    setInternalValue(value?.toString() || '')
  }, [value])

  const updateValue = (newValue: number | undefined) => {
    if (newValue !== undefined) {
      if (min !== undefined && newValue < min) newValue = min
      if (max !== undefined && newValue > max) newValue = max
    }
    setInternalValue(newValue?.toString() || '')
    onChange?.(newValue)
  }

  const increment = () => {
    const currentValue = parseFloat(internalValue) || 0
    updateValue(currentValue + step)
  }

  const decrement = () => {
    const currentValue = parseFloat(internalValue) || 0
    updateValue(currentValue - step)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    setInternalValue(rawValue)

    if (rawValue === '') {
      onChange?.(undefined)
    } else {
      const numValue = parseFloat(rawValue)
      if (!isNaN(numValue)) {
        onChange?.(numValue)
      }
    }
  }

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    if (!allowScroll || disabled) return

    e.preventDefault()
    if (e.deltaY < 0) {
      increment()
    } else {
      decrement()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      increment()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      decrement()
    }
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={internalValue}
        onChange={handleInputChange}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          showButtons && "pr-8",
          className
        )}
        {...props}
      />
      {showButtons && (
        <div className="absolute right-0 flex flex-col h-full">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-1/2 w-8 rounded-none rounded-tr-md p-0"
            onClick={increment}
            disabled={disabled || (max !== undefined && parseFloat(internalValue) >= max)}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-1/2 w-8 rounded-none rounded-br-md border-t p-0"
            onClick={decrement}
            disabled={disabled || (min !== undefined && parseFloat(internalValue) <= min)}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}