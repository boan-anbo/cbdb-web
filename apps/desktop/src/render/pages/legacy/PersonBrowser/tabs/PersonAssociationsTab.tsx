import { useApiClient } from '@/render/providers/ApiClientProvider';
import React, { useEffect, useState } from 'react';
import { cbdbClientManager } from '@cbdb/core';
import type { PersonAssociationsResponse } from '@cbdb/core';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/render/components/ui/tabs';
import PersonAssociationsForm from './PersonAssociationsForm';

interface PersonAssociationsTabProps {
  personId: number | null;
}

/**
 * PersonAssociationsTab - Manages fetching and displaying association data
 * Fetches unidirectional data by default (primary associations only)
 */
const PersonAssociationsTab: React.FC<PersonAssociationsTabProps> = ({ personId }) => {
  const client = useApiClient();
  const [data, setData] = useState<PersonAssociationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAssociationIndex, setCurrentAssociationIndex] = useState(0);
  const [direction, setDirection] = useState<'primary' | 'associated' | undefined>('primary');

  // Fetch data when personId or direction changes
  useEffect(() => {
    if (!personId) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Default to primary (unidirectional) associations
        
        const response = await client.personAssociation.getPersonAssociations(
          personId,
          direction
        );
        console.log('PersonAssociationsTab - API Response:', {
          personId: response.personId,
          totalAssociations: response.totalAssociations,
          firstTwoRecords: response.associations.slice(0, 2).map((a, i) => ({
            index: i,
            personId: a.personId,
            assocPersonId: a.assocPersonId,
            assocPersonInfo: a.assocPersonInfo,
            kinPersonInfo: a.kinPersonInfo,
            assocKinPersonInfo: a.assocKinPersonInfo
          }))
        });
        setData(response);
      } catch (err) {
        console.error('Failed to fetch associations data:', err);
        setError('Failed to load associations');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [personId, direction, client]);

  // Reset index when data changes
  useEffect(() => {
    setCurrentAssociationIndex(0);
  }, [data]);

  const handleNavigate = (navDirection: 'first' | 'prev' | 'next' | 'last') => {
    if (!data || !data.associations.length) return;

    switch (navDirection) {
      case 'first':
        setCurrentAssociationIndex(0);
        break;
      case 'prev':
        setCurrentAssociationIndex(Math.max(0, currentAssociationIndex - 1));
        break;
      case 'next':
        setCurrentAssociationIndex(Math.min(data.associations.length - 1, currentAssociationIndex + 1));
        break;
      case 'last':
        setCurrentAssociationIndex(data.associations.length - 1);
        break;
    }
  };

  if (!personId) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Please search for a person to view their associations
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Loading associations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    );
  }

  if (!data || !data.associations || data.associations.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No associations found for this person
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {data.personNameChn} ({data.personName})
            </h3>
            <p className="text-sm text-muted-foreground">
              Total Associations: {data.totalAssociations}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded text-sm ${
                direction === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}
              onClick={() => setDirection('primary')}
            >
              Primary
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${
                direction === 'associated' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}
              onClick={() => setDirection('associated')}
            >
              Associated
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${
                direction === undefined ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}
              onClick={() => setDirection(undefined)}
            >
              All
            </button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Form View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-4">
          <PersonAssociationsForm
            association={data.associations[currentAssociationIndex]}
            currentIndex={currentAssociationIndex}
            totalAssociations={data.associations.length}
            onNavigate={handleNavigate}
          />
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Associated Person
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Association Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kinship
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.associations.map((assoc, index) => (
                  <tr key={`${assoc.personId}-${assoc.assocId}-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <div>
                        <div className="text-gray-900 font-medium">
                          {assoc.assocPersonInfo?.nameChn || '未詳'}
                        </div>
                        {assoc.assocPersonInfo?.name && (
                          <div className="text-gray-500 text-xs">
                            {assoc.assocPersonInfo.name}
                          </div>
                        )}
                        {assoc.assocPersonInfo?.personId && (
                          <div className="text-gray-400 text-xs">
                            ID: {assoc.assocPersonInfo.personId}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <div>
                        <div className="text-gray-900">
                          {assoc.associationTypeInfo?.assocTypeChn || '未詳'}
                        </div>
                        {assoc.associationTypeInfo?.assocType && (
                          <div className="text-gray-500 text-xs">
                            {assoc.associationTypeInfo.assocType}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {assoc.assocYear || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <div className="max-w-xs">
                        <div className="text-gray-900 truncate">
                          {assoc.addressInfo?.nameChn || '-'}
                        </div>
                        {assoc.addressInfo?.name && (
                          <div className="text-gray-500 text-xs truncate">
                            {assoc.addressInfo.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <div className="text-gray-900">
                        {assoc.kinTypeInfo?.kinTypeChn || '-'}
                      </div>
                      {assoc.kinTypeInfo?.code && (
                        <div className="text-gray-500 text-xs">
                          {assoc.kinTypeInfo.code}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <div className="max-w-md truncate text-gray-600">
                        {assoc.assocNotes || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonAssociationsTab;