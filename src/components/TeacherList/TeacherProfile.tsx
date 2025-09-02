
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeacherProfileProps {
  name: string;
  image?: string;
  isVerified: boolean;
  className?: string;
}

const TeacherProfile: React.FC<TeacherProfileProps> = ({
  name,
  image,
  isVerified,
  className
}) => {
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative">
        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        {isVerified && (
          <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-teacher-blue bg-white rounded-full" />
        )}
      </div>
      <span className="font-medium">{name}</span>
    </div>
  );
};

export default TeacherProfile;