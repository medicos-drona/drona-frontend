'use client';
import React, { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import EditQuestionForm from '@/components/admin/edit-question-form';
import { getQuestionById } from '@/lib/api/questions';
import { toast } from '@/components/ui/use-toast';
import { useParams, useRouter } from 'next/navigation';
import { ApiQuestion } from '@/types/question';

const EditQuestionPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;
  const [questionData, setQuestionData] = useState<ApiQuestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const data = await getQuestionById(questionId);
        setQuestionData(data);
      } catch (error: any) {
        console.error('Error fetching question:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load question data',
          variant: 'destructive',
        });
        // Redirect back to question bank if question not found
        router.push('/admin/question-bank');
      } finally {
        setLoading(false);
      }
    };

    if (questionId) {
      fetchQuestion();
    }
  }, [questionId, router]);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div>
          <h1 className="text-xl font-semibold text-black">Edit Question</h1>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Question Bank', href: '/admin/question-bank' },
              { label: 'Edit Question' },
            ]}
            className="text-sm mt-1"
          />
        </div>
        <div className="container mx-auto py-10">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : questionData ? (
            <EditQuestionForm questionData={questionData} questionId={questionId} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Question not found</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default EditQuestionPage;
