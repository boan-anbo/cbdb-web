/**
 * Example: Basic usage of Carrel Data Table
 * Demonstrates the shadcn/ui pattern without UIAdapter
 */

import React from 'react'
import { DataTable } from '@carrel-data-table/react'
import { createColumnHelper } from '@tanstack/react-table'
import type { DataSource } from '@carrel-data-table/core'

// Import the CSS variables for theming
import '@carrel-data-table/react/styles/data-table.css'

// Define your data type
interface User {
  id: number
  name: string
  email: string
  role: string
  department: string
  status: 'active' | 'inactive' | 'pending'
}

// Create columns using TanStack Table's column helper
const columnHelper = createColumnHelper<User>()

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('name', {
    header: ({ column }) => (
      <button
        className="flex items-center gap-2"
        onClick={() => column.toggleSorting()}
      >
        Name
        {column.getIsSorted() === 'asc' && '↑'}
        {column.getIsSorted() === 'desc' && '↓'}
      </button>
    ),
    cell: info => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: info => (
      <a href={`mailto:${info.getValue()}`} className="text-blue-600 hover:underline">
        {info.getValue()}
      </a>
    ),
  }),
  columnHelper.accessor('role', {
    header: 'Role',
  }),
  columnHelper.accessor('department', {
    header: 'Department',
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => {
      const status = info.getValue()
      const colors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        pending: 'bg-yellow-100 text-yellow-800',
      }
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${colors[status]}`}>
          {status}
        </span>
      )
    },
  }),
]

// Create a data source
const userDataSource: DataSource<User> = {
  fetch: async (query) => {
    // In real app, this would be an API call
    const mockData: User[] = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        department: 'IT',
        status: 'active',
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Developer',
        department: 'Engineering',
        status: 'active',
      },
      // ... more data
    ]

    return {
      data: mockData,
      totalCount: mockData.length,
    }
  },
}

export function BasicUsageExample() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Users Table</h1>

      {/* Basic usage with defaults */}
      <DataTable
        columns={columns}
        dataSource={userDataSource}
      />
    </div>
  )
}

export function CustomizedExample() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Customized Table</h1>

      {/* Customized with all features */}
      <DataTable
        columns={columns}
        dataSource={userDataSource}

        // Styling
        density="compact"
        variant="striped"
        className="shadow-lg"
        containerClassName="bg-gray-50 p-4 rounded-xl"

        // Features
        enableSorting={true}
        enableFiltering={true}
        enablePagination={true}
        enableRowSelection={true}
        enableColumnVisibility={true}
        enableExport={true}
        enableDensity={true}

        // Selection mode
        selectionMode="multi"

        // Event handlers
        onDataExport={(format) => {
          console.log(`Exporting as ${format}`)
        }}

        // Custom renderers
        renderEmpty={() => (
          <div className="flex flex-col items-center justify-center p-12">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-4 text-gray-600">No users found</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Add First User
            </button>
          </div>
        )}
      />
    </div>
  )
}

export function ThemedExample() {
  return (
    <>
      {/* Custom theme via CSS variables */}
      <style>{`
        :root {
          --muted: 220 40% 96%;
          --dt-row-hover: 220 40% 92%;
          --dt-cell-padding-normal: 0.75rem 1rem;
          --dt-radius: 0.75rem;
        }

        .dark {
          --dt-row-hover: 220 30% 20%;
        }
      `}</style>

      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Themed Table</h1>

        <DataTable
          columns={columns}
          dataSource={userDataSource}
          variant="bordered"
        />
      </div>
    </>
  )
}

// App-specific wrapper using CBDB data
export function CBDBTableExample() {
  // Import CBDB-specific wrapper from the app
  // This would be in apps/desktop/src/render/components/data-table/cbdb-data-table.tsx
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CBDB Persons Table</h1>

      {/*
        The CBDB-specific wrapper would handle:
        - CBDB data sources
        - CBDB-specific columns
        - CBDB-specific styling
      */}
    </div>
  )
}