import { useApiClient } from '@/render/providers/ApiClientProvider';
import React, { useEffect, useState } from 'react';
import { cbdbClientManager } from '@cbdb/core';
import type { PersonOfficesResponse } from '@cbdb/core';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/render/components/ui/tabs';
import PersonOfficesForm from './PersonOfficesForm';

interface PersonOfficesTabProps {
  personId: number | null;
}

/**
 * PersonOfficesTab - Manages fetching and displaying office appointments data
 * Fetches data when personId changes
 */
const PersonOfficesTab: React.FC<PersonOfficesTabProps> = ({ personId }) => {
  const client = useApiClient();
  const [data, setData] = useState<PersonOfficesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOfficeIndex, setCurrentOfficeIndex] = useState(0);

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
        
        const response = await client.personOffice.getPersonOffices(personId);
        setData(response);
      } catch (err) {
        console.error('Failed to fetch offices data:', err);
        setError('Failed to load office appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [personId, client]);

  // Reset index when data changes
  useEffect(() => {
    setCurrentOfficeIndex(0);
  }, [data]);

  const handleNavigate = (direction: 'first' | 'prev' | 'next' | 'last') => {
    if (!data || !data.offices) return;

    switch (direction) {
      case 'first':
        setCurrentOfficeIndex(0);
        break;
      case 'prev':
        setCurrentOfficeIndex(Math.max(0, currentOfficeIndex - 1));
        break;
      case 'next':
        setCurrentOfficeIndex(Math.min(data.offices.length - 1, currentOfficeIndex + 1));
        break;
      case 'last':
        setCurrentOfficeIndex(data.offices.length - 1);
        break;
    }
  };

  if (!personId) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Please search for a person to view their office appointments
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Loading office appointments...
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

  if (!data || !data.offices || data.offices.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No office appointments found for this person
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
          <PersonOfficesForm
            office={data.offices[currentOfficeIndex]}
            currentIndex={currentOfficeIndex}
            totalOffices={data.totalOffices}
            onNavigate={handleNavigate}
          />
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Office
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Years
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Appointment Type
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.offices.map((office, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <div>
                    <div className="text-gray-900">
                      {office.officeInfo?.nameChn || '[Unknown Office]'}
                    </div>
                    {office.officeInfo?.name && (
                      <div className="text-gray-500 text-xs">
                        {office.officeInfo.name}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  {office.firstYear && office.lastYear ? (
                    `${office.firstYear} - ${office.lastYear}`
                  ) : office.firstYear ? (
                    `${office.firstYear}`
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <div>
                    <div className="text-gray-900">
                      {office.appointmentInfo?.nameChn || '-'}
                    </div>
                    {office.appointmentInfo?.name && (
                      <div className="text-gray-500 text-xs">
                        {office.appointmentInfo.name}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 text-sm">
                  <div>
                    <div className="text-gray-900">
                      {office.postingAddress?.nameChn || '-'}
                    </div>
                    {office.postingAddress?.name && office.postingAddress.name !== office.postingAddress.nameChn && (
                      <div className="text-gray-500 text-xs">
                        {office.postingAddress.name}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {office.notes || '-'}
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

export default PersonOfficesTab;