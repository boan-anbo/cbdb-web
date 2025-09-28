/**
 * @cbdb/core - Core utilities and domain models for CBDB
 *
 * This package contains domain models, schemas, and mappers for CBDB.
 * This is used by both frontend and backend.
 */

// Export domains
export * from './domains/person';
export * from './domains/kinship';
export * from './domains/address';
export * from './domains/office';
export * from './domains/entry';
export * from './domains/status';
export * from './domains/association';
export * from './domains/text';
export * from './domains/altname';
export * from './domains/event';
export * from './domains/nianhao';
export * from './domains/server';
export * from './domains/graph';
export * from './domains/geographic';
export * from './domains/archive';
export * from './domains/timeline';

// Export common query interfaces
export * from './common/query.interfaces';
export * from './common/pagination.dto';
export * from './common/relation-stats';

// Export Drizzle schemas
export * from './schemas/schema';
export * from './schemas/extended';
export * from './schemas/relations';

// Export unified mapper
export { cbdbMapper } from './mappers/cbdbMapper';

// Export utilities
export * from './utils/type-conversions';

// Export environment schemas and utilities
export * from './env.schema';

// Re-export Zod for convenience
export { z, ZodError } from 'zod';
export type { ZodIssue } from 'zod';

// Export endpoint definitions
export * from './endpoints';

// Export type-safe client
export * from './client';

// Export React Query hooks
// TODO: Fix TypeScript errors in hooks before enabling
// export * from './hooks';