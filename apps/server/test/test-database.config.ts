import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as appSchema from '../src/db/schema';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Test configuration using real CBDB database
 * No mocking, no stubbing - test with real data
 * Uses Vitest as test runner
 *
 * We use the complete NestJS app but override only the APP database
 * to use in-memory SQLite for isolation, while keeping the real CBDB database
 */
export class TestDatabaseConfig {
  private static testDbPath = path.join(__dirname, '../../../cbdb_sql_db/latest.db');

  /**
   * Verify test database exists
   */
  static verifyTestDatabase(): void {
    if (!fs.existsSync(this.testDbPath)) {
      throw new Error(
        `Test database not found at ${this.testDbPath}. ` +
        'Please ensure cbdb_sql_db/latest.db exists.'
      );
    }
  }

  /**
   * Create a testing module with real database connection
   * Uses the complete app module but overrides the APP database to use in-memory SQLite
   */
  static async createTestingModule(): Promise<TestingModule> {
    this.verifyTestDatabase();

    // Set environment variables for testing
    process.env.CBDB_PATH = this.testDbPath;
    process.env.APP_DB_PATH = ':memory:'; // Use in-memory DB for app settings
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3001'; // Different port for testing

    // Create the testing module with the whole app
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Override the APP database connection to use in-memory SQLite
      .overrideProvider('APP_DB_CONNECTION')
      .useFactory({
        factory: async () => {
          // Create in-memory SQLite database for app data
          const client = createClient({
            url: ':memory:',
          });
          const db = drizzle(client, { schema: appSchema });

          // Create the app_settings table in memory
          await client.execute(`
            CREATE TABLE IF NOT EXISTS app_settings (
              id INTEGER PRIMARY KEY,
              last_used_cbdb_path TEXT,
              cbdb_opened_at TEXT,
              extracted_db_path TEXT,
              extracted_db_checksum TEXT,
              extracted_db_size INTEGER,
              extracted_at TEXT,
              theme TEXT DEFAULT 'light',
              language TEXT DEFAULT 'en',
              window_state TEXT,
              created_at TEXT DEFAULT (datetime('now', 'localtime')),
              updated_at TEXT DEFAULT (datetime('now', 'localtime'))
            )
          `);

          return db;
        },
      })
      .compile();

    return moduleRef;
  }

  /**
   * Clean up after tests
   */
  static async cleanup(module: TestingModule): Promise<void> {
    if (module) {
      await module.close();
    }
  }
}