import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/render/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/render/components/ui/dropdown-menu';

export type ColumnKey =
  | 'select'
  | 'nameChn'
  | 'name'
  | 'surname'
  | 'surnameChn'
  | 'mingzi'
  | 'dynasty'
  | 'years'
  | 'gender'
  | 'ethnicity'
  | 'choronym'
  | 'householdStatus'
  | 'indexYear'
  | 'indexAddress'
  | 'notes'
  | 'actions';

export interface ColumnConfig {
  key: ColumnKey;
  label: string;
  defaultVisible: boolean;
  alwaysVisible?: boolean; // For columns that can't be hidden
}

export const columnConfigs: ColumnConfig[] = [
  { key: 'select', label: 'Select', defaultVisible: true, alwaysVisible: true },
  { key: 'nameChn', label: 'Chinese Name', defaultVisible: true },
  { key: 'name', label: 'Pinyin Name', defaultVisible: true },
  { key: 'surname', label: 'Surname', defaultVisible: false },
  { key: 'surnameChn', label: 'Chinese Surname', defaultVisible: false },
  { key: 'mingzi', label: 'Mingzi', defaultVisible: false },
  { key: 'dynasty', label: 'Dynasty', defaultVisible: true },
  { key: 'years', label: 'Life Years', defaultVisible: true },
  { key: 'gender', label: 'Gender', defaultVisible: true },
  { key: 'ethnicity', label: 'Ethnicity', defaultVisible: false },
  { key: 'choronym', label: 'Regional Identity', defaultVisible: false },
  { key: 'householdStatus', label: 'Household Status', defaultVisible: false },
  { key: 'indexYear', label: 'Index Year', defaultVisible: false },
  { key: 'indexAddress', label: 'Index Address', defaultVisible: false },
  { key: 'notes', label: 'Notes', defaultVisible: false },
  { key: 'actions', label: 'Actions', defaultVisible: true, alwaysVisible: true },
];

interface ColumnVisibilityProps {
  visibleColumns: Set<ColumnKey>;
  onToggleColumn: (column: ColumnKey) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function ColumnVisibility({
  visibleColumns,
  onToggleColumn,
  onSelectAll,
  onDeselectAll,
}: ColumnVisibilityProps) {
  const toggleableColumns = columnConfigs.filter(col => !col.alwaysVisible);
  const visibleCount = toggleableColumns.filter(col => visibleColumns.has(col.key)).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1"
        >
          Columns
          <ChevronDown className="w-3.5 h-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>
          Toggle columns
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{visibleCount} of {toggleableColumns.length} visible</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={onSelectAll}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={onDeselectAll}
              >
                None
              </Button>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        {toggleableColumns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.key}
            checked={visibleColumns.has(column.key)}
            onCheckedChange={() => onToggleColumn(column.key)}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}