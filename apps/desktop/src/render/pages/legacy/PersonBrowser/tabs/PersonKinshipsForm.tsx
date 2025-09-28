import React from 'react';
import { KinshipResponse } from '@cbdb/core';
import { FormControlGroup } from '@/render/components/ui/form-control-group';
import { Label } from '@/render/components/ui/label';
import { Input } from '@/render/components/ui/input';
import { Button } from '@/render/components/ui/button';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';
import { KinshipCodeDisplay } from '@/render/components/domain/KinshipCodeDisplay';

interface PersonKinshipsFormProps {
  kinship: KinshipResponse;
  currentIndex: number;
  totalKinships: number;
  onNavigate: (direction: 'first' | 'prev' | 'next' | 'last') => void;
}

const PersonKinshipsForm: React.FC<PersonKinshipsFormProps> = ({
  kinship,
  currentIndex,
  totalKinships,
  onNavigate
}) => {
  return (
    <div className="space-y-4">
      {/* Navigation and Control */}
      <FormControlGroup title="記錄導航 Record Navigation">
        <div className="space-y-3">
          {/* Paginator */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-1 min-w-fit">
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
                Record: {currentIndex + 1} of {totalKinships}
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => onNavigate('next')}
                disabled={currentIndex === totalKinships - 1}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => onNavigate('last')}
                disabled={currentIndex === totalKinships - 1}
                className="h-8 w-8"
              >
                <ChevronLast className="h-4 w-4" />
              </Button>
            </div>
            <div className="min-w-fit">
              <Label htmlFor="search-filter" className="text-xs">搜尋 Search</Label>
              <Input
                id="search-filter"
                type="text"
                placeholder="Filter..."
                className="h-8 w-40"
              />
            </div>
          </div>
        </div>
      </FormControlGroup>

      {/* Main Kinship Information */}
      <FormControlGroup title="親屬關係資料 Kinship Relation Information">
        <div className="space-y-3">
          {/* First Row: Kinship Type and Related Person */}
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[150px]">
              <Label htmlFor="kinship-type" className="text-xs">
                親屬關係類別 Kinship Type
              </Label>
              {kinship.kinshipTypeInfo ? (
                <div className="space-y-1">
                  <Input
                    id="kinship-type-code"
                    type="text"
                    value={kinship.kinshipTypeInfo.kinshipType || 'U'}
                    readOnly
                    className="bg-muted/50 h-8"
                  />
                  <Input
                    id="kinship-type-desc"
                    type="text"
                    value={kinship.kinshipTypeInfo.kinshipTypeChn || '未詳'}
                    readOnly
                    className="bg-muted/50 h-8"
                  />
                </div>
              ) : (
                <KinshipCodeDisplay
                  code={kinship.kinshipCode}
                  variant="form"
                  readOnly
                />
              )}
            </div>
            <div className="min-w-[200px] flex-1">
              <Label htmlFor="related-name-chn" className="text-xs">
                親戚姓名 Related Person (Chinese)
              </Label>
              <Input
                id="related-name-chn"
                type="text"
                value={kinship.kinPersonInfo?.nameChn || '未詳'}
                readOnly
                className="bg-muted/50 h-8"
              />
            </div>
            <div className="min-w-[200px] flex-1">
              <Label htmlFor="related-name-eng" className="text-xs">
                親戚名 Related Person (English)
              </Label>
              <Input
                id="related-name-eng"
                type="text"
                value={kinship.kinPersonInfo?.name || ''}
                readOnly
                className="bg-muted/50 h-8"
              />
            </div>
            <div className="min-w-[100px]">
              <Label htmlFor="related-id" className="text-xs">
                親戚ID Person ID
              </Label>
              <Input
                id="related-id"
                type="text"
                value={kinship.kinPersonId || ''}
                readOnly
                className="bg-muted/50 h-8"
              />
            </div>
            <div className="min-w-[80px]">
              <Label htmlFor="gen-value-1" className="text-xs">
                先世值
              </Label>
              <Input
                id="gen-value-1"
                type="text"
                value={'0'}
                readOnly
                className="bg-muted/50 h-8"
              />
            </div>
            <div className="min-w-[80px]">
              <Label htmlFor="gen-value-2" className="text-xs">
                後世值
              </Label>
              <Input
                id="gen-value-2"
                type="text"
                value={'1'}
                readOnly
                className="bg-muted/50 h-8"
              />
            </div>
          </div>

          {/* Second Row: Birth/Death Years and Index Year */}
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[120px]">
              <Label htmlFor="birth-year" className="text-xs">
                生年 Birth Year
              </Label>
              <Input
                id="birth-year"
                type="text"
                value={kinship.kinPersonInfo?.birthYear || ''}
                readOnly
                className="bg-muted/50 h-8"
              />
            </div>
            <div className="min-w-[120px]">
              <Label htmlFor="death-year" className="text-xs">
                卒年 Death Year
              </Label>
              <Input
                id="death-year"
                type="text"
                value={kinship.kinPersonInfo?.deathYear || ''}
                readOnly
                className="bg-muted/50 h-8"
              />
            </div>
            <div className="min-w-[120px]">
              <Label htmlFor="index-year" className="text-xs">
                指數年 Index Year
              </Label>
              <Input
                id="index-year"
                type="text"
                value={kinship.kinPersonInfo?.indexYear || ''}
                readOnly
                className="bg-muted/50 h-8"
              />
            </div>
          </div>

          {/* Third Row: Source Information */}
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[250px] flex-1">
              <Label htmlFor="source" className="text-xs">
                出處 Source
              </Label>
              <Input
                id="source"
                type="text"
                value={kinship.source || ''}
                readOnly
                className="bg-muted/50 h-8"
              />
            </div>
            <div className="min-w-[100px]">
              <Label htmlFor="pages" className="text-xs">
                頁碼 Pages
              </Label>
              <Input
                id="pages"
                type="text"
                value={kinship.pages || ''}
                readOnly
                className="bg-muted/50 h-8"
              />
            </div>
          </div>

          {/* Fourth Row: Notes */}
          <div className="w-full">
            <Label htmlFor="notes" className="text-xs">
              註 Notes
            </Label>
            <textarea
              id="notes"
              value={kinship.notes || ''}
              readOnly
              className="w-full min-h-[60px] px-3 py-2 text-sm bg-muted/50 border border-input rounded-md"
            />
          </div>

          {/* Fifth Row: Metadata */}
          <div className="flex flex-wrap gap-3 pt-2 border-t">
            <div className="min-w-[150px] flex-1">
              <Label htmlFor="created-by" className="text-xs text-muted-foreground">
                Created By
              </Label>
              <Input
                id="created-by"
                type="text"
                value={kinship.createdBy || ''}
                readOnly
                className="bg-muted/50 text-xs h-8"
              />
            </div>
            <div className="min-w-[150px] flex-1">
              <Label htmlFor="created-date" className="text-xs text-muted-foreground">
                Created Date
              </Label>
              <Input
                id="created-date"
                type="text"
                value={kinship.createdDate || ''}
                readOnly
                className="bg-muted/50 text-xs h-8"
              />
            </div>
            <div className="min-w-[150px] flex-1">
              <Label htmlFor="modified-by" className="text-xs text-muted-foreground">
                Modified By
              </Label>
              <Input
                id="modified-by"
                type="text"
                value={kinship.modifiedBy || ''}
                readOnly
                className="bg-muted/50 text-xs h-8"
              />
            </div>
            <div className="min-w-[150px] flex-1">
              <Label htmlFor="modified-date" className="text-xs text-muted-foreground">
                Modified Date
              </Label>
              <Input
                id="modified-date"
                type="text"
                value={kinship.modifiedDate || ''}
                readOnly
                className="bg-muted/50 text-xs h-8"
              />
            </div>
          </div>
        </div>
      </FormControlGroup>
    </div>
  );
};

export default PersonKinshipsForm;