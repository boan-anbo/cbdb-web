/**
 * Controller for Person-Kinship endpoints
 * Handles person kinship relation queries
 */

import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  HttpStatus
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import {
  PersonKinshipsQuery,
  PersonKinshipsResponse
} from '@cbdb/core';
import { PersonKinshipService } from './person-kinship.service';

/**
 * Controller for Person-Kinship endpoints
 * Uses the /api/people/:id/kinships pattern
 */
@ApiTags('Person Kinships')
@Controller('people')
export class PersonKinshipController {
  constructor(private readonly personKinshipService: PersonKinshipService) {}

  /**
   * Get person's kinship relations with full details
   */
  @Get(':id/kinships')
  @ApiOperation({
    summary: 'Get person kinships',
    description: 'Retrieve all kinship relations for a person with full relations (kin persons, kinship types)'
  })
  @ApiParam({
    name: 'id',
    description: 'Person ID',
    type: Number,
    example: 1762
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Person kinships retrieved successfully',
    type: PersonKinshipsResponse
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Person not found'
  })
  async getPersonKinships(
    @Param('id', ParseIntPipe) id: number
  ): Promise<PersonKinshipsResponse> {
    const startTime = Date.now();

    // Create query
    const query = new PersonKinshipsQuery(id);

    // Execute service
    const result = await this.personKinshipService.getPersonKinships(query);

    if (!result) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }

    // Return response with timing
    return new PersonKinshipsResponse(
      result.personId,
      result.personName,
      result.personNameChn,
      result.totalKinships,
      result.kinships,
      Date.now() - startTime
    );
  }
}