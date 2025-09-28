import React from 'react';

export function ArchitectureOverview() {
  return (
    <>
      <h3 className="text-sm font-semibold">Overview</h3>
      <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
        <p className="text-sm leading-relaxed">
          As a data-centric project on top of CBDB, CBDB Desktop and Web's most
          significant challenge has been developing a robust data modeling
          architecture. The goal extends far beyond simple data display—it's
          about creating a stable and testable data structure that serves as a
          reliable foundation for future analytics and visualizations. After
          iterating through two to three design cycles via a heuristic process,
          I've arrived at this four-layer architecture where each layer has
          clear, distinct responsibilities. While not all code has been fully
          migrated to this model as of September 2025, this represents the
          standardized approach going forward for the CBDB Desktop and Web
          project, and ongoing refactoring efforts continue to align the
          remaining domains with this architecture.
        </p>
      </div>
    </>
  );
}
