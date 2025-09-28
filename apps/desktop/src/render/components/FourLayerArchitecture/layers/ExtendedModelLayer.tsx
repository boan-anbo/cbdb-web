import React from 'react';
import { CodeExample } from '../CodeExample';

const extendedModelTypeScript = `export class PersonFullRelations {
  public kinships: Kinship[] = [];
  public addresses: Address[] = [];
  public offices: Office[] = [];
  public entries: Entry[] = [];
  public statuses: Status[] = [];
  public associations: AssociationModel[] = [];
  // ... more relations
}

export class PersonFullExtendedModel {
  public person: PersonModel;  // HAS-A relationship (composition)
  public fullRelations: PersonFullRelations = new PersonFullRelations();

  constructor(
    personModel: PersonModel,
    fullRelations: PersonFullRelations
  ) {
    this.person = personModel;
    this.fullRelations = fullRelations;
  }
}`;

export function ExtendedModelLayer() {
  return (
    <div className="space-y-2">
      <div className="flex gap-3 p-2 rounded bg-muted/30">
        <div className="font-semibold text-sm min-w-[100px] text-primary">III. ExtendedModel</div>
        <div className="text-sm flex-1">
          <div className="font-medium">Model + entity relations</div>
          <div className="text-muted-foreground">Composed models with all database relationships</div>
          <div className="text-muted-foreground">Follows the principle of composition over inheritance, enabling flexibility, maintainability, and explicitness</div>
        </div>
      </div>
      <div className="ml-4">
        <CodeExample
          title=""
          subtitle="person.model.extended.ts"
          language="typescript"
          code={extendedModelTypeScript}
        />
      </div>
    </div>
  );
}