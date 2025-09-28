import { useApiClient } from '@/render/providers/ApiClientProvider';
import React, { useEffect, useState } from 'react';
import { cbdbClientManager } from '@cbdb/core';
import type { PersonBirthDeathView } from '@cbdb/core';
import BirthDeathDisplay from '../components/BirthDeathDisplay';

interface PersonBirthDeathTabProps {
  personId: number | null;
}

/**
 * PersonBirthDeathTab - Manages fetching and displaying birth/death data
 * Fetches data when personId changes
 */
const PersonBirthDeathTab: React.FC<PersonBirthDeathTabProps> = ({ personId }) => {
  const client = useApiClient();
  const [data, setData] = useState<PersonBirthDeathView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        
        const response = await client.person.getBirthDeathView(personId);
        setData(response.data || null);
      } catch (err) {
        console.error('Failed to fetch birth/death data:', err);
        setError('Failed to load birth/death data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [personId, client]);

  if (!personId) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Please search for a person to view their birth/death information
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Loading birth/death data...
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

  if (!data) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No birth/death data available for this person
      </div>
    );
  }

  return <BirthDeathDisplay data={data} />;
};

export default PersonBirthDeathTab;