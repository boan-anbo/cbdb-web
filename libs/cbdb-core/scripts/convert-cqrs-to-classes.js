#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all CQRS files
const cqrsFiles = glob.sync('src/domains/*/messages/*.cqrs.ts', {
  cwd: path.join(__dirname, '..'),
  absolute: true
});

console.log(`Found ${cqrsFiles.length} CQRS files to process`);

cqrsFiles.forEach(file => {
  // Skip person.cqrs.ts as it's already converted
  if (file.includes('person.cqrs.ts')) {
    console.log(`Skipping ${path.basename(file)} (already converted)`);
    return;
  }

  console.log(`Processing ${path.basename(path.dirname(path.dirname(file)))}/${path.basename(file)}`);

  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Convert import type to import for domain models
  content = content.replace(/^import type \{ (\w+) \} from '@domains\/([\w-]+)\/models\/([\w-]+)\.model';$/gm,
    (match, modelName, domain, modelFile) => {
      modified = true;
      return `import { ${modelName} } from '@domains/${domain}/models/${modelFile}.model';`;
    });

  // Convert import type to import for common interfaces
  content = content.replace(/^import type \{([^}]+)\} from '@\/common\/query\.interfaces';$/gm,
    (match, imports) => {
      modified = true;
      return `import {${imports}} from '@/common/query.interfaces';`;
    });

  // Convert simple interfaces to classes (ones without extends)
  content = content.replace(/^export interface (\w+) \{([^}]+)\}/gm, (match, className, body) => {
    // Skip if it extends something
    if (body.includes('extends')) return match;

    // Parse fields
    const fields = body.trim().split('\n')
      .filter(line => line.includes(':'))
      .map(line => {
        const trimmed = line.trim().replace(/;$/, '');
        const optional = trimmed.includes('?');
        const fieldName = trimmed.split(':')[0].trim().replace('?', '');
        const fieldType = trimmed.split(':')[1].trim();
        return { name: fieldName, type: fieldType, optional };
      });

    if (fields.length === 0) return match;

    modified = true;

    // Build constructor
    const constructorParams = fields
      .map(f => `    public ${f.name}${f.optional ? '?' : ''}: ${f.type}`)
      .join(',\n');

    return `export class ${className} {
  constructor(
${constructorParams}
  ) {}
}`;
  });

  // Convert interfaces that extend single class
  content = content.replace(/^export interface (\w+) extends (\w+)<([^>]+)> \{([^}]*)\}/gm,
    (match, className, baseClass, genericType, body) => {
      const extraFields = body.trim()
        .split('\n')
        .filter(line => line.includes(':'))
        .map(line => {
          const trimmed = line.trim().replace(/;$/, '');
          const optional = trimmed.includes('?');
          const fieldName = trimmed.split(':')[0].trim().replace('?', '');
          const fieldType = trimmed.split(':').slice(1).join(':').trim();
          return { name: fieldName, type: fieldType, optional };
        });

      modified = true;

      if (extraFields.length === 0) {
        // No extra fields, just extend
        return `export class ${className} extends ${baseClass}<${genericType}> {}`;
      }

      // Need to call super() - check which base class it is
      let superParams = '';
      if (baseClass === 'ListResult') {
        superParams = 'data, total';
      } else if (baseClass === 'SingleResult') {
        superParams = 'data';
      } else if (baseClass === 'PaginatedResult') {
        superParams = 'data, pagination';
      } else if (baseClass === 'GroupedByTypeResult') {
        superParams = 'data, types';
      }

      const constructorParams = extraFields
        .map(f => `    public ${f.name}${f.optional ? '?' : ''}: ${f.type}`)
        .join(',\n');

      // For ListResult, we need data and total params
      let baseParams = '';
      if (baseClass === 'ListResult') {
        baseParams = `    data: ${genericType}[],
    total: number,\n`;
      } else if (baseClass === 'SingleResult') {
        baseParams = `    data: ${genericType} | null,\n`;
      }

      return `export class ${className} extends ${baseClass}<${genericType}> {
  constructor(
${baseParams}${constructorParams}
  ) {
    super(${superParams});
  }
}`;
    });

  // Convert interfaces that extend BaseQuery
  content = content.replace(/^export interface (\w+) extends BaseQuery \{([^}]*)\}/gm,
    (match, className, body) => {
      const extraFields = body.trim()
        .split('\n')
        .filter(line => line.includes(':'))
        .map(line => {
          const trimmed = line.trim().replace(/;$/, '');
          const optional = trimmed.includes('?');
          const fieldName = trimmed.split(':')[0].trim().replace('?', '');
          const fieldType = trimmed.split(':').slice(1).join(':').trim();
          return { name: fieldName, type: fieldType, optional };
        });

      modified = true;

      const allFields = [
        ...extraFields,
        { name: 'start', type: 'number', optional: true },
        { name: 'limit', type: 'number', optional: true }
      ];

      const constructorParams = allFields
        .map(f => `    public ${f.name}${f.optional ? '?' : ''}: ${f.type}`)
        .join(',\n');

      return `export class ${className} extends BaseQuery {
  constructor(
${constructorParams}
  ) {
    super(start, limit);
  }
}`;
    });

  // Convert interfaces that extend multiple (BaseQuery, DateRangeFilter)
  content = content.replace(/^export interface (\w+) extends BaseQuery, DateRangeFilter \{([^}]*)\}/gm,
    (match, className, body) => {
      const extraFields = body.trim()
        .split('\n')
        .filter(line => line.includes(':'))
        .map(line => {
          const trimmed = line.trim().replace(/;$/, '');
          const optional = trimmed.includes('?');
          const fieldName = trimmed.split(':')[0].trim().replace('?', '');
          const fieldType = trimmed.split(':').slice(1).join(':').trim();
          return { name: fieldName, type: fieldType, optional };
        });

      modified = true;

      const allFields = [
        ...extraFields,
        { name: 'start', type: 'number', optional: true },
        { name: 'limit', type: 'number', optional: true },
        { name: 'startYear', type: 'number', optional: true },
        { name: 'endYear', type: 'number', optional: true }
      ];

      const constructorParams = allFields
        .map(f => `    public ${f.name}${f.optional ? '?' : ''}: ${f.type}`)
        .join(',\n');

      return `export class ${className} extends BaseQuery implements DateRangeFilter {
  constructor(
${constructorParams}
  ) {
    super(start, limit);
  }
}`;
    });

  // Convert interfaces that extend SearchQuery
  content = content.replace(/^export interface (\w+) extends SearchQuery \{([^}]*)\}/gm,
    (match, className, body) => {
      const extraFields = body.trim()
        .split('\n')
        .filter(line => line.includes(':') && !line.includes('//'))
        .map(line => {
          const trimmed = line.trim().replace(/;$/, '');
          const optional = trimmed.includes('?');
          const fieldName = trimmed.split(':')[0].trim().replace('?', '');
          const fieldType = trimmed.split(':').slice(1).join(':').trim();
          return { name: fieldName, type: fieldType, optional };
        });

      modified = true;

      if (extraFields.length === 0) {
        // No extra fields
        return `export class ${className} extends SearchQuery {}`;
      }

      const allFields = [
        { name: 'query', type: 'string', optional: false },
        ...extraFields,
        { name: 'accurate', type: 'boolean', optional: true },
        { name: 'start', type: 'number', optional: true },
        { name: 'limit', type: 'number', optional: true }
      ];

      const constructorParams = allFields
        .map(f => `    public ${f.name}${f.optional ? '?' : ''}: ${f.type}`)
        .join(',\n');

      return `export class ${className} extends SearchQuery {
  constructor(
${constructorParams}
  ) {
    super(query, accurate, start, limit);
  }
}`;
    });

  if (modified) {
    fs.writeFileSync(file, content);
    console.log(`  ✓ Converted interfaces to classes`);
  }
});

console.log('Done!');