'use client';
import React from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button'; // shadcn button
import { Plus } from 'lucide-react'; // icon
import QuestionBank from '@/components/admin/question-bank/question-bank';
import Link from 'next/link';


const QuestionGenerationPage: React.FC = () => {
  return (
<main className="min-h-screen bg-gray-50 py-8">
  <div className="container mx-auto px-4">
  <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-black">Question Bank</h1>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: '...', href: '#' },
            { label: 'Question Bank' },
          ]}
          className="text-sm mt-1"
        />
      </div>
      <Link href="/admin/add-question">
      <Button className="bg-[#05603A] hover:bg-[#04502F] text-white">
        Add Questions
        <Plus className="w-4 h-4 ml-2" />
      </Button>
      </Link>
    </div>
    {/* <div>
      <h1 className="text-xl font-semibold text-black">Question Bank</h1>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: '...', href: '#' },
          { label: 'Question Bank' },
        ]}
        className="text-sm mt-1"
      />
    </div> */}
    <div className="container mx-auto py-10">
      {/* <CollegeRegistrationForm /> */}
      <QuestionBank/>
    </div>
  </div>

</main>
  );
};

export default QuestionGenerationPage;
