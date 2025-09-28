import React from 'react';

export function KeyPrinciples() {
  return (
    <div className="p-2 bg-muted/30 text-sm">
      <div className="font-medium mb-1">Key Principles:</div>
      <ul className="space-y-1 ml-3">
        <li>
          • <b>TableModel</b>: Provides the most stable core structure faithful
          to schema. Not usually used directly (codes are not human-readable),
          but valuable for performance-critical cases and making projections
        </li>
        <li>
          • <b>Model</b>: The common currency and center of gravity. Default
          type from Repository, also consumed by frontend. Provides stable
          reference point for the entire system
        </li>
        <li>
          • <b>ExtendedModel</b>: Expresses relationships between models for
          convenient access (person-address, person-kinship, etc.). Less
          commonly used than Model due to join efficiency, but useful as
          standard reference in non-performance-critical places
        </li>
        <li>
          • <b>DataView & Computed</b>: Purely for external representation
          services. Any shape can be defined for analytics or other specialized
          services needing custom transformations
        </li>
        <li>
          • <b>Controllers</b>: Only work with Model, ExtendedModel, DataView,
          and DTOs - never TableModel
        </li>
        <li>
          • <b>DTOs & CQRS</b>: Additional thin wrappers (Requests/Responses)
          and communication patterns for API implementation - not detailed here
        </li>
      </ul>
    </div>
  );
}
