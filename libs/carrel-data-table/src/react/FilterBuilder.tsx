/**
 * Advanced Filter Builder Component
 * Visual interface for building complex filter queries
 *
 * Features:
 * - Nested filter groups with AND/OR logic
 * - Multiple filter operators per data type
 * - Visual query builder interface
 * - Import/export filter configurations
 * - Saved filter presets
 */

import React, { useState, useCallback, useMemo } from 'react';
import type {
  AdvancedFilter,
  FilterOperator,
  Column,
  UIAdapter,
} from '@carrel-data-table/core';

/**
 * Filter builder props
 */
export interface FilterBuilderProps {
  columns: Column<any>[];
  filters: AdvancedFilter[];
  onFiltersChange: (filters: AdvancedFilter[]) => void;
  uiAdapter: UIAdapter;
  maxDepth?: number;
  enablePresets?: boolean;
  presets?: FilterPreset[];
  onSavePreset?: (preset: FilterPreset) => void;
  className?: string;
}

/**
 * Filter preset for saving/loading
 */
export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: AdvancedFilter[];
  createdAt: Date;
  updatedAt?: Date;
  isDefault?: boolean;
}

/**
 * Filter group for nested filters
 */
export interface FilterGroup {
  id: string;
  combinator: 'and' | 'or';
  filters: (AdvancedFilter | FilterGroup)[];
}

/**
 * Data type for determining available operators
 */
export type DataType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';

/**
 * Operator configuration by data type
 */
const OPERATORS_BY_TYPE: Record<DataType, FilterOperator[]> = {
  text: ['contains', 'notContains', 'eq', 'neq', 'startsWith', 'endsWith', 'regex', 'isNull', 'isNotNull'],
  number: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'notBetween', 'isNull', 'isNotNull'],
  date: ['eq', 'neq', 'before', 'after', 'between', 'dateRange', 'isNull', 'isNotNull'],
  boolean: ['eq', 'neq'],
  select: ['eq', 'neq', 'in', 'notIn', 'isNull', 'isNotNull'],
  multiselect: ['in', 'notIn', 'contains', 'notContains'],
};

/**
 * Operator labels for display
 */
const OPERATOR_LABELS: Record<FilterOperator, string> = {
  eq: 'Equals',
  neq: 'Not equals',
  lt: 'Less than',
  lte: 'Less than or equal',
  gt: 'Greater than',
  gte: 'Greater than or equal',
  contains: 'Contains',
  notContains: 'Does not contain',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  in: 'In',
  notIn: 'Not in',
  between: 'Between',
  notBetween: 'Not between',
  isNull: 'Is empty',
  isNotNull: 'Is not empty',
  regex: 'Matches pattern',
  notRegex: 'Does not match pattern',
  before: 'Before',
  after: 'After',
  dateRange: 'Date range',
};

/**
 * Filter Builder Component
 */
export function FilterBuilder({
  columns,
  filters,
  onFiltersChange,
  uiAdapter,
  maxDepth = 5,
  enablePresets = true,
  presets = [],
  onSavePreset,
  className = '',
}: FilterBuilderProps) {
  const {
    Button,
    Input,
    Select,
    Card,
    Badge,
    DropdownMenu,
    Dialog,
    icons,
  } = uiAdapter;

  const PlusIcon = icons.get('plus');
  const MinusIcon = icons.get('minus');
  const FilterIcon = icons.get('filter');
  const SaveIcon = icons.get('save');
  const LoadIcon = icons.get('load');
  const DeleteIcon = icons.get('delete');

  // State
  const [currentFilters, setCurrentFilters] = useState<AdvancedFilter[]>(filters);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  // Get data type for column
  const getColumnDataType = (columnId: string): DataType => {
    const column = columns.find(c => c.id === columnId);
    if (!column) return 'text';

    // Infer from column definition or metadata
    const columnDef = column.columnDef;

    if (columnDef.meta?.dataType) {
      return columnDef.meta.dataType as DataType;
    }

    // Infer from filter function if available
    if (columnDef.filterFn) {
      if (columnDef.filterFn === 'includesString') return 'text';
      if (columnDef.filterFn === 'equalsString') return 'text';
      if (columnDef.filterFn === 'arrIncludes') return 'multiselect';
      if (columnDef.filterFn === 'inNumberRange') return 'number';
    }

    return 'text';
  };

  // Get available operators for column
  const getOperatorsForColumn = (columnId: string): FilterOperator[] => {
    const dataType = getColumnDataType(columnId);
    return OPERATORS_BY_TYPE[dataType] || OPERATORS_BY_TYPE.text;
  };

  // Add new filter
  const addFilter = useCallback(
    (parentId?: string, index?: number) => {
      const newFilter: AdvancedFilter = {
        id: `filter-${Date.now()}`,
        field: columns[0]?.id || '',
        operator: 'contains',
        value: '',
        combinator: 'and',
      };

      if (parentId) {
        // Add to parent group
        const updateFilters = (filters: AdvancedFilter[]): AdvancedFilter[] => {
          return filters.map(filter => {
            if (filter.id === parentId && filter.children) {
              const children = [...filter.children];
              if (index !== undefined) {
                children.splice(index, 0, newFilter);
              } else {
                children.push(newFilter);
              }
              return { ...filter, children };
            }
            if (filter.children) {
              return { ...filter, children: updateFilters(filter.children) };
            }
            return filter;
          });
        };
        const updated = updateFilters(currentFilters);
        setCurrentFilters(updated);
        onFiltersChange(updated);
      } else {
        // Add to root
        const updated = [...currentFilters, newFilter];
        setCurrentFilters(updated);
        onFiltersChange(updated);
      }
    },
    [currentFilters, columns, onFiltersChange]
  );

  // Add new group
  const addGroup = useCallback(
    (parentId?: string) => {
      const newGroup: AdvancedFilter = {
        id: `group-${Date.now()}`,
        field: '',
        operator: 'eq' as FilterOperator,
        value: null,
        combinator: 'and',
        children: [],
      };

      if (parentId) {
        const updateFilters = (filters: AdvancedFilter[]): AdvancedFilter[] => {
          return filters.map(filter => {
            if (filter.id === parentId) {
              return {
                ...filter,
                children: [...(filter.children || []), newGroup],
              };
            }
            if (filter.children) {
              return { ...filter, children: updateFilters(filter.children) };
            }
            return filter;
          });
        };
        const updated = updateFilters(currentFilters);
        setCurrentFilters(updated);
        onFiltersChange(updated);
      } else {
        const updated = [...currentFilters, newGroup];
        setCurrentFilters(updated);
        onFiltersChange(updated);
      }
    },
    [currentFilters, onFiltersChange]
  );

  // Update filter
  const updateFilter = useCallback(
    (filterId: string, updates: Partial<AdvancedFilter>) => {
      const updateFilters = (filters: AdvancedFilter[]): AdvancedFilter[] => {
        return filters.map(filter => {
          if (filter.id === filterId) {
            return { ...filter, ...updates };
          }
          if (filter.children) {
            return { ...filter, children: updateFilters(filter.children) };
          }
          return filter;
        });
      };

      const updated = updateFilters(currentFilters);
      setCurrentFilters(updated);
      onFiltersChange(updated);
    },
    [currentFilters, onFiltersChange]
  );

  // Remove filter
  const removeFilter = useCallback(
    (filterId: string) => {
      const removeFromFilters = (filters: AdvancedFilter[]): AdvancedFilter[] => {
        return filters
          .filter(filter => filter.id !== filterId)
          .map(filter => {
            if (filter.children) {
              return { ...filter, children: removeFromFilters(filter.children) };
            }
            return filter;
          });
      };

      const updated = removeFromFilters(currentFilters);
      setCurrentFilters(updated);
      onFiltersChange(updated);
    },
    [currentFilters, onFiltersChange]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setCurrentFilters([]);
    onFiltersChange([]);
    setSelectedPreset(null);
  }, [onFiltersChange]);

  // Load preset
  const loadPreset = useCallback(
    (presetId: string) => {
      const preset = presets.find(p => p.id === presetId);
      if (preset) {
        setCurrentFilters(preset.filters);
        onFiltersChange(preset.filters);
        setSelectedPreset(presetId);
      }
    },
    [presets, onFiltersChange]
  );

  // Save preset
  const savePreset = useCallback(() => {
    if (!presetName) return;

    const preset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name: presetName,
      description: presetDescription,
      filters: currentFilters,
      createdAt: new Date(),
    };

    onSavePreset?.(preset);
    setShowSaveDialog(false);
    setPresetName('');
    setPresetDescription('');
  }, [currentFilters, presetName, presetDescription, onSavePreset]);

  // Export filters as JSON
  const exportFilters = useCallback(() => {
    const json = JSON.stringify(currentFilters, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filters.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [currentFilters]);

  // Import filters from JSON
  const importFilters = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const filters = JSON.parse(e.target?.result as string);
          setCurrentFilters(filters);
          onFiltersChange(filters);
        } catch (error) {
          console.error('Invalid filter file', error);
        }
      };
      reader.readAsText(file);
    },
    [onFiltersChange]
  );

  // Render filter item
  const renderFilter = (filter: AdvancedFilter, depth: number = 0): React.ReactNode => {
    const isGroup = filter.children && filter.children.length > 0;
    const canAddNested = depth < maxDepth;

    return (
      <div
        key={filter.id}
        className={`filter-item depth-${depth} ${isGroup ? 'filter-group' : ''}`}
        style={{ marginLeft: depth * 24 }}
      >
        {isGroup ? (
          <div className="filter-group-header">
            <Select
              value={filter.combinator}
              onChange={(value) => updateFilter(filter.id, { combinator: value as 'and' | 'or' })}
              className="combinator-select"
            >
              <option value="and">AND</option>
              <option value="or">OR</option>
            </Select>

            <div className="filter-actions">
              {canAddNested && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addFilter(filter.id)}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Filter
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addGroup(filter.id)}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Group
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeFilter(filter.id)}
              >
                <DeleteIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="filter-row">
            {depth > 0 && (
              <Select
                value={filter.combinator}
                onChange={(value) => updateFilter(filter.id, { combinator: value as 'and' | 'or' })}
                className="combinator-select-inline"
              >
                <option value="and">AND</option>
                <option value="or">OR</option>
              </Select>
            )}

            <Select
              value={filter.field}
              onChange={(value) => {
                const operators = getOperatorsForColumn(value);
                updateFilter(filter.id, {
                  field: value,
                  operator: operators[0],
                  value: '',
                });
              }}
              className="field-select"
            >
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.columnDef.header || column.id}
                </option>
              ))}
            </Select>

            <Select
              value={filter.operator}
              onChange={(value) => updateFilter(filter.id, { operator: value as FilterOperator })}
              className="operator-select"
            >
              {getOperatorsForColumn(filter.field).map((op) => (
                <option key={op} value={op}>
                  {OPERATOR_LABELS[op]}
                </option>
              ))}
            </Select>

            {!['isNull', 'isNotNull'].includes(filter.operator) && (
              <FilterValueInput
                filter={filter}
                column={columns.find(c => c.id === filter.field)}
                dataType={getColumnDataType(filter.field)}
                onChange={(value) => updateFilter(filter.id, { value })}
                uiAdapter={uiAdapter}
              />
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeFilter(filter.id)}
            >
              <DeleteIcon className="h-4 w-4" />
            </Button>
          </div>
        )}

        {isGroup && filter.children && (
          <div className="filter-group-children">
            {filter.children.map((child) => renderFilter(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`filter-builder ${className}`}>
      <div className="filter-builder-header">
        <div className="filter-builder-title">
          <FilterIcon className="h-5 w-5" />
          <span>Advanced Filters</span>
          {currentFilters.length > 0 && (
            <Badge variant="secondary">{currentFilters.length} active</Badge>
          )}
        </div>

        <div className="filter-builder-actions">
          {enablePresets && presets.length > 0 && (
            <DropdownMenu
              trigger={
                <Button variant="outline" size="sm">
                  <LoadIcon className="mr-2 h-4 w-4" />
                  Load Preset
                </Button>
              }
              items={presets.map(preset => ({
                label: preset.name,
                description: preset.description,
                onClick: () => loadPreset(preset.id),
                selected: selectedPreset === preset.id,
              }))}
            />
          )}

          {enablePresets && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              disabled={currentFilters.length === 0}
            >
              <SaveIcon className="mr-2 h-4 w-4" />
              Save Preset
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={exportFilters}
            disabled={currentFilters.length === 0}
          >
            Export
          </Button>

          <label className="btn btn-outline btn-sm">
            Import
            <input
              type="file"
              accept=".json"
              onChange={importFilters}
              style={{ display: 'none' }}
            />
          </label>

          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            disabled={currentFilters.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="filter-builder-body">
        {currentFilters.length === 0 ? (
          <div className="filter-builder-empty">
            <p className="text-muted-foreground">No filters applied</p>
            <div className="filter-builder-empty-actions">
              <Button onClick={() => addFilter()}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Filter
              </Button>
              <Button onClick={() => addGroup()}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Group
              </Button>
            </div>
          </div>
        ) : (
          <div className="filter-builder-content">
            {currentFilters.map((filter) => renderFilter(filter))}
            <div className="filter-builder-add-actions">
              <Button variant="outline" onClick={() => addFilter()}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Filter
              </Button>
              {maxDepth > 0 && (
                <Button variant="outline" onClick={() => addGroup()}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Group
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Save Preset Dialog */}
      {showSaveDialog && (
        <Dialog
          open={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          title="Save Filter Preset"
        >
          <div className="dialog-content">
            <Input
              label="Preset Name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Enter preset name"
            />
            <Input
              label="Description (Optional)"
              value={presetDescription}
              onChange={(e) => setPresetDescription(e.target.value)}
              placeholder="Enter description"
              multiline
              rows={3}
            />
          </div>
          <div className="dialog-actions">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={savePreset} disabled={!presetName}>
              Save Preset
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

/**
 * Filter Value Input Component
 * Renders appropriate input based on data type and operator
 */
interface FilterValueInputProps {
  filter: AdvancedFilter;
  column?: Column<any>;
  dataType: DataType;
  onChange: (value: any) => void;
  uiAdapter: UIAdapter;
}

function FilterValueInput({
  filter,
  column,
  dataType,
  onChange,
  uiAdapter,
}: FilterValueInputProps) {
  const { Input, Select, Checkbox, DatePicker } = uiAdapter;

  // Handle between operator (needs two values)
  if (filter.operator === 'between' || filter.operator === 'notBetween') {
    const [min, max] = Array.isArray(filter.value) ? filter.value : [null, null];

    return (
      <div className="filter-value-range">
        <Input
          type={dataType === 'number' ? 'number' : 'text'}
          value={min || ''}
          onChange={(e) => onChange([e.target.value, max])}
          placeholder="Min"
        />
        <span>to</span>
        <Input
          type={dataType === 'number' ? 'number' : 'text'}
          value={max || ''}
          onChange={(e) => onChange([min, e.target.value])}
          placeholder="Max"
        />
      </div>
    );
  }

  // Handle in/notIn operators (needs multiple values)
  if (filter.operator === 'in' || filter.operator === 'notIn') {
    const values = Array.isArray(filter.value) ? filter.value : [];

    return (
      <Input
        value={values.join(', ')}
        onChange={(e) => onChange(e.target.value.split(',').map(v => v.trim()))}
        placeholder="Enter values separated by commas"
      />
    );
  }

  // Handle boolean type
  if (dataType === 'boolean') {
    return (
      <Select
        value={filter.value?.toString() || 'true'}
        onChange={(value) => onChange(value === 'true')}
      >
        <option value="true">True</option>
        <option value="false">False</option>
      </Select>
    );
  }

  // Handle select type with predefined options
  if (dataType === 'select' && column?.columnDef.meta?.options) {
    const options = column.columnDef.meta.options as { value: string; label: string }[];

    return (
      <Select value={filter.value} onChange={onChange}>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    );
  }

  // Handle date type
  if (dataType === 'date') {
    if (DatePicker) {
      return (
        <DatePicker
          value={filter.value}
          onChange={onChange}
        />
      );
    }
    return (
      <Input
        type="date"
        value={filter.value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  // Handle regex pattern
  if (filter.operator === 'regex' || filter.operator === 'notRegex') {
    return (
      <Input
        value={filter.value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter regex pattern"
        pattern=".*"
      />
    );
  }

  // Default text/number input
  return (
    <Input
      type={dataType === 'number' ? 'number' : 'text'}
      value={filter.value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Enter ${dataType} value`}
    />
  );
}