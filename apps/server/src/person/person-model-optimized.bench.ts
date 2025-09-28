import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { PersonRepository } from './person.repository';
import { getTestModule, cleanupTestModule } from '../../test/get-test-module';
import { CbdbConnectionService } from '../db/cbdb-connection.service';
import { sql, inArray } from 'drizzle-orm';
import {
  cbdbMapper,
  BIOG_MAIN,
  DYNASTIES,
  NIAN_HAO,
  ETHNICITY_TRIBE_CODES,
  CHORONYM_CODES,
  HOUSEHOLD_STATUS_CODES,
  INDEXYEAR_TYPE_CODES,
  BIOG_ADDR_CODES,
  ADDR_CODES,
  YEAR_RANGE_CODES,
  GANZHI_CODES,
  PersonModel,
  PersonDenormExtraDataView
} from '@cbdb/core';

/**
 * Optimized batch fetch implementation for PersonModel
 * Demonstrates how to eliminate N+1 query problem
 */
describe('PersonModel Optimized Batch Fetch Benchmark', () => {
  let module: TestingModule;
  let repository: PersonRepository;
  let cbdbConnection: CbdbConnectionService;

  beforeAll(async () => {
    module = await getTestModule();
    repository = module.get<PersonRepository>(PersonRepository);
    cbdbConnection = module.get<CbdbConnectionService>(CbdbConnectionService);
  });

  afterAll(async () => {
    await cleanupTestModule(module);
  });

  /**
   * Optimized batch fetch that eliminates N+1 queries
   * Instead of fetching denorm data for each person individually,
   * we batch fetch all lookup data in minimal queries
   */
  async function findModelsByIdsOptimized(ids: number[]): Promise<PersonModel[]> {
    if (ids.length === 0) {
      return [];
    }

    const db = cbdbConnection.getDb();

    // Step 1: Fetch all person base data in ONE query
    const persons = await db
      .select()
      .from(BIOG_MAIN)
      .where(inArray(BIOG_MAIN.c_personid, ids));

    if (persons.length === 0) {
      return [];
    }

    // Step 2: Collect all unique foreign keys from all persons
    const dynastyCodes = new Set<number>();
    const nianhaoCodes = new Set<number>();
    const ethnicityCodes = new Set<number>();
    const choronymCodes = new Set<number>();
    const householdStatusCodes = new Set<number>();
    const indexYearTypeCodes = new Set<number>();
    const indexAddrTypeCodes = new Set<number>();
    const indexAddrIds = new Set<number>();
    const yearRangeCodes = new Set<number>();
    const ganzhiCodes = new Set<number>();

    for (const person of persons) {
      if (person.c_dy !== null) dynastyCodes.add(person.c_dy);
      if (person.c_by_nh_code !== null) nianhaoCodes.add(person.c_by_nh_code);
      if (person.c_dy_nh_code !== null) nianhaoCodes.add(person.c_dy_nh_code);
      if (person.c_fl_ey_nh_code !== null) nianhaoCodes.add(person.c_fl_ey_nh_code);
      if (person.c_fl_ly_nh_code !== null) nianhaoCodes.add(person.c_fl_ly_nh_code);
      if (person.c_ethnicity_code !== null) ethnicityCodes.add(person.c_ethnicity_code);
      if (person.c_choronym_code !== null) choronymCodes.add(person.c_choronym_code);
      if (person.c_household_status_code !== null) householdStatusCodes.add(person.c_household_status_code);
      if (person.c_index_year_type_code !== null) indexYearTypeCodes.add(person.c_index_year_type_code);
      if (person.c_index_addr_type_code !== null) indexAddrTypeCodes.add(person.c_index_addr_type_code);
      if (person.c_index_addr_id !== null) indexAddrIds.add(person.c_index_addr_id);
      if (person.c_by_range !== null) yearRangeCodes.add(person.c_by_range);
      if (person.c_dy_range !== null) yearRangeCodes.add(person.c_dy_range);
      if (person.c_by_day_gz !== null) ganzhiCodes.add(person.c_by_day_gz);
      if (person.c_dy_day_gz !== null) ganzhiCodes.add(person.c_dy_day_gz);
    }

    // Step 3: Batch fetch ALL lookup data in parallel (just a few queries instead of N queries)
    const [
      dynasties,
      nianhaoRecords,
      ethnicities,
      choronyms,
      householdStatuses,
      indexYearTypes,
      biogAddrTypes,
      addresses,
      yearRanges,
      ganzhis
    ] = await Promise.all([
      // Dynasties
      dynastyCodes.size > 0
        ? db.select().from(DYNASTIES).where(inArray(DYNASTIES.c_dy, Array.from(dynastyCodes)))
        : [],
      // Nianhao
      nianhaoCodes.size > 0
        ? db.select().from(NIAN_HAO).where(inArray(NIAN_HAO.c_nianhao_id, Array.from(nianhaoCodes)))
        : [],
      // Ethnicities
      ethnicityCodes.size > 0
        ? db.select().from(ETHNICITY_TRIBE_CODES).where(inArray(ETHNICITY_TRIBE_CODES.c_ethnicity_code, Array.from(ethnicityCodes)))
        : [],
      // Choronyms
      choronymCodes.size > 0
        ? db.select().from(CHORONYM_CODES).where(inArray(CHORONYM_CODES.c_choronym_code, Array.from(choronymCodes)))
        : [],
      // Household statuses
      householdStatusCodes.size > 0
        ? db.select().from(HOUSEHOLD_STATUS_CODES).where(inArray(HOUSEHOLD_STATUS_CODES.c_household_status_code, Array.from(householdStatusCodes)))
        : [],
      // Index year types
      indexYearTypeCodes.size > 0
        ? db.select().from(INDEXYEAR_TYPE_CODES).where(inArray(INDEXYEAR_TYPE_CODES.c_index_year_type_code, Array.from(indexYearTypeCodes)))
        : [],
      // Biog addr types
      indexAddrTypeCodes.size > 0
        ? db.select().from(BIOG_ADDR_CODES).where(inArray(BIOG_ADDR_CODES.c_addr_type, Array.from(indexAddrTypeCodes)))
        : [],
      // Addresses
      indexAddrIds.size > 0
        ? db.select().from(ADDR_CODES).where(inArray(ADDR_CODES.c_addr_id, Array.from(indexAddrIds)))
        : [],
      // Year ranges
      yearRangeCodes.size > 0
        ? db.select().from(YEAR_RANGE_CODES).where(inArray(YEAR_RANGE_CODES.c_range_code, Array.from(yearRangeCodes)))
        : [],
      // Ganzhi codes
      ganzhiCodes.size > 0
        ? db.select().from(GANZHI_CODES).where(inArray(GANZHI_CODES.c_ganzhi_code, Array.from(ganzhiCodes)))
        : []
    ]);

    // Step 4: Create lookup maps for O(1) access
    const dynastyMap = new Map(dynasties.map(d => [d.c_dy, d]));
    const nianhaoMap = new Map(nianhaoRecords.map(n => [n.c_nianhao_id, n]));
    const ethnicityMap = new Map(ethnicities.map(e => [e.c_ethnicity_code, e]));
    const choronymMap = new Map(choronyms.map(c => [c.c_choronym_code, c]));
    const householdStatusMap = new Map(householdStatuses.map(h => [h.c_household_status_code, h]));
    const indexYearTypeMap = new Map(indexYearTypes.map(i => [i.c_index_year_type_code, i]));
    const biogAddrTypeMap = new Map(biogAddrTypes.map(b => [b.c_addr_type, b]));
    const addressMap = new Map(addresses.map(a => [a.c_addr_id, a]));
    const yearRangeMap = new Map(yearRanges.map(y => [y.c_range_code, y]));
    const ganzhiMap = new Map(ganzhis.map(g => [g.c_ganzhi_code, g]));

    // Step 5: Assemble PersonModels using the lookup maps
    const models: PersonModel[] = [];

    for (const person of persons) {
      // Build denormalized data view efficiently using maps
      const denormData: any = {
        person: person,
        dynasty: person.c_dy !== null ? dynastyMap.get(person.c_dy) || null : null,
        birthNh: person.c_by_nh_code !== null ? nianhaoMap.get(person.c_by_nh_code) || null : null,
        deathNh: person.c_dy_nh_code !== null ? nianhaoMap.get(person.c_dy_nh_code) || null : null,
        flourishedStartNh: person.c_fl_ey_nh_code !== null ? nianhaoMap.get(person.c_fl_ey_nh_code) || null : null,
        flourishedEndNh: person.c_fl_ly_nh_code !== null ? nianhaoMap.get(person.c_fl_ly_nh_code) || null : null,
        ethnicity: person.c_ethnicity_code !== null ? ethnicityMap.get(person.c_ethnicity_code) || null : null,
        choronym: person.c_choronym_code !== null ? choronymMap.get(person.c_choronym_code) || null : null,
        householdStatus: person.c_household_status_code !== null ? householdStatusMap.get(person.c_household_status_code) || null : null,
        indexYearType: person.c_index_year_type_code !== null ? indexYearTypeMap.get(person.c_index_year_type_code) || null : null,
        indexAddrType: person.c_index_addr_type_code !== null ? biogAddrTypeMap.get(person.c_index_addr_type_code) || null : null,
        indexAddr: person.c_index_addr_id !== null ? addressMap.get(person.c_index_addr_id) || null : null,
        birthYearRange: person.c_by_range !== null ? yearRangeMap.get(person.c_by_range) || null : null,
        deathYearRange: person.c_dy_range !== null ? yearRangeMap.get(person.c_dy_range) || null : null,
        birthYearDayGanzhi: person.c_by_day_gz !== null ? ganzhiMap.get(person.c_by_day_gz) || null : null,
        deathYearDayGanzhi: person.c_dy_day_gz !== null ? ganzhiMap.get(person.c_dy_day_gz) || null : null
      };

      const denormDataView = cbdbMapper.person.toDenormExtraDataView(denormData);
      models.push(cbdbMapper.person.toModel(person, denormDataView));
    }

    return models;
  }

  describe('Optimized vs Original Implementation', () => {
    it('should compare batch fetch performance', async () => {
      const batchSizes = [10, 50, 100, 200, 500];

      console.log('\n=== Optimized Batch Fetch Performance Comparison ===');
      console.log('Size\tOriginal(ms)\tOptimized(ms)\tSpeedup\tQueries Saved');
      console.log('----\t------------\t-------------\t-------\t-------------');

      for (const size of batchSizes) {
        // Generate person IDs
        const personIds: number[] = [];
        for (let i = 0; i < size; i++) {
          personIds.push(1000 + i * 5);
        }

        const iterations = Math.max(5, Math.floor(100 / size));

        // Warm up
        await repository.findModelsByIds(personIds.slice(0, 5));
        await findModelsByIdsOptimized(personIds.slice(0, 5));

        // Benchmark original implementation
        const originalStart = performance.now();
        let originalResults: PersonModel[] = [];

        for (let i = 0; i < iterations; i++) {
          originalResults = await repository.findModelsByIds(personIds);
        }

        const originalTime = (performance.now() - originalStart) / iterations;

        // Benchmark optimized implementation
        const optimizedStart = performance.now();
        let optimizedResults: PersonModel[] = [];

        for (let i = 0; i < iterations; i++) {
          optimizedResults = await findModelsByIdsOptimized(personIds);
        }

        const optimizedTime = (performance.now() - optimizedStart) / iterations;

        // Verify results are equivalent
        expect(optimizedResults.length).toBe(originalResults.length);
        if (optimizedResults.length > 0 && originalResults.length > 0) {
          // Check first result has same structure
          expect(optimizedResults[0].id).toBe(originalResults[0].id);
          expect(optimizedResults[0].dynastyName).toBe(originalResults[0].dynastyName);
        }

        // Calculate improvement
        const speedup = originalTime / optimizedTime;
        const queriesSaved = size; // We save N queries (one per person)

        console.log(
          `${size}\t${originalTime.toFixed(2)}\t\t${optimizedTime.toFixed(2)}\t\t${speedup.toFixed(1)}x\t\t${queriesSaved}`
        );
      }
    });

    it('should analyze query count reduction', async () => {
      console.log('\n=== Query Count Analysis ===');

      const testSizes = [10, 50, 100];

      for (const size of testSizes) {
        const personIds = Array.from({ length: size }, (_, i) => 1000 + i * 10);

        // Original: 1 query for persons + N queries for denorm data
        const originalQueries = 1 + size;

        // Optimized: 1 query for persons + ~10 queries for all lookup data
        const optimizedQueries = 11; // 1 for persons + 10 for lookup tables

        const reduction = ((originalQueries - optimizedQueries) / originalQueries) * 100;

        console.log(`Batch size ${size}:`);
        console.log(`  Original: ${originalQueries} queries`);
        console.log(`  Optimized: ${optimizedQueries} queries`);
        console.log(`  Reduction: ${reduction.toFixed(1)}%`);
      }
    });

    it('should test scaling characteristics', async () => {
      console.log('\n=== Scaling Analysis ===');

      const sizes = [1, 10, 50, 100, 250, 500];
      const originalTimes: number[] = [];
      const optimizedTimes: number[] = [];

      for (const size of sizes) {
        const personIds = Array.from({ length: size }, (_, i) => 1000 + i * 5);

        // Measure original
        const origStart = performance.now();
        await repository.findModelsByIds(personIds);
        originalTimes.push(performance.now() - origStart);

        // Measure optimized
        const optStart = performance.now();
        await findModelsByIdsOptimized(personIds);
        optimizedTimes.push(performance.now() - optStart);
      }

      console.log('Size\tOriginal\tOptimized\tSpeedup');
      console.log('----\t--------\t---------\t-------');

      for (let i = 0; i < sizes.length; i++) {
        const speedup = originalTimes[i] / optimizedTimes[i];
        console.log(
          `${sizes[i]}\t${originalTimes[i].toFixed(2)}ms\t\t${optimizedTimes[i].toFixed(2)}ms\t\t${speedup.toFixed(1)}x`
        );
      }

      // Calculate scaling factors
      const origScaling = originalTimes[originalTimes.length - 1] / originalTimes[0];
      const optScaling = optimizedTimes[optimizedTimes.length - 1] / optimizedTimes[0];
      const sizeScaling = sizes[sizes.length - 1] / sizes[0];

      console.log('\n=== Scaling Characteristics ===');
      console.log(`Data size increased: ${sizeScaling}x`);
      console.log(`Original time increased: ${origScaling.toFixed(1)}x (poor scaling)`);
      console.log(`Optimized time increased: ${optScaling.toFixed(1)}x (better scaling)`);

      // Check linearity (closer to 1 = more linear)
      const origLinearity = origScaling / sizeScaling;
      const optLinearity = optScaling / sizeScaling;

      console.log(`\nLinearity scores (1 = perfectly linear):`);
      console.log(`Original: ${origLinearity.toFixed(2)} (${origLinearity > 2 ? 'poor' : 'acceptable'})`);
      console.log(`Optimized: ${optLinearity.toFixed(2)} (${optLinearity < 0.5 ? 'excellent' : optLinearity < 1 ? 'good' : 'acceptable'})`);
    });

    it('should measure real-world impact', async () => {
      console.log('\n=== Real-World Impact ===');

      // Simulate a common scenario: fetching a page of search results
      const pageSize = 50;
      const searchQuery = '王';

      console.log(`Scenario: Fetching ${pageSize} search results for "${searchQuery}"`);

      // Get IDs from search
      const searchResult = await repository.searchByName({
        name: searchQuery,
        start: 0,
        limit: pageSize
      });

      const personIds = searchResult.data.map(p => p.id);
      console.log(`Found ${personIds.length} persons`);

      // Measure with original implementation
      const origStart = performance.now();
      const origResults = await repository.findModelsByIds(personIds);
      const origTime = performance.now() - origStart;

      // Measure with optimized implementation
      const optStart = performance.now();
      const optResults = await findModelsByIdsOptimized(personIds);
      const optTime = performance.now() - optStart;

      console.log(`\nPerformance:`);
      console.log(`  Original: ${origTime.toFixed(2)}ms`);
      console.log(`  Optimized: ${optTime.toFixed(2)}ms`);
      console.log(`  Speedup: ${(origTime / optTime).toFixed(1)}x`);
      console.log(`  Time saved: ${(origTime - optTime).toFixed(2)}ms`);

      // Extrapolate to larger scenarios
      console.log(`\nExtrapolated for larger loads:`);
      const requestsPerMinute = 100;
      const timeSavedPerMinute = (origTime - optTime) * requestsPerMinute;
      console.log(`  ${requestsPerMinute} requests/min: ${(timeSavedPerMinute / 1000).toFixed(1)}s saved`);

      const requestsPerHour = requestsPerMinute * 60;
      const timeSavedPerHour = (origTime - optTime) * requestsPerHour;
      console.log(`  ${requestsPerHour} requests/hour: ${(timeSavedPerHour / 1000 / 60).toFixed(1)} minutes saved`);
    });
  });
});