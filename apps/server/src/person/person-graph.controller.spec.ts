/**
 * Tests for PersonGraphController endpoints
 * Verifies proper parameter handling and response formats
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PersonGraphController } from './person-graph.controller';
import { PersonGraphService } from './person-graph.service';
import { PersonGraphWorkerPoolService } from './person-graph-worker-pool.service';
import { getTestModule, cleanupTestModule } from '../../test/test-utils/test-module';

describe('PersonGraphController', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeEach(async () => {
    module = await getTestModule();
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    await cleanupTestModule(module);
  });

  describe('GET /api/people/:id/explore/network', () => {
    it('should handle single relationTypes parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/people/1762/explore/network')
        .query({
          depth: '2',
          relationTypes: 'kinship'
        });

      // Should return 200, not 400
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('centralPersonId', 1762);
      expect(response.body).toHaveProperty('graphData');
    });

    it('should handle multiple relationTypes parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/people/1762/explore/network')
        .query('depth=2&relationTypes=kinship&relationTypes=association');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('centralPersonId', 1762);
      expect(response.body).toHaveProperty('graphData');
    });

    it('should handle array syntax for relationTypes', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/people/1762/explore/network')
        .query({
          depth: '2',
          'relationTypes[]': ['kinship', 'association']
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('centralPersonId', 1762);
      expect(response.body).toHaveProperty('graphData');
    });

    it('should handle no relationTypes (default to all)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/people/1762/explore/network')
        .query({ depth: '2' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('centralPersonId', 1762);
      expect(response.body).toHaveProperty('graphData');
    });

    it('should reject invalid parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/people/1762/explore/network')
        .query({
          depth: '2',
          invalidParam: 'test'  // This should cause validation to fail
        });

      // NestJS validation should reject unknown params
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/people/:id/network/kinship', () => {
    it('should return kinship network data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/people/1762/network/kinship')
        .query({ depth: '2' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('centralPersonId', 1762);
      expect(response.body).toHaveProperty('depth', 2);
      expect(response.body).toHaveProperty('nodes');
      expect(response.body).toHaveProperty('edges');
    });
  });
});