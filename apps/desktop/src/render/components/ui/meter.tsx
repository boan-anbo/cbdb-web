"use client"

import * as React from "react"
import { cn } from "@/render/lib/utils"

interface MeterProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  min?: number
  max?: number
  low?: number
  high?: number
  optimum?: number
  label?: string
  showValue?: boolean
  className?: string
}

export function Meter({
  value,
  min = 0,
  max = 100,
  low,
  high,
  optimum,
  label,
  showValue = false,
  className,
  ...props
}: MeterProps) {
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100)

  const getSegmentColor = () => {
    if (low !== undefined && high !== undefined) {
      if (value < low) {
        return optimum !== undefined && optimum < low ? "bg-green-500" : "bg-red-500"
      } else if (value > high) {
        return optimum !== undefined && optimum > high ? "bg-green-500" : "bg-red-500"
      } else {
        return optimum !== undefined && optimum >= low && optimum <= high
          ? "bg-green-500"
          : "bg-yellow-500"
      }
    }

    if (percentage < 30) return "bg-red-500"
    if (percentage < 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      {(label || showValue) && (
        <div className="flex justify-between text-sm mb-1">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && (
            <span className="font-medium">
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div
        className="relative h-4 w-full overflow-hidden rounded-full bg-secondary"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={cn(
            "h-full transition-all duration-300",
            getSegmentColor()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface MeterSegmentedProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  segments: number
  min?: number
  max?: number
  label?: string
  showValue?: boolean
  filledColor?: string
  emptyColor?: string
  className?: string
}

export function MeterSegmented({
  value,
  segments,
  min = 0,
  max = 100,
  label,
  showValue = false,
  filledColor = "bg-primary",
  emptyColor = "bg-secondary",
  className,
  ...props
}: MeterSegmentedProps) {
  const normalizedValue = Math.min(Math.max(value, min), max)
  const valuePerSegment = (max - min) / segments
  const filledSegments = Math.floor((normalizedValue - min) / valuePerSegment)
  const partialFill = ((normalizedValue - min) % valuePerSegment) / valuePerSegment

  return (
    <div className={cn("w-full", className)} {...props}>
      {(label || showValue) && (
        <div className="flex justify-between text-sm mb-1">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && (
            <span className="font-medium">
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div
        className="flex gap-1"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label}
      >
        {Array.from({ length: segments }).map((_, index) => {
          const isFilled = index < filledSegments
          const isPartial = index === filledSegments
          const fillPercentage = isPartial ? partialFill * 100 : isFilled ? 100 : 0

          return (
            <div
              key={index}
              className={cn(
                "relative h-4 flex-1 overflow-hidden rounded-sm",
                emptyColor
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-300",
                  filledColor
                )}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}