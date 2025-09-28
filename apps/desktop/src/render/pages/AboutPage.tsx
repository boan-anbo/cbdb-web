import React from 'react';
import { Info, ShieldCheck, Award, Package } from 'lucide-react';
import {
  CBDBPage,
  CBDBPageHeader,
  CBDBPageTitle,
  CBDBPageDescription,
  CBDBPageContent,
} from '@/render/components/ui/cbdb-page';
import {
  CBDBBlock,
  CBDBBlockContent,
  CBDBBlockHeader,
  CBDBBlockTitle,
} from '@/render/components/ui/cbdb-block';

const AboutPage: React.FC = () => {
  return (
    <CBDBPage>
      <CBDBPageHeader>
        <CBDBPageTitle className="flex items-center gap-3">
          <Info className="size-6" />
          About CBDB Desktop & Web
        </CBDBPageTitle>
        <CBDBPageDescription>
          Information about CBDB Desktop & Web applications
        </CBDBPageDescription>
      </CBDBPageHeader>

      <CBDBPageContent>
        <CBDBBlock>
          <CBDBBlockHeader>
            <CBDBBlockTitle className="flex items-center gap-2">
              <Info className="size-5" />
              About
            </CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                <strong>CBDB Desktop & Web</strong> provides a free and
                open‑source interface and analytics platform across the desktop
                and the browser for CBDB. One download runs locally with no
                extra dependencies; a web demo is available for quick
                evaluation.
              </p>
              <p>
                Beyond providing applications, this project also provides a
                solid infrastructure using web technology as a starting point
                for future work. It emphasizes interoperability with research
                and analytics tools (e.g., Zotero), visualization and statistics
                software, and AI integration.
              </p>
            </div>
          </CBDBBlockContent>
        </CBDBBlock>

        <CBDBBlock>
          <CBDBBlockHeader>
            <CBDBBlockTitle className="flex items-center gap-2">
              <Award className="size-5" />
              Attribution
            </CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                <strong>China Biographical Database (CBDB)</strong> is a project
                started by Robert M. Hartwell and Michael A. Fuller and is
                currently owned and maintained by teams at Harvard University,
                Academia Sinica, and Peking University.
              </p>
              <p>
                Learn more:{' '}
                <a
                  className="underline text-primary hover:text-primary/80"
                  href="https://projects.iq.harvard.edu/cbdb"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://projects.iq.harvard.edu/cbdb
                </a>
              </p>
            </div>
          </CBDBBlockContent>
        </CBDBBlock>

        <CBDBBlock>
          <CBDBBlockHeader>
            <CBDBBlockTitle className="flex items-center gap-2">
              <Package className="size-5" />
              Version Information
            </CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent>
            <div className="text-sm text-muted-foreground space-y-3">
              <div className="p-3 border rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  CBDB Desktop & Web 2025.0520.0.1.0
                </p>
                <div className="text-xs space-y-1 mt-3">
                  <p>
                    <strong>Application Version:</strong> 0.1.0
                  </p>
                  <p>
                    <strong>Database Version:</strong> CBDB Database (2025-05-20
                    Release)
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    The version format (YYYY.MMDD.MAJOR.MINOR.PATCH) combines
                    the database release date with the application version,
                    providing a complete identifier for this release.
                  </p>
                </div>
              </div>
            </div>
          </CBDBBlockContent>
        </CBDBBlock>

        <CBDBBlock>
          <CBDBBlockHeader>
            <CBDBBlockTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5" />
              Legal & Licensing
            </CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent>
            <div className="text-sm text-muted-foreground space-y-3">
              <div className="p-3 border rounded-lg">
                <p className="font-medium mb-2">CBDB Data Licensing</p>
                <p className="text-xs">
                  The China Biographical Database data is licensed under{' '}
                  <strong>
                    Attribution-NonCommercial-ShareAlike 4.0 International (CC
                    BY-NC-SA 4.0)
                  </strong>
                  .
                </p>
                <p className="text-xs mt-2">
                  For more, please refer to{' '}
                  <a
                    className="underline text-primary hover:text-primary/80"
                    href="https://projects.iq.harvard.edu/cbdb"
                    target="_blank"
                    rel="noreferrer"
                  >
                    https://projects.iq.harvard.edu/cbdb
                  </a>
                  .
                </p>
              </div>

              <div className="p-3 border rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
                <p className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                  CBDB Desktop & Web Licensing
                </p>
                <p className="text-xs">
                  CBDB Desktop & Web (this application, its interface, analytics
                  platform, and associated infrastructure) is free and open
                  source software licensed under the{' '}
                  <strong>
                    GNU Affero General Public License v3.0 (AGPL-3.0)
                  </strong>
                  .
                </p>
                <p className="text-xs mt-2">
                  This means you are free to use, modify, and distribute this
                  software. If you distribute modified versions or host it as a
                  service, you must make your source code available under the
                  same license.
                </p>
                <p className="text-xs mt-2">
                  This covers the software, user interface, analytical tools,
                  and infrastructure provided by this project. The CBDB data
                  itself remains under its separate licensing terms as described
                  above.
                </p>
                <p className="text-xs mt-2">
                  Source code available at:{' '}
                  <a
                    className="underline text-primary hover:text-primary/80"
                    href="https://github.com/your-repo/cbdb-desktop"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub repository
                  </a>
                </p>
              </div>
            </div>
          </CBDBBlockContent>
        </CBDBBlock>

        <CBDBBlock>
          <CBDBBlockHeader>
            <CBDBBlockTitle>Author</CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Bo An <br />
                <a
                  className="underline text-primary hover:text-primary/80"
                  href="mailto:bo.an@aya.yale.edu"
                >
                  bo.an@aya.yale.edu
                </a>
                <br />
                <span className=" text-muted-foreground">2025-09-29</span>
              </p>
            </div>
          </CBDBBlockContent>
        </CBDBBlock>
      </CBDBPageContent>
    </CBDBPage>
  );
};

export default AboutPage;
