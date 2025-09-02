import { apiCall } from '../api';
import { Subject } from './subjects';

export interface Topic {
  _id: string;
  name: string;
  chapterId?: string; // Topic belongs to chapter (new hierarchy)
  subjectId?: string | Subject; // Keep for backward compatibility
  description?: string;
}

/**
 * Get all topics
 * @param chapterId Optional chapter ID to filter topics
 * @param subjectId Optional subject ID to filter topics (for backward compatibility)
 * @returns List of topics
 */
export const getAllTopics = async (chapterId?: string, subjectId?: string): Promise<Topic[]> => {
  try {
    const params = new URLSearchParams();
    if (chapterId) params.append('chapterId', chapterId);
    if (subjectId) params.append('subjectId', subjectId);

    const queryString = params.toString();
    const endpoint = queryString ? `/topics?${queryString}` : '/topics';

    return await apiCall(endpoint);
  } catch (error: any) {
    console.error('Error fetching topics:', error);
    throw new Error(error.message || 'Failed to fetch topics');
  }
};

/**
 * Get a topic by ID
 * @param id Topic ID
 * @returns Topic details
 */
export const getTopicById = async (id: string): Promise<Topic> => {
  try {
    return await apiCall(`/topics/${id}`);
  } catch (error: any) {
    console.error(`Error fetching topic ${id}:`, error);
    throw new Error(error.message || 'Failed to fetch topic');
  }
};

/**
 * Create a new topic
 * @param topicData Topic data to create
 * @returns Created topic
 */
export const createTopic = async (
  topicData: { name: string; subjectId: string; description?: string }
): Promise<Topic> => {
  try {
    return await apiCall('/topics', {
      method: 'POST',
      body: JSON.stringify(topicData),
    });
  } catch (error: any) {
    console.error('Error creating topic:', error);
    throw new Error(error.message || 'Failed to create topic');
  }
};

/**
 * Update a topic
 * @param id Topic ID
 * @param topicData Topic data to update
 * @returns Updated topic
 */
export const updateTopic = async (
  id: string,
  topicData: { name?: string; description?: string }
): Promise<Topic> => {
  try {
    return await apiCall(`/topics/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(topicData),
    });
  } catch (error: any) {
    console.error(`Error updating topic ${id}:`, error);
    throw new Error(error.message || 'Failed to update topic');
  }
};

/**
 * Delete a topic
 * @param id Topic ID
 */
export const deleteTopic = async (id: string): Promise<void> => {
  try {
    await apiCall(`/topics/${id}`, {
      method: 'DELETE',
    });
  } catch (error: any) {
    console.error(`Error deleting topic ${id}:`, error);
    throw new Error(error.message || 'Failed to delete topic');
  }
};