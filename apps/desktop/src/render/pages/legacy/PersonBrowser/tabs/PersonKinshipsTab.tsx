import React, { useEffect, useState } from 'react';
import { useApiClient } from '@/render/providers/ApiClientProvider';
import { cbdbClientManager } from '@cbdb/core';
import type { PersonKinshipsResponse } from '@cbdb/core';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/render/components/ui/tabs';
import PersonKinshipsForm from './PersonKinshipsForm';

interface PersonKinshipsTabProps {
  personId: number | null;
}

/**
 * PersonKinshipsTab - Manages fetching and displaying kinship data
 * Fetches all kinship relations for a person
 */
const PersonKinshipsTab: React.FC<PersonKinshipsTabProps> = ({ personId }) => {
  const client = useApiClient();
  const [data, setData] = useState<PersonKinshipsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentKinshipIndex, setCurrentKinshipIndex] = useState(0);

  // Fetch data when personId changes
  useEffect(() => {
    if (!personId) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        
        const response = await client.personKinship.getPersonKinships(personId);
        console.log('PersonKinshipsTab - API Response:', {
          personId: response.personId,
          totalKinships: response.totalKinships,
          firstRecord: response.kinships[0]
        });
        setData(response);
      } catch (err) {
        console.error('Failed to fetch kinships data:', err);
        setError('Failed to load kinship relations');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [personId, client]);

  // Reset index when data changes
  useEffect(() => {
    setCurrentKinshipIndex(0);
  }, [data]);

  const handleNavigate = (direction: 'first' | 'prev' | 'next' | 'last') => {
    if (!data || !data.kinships.length) return;

    switch (direction) {
      case 'first':
        setCurrentKinshipIndex(0);
        break;
      case 'prev':
        setCurrentKinshipIndex(Math.max(0, currentKinshipIndex - 1));
        break;
      case 'next':
        setCurrentKinshipIndex(Math.min(data.kinships.length - 1, currentKinshipIndex + 1));
        break;
      case 'last':
        setCurrentKinshipIndex(data.kinships.length - 1);
        break;
    }
  };

  const handleJumpToRecord = (index: number) => {
    if (!data || !data.kinships.length) return;
    setCurrentKinshipIndex(Math.min(Math.max(0, index), data.kinships.length - 1));
  };

  if (!personId) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Please search for a person to view their kinship relations
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Loading kinship relations...
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

  if (!data || !data.kinships || data.kinships.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No kinship relations found for this person
      </div>
    );
  }

  return (
    <div className="p-4">
      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Form View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-4">
          <PersonKinshipsForm
            kinship={data.kinships[currentKinshipIndex]}
            currentIndex={currentKinshipIndex}
            totalKinships={data.kinships.length}
            onNavigate={handleNavigate}
          />
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Related Person
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kinship Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.kinships.map((kinship, index) => (
                  <tr
                    key={`${kinship.personId}-${kinship.kinPersonId}-${index}`}
                    className={`hover:bg-gray-50 cursor-pointer ${index === currentKinshipIndex ? 'bg-blue-50' : ''}`}
                    onClick={() => handleJumpToRecord(index)}
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <div>
                        <div className="text-gray-900 font-medium">
                          {kinship.kinPersonInfo?.nameChn || '未詳'}
                        </div>
                        {kinship.kinPersonInfo?.name && (
                          <div className="text-gray-500 text-xs">
                            {kinship.kinPersonInfo.name}
                          </div>
                        )}
                        {kinship.kinPersonInfo?.id && (
                          <div className="text-gray-400 text-xs">
                            ID: {kinship.kinPersonInfo.id}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <div>
                        <div className="text-gray-900">
                          {kinship.kinshipTypeInfo?.kinshipTypeChn || '未詳'}
                        </div>
                        {kinship.kinshipTypeInfo?.kinshipType && (
                          <div className="text-gray-500 text-xs">
                            {kinship.kinshipTypeInfo.kinshipType}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {kinship.source || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <div className="max-w-md truncate text-gray-600">
                        {kinship.notes || '-'}
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

export default PersonKinshipsTab;