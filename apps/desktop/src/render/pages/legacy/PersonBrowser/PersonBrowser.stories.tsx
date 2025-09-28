import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, waitFor, expect } from '@storybook/test';
import PersonBrowser from './PersonBrowser';

const meta: Meta<typeof PersonBrowser> = {
  title: 'Legacy/PersonBrowser/PersonBrowser',
  component: PersonBrowser,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="p-4 h-screen">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state with no person selected
 */
export const Default: Story = {};

/**
 * Test searching for Wang Anshi (ID: 1762)
 */
export const WangAnshiSearch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the search input
    const searchInput = await canvas.findByPlaceholderText('Enter person ID or name...');

    // Type Wang Anshi's ID
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, '1762');

    // Click search button
    const searchButton = canvas.getByRole('button', { name: '' }); // Icon button
    await userEvent.click(searchButton);

    // Wait for the person details to load
    await waitFor(async () => {
      // Should show person name in header
      const header = await canvas.findByText(/Person Details.*1762/);
      expect(header).toBeTruthy();
    }, { timeout: 5000 });

    // Check that birth/death tab is shown by default
    const birthDeathContent = await canvas.findByText(/birth/i, { selector: ':not(button)' });
    expect(birthDeathContent).toBeTruthy();
  }
};

/**
 * Test navigating between tabs
 */
export const TabNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // First search for a person
    const searchInput = await canvas.findByPlaceholderText('Enter person ID or name...');
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, '1762');
    await userEvent.keyboard('{Enter}');

    // Wait for initial load
    await waitFor(async () => {
      const header = await canvas.findByText(/Person Details.*1762/);
      expect(header).toBeTruthy();
    }, { timeout: 5000 });

    // Click on Offices tab
    const officesTab = canvas.getByRole('tab', { name: '任官' });
    await userEvent.click(officesTab);

    // Wait for offices content to load
    await waitFor(async () => {
      const officesContent = await canvas.findByText(/office/i, { selector: ':not(button)' });
      expect(officesContent).toBeTruthy();
    }, { timeout: 3000 });

    // Click on Kinship tab
    const kinshipTab = canvas.getByRole('tab', { name: '親屬' });
    await userEvent.click(kinshipTab);

    // Wait for kinship content to load
    await waitFor(async () => {
      const kinshipContent = await canvas.findByText(/kinship/i, { selector: ':not(button)' });
      expect(kinshipContent).toBeTruthy();
    }, { timeout: 3000 });
  }
};

/**
 * Test keyboard navigation (Enter key)
 */
export const KeyboardSearch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the search input
    const searchInput = await canvas.findByPlaceholderText('Enter person ID or name...');

    // Type and press Enter
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, '3702'); // Pi Rixiu
    await userEvent.keyboard('{Enter}');

    // Wait for the person details to load
    await waitFor(async () => {
      const header = await canvas.findByText(/Person Details.*3702/);
      expect(header).toBeTruthy();
    }, { timeout: 5000 });
  }
};

/**
 * Test with invalid input (defaults to Wang Anshi)
 */
export const InvalidInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the search input
    const searchInput = await canvas.findByPlaceholderText('Enter person ID or name...');

    // Type invalid input
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, 'invalid text');
    await userEvent.keyboard('{Enter}');

    // Should default to Wang Anshi
    await waitFor(async () => {
      const header = await canvas.findByText(/王安石.*Wang Anshi/);
      expect(header).toBeTruthy();
    }, { timeout: 5000 });
  }
};