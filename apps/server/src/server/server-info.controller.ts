import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ServerInfoService } from './server-info.service';
import { ServerInfoRequest, ServerInfoResponse } from '@cbdb/core';

@ApiTags('Server')
@Controller('server')
export class ServerInfoController {
  constructor(private serverInfoService: ServerInfoService) {}

  @Get('info')
  @ApiOperation({
    summary: 'Get server runtime information',
    description: 'Returns server port, URLs, uptime, deployment mode, and feature flags'
  })
  @ApiResponse({
    status: 200,
    description: 'Server information retrieved successfully',
    type: ServerInfoResponse
  })
  getInfo(
    @Query(new ValidationPipe({ transform: true })) query: ServerInfoRequest
  ): ServerInfoResponse {
    return this.serverInfoService.getInfo(query.includeFeatures);
  }

  @Get('system')
  @ApiOperation({
    summary: 'Get system information',
    description: 'Returns system platform, memory, CPU information for debugging'
  })
  @ApiResponse({
    status: 200,
    description: 'System information retrieved successfully'
  })
  getSystemInfo(): any {
    return this.serverInfoService.getSystemInfo();
  }
}