
import { handleApiError, createSuccessResponse, ApiResponse } from '@/lib/utils/errorHandler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Interface for question data
 */
export interface QuestionData {
  content: string;
  options: string[];
  answer: string;
  imageUrls?: string[];
  subjectId: string;
  chapterId?: string; // Chapter ID (middle level)
  topicId?: string; // Topic ID (most specific level) - optional for backward compatibility
  difficulty: 'easy' | 'medium' | 'hard';
  type: string;
  explanation?: string;
  status?: 'active' | 'inactive';
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  createdBy?: string;
}

/**
 * Create a new question
 * @param questionData The question data
 * @returns The created question
 */
export async function createQuestion(questionData: QuestionData): Promise<ApiResponse> {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    return handleApiError(
      "Authentication required",
      "Authentication required. Please log in again."
    );
  }

  try {
    // Create a copy of the data to avoid modifying the original
    const dataToSend = { ...questionData };

    // Remove fields that should not be sent to the API
    if (!dataToSend.explanation || dataToSend.explanation.trim() === '') {
      delete dataToSend.explanation;
    }

    // Remove status and reviewStatus as they're rejected by the API
    delete dataToSend.status;
    delete dataToSend.reviewStatus;

    // Set default type if not provided
    if (!dataToSend.type) {
      dataToSend.type = 'multiple-choice';
    }

    console.log("Sending question data:", JSON.stringify(dataToSend, null, 2));

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${baseUrl}/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(dataToSend)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error response:", errorData);

      // Check if we have detailed validation errors
      if (errorData.details) {
        const errorMessages = Object.entries(errorData.details)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        return handleApiError(
          errorMessages || errorData.message || `Error: ${response.status}`,
          "Failed to create question. Please check your input and try again."
        );
      }

      return handleApiError(
        errorData.message || `Error: ${response.status}`,
        "Failed to create question. Please try again."
      );
    }

    const result = await response.json();
    return createSuccessResponse(result, true, "Question created successfully!");
  } catch (error) {
    console.error("Error creating question:", error);
    return handleApiError(
      error instanceof Error ? error.message : "Failed to create question. Please try again.",
      "Failed to create question. Please try again."
    );
  }
}

/**
 * Get all questions
 * @returns List of questions
 */
export async function getQuestions() {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${baseUrl}/questions`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
}

/**
 * Get a question by ID
 * @param id Question ID
 * @returns The question
 */
export async function getQuestionById(id: string) {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${baseUrl}/questions/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching question:", error);
    throw error;
  }
}

/**
 * Update a question
 * @param id Question ID
 * @param questionData The updated question data
 * @returns The updated question
 */
export async function updateQuestion(id: string, questionData: QuestionData) {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${baseUrl}/questions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(questionData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
}

/**
 * Update a question with optional new images (PATCH method)
 * @param id Question ID
 * @param questionData The updated question data
 * @param questionImage Optional new question image file
 * @param optionImages Optional new option images
 * @returns The updated question
 */
export async function updateQuestionWithImages(
  id: string,
  questionData: Omit<QuestionData, 'imageUrls'>,
  questionImage?: File | null,
  optionImages?: { [key: string]: File | null }
) {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const formData = new FormData();

    // Add question data
    formData.append('content', questionData.content);

    // Add options as individual form fields
    questionData.options.forEach((option, index) => {
      formData.append(`options[${index}]`, option);
    });

    formData.append('answer', questionData.answer);
    formData.append('subjectId', questionData.subjectId);

    // Add chapterId if provided
    if (questionData.chapterId) {
      formData.append('chapterId', questionData.chapterId);
    }

    // Add topicId if provided (for backward compatibility)
    if (questionData.topicId) {
      formData.append('topicId', questionData.topicId);
    }

    formData.append('difficulty', questionData.difficulty);
    formData.append('type', questionData.type || 'multiple-choice');

    // Add createdBy field if provided
    if (questionData.createdBy) {
      formData.append('createdBy', questionData.createdBy);
    }

    // Only add explanation if it has a value
    if (questionData.explanation && questionData.explanation.trim() !== '') {
      formData.append('explanation', questionData.explanation);
    }

    // Add question image if provided
    if (questionImage) {
      formData.append('images', questionImage);
    }

    // Add option images if provided
    if (optionImages) {
      Object.entries(optionImages).forEach(([key, file]) => {
        if (file) {
          formData.append(`optionImages[${key}]`, file);
        }
      });
    }

    const response = await fetch(`${baseUrl}/questions/${id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating question with images:", error);
    throw error;
  }
}

/**
 * Delete a question
 * @param id Question ID
 * @returns The deleted question
 */
export async function deleteQuestion(id: string): Promise<ApiResponse> {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    return handleApiError(
      "Authentication required",
      "Authentication required. Please log in again."
    );
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${baseUrl}/questions/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return handleApiError(
        errorData.message || `Error: ${response.status}`,
        "Failed to delete question. Please try again."
      );
    }

    const result = await response.json();
    return createSuccessResponse(result, true, "Question deleted successfully!");
  } catch (error) {
    console.error("Error deleting question:", error);
    return handleApiError(
      error instanceof Error ? error.message : "Failed to delete question. Please try again.",
      "Failed to delete question. Please try again."
    );
  }
}

/**
 * Create a question with images
 * @param questionData The question data without imageUrls
 * @param questionImage Optional question image file
 * @param optionImages Optional map of option images
 * @returns The created question
 */
export async function createQuestionWithImages(
  questionData: Omit<QuestionData, 'imageUrls'>,
  questionImage?: File | null,
  optionImages?: { [key: string]: File | null }
) {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const formData = new FormData();

    // Add question data
    formData.append('content', questionData.content);

    // Add options as individual form fields
    questionData.options.forEach((option, index) => {
      formData.append(`options[${index}]`, option);
    });

    formData.append('answer', questionData.answer);
    formData.append('subjectId', questionData.subjectId);

    // Add chapterId if provided
    if (questionData.chapterId) {
      formData.append('chapterId', questionData.chapterId);
    }

    // Add topicId if provided (for backward compatibility)
    if (questionData.topicId) {
      formData.append('topicId', questionData.topicId);
    }

    formData.append('difficulty', questionData.difficulty);

    // Add type field with default if not provided
    formData.append('type', questionData.type || 'multiple-choice');

    // Add createdBy field if provided
    if (questionData.createdBy) {
      formData.append('createdBy', questionData.createdBy);
    }

    // Only add explanation if it has a value
    if (questionData.explanation && questionData.explanation.trim() !== '') {
      formData.append('explanation', questionData.explanation);
    }

    // Add question image if provided
    if (questionImage) {
      formData.append('images', questionImage);
    }

    // Add option images if provided
    if (optionImages) {
      Object.entries(optionImages).forEach(([key, file]) => {
        if (file) {
          formData.append(`optionImages[${key}]`, file);
        }
      });
    }

    // Log form data entries for debugging
    console.log("Form data entries:");
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    const response = await fetch(`${baseUrl}/questions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error response:", errorData);

      // Check if we have detailed validation errors
      if (errorData.details) {
        const errorMessages = Object.entries(errorData.details)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        throw new Error(errorMessages || errorData.message || `Error: ${response.status}`);
      }

      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating question with images:", error);
    throw error;
  }
}

/**
 * Get questions by subject and topic
 * @param subjectId Subject ID
 * @param topicId Topic ID
 * @returns List of questions
 */
export async function getQuestionsBySubjectAndTopic(subjectId: string, topicId: string) {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const url = `${baseUrl}/questions?subjectId=${encodeURIComponent(subjectId)}&topicId=${encodeURIComponent(topicId)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching questions by subject and topic:", error);
    throw error;
  }
}

/**
 * Get questions by difficulty
 * @param difficulty Difficulty level ('easy', 'medium', 'hard')
 * @returns List of questions
 */
export async function getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard') {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const url = `${baseUrl}/questions?difficulty=${encodeURIComponent(difficulty)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${difficulty} questions:`, error);
    throw error;
  }
}

/**
 * Review a question (approve/reject)
 * @param id Question ID
 * @param reviewStatus Review status ('approved' or 'rejected')
 * @returns The updated question
 */
export async function reviewQuestion(id: string, reviewStatus: 'approved' | 'rejected') {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${baseUrl}/questions/${id}/review`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status: reviewStatus })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error reviewing question:", error);
    throw error;
  }
}

/**
 * Bulk upload questions from PDF
 * @param file PDF file containing questions
 * @param subjectId Subject ID for the questions
 * @param chapterId Chapter ID for the questions (optional)
 * @param aiProvider AI provider to use for extraction ('mistral' or 'gemini')
 * @returns The upload result
 */
export async function bulkUploadQuestionsPDF(
  file: File,
  subjectId: string,
  chapterId?: string,
  aiProvider: 'mistral' | 'gemini' = 'gemini'
) {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const formData = new FormData();

    // Add the PDF file
    formData.append('file', file);

    // Add required subject ID
    formData.append('subjectId', subjectId);

    // Add AI provider choice
    formData.append('aiProvider', aiProvider);

    // Add optional topic ID (backend expects topicId, not chapterId)
    if (chapterId) {
      formData.append('topicId', chapterId);
    }

    const response = await fetch(`${baseUrl}/questions/bulk-upload-pdf`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("PDF upload error response:", errorData);

      // Check if we have detailed validation errors
      if (errorData.details) {
        const errorMessages = Object.entries(errorData.details)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        throw new Error(errorMessages || errorData.message || `Error: ${response.status}`);
      }

      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading PDF questions:", error);
    throw error;
  }
}

/**
 * Bulk upload chemical questions from PDF with molecular structures
 * @param file PDF file containing chemical questions
 * @param subjectId Subject ID for the questions
 * @param chapterId Chapter ID for the questions (optional)
 * @param aiProvider AI provider to use for extraction ('mistral' or 'gemini')
 * @returns The upload result with chemical extraction metadata
 */
export async function bulkUploadChemicalQuestionsPDF(
  file: File,
  subjectId: string,
  chapterId?: string,
  aiProvider: 'mistral' | 'gemini' = 'gemini'
) {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const formData = new FormData();

    // Add the PDF file
    formData.append('file', file);

    // Add required subject ID
    formData.append('subjectId', subjectId);

    // Add AI provider choice
    formData.append('aiProvider', aiProvider);

    // Add optional topic ID (backend expects topicId, not chapterId)
    if (chapterId) {
      formData.append('topicId', chapterId);
    }

    const response = await fetch(`${baseUrl}/questions/bulk-upload-chemical-pdf`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Chemical PDF upload error response:", errorData);

      // Check if we have detailed validation errors
      if (errorData.details) {
        const errorMessages = Object.entries(errorData.details)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        throw new Error(errorMessages || errorData.message || `Error: ${response.status}`);
      }

      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading chemical PDF questions:", error);
    throw error;
  }
}


/**
 * Bulk upload questions from JSON
 * @param file JSON file containing questions (array or { data: [] } or { questions: [] })
 * @param subjectId Subject ID for the questions
 * @param chapterId Chapter/Topic ID for the questions (optional, sent as topicId)
 * @returns The upload result
 */
export async function bulkUploadQuestionsJSON(
  file: File,
  subjectId: string,
  chapterId?: string
) {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const formData = new FormData();

    // Add the JSON file
    formData.append('file', file);

    // Add required subject ID
    formData.append('subjectId', subjectId);

    // Add optional topic ID (backend expects topicId)
    if (chapterId) {
      formData.append('topicId', chapterId);
    }

    const response = await fetch(`${baseUrl}/questions/bulk-upload-pdf`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("JSON upload error response:", errorData);

      // Check if we have detailed validation errors
      if (errorData.details) {
        const errorMessages = Object.entries(errorData.details)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        throw new Error(errorMessages || errorData.message || `Error: ${response.status}`);
      }

      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading JSON questions:", error);
    throw error;
  }
}










