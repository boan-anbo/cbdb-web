import { TestingModule } from '@nestjs/testing';
import { TestDatabaseConfig } from './test-database.config';

/**
 * Get a test module instance for testing
 * Each call creates a fresh module to avoid test contamination
 */
export async function getTestModule(): Promise<TestingModule> {
  const module = await TestDatabaseConfig.createTestingModule();
  await module.init();
  return module;
}

/**
 * Cleanup a test module after tests
 */
export async function cleanupTestModule(module: TestingModule): Promise<void> {
  await TestDatabaseConfig.cleanup(module);
}