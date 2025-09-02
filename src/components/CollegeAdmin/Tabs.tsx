import React, { useState } from 'react';
import { LayoutDashboard, Users, BookOpen, Settings, Loader2 } from "lucide-react";

interface CollegeAdminTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
  { key: "teachers", label: "Teachers", icon: <Users className="w-4 h-4 mr-2" /> },
  { key: "questions", label: "Question Bank", icon: <BookOpen className="w-4 h-4 mr-2" /> },
  { key: "settings", label: "Settings", icon: <Settings className="w-4 h-4 mr-2" /> },
];

const CollegeAdminTabs: React.FC<CollegeAdminTabsProps> = ({ activeTab, onTabChange }) => {
  const [loadingTab, setLoadingTab] = useState<string | null>(null);

  const handleTabClick = (tabKey: string) => {
    setLoadingTab(tabKey);
    
    // Add a small delay to show the loading animation
    setTimeout(() => {
      onTabChange(tabKey);
      setLoadingTab(null);
    }, 300);
  };

  return (
    <div className="border-b mb-6">
      <div className="flex space-x-4 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const isLoading = loadingTab === tab.key;
          
          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`
                inline-flex items-center px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all
                ${isActive 
                  ? "border-teacher-blue text-teacher-blue font-semibold" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}
              `}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                tab.icon
              )}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CollegeAdminTabs;