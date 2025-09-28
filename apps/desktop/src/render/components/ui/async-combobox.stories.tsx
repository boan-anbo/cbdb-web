import type { Meta, StoryObj } from '@storybook/react';
import { AsyncCombobox, AsyncComboboxOption } from './async-combobox';
import { useState, useCallback } from 'react';

const meta: Meta<typeof AsyncCombobox> = {
  title: 'UI/AsyncCombobox',
  component: AsyncCombobox,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const allFrameworks: AsyncComboboxOption[] = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "gatsby", label: "Gatsby" },
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "angular", label: "Angular" },
  { value: "ember", label: "Ember.js" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "SolidJS" },
  { value: "qwik", label: "Qwik" },
  { value: "fresh", label: "Fresh" },
];

// Simulate async API call
const mockLoadOptions = async (query: string): Promise<AsyncComboboxOption[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (!query) {
    return allFrameworks.slice(0, 5); // Return first 5 as default
  }

  const filtered = allFrameworks.filter(f =>
    f.label.toLowerCase().includes(query.toLowerCase())
  );

  return filtered;
};

/**
 * Basic async loading with search
 */
export const Default: Story = {
  args: {
    loadOptions: mockLoadOptions,
    placeholder: "Select framework...",
    searchPlaceholder: "Search frameworks...",
    typeToSearchText: "Type to search frameworks...",
    minSearchLength: 1,
  },
};

/**
 * Load initial options on mount
 */
export const LoadOnMount: Story = {
  args: {
    loadOptions: mockLoadOptions,
    placeholder: "Select framework...",
    searchPlaceholder: "Search frameworks...",
    loadOnMount: true,
    minSearchLength: 0,
  },
};

/**
 * With initial value and options
 */
export const WithInitialValue: Story = {
  args: {
    loadOptions: mockLoadOptions,
    value: "react",
    initialOptions: [
      { value: "react", label: "React" },
      { value: "vue", label: "Vue" },
    ],
    placeholder: "Select framework...",
  },
};

/**
 * Controlled component with state
 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>("react");
    const [selectedOption, setSelectedOption] = useState<AsyncComboboxOption | undefined>(
      { value: "react", label: "React" }
    );

    const handleChange = useCallback((newValue: string | undefined, option?: AsyncComboboxOption) => {
      setValue(newValue);
      setSelectedOption(option);
    }, []);

    return (
      <div className="space-y-4">
        <AsyncCombobox
          value={value}
          onValueChange={handleChange}
          loadOptions={mockLoadOptions}
          initialOptions={[
            { value: "react", label: "React" },
            { value: "vue", label: "Vue" },
          ]}
          placeholder="Select framework..."
          minSearchLength={0}
          loadOnMount={true}
        />
        <div className="p-4 border rounded-md">
          <h3 className="font-semibold mb-2">Selected:</h3>
          <p>Value: {value || "(none)"}</p>
          <p>Label: {selectedOption?.label || "(none)"}</p>
          <div className="flex gap-2 mt-3">
            <button
              className="px-3 py-1 border rounded text-sm"
              onClick={() => handleChange("vue", { value: "vue", label: "Vue" })}
            >
              Set to Vue
            </button>
            <button
              className="px-3 py-1 border rounded text-sm"
              onClick={() => handleChange(undefined, undefined)}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    );
  },
};

/**
 * Custom debounce timing
 */
export const CustomDebounce: Story = {
  args: {
    loadOptions: mockLoadOptions,
    placeholder: "Select framework...",
    debounceMs: 1000,
    loadingText: "Searching (1s debounce)...",
    minSearchLength: 1,
  },
};

/**
 * Error handling simulation
 */
export const WithErrorHandling: Story = {
  args: {
    loadOptions: async (query: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate random errors
      if (Math.random() > 0.7) {
        throw new Error("Network error");
      }

      return mockLoadOptions(query);
    },
    placeholder: "Select framework (30% error rate)...",
    minSearchLength: 1,
  },
};

/**
 * Large dataset simulation
 */
export const LargeDataset: Story = {
  args: {
    loadOptions: async (query: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Generate large dataset
      const results: AsyncComboboxOption[] = [];
      for (let i = 0; i < 100; i++) {
        const item = `Item ${i + 1}`;
        if (!query || item.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            value: `item-${i}`,
            label: item,
          });
        }
      }

      return results.slice(0, 50); // Limit to 50 results
    },
    placeholder: "Select from 100 items...",
    searchPlaceholder: "Search items...",
    minSearchLength: 0,
    loadOnMount: true,
  },
};

/**
 * With typed data
 */
interface Framework {
  name: string;
  year: number;
  popularity: number;
}

export const WithTypedData: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    const [framework, setFramework] = useState<Framework | undefined>();

    const loadFrameworks = async (query: string): Promise<AsyncComboboxOption<Framework>[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));

      const frameworks: AsyncComboboxOption<Framework>[] = [
        { value: "next", label: "Next.js (2016)", data: { name: "Next.js", year: 2016, popularity: 95 } },
        { value: "vue", label: "Vue (2014)", data: { name: "Vue", year: 2014, popularity: 85 } },
        { value: "react", label: "React (2013)", data: { name: "React", year: 2013, popularity: 90 } },
        { value: "angular", label: "Angular (2010)", data: { name: "Angular", year: 2010, popularity: 75 } },
      ];

      if (!query) return frameworks;

      return frameworks.filter(f =>
        f.label.toLowerCase().includes(query.toLowerCase())
      );
    };

    const handleChange = useCallback((newValue: string | undefined, option?: AsyncComboboxOption<Framework>) => {
      setValue(newValue);
      setFramework(option?.data);
    }, []);

    return (
      <div className="space-y-4">
        <AsyncCombobox<Framework>
          value={value}
          onValueChange={handleChange}
          loadOptions={loadFrameworks}
          placeholder="Select framework..."
          minSearchLength={0}
          loadOnMount={true}
        />
        {framework && (
          <div className="p-4 border rounded-md">
            <h3 className="font-semibold mb-2">Framework Details:</h3>
            <p>Name: {framework.name}</p>
            <p>Year: {framework.year}</p>
            <p>Popularity: {framework.popularity}%</p>
          </div>
        )}
      </div>
    );
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    loadOptions: mockLoadOptions,
    value: "react",
    initialOptions: [{ value: "react", label: "React" }],
    disabled: true,
    placeholder: "Disabled combobox",
  },
};

/**
 * Without clear button
 */
export const NoClearButton: Story = {
  args: {
    loadOptions: mockLoadOptions,
    clearable: false,
    placeholder: "Select framework (no clear)...",
    minSearchLength: 1,
  },
};

/**
 * Custom empty states
 */
export const CustomEmptyStates: Story = {
  args: {
    loadOptions: async (query: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return []; // Always return empty
    },
    placeholder: "Select option...",
    typeToSearchText: "🔍 Start typing to search...",
    loadingText: "⏳ Loading results...",
    noResultsText: "😕 No matches found",
    emptyText: "📭 No options available",
    minSearchLength: 1,
  },
};

/**
 * Allow custom values (true combobox behavior)
 */
export const AllowCustomValue: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    const [selectedOption, setSelectedOption] = useState<AsyncComboboxOption | undefined>();

    const handleChange = useCallback((newValue: string | undefined, option?: AsyncComboboxOption) => {
      setValue(newValue);
      setSelectedOption(option);
    }, []);

    return (
      <div className="space-y-4">
        <AsyncCombobox
          value={value}
          onValueChange={handleChange}
          loadOptions={mockLoadOptions}
          placeholder="Select or type custom value..."
          minSearchLength={0}
          allowCustomValue={true}
          loadOnMount={true}
        />
        <div className="p-4 border rounded-md">
          <h3 className="font-semibold mb-2">Result:</h3>
          <p className="text-sm">
            <strong>Value:</strong> {value || "(none)"}
          </p>
          <p className="text-sm">
            <strong>Is Custom:</strong> {value && !selectedOption ? "Yes" : "No"}
          </p>
          <p className="text-sm">
            <strong>Selected Option:</strong> {selectedOption?.label || "(none)"}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>• Type to search for existing options</p>
          <p>• Select an option from the list</p>
          <p>• OR type a custom value and close the dropdown to accept it</p>
        </div>
      </div>
    );
  },
};