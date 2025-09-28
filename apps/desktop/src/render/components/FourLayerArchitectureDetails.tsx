import React from 'react';
import { CollapsibleDocBlock } from './ui/collapsible-doc-block';
import { ArchitectureOverview } from './FourLayerArchitecture/ArchitectureOverview';
import { ArchitectureTable } from './FourLayerArchitecture/ArchitectureTable';
import { TableModelLayer } from './FourLayerArchitecture/layers/TableModelLayer';
import { ModelLayer } from './FourLayerArchitecture/layers/ModelLayer';
import { ExtendedModelLayer } from './FourLayerArchitecture/layers/ExtendedModelLayer';
import { DataViewLayer } from './FourLayerArchitecture/layers/DataViewLayer';
import { KeyPrinciples } from './FourLayerArchitecture/KeyPrinciples';

export function FourLayerArchitectureDetails() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <CollapsibleDocBlock
      title="Four-Layer Data Model Design Details"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      showFooter={true}
      footerText="End of Four-Layer Data Model Design Details · Click to collapse"
    >
      <div className="mt-3 space-y-3">
        <ArchitectureOverview />

        <ArchitectureTable />

        <KeyPrinciples />

        <h3 className="text-sm font-semibold mt-4">
          Each layer builds upon the previous, ensuring clean separation and reusability
        </h3>

        <div className="space-y-2 mt-3">
          <TableModelLayer />
          <ModelLayer />
          <ExtendedModelLayer />
          <DataViewLayer />
        </div>
      </div>
    </CollapsibleDocBlock>
  );
}