import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Icon, IconProvider, useIcon, Spinner } from '../Icon'

describe('Icon Component', () => {
  describe('Basic rendering', () => {
    it('should render an icon correctly', () => {
      render(<Icon name="search" />)
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('stroke', 'currentColor')
    })

    it('should apply size classes', () => {
      const { rerender } = render(<Icon name="settings" size="xs" />)
      let svg = document.querySelector('svg')
      expect(svg).toHaveClass('h-3', 'w-3')

      rerender(<Icon name="settings" size="lg" />)
      svg = document.querySelector('svg')
      expect(svg).toHaveClass('h-6', 'w-6')
    })

    it('should apply custom className', () => {
      render(<Icon name="download" className="text-blue-500" />)
      const svg = document.querySelector('svg')
      expect(svg).toHaveClass('text-blue-500')
    })

    it('should forward ref', () => {
      const ref = React.createRef<SVGSVGElement>()
      render(<Icon name="columns" ref={ref} />)
      expect(ref.current).toBeInstanceOf(SVGSVGElement)
    })

    it('should handle multi-path icons', () => {
      render(<Icon name="settings" />)
      const paths = document.querySelectorAll('path')
      expect(paths.length).toBeGreaterThan(1)
    })

    it('should warn for unknown icon name', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      render(<Icon name={'unknown' as any} />)
      expect(consoleSpy).toHaveBeenCalledWith('Icon "unknown" not found')
      consoleSpy.mockRestore()
    })

    it('should return null for unknown icon', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { container } = render(<Icon name={'unknown' as any} />)
      expect(container.firstChild).toBeNull()
      consoleSpy.mockRestore()
    })
  })

  describe('IconProvider', () => {
    it('should provide custom icons', () => {
      const CustomIcon = () => <div data-testid="custom-icon">Custom</div>

      const TestComponent = () => {
        const icon = useIcon('search')
        return <>{icon}</>
      }

      const { rerender } = render(
        <IconProvider icons={{ search: <CustomIcon /> }}>
          <TestComponent />
        </IconProvider>
      )

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()

      // Test without provider
      rerender(<TestComponent />)
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should fall back to default icons when custom not provided', () => {
      const TestComponent = () => {
        const icon = useIcon('download')
        return <>{icon}</>
      }

      render(
        <IconProvider icons={{ search: <div>Custom</div> }}>
          <TestComponent />
        </IconProvider>
      )

      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Spinner', () => {
    it('should render with animation class', () => {
      render(<Spinner />)
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('animate-spin')
    })

    it('should apply custom className to spinner', () => {
      render(<Spinner className="text-red-500" />)
      const svg = document.querySelector('svg')
      expect(svg).toHaveClass('animate-spin', 'text-red-500')
    })

    it('should apply size to spinner', () => {
      render(<Spinner size="lg" />)
      const svg = document.querySelector('svg')
      expect(svg).toHaveClass('h-6', 'w-6')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-hidden attribute', () => {
      render(<Icon name="search" />)
      const svg = document.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })

    it('should accept custom aria attributes', () => {
      render(<Icon name="search" aria-label="Search icon" aria-hidden="false" />)
      const svg = document.querySelector('svg')
      expect(svg).toHaveAttribute('aria-label', 'Search icon')
      expect(svg).toHaveAttribute('aria-hidden', 'false')
    })
  })
})