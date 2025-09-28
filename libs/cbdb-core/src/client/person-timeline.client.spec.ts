/**
 * PersonTimelineClient Unit Tests
 * Tests timeline client endpoint formatting and request building
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PersonTimelineClient } from './person-timeline.client';
import { BaseClient } from './base-client';
import { GetLifeTimelineResponse, CompareTimelinesResponse } from '../domains/timeline/messages';
import { LifeTimeline } from '../domains/timeline/models';
import { TimelineEndpoints } from '../endpoints/timeline.endpoints';

describe('PersonTimelineClient', () => {
  let client: PersonTimelineClient;
  let mockBaseClient: BaseClient;
  const mockGet = vi.fn();
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockBaseClient = {
      get: mockGet,
      post: mockPost,
    } as any;
    client = new PersonTimelineClient(mockBaseClient);
  });

  describe('getLifeTimeline', () => {
    it('should format the endpoint path correctly', async () => {
      const mockResponse: GetLifeTimelineResponse = {
        result: {
          timeline: new LifeTimeline({
            personId: 1762,
            personName: 'Wang Anshi',
            events: []
          })
        },
        responseTime: 10
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await client.getLifeTimeline(1762);

      // Check that the correct endpoint was called
      const expectedPath = TimelineEndpoints.getLifeTimeline.path.replace(':id', '1762');
      expect(mockGet).toHaveBeenCalledWith(expectedPath);
      expect(result).toEqual(mockResponse);
    });

    it('should include query parameters when options are provided', async () => {
      const mockResponse: GetLifeTimelineResponse = {
        result: {
          timeline: new LifeTimeline({
            personId: 1762,
            personName: 'Wang Anshi',
            events: []
          })
        },
        responseTime: 10
      };

      mockGet.mockResolvedValue(mockResponse);

      await client.getLifeTimeline(1762, {
        includeRelatedEntities: true,
        includeLocations: true,
        startYear: '1000',
        endYear: '1100',
        eventTypes: ['birth', 'death', 'office']
      });

      // Verify the endpoint includes query parameters
      const calledUrl = mockGet.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/api/people/1762/timeline/life?');
      expect(calledUrl).toContain('includeRelatedEntities=true');
      expect(calledUrl).toContain('includeLocations=true');
      expect(calledUrl).toContain('startYear=1000');
      expect(calledUrl).toContain('endYear=1100');
      expect(calledUrl).toContain('eventTypes=birth');
      expect(calledUrl).toContain('eventTypes=death');
      expect(calledUrl).toContain('eventTypes=office');
    });

    it('should not include undefined options in query string', async () => {
      const mockResponse: GetLifeTimelineResponse = {
        result: {
          timeline: new LifeTimeline({
            personId: 1762,
            personName: 'Wang Anshi',
            events: []
          })
        },
        responseTime: 10
      };

      mockGet.mockResolvedValue(mockResponse);

      await client.getLifeTimeline(1762, {
        includeRelatedEntities: true,
        // includeLocations is undefined
        // startYear is undefined
      });

      const calledUrl = mockGet.mock.calls[0][0] as string;
      expect(calledUrl).toContain('includeRelatedEntities=true');
      expect(calledUrl).not.toContain('includeLocations');
      expect(calledUrl).not.toContain('startYear');
    });
  });

  describe('compareTimelines', () => {
    it('should call the correct endpoint with POST', async () => {
      const mockResponse: CompareTimelinesResponse = {
        result: {
          timelines: [],
        },
        responseTime: 10
      };

      mockPost.mockResolvedValue(mockResponse);

      const request = {
        personIds: ['1762', '1763'],
        startYear: '1000',
        endYear: '1100',
      };

      const result = await client.compareTimelines(request);

      expect(mockPost).toHaveBeenCalledWith(
        TimelineEndpoints.compareTimelines.path,
        request
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('endpoint path validation', () => {
    it('should use correct endpoints from TimelineEndpoints', () => {
      // This test ensures we're using the correct endpoint paths
      const personId = 1762;
      const expectedPath = TimelineEndpoints.getLifeTimeline.path.replace(':id', personId.toString());

      mockGet.mockResolvedValue({
        result: {
          timeline: new LifeTimeline({ personId: 1762, events: [] })
        }
      });

      client.getLifeTimeline(personId);

      const actualPath = mockGet.mock.calls[0][0].split('?')[0];
      expect(actualPath).toBe(expectedPath);
    });
  });
});