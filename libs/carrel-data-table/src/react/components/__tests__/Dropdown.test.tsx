import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dropdown, type DropdownItem } from '../Dropdown'

describe('Dropdown Component', () => {
  const mockItems: DropdownItem[] = [
    { label: 'Option 1', onClick: vi.fn() },
    { label: 'Option 2', onClick: vi.fn() },
    { separator: true },
    { label: 'Option 3', onClick: vi.fn(), disabled: true },
    { label: 'Checkbox Option', checkbox: true, checked: true, onClick: vi.fn() },
  ]

  beforeEach(() => {
    mockItems.forEach(item => {
      if (item.onClick) {
        vi.clearAllMocks()
      }
    })
  })

  describe('Basic functionality', () => {
    it('should render trigger element', () => {
      render(<Dropdown trigger={<button>Open Menu</button>} items={mockItems} />)
      expect(screen.getByText('Open Menu')).toBeInTheDocument()
    })

    it('should open dropdown on trigger click', () => {
      render(<Dropdown trigger={<button>Open Menu</button>} items={mockItems} />)

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()

      fireEvent.click(screen.getByText('Open Menu'))
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('should close dropdown on item click', async () => {
      render(<Dropdown trigger={<button>Open Menu</button>} items={mockItems} />)

      fireEvent.click(screen.getByText('Open Menu'))
      fireEvent.click(screen.getByText('Option 1'))

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
      expect(mockItems[0].onClick).toHaveBeenCalled()
    })

    it('should not close on checkbox item click', () => {
      render(<Dropdown trigger={<button>Open Menu</button>} items={mockItems} />)

      fireEvent.click(screen.getByText('Open Menu'))
      fireEvent.click(screen.getByText('Checkbox Option'))

      expect(screen.getByRole('menu')).toBeInTheDocument()
      expect(mockItems[4].onClick).toHaveBeenCalled()
    })

    it('should not trigger onClick for disabled items', () => {
      render(<Dropdown trigger={<button>Open Menu</button>} items={mockItems} />)

      fireEvent.click(screen.getByText('Open Menu'))
      fireEvent.click(screen.getByText('Option 3'))

      expect(mockItems[3].onClick).not.toHaveBeenCalled()
    })

    it('should render separator', () => {
      render(<Dropdown trigger={<button>Open Menu</button>} items={mockItems} />)

      fireEvent.click(screen.getByText('Open Menu'))
      const separator = document.querySelector('[role="separator"]')
      expect(separator).toBeInTheDocument()
    })

    it('should close on click outside', async () => {
      render(
        <div>
          <Dropdown trigger={<button>Open Menu</button>} items={mockItems} />
          <div data-testid="outside">Outside</div>
        </div>
      )

      fireEvent.click(screen.getByText('Open Menu'))
      expect(screen.getByRole('menu')).toBeInTheDocument()

      fireEvent.mouseDown(screen.getByTestId('outside'))

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })
  })

  describe('Keyboard navigation', () => {
    it('should open on Enter key', () => {
      render(<Dropdown trigger={<button>Open Menu</button>} items={mockItems} />)

      const trigger = screen.getByText('Open Menu').parentElement!
      trigger.focus()
      fireEvent.keyDown(trigger, { key: 'Enter' })

      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('should open on Space key', () => {
      render(<Dropdown trigger={<button>Open Menu</button>} items={mockItems} />)

      const trigger = screen.getByText('Open Menu').parentElement!
      trigger.focus()
      fireEvent.keyDown(trigger, { key: ' ' })

      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('should close on Escape key', async () => {
      render(<Dropdown trigger={<button>Open Menu</button>} items={mockItems} />)

      fireEvent.click(screen.getByText('Open Menu'))
      const menu = screen.getByRole('menu')

      fireEvent.keyDown(menu, { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })

    it('should navigate with arrow keys', () => {
      render(<Dropdown trigger={<button>Open Menu</button>} items={mockItems} />)

      fireEvent.click(screen.getByText('Open Menu'))
      const menu = screen.getByRole('menu')

      // Arrow down should focus first enabled item
      fireEvent.keyDown(menu, { key: 'ArrowDown' })
      expect(screen.getByText('Option 1').parentElement).toHaveClass('bg-accent')

      // Arrow down again should focus next item
      fireEvent.keyDown(menu, { key: 'ArrowDown' })
      expect(screen.getByText('Option 2').parentElement).toHaveClass('bg-accent')

      // Should skip disabled item
      fireEvent.keyDown(menu, { key: 'ArrowDown' })
      expect(screen.getByText('Checkbox Option').parentElement).toHaveClass('bg-accent')

      // Arrow up should go back
      fireEvent.keyDown(menu, { key: 'ArrowUp' })
      expect(screen.getByText('Option 2').parentElement).toHaveClass('bg-accent')
    })

    it('should activate item on Enter key', async () => {
      render(<Dropdown trigger={<button>Open Menu</button>} items={mockItems} />)

      fireEvent.click(screen.getByText('Open Menu'))
      const menu = screen.getByRole('menu')

      fireEvent.keyDown(menu, { key: 'ArrowDown' })
      fireEvent.keyDown(menu, { key: 'Enter' })

      expect(mockItems[0].onClick).toHaveBeenCalled()
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })

    it('should jump to first item with Home key', () => {
      render(<Dropdown trigger={<button>Open Menu</button>} items={mockItems} />)

      fireEvent.click(screen.getByText('Open Menu'))
      const menu = screen.getByRole('menu')

      // Navigate to middle
      fireEvent.keyDown(menu, { key: 'ArrowDown' })
      fireEvent.keyDown(menu, { key: 'ArrowDown' })

      // Home should go to first
      fireEvent.keyDown(menu, { key: 'Home' })
      expect(screen.getByText('Option 1').parentElement).toHaveClass('bg-accent')
    })

    it('should jump to last item with End key', () => {
      render(<Dropdown trigger={<button>Open Menu</button>} items={mockItems} />)

      fireEvent.click(screen.getByText('Open Menu'))
      const menu = screen.getByRole('menu')

      fireEvent.keyDown(menu, { key: 'End' })
      expect(screen.getByText('Checkbox Option').parentElement).toHaveClass('bg-accent')
    })
  })

  describe('Controlled mode', () => {
    it('should work in controlled mode', () => {
      const onOpenChange = vi.fn()
      const { rerender } = render(
        <Dropdown
          trigger={<button>Open Menu</button>}
          items={mockItems}
          open={false}
          onOpenChange={onOpenChange}
        />
      )

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()

      fireEvent.click(screen.getByText('Open Menu'))
      expect(onOpenChange).toHaveBeenCalledWith(true)

      rerender(
        <Dropdown
          trigger={<button>Open Menu</button>}
          items={mockItems}
          open={true}
          onOpenChange={onOpenChange}
        />
      )

      expect(screen.getByRole('menu')).toBeInTheDocument()
    })
  })

  describe('Alignment', () => {
    it('should apply alignment classes', () => {
      const { rerender } = render(
        <Dropdown
          trigger={<button>Open Menu</button>}
          items={mockItems}
          align="start"
        />
      )

      fireEvent.click(screen.getByText('Open Menu'))
      let menu = screen.getByRole('menu')
      expect(menu).toHaveClass('left-0')

      rerender(
        <Dropdown
          trigger={<button>Open Menu</button>}
          items={mockItems}
          align="end"
        />
      )

      menu = screen.getByRole('menu')
      expect(menu).toHaveClass('right-0')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Dropdown trigger={<button>Open Menu</button>} items={mockItems} />)

      const trigger = screen.getByText('Open Menu').parentElement!
      expect(trigger).toHaveAttribute('role', 'button')
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      const menu = screen.getByRole('menu')
      expect(menu).toBeInTheDocument()

      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems).toHaveLength(4) // Excluding separator
    })

    it('should mark disabled items with aria-disabled', () => {
      render(<Dropdown trigger={<button>Open Menu</button>} items={mockItems} />)

      fireEvent.click(screen.getByText('Open Menu'))
      const disabledItem = screen.getByText('Option 3').parentElement!
      expect(disabledItem).toHaveAttribute('aria-disabled', 'true')
    })
  })
})