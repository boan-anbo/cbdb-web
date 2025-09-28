import React, { useState } from 'react';
import {
  CBDBPage,
  CBDBPageHeader,
  CBDBPageTitle,
  CBDBPageDescription,
  CBDBPageContent,
} from '@/render/components/ui/cbdb-page';
import { Users } from 'lucide-react';
import {
  CBDBBlock,
  CBDBBlockContent,
  CBDBBlockHeader,
  CBDBBlockTitle,
  CBDBBlockActions,
} from '@/render/components/ui/cbdb-block';
import { Alert, AlertDescription } from '@/render/components/ui/alert';
import { Button } from '@/render/components/ui/button';
import { Input } from '@/render/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/render/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/render/components/ui/popover';
import { SquareCheckBig, Square, Columns3, Filter, X } from 'lucide-react';
import { usePersonSearch } from '@/render/hooks/use-person-search';
import { Table as TableType, VisibilityState } from '@tanstack/react-table';
import { PersonModel } from '@cbdb/core';
import {
  SearchFilters,
  PaginationControls,
  ActiveFilters,
} from '@/render/components/person-search';
import { DataTable } from '@/render/components/person-search/DataTable';
import {
  columns,
  singleSelectColumns,
} from '@/render/components/person-search/columns';

export function PersonSearchPage() {
  const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);
  const [table, setTable] = useState<TableType<PersonModel> | null>(null);
  const [filterValue, setFilterValue] = useState('');
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // Hide less important columns by default
    surname: false,
    surnameChn: false,
    mingzi: false,
    ethnicity: false,
    choronym: false,
    householdStatus: false,
    indexYear: false,
    indexAddress: false,
    notes: false,
  });

  const {
    filters,
    results,
    totalResults,
    currentPage,
    isLoading,
    error,
    setSearchName,
    setDynastyCode,
    setYearFrom,
    setYearTo,
    setGender,
    setLimit,
    handleSearch,
    clearFilters,
  } = usePersonSearch();

  return (
    <CBDBPage>
      <CBDBPageHeader>
        <CBDBPageTitle className="flex items-center gap-3">
          <Users className="h-6 w-6" />
          Search Historical Figures
        </CBDBPageTitle>
        <CBDBPageDescription>
          Search the CBDB database by Chinese or English name, dynasty, or other criteria
        </CBDBPageDescription>
      </CBDBPageHeader>

      <CBDBPageContent>
        {/* Search Filters */}
        <CBDBBlock>
          <CBDBBlockHeader>
            <CBDBBlockTitle>Search Filters</CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent>
            <SearchFilters
              filters={filters}
              isLoading={isLoading}
              onSearchNameChange={setSearchName}
              onDynastyCodeChange={setDynastyCode}
              onYearFromChange={setYearFrom}
              onYearToChange={setYearTo}
              onGenderChange={setGender}
              onLimitChange={setLimit}
              onSearch={() => handleSearch(1)}
              onClearFilters={clearFilters}
            />
          </CBDBBlockContent>
        </CBDBBlock>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Table */}
        <CBDBBlock>
          <CBDBBlockHeader>
            <CBDBBlockTitle>
              Search Results
              {totalResults > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (Showing {(currentPage - 1) * parseInt(filters.limit) + 1}-
                  {Math.min(
                    currentPage * parseInt(filters.limit),
                    totalResults,
                  )}{' '}
                  of {totalResults.toLocaleString()} total results)
                </span>
              )}
            </CBDBBlockTitle>
            <ActiveFilters filters={filters} />
            {results.length > 0 && (
              <CBDBBlockActions>
                {/* Filter Button */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={filterValue ? 'default' : 'outline'}
                      size="icon"
                      className="h-7 w-7"
                      title="Filter"
                    >
                      <Filter className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] p-2" align="end">
                    <div className="flex gap-1">
                      <Input
                        placeholder="Filter by name..."
                        value={filterValue}
                        onChange={(e) => {
                          setFilterValue(e.target.value);
                          table
                            ?.getColumn('nameChn')
                            ?.setFilterValue(e.target.value);
                        }}
                        className="h-8"
                      />
                      {filterValue && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setFilterValue('');
                            table?.getColumn('nameChn')?.setFilterValue('');
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Columns Button */}
                <DropdownMenu
                  open={columnDropdownOpen}
                  onOpenChange={setColumnDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      title="Toggle columns"
                    >
                      <Columns3 className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {table
                      ?.getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        const columnNames: Record<string, string> = {
                          nameChn: 'Chinese Name',
                          name: 'Pinyin Name',
                          surname: 'Surname',
                          surnameChn: 'Chinese Surname',
                          mingzi: 'Mingzi',
                          dynasty: 'Dynasty',
                          lifeYears: 'Life Years',
                          female: 'Gender',
                          ethnicity: 'Ethnicity',
                          choronym: 'Regional Identity',
                          householdStatus: 'Household Status',
                          indexYear: 'Index Year',
                          indexAddress: 'Index Address',
                          notes: 'Notes',
                        };
                        const isVisible = columnVisibility[column.id] !== false;
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            checked={isVisible}
                            onCheckedChange={(value) => {
                              // Update both the local state and the table column visibility
                              setColumnVisibility((prev) => ({
                                ...prev,
                                [column.id]: !!value,
                              }));
                              column.toggleVisibility(!!value);
                            }}
                            onSelect={(e) => e.preventDefault()}
                          >
                            {columnNames[column.id] || column.id}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Multi-select Button */}
                <Button
                  variant={multiSelectEnabled ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setMultiSelectEnabled(!multiSelectEnabled)}
                  title={
                    multiSelectEnabled
                      ? 'Multi-selection enabled'
                      : 'Multi-selection disabled'
                  }
                  className="h-7 w-7 flex items-center justify-center p-0"
                >
                  {multiSelectEnabled ? (
                    <SquareCheckBig className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </Button>
              </CBDBBlockActions>
            )}
          </CBDBBlockHeader>
          <CBDBBlockContent overflow>
            <DataTable
              columns={multiSelectEnabled ? columns : singleSelectColumns}
              data={results}
              isLoading={isLoading}
              multiSelectEnabled={multiSelectEnabled}
              onTableReady={setTable}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={setColumnVisibility}
            />
            <PaginationControls
              currentPage={currentPage}
              totalResults={totalResults}
              limit={filters.limit}
              isLoading={isLoading}
              onPageChange={handleSearch}
            />
          </CBDBBlockContent>
        </CBDBBlock>
      </CBDBPageContent>
    </CBDBPage>
  );
}
