import React from 'react';
import {
  CBDBPage,
  CBDBPageHeader,
  CBDBPageTitle,
  CBDBPageDescription,
  CBDBPageContent,
} from '@/render/components/ui/cbdb-page';
import {
  CBDBBlock,
  CBDBBlockHeader,
  CBDBBlockTitle,
  CBDBBlockContent,
} from '@/render/components/ui/cbdb-block';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/render/components/ui/alert';
import { Info } from 'lucide-react';
import { FourLayerArchitectureDetails } from '@/render/components/FourLayerArchitectureDetails';
import { TechStackArchitectureDetails } from '@/render/components/TechStackArchitectureDetails';

export function HomePage() {
  return (
    <CBDBPage>
      <CBDBPageHeader>
        <CBDBPageTitle>Welcome to CBDB Desktop & Web</CBDBPageTitle>
        <CBDBPageDescription>
          A new free and open-source interface for the China Biographical
          Database
        </CBDBPageDescription>
      </CBDBPageHeader>

      <CBDBPageContent>
        <div className="space-y-6">
          {/* Combined Tech Demo and Current Status Alert */}
          <Alert variant="warning">
            <Info className="h-4 w-4" />
            <AlertTitle>
              Technology Demonstration - MVP Stage (As of September 29, 2025)
            </AlertTitle>
            <AlertDescription>
              This is a tech demo showcasing web technologies for using CBDB and
              providing a foundation for an analytics platform built on a newly
              designed data access layer.
            </AlertDescription>
          </Alert>

          {/* Hero Screenshot */}
          <div className="flex flex-col items-center">
            <div className="relative rounded-lg overflow-hidden border shadow-lg max-w-2xl">
              <img
                src={`${import.meta.env.BASE_URL}app-demo-screenshot.png`}
                alt="CBDB Desktop & Web 2025.0520.0.1.0 Interface"
                className="w-full h-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              CBDB Desktop & Web 2025.0520.0.1.0 - Demo Interface
            </p>
          </div>

          {/* What is CBDB */}
          <CBDBBlock>
            <CBDBBlockHeader>
              <CBDBBlockTitle>What is CBDB Desktop & Web?</CBDBBlockTitle>
            </CBDBBlockHeader>
            <CBDBBlockContent>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>
                  CBDB Desktop & Web is a free and open-source (AGPL-3.0
                  license) interface built with web technology that provides new
                  ways to use{' '}
                  <a
                    href="https://projects.iq.harvard.edu/cbdb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline underline-offset-2 text-primary hover:text-primary/80"
                  >
                    the China Biographical Database
                  </a>{' '}
                  (CC BY-NC-SA 4.0). CBDB Web is the same interface but a hosted
                  version at{' '}
                  <a
                    href="https://www.dh-tools.com/cbdb/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline underline-offset-2 text-primary hover:text-primary/80"
                  >
                    dh-tools.com/cbdb
                  </a>
                  .
                </p>
                <h4 className="font-semibold text-primary">
                  Key Capabilities (Planned):
                </h4>
                <p className="text-sm mb-2">
                  This tech demo demonstrates that these capabilities are
                  achievable:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    Offline-first desktop application with bundled database,
                    ready to use (bundle size just over 300MB, half of which is
                    the embedded CBDB database)
                  </li>
                  <li>
                    Recreation of CBDB Access version features with modern web
                    technologies
                  </li>
                  <li>
                    Infrastructure for analytics features such as network
                    analysis, timeline visualization, and GIS
                  </li>
                  <li>
                    A new data layer (see details below) providing a solid
                    foundation for future integrations including with LLMs
                  </li>
                  <li>Documented local REST API for programmatic access</li>
                  <li>Cross-platform support (Windows, macOS, Linux)</li>
                  <li>
                    Support for cross-system interoperability with research
                    software such as Zotero
                  </li>
                </ul>

                <h4 className="font-semibold mt-4 text-primary">Prior Work:</h4>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>
                    <strong>
                      CBDB Access Version by Michael A. Fuller (
                      <a
                        href="https://projects.iq.harvard.edu/cbdb/how-install-access"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline underline-offset-2 text-blue-600 hover:text-blue-800"
                      >
                        Installation Guide
                      </a>
                      ):
                      <br />
                    </strong>{' '}
                    This project learned from Professor Fuller's interface
                    design and studied portions of the Visual Basic source code
                    to understand core business logic. If possible, this project
                    will help to recreate the entire Access interface and all of
                    its features and analytics capabilities.
                  </li>
                  <li>
                    <strong>CBDB Online PHP Version (</strong>
                    <a
                      href="https://github.com/cbdb-project/cbdb-online-main-server"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline underline-offset-2 text-blue-600 hover:text-blue-800"
                    >
                      GitHub
                    </a>
                    <strong>):</strong>
                    <br />
                    This project also learned from the API design and aims to
                    achieve parity with the PHP server version of CBDB.
                  </li>
                </ul>

                <h4 className="font-semibold mt-4 text-primary">
                  What's New in CBDB Desktop & Web:
                </h4>
                <p className="mt-2">
                  CBDB Desktop & Web introduces significant architectural and
                  conceptual improvements:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
                  <li>
                    <strong>
                      Future-Proof Tech Stack & Contract-Driven Development:
                    </strong>{' '}
                    <br />A unified TypeScript/JavaScript stack across frontend,
                    backend, and shared contracts within a monorepo structure,
                    ensuring longevity through mature open-source technologies
                    and implementation flexibility via stable interfaces.
                    <div className="mt-2">
                      {/* Nested explanation block */}
                      <TechStackArchitectureDetails />
                    </div>
                  </li>
                  <li>
                    <strong>Four-layer Data Modeling:</strong>
                    <br />A systematic approach to data modeling that creates
                    standard models for core entities, achieving what the Access
                    version attempted with denormalized tables. For details, see
                    the README in our GitHub repository.
                    <div className="mt-2">
                      {/* Nested explanation block */}
                      <FourLayerArchitectureDetails />
                    </div>
                  </li>
                  <li>
                    <strong>Standard and Modular API Design:</strong>
                    <br />
                    External systems can rely on standard data shapes rather
                    than raw table structures. The modularized API allows
                    flexible composition with interactive documentation.
                  </li>
                  <li>
                    <strong>Extensive Testing:</strong>
                    <br />
                    Basic test coverage is already in place to ensure data
                    stability and correctness across the entire stack. For
                    example, tests validate data mapping accuracy against
                    official CBDB sources, verify API compatibility with the PHP
                    service, and ensure consistent behavior across different
                    graph traversal depths. These serve as living documentation
                    and provide confidence during refactoring. Integration tests
                    use real CBDB data to validate complex queries. Future work
                    includes comprehensive Access parity tests.
                  </li>
                </ul>

                <h4 className="font-semibold mt-4 text-primary">Next Steps:</h4>
                {/* use numbered list */}
                <ol className="list-decimal list-inside space-y-2 ml-2 mt-2">
                  <li>
                    Reproduce the classic Access experience (feature parity over
                    time)
                  </li>
                  <li>
                    Domain-specific analytics capabilities based upon user
                    feedback and use cases
                  </li>
                  <li>Integrations with LLMs for AI assistance</li>
                  <li>... and more</li>
                </ol>

                <span className="mt-4">
                  <br />
                  Created by Bo An.{' '}
                </span>
                <span className="mt-2">Last updated: September 29, 2025</span>
              </div>
            </CBDBBlockContent>
          </CBDBBlock>
        </div>
      </CBDBPageContent>
    </CBDBPage>
  );
}
