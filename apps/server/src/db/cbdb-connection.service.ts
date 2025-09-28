import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { createClient, Client } from '@libsql/client';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import * as fs from 'fs';
import { envConfig } from '../config/env.config';

// Import the generated CBDB schema
import * as schema from './cbdb-schema/schema';

/**
 * Service to manage the connection to the CBDB SQLite database
 * The database path is provided via environment variable
 */
@Injectable()
export class CbdbConnectionService implements OnModuleInit {
  private readonly logger = new Logger(CbdbConnectionService.name);
  private client: Client | null = null;
  private db: LibSQLDatabase<typeof schema> | null = null;

  async onModuleInit() {
    await this.initialize();
  }

  private async initialize(): Promise<void> {
    const dbPath = envConfig.CBDB_PATH;

    // Skip initialization if no CBDB_PATH provided (Electron will handle it)
    if (!dbPath) {
      this.logger.log('CBDB_PATH not provided - skipping initialization (Electron mode)');
      return;
    }

    this.logger.log(`Initializing CBDB connection: ${dbPath}`);

    try {
      // Verify file exists
      if (!fs.existsSync(dbPath)) {
        this.logger.warn(`CBDB database file not found at: ${dbPath}`);
        this.logger.warn('Server will run without database - database extraction needed');
        console.log('CBDB database not found at:', dbPath);
        return; // Don't crash, allow server to start
      }

      // Check file is readable
      fs.accessSync(dbPath, fs.constants.R_OK);

      // Create libSQL client
      this.client = createClient({
        url: `file:${dbPath}`,
      });

      // Create Drizzle instance with schema
      this.db = drizzle(this.client, { schema });

      // Test connection by running a simple query
      await this.testConnection();

      this.logger.log('✅ CBDB connected successfully');
      await this.logDatabaseStats();
    } catch (error) {
      this.logger.error('Failed to connect to CBDB:', error);
      this.logger.warn('Server will run without database - database extraction needed');
      // Don't throw, allow server to start without database
    }
  }

  private async testConnection(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // Test with a simple query on a core table
      const result = await this.db
        .select()
        .from(schema.DYNASTIES)
        .limit(1);

      this.logger.debug('Connection test successful');
    } catch (error) {
      throw new Error(`Database connection test failed: ${error.message}`);
    }
  }

  private async logDatabaseStats(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      // Get some basic statistics
      const personCount = await this.client.execute(
        'SELECT COUNT(*) as count FROM BIOG_MAIN'
      );
      const dynastyCount = await this.client.execute(
        'SELECT COUNT(*) as count FROM DYNASTIES'
      );
      const officeCount = await this.client.execute(
        'SELECT COUNT(*) as count FROM OFFICE_CODES'
      );

      this.logger.log('Database Statistics:');
      this.logger.log(`  - Persons: ${personCount.rows[0].count}`);
      this.logger.log(`  - Dynasties: ${dynastyCount.rows[0].count}`);
      this.logger.log(`  - Offices: ${officeCount.rows[0].count}`);
    } catch (error) {
      this.logger.warn('Could not fetch database statistics:', error.message);
    }
  }

  /**
   * Get the Drizzle database instance
   * Throws if not initialized
   */
  getDb(): LibSQLDatabase<typeof schema> {
    if (!this.db) {
      throw new Error(
        'CBDB database not initialized. Please extract the database first.'
      );
    }
    return this.db;
  }

  /**
   * Get the raw libSQL client
   * Throws if not initialized
   */
  getClient(): Client {
    if (!this.client) {
      throw new Error(
        'CBDB client not initialized. Please extract the database first.'
      );
    }
    return this.client;
  }

  /**
   * Check if the database is connected
   */
  isConnected(): boolean {
    return this.db !== null && this.client !== null;
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.client) {
      // LibSQL client doesn't have a close method, but we can nullify references
      this.client = null;
      this.db = null;
      this.logger.log('CBDB connection closed');
    }
  }

  /**
   * Reconnect to the database
   * Useful if the database file changes
   * @param newPath Optional new database path
   */
  async reconnect(newPath?: string): Promise<void> {
    await this.close();

    // Update the path if provided
    if (newPath) {
      envConfig.CBDB_PATH = newPath;
    }

    await this.initialize();
  }
}