#!/usr/bin/env tsx

/**
 * Generate annotated schema documentation for CBDB database
 * Using Drizzle schema definitions with PHP backend insights
 */

import * as fs from 'fs';
import * as path from 'path';
import * as tables from '../test/schema/tables';
import { getTableName, getTableColumns } from 'drizzle-orm';

class SchemaDocGenerator {
  private outputPath: string;
  private tableSchemas: Record<string, any> = tables;

  constructor(outputPath: string) {
    this.outputPath = outputPath;
  }

  /**
   * Get all tables from Drizzle schema
   */
  private getTables(): string[] {
    return Object.keys(this.tableSchemas).filter(key => {
      // Filter out non-table exports
      const value = this.tableSchemas[key];
      try {
        if (value && typeof value === 'object') {
          // Check if it's a Drizzle table by trying to get its name
          const name = getTableName(value);
          return !!name;
        }
      } catch {
        // Not a table
      }
      return false;
    });
  }

  /**
   * Get column information from Drizzle table schema
   */
  private getTableInfo(tableName: string): any[] {
    const table = this.tableSchemas[tableName];
    if (!table) return [];

    const cols = getTableColumns(table);
    const columns: any[] = [];

    Object.entries(cols).forEach(([colName, colDef]: [string, any]) => {
      columns.push({
        name: colName,
        type: this.getDrizzleColumnType(colDef),
        notnull: colDef.notNull ? 1 : 0,
        dflt_value: colDef.default,
        pk: colDef.primaryKey ? 1 : 0
      });
    });

    return columns;
  }

  /**
   * Get column type from Drizzle column definition
   */
  private getDrizzleColumnType(colDef: any): string {
    const dataType = colDef.dataType || 'unknown';
    if (dataType === 'number') {
      if (colDef.columnType === 'SQLiteInteger') return 'INTEGER';
      if (colDef.columnType === 'SQLiteReal') return 'REAL';
      return 'NUMERIC';
    }
    if (dataType === 'string') return 'TEXT';
    return dataType.toUpperCase();
  }

  /**
   * Get index information from Drizzle table schema
   */
  private getIndexInfo(tableName: string): Set<string> {
    // For now, return empty set as we can't easily extract index info
    // without getTableConfig
    return new Set<string>();
  }

  /**
   * Get estimated row count for a table (from known data)
   */
  private getRowCount(tableName: string): number {
    // Known row counts from database exploration
    const knownCounts: Record<string, number> = {
      'BIOG_MAIN': 649533,
      'DYNASTIES': 20,
      'NIAN_HAO': 326,
      'ALTNAME_DATA': 244000,
      'KIN_DATA': 183000,
      'ASSOC_DATA': 598000,
      'POSTED_TO_OFFICE_DATA': 385000,
      'BIOG_TEXT_DATA': 205000,
      'BIOG_ADDR_DATA': 218000,
      'ADDRESSES': 15879,
      'OFFICE_CODES': 46802,
      'TEXT_CODES': 7569,
      'SOCIAL_INST': 2456
    };

    return knownCounts[tableName] || 0;
  }

  /**
   * Format column documentation
   */
  private formatColumn(col: any, isIndexed: boolean): string {
    const nullable = col.notnull === 0 ? 'NULL' : 'NOT NULL';
    const pk = col.pk === 1 ? '[PK]' : '';
    const indexed = isIndexed ? '[INDEXED]' : '';
    const flags = [pk, indexed].filter(f => f).join(' ');

    return `- ${col.name} (${col.type}, ${nullable})${flags ? ' ' + flags : ''}\n  [中文描述]\n  [English description]`;
  }

  /**
   * Get table category based on name patterns
   */
  private categorizeTable(tableKey: string): string {
    const tableObj = this.tableSchemas[tableKey];
    const tableName = tableObj ? getTableName(tableObj) : tableKey;
    if (tableName === 'BIOG_MAIN') return 'Core Tables';
    if (tableName.endsWith('_CODES')) return 'Code Tables (Reference Data)';
    if (tableName.endsWith('_DATA')) return 'Data Tables (Relationships)';
    if (tableName.startsWith('BIOG_')) return 'Biographical Tables';
    if (tableName.startsWith('TEXT_')) return 'Text Tables';
    if (tableName.startsWith('OFFICE_')) return 'Office Tables';
    if (tableName.startsWith('ADDRESS')) return 'Address Tables';
    if (tableName.startsWith('SOCIAL_')) return 'Social Institution Tables';
    if (tableName === 'DYNASTIES' || tableName === 'NIAN_HAO') return 'Temporal Tables';
    return 'Other Tables';
  }

  /**
   * Generate documentation
   */
  generateDocumentation(): void {
    const tables = this.getTables();
    const tablesByCategory: Map<string, string[]> = new Map();

    // Group tables by category
    for (const table of tables) {
      const category = this.categorizeTable(table);
      if (!tablesByCategory.has(category)) {
        tablesByCategory.set(category, []);
      }
      tablesByCategory.get(category)!.push(table);
    }

    // Start building documentation
    let doc = `# CBDB Database Schema Documentation

Generated: ${new Date().toISOString()}

## Overview

The China Biographical Database (CBDB) contains biographical information about approximately 650,000 individuals from Chinese history, primarily from the 7th through 19th centuries.

## Database Statistics

- Total Tables: ${tables.length}
- Database Size: ~1.7 GB
- Total Persons: ~649,533

## Naming Conventions

- c_ prefix: All column names use this prefix (legacy from MS Access)
- _DATA suffix: Junction/relationship tables containing associations
- _CODES suffix: Reference/lookup tables containing standardized values
- CAPS naming: Table names in uppercase (MS Access convention)

## Table Categories

`;

    // Sort categories for better organization
    const categoryOrder = [
      'Core Tables',
      'Biographical Tables',
      'Data Tables (Relationships)',
      'Code Tables (Reference Data)',
      'Text Tables',
      'Office Tables',
      'Address Tables',
      'Social Institution Tables',
      'Temporal Tables',
      'Other Tables'
    ];

    for (const category of categoryOrder) {
      if (!tablesByCategory.has(category)) continue;

      const categoryTables = tablesByCategory.get(category)!.sort();
      doc += `### ${category}\n\n`;

      for (const table of categoryTables) {
        const tableObj = this.tableSchemas[table];
        const tableName = tableObj ? getTableName(tableObj) : table;
        const info = this.getTableInfo(table);
        const indexedColumns = this.getIndexInfo(table);
        const rowCount = this.getRowCount(tableName);

        doc += `#### ${tableName}\n\n`;
        doc += `Row Count: ${rowCount.toLocaleString()}\n\n`;

        // Add PHP model reference if exists
        const phpModelName = this.getPhpModelName(table);
        if (phpModelName) {
          doc += `PHP Model: App\\${phpModelName}\n\n`;
        }

        doc += `Purpose: [TODO: Add table description]\n\n`;
        doc += `Columns:\n`;

        for (const col of info) {
          doc += this.formatColumn(col, indexedColumns.has(col.name)) + '\n';
        }

        doc += '\n';
        // Add relationship information placeholder
        doc += `Relationships:\n`;
        doc += `- [TODO: Add relationships from PHP model]\n\n`;

        doc += '---\n\n';
      }
    }

    // Add appendix with PHP model mappings
    doc += this.generatePhpModelAppendix();

    // Write to file
    fs.writeFileSync(this.outputPath, doc);
    console.log(`✅ Documentation generated: ${this.outputPath}`);
  }

  /**
   * Map table name to PHP model name
   */
  private getPhpModelName(tableKey: string): string | null {
    const tableObj = this.tableSchemas[tableKey];
    const tableName = tableObj ? getTableName(tableObj) : tableKey;
    const mappings: Record<string, string> = {
      'BIOG_MAIN': 'BiogMain',
      'DYNASTIES': 'Dynasty',
      'NIAN_HAO': 'NianHao',
      'ADDRESSES': 'AddressCode',
      'ALTNAME_DATA': null, // No direct model, accessed through BiogMain
      'ALTNAME_CODES': 'AltnameCode',
      'KIN_DATA': null, // Accessed through BiogMain
      'KINSHIP_CODES': 'KinshipCode',
      'ASSOC_DATA': null, // Accessed through BiogMain
      'ASSOC_CODES': 'AssocCode',
      'POSTED_TO_OFFICE_DATA': null, // Accessed through BiogMain
      'OFFICE_CODES': 'OfficeCode',
      'BIOG_ADDR_DATA': 'BiogAddr',
      'BIOG_ADDR_CODES': 'BiogAddrCode',
      'TEXT_CODES': 'TextCode',
      'BIOG_TEXT_DATA': null, // Accessed through BiogMain
      'TEXT_ROLE_CODES': 'TextRoleCode',
      'SOCIAL_INST': 'SocialInst',
      'BIOG_INST_DATA': null, // Accessed through BiogMain
      'BIOG_INST_CODES': 'BiogInstCode',
      'ETHNICITY_CODES': 'Ethnicity',
      'CHORONYM_CODES': 'ChoronymCode',
      'ENTRY_CODES': 'EntryCode',
      'STATUS_CODES': 'StatusCode',
      'EVENT_CODES': 'EventCode',
      'POSSESSION_ACT_CODES': 'PossessionActCode',
      'APPOINTMENT_CODES': 'AppointmentTypeCode',
      // Add more mappings as discovered
    };

    return mappings[tableName] || null;
  }

  /**
   * Generate PHP model appendix
   */
  private generatePhpModelAppendix(): string {
    return `## Appendix: PHP Model Relationships

### BiogMain Model Relationships

The central BiogMain model defines the following relationships:

\`\`\`php
// Dynasty relationships
dynasty() -> belongsTo(Dynasty)
birthYearNH() -> belongsTo(NianHao)
deathYearNH() -> belongsTo(NianHao)

// Name relationships
altnames() -> belongsToMany(AltnameCode) via ALTNAME_DATA

// Geographic relationships
addresses() -> belongsToMany(AddressCode) via BIOG_ADDR_DATA
biog_addresses() -> hasMany(BiogAddr)

// Social relationships
kinship() -> belongsToMany(KinshipCode) via KIN_DATA
assoc() -> belongsToMany(AssocCode) via ASSOC_DATA

// Career relationships
offices() -> belongsToMany(OfficeCode) via POSTED_TO_OFFICE_DATA
entries() -> belongsToMany(EntryCode) via ENTRY_DATA
statuses() -> belongsToMany(StatusCode) via STATUS_DATA

// Literary relationships
texts() -> belongsToMany(TextCode) via BIOG_TEXT_DATA
sources() -> belongsToMany(TextCode) via BIOG_SOURCE_DATA

// Institutional relationships
inst() -> belongsToMany(BiogInstCode) via BIOG_INST_DATA
\`\`\`

### Key Patterns

1. **Many-to-Many with Pivot Data**: Most relationships use \`withPivot()\` to access junction table metadata
2. **Self-Referential**: KIN_DATA and ASSOC_DATA link BIOG_MAIN to itself
3. **Temporal Data**: Most relationships include c_firstyear, c_lastyear in pivot
4. **Sequence Ordering**: Many relationships include c_sequence for proper ordering

`;
  }
}

// Main execution
const outputPath = path.join(__dirname, '../docs/SCHEMA_ANNOTATED.md');

const generator = new SchemaDocGenerator(outputPath);
generator.generateDocumentation();