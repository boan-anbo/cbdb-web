import React from 'react';
import { AssociationWithFullRelations } from '@cbdb/core';
import { FormControlGroup } from '@/render/components/ui/form-control-group';
import { Label } from '@/render/components/ui/label';
import { Input } from '@/render/components/ui/input';
import { Button } from '@/render/components/ui/button';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';
import { KinshipCodeDisplay } from '@/render/components/domain/KinshipCodeDisplay';

interface PersonAssociationsFormProps {
  association: AssociationWithFullRelations;
  currentIndex: number;
  totalAssociations: number;
  onNavigate: (direction: 'first' | 'prev' | 'next' | 'last') => void;
}

const PersonAssociationsForm: React.FC<PersonAssociationsFormProps> = ({
  association,
  currentIndex,
  totalAssociations,
  onNavigate
}) => {

  return (
    <div className="space-y-4">
      {/* Navigation and Control */}
      <FormControlGroup title="記錄導航 Record Navigation">
        <div className="space-y-3">
          {/* Paginator */}
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6 flex items-center gap-1">
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
              <div className="px-3 py-1 text-sm font-medium">
                {currentIndex + 1} / {totalAssociations}
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => onNavigate('next')}
                disabled={currentIndex === totalAssociations - 1}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => onNavigate('last')}
                disabled={currentIndex === totalAssociations - 1}
                className="h-8 w-8"
              >
                <ChevronLast className="h-4 w-4" />
              </Button>
            </div>
            <div className="col-span-2">
              <Label htmlFor="assoc-count" className="text-xs">數 Count</Label>
              <Input
                id="assoc-count"
                type="text"
                value={currentIndex + 1}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="assoc-order" className="text-xs">次序 Order</Label>
              <Input
                id="assoc-order"
                type="text"
                value={association.sequence || '0'}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
          </div>
        </div>
      </FormControlGroup>

      {/* Main Association Information */}
      <FormControlGroup title="社會關係資料 Association Information">
        <div className="space-y-3">
          {/* Section 1: Main Association */}
          <div className="pb-3 border-b">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Main Association</h4>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5">
                <Label htmlFor="assoc-person" className="text-xs">社會關係人 Associated Person</Label>
                <Input
                  id="assoc-person"
                  type="text"
                  value={association.assocPersonInfo?.name || ''}
                  readOnly
                  className="h-8 bg-muted/50"
                />
              </div>
              <div className="col-span-3">
                <Label htmlFor="assoc-person-chn" className="text-xs">中文名 Chinese Name</Label>
                <Input
                  id="assoc-person-chn"
                  type="text"
                  value={association.assocPersonInfo?.nameChn || ''}
                  readOnly
                  className="h-8 bg-muted/50"
                />
              </div>
              <div className="col-span-4">
                <Label htmlFor="assoc-type" className="text-xs">社會關係類別 Association Type</Label>
                <div className="flex gap-1">
                  <Input
                    id="assoc-type"
                    type="text"
                    value={association.associationTypeInfo?.assocType || ''}
                    readOnly
                    className="h-8 bg-muted/50 font-medium"
                    title={association.associationTypeInfo?.assocTypeDescChn || ''}
                  />
                  <Input
                    type="text"
                    value={association.associationTypeInfo?.assocTypeChn || ''}
                    readOnly
                    className="h-8 w-24 bg-muted/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Kinship Relations */}
          <div className="pb-3 border-b">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Kinship Relations</h4>
            <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3">
              <Label htmlFor="kinship-type" className="text-xs">
                親屬關係類別 Kinship Type
              </Label>
              <KinshipCodeDisplay
                code={association.kinshipCode}
                variant="form"
                showTooltip={true}
              />
            </div>
            <div className="col-span-5">
              <Label htmlFor="assoc-kin-name" className="text-xs">親戚姓名 Kin Name</Label>
              <div className="flex gap-1">
                <Input
                  id="assoc-kin-name"
                  type="text"
                  value={association.kinPersonInfo?.name || ''}
                  readOnly
                  className="h-8 bg-muted/50"
                />
                <Input
                  type="text"
                  value={association.kinPersonInfo?.nameChn || ''}
                  readOnly
                  className="h-8 bg-muted/50"
                />
              </div>
            </div>
            <div className="col-span-4">
              <Label htmlFor="assoc-kin-rel" className="text-xs">
                社會關係人親屬關係類別 Associated Person's Kinship
              </Label>
              <KinshipCodeDisplay
                code={association.assocKinshipCode}
                variant="form"
                showTooltip={true}
              />
            </div>
            </div>
          </div>

          {/* Section 3: Associated Person's Relations */}
          <div className="pb-3 border-b">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Associated Person's Relations</h4>
            <div className="grid grid-cols-12 gap-2">
            <div className="col-span-5">
              <Label htmlFor="assoc-person-kin" className="text-xs">社會關係人親戚姓名 Associated Person's Kin Name</Label>
              <Input
                id="assoc-person-kin"
                type="text"
                value={association.assocKinPersonInfo?.name || ''}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
            <div className="col-span-3">
              <Label htmlFor="assoc-person-kin-chn" className="text-xs">中文名 Chinese Name</Label>
              <Input
                id="assoc-person-kin-chn"
                type="text"
                value={association.assocKinPersonInfo?.nameChn || ''}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
            <div className="col-span-4">
              <Label htmlFor="assoc-claimer" className="text-xs">社會關係指證人姓名 Claimer Name</Label>
              <Input
                id="assoc-claimer"
                type="text"
                value={association.assocClaimerInfo?.name || ''}
                readOnly
                className="h-8 bg-muted/50"
              />
              <Input
                type="text"
                value={association.assocClaimerInfo?.nameChn || ''}
                readOnly
                className="h-8 mt-1 bg-muted/50"
              />
            </div>
            </div>
          </div>

          {/* Section 4: Location and Time */}
          <div className="pb-3 border-b">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Location and Time</h4>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6">
                <Label htmlFor="assoc-location" className="text-xs">社會關係發生地 Association Location</Label>
                <div className="flex gap-1">
                  <Input
                    id="assoc-location"
                    type="text"
                    value={association.addressInfo?.name || ''}
                    readOnly
                    className="h-8 bg-muted/50"
                  />
                  <Input
                    type="text"
                    value={association.addressInfo?.nameChn || ''}
                    readOnly
                    className="h-8 bg-muted/50"
                  />
                </div>
              </div>
              <div className="col-span-6">
                <Label htmlFor="assoc-year" className="text-xs">社會關係年份 Association Year</Label>
                <div className="flex gap-1">
                  <Input
                    id="assoc-year"
                    type="text"
                    value={association.firstYear || ''}
                    readOnly
                    className="h-8 w-24 bg-muted/50"
                  />
                  <span className="mx-2 self-center text-muted-foreground">to</span>
                  <Input
                    type="text"
                    value={association.lastYear || ''}
                    readOnly
                    className="h-8 w-24 bg-muted/50"
                    placeholder="End Year"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Dynasty and Era Details */}
          <div className="pb-3 border-b">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Dynasty and Era Details</h4>
            <div className="grid grid-cols-12 gap-1">
              <div className="col-span-2">
                <Label className="text-xs">起始年號 Start Era</Label>
                <Input
                  type="text"
                  value={association.firstYearNianHao?.nameChn || ''}
                  readOnly
                  className="h-8 bg-muted/50"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">年號年 Era Year</Label>
              <Input
                type="text"
                value={association.firstYearNhYear || ''}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
            <div className="col-span-1">
              <Label className="text-xs">月 Month</Label>
              <Input
                type="text"
                value={association.firstYearMonth || ''}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
            <div className="col-span-1">
              <Label className="text-xs">日 Day</Label>
              <Input
                type="text"
                value={association.firstYearDay || ''}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">結束年號 End Era</Label>
              <Input
                type="text"
                value={association.lastYearNianHao?.nameChn || ''}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">年號年 Era Year</Label>
              <Input
                type="text"
                value={association.lastYearNhYear || ''}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
            <div className="col-span-1">
              <Label className="text-xs">月 Month</Label>
              <Input
                type="text"
                value={association.lastYearMonth || ''}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
            <div className="col-span-1">
              <Label className="text-xs">日 Day</Label>
              <Input
                type="text"
                value={association.lastYearDay || ''}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
            </div>
          </div>
        </div>
      </FormControlGroup>

      {/* Additional Information */}
      <FormControlGroup title="補充信息 Additional Information">
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6">
              <Label htmlFor="academic-topic" className="text-xs">學術主題 Academic Topic</Label>
              <Input
                id="academic-topic"
                type="text"
                value={association.topicInfo?.topic || ''}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
            <div className="col-span-6">
              <Label htmlFor="assoc-occasion" className="text-xs">社會關係發生場合 Association Occasion</Label>
              <Input
                id="assoc-occasion"
                type="text"
                value={association.occasionInfo?.occasion || ''}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6">
              <Label htmlFor="institution" className="text-xs">就讀學校 Institution</Label>
              <div className="flex gap-1">
                <Input
                  id="institution"
                  type="text"
                  value={association.institutionInfo?.name || ''}
                  readOnly
                  className="h-8 bg-muted/50"
                />
                <Input
                  type="text"
                  value={association.institutionInfo?.nameChn || ''}
                  readOnly
                  className="h-8 bg-muted/50"
                />
              </div>
            </div>
            <div className="col-span-6">
              <Label htmlFor="literary-style" className="text-xs">作品的文學樣式 Literary Style</Label>
              <Input
                id="literary-style"
                type="text"
                value={association.literaryGenreInfo?.genre || ''}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="w-full">
              <Label htmlFor="work-title" className="text-xs">作品標題 Work Title</Label>
              <Input
                id="work-title"
                type="text"
                value={association.textTitle || ''}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
          </div>
        </div>
      </FormControlGroup>

      {/* Source Information */}
      <FormControlGroup title="文獻來源 Source Documentation">
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-4">
              <Label htmlFor="source-chn" className="text-xs">出處(中文) Source (Chinese)</Label>
              <Input
                id="source-chn"
                type="text"
                value={association.sourceInfo?.titleChn || ''}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
            <div className="col-span-4">
              <Label htmlFor="source-eng" className="text-xs">出處(英文) Source (English)</Label>
              <Input
                id="source-eng"
                type="text"
                value={association.sourceInfo?.title || ''}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
            <div className="col-span-4">
              <Label htmlFor="page" className="text-xs">頁碼/條目 Page/Entry</Label>
              <Input
                id="page"
                type="text"
                value={association.pages || ''}
                readOnly
                className="h-8 bg-muted/50"
              />
            </div>
          </div>

          <div className="w-full">
            <div>
              <Label htmlFor="notes" className="text-xs">注 Notes</Label>
              <textarea
                id="notes"
                value={association.notes || ''}
                readOnly
                className="w-full p-2 text-sm bg-secondary/50 rounded-md min-h-[60px]"
              />
            </div>
          </div>
        </div>
      </FormControlGroup>
    </div>
  );
};

export default PersonAssociationsForm;