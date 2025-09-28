import type { Meta, StoryObj } from '@storybook/react';
import { FormControlGroup } from './form-control-group';
import { Label } from './label';
import { Input } from './input';
import { Separator } from './separator';

const meta = {
  title: 'UI/FormControlGroup',
  component: FormControlGroup,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FormControlGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default FormControlGroup with birth year section from PersonBrowser
 */
export const BirthYearSection: Story = {
  render: () => {
    // Sample data matching Wang Anshi's birth information
    const data = {
      indexYear: 1021,
      indexYearTypeDesc: 'Based on Birth Year',
      sourceId: 'CBDB_001762',
      birthYear: 1021,
      birthYearRange: '',
      birthNianHaoChn: '天禧',
      birthNianHaoYear: 5,
      birthMonth: 12,
      birthDay: 18,
      birthIntercalary: false,
      birthDayGanzhi: '甲子',
    };

    return (
      <div className="max-w-4xl space-y-4">
        {/* Index Year and Source ID Section */}
        <FormControlGroup title="指數年 Index Year">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6 flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">指數年</Label>
              <Input value={data.indexYear || ''} readOnly className="bg-muted h-8 w-20" />
              <Input value={data.indexYearTypeDesc || ''} readOnly className="bg-muted h-8 flex-1" />
              <Label className="text-sm whitespace-nowrap">據生年</Label>
            </div>
            <div className="col-span-6 flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">Source ID</Label>
              <Input value={data.sourceId || ''} readOnly className="bg-muted h-8 flex-1" />
            </div>
          </div>
        </FormControlGroup>

        {/* Birth Year Section */}
        <FormControlGroup title="生年 Birth Year">
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-3 flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">生年</Label>
                <Input value={data.birthYear || ''} readOnly className="bg-muted h-8" />
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">生年時限</Label>
                <Input value={data.birthYearRange || ''} readOnly className="bg-muted h-8 flex-1" />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-2">
                <Label className="text-sm">生年年號</Label>
              </div>
              <div className="col-span-2">
                <Input value={data.birthNianHaoChn || ''} readOnly className="bg-muted h-8" />
              </div>
              <div className="col-span-1">
                <Input value={data.birthNianHaoYear || ''} readOnly className="bg-muted h-8" />
              </div>
              <div className="col-span-1 text-center">
                <span className="text-sm">年/月/日</span>
              </div>
              <div className="col-span-1 flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={data.birthIntercalary === true}
                  disabled
                  className="rounded border-gray-300"
                />
                <span className="text-sm">閏</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">日(干支)</Label>
                <Input value={data.birthDayGanzhi || ''} readOnly className="bg-muted h-8 flex-1" />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-2"></div>
              <div className="col-span-1">
                <Input value={data.birthMonth || ''} readOnly className="bg-muted h-8" placeholder="月" />
              </div>
              <div className="col-span-1">
                <Input value={data.birthDay || ''} readOnly className="bg-muted h-8" placeholder="日" />
              </div>
            </div>
          </div>
        </FormControlGroup>
      </div>
    );
  },
};

/**
 * FormControlGroup without title
 */
export const WithoutTitle: Story = {
  render: () => (
    <FormControlGroup>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Name</Label>
          <Input placeholder="Enter name" className="flex-1" />
        </div>
        <div className="flex items-center gap-2">
          <Label>Email</Label>
          <Input placeholder="Enter email" className="flex-1" />
        </div>
      </div>
    </FormControlGroup>
  ),
};

/**
 * Multiple FormControlGroups
 */
export const MultipleGroups: Story = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <FormControlGroup title="Personal Information">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="w-24">First Name</Label>
            <Input placeholder="John" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="w-24">Last Name</Label>
            <Input placeholder="Doe" />
          </div>
        </div>
      </FormControlGroup>

      <FormControlGroup title="Contact Details">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="w-24">Email</Label>
            <Input placeholder="john.doe@example.com" type="email" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="w-24">Phone</Label>
            <Input placeholder="+1 234 567 8900" type="tel" />
          </div>
        </div>
      </FormControlGroup>

      <FormControlGroup title="Address">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="w-24">Street</Label>
            <Input placeholder="123 Main St" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="w-24">City</Label>
            <Input placeholder="New York" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="w-24">ZIP Code</Label>
            <Input placeholder="10001" />
          </div>
        </div>
      </FormControlGroup>
    </div>
  ),
};