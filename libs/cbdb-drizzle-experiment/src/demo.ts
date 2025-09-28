/**
 * CBDB Entity Retrieval Demo
 *
 * This script demonstrates different ways to retrieve entities from the CBDB database:
 * 1. Raw Drizzle queries (direct table access)
 * 2. Domain models (Person class)
 * 3. Repository pattern (PersonRepository)
 */

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { eq, like, sql, desc, and, gte, lte } from 'drizzle-orm';
import * as schema from '../drizzle/schema';
import { Person } from './models/Person';
import { PersonRepository } from './repositories/PersonRepository';
import { join } from 'path';

async function demo() {
  // Connect to database - use environment variable or relative path
  const dbPath = process.env.CBDB_PATH || join(__dirname, '../../../cbdb_sql_db/latest.db');
  const client = createClient({
    url: `file://${dbPath}`,
  });

  const db = drizzle(client, { schema });

  console.log('🚀 CBDB Entity Retrieval Demo\n');
  console.log('=' . repeat(60));

  // ============================================================
  // PART 1: Raw Drizzle Queries (Direct Table Access)
  // ============================================================

  console.log('\n📋 PART 1: Raw Drizzle Queries');
  console.log('-'.repeat(40));

  // 1.1 Simple select with limit
  const rawPersons = await db
    .select()
    .from(schema.BIOG_MAIN)
    .limit(3);

  console.log('\n1.1 First 3 persons (raw):');
  rawPersons.forEach(p => {
    console.log(`  ID: ${p.c_personid}, Name: ${p.c_name_chn || p.c_name}`);
  });

  // 1.2 Query with WHERE clause (dynasty code 3 = Song)
  const songPersons = await db
    .select()
    .from(schema.BIOG_MAIN)
    .where(eq(schema.BIOG_MAIN.c_dy, 3))
    .limit(3);

  console.log('\n1.2 Song Dynasty persons (raw):');
  songPersons.forEach(p => {
    console.log(`  ${p.c_name_chn || p.c_name} (${p.c_birthyear || '?'}-${p.c_deathyear || '?'})`);
  });

  // 1.3 Complex query with SQL functions
  const dynastyStats = await db
    .select({
      dynasty: schema.BIOG_MAIN.c_dy,
      count: sql<number>`COUNT(*)`,
      avgBirthYear: sql<number>`AVG(${schema.BIOG_MAIN.c_birthyear})`,
    })
    .from(schema.BIOG_MAIN)
    .groupBy(schema.BIOG_MAIN.c_dy)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(5);

  console.log('\n1.3 Top 5 dynasty codes by person count:');
  dynastyStats.forEach(stat => {
    const avgYear = stat.avgBirthYear ? Math.round(stat.avgBirthYear) : 'N/A';
    console.log(`  Dynasty Code ${stat.dynasty || 0}: ${stat.count} persons, avg birth year: ${avgYear}`);
  });

  // ============================================================
  // PART 2: Domain Models (Person Class)
  // ============================================================

  console.log('\n\n🎯 PART 2: Domain Models');
  console.log('-'.repeat(40));

  // 2.1 Convert raw data to Person objects
  const personModels = rawPersons.map(row => new Person(row));

  console.log('\n2.1 Person objects with computed properties:');
  personModels.forEach(person => {
    console.log(`  ${person.displayName}`);
    console.log(`    Dynasty: ${person.dynasty || 'Unknown'}`);
    console.log(`    Lifespan: ${person.lifespan}`);
    console.log(`    Age: ${person.age || 'Unknown'}`);
  });

  // 2.2 JSON serialization
  console.log('\n2.2 JSON representation:');
  console.log(JSON.stringify(personModels[0].toJSON(), null, 2));

  // ============================================================
  // PART 3: Repository Pattern
  // ============================================================

  console.log('\n\n🏛️  PART 3: Repository Pattern');
  console.log('-'.repeat(40));

  const personRepo = new PersonRepository(db);

  // 3.1 Find by ID
  const person1 = await personRepo.findById(100);
  console.log('\n3.1 Find person by ID (100):');
  if (person1) {
    console.log(`  ${person1.displayName} (${person1.dynasty}, ${person1.lifespan})`);
  }

  // 3.2 Search by Chinese name
  const wangPersons = await personRepo.findByChineseName('王');
  console.log('\n3.2 Search for persons with "王" in name:');
  console.log(`  Found ${wangPersons.length} persons`);
  wangPersons.slice(0, 3).forEach(p => {
    console.log(`  - ${p.displayName} (${p.dynasty})`);
  });

  // 3.3 Find by dynasty code (2 = Tang)
  const tangPersons = await personRepo.findByDynastyCode(2, 5);
  console.log('\n3.3 Tang Dynasty (code 2) persons (limit 5):');
  tangPersons.forEach(p => {
    console.log(`  - ${p.displayName} (${p.lifespan})`);
  });

  // 3.4 Find by birth year range
  const millenniumPersons = await personRepo.findByBirthYearRange(1000, 1100);
  console.log('\n3.4 Persons born between 1000-1100:');
  console.log(`  Found ${millenniumPersons.length} persons`);
  millenniumPersons.slice(0, 3).forEach(p => {
    console.log(`  - ${p.displayName} (b. ${p.birthYear})`);
  });

  // 3.5 Get total count
  const totalCount = await personRepo.count();
  console.log(`\n3.5 Total persons in database: ${totalCount.toLocaleString()}`);

  // 3.6 Dynasty statistics
  const dynasties = await personRepo.getDynastyStatistics();
  console.log('\n3.6 Dynasty distribution (top 5):');
  dynasties.slice(0, 5).forEach(d => {
    console.log(`  Dynasty Code ${d.dynastyCode || 0}: ${d.count.toLocaleString()} persons`);
  });

  // 3.7 Complex query: Longest-lived persons (dynasty code 5 = Ming)
  const longestLived = await personRepo.findLongestLivedInDynastyCode(5, 5);
  console.log('\n3.7 Longest-lived persons in Ming Dynasty (code 5):');
  longestLived.forEach(p => {
    console.log(`  - ${p.displayName}: ${p.age} years (${p.lifespan})`);
  });

  // ============================================================
  // PART 4: Performance Comparison
  // ============================================================

  console.log('\n\n⚡ PART 4: Performance Comparison');
  console.log('-'.repeat(40));

  // Raw query performance
  const start1 = Date.now();
  await db.select().from(schema.BIOG_MAIN).limit(1000);
  const time1 = Date.now() - start1;

  // Repository pattern performance
  const start2 = Date.now();
  await personRepo.findByDynastyCode(3, 1000);
  const time2 = Date.now() - start2;

  console.log(`\nFetch 1000 records:`);
  console.log(`  Raw Drizzle: ${time1}ms`);
  console.log(`  Repository:  ${time2}ms`);
  console.log(`  Overhead:    ${time2 - time1}ms (for object creation)`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ Demo complete!');
}

// Run the demo
demo().catch(console.error);