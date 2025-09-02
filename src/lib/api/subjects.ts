import { apiCall } from '../api';
import { Chapter } from './chapters';

export interface Subject {
  _id: string;
  name: string;
  description?: string;
}

export interface Topic {
  _id: string;
  name: string;
  description?: string;
  chapterId?: string;
  subjectId?: string;
}

export interface ChapterWithTopics extends Chapter {
  topics: Topic[];
}

export interface SubjectWithChapters extends Subject {
  chapters: Chapter[];
}

export interface SubjectWithChaptersAndTopics extends Subject {
  chapters: ChapterWithTopics[];
}

// Keep backward compatibility
export interface SubjectWithTopics extends Subject {
  topics: Topic[];
}

/**
 * Get all subjects
 * @returns List of all subjects
 */
export const getAllSubjects = async (): Promise<Subject[]> => {
  try {
    return await apiCall('/subjects');
  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    throw new Error(error.message || 'Failed to fetch subjects');
  }
};

/**
 * Get all subjects with their chapters
 * @returns List of subjects with nested chapters
 */
export const getSubjectsWithChapters = async (): Promise<SubjectWithChapters[]> => {
  try {
    // Temporarily use with-topics endpoint until backend is restarted with new with-chapters endpoint
    const result = await apiCall('/subjects/with-topics');
    // Transform the response to use 'chapters' property name for consistency
    return result.map((subject: any) => ({
      ...subject,
      chapters: subject.topics || [], // Map topics to chapters
    }));
  } catch (error: any) {
    console.error('Error fetching subjects with chapters:', error);
    throw new Error(error.message || 'Failed to fetch subjects with chapters');
  }
};

/**
 * Get all subjects with their chapters and topics (full hierarchy)
 * @returns List of subjects with nested chapters and topics
 */
export const getSubjectsWithChaptersAndTopics = async (): Promise<SubjectWithChaptersAndTopics[]> => {
  try {
    return await apiCall('/subjects/with-chapters-and-topics');
  } catch (error: any) {
    console.error('Error fetching subjects with chapters and topics:', error);
    throw new Error(error.message || 'Failed to fetch subjects with chapters and topics');
  }
};

/**
 * Get all subjects with their topics (direct from /subjects/with-topics endpoint)
 * @returns List of subjects with nested topics
 */
export const getSubjectsWithTopics = async (): Promise<SubjectWithTopics[]> => {
  try {
    // Directly call the /subjects/with-topics endpoint
    const result = await apiCall('/subjects/with-topics');
    return result;
  } catch (error: any) {
    console.error('Error fetching subjects with topics:', error);
    throw new Error(error.message || 'Failed to fetch subjects with topics');
  }
};

/**
 * Get a subject by ID
 * @param id Subject ID
 * @returns Subject details
 */
export const getSubjectById = async (id: string): Promise<Subject> => {
  try {
    return await apiCall(`/subjects/${id}`);
  } catch (error: any) {
    console.error(`Error fetching subject ${id}:`, error);
    throw new Error(error.message || 'Failed to fetch subject');
  }
};

/**
 * Create a new subject
 * @param subjectData Subject data to create
 * @returns Created subject
 */
export const createSubject = async (subjectData: { name: string; description?: string }): Promise<Subject> => {
  try {
    return await apiCall('/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData),
    });
  } catch (error: any) {
    console.error('Error creating subject:', error);
    throw new Error(error.message || 'Failed to create subject');
  }
};

/**
 * Update a subject
 * @param id Subject ID
 * @param subjectData Subject data to update
 * @returns Updated subject
 */
export const updateSubject = async (
  id: string,
  subjectData: { name?: string; description?: string }
): Promise<Subject> => {
  try {
    return await apiCall(`/subjects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(subjectData),
    });
  } catch (error: any) {
    console.error(`Error updating subject ${id}:`, error);
    throw new Error(error.message || 'Failed to update subject');
  }
};

/**
 * Delete a subject
 * @param id Subject ID
 */
export const deleteSubject = async (id: string): Promise<void> => {
  try {
    await apiCall(`/subjects/${id}`, {
      method: 'DELETE',
    });
  } catch (error: any) {
    console.error(`Error deleting subject ${id}:`, error);
    throw new Error(error.message || 'Failed to delete subject');
  }
};