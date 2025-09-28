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
  PersonOfficesResponse
} from '@cbdb/core';
import { PersonService } from '../person/person.service';

/**
 * Controller for Person-Office endpoints
 * Handles person office appointment queries
 */
@ApiTags('Person Offices')
@Controller('people')
export class PersonOfficeController {
  constructor(private readonly personService: PersonService) {}

  /**
   * Get person's office appointments with full relations
   * Uses: PersonControllerAPI.GET_OFFICES
   */
  @Get(':id/offices')
  @ApiOperation({
    summary: 'Get person office appointments',
    description: 'Retrieve all office appointments for a person with full relations (office names, locations, appointment types, etc.)'
  })
  @ApiParam({
    name: 'id',
    description: 'Person ID',
    type: Number,
    example: 1762
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Person offices retrieved successfully',
    type: PersonOfficesResponse
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Person not found'
  })
  async getPersonOffices(
    @Param('id', ParseIntPipe) id: number
  ): Promise<PersonOfficesResponse> {
    const startTime = Date.now();
    const result = await this.personService.getPersonOffices(id);

    if (!result) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }

    return new PersonOfficesResponse({
      personId: result.personId,
      personName: result.personName,
      personNameChn: result.personNameChn,
      totalOffices: result.totalOffices,
      offices: result.offices,
      responseTime: Date.now() - startTime
    });
  }
}