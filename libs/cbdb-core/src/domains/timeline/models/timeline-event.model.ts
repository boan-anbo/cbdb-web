/**
 * Timeline Event Model
 * Represents a single event in a person's life timeline
 */

export class TimelineEvent {
  personId: number;
  year?: number;           // Specific year
  startYear?: number;       // Range start
  endYear?: number;         // Range end
  eventType: string;        // Event type as string (birth, death, office, etc.)
  title: string;
  description?: string;
  location?: TimelineLocation;
  relatedEntities?: RelatedEntity[];
  source?: string;
  metadata?: Record<string, any>;  // Additional data for formatting/rendering

  constructor(data: Partial<TimelineEvent>) {
    this.personId = data.personId!;
    this.year = data.year;
    this.startYear = data.startYear;
    this.endYear = data.endYear;
    this.eventType = data.eventType || '';
    this.title = data.title || '';
    this.description = data.description;
    this.location = data.location;
    this.relatedEntities = data.relatedEntities;
    this.source = data.source;
    this.metadata = data.metadata;
  }
}

export class TimelineLocation {
  name?: string;
  coordinates?: {
    x: number;
    y: number;
  };

  constructor(data: Partial<TimelineLocation>) {
    this.name = data.name;
    this.coordinates = data.coordinates;
  }
}

export class RelatedEntity {
  type: string;              // 'person', 'institution', 'place', etc.
  id: number;
  name: string;
  relationDescription: string; // How they're related

  constructor(data: Partial<RelatedEntity>) {
    this.type = data.type || '';
    this.id = data.id || 0;
    this.name = data.name || '';
    this.relationDescription = data.relationDescription || '';
  }
}