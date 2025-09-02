'use client';
import React from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import SubjectTopicManager from '@/components/admin/subject-chapter-manager';

const AddQuestionPage: React.FC = () => {
  // Handle data changes from the SubjectTopicManager
  const handleDataChange = (subjects: any[], topics: any[]) => {
    console.log("Data updated:", { subjects, topics })
    // You can save to localStorage, etc. if needed
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div>
          <h1 className="text-xl font-semibold text-black">Add Subjects & Topics</h1>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: '...', href: '#' },
              { label: 'Add Subjects & Topics' },
            ]}
            className="text-sm mt-1"
          />
        </div>
        <div className="container mx-auto py-10">
            <SubjectTopicManager
              title="Add Subjects & Topics"
              description="Organize your educational content in a two-level hierarchy"
              onDataChange={handleDataChange}
            />
            {/* <AddQuestionForm /> */}
        </div>
      </div>
    </main>
  );
};

export default AddQuestionPage;
