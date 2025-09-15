"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ReactNode } from 'react';
import dynamic from 'next/dynamic'

// Dynamically import ReactQueryDevtools only in development
const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then((mod) => ({
    default: mod.ReactQueryDevtools
  })),
  {
    ssr: false,
    loading: () => null
  }
)

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
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}