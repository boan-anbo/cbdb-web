/**
 * Service for Kinship Codes operations
 * Provides business logic for kinship code lookups
 */

import { Injectable } from '@nestjs/common';
import { KinshipCodesRepository } from './kinship-codes.repository';
import { KinshipCodeListQuery, KinshipCodeListResult, KinshipCodeGetQuery, KinshipCodeGetResult } from '@cbdb/core';

@Injectable()
export class KinshipCodesService {
  constructor(private readonly kinshipCodesRepository: KinshipCodesRepository) {}

  /**
   * Get all kinship codes
   * Used for frontend caching
   */
  async getAllKinshipCodes(query: KinshipCodeListQuery): Promise<KinshipCodeListResult> {
    const codes = await this.kinshipCodesRepository.getAllKinshipCodes();

    return new KinshipCodeListResult(
      codes,
      codes.length
    );
  }

  /**
   * Get a specific kinship code by ID
   */
  async getKinshipCode(query: KinshipCodeGetQuery): Promise<KinshipCodeGetResult> {
    const code = await this.kinshipCodesRepository.getKinshipCode(query.code);

    return new KinshipCodeGetResult(code);
  }
}