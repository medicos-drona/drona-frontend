'use client';
import React from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import AddQuestionForm from '@/components/admin/add-question-form';

const AddQuestionPage: React.FC = () => {


  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div>
          <h1 className="text-xl font-semibold text-black">Add Question</h1>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: '...', href: '#' },
              { label: 'Add Question' },
            ]}
            className="text-sm mt-1"
          />
        </div>
        <div className="container mx-auto py-10">
            {/* <SubjectTopicManager
              title="Add Subjects & Topics"
              description="Organize your educational content by subjects and topics"
              onDataChange={handleDataChange}
            /> */}
            <AddQuestionForm />
        </div>
      </div>
    </main>
  );
};

export default AddQuestionPage;
