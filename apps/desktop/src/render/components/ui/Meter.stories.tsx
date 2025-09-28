import type { Meta, StoryObj } from '@storybook/react';
import { Meter, MeterSegmented } from './meter';

const meta = {
  title: 'UI/Meter',
  component: Meter,
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
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 60,
  },
};

export const WithLabel: Story = {
  args: {
    value: 75,
    label: 'Progress',
  },
};

export const ShowValue: Story = {
  args: {
    value: 42,
    max: 100,
    showValue: true,
  },
};

export const LabelAndValue: Story = {
  args: {
    value: 85,
    max: 100,
    label: 'Storage Used',
    showValue: true,
  },
};

export const CustomRange: Story = {
  args: {
    value: 250,
    min: 0,
    max: 500,
    label: 'Speed (km/h)',
    showValue: true,
  },
};

export const LowValue: Story = {
  args: {
    value: 20,
    max: 100,
    label: 'Battery',
    showValue: true,
  },
};

export const MediumValue: Story = {
  args: {
    value: 50,
    max: 100,
    label: 'Memory Usage',
    showValue: true,
  },
};

export const HighValue: Story = {
  args: {
    value: 85,
    max: 100,
    label: 'CPU Usage',
    showValue: true,
  },
};

export const WithThresholds: Story = {
  args: {
    value: 45,
    min: 0,
    max: 100,
    low: 30,
    high: 70,
    optimum: 50,
    label: 'Performance Score',
    showValue: true,
  },
};

export const OptimumLow: Story = {
  args: {
    value: 15,
    min: 0,
    max: 100,
    low: 30,
    high: 70,
    optimum: 10,
    label: 'Error Rate',
    showValue: true,
  },
};

export const OptimumHigh: Story = {
  args: {
    value: 85,
    min: 0,
    max: 100,
    low: 30,
    high: 70,
    optimum: 90,
    label: 'Success Rate',
    showValue: true,
  },
};

export const Segmented: Story = {
  render: () => <MeterSegmented value={60} segments={5} />,
};

export const SegmentedWithLabel: Story = {
  render: () => (
    <MeterSegmented
      value={75}
      segments={10}
      label="Skill Level"
      showValue={true}
    />
  ),
};

export const SegmentedCustomColors: Story = {
  render: () => (
    <MeterSegmented
      value={7}
      segments={10}
      max={10}
      label="Rating"
      showValue={true}
      filledColor="bg-yellow-500"
      emptyColor="bg-gray-200"
    />
  ),
};

export const SegmentedPartialFill: Story = {
  render: () => (
    <MeterSegmented
      value={65}
      segments={8}
      label="Progress"
      showValue={true}
    />
  ),
};

export const MultipleMeters: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">System Resources</h3>
        <div className="space-y-3">
          <Meter value={45} label="CPU" showValue={true} />
          <Meter value={72} label="Memory" showValue={true} />
          <Meter value={28} label="Disk" showValue={true} />
          <Meter value={91} label="Network" showValue={true} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Skills Assessment</h3>
        <div className="space-y-3">
          <MeterSegmented value={8} segments={10} max={10} label="JavaScript" showValue={true} />
          <MeterSegmented value={6} segments={10} max={10} label="Python" showValue={true} />
          <MeterSegmented value={9} segments={10} max={10} label="React" showValue={true} />
          <MeterSegmented value={5} segments={10} max={10} label="Node.js" showValue={true} />
        </div>
      </div>
    </div>
  ),
};

export const BatteryIndicator: Story = {
  render: () => {
    const batteryLevel = 35;
    return (
      <div className="space-y-2">
        <Meter
          value={batteryLevel}
          low={20}
          high={80}
          optimum={100}
          label="Battery Level"
          showValue={true}
        />
        <p className="text-sm text-muted-foreground">
          {batteryLevel < 20 && "⚠️ Low battery - please charge soon"}
          {batteryLevel >= 20 && batteryLevel <= 80 && "Battery level normal"}
          {batteryLevel > 80 && "✅ Battery fully charged"}
        </p>
      </div>
    );
  },
};

export const PasswordStrength: Story = {
  render: () => {
    const strength = 3;
    const maxStrength = 5;
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

    return (
      <div className="space-y-2">
        <MeterSegmented
          value={strength}
          segments={maxStrength}
          max={maxStrength}
          label="Password Strength"
          filledColor={
            strength <= 1 ? "bg-red-500" :
            strength <= 2 ? "bg-orange-500" :
            strength <= 3 ? "bg-yellow-500" :
            strength <= 4 ? "bg-blue-500" :
            "bg-green-500"
          }
        />
        <p className="text-sm font-medium">{labels[strength - 1]}</p>
      </div>
    );
  },
};