import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeploymentConfig } from '../config/deployment.config';
import { CbdbConnectionService } from '../db/cbdb-connection.service';
import { ServerInfoResponse } from '@cbdb/core';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ServerInfoService {
  private port: number | null = null;
  private startTime: Date;
  private version: string;

  constructor(
    private configService: ConfigService,
    private deploymentConfig: DeploymentConfig,
    private cbdbConnectionService: CbdbConnectionService
  ) {
    this.startTime = new Date();
    this.version = this.getAppVersion();
  }

  /**
   * Set the server port (called after server starts)
   */
  setPort(port: number): void {
    this.port = port;
    console.log(`ServerInfoService: Port set to ${port}`);
  }

  /**
   * Get comprehensive server information
   */
  getInfo(includeFeatures = true): ServerInfoResponse {
    const port = this.port || this.configService.get('PORT', 18019);
    const baseUrl = `http://localhost:${port}`;
    const apiUrl = `${baseUrl}/api`;
    const uptime = Date.now() - this.startTime.getTime();

    const response = new ServerInfoResponse(
      port || 18019,
      baseUrl,
      apiUrl,
      this.startTime,
      uptime,
      this.deploymentConfig.getMode() as 'electron' | 'web' | 'development',
      this.version,
      this.configService.get('NODE_ENV', 'development')
    );

    if (includeFeatures) {
      response.features = {
        archiveEnabled: this.deploymentConfig.isArchiveEnabled(),
        docsEnabled: true, // Always enabled
        ipcEnabled: this.deploymentConfig.isElectron()
      };
    }

    // Add database status
    response.database = {
      isInitialized: this.cbdbConnectionService.isConnected(),
      location: this.cbdbConnectionService.isConnected()
        ? this.configService.get('CBDB_PATH')
        : undefined
    };

    return response;
  }

  /**
   * Get application version from package.json
   */
  private getAppVersion(): string {
    try {
      const packageJsonPath = path.join(__dirname, '../../package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        return packageJson.version || '1.0.0';
      }
    } catch (e) {
      // Ignore errors
    }
    return '1.0.0';
  }

  /**
   * Get system information for debugging
   */
  getSystemInfo(): any {
    return {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      cpus: os.cpus().length
    };
  }
}