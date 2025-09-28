import React from 'react';
import { CodeExample } from '../CodeExample';

const tableModelTypeScript = `export class PersonTableModel {
  // Primary key
  id: number;              // ← c_personid

  // Names - raw from BIOG_MAIN table
  name: string | null;     // ← c_name
  nameChn: string | null;  // ← c_name_chn
  surname: string | null;  // ← c_surname
  surnameChn: string | null; // ← c_surname_chn
  mingzi: string | null;   // ← c_mingzi

  // Gender (boolean kept as number)
  female: number;          // ← c_female

  // Birth information (raw codes/values)
  birthYear: number | null;        // ← c_birthyear
  birthYearNhCode: number | null;  // ← c_by_nh_code
  birthYearNhYear: number | null;  // ← c_by_nh_year
  birthYearRangeCode: number | null; // ← c_by_range

  // Death information (raw codes/values)
  deathYear: number | null;        // ← c_deathyear
  deathYearNhCode: number | null;  // ← c_dy_nh_code
  deathYearRangeCode: number | null; // ← c_dy_range

  // Dynasty and status codes
  dynastyCode: number | null;      // ← c_dy
  ethnicityCode: number | null;    // ← c_ethnicity_code

  // NO joins, NO descriptions - just raw DB fields
}`;

const tableModelSQL = `CREATE TABLE BIOG_MAIN (
  -- Primary key
  c_personid INTEGER NOT NULL,

  -- Names from database
  c_name CHAR(255),
  c_name_chn CHAR(255),
  c_surname CHAR(255),
  c_surname_chn CHAR(255),
  c_mingzi CHAR(255),

  -- Gender
  c_female BOOLEAN(2) NOT NULL,

  -- Birth information (codes)
  c_birthyear INTEGER,
  c_by_nh_code INTEGER,     -- Nian Hao (reign period) code
  c_by_nh_year INTEGER,     -- Year within reign period
  c_by_range INTEGER,       -- Year range code

  -- Death information
  c_deathyear INTEGER,
  c_dy_nh_code INTEGER,     -- Nian Hao code
  c_dy_range INTEGER,       -- Year range code

  -- Dynasty and status codes
  c_dy INTEGER,             -- Dynasty code
  c_ethnicity_code INTEGER, -- Ethnicity code

  -- Plus 30+ other fields...
);`;

const actualTableModelData = `{
  "id": 1762,
  "name": "Wang Anshi",
  "nameChn": "王安石",
  "surname": "Wang",
  "surnameChn": "王",
  "mingzi": "Anshi",

  "female": 0,

  "birthYear": 1021,
  "birthYearNhCode": 516,
  "birthYearNhYear": 5,
  "birthYearRangeCode": null,

  "deathYear": 1086,
  "deathYearNhCode": 530,
  "deathYearRangeCode": null,

  "dynastyCode": 15,
  "ethnicityCode": 0
}`;

export function TableModelLayer() {
  return (
    <div className="space-y-2">
      <div className="flex gap-3 p-2 rounded bg-muted/30">
        <div className="font-semibold text-sm min-w-[100px] text-primary">I. TableModel</div>
        <div className="text-sm flex-1">
          <div className="font-medium">Raw database representation</div>
          <div className="text-muted-foreground">Direct mapping of database tables, no joins</div>
        </div>
      </div>
      <div className="ml-4">
        <div className="grid grid-cols-2 gap-3">
          <CodeExample
            title="I.1 TableModel"
            subtitle="person.model.table.ts"
            language="typescript"
            code={tableModelTypeScript}
          />
          <CodeExample
            title="I.2 Schema"
            subtitle="BIOG_MAIN table"
            language="sql"
            code={tableModelSQL}
          />
        </div>
        <CodeExample
          title="Actual data example for PersonTableModel (Wang Anshi, ID: 1762)"
          language="json"
          code={actualTableModelData}
          fontSize="0.7rem"
        />
      </div>
    </div>
  );
}