import React from 'react';
import { Building } from 'lucide-react';

const OfficesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Building className="size-8" />
          Official Positions
        </h2>
        <p className="text-muted-foreground mt-2">
          Explore historical official positions and government roles
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Office Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Central Government</h4>
              <p className="text-sm text-muted-foreground mt-1">Imperial court positions</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Local Administration</h4>
              <p className="text-sm text-muted-foreground mt-1">Provincial and county offices</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Military Ranks</h4>
              <p className="text-sm text-muted-foreground mt-1">Military positions and titles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficesPage;