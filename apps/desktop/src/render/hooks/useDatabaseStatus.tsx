import { useState, useEffect } from 'react';
import { useApiClientContext } from '@/render/providers/ApiClientProvider';

export interface DatabaseStatus {
  isInitialized: boolean;
  isChecking: boolean;
  location?: string;
}

export function useDatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus>({
    isInitialized: true, // Assume initialized until check completes
    isChecking: true,
  });

  const { client, loading } = useApiClientContext();

  useEffect(() => {
    if (loading || !client) {
      // Client not ready yet
      return;
    }

    const checkStatus = async () => {
      try {
        const serverInfo = await client.serverInfo.getInfo();

        setStatus({
          isInitialized: serverInfo.database?.isInitialized ?? true,
          isChecking: false,
          location: serverInfo.database?.location,
        });
      } catch (error) {
        // If we can't reach the server, assume database is ok
        setStatus({
          isInitialized: true,
          isChecking: false,
        });
      }
    };

    checkStatus();

    // Check again periodically (every 30 seconds)
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, [client, loading]);

  return status;
}