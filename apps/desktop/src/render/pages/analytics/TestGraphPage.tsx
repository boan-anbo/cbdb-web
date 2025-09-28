import { useApiClient } from '@/render/providers/ApiClientProvider';
import React, { useEffect, useState } from 'react';
import { cbdbClientManager } from '@cbdb/core';

const TestGraphPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching kinship network...');
        
        const result = await client.personGraph.exploreKinshipNetwork(1762, 1);
        console.log('Got result:', result);
        setData(result);
      } catch (err) {
        console.error('Error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [client]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {JSON.stringify(error)}</div>;

  return (
    <div>
      <h1>Test Graph Page</h1>
      <p>Nodes: {data?.nodes?.length || 0}</p>
      <p>Edges: {data?.edges?.length || 0}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default TestGraphPage;