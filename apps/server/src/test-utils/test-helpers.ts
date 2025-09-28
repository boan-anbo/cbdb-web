import { Test, TestingModule } from '@nestjs/testing';
import { PersonModule } from '../person/person.module';
import { DbModule } from '../db/db.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

/**
 * Get a test module with real CBDB database
 */
export async function getTestModule(): Promise<TestingModule> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        envFilePath: '.env.test',
        isGlobal: true,
      }),
      DbModule.forRoot({
        cbdbPath: join(__dirname, '..', '..', '..', '..', 'cbdb_sql_db', 'latest.db'),
      }),
      PersonModule,
    ],
  }).compile();

  return module;
}

/**
 * Clean up test module
 */
export async function cleanupTestModule(module: TestingModule): Promise<void> {
  if (module) {
    await module.close();
  }
}

/**
 * Get an empty test database for controlled testing
 * This would need actual implementation to create empty DB with schema
 */
export async function getEmptyTestDb() {
  // This is a placeholder - would need actual implementation
  throw new Error('getEmptyTestDb not implemented yet');
}