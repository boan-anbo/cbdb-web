import type { Meta, StoryObj } from '@storybook/react';
import { PersonAutocomplete } from './person-autocomplete';
import { PersonModel } from '@cbdb/core';
import { useState } from 'react';

const meta: Meta<typeof PersonAutocomplete> = {
  title: 'Components/PersonAutocomplete',
  component: PersonAutocomplete,
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

/**
 * Default usage - Shows the raw emitted value
 */
export const Default: Story = {
  render: () => {
    const [selectedPerson, setSelectedPerson] = useState<PersonModel | null>(null);

    return (
      <div className="space-y-4">
        <PersonAutocomplete
          value={selectedPerson}
          onSelect={setSelectedPerson}
          placeholder="Select a person..."
        />

        <div className="p-4 border rounded-md bg-muted/10">
          <h3 className="font-semibold text-sm mb-2">Emitted Value (Raw Data):</h3>
          <pre className="text-xs overflow-auto bg-background p-2 rounded border">
            {selectedPerson ? JSON.stringify(selectedPerson, null, 2) : 'null'}
          </pre>
        </div>
      </div>
    );
  }
};

/**
 * With initial value
 */
export const WithInitialValue: Story = {
  render: () => {
    const [selectedPerson, setSelectedPerson] = useState<PersonModel | null>({
      id: 1762,
      nameChn: '王安石',
      name: 'Wang Anshi',
      dynasty: '宋',
      indexYear: 1021,
      female: false,
      birthYear: 1021,
      deathYear: 1086
    } as PersonModel);

    return (
      <div className="space-y-4">
        <PersonAutocomplete
          value={selectedPerson}
          onSelect={setSelectedPerson}
          placeholder="Select a person..."
        />

        <div className="p-4 border rounded-md bg-muted/10">
          <h3 className="font-semibold text-sm mb-2">Emitted Value (Raw Data):</h3>
          <pre className="text-xs overflow-auto bg-background p-2 rounded border">
            {selectedPerson ? JSON.stringify(selectedPerson, null, 2) : 'null'}
          </pre>
        </div>
      </div>
    );
  }
};

/**
 * Multiple selectors - Common use case
 */
export const MultipleSelectors: Story = {
  render: () => {
    const [person1, setPerson1] = useState<PersonModel | null>(null);
    const [person2, setPerson2] = useState<PersonModel | null>(null);

    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Primary Person</label>
          <PersonAutocomplete
            value={person1}
            onSelect={setPerson1}
            placeholder="Select primary person..."
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Related Person</label>
          <PersonAutocomplete
            value={person2}
            onSelect={setPerson2}
            placeholder="Select related person..."
          />
        </div>

        <div className="p-4 border rounded-md bg-muted/10">
          <h3 className="font-semibold text-sm mb-2">Emitted Values:</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium mb-1">Person 1:</p>
              <pre className="text-xs overflow-auto bg-background p-2 rounded border">
                {person1 ? JSON.stringify(person1, null, 2) : 'null'}
              </pre>
            </div>
            <div>
              <p className="text-xs font-medium mb-1">Person 2:</p>
              <pre className="text-xs overflow-auto bg-background p-2 rounded border">
                {person2 ? JSON.stringify(person2, null, 2) : 'null'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    value: {
      id: 1762,
      nameChn: '王安石',
      name: 'Wang Anshi',
      dynasty: '宋',
      indexYear: 1021
    } as PersonModel,
    placeholder: 'Disabled'
  }
};