/**
 * Controller for Kinship Codes endpoints
 * Handles HTTP requests for kinship code lookups
 */

import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { KinshipCodesService } from './kinship-codes.service';
import { KinshipCodesResponse, KinshipCodeListQuery } from '@cbdb/core';
import { KinshipEndpoints } from '@cbdb/core';

@ApiTags('Kinship')
@Controller('kinship')
export class KinshipCodesController {
  constructor(private readonly kinshipCodesService: KinshipCodesService) {}

  @Get('codes')
  @ApiOperation({ summary: 'Get all kinship codes' })
  @ApiResponse({
    status: 200,
    description: 'Returns all kinship code mappings for frontend caching',
    type: KinshipCodesResponse
  })
  async getAllKinshipCodes(): Promise<KinshipCodesResponse> {
    const query = new KinshipCodeListQuery();
    const result = await this.kinshipCodesService.getAllKinshipCodes(query);

    return new KinshipCodesResponse(result);
  }
}