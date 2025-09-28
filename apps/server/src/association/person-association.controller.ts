import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  NotFoundException,
  HttpStatus
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiQuery
} from '@nestjs/swagger';
import {
  PersonAssociationsResponse
} from '@cbdb/core';
import { PersonService } from '../person/person.service';

/**
 * Controller for Person-Association endpoints
 * Handles person association queries
 */
@ApiTags('Person Associations')
@Controller('people')
export class PersonAssociationController {
  constructor(private readonly personService: PersonService) {}

  /**
   * Get person's associations with full relations
   * Uses: PersonControllerAPI.GET_ASSOCIATIONS
   */
  @Get(':id/associations')
  @ApiOperation({
    summary: 'Get person associations',
    description: 'Retrieve all associations for a person with full relations (associated persons, kinship info, locations, dates, etc.)'
  })
  @ApiParam({
    name: 'id',
    description: 'Person ID',
    type: Number,
    example: 7097
  })
  @ApiQuery({
    name: 'direction',
    required: false,
    description: 'Filter by association direction: primary (person is c_personid) or associated (person is c_assoc_id)',
    enum: ['primary', 'associated']
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Person associations retrieved successfully',
    type: PersonAssociationsResponse
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Person not found'
  })
  async getPersonAssociations(
    @Param('id', ParseIntPipe) id: number,
    @Query('direction') direction?: 'primary' | 'associated'
  ): Promise<PersonAssociationsResponse> {
    const startTime = Date.now();
    const result = await this.personService.getPersonAssociations(id, direction);

    if (!result) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }

    return new PersonAssociationsResponse({
      personId: result.personId,
      personName: result.personName,
      personNameChn: result.personNameChn,
      totalAssociations: result.totalAssociations,
      associations: result.associations,
      responseTime: Date.now() - startTime
    });
  }
}