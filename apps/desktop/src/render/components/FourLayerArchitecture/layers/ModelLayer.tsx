import React from 'react';
import { CodeExample } from '../CodeExample';

const modelTypeScript = `// This is THE DEFAULT - what users and developers expect
export class PersonModel {
  // All fields from PersonTableModel
  id: number;
  name: string | null;
  nameChn: string | null;
  // ... all other TableModel fields

  // PLUS trivial joins for human-readable data
  // (typed as PersonDenormExtraDataView)
  dynastyNameChn: string | null;   // From DYNASTIES via c_dy
  dynastyName: string | null;      // From DYNASTIES.c_dynasty_pinyin

  birthYearNhNameChn: string | null; // From NIAN_HAO via c_by_nh_code
  deathYearNhNameChn: string | null; // From NIAN_HAO via c_dy_nh_code

  indexAddrNameChn: string | null;   // From ADDR_CODES via c_index_addr_id
  indexAddrName: string | null;      // From ADDR_CODES via c_index_addr_id
  // ... many more denormalized fields
}`;

const actualModelData = `{
  "id": 1762,
  "name": "Wang Anshi",
  "nameChn": "王安石",
  // ... all other TableModel fields

  "dynastyNameChn": "宋",        // in addition to dynastyCode: 15
  "dynastyName": "Song",

  "birthYearNhNameChn": "天禧",  // in addition to birthYearNhCode: 516
  "deathYearNhNameChn": "元祐",  // in addition to deathYearNhCode: 530

  "indexAddrNameChn": "臨川",    // in addition to indexAddrId: 100513
  "indexAddrName": "Linchuan"
  // ... many more denormalized fields
}`;

export function ModelLayer() {
  return (
    <div className="space-y-2">
      <div className="flex gap-3 p-2 rounded bg-muted/30">
        <div className="font-semibold text-sm min-w-[100px] text-primary">II. Model</div>
        <div className="text-sm flex-1">
          <div className="font-medium">The default human-readable denormalized model for entities (e.g., Person, Address, etc.)</div>
          <div className="text-muted-foreground">Utilizes pivotal code tables for fetching human-readable descriptions</div>
          <div className="text-muted-foreground">e.g., PersonModel = PersonTableModel + PersonDenormExtraDataView</div>
        </div>
      </div>
      <div className="ml-4">
        <CodeExample
          title=""
          subtitle="person.model.ts"
          language="typescript"
          code={modelTypeScript}
        />
        <CodeExample
          title="Actual data example for PersonModel (Wang Anshi, ID: 1762)"
          language="json"
          code={actualModelData}
          fontSize="0.7rem"
        />
      </div>
    </div>
  );
}