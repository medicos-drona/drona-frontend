'use client';
import React, { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import { QuestionPaperWizard } from '@/components/teacher/question-paper-wizard';
import { getQuestionUsageSummary, QuestionUsageSummary } from '@/lib/api/questionPapers';

const QuestionGenerationPage: React.FC = () => {
  const [usageSummary, setUsageSummary] = useState<QuestionUsageSummary | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const fetchUsageSummary = async () => {
    try {
      setIsSummaryLoading(true);
      const summary = await getQuestionUsageSummary();
      setUsageSummary(summary);
      setSummaryError(null);
    } catch (error: any) {
      console.error('Failed to load usage summary', error);
      setSummaryError(error?.message || 'Failed to load usage summary.');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageSummary();
  }, []);

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
            {summaryError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {summaryError}
              </div>
            )}
            {isSummaryLoading && !summaryError && (
              <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                Checking your quota...
              </div>
            )}
            <QuestionPaperWizard
              usageSummary={usageSummary}
              onUsageSummaryRefresh={fetchUsageSummary}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default QuestionGenerationPage;
