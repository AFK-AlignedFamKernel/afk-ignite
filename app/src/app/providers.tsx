'use client';

import '@rainbow-me/rainbowkit/styles.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { UIProvider } from '@/providers/UIProvider';

// Dynamically import StarknetProvider with SSR disabled
const StarknetProvider = dynamic(() => import('@/context/StarknetProvider'), {
  ssr: false,
});


// Wrap the entire providers tree in a client-side only component
const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <StarknetProvider>
      <QueryClientProvider client={queryClient}>
        <UIProvider>
          {children}
        </UIProvider>
      </QueryClientProvider>
    </StarknetProvider>
  );
};

// Export a dynamic version of the providers with SSR disabled
export default dynamic(() => Promise.resolve(ClientProviders), {
  ssr: false,
});
