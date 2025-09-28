/**
 * PersonNetworkView Stories
 *
 * Stories demonstrating the PersonNetworkView inspector component
 * with different selector states and interactions.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { personNetworkInspectorViewDef } from './PersonNetworkView';
import { SelectionProvider, useSelection } from '@/render/contexts/SelectionContext';
import { selectableItemFactories } from '@/render/components/selector/entities';
import { SelectorBar } from '@/render/components/selector/SelectorBar';
import { Button } from '@/render/components/ui/button';
import { Badge } from '@/render/components/ui/badge';
import { Separator } from '@/render/components/ui/separator';
import {
  Users,
  Network,
  User,
  UserPlus,
  UsersRound,
  Trash2,
  RefreshCw,
  ArrowRight,
  Shuffle
} from 'lucide-react';

// Sample person data - using actual IDs from CBDB database
const samplePersons = [
  {
    id: 1762,
    name: 'Wang Anshi',
    nameChn: '王安石',
    dynastyName: 'Song',
    birthYear: 1021,
    deathYear: 1086
  },
  {
    id: 3767,  // Corrected ID for Su Shi
    name: 'Su Shi',
    nameChn: '蘇軾',
    dynastyName: 'Song',
    birthYear: 1036,  // Corrected birth year
    deathYear: 1101
  },
  {
    id: 1384,  // Corrected ID for Ouyang Xiu
    name: 'Ouyang Xiu',
    nameChn: '歐陽修',
    dynastyName: 'Song',
    birthYear: 1007,
    deathYear: 1072
  },
  {
    id: 1488,  // Corrected ID for Sima Guang
    name: 'Sima Guang',
    nameChn: '司馬光',
    dynastyName: 'Song',
    birthYear: 1019,
    deathYear: 1086
  }
];

/**
 * Test harness for PersonNetworkView inspector
 */
const NetworkInspectorTestHarness: React.FC<{
  initialPersonCount?: number;
}> = ({
  initialPersonCount = 2
}) => {
  const { select, clear, selectedItems, count, deselect, lastSelectedId } = useSelection();
  const PersonNetworkView = personNetworkInspectorViewDef.component;

  // Pre-select multiple persons on mount
  React.useEffect(() => {
    const personsToSelect = samplePersons.slice(0, Math.min(initialPersonCount, samplePersons.length));
    const selectableItems = personsToSelect.map(person =>
      selectableItemFactories.person(person, 'story')
    );
    select(selectableItems);
  }, []);

  // Utility functions for testing
  const selectSinglePerson = (index: number = 0) => {
    const person = samplePersons[index];
    // Use 'replace' mode to replace current selection
    select(selectableItemFactories.person(person, 'story'), 'replace');
  };

  const selectMultiplePersons = (count: number = 3) => {
    const persons = samplePersons.slice(0, Math.min(count, samplePersons.length));
    const items = persons.map(p => selectableItemFactories.person(p, 'story'));
    // Replace current selection with multiple persons
    select(items, 'replace');
  };

  const addPerson = (index: number) => {
    const person = samplePersons[index];
    if (!selectedItems.some(item => item.type === 'person' && (item.data as any).id === person.id)) {
      select(selectableItemFactories.person(person, 'story'), 'toggle');
    }
  };

  const removePerson = (personId: number) => {
    const item = selectedItems.find(item =>
      item.type === 'person' && (item.data as any).id === personId
    );
    if (item) {
      deselect(item.id);
    }
  };

  const togglePerson = (index: number) => {
    const person = samplePersons[index];
    const existing = selectedItems.find(item =>
      item.type === 'person' && (item.data as any).id === person.id
    );
    if (existing) {
      deselect(existing.id);
    } else {
      select(selectableItemFactories.person(person, 'story'), 'toggle');
    }
  };

  const shuffleSelection = () => {
    const shuffled = [...samplePersons].sort(() => Math.random() - 0.5);
    const count = Math.floor(Math.random() * 3) + 2; // 2-4 persons
    selectMultiplePersons(count);
  };

  const selectedPersons = selectedItems.filter(item => item.type === 'person');
  const activePersonId = lastSelectedId
    ? selectedItems.find(item => item.id === lastSelectedId && item.type === 'person')
    : selectedPersons[selectedPersons.length - 1];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Person Network Inspector View Test</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant={count === 1 ? "default" : "secondary"}>
              {count === 1 ? "Single" : "Multiple"} Selection
            </Badge>
            <span>{count} person(s) selected</span>
            {activePersonId && (
              <span>
                Active: <strong>{(activePersonId.data as any).nameChn || (activePersonId.data as any).name}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Test Controls */}
        <div className="space-y-3">
          {/* Quick Selection Controls */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Quick Select:</span>
              <div className="flex rounded-md shadow-sm">
                <Button onClick={() => selectSinglePerson(0)} size="sm" variant="outline" className="rounded-r-none">
                  <User className="w-4 h-4 mr-1" />
                  Single (Wang Anshi)
                </Button>
                <Button onClick={() => selectMultiplePersons(2)} size="sm" variant="outline" className="rounded-none border-l-0">
                  <UserPlus className="w-4 h-4 mr-1" />
                  2 Persons
                </Button>
                <Button onClick={() => selectMultiplePersons(3)} size="sm" variant="outline" className="rounded-none border-l-0">
                  <UsersRound className="w-4 h-4 mr-1" />
                  3 Persons
                </Button>
                <Button onClick={() => selectMultiplePersons(4)} size="sm" variant="outline" className="rounded-l-none border-l-0">
                  <Users className="w-4 h-4 mr-1" />
                  All 4
                </Button>
              </div>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <Button onClick={shuffleSelection} size="sm" variant="outline">
              <Shuffle className="w-4 h-4 mr-1" />
              Random Mix
            </Button>
            <Button onClick={clear} size="sm" variant="outline">
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>

          {/* Individual Person Toggles */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium">Toggle Persons:</span>
            {samplePersons.map((person, index) => {
              const isSelected = selectedPersons.some((item: any) =>
                (item.data as any).id === person.id
              );
              const isActive = activePersonId && (activePersonId.data as any).id === person.id;
              return (
                <Button
                  key={person.id}
                  onClick={() => {
                    // For single person story, always replace
                    // For multiple person stories, toggle
                    if (initialPersonCount === 1) {
                      selectSinglePerson(index);
                    } else {
                      togglePerson(index);
                    }
                  }}
                  size="sm"
                  variant={isActive ? "default" : isSelected ? "secondary" : "outline"}
                >
                  {person.nameChn}
                  {isActive && <ArrowRight className="w-3 h-3 ml-1" />}
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Inspector View */}
        <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
          <div className="bg-muted/30 px-4 py-2 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4" />
                <span className="font-medium">Person Network Inspector</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Showing network for: {activePersonId ? (
                  <span className="font-medium">
                    {(activePersonId.data as any).nameChn || (activePersonId.data as any).name}
                  </span>
                ) : (
                  <span>Wang Anshi (default)</span>
                )}
              </div>
            </div>
          </div>
          <div className="p-4">
            <PersonNetworkView
              data={selectedItems}
              panelId="story-panel"
              isActive={true}
            />
          </div>
        </div>

      </div>

      {/* Selector Bar (floating at bottom) */}
      <SelectorBar />
    </div>
  );
};

const meta: Meta<typeof NetworkInspectorTestHarness> = {
  title: 'Selectors/Inspector Views/Person Network',
  component: NetworkInspectorTestHarness,
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
};

export default meta;
type Story = StoryObj<typeof NetworkInspectorTestHarness>;

/**
 * Default state with 2 persons pre-selected
 */
export const TwoPersonsSelected: Story = {
  name: '1. Two Persons (Default)',
  args: {
    initialPersonCount: 2,
  },
};

/**
 * Three persons selected
 */
export const ThreePersonsSelected: Story = {
  name: '2. Three Persons',
  args: {
    initialPersonCount: 3,
  },
};

/**
 * All four persons selected
 */
export const AllPersonsSelected: Story = {
  name: '3. All Persons',
  args: {
    initialPersonCount: 4,
  },
};

/**
 * Single person selected (for comparison)
 */
export const SinglePersonSelected: Story = {
  name: '4. Single Person',
  args: {
    initialPersonCount: 1,
  },
};

/**
 * Interactive testing playground
 */
export const InteractiveTest: Story = {
  name: '5. Interactive Test',
  args: {
    initialPersonCount: 2,
  },
};