
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Edit, Trash, UserX, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeacherActionsMenuProps {
  teacherId: string | number;
  teacherStatus: 'active' | 'inactive';
  onView: (id: string | number) => void;
  onEdit: (id: string | number) => void;
  onDelete: (id: string | number) => void;
  onStatusChange: (id: string | number, newStatus: 'active' | 'inactive') => void;
  className?: string;
}

const ActionsMenu: React.FC<TeacherActionsMenuProps> = ({
  teacherId,
  teacherStatus,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  className
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn(className)}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(teacherId)}>
          <Eye className="mr-2 h-4 w-4" />
          <span>View Details</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(teacherId)}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit Teacher</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {teacherStatus === 'active' ? (
          <DropdownMenuItem 
            onClick={() => onStatusChange(teacherId, 'inactive')}
            className="text-teacher-inactive"
          >
            <UserX className="mr-2 h-4 w-4" />
            <span>Deactivate</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem 
            onClick={() => onStatusChange(teacherId, 'active')}
            className="text-teacher-active"
          >
            <UserCheck className="mr-2 h-4 w-4" />
            <span>Activate</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onDelete(teacherId)}
          className="text-destructive focus:text-destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionsMenu;
