'use client';
import React from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import { QuestionPaperWizard } from '@/components/teacher/question-paper-wizard';
import { useState } from 'react';

const QuestionGenerationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tab1');

  const handleTabChange = (tab: string) => {
    // Set the active tab with a small delay to allow for animation
    setTimeout(() => {
      setActiveTab(tab);
    }, 300);
  };

  return (
<main className="min-h-screen bg-gray-50 py-8">
  <div className="container mx-auto px-4">
    <div>
      <h1 className="text-xl font-semibold text-black">Generate Questions</h1>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/teacher' },
          { label: '...', href: '#' },
          { label: 'Generate Questions' },
        ]}
        className="text-sm mt-1"
      />
    </div>
    <div className="flex justify-center mt-6">
      <div className="w-full max-w-2xl p-6">
        <QuestionPaperWizard />
      </div>
    </div>
  </div>
</main>
  );
};

export default QuestionGenerationPage;
