import React from 'react';

export function ArchitectureTable() {
  return (
    <div className="rounded-lg border mb-4">
      <table className="w-full text-xs table-fixed">
        <colgroup>
          <col className="w-12" />
          <col className="w-32" />
          <col />
          <col />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-2 font-medium text-primary">Layer</th>
            <th className="text-left p-2 font-medium text-primary">
              Data Type
            </th>
            <th className="text-left p-2 font-medium text-primary">Source</th>
            <th className="text-left p-2 font-medium text-primary">
              Circulates In
            </th>
            <th className="text-left p-2 font-medium text-primary">
              Naming Convention (e.g. Person entity)
            </th>
            <th className="text-left p-2 font-medium text-primary">Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="p-2 text-center font-bold">I</td>
            <td className="p-2 font-medium">TableModel</td>
            <td className="p-2">Database Schema</td>
            <td className="p-2">Below Repository</td>
            <td className="p-2 font-mono">PersonTableModel</td>
            <td className="p-2">
              Raw DB representation, no joins, faithful to CBDB schema
            </td>
          </tr>
          <tr className="border-b">
            <td className="p-2 text-center font-bold">II</td>
            <td className="p-2 font-medium">Model</td>
            <td className="p-2">
              TableModel + joined values via pivotal code tables
            </td>
            <td className="p-2">
              Above Repository
              <br />
              <span className="text-muted-foreground">
                (including Backend Services, Frontend, and External Systems)
              </span>
            </td>
            <td className="p-2 font-mono">PersonModel</td>
            <td className="p-2">
              Default denormalized entities with trivial joins, the common
              currency
            </td>
          </tr>
          <tr className="border-b">
            <td className="p-2 text-center font-bold">III</td>
            <td className="p-2 font-medium">ExtendedModel</td>
            <td className="p-2">Model + Relations</td>
            <td className="p-2">Above Repository</td>
            <td className="p-2 font-mono">
              <div>PersonFullExtendedModel</div>
              <div>PersonOptionalExtendedModel</div>
            </td>
            <td className="p-2">
              Composed models with all or optional relations
            </td>
          </tr>
          <tr className="border-b">
            <td className="p-2 text-center font-bold">IV</td>
            <td className="p-2 font-medium">
              DataView &<br />
              Computed/Derived
            </td>
            <td className="p-2">Any model + transformations</td>
            <td className="p-2">Above Repository</td>
            <td className="p-2 font-mono">
              <div>PersonSuggestionDataView</div>
              <div>GraphDataModel</div>
            </td>
            <td className="p-2">
              Any shape that needs transformation and calculation for specific
              purposes
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
