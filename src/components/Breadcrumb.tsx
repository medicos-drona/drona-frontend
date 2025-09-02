"use client";

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight, MoreHorizontal } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  maxItems?: number;
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  maxItems = 4,
  className,
}) => {
  const displayItems = React.useMemo(() => {
    if (items.length <= maxItems) return items;
    
    // If more than maxItems, show first item, ellipsis, and last two items
    const firstItem = items[0];
    const lastItems = items.slice(-2);
    
    return [firstItem, { label: '...' }, ...lastItems];
  }, [items, maxItems]);

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm', className)}>
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
              )}
              
              {item.label === '...' ? (
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              ) : isLast ? (
                <span className="font-semibold">{item.label}</span>
              ) : item.href ? (
                <Link 
                  href={item.href} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-muted-foreground">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;