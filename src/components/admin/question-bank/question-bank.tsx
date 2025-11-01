"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Image, X } from "lucide-react"
import QuestionList from "./question-list"
import { Pagination } from "@/components/ui/pagination"
import { QuestionSkeleton } from "./question-skeleton"
import { toast } from "@/components/ui/use-toast"
import { ApiQuestion, FormattedQuestion, PaginationInfo, Subject, Chapter } from "@/types/question"
import { isBase64Image, ensureDataUrl } from "@/utils/imageUtils"
import { reviewQuestion } from "@/lib/api/questions"

export default function QuestionBank() {
  // State for subjects and chapters
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const router = useRouter();
// const searchParams = useSearchParams();

  // State for filters
  const [selectedSubject, setSelectedSubject] = useState<string>("all_subjects")
  const [selectedChapter, setSelectedChapter] = useState<string>("all_chapters")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [hasImagesFilter, setHasImagesFilter] = useState<boolean | undefined>(undefined)
  
  // State for questions and pagination
  const [questions, setQuestions] = useState<ApiQuestion[]>([])
const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
const initialPage = searchParams?.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
const initialPageSize = searchParams?.get("pageSize") ? parseInt(searchParams.get("pageSize")!, 10) : 10;

const [pagination, setPagination] = useState<PaginationInfo>({
  currentPage: initialPage,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: initialPageSize
});
  // const [pagination, setPagination] = useState<PaginationInfo>({
  //   currentPage: 1,
  //   totalPages: 1,
  //   totalItems: 0,
  //   itemsPerPage: 10
  // })
  // const [pageSize, setPageSize] = useState<number>(10)
  const [loading, setLoading] = useState<boolean>(true)
  // Used to force refetch when a question is deleted
  const [refreshToken, setRefreshToken] = useState<number>(0)

  // Fetch subjects with chapters (using topics endpoint temporarily)
  useEffect(() => {
    const fetchSubjectsWithChapters = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${baseUrl}/subjects/with-topics`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("backendToken")}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch subjects: ${response.status}`);
        }

        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast({
          title: "Error",
          description: "Failed to load subjects. Please try again.",
          variant: "destructive"
        });
      }
    };

    fetchSubjectsWithChapters();
  }, []);

  // Update chapters when subject changes
  useEffect(() => {
    if (selectedSubject && selectedSubject !== "all_subjects") {
      const selectedSubjectObj = subjects.find(s => s._id === selectedSubject);
      if (selectedSubjectObj && selectedSubjectObj.chapters) {
        setChapters(selectedSubjectObj.chapters);
      } else if (selectedSubjectObj && selectedSubjectObj.topics) {
        // Backward compatibility: treat topics as chapters
        setChapters(selectedSubjectObj.topics);
      } else {
        setChapters([]);
      }
      setSelectedChapter("all_chapters");
    } else {
      setChapters([]);
    }
  }, [selectedSubject, subjects]);

  // Fetch questions with filters
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        
        // Build query parameters
        const params = new URLSearchParams();
        if (selectedSubject && selectedSubject !== "all_subjects") params.append('subjectId', selectedSubject);
        // Our "chapters" are actually topics from /subjects/with-topics, so filter by topicId
        if (selectedChapter && selectedChapter !== "all_chapters") params.append('topicId', selectedChapter);
        if (searchQuery) params.append('search', searchQuery);
        if (hasImagesFilter !== undefined) params.append('hasImages', hasImagesFilter.toString());
        params.append('page', pagination.currentPage.toString());
        params.append('limit', pagination.itemsPerPage.toString());
        
        const response = await fetch(`${baseUrl}/questions?${params.toString()}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("backendToken")}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.status}`);
        }
        
        const data = await response.json();
        setQuestions(data.questions);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast({
          title: "Error",
          description: "Failed to load questions. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [selectedSubject, selectedChapter, searchQuery, hasImagesFilter, pagination.currentPage, pagination.itemsPerPage]);

  // Handle page change
// Inside question-bank.tsx

const handlePageChange = (pageNumber: number) => {
  setPagination(prev => ({
    ...prev,
    currentPage: pageNumber
  }));
  // Update URL without reloading
  const params = new URLSearchParams(window.location.search);
  params.set("page", pageNumber.toString());
  // Ensure pageSize is in the URL if it's not the default 10
  if (pagination.itemsPerPage !== 10) {
    params.set("pageSize", pagination.itemsPerPage.toString());
  } else {
    params.delete("pageSize"); // Remove if it's the default
  }
  router.push(`?${params.toString()}`); // Use push or replaceState as appropriate
};
  // Handle page size change
  // const handlePageSizeChange = (newPageSize: number) => {
  //   setPageSize(newPageSize);
  //   setPagination(prev => ({
  //     ...prev,
  //     currentPage: 1, // Reset to first page when changing page size
  //     itemsPerPage: newPageSize
  //   }));
    
  // };
// Inside question-bank.tsx

const handlePageSizeChange = (newSize: number) => {
  setPagination(prev => ({
    ...prev,
    itemsPerPage: newSize, // Update itemsPerPage
    currentPage: 1, // Reset to first page
  }));
  
  // Sync URL with new pageSize and reset page to 1
  const params = new URLSearchParams(window.location.search);
  params.set("pageSize", newSize.toString());
  params.set("page", "1"); // Reset to the first page
  router.push(`?${params.toString()}`); // Use push or replaceState as appropriate
};

  // Handle difficulty change
  const handleDifficultyChange = async (questionId: string, difficulty: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${baseUrl}/questions/${questionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("backendToken")}`
        },
        body: JSON.stringify({ difficulty })
      });

      if (!response.ok) {
        throw new Error(`Failed to update question: ${response.status}`);
      }

      // Update local state
      setQuestions(prev =>
        prev.map(q => q._id === questionId ? { ...q, difficulty } : q)
      );

      toast({
        title: "Success",
        description: "Question difficulty updated successfully",
      });
    } catch (error) {
      console.error("Error updating question difficulty:", error);
      toast({
        title: "Error",
        description: "Failed to update question difficulty",
        variant: "destructive"
      });
    }
  };

  // Handle review status change
  const handleReviewStatusChange = async (questionId: string, reviewStatus: string) => {
    try {
      await reviewQuestion(questionId, reviewStatus as 'approved' | 'rejected');

      // Update local state
      setQuestions(prev =>
        prev.map(q => q._id === questionId ? { ...q, reviewStatus } : q)
      );

      toast({
        title: "Success",
        description: `Question ${reviewStatus} successfully`,
      });
    } catch (error) {
      console.error("Error updating question review status:", error);
      toast({
        title: "Error",
        description: "Failed to update question review status",
        variant: "destructive"
      });
    }
  };

  // Helper function to process question content and replace image references with actual images
  const processQuestionContent = (content: string, imageUrls: string[]): string => {
    if (!content || !imageUrls || imageUrls.length === 0) {
      return content || '';
    }

    let processedContent = content;

    // Pattern 1: Replace markdown image references like ![img-13.jpeg](img-13.jpeg) with actual images
    processedContent = processedContent.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt) => {
      // For references like "img-13.jpeg", use the first available image
      // Since the backend extracts images in order, the first image should correspond to the first reference
      if (imageUrls.length > 0) {
        return `<img src="${imageUrls[0]}" alt="${alt || 'Question Image'}" style="max-width: 300px; height: auto; display: block; margin: 10px auto;" />`;
      }
      return match;
    });

    // Pattern 2: Replace HTML img tags with src placeholders
    processedContent = processedContent.replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, (match) => {
      // If we have images available, use the first one
      if (imageUrls.length > 0) {
        return `<img src="${imageUrls[0]}" alt="Question Image" style="max-width: 300px; height: auto; display: block; margin: 10px auto;" />`;
      }
      return match;
    });

    // Pattern 3: If content mentions images but no image tags found, append the first image
    if (!processedContent.includes('<img') && imageUrls.length > 0) {
      // Check if content has any image-related keywords
      const hasImageKeywords = /image|figure|diagram|chart|graph|picture|represents|shown|below|above/i.test(processedContent);
      if (hasImageKeywords) {
        processedContent += `\n<img src="${imageUrls[0]}" alt="Question Image" style="max-width: 300px; height: auto; display: block; margin: 10px auto;" />`;
      }
    }

    return processedContent;
  };
  

  // Format questions for the QuestionList component
  const formattedQuestions: FormattedQuestion[] = questions.map(q => {
    try {
    // Parse options - they might be a string array or an array of objects
    interface ParsedOption {
      label: string;
      text: string;
      imageUrl?: string;
    }
    let parsedOptions: ParsedOption[] = [];

    // Ensure options is an array and filter out null/undefined values
    const safeOptions = Array.isArray(q.options) ? q.options.filter(opt => opt !== null && opt !== undefined) : [];

    if (safeOptions.length > 0) {
      if (typeof safeOptions[0] === 'string') {
        // Check if it's a single comma-separated string or an array of individual strings
        if (safeOptions.length === 1 && safeOptions[0].includes(',')) {
          // Single comma-separated string: ["Paris,London,Berlin,Madrid"]
          const optionTexts = (safeOptions as string[])[0].split(',');
          parsedOptions = optionTexts.map((text, index) => {
            const trimmedText = text.trim();

            // Check if the text is a base64 image
            if (isBase64Image(trimmedText)) {
              return {
                label: String.fromCharCode(97 + index), // a, b, c, d...
                text: '', // Empty text since this is an image option
                imageUrl: ensureDataUrl(trimmedText),
                isImageOption: true
              };
            }

            return {
              label: String.fromCharCode(97 + index), // a, b, c, d...
              text: trimmedText
            };
          });
        } else {
          // Array of individual strings: ["Cerebrum", "Cerebellum", "Medulla", "Pons"]
          parsedOptions = (safeOptions as string[]).map((text, index) => {
            const trimmedText = text.trim();

            // Check if the text is a base64 image
            if (isBase64Image(trimmedText)) {
              return {
                label: String.fromCharCode(97 + index), // a, b, c, d...
                text: '', // Empty text since this is an image option
                imageUrl: ensureDataUrl(trimmedText),
                isImageOption: true
              };
            }

            return {
              label: String.fromCharCode(97 + index), // a, b, c, d...
              text: trimmedText
            };
          });
        }
      } else {
        // If options is already an array of objects
        parsedOptions = (safeOptions as any[]).map((opt, index) => ({
          label: String.fromCharCode(97 + index),
          text: typeof opt === 'string' ? opt : (opt && opt.text) || '',
          imageUrl: typeof opt === 'object' && opt ? opt.imageUrl : undefined
        }));
      }
    } else {
      // Log warning for questions without valid options
      console.warn(`Question ${q._id} has no valid options:`, q.options);

      // Fallback: create empty options if none exist
      parsedOptions = [
        { label: 'a', text: 'No options available' },
        { label: 'b', text: 'No options available' },
        { label: 'c', text: 'No options available' },
        { label: 'd', text: 'No options available' }
      ];
    }

    return {
      id: q._id,
      subject: q.subjectId.name,
      chapter: q.chapterId?.name || q.topicId?.name || "No Chapter", // Support both chapter and topic for backward compatibility
      text: processQuestionContent(q.content, q.imageUrls || []),
      options: parsedOptions,
      difficulty: q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1), // Capitalize
      correctAnswer: q.answer,
      reviewStatus: q.reviewStatus,
      solution: q.solution
    };
    } catch (error) {
      console.error(`Error formatting question ${q._id}:`, error, q);
      // Return a fallback question structure
      return {
        id: q._id || 'unknown',
        subject: q.subjectId?.name || 'Unknown Subject',
        chapter: q.chapterId?.name || q.topicId?.name || 'No Chapter',
        text: processQuestionContent(q.content || 'Error loading question content', q.imageUrls || []),
        options: [
          { label: 'a', text: 'Error loading options' },
          { label: 'b', text: 'Error loading options' },
          { label: 'c', text: 'Error loading options' },
          { label: 'd', text: 'Error loading options' }
        ],
        difficulty: q.difficulty || 'Unknown',
        correctAnswer: q.answer || 'a',
        reviewStatus: q.reviewStatus || 'pending',
        solution: q.solution,
        hints: q.hints
      };
    }
  });

  return (
    <div className="space-y-6">
      {/* Header Filters */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_subjects">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject._id} value={subject._id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Chapter</label>
            <Select
              value={selectedChapter}
              onValueChange={setSelectedChapter}
              disabled={selectedSubject === "all_subjects" || chapters.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedSubject !== "all_subjects" ? "Select Chapter" : "Select Subject First"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_chapters">All Chapters</SelectItem>
                {chapters.map((chapter) => (
                  <SelectItem key={chapter._id} value={chapter._id}>
                    {chapter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search questions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Image Filter Row */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter by images:</label>
          <div className="flex gap-2">
            <Button
              variant={hasImagesFilter === true ? "default" : "outline"}
              size="sm"
              onClick={() => setHasImagesFilter(true)}
              className="flex items-center gap-1"
            >
              <Image className="h-4 w-4" />
              With Images
            </Button>
            <Button
              variant={hasImagesFilter === false ? "default" : "outline"}
              size="sm"
              onClick={() => setHasImagesFilter(false)}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Without Images
            </Button>
            <Button
              variant={hasImagesFilter === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => setHasImagesFilter(undefined)}
            >
              All Questions
            </Button>
          </div>
        </div>
      </div>

      {/* Question List */}
      {loading ? (
        <div className="space-y-4">
          <QuestionSkeleton />
          <QuestionSkeleton />
          <QuestionSkeleton />
        </div>
      ) : formattedQuestions.length > 0 ? (
        <>
          <QuestionList
            questions={formattedQuestions}
            onDifficultyChange={handleDifficultyChange}
            onReviewStatusChange={handleReviewStatusChange}
            onQuestionDeleted={(deletedQuestionId: string) => {
              // Remove the deleted question from local state immediately
              setQuestions(prev => prev.filter(q => q._id !== deletedQuestionId));

              // Update pagination info if needed
              setPagination(prev => ({
                ...prev,
                totalItems: prev.totalItems - 1,
                totalPages: Math.ceil((prev.totalItems - 1) / pagination.itemsPerPage)
              }));
            }}
          />

          {/* Pagination */}
          {pagination.totalItems > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageSize={pagination.itemsPerPage}
              totalItems={pagination.totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[5, 10, 20, 50, 100]}
            />
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No questions found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  )
}
