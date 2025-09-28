import { BaseClient } from './base-client';
import { ArchiveEndpoints } from '../endpoints/archive.endpoints';
import {
  ArchiveStatusResponse,
  ArchiveInfoResponse,
  OpenLocationRequest,
  OpenLocationResponse,
  ExtractArchiveRequest,
  ArchiveProgressEvent,
  CleanExtractedResponse
} from '../domains/archive/messages/archive.dtos';

export class ArchiveClient {
  private baseUrl: string;

  constructor(client: BaseClient | { baseUrl: string }) {
    // Support both BaseClient and legacy config object
    if ('baseUrl' in client) {
      this.baseUrl = client.baseUrl;
    } else {
      // Extract baseUrl from BaseClient's config
      // @ts-ignore - accessing private property for backward compatibility
      this.baseUrl = client.config?.baseUrl || 'http://localhost:18019';
    }
  }

  async getStatus(): Promise<ArchiveStatusResponse> {
    const response = await fetch(`${this.baseUrl}${ArchiveEndpoints.GET_STATUS.fullPath}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async getInfo(): Promise<ArchiveInfoResponse> {
    const response = await fetch(`${this.baseUrl}${ArchiveEndpoints.GET_INFO.fullPath}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async openLocation(location: 'archive' | 'extracted'): Promise<OpenLocationResponse> {
    const request: OpenLocationRequest = { path: location };
    const response = await fetch(`${this.baseUrl}${ArchiveEndpoints.OPEN_LOCATION.fullPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async extractWithProgress(
    onProgress: (event: ArchiveProgressEvent) => void,
    request?: ExtractArchiveRequest
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}${ArchiveEndpoints.EXTRACT.fullPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request || {}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event = JSON.parse(line.slice(6)) as ArchiveProgressEvent;
            onProgress(event);

            if (event.type === 'complete' || event.type === 'error') {
              return;
            }
          } catch (e) {
            console.error('Failed to parse SSE event:', e);
          }
        }
      }
    }
  }

  async cleanExtracted(): Promise<CleanExtractedResponse> {
    const response = await fetch(`${this.baseUrl}${ArchiveEndpoints.CLEAN_EXTRACTED.fullPath}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }
}