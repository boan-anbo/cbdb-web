import { Injectable } from '@nestjs/common';
import { HealthCheckQuery, HealthCheckResult, HealthPingQuery, HealthPingResult } from '@cbdb/core';
import { CbdbConnectionService } from '../db/cbdb-connection.service';
import { envConfig } from '../config/env.config';
import * as fs from 'fs';

@Injectable()
export class HealthService {
  private startTime: Date;

  constructor(private readonly cbdbConnection: CbdbConnectionService) {
    this.startTime = new Date();
  }

  /**
   * Perform health check
   */
  async checkHealth(query: HealthCheckQuery): Promise<HealthCheckResult> {
    const now = new Date();
    const uptime = Math.floor((now.getTime() - this.startTime.getTime()) / 1000); // uptime in seconds

    let databases;
    let memoryUsage;

    if (query.includeDetails) {
      // Check database connections
      const cbdbConnected = await this.checkCbdbConnection();
      const appConnected = await this.checkAppConnection();

      databases = {
        cbdb: cbdbConnected,
        app: appConnected
      };

      // Get memory usage
      const memInfo = process.memoryUsage();
      memoryUsage = {
        heapUsed: Math.round(memInfo.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memInfo.heapTotal / 1024 / 1024), // MB
        rss: Math.round(memInfo.rss / 1024 / 1024) // MB
      };
    }

    const healthy = !databases || (databases.cbdb && databases.app);

    return new HealthCheckResult(
      healthy,
      uptime,
      now,
      databases,
      memoryUsage
    );
  }

  /**
   * Simple ping
   */
  async ping(query: HealthPingQuery): Promise<HealthPingResult> {
    return new HealthPingResult(new Date());
  }

  /**
   * Check CBDB database connection
   */
  private async checkCbdbConnection(): Promise<boolean> {
    try {
      // Simply check if the connection service is initialized
      // The connection service handles its own initialization
      const db = this.cbdbConnection.getDb();
      return db !== null && db !== undefined;
    } catch (error) {
      console.error('CBDB connection check failed:', error);
      return false;
    }
  }

  /**
   * Check App database connection
   */
  private async checkAppConnection(): Promise<boolean> {
    try {
      // Check if app database file exists
      if (envConfig.APP_DB_PATH) {
        return fs.existsSync(envConfig.APP_DB_PATH);
      }
      return false;
    } catch (error) {
      console.error('App DB connection check failed:', error);
      return false;
    }
  }

  /**
   * Get database file size
   */
  private getFileSize(filePath: string): number | undefined {
    try {
      const stats = fs.statSync(filePath);
      return Math.round(stats.size / 1024 / 1024); // MB
    } catch {
      return undefined;
    }
  }
}