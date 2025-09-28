import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../drizzle/schema';

export class CBDBDatabase {
  private db;
  private client;

  constructor(dbPath: string) {
    // libsql works with file:// URLs for local SQLite files
    const url = dbPath.startsWith('file://') ? dbPath : `file://${dbPath}`;

    this.client = createClient({
      url: url,
    });

    this.db = drizzle(this.client, { schema });
  }

  get tables() {
    return schema;
  }

  get query() {
    return this.db;
  }

  close() {
    // libsql client doesn't require explicit close for file databases
    // but we keep the method for API compatibility
  }
}

// Export all schema types
export * from '../drizzle/schema';