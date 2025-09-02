import React, { useState } from 'react';
import { Eye, CheckCircle, Loader2 } from "lucide-react";

interface TeacherTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collegeIdMissing?: boolean;
}

const TABS = [
  { key: "view", label: "View Teachers List", icon: <Eye className="w-4 h-4 mr-2" /> },
  { key: "add", label: "Add Teachers", icon: <span className="font-bold text-xl mr-2">+</span> },
  // { key: "logs", label: "Teacher Activity Logs", icon: <CheckCircle className="w-4 h-4 mr-2" /> },
];

const TeacherTabs: React.FC<TeacherTabsProps> = ({ activeTab, onTabChange, collegeIdMissing }) => {
  const [loadingTab, setLoadingTab] = useState<string | null>(null);

  const handleTabClick = (tabKey: string) => {
    if (collegeIdMissing) return;
    
    setLoadingTab(tabKey);
    
    // Add a small delay to show the loading animation
    setTimeout(() => {
      onTabChange(tabKey);
      setLoadingTab(null);
    }, 300);
  };

  return (
    <div className="border-b mb-6">
      <div className="flex flex-wrap space-x-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const isLoading = loadingTab === tab.key;
          
          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              disabled={collegeIdMissing}
              className={`
                inline-flex items-center px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all
                ${isActive 
                  ? "border-teacher-blue text-teacher-blue font-semibold" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}
                ${collegeIdMissing ? "opacity-50 cursor-not-allowed" : ""}
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

export default TeacherTabs;
