import React, { useState } from 'react';
import { PageLoading } from './ui/page-loading';

export interface TabItem {
  label: string;
  value: string;
  disabled?: boolean;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}: TabNavigationProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleTabClick = (tab: TabItem) => {
    if (tab.disabled) return;
    
    console.log('TabNavigation: Tab clicked:', tab.value);
    setIsLoading(tab.value);
    
    if (onTabChange) {
      // Add a small delay to show the loading animation
      setTimeout(() => {
        onTabChange(tab.value);
        setIsLoading(null);
      }, 300);
    } else {
      // If no onTabChange handler, just clear loading after animation
      setTimeout(() => {
        setIsLoading(null);
      }, 300);
    }
  };

  return (
    <>
      {isLoading && <PageLoading message={`Loading ${isLoading}...`} />}
      
      <div className={`flex border-b ${className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab)}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === tab.value
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={tab.disabled}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </>
  );
}
