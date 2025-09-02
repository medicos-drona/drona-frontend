'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Breadcrumb from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Download, FileText, Calendar, Clock, Hash, BookOpen, Table } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getQuestionPapers, getQuestionPaperForPDF, QuestionPaperListItem } from '@/lib/api/questionPapers';
import { Pagination } from '@/components/ui/pagination';

const DownloadedPapersPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  // Fetch question papers
  const {
    data: questionPapers = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['question-papers'],
    queryFn: getQuestionPapers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate pagination
  const totalPages = Math.ceil(questionPapers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPapers = questionPapers.slice(startIndex, startIndex + pageSize);

  // Helper function to flatten questions from question paper data
  const flattenQuestions = (questionPaper: any) => {
    const questions: any[] = [];

    if (questionPaper.isMultiSubject && questionPaper.sections) {
      // Multi-subject question paper
      questionPaper.sections.forEach((section: any) => {
        if (section.questions && Array.isArray(section.questions)) {
          section.questions.forEach((questionObj: any) => {
            const question = questionObj.question || questionObj;
            questions.push({
              question: question.content || question.question || '',
              options: question.options || [],
              answer: question.answer || '',
              subject: section.subjectName || section.name || 'General',
              imageUrls: question.imageUrls || [], // Include image data for PDF generation
              solution: question.solution || null,
              hints: question.hints || []
            });
          });
        }
      });
    } else if (questionPaper.questions && Array.isArray(questionPaper.questions)) {
      // Single subject question paper
      questionPaper.questions.forEach((question: any) => {
        questions.push({
          question: question.content || question.question || '',
          options: question.options || [],
          answer: question.answer || '',
          subject: questionPaper.subjectId?.name || 'General',
          imageUrls: question.imageUrls || [], // Include image data for PDF generation
          solution: question.solution || null,
          hints: question.hints || []
        });
      });
    }

    return questions;
  };

  // Generate PDF with questions only using server-side API
  const generateQuestionsPDF = async (questionPaper: any, filename: string, collegeInfo?: any) => {
    const questions = flattenQuestions(questionPaper);

    const payload = {
      title: questionPaper.title || 'Question Paper',
      description: questionPaper.description || '',
      duration: questionPaper.duration || 60,
      totalMarks: questionPaper.totalMarks || 100,
      questions,
      includeAnswers: false,
      filename,
      collegeName: collegeInfo?.name || '',
      collegeLogoUrl: collegeInfo?.logoUrl || '',
    };

    const response = await fetch('/api/generate-paper-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to generate questions PDF');
    }

    return response.blob();
  };

  // Generate PDF with solutions using server-side API
  const generateSolutionsPDF = async (questionPaper: any, filename: string, collegeInfo?: any) => {
    const questions = flattenQuestions(questionPaper);

    const payload = {
      title: questionPaper.title || 'Question Paper',
      description: questionPaper.description || '',
      duration: questionPaper.duration || 60,
      totalMarks: questionPaper.totalMarks || 100,
      questions,
      filename,
      collegeName: collegeInfo?.name || '',
      collegeLogoUrl: collegeInfo?.logoUrl || '',
    };

    console.log('Calling /api/generate-solutions-pdf with payload:', payload);
    const response = await fetch('/api/generate-solutions-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to generate solutions PDF');
    }

    return response.blob();
  };

  // Generate Excel with answers using server-side API
  const generateAnswersExcel = async (questionPaper: any, filename: string) => {
    const questions = flattenQuestions(questionPaper);

    const payload = {
      title: questionPaper.title || 'Question Paper',
      questions,
      filename,
    };

    const response = await fetch('/api/generate-answers-excel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to generate answers Excel');
    }

    return response.blob();
  };

  // Handle download with different options
  const handleDownload = async (paper: QuestionPaperListItem, downloadType: 'questions' | 'answers' | 'solutions') => {
    try {
      setDownloadingIds(prev => new Set(prev).add(paper._id));

      // First, fetch the complete question paper details to ensure we have all data
      const fullQuestionPaperResponse = await getQuestionPaperForPDF(paper._id);

      // Extract the actual question paper data from the response
      const fullQuestionPaper = fullQuestionPaperResponse.questionPaper;
      const collegeInfo = fullQuestionPaperResponse.college;

      // Check if the question paper has questions (handle both single and multi-subject papers)
      const hasDirectQuestions = fullQuestionPaper.questions && fullQuestionPaper.questions.length > 0;
      const hasSectionQuestions = fullQuestionPaper.sections &&
        fullQuestionPaper.sections.some((section: any) => section.questions && section.questions.length > 0);

      if (!hasDirectQuestions && !hasSectionQuestions) {
        throw new Error('This question paper does not contain any questions. It may have been created incorrectly.');
      }

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const baseTitle = paper.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');

      let filename: string;

      switch (downloadType) {
        case 'questions':
          // Generate PDF with questions only using server-side API
          filename = `${baseTitle}_Questions_${timestamp}_${randomSuffix}.pdf`;
          const questionsPdfBlob = await generateQuestionsPDF(fullQuestionPaper, filename, collegeInfo);

          // Create download link
          const questionsUrl = window.URL.createObjectURL(questionsPdfBlob);
          const questionsLink = document.createElement('a');
          questionsLink.href = questionsUrl;
          questionsLink.download = filename;
          document.body.appendChild(questionsLink);
          questionsLink.click();
          document.body.removeChild(questionsLink);
          window.URL.revokeObjectURL(questionsUrl);
          break;

        case 'answers':
          // Generate Excel file with answers using server-side API
          filename = `${baseTitle}_Answers_${timestamp}_${randomSuffix}.xlsx`;
          const answersBlob = await generateAnswersExcel(fullQuestionPaper, filename);

          // Create download link
          const answersUrl = window.URL.createObjectURL(answersBlob);
          const answersLink = document.createElement('a');
          answersLink.href = answersUrl;
          answersLink.download = filename;
          document.body.appendChild(answersLink);
          answersLink.click();
          document.body.removeChild(answersLink);
          window.URL.revokeObjectURL(answersUrl);
          break;

        case 'solutions':
          // Generate PDF with solutions using server-side API
          filename = `${baseTitle}_Solutions_${timestamp}_${randomSuffix}.pdf`;
          console.log('Generating solutions PDF with filename:', filename);
          const solutionsPdfBlob = await generateSolutionsPDF(fullQuestionPaper, filename, collegeInfo);

          // Create download link
          const solutionsUrl = window.URL.createObjectURL(solutionsPdfBlob);
          const solutionsLink = document.createElement('a');
          solutionsLink.href = solutionsUrl;
          solutionsLink.download = filename;
          solutionsLink.setAttribute('download', filename); // Force download
          document.body.appendChild(solutionsLink);
          solutionsLink.click();
          document.body.removeChild(solutionsLink);
          window.URL.revokeObjectURL(solutionsUrl);
          console.log('Solutions PDF download initiated with filename:', filename);
          break;

        default:
          throw new Error('Invalid download type');
      }

      console.log('Download completed successfully');

    } catch (error) {
      console.error('Download failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to download the question paper. Please try again.';
      alert(errorMessage);
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(paper._id);
        return newSet;
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div>
          <h1 className="text-xl font-semibold text-black">Downloaded Papers</h1>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/teacher' },
              { label: '...', href: '#' },
              { label: 'Downloaded Papers' },
            ]}
            className="text-sm mt-1"
          />
        </div>

        <div className="mt-6">
          {/* Header Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Question Papers</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {questionPapers.length} total papers available for download
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading question papers...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-red-500 mb-4">Failed to load question papers</p>
                  <Button onClick={() => refetch()} variant="outline">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : questionPapers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No question papers found</p>
                  <p className="text-sm text-gray-400">Generate your first question paper to see it here</p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="py-3 px-6 text-left font-medium text-gray-700">Paper Title</th>
                        <th className="py-3 px-6 text-left font-medium text-gray-700">Subject</th>
                        <th className="py-3 px-6 text-left font-medium text-gray-700">Details</th>
                        <th className="py-3 px-6 text-left font-medium text-gray-700">Created</th>
                        <th className="py-3 px-6 text-left font-medium text-gray-700">Status</th>
                        <th className="py-3 px-6 text-center font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPapers.map((paper) => (
                        <tr key={paper._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          {/* Paper Title */}
                          <td className="py-4 px-6">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900 line-clamp-2">
                                  {paper.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  ID: {paper._id.slice(-8)}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Subject */}
                          <td className="py-4 px-6">
                            {paper.subjectId ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {paper.subjectId.name}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Multi-Subject{paper.subjectCount ? ` (${paper.subjectCount})` : ''}
                              </span>
                            )}
                          </td>

                          {/* Details */}
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Hash className="w-3 h-3" />
                                <span>{paper.totalMarks} marks</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Clock className="w-3 h-3" />
                                <span>{paper.duration} min</span>
                              </div>
                            </div>
                          </td>

                          {/* Created */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(paper.createdAt)}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              paper.status.toLowerCase() === 'active' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6">
                            <div className="flex justify-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={downloadingIds.has(paper._id)}
                                    className="flex items-center gap-2"
                                  >
                                    <Download className="w-4 h-4" />
                                    {downloadingIds.has(paper._id) ? 'Downloading...' : 'Download'}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    onClick={() => handleDownload(paper, 'questions')}
                                    disabled={downloadingIds.has(paper._id)}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <FileText className="w-4 h-4" />
                                    Download Questions
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDownload(paper, 'answers')}
                                    disabled={downloadingIds.has(paper._id)}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Table className="w-4 h-4" />
                                    Download Answers
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDownload(paper, 'solutions')}
                                    disabled={downloadingIds.has(paper._id)}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <BookOpen className="w-4 h-4" />
                                    Download Solutions
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      pageSize={pageSize}
                      totalItems={questionPapers.length}
                      onPageSizeChange={setPageSize}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default DownloadedPapersPage;
