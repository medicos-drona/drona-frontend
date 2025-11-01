const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Interface for custom difficulty configuration
 */
export interface CustomDifficultyConfig {
  easyPercentage: number;
  mediumPercentage: number;
  hardPercentage: number;
}

/**
 * Interface for topic configuration in question papers
 */
export interface TopicConfiguration {
  topicId: string;
  topicName: string;
  numberOfQuestions: number;
  totalMarks: number;
}

/**
 * Interface for chapter configuration in question papers
 */
export interface ChapterConfiguration {
  chapterId: string;
  chapterName: string;
  numberOfQuestions: number;
  totalMarks: number;
  topics?: TopicConfiguration[]; // For topic-level selection within chapter
}

/**
 * Interface for subject configuration in multi-subject papers
 */
export interface SubjectConfiguration {
  subject: string;
  numberOfQuestions: number;
  totalMarks: number;
  customDifficulty: CustomDifficultyConfig;
  chapterId?: string; // For single chapter selection
  topicId?: string; // For single topic selection (most specific)
  chapters?: ChapterConfiguration[]; // For multi-chapter selection
  topics?: TopicConfiguration[]; // For multi-topic selection
}

/**
 * Interface for creating a question paper (supports both single and multi-subject)
 */
export interface CreateQuestionPaperDto {
  title: string;
  description?: string;
  // Single subject fields
  subject?: string;
  chapterId?: string; // For single chapter selection
  topicId?: string; // For single topic selection (most specific)
  chapters?: ChapterConfiguration[]; // For multi-chapter selection in single subject
  topics?: TopicConfiguration[]; // For multi-topic selection in single subject
  totalMarks?: number;
  duration?: number;
  instructions?: string;
  examType: string;
  customise?: {
    customDifficulty: CustomDifficultyConfig;
    numberOfQuestions: number;
    totalMarks: number;
    duration: number;
    includeAnswers: boolean;
  };
  // Multi-subject fields
  subjects?: SubjectConfiguration[];
  includeAnswers?: boolean;
}

export interface QuestionUsageSummary {
  collegeId?: string;
  tier: 'free' | 'pro' | 'unknown';
  limit: number | null;
  used: number;
  remaining: number | null;
  message: string;
}

/**
 * Interface for question paper response (list view)
 */
export interface QuestionPaperListItem {
  _id: string;
  title: string;
  subjectId?: {
    _id: string;
    name: string;
  };
  totalMarks: number;
  duration: number;
  generatedBy: string;
  collegeId: string;
  status: string;
  createdAt: string;
  isMultiSubject?: boolean;
  subjectCount?: number;
}

/**
 * Interface for detailed question paper response
 */
export interface QuestionPaperResponse {
  _id: string;
  title: string;
  description?: string;
  subjectId?: {
    _id: string;
    name: string;
  };
  topicId?: {
    _id: string;
    name: string;
  };
  totalMarks: number;
  duration: number;
  withAnswers?: boolean;
  instructions?: string;
  examType?: string;
  difficultyMode?: string;
  questions: Array<{
    _id: string;
    content: string;
    options: string[];
    answer: string;
    difficulty: string;
    type: string;
    marks: number;
  }>;
  generatedBy: string;
  collegeId?: string;
  status: string;
  isMultiSubject?: boolean;
  sections: Array<{
    name: string;
    description: string;
    order: number;
    sectionMarks: number;
    subjectId?: string;
    subjectName?: string;
    questions: Array<{
      question: any;
      order: number;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get authentication headers with proper token
 */
function getAuthHeaders(): Record<string, string> {
  // Try different token storage keys used in the codebase
  const backendToken = localStorage.getItem("backendToken");
  const firebaseToken = localStorage.getItem("firebaseToken");
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  // Prefer backend token, then firebase token, then generic token
  if (backendToken) {
    headers["Authorization"] = `Bearer ${backendToken}`;
  } else if (firebaseToken) {
    headers["Authorization"] = `Bearer ${firebaseToken}`;
  } else if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    throw new Error("Authentication required - Please log in again. No valid authentication token found.");
  }

  return headers;
}

export async function getQuestionUsageSummary(): Promise<QuestionUsageSummary> {
  const headers = getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/question-papers/usage/summary`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error: ${response.status} - ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Create a new question paper
 * @param questionPaperData The question paper data
 * @returns The created question paper or error object
 */
export async function createQuestionPaper(questionPaperData: CreateQuestionPaperDto): Promise<{success: true, data: QuestionPaperResponse} | {success: false, error: string}> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/question-papers`, {
      method: "POST",
      headers,
      body: JSON.stringify(questionPaperData)
    });

    if (!response.ok) {
      let errorMessage = `Error: ${response.status} - ${response.statusText}`;

      try {
        // Try to get error message from response body
        const errorText = await response.text();

        if (errorText) {
          try {
            // Try to parse as JSON first
            const errorData = JSON.parse(errorText);

            // Extract the message from the parsed JSON
            if (errorData && errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData && errorData.error) {
              errorMessage = errorData.error;
            } else {
              errorMessage = errorText;
            }
          } catch (jsonError) {
            // If not JSON, use the text directly
            errorMessage = errorText;
          }
        }
      } catch (parseError) {
        // Silently handle parse errors
      }

      // Provide more specific error messages based on status code if we don't have a message
      if (!errorMessage || errorMessage === `Error: ${response.status} - ${response.statusText}`) {
        switch (response.status) {
          case 401:
            errorMessage = "Authentication required - Please log in again.";
            break;
          case 403:
            errorMessage = "Access denied - You don't have permission to perform this action.";
            break;
          case 404:
            errorMessage = "Resource not found - The requested item could not be found.";
            break;
          case 429:
            errorMessage = "Too many requests - Please wait a moment before trying again.";
            break;
          case 500:
            errorMessage = "Server error - Please try again later.";
            break;
          case 503:
            errorMessage = "Service unavailable - The server is temporarily down.";
            break;
          default:
            if (response.status >= 400 && response.status < 500) {
              errorMessage = "Invalid request - Please check your input and try again.";
            } else if (response.status >= 500) {
              errorMessage = "Server error - Please try again later.";
            }
        }
      }

      return { success: false, error: errorMessage };
    }

    const data = await response.json();
    console.log("Raw API response from createQuestionPaper:", data);

    // The backend returns { questionPaper: {...}, college: {...} }
    // But we need to return it in our expected format
    if (data.questionPaper) {
      return { success: true, data: data.questionPaper };
    } else {
      // If the response structure is different, return as is
      return { success: true, data };
    }
  } catch (error) {
    return { success: false, error: "Network error - Please check your connection and try again." };
  }
}

/**
 * Get question paper data with college information for frontend PDF generation
 * @param questionPaperId The question paper ID
 * @returns The question paper data with college info
 */
export async function getQuestionPaperForPDF(questionPaperId: string): Promise<{
  questionPaper: any;
  college?: {
    name: string;
    logoUrl?: string;
    address?: string;
  };
}> {
  try {
    console.log("getQuestionPaperForPDF called with:", questionPaperId);

    // Validate questionPaperId
    if (!questionPaperId || questionPaperId === 'undefined' || questionPaperId === 'null') {
      throw new Error(`Invalid question paper ID: ${questionPaperId}`);
    }

    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/question-papers/${questionPaperId}`, {
      method: "GET",
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`Failed to fetch question paper: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Question paper data fetched:", data);
    console.log("College ID in question paper:", data.collegeId);

    // The API returns the question paper directly, so we need to structure it properly
    // Check if college information is already included in the response (from creation)
    let college: { name: string; logoUrl?: string; address?: string } | undefined = undefined;

    // First check if college info is already in the response (from question paper creation)
    if (data.college) {
      college = {
        name: data.college.name,
        logoUrl: data.college.logoUrl,
        address: data.college.address
      };
      console.log("College information found in response:", college);
    } else if (data.collegeId && typeof data.collegeId === 'object' && data.collegeId.name) {
      // If collegeId is populated with college object (for superAdmin/collegeAdmin)
      college = {
        name: data.collegeId.name,
        logoUrl: data.collegeId.logoUrl,
        address: data.collegeId.address
      };
      console.log("College information found in populated collegeId:", college);
    } else {
      // For teachers, college information might not be available due to permissions
      // This is acceptable - PDFs will be generated without college branding
      console.log("No college information available - PDF will be generated without college branding");
    }

    // Handle both old format (direct question paper) and new format (with college info)
    if (data.questionPaper) {
      // New format with structured response
      return {
        questionPaper: data.questionPaper,
        college: data.college || college
      };
    } else {
      // Old format - data is the question paper directly
      return {
        questionPaper: data,
        college: college
      };
    }
  } catch (error) {
    console.error("Error fetching question paper for PDF:", error);
    throw error;
  }
}

/**
 * Download a question paper as PDF
 * @param questionPaperId The question paper ID
 * @param format The format (pdf or docx)
 * @param includeAnswers Whether to include answers in the download
 * @returns The file blob
 */
export async function downloadQuestionPaper(questionPaperId: string, format: 'pdf' | 'docx' = 'pdf', includeAnswers: boolean = true): Promise<Blob> {
  try {
    console.log("downloadQuestionPaper called with:", { questionPaperId, format, includeAnswers });

    // Validate questionPaperId
    if (!questionPaperId || questionPaperId === 'undefined' || questionPaperId === 'null') {
      throw new Error(`Invalid question paper ID: ${questionPaperId}`);
    }

    const headers = getAuthHeaders();
    delete headers["Content-Type"]; // Remove content-type for blob response

    const queryParams = new URLSearchParams({
      format,
      ...(includeAnswers && { includeAnswers: 'true' })
    });

    const downloadUrl = `${API_BASE_URL}/question-papers/${questionPaperId}/download?${queryParams}`;
    console.log("Download URL:", downloadUrl);

    const response = await fetch(downloadUrl, {
      method: "GET",
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.message || `Error: ${response.status} - ${response.statusText}`;

      if (response.status === 401) {
        errorMessage = "Authentication required - Please log in again.";
      } else if (response.status === 404) {
        errorMessage = "Question paper not found.";
      } else if (response.status >= 500) {
        errorMessage = "Server error - Please try again later.";
      }

      throw new Error(errorMessage);
    }

    return await response.blob();
  } catch (error) {
    console.error("Error downloading question paper:", error);
    throw error;
  }
}

/**
 * Get all question papers
 * @returns List of question papers
 */
export async function getQuestionPapers(): Promise<QuestionPaperListItem[]> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/question-papers`, {
      method: "GET",
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching question papers:", error);
    throw error;
  }
}

/**
 * Get a specific question paper by ID
 * @param questionPaperId The question paper ID
 * @returns The question paper
 */
export async function getQuestionPaper(questionPaperId: string): Promise<QuestionPaperResponse> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/question-papers/${questionPaperId}`, {
      method: "GET",
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching question paper:", error);
    throw error;
  }
}

/**
 * Generate and download a question paper PDF using frontend generation
 * @param questionPaperId The question paper ID
 * @param includeAnswers Whether to include answers in the download
 * @returns The generated PDF blob
 */
export async function generateQuestionPaperPDF(questionPaperId: string, includeAnswers: boolean = true): Promise<Blob> {
  try {
    console.log("generateQuestionPaperPDF called with:", { questionPaperId, includeAnswers });

    // Import PDF generator dynamically to avoid SSR issues
    const { default: PDFGenerator } = await import('@/utils/pdfGenerator');

    // Fetch question paper data
    const data = await getQuestionPaperForPDF(questionPaperId);
    console.log("Fetched data structure:", data);

    if (!data.questionPaper) {
      console.error("Question paper data not found in:", data);
      throw new Error('Question paper data not found');
    }

    console.log("Question paper found:", data.questionPaper);
    console.log("College info:", data.college);

    // Set withAnswers flag
    const questionPaper = {
      ...data.questionPaper,
      withAnswers: includeAnswers
    };

    console.log("Final question paper for PDF:", questionPaper);

    // Generate PDF using frontend generator
    const pdfGenerator = new PDFGenerator();
    const pdfBlob = await pdfGenerator.generatePDF(questionPaper, data.college);

    console.log("Frontend PDF generated successfully");
    return pdfBlob;

  } catch (error) {
    console.error("Error generating question paper PDF:", error);
    throw error;
  }
}
