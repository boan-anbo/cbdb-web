import React from 'react';
import { Hash } from 'lucide-react';
import {
  CBDBBlock,
  CBDBBlockContent,
  CBDBBlockHeader,
  CBDBBlockTitle,
} from '@/render/components/ui/cbdb-block';

interface StatisticsBlockProps {
  stats?: any;
}

export const StatisticsBlock: React.FC<StatisticsBlockProps> = ({ stats }) => {
  if (!stats) {
    return null;
  }

  // Helper function to render a data field
  const renderField = (label: string, value: any, fallback: string = '—') => {
    if (!value && value !== 0) return null;
    return (
      <div className="flex justify-between items-start py-0.5">
        <span className="text-xs text-muted-foreground">{label}:</span>
        <span className="text-xs font-medium">{value || fallback}</span>
      </div>
    );
  };

  return (
    <CBDBBlock collapsible defaultCollapsed={true} className="cbdb-detail-block">
      <CBDBBlockHeader className="text-xs">
        <CBDBBlockTitle className="flex items-center gap-2 text-xs">
          <Hash className="h-3 w-3" />
          Relationship Statistics
        </CBDBBlockTitle>
      </CBDBBlockHeader>
      <CBDBBlockContent>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {stats.kinships &&
            renderField('Kinships', stats.kinships.count)}
          {stats.addresses &&
            renderField('Addresses', stats.addresses.count)}
          {stats.offices && renderField('Offices', stats.offices.count)}
          {stats.entries &&
            renderField('Entry Methods', stats.entries.count)}
          {stats.statuses &&
            renderField('Statuses', stats.statuses.count)}
          {stats.associations &&
            renderField('Associations', stats.associations.count)}
          {stats.texts && renderField('Texts', stats.texts.count)}
          {stats.events && renderField('Events', stats.events.count)}
          {stats.altNames &&
            renderField('Alt Names', stats.altNames.count)}
        </div>
      </CBDBBlockContent>
    </CBDBBlock>
  );
};