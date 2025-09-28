import { Injectable, Inject } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { APP_DB_CONNECTION } from '../db/db.module';
import * as schema from '../db/schema';

@Injectable()
export class AppSettingsService {
  constructor(
    @Inject(APP_DB_CONNECTION)
    private db: LibSQLDatabase<typeof schema>,
  ) {
    // Initialize settings asynchronously, don't block constructor
    this.initializeSettings().catch(err => {
      console.error('Failed to initialize app settings:', err);
    });
  }

  /**
   * Initialize app settings with default row if it doesn't exist
   */
  private async initializeSettings() {
    const [existing] = await this.db
      .select()
      .from(schema.appSettings)
      .where(eq(schema.appSettings.id, 1));

    if (!existing) {
      await this.db.insert(schema.appSettings).values({
        id: 1,
        theme: 'light',
        language: 'en',
      });
    }
  }

  /**
   * Get app settings (always returns the single row)
   */
  async getSettings() {
    const [settings] = await this.db
      .select()
      .from(schema.appSettings)
      .where(eq(schema.appSettings.id, 1));

    return settings || this.getDefaultSettings();
  }

  /**
   * Update app settings
   */
  async updateSettings(updates: Partial<schema.AppSettings>) {
    const [updated] = await this.db
      .update(schema.appSettings)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.appSettings.id, 1))
      .returning();

    return updated;
  }

  /**
   * Set the last used CBDB path
   */
  async setLastUsedCbdbPath(path: string) {
    return this.updateSettings({
      lastUsedCbdbPath: path,
      cbdbOpenedAt: new Date().toISOString(),
    });
  }

  /**
   * Get recent CBDB files
   */
  async getRecentFiles(limit = 10) {
    return await this.db
      .select()
      .from(schema.recentFiles)
      .orderBy(schema.recentFiles.lastOpenedAt)
      .limit(limit);
  }

  /**
   * Add or update a recent file entry
   */
  async addRecentFile(filePath: string, fileName: string, fileSize?: number) {
    const [existing] = await this.db
      .select()
      .from(schema.recentFiles)
      .where(eq(schema.recentFiles.filePath, filePath));

    if (existing) {
      // Update existing entry
      return await this.db
        .update(schema.recentFiles)
        .set({
          lastOpenedAt: new Date().toISOString(),
          openCount: existing.openCount + 1,
        })
        .where(eq(schema.recentFiles.filePath, filePath))
        .returning();
    } else {
      // Create new entry
      return await this.db
        .insert(schema.recentFiles)
        .values({
          filePath,
          fileName,
          fileSize,
        })
        .returning();
    }
  }

  /**
   * Add search history entry
   */
  async addSearchHistory(
    searchQuery: string,
    searchType: string,
    resultsCount: number,
    cbdbPath?: string,
  ) {
    return await this.db
      .insert(schema.searchHistory)
      .values({
        searchQuery,
        searchType,
        resultsCount,
        cbdbPath,
      })
      .returning();
  }

  /**
   * Get search history
   */
  async getSearchHistory(limit = 50) {
    return await this.db
      .select()
      .from(schema.searchHistory)
      .orderBy(schema.searchHistory.searchedAt)
      .limit(limit);
  }

  private getDefaultSettings(): schema.AppSettings {
    return {
      id: 1,
      lastUsedCbdbPath: null,
      cbdbOpenedAt: null,
      extractedDbPath: null,
      extractedDbChecksum: null,
      extractedDbSize: null,
      extractedAt: null,
      theme: 'light',
      language: 'en',
      windowState: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}