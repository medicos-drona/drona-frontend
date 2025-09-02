'use client';
import React from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import { CollegeRegistrationForm } from '@/components/admin/college-registration-form';


const QuestionGenerationPage: React.FC = () => {
  return (
<main className="min-h-screen bg-gray-50 py-8">
  <div className="container mx-auto px-4">
    <div>
      <h1 className="text-xl font-semibold text-black">Add Colleges</h1>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: '...', href: '#' },
          { label: 'Add Colleges' },
        ]}
        className="text-sm mt-1"
      />
    </div>
    <div className="container mx-auto py-10">
      <CollegeRegistrationForm />
    </div>
  </div>

</main>
  );
};

export default QuestionGenerationPage;
