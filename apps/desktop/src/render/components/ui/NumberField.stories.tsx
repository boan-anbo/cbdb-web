import type { Meta, StoryObj } from '@storybook/react';
import { NumberField } from './number-field';
import { useState } from 'react';

const meta = {
  title: 'UI/NumberField',
  component: NumberField,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="min-w-[200px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter number...',
  },
};

export const WithValue: Story = {
  args: {
    value: 42,
    placeholder: 'Enter number...',
  },
};

export const WithMinMax: Story = {
  args: {
    value: 50,
    min: 0,
    max: 100,
    placeholder: 'Enter number (0-100)...',
  },
};

export const WithStep: Story = {
  args: {
    value: 0,
    step: 5,
    placeholder: 'Step by 5',
  },
};

export const DecimalStep: Story = {
  args: {
    value: 0.5,
    step: 0.1,
    min: 0,
    max: 1,
    placeholder: 'Enter decimal (0-1)...',
  },
};

export const WithoutButtons: Story = {
  args: {
    value: 42,
    showButtons: false,
    placeholder: 'No buttons',
  },
};

export const WithoutScroll: Story = {
  args: {
    value: 10,
    allowScroll: false,
    placeholder: 'Scroll disabled',
  },
};

export const Disabled: Story = {
  args: {
    value: 42,
    disabled: true,
    placeholder: 'Disabled',
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<number | undefined>(0);

    return (
      <div className="space-y-4">
        <NumberField
          value={value}
          onChange={setValue}
          min={-100}
          max={100}
          placeholder="Enter number..."
        />
        <div className="text-sm text-muted-foreground">
          Current value: {value !== undefined ? value : '(none)'}
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 text-sm border rounded"
            onClick={() => setValue(0)}
          >
            Reset to 0
          </button>
          <button
            className="px-3 py-1 text-sm border rounded"
            onClick={() => setValue(undefined)}
          >
            Clear
          </button>
          <button
            className="px-3 py-1 text-sm border rounded"
            onClick={() => setValue(50)}
          >
            Set to 50
          </button>
        </div>
      </div>
    );
  },
};

export const MultipleFields: Story = {
  render: () => {
    const [quantity, setQuantity] = useState<number | undefined>(1);
    const [price, setPrice] = useState<number | undefined>(9.99);
    const [discount, setDiscount] = useState<number | undefined>(0);

    const total = ((quantity || 0) * (price || 0) * (1 - (discount || 0) / 100)).toFixed(2);

    return (
      <div className="space-y-4 w-64">
        <div>
          <label className="text-sm font-medium mb-2 block">Quantity</label>
          <NumberField
            value={quantity}
            onChange={setQuantity}
            min={1}
            step={1}
            placeholder="Enter quantity..."
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Price ($)</label>
          <NumberField
            value={price}
            onChange={setPrice}
            min={0}
            step={0.01}
            placeholder="Enter price..."
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Discount (%)</label>
          <NumberField
            value={discount}
            onChange={setDiscount}
            min={0}
            max={100}
            step={5}
            placeholder="Enter discount..."
          />
        </div>
        <div className="pt-4 border-t">
          <div className="text-sm font-medium">Total: ${total}</div>
        </div>
      </div>
    );
  },
};

export const Temperature: Story = {
  render: () => {
    const [celsius, setCelsius] = useState<number | undefined>(20);
    const fahrenheit = celsius !== undefined ? (celsius * 9/5 + 32).toFixed(1) : undefined;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Celsius</label>
            <NumberField
              value={celsius}
              onChange={setCelsius}
              min={-273.15}
              max={100}
              step={0.5}
              placeholder="°C"
            />
          </div>
          <div className="mt-6">=</div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Fahrenheit</label>
            <div className="px-3 py-2 border rounded-md bg-muted">
              {fahrenheit !== undefined ? `${fahrenheit}°F` : '-'}
            </div>
          </div>
        </div>
      </div>
    );
  },
};