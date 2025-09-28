import type { Meta, StoryObj } from '@storybook/react'
import { Icon, IconProvider, Spinner } from './Icon'

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible icon component with built-in icon set and customization support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: [
        'search', 'settings', 'download', 'columns',
        'chevronLeft', 'chevronRight', 'chevronDown', 'chevronUp',
        'chevronsLeft', 'chevronsRight', 'arrowUpDown',
        'check', 'x', 'filter', 'loader'
      ],
      description: 'The name of the icon to display',
    },
    size: {
      control: 'radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'The size of the icon',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
}

export default meta
type Story = StoryObj<typeof Icon>

export const Default: Story = {
  args: {
    name: 'search',
    size: 'md',
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="settings" size="xs" />
      <Icon name="settings" size="sm" />
      <Icon name="settings" size="md" />
      <Icon name="settings" size="lg" />
      <Icon name="settings" size="xl" />
    </div>
  ),
}

export const AllIcons: Story = {
  render: () => {
    const icons = [
      'search', 'settings', 'download', 'columns',
      'chevronLeft', 'chevronRight', 'chevronDown', 'chevronUp',
      'chevronsLeft', 'chevronsRight', 'arrowUpDown',
      'check', 'x', 'filter', 'loader'
    ] as const

    return (
      <div className="grid grid-cols-4 gap-4">
        {icons.map(name => (
          <div key={name} className="flex flex-col items-center gap-2 p-4 border rounded">
            <Icon name={name} size="md" />
            <span className="text-xs text-gray-600">{name}</span>
          </div>
        ))}
      </div>
    )
  },
}

export const WithColors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="check" className="text-green-500" />
      <Icon name="x" className="text-red-500" />
      <Icon name="settings" className="text-blue-500" />
      <Icon name="download" className="text-purple-500" />
    </div>
  ),
}

export const SpinnerVariant: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size="sm" />
      <Spinner size="md" className="text-blue-500" />
      <Spinner size="lg" className="text-purple-500" />
    </div>
  ),
}

export const CustomIconProvider: Story = {
  render: () => {
    const CustomSearchIcon = () => (
      <svg
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
          clipRule="evenodd"
        />
      </svg>
    )

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Default Icons:</h3>
          <div className="flex gap-2">
            <Icon name="search" />
            <Icon name="settings" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">With Custom Provider:</h3>
          <IconProvider icons={{ search: <CustomSearchIcon /> }}>
            <div className="flex gap-2">
              <Icon name="search" />
              <Icon name="settings" />
            </div>
          </IconProvider>
        </div>
      </div>
    )
  },
}

export const Interactive: Story = {
  render: () => {
    const [liked, setLiked] = React.useState(false)

    return (
      <button
        onClick={() => setLiked(!liked)}
        className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
      >
        <Icon
          name={liked ? 'check' : 'x'}
          className={liked ? 'text-green-500' : 'text-gray-400'}
          size="md"
        />
      </button>
    )
  },
}