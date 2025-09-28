import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as appSchema from './schema';
import * as fs from 'fs';
import * as path from 'path';
import { initializeAppSchema } from './init-app-schema';
// Archive extraction is handled by Electron, not server

export const APP_DB_CONNECTION = 'APP_DB_CONNECTION';
export const CBDB_CONNECTION = 'CBDB_CONNECTION';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: APP_DB_CONNECTION,
      useFactory: async (configService: ConfigService) => {
        // Get APP_DB_PATH from environment
        const appDbPath = configService.get<string>('APP_DB_PATH') || './cbdb-desktop.db';

        // Ensure directory exists
        const dbDir = path.dirname(appDbPath);
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }

        // App database for storing application state, settings, etc.
        const client = createClient({
          url: `file:${appDbPath}`,
        });

        const db = drizzle(client);

        // Check if tables need to be created or migrated
        try {
          // Try to query with the new schema - if it fails, the schema is outdated
          const testQuery = await client.execute(
            "SELECT extracted_db_path FROM app_settings LIMIT 1"
          ).catch(() => null);

          if (testQuery === null) {
            console.log('Outdated APP database schema detected. Recreating database...');

            // Close the connection and delete the corrupt database
            client.close();

            // Delete the old database file
            if (fs.existsSync(appDbPath)) {
              fs.unlinkSync(appDbPath);
              console.log(`Deleted corrupt database at: ${appDbPath}`);
            }

            // Recreate the client connection
            const newClient = createClient({
              url: `file:${appDbPath}`,
            });

            // Initialize with fresh schema
            await initializeAppSchema(newClient);
            console.log('✅ APP database recreated with updated schema');

            // Update the db connection
            return drizzle(newClient);
          } else {
            console.log(`✅ APP database connected at: ${appDbPath}`);
          }
        } catch (error) {
          console.error('Error checking database schema:', error);

          // If there's any error, recreate the database
          console.log('Database error detected. Recreating database...');
          client.close();

          if (fs.existsSync(appDbPath)) {
            fs.unlinkSync(appDbPath);
          }

          const newClient = createClient({
            url: `file:${appDbPath}`,
          });

          await initializeAppSchema(newClient);
          console.log('✅ APP database recreated after error');

          return drizzle(newClient);
        }

        return db;
      },
      inject: [ConfigService],
    },
    {
      provide: CBDB_CONNECTION,
      useFactory: async (configService: ConfigService) => {
        // User's CBDB database - path provided at runtime
        const cbdbPath = configService.get<string>('CBDB_PATH');

        if (!cbdbPath) {
          return null; // Will be set when user opens a CBDB file
        }

        // Electron handles archive extraction, server only works with extracted DBs
        if (cbdbPath.endsWith('.7z')) {
          console.warn('Server does not handle archives. Please extract in Electron first.');
          return null;
        }

        // Verify the database file exists
        if (!fs.existsSync(cbdbPath)) {
          console.error(`CBDB database not found at: ${cbdbPath}`);
          return null;
        }

        const client = createClient({
          url: `file:${cbdbPath}`,
        });

        // Note: CBDB schema will be defined separately based on the actual CBDB structure
        return drizzle(client);
      },
      inject: [ConfigService],
    },
  ],
  exports: [APP_DB_CONNECTION, CBDB_CONNECTION],
})
export class DbModule {
  static forRoot(options?: { cbdbPath?: string }): typeof DbModule {
    if (options?.cbdbPath) {
      // Override the CBDB_PATH for testing
      process.env.CBDB_PATH = options.cbdbPath;
    }
    return DbModule;
  }
}