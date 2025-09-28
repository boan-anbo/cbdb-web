/**
 * SelectorBar Stories
 *
 * Comprehensive stories for the SelectorBar component
 * showing different states and interactions.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SelectorBar } from './SelectorBar';
import { SelectionProvider, useSelection } from '@/render/contexts/SelectionContext';
import { selectableItemFactories } from './entities';
import { Button } from '@/render/components/ui/button';
import { Badge } from '@/render/components/ui/badge';
import {
  Users,
  FileText,
  MapPin,
  Building,
  Plus,
  Trash2,
  Shuffle,
  Lock,
  Unlock
} from 'lucide-react';

// Sample data for different entity types
const sampleData = {
  persons: [
    { id: 1, name: 'Wang Anshi', nameChn: '王安石', dynastyName: 'Song', birthYear: 1021, deathYear: 1086 },
    { id: 2, name: 'Su Shi', nameChn: '蘇軾', dynastyName: 'Song', birthYear: 1037, deathYear: 1101 },
    { id: 3, name: 'Ouyang Xiu', nameChn: '歐陽修', dynastyName: 'Song', birthYear: 1007, deathYear: 1072 },
    { id: 4, name: 'Sima Guang', nameChn: '司馬光', dynastyName: 'Song', birthYear: 1019, deathYear: 1086 },
  ],
  texts: [
    { id: 1, title: 'Spring and Autumn Annals', titleChn: '春秋', author: 'Confucius', authorChn: '孔子', year: -500, textType: 'Historical' },
    { id: 2, title: 'Records of the Grand Historian', titleChn: '史記', author: 'Sima Qian', authorChn: '司馬遷', year: -90, textType: 'Historical' },
  ],
  places: [
    { id: 1, placeName: 'Kaifeng', placeNameChn: '開封', addressType: 'Capital' },
    { id: 2, placeName: 'Hangzhou', placeNameChn: '杭州', addressType: 'City' },
    { id: 3, placeName: 'Suzhou', placeNameChn: '蘇州', addressType: 'City' },
  ],
  offices: [
    { id: 1, title: 'Prime Minister', titleChn: '宰相', dynastyName: 'Song' },
    { id: 2, title: 'Grand Secretary', titleChn: '大學士', dynastyName: 'Song' },
  ]
};

/**
 * Interactive selector demonstration component
 */
const SelectorDemo: React.FC<{
  initialItems?: Array<'persons' | 'texts' | 'places' | 'offices'>;
  maxItems?: number;
  showControls?: boolean;
  autoExpand?: boolean;
}> = ({
  initialItems = [],
  maxItems = 10,
  showControls = true,
  autoExpand = false
}) => {
  const {
    select,
    clear,
    selectedItems,
    count,
    setMaxItems,
    selectorExpanded,
    setSelectorExpanded,
    isProtected,
    setProtected
  } = useSelection();

  // Set max items on mount
  React.useEffect(() => {
    setMaxItems(maxItems);
  }, [maxItems, setMaxItems]);

  // Auto-expand if requested
  React.useEffect(() => {
    if (autoExpand && count > 0) {
      setSelectorExpanded(true);
    }
  }, [autoExpand, count, setSelectorExpanded]);

  // Pre-select initial items
  React.useEffect(() => {
    const items = [];

    if (initialItems.includes('persons') && sampleData.persons.length > 0) {
      items.push(selectableItemFactories.person(sampleData.persons[0], 'demo'));
    }
    if (initialItems.includes('texts') && sampleData.texts.length > 0) {
      items.push(selectableItemFactories.text(sampleData.texts[0], 'demo'));
    }
    if (initialItems.includes('places') && sampleData.places.length > 0) {
      items.push(selectableItemFactories.place(sampleData.places[0], 'demo'));
    }
    if (initialItems.includes('offices') && sampleData.offices.length > 0) {
      items.push(selectableItemFactories.office(sampleData.offices[0], 'demo'));
    }

    if (items.length > 0) {
      select(items);
    }
  }, []);

  const addRandomItem = () => {
    const types = ['person', 'text', 'place', 'office'];
    const randomType = types[Math.floor(Math.random() * types.length)];

    switch (randomType) {
      case 'person': {
        const available = sampleData.persons.filter(p =>
          !selectedItems.some(item => item.type === 'person' && (item.data as any).id === p.id)
        );
        if (available.length > 0) {
          const random = available[Math.floor(Math.random() * available.length)];
          select(selectableItemFactories.person(random, 'demo'));
        }
        break;
      }
      case 'text': {
        const available = sampleData.texts.filter(t =>
          !selectedItems.some(item => item.type === 'text' && (item.data as any).id === t.id)
        );
        if (available.length > 0) {
          const random = available[Math.floor(Math.random() * available.length)];
          select(selectableItemFactories.text(random, 'demo'));
        }
        break;
      }
      case 'place': {
        const available = sampleData.places.filter(p =>
          !selectedItems.some(item => item.type === 'place' && (item.data as any).id === p.id)
        );
        if (available.length > 0) {
          const random = available[Math.floor(Math.random() * available.length)];
          select(selectableItemFactories.place(random, 'demo'));
        }
        break;
      }
      case 'office': {
        const available = sampleData.offices.filter(o =>
          !selectedItems.some(item => item.type === 'office' && (item.data as any).id === o.id)
        );
        if (available.length > 0) {
          const random = available[Math.floor(Math.random() * available.length)];
          select(selectableItemFactories.office(random, 'demo'));
        }
        break;
      }
    }
  };

  const fillToMax = () => {
    const itemsToAdd = [];
    const remainingSlots = maxItems - count;

    for (let i = 0; i < remainingSlots && i < sampleData.persons.length; i++) {
      const person = sampleData.persons[i];
      if (!selectedItems.some(item => item.type === 'person' && (item.data as any).id === person.id)) {
        itemsToAdd.push(selectableItemFactories.person(person, 'demo'));
      }
    }

    if (itemsToAdd.length > 0) {
      select(itemsToAdd);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Selector Bar Component</h1>
            <p className="text-muted-foreground">
              Interactive demonstration of the selector bar with various states and configurations
            </p>
          </div>

          {/* Status */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              <Users className="w-3 h-3 mr-1" />
              {count} / {maxItems} Selected
            </Badge>
            <Badge variant={selectorExpanded ? "default" : "outline"}>
              {selectorExpanded ? "Expanded" : "Collapsed"}
            </Badge>
            <Badge variant={isProtected ? "destructive" : "outline"}>
              {isProtected ? <Lock className="w-3 h-3 mr-1" /> : <Unlock className="w-3 h-3 mr-1" />}
              {isProtected ? "Protected" : "Unlocked"}
            </Badge>
          </div>

          {/* Controls */}
          {showControls && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={addRandomItem} disabled={count >= maxItems}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Random
                </Button>
                <Button onClick={fillToMax} variant="outline" disabled={count >= maxItems}>
                  <Shuffle className="w-4 h-4 mr-2" />
                  Fill to Max
                </Button>
                <Button onClick={clear} variant="outline">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
                <Button
                  onClick={() => setSelectorExpanded(!selectorExpanded)}
                  variant="outline"
                  disabled={count === 0}
                >
                  {selectorExpanded ? "Collapse" : "Expand"} Selector
                </Button>
                <Button
                  onClick={() => setProtected(!isProtected)}
                  variant="outline"
                >
                  {isProtected ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  {isProtected ? "Unlock" : "Lock"}
                </Button>
              </div>

              {/* Quick add buttons */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Quick add:</p>
                <div className="flex flex-wrap gap-2">
                  {sampleData.persons.slice(0, 2).map(person => (
                    <Button
                      key={person.id}
                      size="sm"
                      variant="outline"
                      onClick={() => select(selectableItemFactories.person(person, 'demo'))}
                      disabled={selectedItems.some(item => item.type === 'person' && (item.data as any).id === person.id)}
                    >
                      <Users className="w-3 h-3 mr-1" />
                      {person.nameChn}
                    </Button>
                  ))}
                  {sampleData.texts.slice(0, 1).map(text => (
                    <Button
                      key={text.id}
                      size="sm"
                      variant="outline"
                      onClick={() => select(selectableItemFactories.text(text, 'demo'))}
                      disabled={selectedItems.some(item => item.type === 'text' && (item.data as any).id === text.id)}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      {text.titleChn}
                    </Button>
                  ))}
                  {sampleData.places.slice(0, 1).map(place => (
                    <Button
                      key={place.id}
                      size="sm"
                      variant="outline"
                      onClick={() => select(selectableItemFactories.place(place, 'demo'))}
                      disabled={selectedItems.some(item => item.type === 'place' && (item.data as any).id === place.id)}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      {place.placeNameChn}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Selected items preview */}
          {count > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Selected Items:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm">
                    {item.type === 'person' && <Users className="w-4 h-4" />}
                    {item.type === 'text' && <FileText className="w-4 h-4" />}
                    {item.type === 'place' && <MapPin className="w-4 h-4" />}
                    {item.type === 'office' && <Building className="w-4 h-4" />}
                    <span className="truncate">
                      {item.type === 'person' && ((item.data as any).nameChn || (item.data as any).name)}
                      {item.type === 'text' && ((item.data as any).titleChn || (item.data as any).title)}
                      {item.type === 'place' && ((item.data as any).placeNameChn || (item.data as any).placeName)}
                      {item.type === 'office' && ((item.data as any).titleChn || (item.data as any).title)}
                    </span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {item.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• The selector bar appears at the bottom when items are selected</p>
            <p>• Drag items to reorder them in the selector</p>
            <p>• Click the X button on items to remove them</p>
            <p>• The selector enforces a maximum of {maxItems} items</p>
            <p>• When protected/locked, items cannot be modified</p>
          </div>
        </div>
      </div>

      {/* Selector Bar (fixed at bottom) */}
      <SelectorBar />
    </div>
  );
};

const meta: Meta<typeof SelectorDemo> = {
  title: 'Selectors/SelectorBar',
  component: SelectorDemo,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <SelectionProvider>
        <Story />
      </SelectionProvider>
    ),
  ],
  argTypes: {
    maxItems: {
      control: { type: 'number', min: 1, max: 20, step: 1 },
      description: 'Maximum number of items allowed in selector'
    },
    showControls: {
      control: 'boolean',
      description: 'Show interactive controls'
    },
    autoExpand: {
      control: 'boolean',
      description: 'Auto-expand selector when items are added'
    }
  }
};

export default meta;
type Story = StoryObj<typeof SelectorDemo>;

/**
 * Empty state - no items selected
 */
export const Empty: Story = {
  name: '1. Empty State',
  args: {
    initialItems: [],
    maxItems: 10,
    showControls: true,
    autoExpand: false
  }
};

/**
 * Single item selected
 */
export const SingleItem: Story = {
  name: '2. Single Item',
  args: {
    initialItems: ['persons'],
    maxItems: 10,
    showControls: true,
    autoExpand: true
  }
};

/**
 * Multiple items of same type
 */
export const MultiplePersons: Story = {
  name: '3. Multiple Persons',
  args: {
    initialItems: ['persons'],
    maxItems: 10,
    showControls: true,
    autoExpand: true
  }
};

/**
 * Select Among Selected - Test active item selection within selector
 */
export const SelectAmongSelected: Story = {
  name: '4. Select Among Selected',
  args: {
    initialItems: ['persons', 'texts', 'places'],
    maxItems: 10,
    showControls: true,
    autoExpand: true // Auto-expand to test selection behavior
  },
  parameters: {
    docs: {
      description: {
        story: `
Test the active item selection within the selector:
- Multiple items are pre-selected and selector is expanded
- Click on items to set them as active (highlighted with border and primary color)
- Hover shows different highlight (lighter background)
- Only the X button removes items
- Active state is visually distinct from hover state
        `
      }
    }
  }
};

/**
 * Mixed entity types
 */
export const MixedTypes: Story = {
  name: '5. Mixed Entity Types',
  args: {
    initialItems: ['persons', 'texts', 'places', 'offices'],
    maxItems: 10,
    showControls: true,
    autoExpand: false
  }
};

/**
 * Near maximum capacity
 */
export const NearMax: Story = {
  name: '6. Near Maximum',
  args: {
    initialItems: ['persons', 'texts', 'places'],
    maxItems: 5,
    showControls: true,
    autoExpand: true
  }
};

/**
 * Collapsed state with items
 */
export const Collapsed: Story = {
  name: '7. Collapsed with Items',
  args: {
    initialItems: ['persons', 'texts'],
    maxItems: 10,
    showControls: true,
    autoExpand: false
  }
};

/**
 * View only mode (no controls)
 */
export const ViewOnly: Story = {
  name: '8. View Only',
  args: {
    initialItems: ['persons', 'texts', 'places'],
    maxItems: 10,
    showControls: false,
    autoExpand: true
  }
};

/**
 * Interactive playground
 */
export const Playground: Story = {
  name: '9. Interactive Playground',
  args: {
    initialItems: [],
    maxItems: 10,
    showControls: true,
    autoExpand: false
  }
};