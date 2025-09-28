import type { Preview } from '@storybook/react';
import React from 'react';
import '../src/render/index.css';
import { MemoryRouter } from 'react-router-dom';
import { StorybookProviders } from '../src/render/providers/AppProviders';
import { PageProvider } from '../src/render/contexts/PageContext';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [
    // Provide routing and pages for all stories
    (Story, context) => {
      // Check if story has custom pages configuration
      const customPages = context.parameters?.pages;
      const pageMode = context.parameters?.pageMode || 'replace';

      return (
        <MemoryRouter initialEntries={[context.parameters?.initialRoute || '/']}>
          <StorybookProviders>
            <PageProvider pages={customPages} mode={pageMode}>
              <Story />
            </PageProvider>
          </StorybookProviders>
        </MemoryRouter>
      );
    },
  ],
};

export default preview;
