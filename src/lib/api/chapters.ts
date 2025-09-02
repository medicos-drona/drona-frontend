import { apiCall } from '../api';
import { Subject } from './subjects';

export interface Chapter {
  _id: string;
  name: string;
  subjectId: string | Subject;
  description?: string;
}

export interface ChapterWithQuestionCount extends Chapter {
  questionCount: number;
}

/**
 * Get all chapters
 * @param subjectId Optional subject ID to filter chapters
 * @returns List of chapters
 */
export const getAllChapters = async (subjectId?: string): Promise<Chapter[]> => {
  try {
    const endpoint = subjectId ? `/chapters?subjectId=${subjectId}` : '/chapters';
    return await apiCall(endpoint);
  } catch (error: any) {
    console.error('Error fetching chapters:', error);
    throw new Error(error.message || 'Failed to fetch chapters');
  }
};

/**
 * Get chapters with unused question counts for a specific subject
 * This shows only questions that are available for download (not used by the college)
 * @param subjectId Subject ID to get chapters for
 * @returns List of chapters with unused question counts
 */
export const getChaptersWithQuestionCounts = async (subjectId: string): Promise<ChapterWithQuestionCount[]> => {
  try {
    const chapters = await getAllChapters(subjectId);

    // Get total question counts for each chapter/topic
    const chaptersWithCounts = await Promise.all(
      chapters.map(async (chapter) => {
        try {
          // Get total question count for this chapter/topic
          const totalCount = await getQuestionCountByTopic(chapter._id, subjectId);
          console.log(`✅ Chapter ${chapter.name}: ${totalCount} total questions`);
          return {
            ...chapter,
            questionCount: totalCount
          };
        } catch (error) {
          console.warn(`Failed to get total question count for chapter ${chapter.name}:`, error);
          return {
            ...chapter,
            questionCount: 0
          };
        }
      })
    );

    return chaptersWithCounts;
  } catch (error: any) {
    console.error('Error fetching chapters with question counts:', error);
    throw new Error(error.message || 'Failed to fetch chapters with question counts');
  }
};

/**
 * Get a chapter by ID
 * @param id Chapter ID
 * @returns Chapter details
 */
export const getChapterById = async (id: string): Promise<Chapter> => {
  try {
    return await apiCall(`/chapters/${id}`);
  } catch (error: any) {
    console.error(`Error fetching chapter ${id}:`, error);
    throw new Error(error.message || 'Failed to fetch chapter');
  }
};

/**
 * Create a new chapter
 * @param chapterData Chapter data
 * @returns Created chapter
 */
export const createChapter = async (chapterData: {
  name: string;
  subjectId: string;
  description?: string;
}): Promise<Chapter> => {
  try {
    return await apiCall('/chapters', {
      method: 'POST',
      body: JSON.stringify(chapterData),
    });
  } catch (error: any) {
    console.error('Error creating chapter:', error);
    throw new Error(error.message || 'Failed to create chapter');
  }
};

/**
 * Update a chapter
 * @param id Chapter ID
 * @param chapterData Updated chapter data
 * @returns Updated chapter
 */
export const updateChapter = async (
  id: string,
  chapterData: Partial<{
    name: string;
    subjectId: string;
    description?: string;
  }>
): Promise<Chapter> => {
  try {
    return await apiCall(`/chapters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(chapterData),
    });
  } catch (error: any) {
    console.error(`Error updating chapter ${id}:`, error);
    throw new Error(error.message || 'Failed to update chapter');
  }
};

/**
 * Delete a chapter
 * @param id Chapter ID
 */
export const deleteChapter = async (id: string): Promise<void> => {
  try {
    await apiCall(`/chapters/${id}`, {
      method: 'DELETE',
    });
  } catch (error: any) {
    console.error(`Error deleting chapter ${id}:`, error);
    throw new Error(error.message || 'Failed to delete chapter');
  }
};

// Keep Topic exports for backward compatibility
export type Topic = Chapter;
export type TopicWithQuestionCount = ChapterWithQuestionCount;
export const getAllTopics = getAllChapters;
export const getTopicsWithQuestionCounts = getChaptersWithQuestionCounts;
export const getTopicById = getChapterById;
export const createTopic = createChapter;
export const updateTopic = updateChapter;
export const deleteTopic = deleteChapter;

/**
 * Get question count for a specific topic
 * @param topicId Topic ID to get question count for
 * @param subjectId Subject ID (required by the API)
 * @returns Number of questions available for the topic
 */
export const getQuestionCountByTopic = async (topicId: string, subjectId: string): Promise<number> => {
  try {
    const { apiCall } = await import("../api")

    console.log(`🔄 FALLBACK API: Calling old questions API for topic ${topicId}, subject ${subjectId}`)
    console.log(`📞 OLD API URL: /questions?subjectId=${subjectId}&topicId=${topicId}&limit=1`)

    // Use the questions API to count questions for this topic
    // Set limit=1 to minimize data transfer since we only need the count
    // Both subjectId and topicId are required by the backend API
    const response = await apiCall(`/questions?subjectId=${subjectId}&topicId=${topicId}&limit=1`)

    // The response should have pagination info with totalItems
    if (response && response.pagination && typeof response.pagination.totalItems === 'number') {
      return response.pagination.totalItems
    }

    // Fallback: if no pagination info, try to get total count from questions array length
    // This shouldn't happen with the current API, but it's a safety net
    if (response && Array.isArray(response.questions)) {
      // If we got exactly 1 question and no pagination, we can't determine the total
      // So we'll return 1 as a minimum
      return response.questions.length > 0 ? 1 : 0
    }

    return 0
  } catch (error: any) {
    // Log the error but don't throw - we want the UI to continue working
    console.warn(`Could not fetch question count for topic ${topicId} in subject ${subjectId}:`, error.message || error)
    return 0 // Return 0 on error to avoid breaking the UI
  }
}

/**
 * Get unused question count for a specific topic using the dedicated API endpoint
 * This uses the exact same validation logic as actual paper generation to get accurate counts
 * @param topicId Topic ID to get unused question count for
 * @param subjectId Subject ID (required by the API)
 * @returns Number of unused questions available for download by the college
 */
export const getUnusedQuestionCountByTopic = async (topicId: string, subjectId: string): Promise<number> => {
  try {
    const { apiCall } = await import("../api")

    console.log(`🎯 Getting unused question count for topic ${topicId} using dedicated API`)

    // Use the new dedicated endpoint that uses the same logic as question paper generation
    const response = await apiCall(`/question-papers/unused-questions-count?subjectId=${subjectId}&topicId=${topicId}`)

    console.log(`🔍 Unused questions count API response for topic ${topicId}:`, response)

    // The response should have the unused count
    if (response && typeof response.unusedCount === 'number') {
      console.log(`✅ Found ${response.unusedCount} unused questions for topic ${topicId} (same logic as paper generation)`)
      return response.unusedCount
    }

    console.warn(`⚠️ No unusedCount in response for topic ${topicId}, falling back to total count`)
    console.warn(`📋 Response received:`, response)

  } catch (error: any) {
    console.error(`❌ Dedicated API FAILED for topic ${topicId} in subject ${subjectId}:`, error)
    console.error(`📋 Error details:`, error.message || error)
  }

  // Fallback to total count if the dedicated API fails
  console.warn(`🔄 FALLBACK: Using total question count`)
  return await getQuestionCountByTopic(topicId, subjectId)
}

/**
 * Get topics with question counts for a specific subject using /subjects/with-topics endpoint
 * This fetches actual topics (not chapters) for the chapter selection step
 * @param subjectId Subject ID to get topics for
 * @returns List of topics with question counts
 */
export const getTopicsForChapterSelection = async (subjectId: string): Promise<ChapterWithQuestionCount[]> => {
  try {
    // Use the direct /subjects/with-topics endpoint
    const { getSubjectsWithTopics } = await import("./subjects")
    const subjects = await getSubjectsWithTopics()

    // Find the subject
    const subject = subjects.find(s => s._id === subjectId)
    if (!subject) {
      throw new Error(`Subject not found: ${subjectId}`)
    }

    // Convert topics to ChapterWithQuestionCount format and fetch TOTAL question counts
    const topicsWithCounts: ChapterWithQuestionCount[] = await Promise.all(
      subject.topics.map(async (topic) => {
        const totalQuestionCount = await getQuestionCountByTopic(topic._id, subjectId)
        return {
          _id: topic._id,
          name: topic.name,
          subjectId: subjectId,
          description: topic.description,
          questionCount: totalQuestionCount  // Shows total questions available
        }
      })
    )

    return topicsWithCounts
  } catch (error: any) {
    console.error('Error fetching topics for chapter selection:', error)
    throw new Error(error.message || 'Failed to fetch topics for chapter selection')
  }
}
