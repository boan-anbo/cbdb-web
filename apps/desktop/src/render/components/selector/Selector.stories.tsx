import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SelectorBar } from './SelectorBar';
import { SelectorItem } from './SelectorItem';
import { SelectableItem, createSelectableItem } from './types';
import { selectableItemFactories } from './entities';
import { useSelection } from '../../contexts/SelectionContext';
import { User, FileText, MapPin, Building } from 'lucide-react';
import { MainLayout } from '@/render/layouts/MainLayout';
import { SelectorDemo as FullSelectorDemo } from './demos/SelectorDemo';

const meta = {
  title: 'Selectors/Core',
  component: MainLayout,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MainLayout>;

export default meta;
type Story = StoryObj<typeof MainLayout>;

export const InteractiveDemo: Story = {
  name: 'Interactive Demo',
  parameters: {
    initialRoute: '/selector-demo',
    pageMode: 'merge',
    pages: [
      {
        id: 'selector-demo',
        path: '/selector-demo',
        component: FullSelectorDemo,
        title: 'Selector Demo',
        icon: User,
        sidebar: {
          section: 'development',
          order: 1,
          badge: 'Demo',
        },
        metadata: {
          description: 'Interactive demo of the selection system',
        },
      },
    ],
  },
};

export const EmptyState: Story = {
  name: 'Empty State (No Items)',
  parameters: {
    initialRoute: '/selector-empty',
    pageMode: 'merge',
    pages: [
      {
        id: 'selector-empty',
        path: '/selector-empty',
        component: () => {
          const { count } = useSelection();
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Empty Selector State</h2>
              <div className="text-center text-gray-500">
                <p>No items selected. The selector bar is hidden when empty.</p>
                <p className="text-sm mt-2">Current count: {count}</p>
                <p className="text-sm mt-4 text-blue-600">Navigate to the Interactive Demo to select items and see the floating selector bar.</p>
              </div>
              <SelectorBar />
            </div>
          );
        },
        title: 'Empty Selector',
        icon: User,
        sidebar: {
          section: 'development',
          order: 2,
        },
      },
    ],
  },
};

export const PrePopulated: Story = {
  name: 'Pre-populated with Items',
  parameters: {
    initialRoute: '/selector-prepopulated',
    pageMode: 'merge',
    pages: [
      {
        id: 'selector-prepopulated',
        path: '/selector-prepopulated',
        component: () => {
          const { select, count, selectedItems } = useSelection();

          React.useEffect(() => {
            // Pre-select some items
            select([
              selectableItemFactories.person({
                id: 1,
                name: 'Test Person',
                nameChn: '測試人',
                dynastyName: 'Song',
                birthYear: 1000,
                deathYear: 1100
              }),
              selectableItemFactories.text({
                id: 2,
                title: 'Test Text',
                titleChn: '測試文本',
                author: 'Author',
                authorChn: '作者',
                year: 1050,
                textType: 'Document'
              })
            ]);
          }, []);

          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Pre-populated Selector</h2>
              <div className="text-center">
                <p className="text-lg">Selector bar is pre-populated with {count} items</p>
                <p className="text-sm text-gray-500 mt-2">Look at the bottom of the screen for the floating selector bar</p>
                <p className="text-sm text-gray-500 mt-2">You can drag to reorder or click X to remove items</p>
              </div>
              <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded">
                <h3 className="font-semibold mb-2">Selected Items:</h3>
                <ul className="space-y-1">
                  {selectedItems.map(item => (
                    <li key={item.selectionId} className="text-sm">
                      {item.label} ({item.entityType})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        },
        title: 'Pre-populated',
        icon: User,
        sidebar: {
          section: 'development',
          order: 3,
          badge: '2 items',
        },
      },
    ],
  },
};

// Add a separate story for SelectorBar only (without MainLayout)
const SelectorBarOnlyStory = () => {
  const { select, count } = useSelection();

  React.useEffect(() => {
    // Pre-select diverse items for styling
    select([
      createSelectableItem.person({
        id: 1,
        name: 'Wang Anshi',
        nameChn: '王安石',
        dynastyName: 'Song',
        birthYear: 1021,
        deathYear: 1086
      }),
      createSelectableItem.text({
        id: 2,
        title: 'Spring and Autumn Annals',
        titleChn: '春秋',
        author: 'Confucius',
        authorChn: '孔子',
        year: -500,
        textType: 'Historical'
      }),
      selectableItemFactories.place({
        id: 3,
        placeName: 'Kaifeng',
        placeNameChn: '開封',
        addressType: 'Capital'
      }),
      selectableItemFactories.office({
        id: 4,
        title: 'Prime Minister',
        titleChn: '宰相',
        dynastyName: 'Song'
      })
    ]);
  }, []);

  return (
    <div className="min-h-screen flex items-end justify-center p-8 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Selector Bar Styling View</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {count} items pre-selected. Use this view to style and test the selector bar component.
          </p>
        </div>
        <SelectorBar />
      </div>
    </div>
  );
};

export const SelectorBarOnly: StoryObj<typeof SelectorBar> = {
  name: 'Selector Bar Only (For Styling)',
  render: () => <SelectorBarOnlyStory />,
  parameters: {
    layout: 'centered',
  },
};