import React from 'react';
import { Label } from '@/render/components/ui/label';
import { Input } from '@/render/components/ui/input';
import { FormControlGroup } from '@/render/components/ui/form-control-group';
import type { PersonBirthDeathView } from '@cbdb/core';

interface BirthDeathDisplayProps {
  data: PersonBirthDeathView;
}

/**
 * BirthDeathDisplay - Read-only display of birth/death information
 * Replicates the "生卒年" tab from Access Person Browser
 * Matches the exact field layout of the Access form
 */
const BirthDeathDisplay: React.FC<BirthDeathDisplayProps> = ({ data }) => {

  return (
    <div className="space-y-4">
      {/* Basic Information Group */}
      <FormControlGroup title="基本資料 Basic Information">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">朝代</Label>
              <Input value={data.dynastyPinyin || ''} readOnly className="bg-muted h-8 w-24" />
              <Input value={data.dynastyChn || ''} readOnly className="bg-muted h-8 w-20" />
            </div>
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">郡望</Label>
              <Input value={data.choronym || ''} readOnly className="bg-muted h-8 w-24" />
              <Input value={data.choronymChn || ''} readOnly className="bg-muted h-8 w-20" />
            </div>
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">種族</Label>
              <Input value={data.ethnicity || ''} readOnly className="bg-muted h-8 w-24" />
              <Input value={data.ethnicityChn || '未詳'} readOnly className="bg-muted h-8 w-20" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">戶籍狀態</Label>
              <Input value={data.householdStatus || ''} readOnly className="bg-muted h-8 w-32" />
              <Input value={data.householdStatusChn || '未詳'} readOnly className="bg-muted h-8 w-20" />
            </div>
          </div>
        </div>
      </FormControlGroup>

      {/* Index Year Group */}
      <FormControlGroup title="指數年 Index Year">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3 min-w-fit">
            <Label className="text-sm whitespace-nowrap">指數年</Label>
            <Input value={data.indexYear || ''} readOnly className="bg-muted h-8 w-24" />
            <Input value={data.indexYearTypeDesc || ''} readOnly className="bg-muted h-8 w-40" />
            <Label className="text-sm whitespace-nowrap ml-2">據生年</Label>
          </div>
          <div className="flex items-center gap-3 min-w-fit flex-1">
            <Label className="text-sm whitespace-nowrap">Source ID</Label>
            <Input value={data.sourceId || ''} readOnly className="bg-muted h-8 flex-1 min-w-[200px]" />
          </div>
        </div>
      </FormControlGroup>

      {/* Birth Year Group */}
      <FormControlGroup title="生年 Birth Year">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">生年</Label>
              <Input value={data.birthYear || ''} readOnly className="bg-muted h-8 w-24" />
            </div>
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">生年時限</Label>
              <Input value={data.birthYearRange || ''} readOnly className="bg-muted h-8 w-32" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">生年年號</Label>
              <Input value={data.birthNianHaoChn || ''} readOnly className="bg-muted h-8 w-24" />
              <Input value={data.birthNianHaoYear || ''} readOnly className="bg-muted h-8 w-16" />
              <span className="text-sm">年</span>
            </div>
            <div className="flex items-center gap-2 min-w-fit">
              <Input value={data.birthMonth || ''} readOnly className="bg-muted h-8 w-16" placeholder="月" />
              <span className="text-sm">月</span>
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={data.birthIntercalary === true}
                  disabled
                  className="rounded border-gray-300"
                />
                <span className="text-sm">閏</span>
              </div>
              <Input value={data.birthDay || ''} readOnly className="bg-muted h-8 w-16" placeholder="日" />
              <span className="text-sm">日</span>
            </div>
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">日(干支)</Label>
              <Input value={data.birthDayGanzhi || ''} readOnly className="bg-muted h-8 w-24" />
            </div>
          </div>
        </div>
      </FormControlGroup>

      {/* Death Year Group */}
      <FormControlGroup title="卒年 Death Year">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">卒年</Label>
              <Input value={data.deathYear || ''} readOnly className="bg-muted h-8 w-24" />
            </div>
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">卒年時限</Label>
              <Input value={data.deathYearRange || ''} readOnly className="bg-muted h-8 w-32" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">卒年年號</Label>
              <Input value={data.deathNianHaoChn || ''} readOnly className="bg-muted h-8 w-24" />
              <Input value={data.deathNianHaoYear || ''} readOnly className="bg-muted h-8 w-16" />
              <span className="text-sm">年</span>
            </div>
            <div className="flex items-center gap-2 min-w-fit">
              <Input value={data.deathMonth || ''} readOnly className="bg-muted h-8 w-16" placeholder="月" />
              <span className="text-sm">月</span>
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={data.deathIntercalary === true}
                  disabled
                  className="rounded border-gray-300"
                />
                <span className="text-sm">閏</span>
              </div>
              <Input value={data.deathDay || ''} readOnly className="bg-muted h-8 w-16" placeholder="日" />
              <span className="text-sm">日</span>
            </div>
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">日(干支)</Label>
              <Input value={data.deathDayGanzhi || ''} readOnly className="bg-muted h-8 w-24" />
            </div>
          </div>

          {/* Age at Death Section */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">享年</Label>
              <Input value={data.deathAge || ''} readOnly className="bg-muted h-8 w-20" />
            </div>
            <div className="flex items-center gap-2 min-w-fit">
              <Label className="text-sm whitespace-nowrap">享年範圍</Label>
              <Input value={data.deathAgeRange || ''} readOnly className="bg-muted h-8 w-32" />
            </div>
          </div>
        </div>
      </FormControlGroup>

      {/* Floruit Years Group (Lifespan) */}
      <FormControlGroup title="在世年 Floruit Years">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-6">
            <div className="min-w-fit flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">在世始年</Label>
                <Input value={data.floruitEarliestYear || ''} readOnly className="bg-muted h-8 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">在世始年年號</Label>
                <Input value={data.floruitEarliestNianHaoChn || '未詳'} readOnly className="bg-muted h-8 w-24" />
                <Input value={data.floruitEarliestNianHaoYear || ''} readOnly className="bg-muted h-8 w-16" />
                <span className="text-sm">年</span>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">在世始年注</Label>
                <Input value={data.floruitEarliestNote || ''} readOnly className="bg-muted h-8 min-w-[150px] flex-1" />
              </div>
            </div>

            <div className="min-w-fit flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">在世終年</Label>
                <Input value={data.floruitLatestYear || ''} readOnly className="bg-muted h-8 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">在世終年年號</Label>
                <Input value={data.floruitLatestNianHaoChn || '未詳'} readOnly className="bg-muted h-8 w-24" />
                <Input value={data.floruitLatestNianHaoYear || ''} readOnly className="bg-muted h-8 w-16" />
                <span className="text-sm">年</span>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">在世終年注</Label>
                <Input value={data.floruitLatestNote || ''} readOnly className="bg-muted h-8 min-w-[150px] flex-1" />
              </div>
            </div>
          </div>
        </div>
      </FormControlGroup>
    </div>
  );
};

export default BirthDeathDisplay;