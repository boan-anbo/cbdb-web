import React from 'react';
import { CollapsibleDocBlock } from './ui/collapsible-doc-block';

export function TechStackArchitectureDetails() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <CollapsibleDocBlock
      title="Future-Proof Tech Stack & Contract-Driven Development Details"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      showFooter={true}
      footerText="End of Tech Stack Architecture Details · Click to collapse"
    >
      <div className="mt-3 space-y-3">
        <p className="text-sm leading-relaxed">
          Since CBDB is a long-term project, it is critical that the
          architecture remains stable, understandable, and easy to migrate away
          from without vendor lock-in. The entire stack uses open-source web
          technologies and the TypeScript language—from React frontend to NestJS
          backend to shared contracts—eliminating language context switching and
          ensuring type safety across boundaries. Mature open-source
          technologies (React and Node.js have been around for over a decade)
          guarantee longevity unlike proprietary systems (e.g., Microsoft
          Access) facing extinction. The contract-driven and interface-based
          architecture allows swapping implementations without breaking
          changes—React can be replaced with Vue, NestJS with Express, Drizzle
          with Kysely, Electron with Tauri, all while contracts in @cbdb/core
          and other structural interfaces remain unchanged (though repository
          interfaces haven't been extracted yet as data modeling is a heuristic
          process, explained below in the Four-layer Data Modeling Design
          Details). A single codebase deploys to both web and desktop through
          Electron, maximizing code reuse and feature parity. That said, while
          this tech demo doesn't implement all these capabilities fully, every
          mentioned feature already has a demo in place—7-Zip extraction using
          WebAssembly, graph processing using Web Workers, contract-driven APIs,
          and more—providing solid starting points for future development.
        </p>

        <p className="text-sm leading-relaxed">
          In other words, CBDB Desktop & Web could be completely rewritten with
          a different technology stack in the future, as long as it uses web
          technology, we can ensure the consistency of APIs and core repository
          logic. This is our ultimate goal. Currently, some parts have reached
          this level of abstraction, but many have not, as this is still a
          technical demo.
        </p>
      </div>
    </CollapsibleDocBlock>
  );
}
