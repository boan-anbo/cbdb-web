/**
 * Context for caching kinship codes data
 * Provides global access to kinship code mappings throughout the app
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { KinshipCode } from '@cbdb/core';
import { useApiClient } from '@/render/providers/ApiClientProvider';

interface KinshipCodesContextValue {
  kinshipCodes: Map<number, KinshipCode>;
  isLoading: boolean;
  error: Error | null;
  getKinshipCode: (code: number) => KinshipCode | undefined;
  getDisplayString: (code: number) => string;
  getFullDisplayString: (code: number) => string;
}

const KinshipCodesContext = createContext<KinshipCodesContextValue | undefined>(undefined);

export const useKinshipCodes = () => {
  const context = useContext(KinshipCodesContext);
  if (!context) {
    throw new Error('useKinshipCodes must be used within a KinshipCodesProvider');
  }
  return context;
};

interface KinshipCodesProviderProps {
  children: React.ReactNode;
}

export const KinshipCodesProvider: React.FC<KinshipCodesProviderProps> = ({ children }) => {
  const [kinshipCodes, setKinshipCodes] = useState<Map<number, KinshipCode>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get the client from the ApiClientProvider
  let client;
  try {
    client = useApiClient();
  } catch (err) {
    // Client is not ready yet
    client = null;
  }

  useEffect(() => {
    if (!client) {
      // Client not ready yet, will retry when it becomes available
      console.log('[KinshipCodesContext] Waiting for client...');
      return;
    }

    console.log('[KinshipCodesContext] Client ready, loading kinship codes...');
    const loadKinshipCodes = async () => {
      try {
        setIsLoading(true);
        const response = await client.kinshipCodes.getAllKinshipCodes();
        console.log('[KinshipCodesContext] Loaded kinship codes:', response.result.data.length);

        // Convert array to Map for O(1) lookup
        const codesMap = new Map<number, KinshipCode>();
        response.result.data.forEach(code => {
          // Reconstruct KinshipCode instance from plain object
          const kinshipCode = new KinshipCode(
            code.code,
            code.kinRel,
            code.kinRelChn,
            code.kinRelSimplified,
            code.kinPair1,
            code.kinPair2,
            code.kinPairNotes
          );
          codesMap.set(code.code, kinshipCode);
        });
        
        setKinshipCodes(codesMap);
        setError(null);
      } catch (err) {
        console.error('Failed to load kinship codes:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadKinshipCodes();
  }, [client]);

  const contextValue = useMemo<KinshipCodesContextValue>(
    () => ({
      kinshipCodes,
      isLoading,
      error,
      getKinshipCode: (code: number) => kinshipCodes.get(code),
      getDisplayString: (code: number) => {
        const kinshipCode = kinshipCodes.get(code);
        return kinshipCode ? kinshipCode.getDisplayString() : `Code ${code}`;
      },
      getFullDisplayString: (code: number) => {
        const kinshipCode = kinshipCodes.get(code);
        return kinshipCode ? kinshipCode.getFullDisplayString() : `Code ${code}`;
      },
    }),
    [kinshipCodes, isLoading, error]
  );

  return (
    <KinshipCodesContext.Provider value={contextValue}>
      {children}
    </KinshipCodesContext.Provider>
  );
};
