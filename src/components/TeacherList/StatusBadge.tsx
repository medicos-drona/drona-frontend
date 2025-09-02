
import { cn } from '@/lib/utils';
import React from 'react';

interface StatusBadgeProps {
  status: 'active' | 'inactive';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-white text-sm font-medium',
        status === 'active' 
          ? 'bg-teacher-active' 
          : 'bg-teacher-inactive',
        className
      )}
    >
      {status === 'active' ? 'Active' : 'Inactive'}
    </span>
  );
};

export default StatusBadge;