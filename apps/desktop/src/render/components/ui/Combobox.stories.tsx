import type { Meta, StoryObj } from '@storybook/react';
import { Combobox, ComboboxOption } from './combobox';
import { useState } from 'react';

const meta = {
  title: 'UI/Combobox',
  component: Combobox,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="min-w-[300px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

const frameworks: ComboboxOption[] = [
  { value: 'next.js', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt.js', label: 'Nuxt.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'gatsby', label: 'Gatsby' },
  { value: 'vite', label: 'Vite' },
];

const languages: ComboboxOption[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
];

export const Default: Story = {
  args: {
    options: frameworks,
    placeholder: 'Select framework...',
  },
};

export const WithValue: Story = {
  args: {
    options: frameworks,
    value: 'next.js',
    placeholder: 'Select framework...',
  },
};

export const LongList: Story = {
  args: {
    options: languages,
    placeholder: 'Select language...',
    searchPlaceholder: 'Search languages...',
  },
};

export const CustomTexts: Story = {
  args: {
    options: frameworks,
    placeholder: 'Choose a framework',
    searchPlaceholder: 'Type to search...',
    emptyText: 'No frameworks found.',
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string>('');

    return (
      <div className="space-y-4">
        <Combobox
          options={frameworks}
          value={value}
          onValueChange={setValue}
          placeholder="Select framework..."
        />
        <div className="text-sm text-muted-foreground">
          Selected value: {value || '(none)'}
        </div>
      </div>
    );
  },
};

export const MultipleComboboxes: Story = {
  render: () => {
    const [framework, setFramework] = useState<string>('');
    const [language, setLanguage] = useState<string>('');

    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Framework</label>
          <Combobox
            options={frameworks}
            value={framework}
            onValueChange={setFramework}
            placeholder="Select framework..."
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Language</label>
          <Combobox
            options={languages}
            value={language}
            onValueChange={setLanguage}
            placeholder="Select language..."
          />
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <div>Framework: {framework || '(none)'}</div>
          <div>Language: {language || '(none)'}</div>
        </div>
      </div>
    );
  },
};