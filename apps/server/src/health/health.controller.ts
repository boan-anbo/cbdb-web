import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheckResponse,
  HealthControllerAPI,
  HealthInfoRequest,
  PingResponse
} from '@cbdb/core';
import { HealthService } from './health.service';
import { envConfig } from '../config/env.config';

@ApiTags('Health')
@Controller(HealthControllerAPI.CONTROLLER_PATH)
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Basic health check
   */
  @Get(HealthControllerAPI.CHECK.relativePath)
  @ApiOperation({ summary: 'Get health status of the server' })
  @ApiResponse({
    status: 200,
    description: 'Server health status',
    type: HealthCheckResponse
  })
  async checkHealth(): Promise<HealthCheckResponse> {
    const result = await this.healthService.checkHealth({ includeDetails: false });

    return new HealthCheckResponse(
      result.healthy ? 'ok' : 'error',
      result.timestamp,
      result.uptime,
      envConfig.NODE_ENV,
      '1.0.0', // TODO: Get from package.json
      result.databases ? {
        cbdbDatabase: {
          status: result.databases.cbdb ? 'connected' : 'disconnected',
          path: envConfig.CBDB_PATH
        },
        appDatabase: {
          status: result.databases.app ? 'connected' : 'disconnected',
          path: envConfig.APP_DB_PATH
        }
      } : undefined,
      result.memoryUsage ? {
        memory: {
          used: result.memoryUsage.heapUsed,
          total: result.memoryUsage.heapTotal,
          percentage: Math.round((result.memoryUsage.heapUsed / result.memoryUsage.heapTotal) * 100)
        }
      } : undefined
    );
  }

  /**
   * Simple ping endpoint
   */
  @Get(HealthControllerAPI.PING.relativePath)
  @ApiOperation({ summary: 'Simple ping for connectivity check' })
  @ApiResponse({
    status: 200,
    description: 'Pong response',
    type: PingResponse
  })
  async ping(): Promise<PingResponse> {
    const result = await this.healthService.ping({});
    return new PingResponse('pong', result.timestamp);
  }

  /**
   * Detailed health information
   */
  @Get(HealthControllerAPI.DETAILS.relativePath)
  @ApiOperation({ summary: 'Get detailed health information' })
  @ApiResponse({
    status: 200,
    description: 'Detailed health information',
    type: HealthCheckResponse
  })
  async getDetails(@Query() query?: HealthInfoRequest): Promise<HealthCheckResponse> {
    const includeDetails = query?.includeServices !== false; // Default to true
    const result = await this.healthService.checkHealth({ includeDetails });

    return new HealthCheckResponse(
      result.healthy ? 'ok' : 'error',
      result.timestamp,
      result.uptime,
      envConfig.NODE_ENV,
      '1.0.0', // TODO: Get from package.json
      query?.includeServices !== false && result.databases ? {
        cbdbDatabase: {
          status: result.databases.cbdb ? 'connected' : 'disconnected',
          path: envConfig.CBDB_PATH,
          tables: result.databases.cbdb ? 91 : undefined // Known number of CBDB tables
        },
        appDatabase: {
          status: result.databases.app ? 'connected' : 'disconnected',
          path: envConfig.APP_DB_PATH
        }
      } : undefined,
      query?.includeResources !== false && result.memoryUsage ? {
        memory: {
          used: result.memoryUsage.heapUsed,
          total: result.memoryUsage.heapTotal,
          percentage: Math.round((result.memoryUsage.heapUsed / result.memoryUsage.heapTotal) * 100)
        },
        cpu: {
          usage: Math.round(process.cpuUsage().user / 1000000) // Convert to seconds
        }
      } : undefined
    );
  }
}