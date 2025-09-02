import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = "Loading..." }: PageLoadingProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-lg bg-white shadow-lg">
        <div className="relative h-16 w-16">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-primary">{message}</h3>
          <p className="text-sm text-muted-foreground mt-1">Please wait while we load your content</p>
        </div>
      </div>
    </div>
  );
}