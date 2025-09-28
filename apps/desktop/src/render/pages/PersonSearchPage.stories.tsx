import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, waitFor, expect } from '@storybook/test';
import { PersonSearchPage } from './PersonSearchPage';

const meta: Meta<typeof PersonSearchPage> = {
  title: 'Pages/PersonSearchPage',
  component: PersonSearchPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state with empty search
 */
export const Default: Story = {};

/**
 * Test autocomplete interaction
 */
export const AutocompleteInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the autocomplete input
    const searchInput = await canvas.findByPlaceholderText('Type to search for a person...');

    // Type Wang Anshi
    await userEvent.click(searchInput);
    await userEvent.type(searchInput, '王安石');

    // Wait for suggestions to appear
    await waitFor(async () => {
      // Should show suggestions or loading
      const hasContent = canvas.queryByText(/Searching/i) ||
                        canvas.queryByText(/王安石/);
      expect(hasContent).toBeTruthy();
    }, { timeout: 2000 });
  }
};

/**
 * Test search execution
 */
export const SearchExecution: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the autocomplete input
    const searchInput = await canvas.findByPlaceholderText('Type to search for a person...');

    // Type a search term
    await userEvent.click(searchInput);
    await userEvent.type(searchInput, '王');

    // Wait a moment for autocomplete
    await waitFor(() => {
      expect((searchInput as HTMLInputElement).value).toBe('王');
    }, { timeout: 1000 });

    // Click search button
    const searchButton = canvas.getByRole('button', { name: /Search/i });
    await userEvent.click(searchButton);

    // Wait for results or loading
    await waitFor(async () => {
      // Should show loading or results
      const hasContent = canvas.queryByText(/Searching.../i) ||
                        canvas.queryByText(/Search Results/i) ||
                        canvas.queryByText(/No results found/i);
      expect(hasContent).toBeTruthy();
    }, { timeout: 3000 });
  }
};

/**
 * Test filter interaction (dynasty selection)
 */
export const DynastyFilter: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find and click dynasty dropdown
    const dynastySelect = await canvas.findByText('All dynasties');
    await userEvent.click(dynastySelect);

    // Select Song dynasty
    await waitFor(async () => {
      const songOption = canvas.getByText('Song (宋)');
      expect(songOption).toBeTruthy();
      await userEvent.click(songOption);
    }, { timeout: 1000 });

    // Dynasty should be selected
    await waitFor(() => {
      const selectedDynasty = canvas.queryByText('Song (宋)');
      expect(selectedDynasty).toBeTruthy();
    });
  }
};

/**
 * Test year range input
 */
export const YearRangeFilter: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find year range inputs
    const fromInput = await canvas.findByPlaceholderText('From');
    const toInput = await canvas.findByPlaceholderText('To');

    // Enter year range
    await userEvent.type(fromInput, '960');
    await userEvent.type(toInput, '1279');

    // Values should be set
    expect((fromInput as HTMLInputElement).value).toBe('960');
    expect((toInput as HTMLInputElement).value).toBe('1279');
  }
};