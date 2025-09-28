import React from 'react';
import { OfficeWithFullRelations } from '@cbdb/core';
import { FormControlGroup } from '@/render/components/ui/form-control-group';
import { Label } from '@/render/components/ui/label';
import { Input } from '@/render/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/render/components/ui/select';
import { Button } from '@/render/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Search, Filter } from 'lucide-react';

interface PersonOfficesFormProps {
  office?: OfficeWithFullRelations | null;
  currentIndex: number;
  totalOffices: number;
  onNavigate: (direction: 'first' | 'prev' | 'next' | 'last') => void;
}

/**
 * PersonOfficesForm - Recreates the Office form interface from Access
 * Displays detailed office appointment information with grouped form controls
 */
const PersonOfficesForm: React.FC<PersonOfficesFormProps> = ({
  office,
  currentIndex,
  totalOffices,
  onNavigate
}) => {
  if (!office) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No office data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Navigation and Control - Moved to top */}
      <FormControlGroup title="記錄導航 Record Navigation">
        <div className="space-y-3">
          {/* Paginator - First Line */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Record:</span>
            <Button
              size="icon"
              variant="outline"
              onClick={() => onNavigate('first')}
              disabled={currentIndex === 0}
              className="h-8 w-8"
            >
              <ChevronFirst className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => onNavigate('prev')}
              disabled={currentIndex === 0}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm font-medium">{currentIndex + 1} of {totalOffices}</span>
            <Button
              size="icon"
              variant="outline"
              onClick={() => onNavigate('next')}
              disabled={currentIndex === totalOffices - 1}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => onNavigate('last')}
              disabled={currentIndex === totalOffices - 1}
              className="h-8 w-8"
            >
              <ChevronLast className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter and Search - Second Line */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled className="h-8">
              <Filter className="h-4 w-4 mr-2" />
              No Filter
            </Button>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                className="pl-8 w-40 h-8"
                disabled
              />
            </div>
          </div>
        </div>
      </FormControlGroup>

      {/* Office Information Group */}
      <FormControlGroup title="職官資料 Office Information">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 min-w-fit flex-1">
              <Label className="text-sm whitespace-nowrap">Office</Label>
              <Input
                value={office.officeInfo?.nameChn || ''}
                readOnly
                className="bg-muted h-8 w-32"
              />
              <Input
                value={office.officeInfo?.name || ''}
                readOnly
                className="bg-muted h-8 w-40"
              />
            </div>
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">Category</Label>
              <Input
                value={office.officeInfo?.categoryChn || '未詳'}
                readOnly
                className="bg-muted h-8 w-24"
              />
            </div>
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm">Seq</Label>
              <Input
                type="number"
                value={office.sequence || ''}
                readOnly
                className="bg-muted h-8 w-16"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 min-w-fit flex-1">
              <Label className="text-sm whitespace-nowrap">Posting Type</Label>
              <Input
                value={office.appointmentInfo?.nameChn || '正授'}
                readOnly
                className="bg-muted h-8 w-24"
              />
              <Input
                value={office.appointmentInfo?.name || 'Regular Appointment'}
                readOnly
                className="bg-muted h-8 w-40"
              />
            </div>
            <div className="flex items-center gap-2 min-w-fit">
              <input
                type="checkbox"
                checked={!!office.assumeOfficeCode}
                disabled
                className="rounded border-gray-300"
              />
              <Label className="text-sm">Assumed Post?</Label>
            </div>
          </div>
        </div>
      </FormControlGroup>

      {/* Date Range - From */}
      <FormControlGroup title="任職起始 From">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">Range</Label>
            <Input
              type="number"
              value={office.firstYearRange || '0'}
              readOnly
              className="bg-muted h-8 w-20"
            />
            <span className="text-sm">之間</span>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm">Reign year</Label>
              <Input
                value={office.firstYearNianHao?.nameChn || '未詳'}
                readOnly
                className="bg-muted h-8 w-24"
              />
              <Input
                type="number"
                value={office.firstYearNhYear || '0'}
                readOnly
                className="bg-muted h-8 w-16"
              />
              <span className="text-sm">年</span>
            </div>
            <div className="flex items-center gap-2 min-w-fit">
              <Input
                value={office.firstYear || ''}
                readOnly
                className="bg-muted h-8 w-20"
                placeholder="年"
              />
              <Input
                value={office.firstYearMonth || ''}
                readOnly
                className="bg-muted h-8 w-16"
                placeholder="月"
              />
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={office.firstYearIntercalary === '1'}
                  disabled
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Intercalary</span>
              </div>
              <Input
                value={office.firstYearDay || ''}
                readOnly
                className="bg-muted h-8 w-16"
                placeholder="日"
              />
            </div>
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">Stem-branch</Label>
              <Input
                value={office.firstYearDayGz || ''}
                readOnly
                className="bg-muted h-8 w-24"
              />
            </div>
          </div>
        </div>
      </FormControlGroup>

      {/* Date Range - To */}
      <FormControlGroup title="任職結束 To">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">Range</Label>
            <Input
              type="number"
              value={office.lastYearRange || '0'}
              readOnly
              className="bg-muted h-8 w-20"
            />
            <span className="text-sm">之間</span>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm">Reign year</Label>
              <Input
                value={office.lastYearNianHao?.nameChn || '未詳'}
                readOnly
                className="bg-muted h-8 w-24"
              />
              <Input
                type="number"
                value={office.lastYearNhYear || '0'}
                readOnly
                className="bg-muted h-8 w-16"
              />
              <span className="text-sm">年</span>
            </div>
            <div className="flex items-center gap-2 min-w-fit">
              <Input
                value={office.lastYear || ''}
                readOnly
                className="bg-muted h-8 w-20"
                placeholder="年"
              />
              <Input
                value={office.lastYearMonth || ''}
                readOnly
                className="bg-muted h-8 w-16"
                placeholder="月"
              />
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={office.lastYearIntercalary === '1'}
                  disabled
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Intercalary</span>
              </div>
              <Input
                value={office.lastYearDay || ''}
                readOnly
                className="bg-muted h-8 w-16"
                placeholder="日"
              />
            </div>
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">Stem-branch</Label>
              <Input
                value={office.lastYearDayGz || ''}
                readOnly
                className="bg-muted h-8 w-24"
              />
            </div>
          </div>
        </div>
      </FormControlGroup>

      {/* Place Group */}
      <FormControlGroup title="任職地點 Place">
        <div className="flex items-center gap-2">
          <Label className="text-sm whitespace-nowrap">Place</Label>
          <Input
            value={office.postingAddress?.nameChn || '[未詳]'}
            readOnly
            className="bg-muted h-8 w-32"
          />
          <Input
            value={office.postingAddress?.name || '[Unknown]'}
            readOnly
            className="bg-muted h-8 w-40"
          />
          <Button size="icon" variant="outline" disabled className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </FormControlGroup>

      {/* Source Information */}
      <FormControlGroup title="文獻來源 Source Documentation">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 min-w-fit flex-1">
              <Label className="text-sm whitespace-nowrap">Source</Label>
              <Input
                value={office.sourceInfo?.titleChn || '宋人傳記資料索引(電子版)'}
                readOnly
                className="bg-muted h-8 flex-1 min-w-[200px]"
              />
              <Input
                value={office.sourceInfo?.title || 'Song ren zhuan ji zi liao suo yin (dian zi ban)'}
                readOnly
                className="bg-muted h-8 flex-1 min-w-[200px]"
              />
            </div>
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">Pages</Label>
              <Input
                value={office.pages || ''}
                readOnly
                className="bg-muted h-8 w-24"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Notes</Label>
            <textarea
              value={office.notes || ''}
              readOnly
              className="w-full min-h-[80px] p-2 border rounded-md bg-muted text-sm"
            />
          </div>
        </div>
      </FormControlGroup>
    </div>
  );
};

export default PersonOfficesForm;