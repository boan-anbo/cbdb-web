import type { Meta, StoryObj } from '@storybook/react'
import { Dropdown, type DropdownItem } from './Dropdown'
import { Icon } from './Icon'

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible dropdown menu with keyboard navigation and accessibility support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    align: {
      control: 'radio',
      options: ['start', 'center', 'end'],
      description: 'Alignment of the dropdown relative to the trigger',
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state',
    },
  },
}

export default meta
type Story = StoryObj<typeof Dropdown>

const defaultItems: DropdownItem[] = [
  { label: 'Profile', onClick: () => console.log('Profile clicked') },
  { label: 'Settings', onClick: () => console.log('Settings clicked') },
  { separator: true },
  { label: 'Logout', onClick: () => console.log('Logout clicked') },
]

export const Default: Story = {
  args: {
    trigger: <button className="px-4 py-2 bg-blue-500 text-white rounded">Menu</button>,
    items: defaultItems,
    align: 'start',
  },
}

export const WithIcons: Story = {
  args: {
    trigger: <button className="px-4 py-2 bg-gray-800 text-white rounded">Actions</button>,
    items: [
      {
        label: 'Edit',
        icon: <Icon name="settings" size="sm" />,
        onClick: () => console.log('Edit')
      },
      {
        label: 'Download',
        icon: <Icon name="download" size="sm" />,
        onClick: () => console.log('Download')
      },
      { separator: true },
      {
        label: 'Delete',
        icon: <Icon name="x" size="sm" />,
        onClick: () => console.log('Delete'),
        disabled: true
      },
    ],
  },
}

export const WithCheckboxes: Story = {
  render: () => {
    const [checkedItems, setCheckedItems] = React.useState({
      option1: true,
      option2: false,
      option3: true,
    })

    const items: DropdownItem[] = [
      {
        label: 'Option 1',
        checkbox: true,
        checked: checkedItems.option1,
        onClick: () => setCheckedItems(prev => ({ ...prev, option1: !prev.option1 })),
      },
      {
        label: 'Option 2',
        checkbox: true,
        checked: checkedItems.option2,
        onClick: () => setCheckedItems(prev => ({ ...prev, option2: !prev.option2 })),
      },
      {
        label: 'Option 3',
        checkbox: true,
        checked: checkedItems.option3,
        onClick: () => setCheckedItems(prev => ({ ...prev, option3: !prev.option3 })),
      },
    ]

    return (
      <Dropdown
        trigger={<button className="px-4 py-2 border rounded">Select Options</button>}
        items={items}
      />
    )
  },
}

export const Alignments: Story = {
  render: () => (
    <div className="flex gap-8">
      <Dropdown
        trigger={<button className="px-4 py-2 bg-gray-200 rounded">Start</button>}
        items={defaultItems}
        align="start"
      />
      <Dropdown
        trigger={<button className="px-4 py-2 bg-gray-200 rounded">Center</button>}
        items={defaultItems}
        align="center"
      />
      <Dropdown
        trigger={<button className="px-4 py-2 bg-gray-200 rounded">End</button>}
        items={defaultItems}
        align="end"
      />
    </div>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setOpen(!open)}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            {open ? 'Close' : 'Open'} Dropdown
          </button>
        </div>
        <Dropdown
          trigger={
            <button className="px-4 py-2 bg-blue-500 text-white rounded">
              Controlled Menu
            </button>
          }
          items={defaultItems}
          open={open}
          onOpenChange={setOpen}
        />
      </div>
    )
  },
}

export const ComplexMenu: Story = {
  args: {
    trigger: (
      <button className="px-4 py-2 bg-indigo-600 text-white rounded flex items-center gap-2">
        <Icon name="settings" size="sm" />
        Options
      </button>
    ),
    items: [
      { label: 'View Details', onClick: () => console.log('View') },
      { label: 'Edit Item', onClick: () => console.log('Edit') },
      { separator: true },
      {
        label: 'Share',
        icon: <Icon name="arrowUpDown" size="sm" />,
        onClick: () => console.log('Share')
      },
      {
        label: 'Download',
        icon: <Icon name="download" size="sm" />,
        onClick: () => console.log('Download')
      },
      { separator: true },
      {
        label: 'Archive',
        onClick: () => console.log('Archive'),
        disabled: false
      },
      {
        label: 'Delete',
        icon: <Icon name="x" size="sm" />,
        onClick: () => console.log('Delete'),
        disabled: true
      },
    ],
  },
}

export const CustomTrigger: Story = {
  render: () => (
    <div className="flex gap-4">
      <Dropdown
        trigger={
          <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
            <Icon name="settings" size="md" />
          </div>
        }
        items={defaultItems}
      />

      <Dropdown
        trigger={
          <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
            Gradient Button
          </div>
        }
        items={defaultItems}
      />

      <Dropdown
        trigger={
          <div className="flex items-center gap-2 px-4 py-2 border rounded">
            <span>User Menu</span>
            <Icon name="chevronDown" size="sm" />
          </div>
        }
        items={defaultItems}
      />
    </div>
  ),
}