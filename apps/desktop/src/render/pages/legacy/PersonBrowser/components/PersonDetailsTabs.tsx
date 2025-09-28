import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/render/components/ui/tabs';
import { PersonSuggestionDataView } from '@cbdb/core';
import PersonBirthDeathTab from '../tabs/PersonBirthDeathTab';
import PersonOfficesTab from '../tabs/PersonOfficesTab';
import PersonKinshipsTab from '../tabs/PersonKinshipsTab';

interface PersonDetailsTabsProps {
  selectedPerson: PersonSuggestionDataView | null;
}

export function PersonDetailsTabs({ selectedPerson }: PersonDetailsTabsProps) {
  const personId = selectedPerson?.id || null;

  return (
    <Tabs defaultValue="birth-death" className="h-full">
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="birth-death">Birth/Death Years</TabsTrigger>
        <TabsTrigger value="offices">Postings</TabsTrigger>
        <TabsTrigger value="kinship">Kinship</TabsTrigger>
      </TabsList>

      {/* Birth/Death Tab */}
      <TabsContent value="birth-death" className="mt-4">
        <PersonBirthDeathTab personId={personId} />
      </TabsContent>

      {/* Offices Tab */}
      <TabsContent value="offices" className="mt-4">
        <PersonOfficesTab personId={personId} />
      </TabsContent>

      {/* Kinship Tab */}
      <TabsContent value="kinship" className="mt-4">
        <PersonKinshipsTab personId={personId} />
      </TabsContent>
    </Tabs>
  );
}