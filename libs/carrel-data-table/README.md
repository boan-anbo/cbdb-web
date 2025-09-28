# Carrel Data Table

A powerful, extensible data table library built on top of TanStack Table v8, designed for building sophisticated data-driven applications.

## Features

- 🎯 **Framework Agnostic Core** - Pure TypeScript logic that works anywhere
- ⚛️ **React Integration** - First-class React support with hooks and components
- 🎨 **UI Adapters** - Pluggable UI system (includes ShadCN adapter)
- 📊 **Advanced Features** - Sorting, filtering, pagination, selection, export
- 🔌 **Extensible Architecture** - Custom features, data sources, and UI adapters
- ⌨️ **Keyboard Navigation** - Full keyboard support with Vim mode
- 📱 **Responsive Views** - Table, card, list, and grid view modes
- 🚀 **Performance Optimized** - Virtual scrolling, memoization, lazy loading

## Packages

The library is organized as a monorepo with the following packages:

- `@carrel-data-table/core` - Core logic and types (framework agnostic)
- `@carrel-data-table/react` - React bindings and components
- `@carrel-data-table/datasources` - Data source implementations (HTTP, Mock, etc.)
- `@carrel-data-table/ui-shadcn` - ShadCN UI adapter

## Installation

```bash
npm install @carrel-data-table/core @carrel-data-table/react
# Optional packages
npm install @carrel-data-table/datasources
npm install @carrel-data-table/ui-shadcn
```

## Quick Start

```tsx
import { DataTable } from '@carrel-data-table/react';
import { MockDataSource } from '@carrel-data-table/datasources';
import { ShadcnAdapter } from '@carrel-data-table/ui-shadcn';

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
];

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

function App() {
  return (
    <DataTable
      columns={columns}
      dataSource={new MockDataSource(data)}
      uiAdapter={ShadcnAdapter}
      enableSorting
      enableFiltering
      enablePagination
    />
  );
}
```

## Advanced Usage

### Custom Features

Create custom TanStack Table features using the v8.14+ custom features API:

```ts
import { createCustomFeature } from '@carrel-data-table/core';

const myFeature = createCustomFeature({
  name: 'myFeature',
  // Feature implementation
});
```

### Custom Data Sources

Implement the DataSource interface for custom data fetching:

```ts
import { BaseDataSource } from '@carrel-data-table/core';

class MyDataSource extends BaseDataSource {
  async query(params) {
    // Custom data fetching logic
  }
}
```

### Custom UI Adapters

Create custom UI adapters for different component libraries:

```ts
import { UIAdapter } from '@carrel-data-table/core';

const MyUIAdapter: UIAdapter = {
  components: {
    Table: MyTable,
    TableHead: MyTableHead,
    // ... other components
  },
  icons: {
    Sort: MySortIcon,
    Filter: MyFilterIcon,
    // ... other icons
  },
};
```

## Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Type checking
npm run type-check
```

## License

MIT © CBDB Desktop Team