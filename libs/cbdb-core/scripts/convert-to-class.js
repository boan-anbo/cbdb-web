#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Script to convert TypeScript interfaces to classes with constructor parameters
 * Preserves JSDoc comments and converts fields to constructor parameters
 */

function convertInterfaceToClass(content) {
  // Match the interface declaration and its body
  const interfaceMatch = content.match(/export interface (\w+) \{([\s\S]*)\}/);
  if (!interfaceMatch) {
    console.log('No interface found');
    return content;
  }

  const className = interfaceMatch[1];
  const body = interfaceMatch[2];

  // Split body into lines for processing
  const lines = body.split('\n');
  const constructorParams = [];
  let currentComment = [];
  let sectionComment = '';

  for (let line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      continue;
    }

    // Handle section comments (like // Core identifiers)
    if (trimmed.startsWith('//') && !trimmed.startsWith('/**')) {
      sectionComment = line;
      continue;
    }

    // Start of JSDoc comment
    if (trimmed.startsWith('/**')) {
      currentComment = [line];
      continue;
    }

    // Continuation of JSDoc comment
    if (trimmed.startsWith('*')) {
      currentComment.push(line);
      continue;
    }

    // End of JSDoc comment with field declaration
    if (trimmed.endsWith(';')) {
      // Add section comment if exists
      if (sectionComment) {
        constructorParams.push(sectionComment);
        sectionComment = '';
      }

      // Add JSDoc comment
      if (currentComment.length > 0) {
        constructorParams.push(...currentComment);
      }

      // Convert field to constructor parameter
      const fieldMatch = trimmed.match(/^(\w+):\s*(.+);$/);
      if (fieldMatch) {
        const [, fieldName, fieldType] = fieldMatch;
        constructorParams.push(`    public ${fieldName}: ${fieldType},`);
      }

      currentComment = [];
    }
  }

  // Remove trailing comma from last parameter
  if (constructorParams.length > 0) {
    const lastParam = constructorParams[constructorParams.length - 1];
    if (lastParam.endsWith(',')) {
      constructorParams[constructorParams.length - 1] = lastParam.slice(0, -1);
    }
  }

  // Get the file header (everything before the interface)
  const headerMatch = content.match(/([\s\S]*?)export interface/);
  const header = headerMatch ? headerMatch[1] : '/**\n * Domain model\n */\n';

  // Build the class
  const classContent = `${header}export class ${className} {
  constructor(
${constructorParams.join('\n')}
  ) {}
}`;

  return classContent;
}

// Get file path from command line
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node convert-to-class.js <filepath>');
  process.exit(1);
}

// Read file
const content = fs.readFileSync(filePath, 'utf8');

// Convert
const converted = convertInterfaceToClass(content);

// Write back
fs.writeFileSync(filePath, converted, 'utf8');
console.log(`Converted ${path.basename(filePath)} to class`);