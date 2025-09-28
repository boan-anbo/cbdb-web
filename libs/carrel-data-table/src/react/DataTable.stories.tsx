import type { Meta, StoryObj } from '@storybook/react'
import { DataTable } from './DataTable'
import { createMockColumns, createMockDataSource, mockUsers } from './test-utils'
import type { ColumnDef } from '@tanstack/react-table'
import { Icon } from './components/Icon'

const meta: Meta<typeof DataTable> = {
  title: 'DataTable/Main',
  component: DataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A powerful, flexible data table component built on TanStack Table with shadcn/ui patterns.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    density: {
      control: 'radio',
      options: ['compact', 'normal', 'comfortable'],
      description: 'Table density',
    },
    variant: {
      control: 'radio',
      options: ['default', 'bordered', 'striped'],
      description: 'Table variant',
    },
    enableSorting: {
      control: 'boolean',
      description: 'Enable column sorting',
    },
    enableFiltering: {
      control: 'boolean',
      description: 'Enable column filtering',
    },
    enablePagination: {
      control: 'boolean',
      description: 'Enable pagination',
    },
    enableRowSelection: {
      control: 'boolean',
      description: 'Enable row selection',
    },
    selectionMode: {
      control: 'radio',
      options: ['none', 'single', 'multi'],
      description: 'Row selection mode',
    },
  },
}

export default meta
type Story = StoryObj<typeof DataTable>

export const Default: Story = {
  args: {
    columns: createMockColumns(),
    dataSource: createMockDataSource(),
  },
}

export const Compact: Story = {
  args: {
    columns: createMockColumns(),
    dataSource: createMockDataSource(),
    density: 'compact',
  },
}

export const Striped: Story = {
  args: {
    columns: createMockColumns(),
    dataSource: createMockDataSource(),
    variant: 'striped',
  },
}

export const Bordered: Story = {
  args: {
    columns: createMockColumns(),
    dataSource: createMockDataSource(),
    variant: 'bordered',
    density: 'comfortable',
  },
}

export const WithSelection: Story = {
  args: {
    columns: createMockColumns(),
    dataSource: createMockDataSource(),
    enableRowSelection: true,
    selectionMode: 'multi',
  },
}

export const NoFeatures: Story = {
  args: {
    columns: createMockColumns(),
    dataSource: createMockDataSource(),
    enableSorting: false,
    enableFiltering: false,
    enablePagination: false,
    enableColumnVisibility: false,
    enableExport: false,
  },
}

export const CustomColumns: Story = {
  args: {
    columns: [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(e.target.checked)}
          />
        ),
        size: 40,
      },
      {
        accessorKey: 'id',
        header: 'ID',
        size: 60,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting()}
          >
            Name
            <Icon name="arrowUpDown" size="xs" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('name')}</div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string
          const colors = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            pending: 'bg-yellow-100 text-yellow-800',
          }
          return (
            <span className={`px-2 py-1 rounded-full text-xs ${colors[status as keyof typeof colors]}`}>
              {status}
            </span>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <button
            onClick={() => console.log('Action for', row.original)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Icon name="settings" size="sm" />
          </button>
        ),
        size: 40,
      },
    ] as ColumnDef<any>[],
    dataSource: createMockDataSource(),
    enableRowSelection: true,
    selectionMode: 'multi',
  },
}

export const LoadingState: Story = {
  args: {
    columns: createMockColumns(),
    dataSource: createMockDataSource([], 2000), // 2 second delay
  },
}

export const EmptyState: Story = {
  args: {
    columns: createMockColumns(),
    dataSource: createMockDataSource([]),
    renderEmpty: () => (
      <div className="flex flex-col items-center justify-center p-12">
        <Icon name="columns" size="xl" className="text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No data available</h3>
        <p className="text-gray-500">Get started by adding your first item.</p>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Add Item
        </button>
      </div>
    ),
  },
}

export const CustomStyling: Story = {
  args: {
    columns: createMockColumns(),
    dataSource: createMockDataSource(),
    className: 'border-2 border-blue-500',
    containerClassName: 'bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl',
    density: 'comfortable',
    variant: 'striped',
  },
}

export const WithToolbar: Story = {
  args: {
    columns: createMockColumns(),
    dataSource: createMockDataSource(),
    renderToolbar: (table) => (
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-t-lg">
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
            Add New
          </button>
          <button className="px-3 py-1 bg-gray-200 rounded text-sm">
            Import
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search..."
            className="px-3 py-1 border rounded text-sm"
            value={table.getState().globalFilter ?? ''}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
          />
          <button className="px-3 py-1 bg-gray-200 rounded text-sm">
            Filters
          </button>
        </div>
      </div>
    ),
  },
}

export const ResponsiveTable: Story = {
  render: () => {
    const columns: ColumnDef<any>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.getValue('name')}</div>
            <div className="text-sm text-gray-500 md:hidden">
              {row.original.email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => row.getValue('email'),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue('role')}</span>
        ),
      },
    ]

    return (
      <div className="w-full max-w-4xl mx-auto">
        <DataTable
          columns={columns}
          dataSource={createMockDataSource()}
          className="[&_th:nth-child(2)]:hidden [&_td:nth-child(2)]:hidden md:[&_th:nth-child(2)]:table-cell md:[&_td:nth-child(2)]:table-cell"
        />
      </div>
    )
  },
}