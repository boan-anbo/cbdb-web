import React from 'react';
import { MapPin } from 'lucide-react';
import { Badge } from '@/render/components/ui/badge';
import {
  CBDBBlock,
  CBDBBlockActions,
  CBDBBlockContent,
  CBDBBlockHeader,
  CBDBBlockTitle,
} from '@/render/components/ui/cbdb-block';
import { Address } from '@cbdb/core';

interface AddressesBlockProps {
  addresses: Address[];
}

export const AddressesBlock: React.FC<AddressesBlockProps> = ({ addresses }) => {
  if (!addresses || addresses.length === 0) {
    return null;
  }

  return (
    <CBDBBlock collapsible defaultCollapsed={true} className="cbdb-detail-block">
      <CBDBBlockHeader className="text-xs">
        <CBDBBlockTitle className="flex items-center gap-2 text-xs">
          <MapPin className="h-3 w-3" />
          Addresses
        </CBDBBlockTitle>
        <CBDBBlockActions>
          {addresses.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {addresses.length}
            </Badge>
          )}
        </CBDBBlockActions>
      </CBDBBlockHeader>
      <CBDBBlockContent>
        <div className="space-y-2">
          {addresses.map((addr: any, idx) => {
            // Build compact info items
            const infoItems = [];

            // Add address type if exists and not 未詳
            if (addr.addrTypeChn && addr.addrTypeChn !== '未詳') {
              infoItems.push(addr.addrTypeChn);
            } else if (addr.addrType && addr.addrType !== '未詳') {
              infoItems.push(addr.addrType);
            }

            // Add period if exists (excluding -1 values)
            if ((addr.firstYear && addr.firstYear !== -1) ||
                (addr.lastYear && addr.lastYear !== -1)) {
              const firstYear = addr.firstYear && addr.firstYear !== -1 ? addr.firstYear : null;
              const lastYear = addr.lastYear && addr.lastYear !== -1 ? addr.lastYear : null;

              if (firstYear && lastYear) {
                infoItems.push(`${firstYear} - ${lastYear}`);
              } else if (firstYear) {
                infoItems.push(`from ${firstYear}`);
              } else if (lastYear) {
                infoItems.push(`until ${lastYear}`);
              }
            }

            // Add pages if exists and not section_id format
            if (addr.pages && !addr.pages.includes('section_id')) {
              infoItems.push(`p. ${addr.pages}`);
            }

            // Skip addresses with no meaningful name
            const addressName = addr.addrNameChn || addr.addrName;
            if (!addressName || addressName === '未詳') {
              return null;
            }

            return (
              <div key={idx} className="flex items-start gap-2 py-1.5 border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-medium text-xs">
                      {addressName}
                    </span>
                    {infoItems.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {infoItems.join(' • ')}
                      </span>
                    )}
                  </div>
                  {/* Only show notes if meaningful */}
                  {addr.notes && addr.notes !== '[n/a]' && !addr.notes.includes('LZL') && (
                    <div className="text-xs text-muted-foreground italic mt-0.5">
                      {addr.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CBDBBlockContent>
    </CBDBBlock>
  );
};