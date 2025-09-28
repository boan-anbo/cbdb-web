import * as React from 'react'
import { cn } from '../lib/utils'

/**
 * Icon names available in the system
 */
export type IconName =
  | 'search'
  | 'settings'
  | 'download'
  | 'columns'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronDown'
  | 'chevronUp'
  | 'chevronsLeft'
  | 'chevronsRight'
  | 'arrowUpDown'
  | 'check'
  | 'x'
  | 'filter'
  | 'loader'

/**
 * Icon component props
 */
export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name: IconName
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

/**
 * Icon size mapping
 */
const sizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
}

/**
 * Icon paths registry
 */
const iconPaths: Record<IconName, string> = {
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
  columns: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  chevronLeft: 'M15 19l-7-7 7-7',
  chevronRight: 'M9 5l7 7-7 7',
  chevronDown: 'M19 9l-7 7-7-7',
  chevronUp: 'M5 15l7-7 7 7',
  chevronsLeft: 'M11 19l-7-7 7-7m8 14l-7-7 7-7',
  chevronsRight: 'M13 5l7 7-7 7M5 5l7 7-7 7',
  arrowUpDown: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4',
  check: 'M5 13l4 4L19 7',
  x: 'M6 18L18 6M6 6l12 12',
  filter: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
  loader: 'M12 2v4m0 12v4m8-10h-4M4 12h4m13.657-5.657l-2.828 2.828M7.172 7.172L4.343 4.343m0 13.314l2.829-2.829m9.656 2.829l2.829-2.829',
}

/**
 * Icon component with built-in icon set
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 'sm', className, ...props }, ref) => {
    const path = iconPaths[name]

    if (!path) {
      console.warn(`Icon "${name}" not found`)
      return null
    }

    // Special handling for multi-path icons
    const isMultiPath = path.includes(' M')

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        className={cn(sizeMap[size], className)}
        aria-hidden="true"
        {...props}
      >
        {isMultiPath ? (
          path.split(' M').map((d, i) => (
            <path
              key={i}
              strokeLinecap="round"
              strokeLinejoin="round"
              d={i === 0 ? d : `M${d}`}
            />
          ))
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        )}
      </svg>
    )
  }
)

Icon.displayName = 'Icon'

/**
 * Icon provider for custom icons
 */
export interface IconProviderProps {
  icons?: Partial<Record<IconName, React.ReactNode>>
  children: React.ReactNode
}

const IconContext = React.createContext<Partial<Record<IconName, React.ReactNode>>>({})

export function IconProvider({ icons = {}, children }: IconProviderProps) {
  return <IconContext.Provider value={icons}>{children}</IconContext.Provider>
}

/**
 * Hook to use custom icons
 */
export function useIcon(name: IconName): React.ReactNode {
  const customIcons = React.useContext(IconContext)
  return customIcons[name] || <Icon name={name} />
}

/**
 * Loading spinner icon
 */
export function Spinner({ className, ...props }: Omit<IconProps, 'name'>) {
  return (
    <Icon
      name="loader"
      className={cn('animate-spin', className)}
      {...props}
    />
  )
}