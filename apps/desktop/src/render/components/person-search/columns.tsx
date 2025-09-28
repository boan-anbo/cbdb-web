import { ColumnDef } from '@tanstack/react-table';
import { PersonModel } from '@cbdb/core';
import { Button } from '@/render/components/ui/button';
import { Checkbox } from '@/render/components/ui/checkbox';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/render/components/ui/dropdown-menu';

export const columns: ColumnDef<PersonModel>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'nameChn',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          Chinese Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue('nameChn') as string | null;
      return <div className="font-medium">{name || 'Unknown'}</div>;
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          Pinyin Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => row.getValue('name') || '-',
  },
  {
    accessorKey: 'surname',
    header: 'Surname',
    cell: ({ row }) => row.getValue('surname') || '-',
  },
  {
    accessorKey: 'surnameChn',
    header: 'Chinese Surname',
    cell: ({ row }) => row.getValue('surnameChn') || '-',
  },
  {
    accessorKey: 'mingzi',
    header: 'Mingzi',
    cell: ({ row }) => row.getValue('mingzi') || '-',
  },
  {
    id: 'dynasty',
    accessorFn: (row) => row.dynastyNameChn || row.dynastyName,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          Dynasty
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => row.getValue('dynasty') || '-',
  },
  {
    id: 'lifeYears',
    accessorFn: (row) => {
      if (row.birthYear && row.deathYear) {
        return `${row.birthYear}-${row.deathYear}`;
      } else if (row.birthYear) {
        return `Born ${row.birthYear}`;
      } else if (row.deathYear) {
        return `Died ${row.deathYear}`;
      }
      return null;
    },
    header: 'Life Years',
    cell: ({ row }) => row.getValue('lifeYears') || 'Unknown',
  },
  {
    accessorKey: 'female',
    header: 'Gender',
    cell: ({ row }) => {
      const female = row.getValue('female') as number;
      return female ? 'Female' : 'Male';
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'ethnicity',
    accessorFn: (row) => row.ethnicityNameChn || row.ethnicityName,
    header: 'Ethnicity',
    cell: ({ row }) => row.getValue('ethnicity') || '-',
  },
  {
    id: 'choronym',
    accessorFn: (row) => row.choronymNameChn || row.choronymName,
    header: 'Regional Identity',
    cell: ({ row }) => row.getValue('choronym') || '-',
  },
  {
    id: 'householdStatus',
    accessorFn: (row) => row.householdStatusNameChn || row.householdStatusName,
    header: 'Household Status',
    cell: ({ row }) => row.getValue('householdStatus') || '-',
  },
  {
    accessorKey: 'indexYear',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          Index Year
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const year = row.getValue('indexYear') as number | null;
      return year ? year.toString() : '-';
    },
  },
  {
    id: 'indexAddress',
    accessorFn: (row) => row.indexAddrNameChn || row.indexAddrName,
    header: 'Index Address',
    cell: ({ row }) => row.getValue('indexAddress') || '-',
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }) => {
      const notes = row.getValue('notes') as string | null;
      if (!notes) return '-';
      // Truncate long notes
      return (
        <div className="max-w-[200px] truncate" title={notes}>
          {notes}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const person = row.original;
      // @ts-ignore - we'll pass this through table meta
      const onViewDetails = table.options.meta?.onViewDetails;
      // @ts-ignore
      const onAddToSelector = table.options.meta?.onAddToSelector;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {onViewDetails && (
                <DropdownMenuItem onClick={() => onViewDetails(person)}>
                  View details
                </DropdownMenuItem>
              )}
              {onAddToSelector && (
                <DropdownMenuItem onClick={() => onAddToSelector(person)}>
                  Add to selector
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(person.id.toString())}
              >
                Copy person ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

// Create columns for single-select mode (no checkbox column)
export const singleSelectColumns = columns.filter(col => col.id !== 'select');