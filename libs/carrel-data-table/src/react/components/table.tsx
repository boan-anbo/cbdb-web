import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"

const tableVariants = cva(
  "w-full caption-bottom text-sm",
  {
    variants: {
      density: {
        compact: "[&_th]:p-[var(--dt-cell-padding-compact)] [&_td]:p-[var(--dt-cell-padding-compact)] text-xs",
        normal: "[&_th]:p-[var(--dt-cell-padding-normal)] [&_td]:p-[var(--dt-cell-padding-normal)]",
        comfortable: "[&_th]:p-[var(--dt-cell-padding-comfortable)] [&_td]:p-[var(--dt-cell-padding-comfortable)]"
      },
      variant: {
        default: "",
        bordered: "border rounded-lg",
        striped: "[&_tbody_tr:nth-child(even)]:bg-muted/50"
      }
    },
    defaultVariants: {
      density: "normal",
      variant: "default"
    }
  }
)

interface TableProps extends
  React.HTMLAttributes<HTMLTableElement>,
  VariantProps<typeof tableVariants> {
  ref?: React.Ref<HTMLTableElement>
}

// React 19: ref is just a prop!
export function Table({
  className,
  density,
  variant,
  ref,
  ...props
}: TableProps) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn(tableVariants({ density, variant }), className)}
        {...props}
      />
    </div>
  )
}

export function TableHeader({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.Ref<HTMLTableSectionElement>
}) {
  return (
    <thead
      ref={ref}
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

export function TableBody({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.Ref<HTMLTableSectionElement>
}) {
  return (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

export function TableRow({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
  ref?: React.Ref<HTMLTableRowElement>
}) {
  return (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors",
        "hover:bg-[hsl(var(--dt-row-hover))]",
        "data-[state=selected]:bg-[hsl(var(--dt-row-selected))]",
        "data-[state=selected]:hover:bg-[hsl(var(--dt-row-selected-hover))]",
        className
      )}
      {...props}
    />
  )
}

export function TableHead({
  className,
  ref,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & {
  ref?: React.Ref<HTMLTableCellElement>
}) {
  return (
    <th
      ref={ref}
      className={cn(
        "text-left align-middle font-medium text-muted-foreground",
        "[&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

export function TableCell({
  className,
  ref,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & {
  ref?: React.Ref<HTMLTableCellElement>
}) {
  return (
    <td
      ref={ref}
      className={cn(
        "align-middle",
        "[&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

export function TableCaption({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement> & {
  ref?: React.Ref<HTMLTableCaptionElement>
}) {
  return (
    <caption
      ref={ref}
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export function TableFooter({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.Ref<HTMLTableSectionElement>
}) {
  return (
    <tfoot
      ref={ref}
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}