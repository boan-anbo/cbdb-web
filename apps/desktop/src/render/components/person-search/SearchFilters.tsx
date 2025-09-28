import React from 'react';
import { SearchInput } from '@/render/components/search-input';
import { Button } from '@/render/components/ui/button';
import { Label } from '@/render/components/ui/label';
import { Input } from '@/render/components/ui/input';
import { Search, Loader2, RotateCcw, Download, Info } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/render/components/ui/select';
import { AsyncCombobox } from '@/render/components/ui/async-combobox';
import {
  DYNASTY_OPTIONS,
  RESULTS_PER_PAGE_OPTIONS,
  GENDER_OPTIONS,
  loadDynastyOptions
} from '@/render/constants/dynasties';
import type { SearchFilters as SearchFiltersType } from '@/render/hooks/use-person-search';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  isLoading: boolean;
  onSearchNameChange: (value: string) => void;
  onDynastyCodeChange: (value: string) => void;
  onYearFromChange: (value: string) => void;
  onYearToChange: (value: string) => void;
  onGenderChange: (value: 'all' | 'male' | 'female') => void;
  onLimitChange: (value: string) => void;
  onSearch: () => void;
  onClearFilters: () => void;
}

export function SearchFilters({
  filters,
  isLoading,
  onSearchNameChange,
  onDynastyCodeChange,
  onYearFromChange,
  onYearToChange,
  onGenderChange,
  onLimitChange,
  onSearch,
  onClearFilters,
}: SearchFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-8">
          <Label htmlFor="search-query">Name Search (Chinese/English)</Label>
          <div className="flex gap-2">
            <SearchInput
              id="search-query"
              placeholder="Enter Chinese or English name (e.g., 王安石, Wang Anshi)..."
              value={filters.searchName}
              onChange={(e) => onSearchNameChange(e.target.value)}
              onSearch={onSearch}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={onSearch} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Info className="h-3 w-3" />
            <span>Searches both Chinese names (姓名) and English romanizations. Also searches alternative names.</span>
          </div>
        </div>

        <div className="md:col-span-4">
          <Label className="invisible">Actions</Label>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={onClearFilters}
              title="Clear all filters"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Export results"
              disabled
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <Label htmlFor="dynasty">Dynasty</Label>
          <AsyncCombobox
            value={filters.dynastyCode}
            onValueChange={(value) => onDynastyCodeChange(value || 'all')}
            loadOptions={loadDynastyOptions}
            initialOptions={DYNASTY_OPTIONS}
            placeholder="Select dynasty..."
            searchPlaceholder="Search dynasties..."
            emptyText="No dynasties found"
            noResultsText="No matching dynasties"
            typeToSearchText="Type to search dynasties..."
            minSearchLength={0}
            loadOnMount={true}
            clearable={true}
            disabled={isLoading}
            closeOnSelect={true}
            enableHistory={true}
            historyKey="person-search-dynasty-history"
            maxHistoryItems={5}
            recentSearchesLabel="Recent dynasties"
          />
        </div>

        <div>
          <Label htmlFor="year-from">Year Range</Label>
          <div className="flex gap-2">
            <Input
              id="year-from"
              placeholder="From"
              type="number"
              value={filters.yearFrom}
              onChange={(e) => onYearFromChange(e.target.value)}
              disabled={isLoading}
            />
            <Input
              id="year-to"
              placeholder="To"
              type="number"
              value={filters.yearTo}
              onChange={(e) => onYearToChange(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={filters.gender}
            onValueChange={onGenderChange}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="limit">Results per page</Label>
          <Select value={filters.limit} onValueChange={onLimitChange}>
            <SelectTrigger id="limit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESULTS_PER_PAGE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}