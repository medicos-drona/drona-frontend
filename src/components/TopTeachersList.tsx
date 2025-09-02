"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";

export interface Teacher {
  id: string;
  name: string;
  avatar: string;
  status?: "online" | "offline" | "away";
  meta?: React.ReactNode;
}

export interface TopTeachersListProps {
  title: string;
  teachers: Teacher[];
  className?: string;
  onSearch?: (query: string) => void;
  onTeacherClick?: (teacher: Teacher) => void;
}

const TopTeachersList = ({
  title,
  teachers,
  className,
  onSearch,
  onTeacherClick,
}: TopTeachersListProps) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-medium mb-6">{title}</h3>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search..." 
          className="pl-9"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      
      <div className="space-y-4">
        {teachers.map((teacher) => (
          <div 
            key={teacher.id}
            className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-md p-2 transition-colors"
            onClick={() => onTeacherClick?.(teacher)}
          >
            <div className="relative">
              {teacher.avatar ? (
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
              )}
              {teacher.status && (
                <div 
                  className={`w-2.5 h-2.5 rounded-full absolute right-0 bottom-0 border-2 border-background ${
                    teacher.status === "online" ? "bg-green-500" : 
                    teacher.status === "away" ? "bg-amber-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{teacher.name}</p>
              {teacher.meta && (
                <div className="text-xs text-muted-foreground">
                  {teacher.meta}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TopTeachersList;
