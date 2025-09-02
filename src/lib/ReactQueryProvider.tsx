"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

import { ReactNode } from 'react';

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  // This ensures that data is not shared between different users and requests
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Set default query options here if needed
        staleTime: 60 * 1000, // 1 minute
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}