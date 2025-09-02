import { apiCall } from '../api';

export interface PlatformSummary {
  totalColleges: number;
  totalTeachers: number;
  totalQuestions: number;
  totalPapers: number;
  totalDownloads: number;
  recentActivity: {
    logins: number;
    paperGenerations: number;
    downloads: number;
  };
}

/**
 * Get platform summary statistics
 * @returns Platform summary data
 */
export const getPlatformSummary = async (): Promise<PlatformSummary> => {
  try {
    return await apiCall('/analytics/platform-summary');
  } catch (error: any) {
    console.error('Error fetching platform summary:', error);
    throw new Error(error.message || 'Failed to fetch platform summary');
  }
};

/**
 * Get top colleges by various metrics
 * @returns Top colleges data
 */
export const getTopColleges = async () => {
  try {
    return await apiCall('/analytics/top-colleges');
  } catch (error: any) {
    console.error('Error fetching top colleges:', error);
    throw new Error(error.message || 'Failed to fetch top colleges data');
  }
};

/**
 * Get question usage statistics
 * @returns Question usage data
 */
export const getQuestionUsage = async () => {
  try {
    return await apiCall('/analytics/question-usage');
  } catch (error: any) {
    console.error('Error fetching question usage:', error);
    throw new Error(error.message || 'Failed to fetch question usage data');
  }
};

/**
 * Get question statistics
 * @returns Question statistics data
 */
export const getQuestionStats = async () => {
  try {
    return await apiCall('/analytics/question-stats');
  } catch (error: any) {
    console.error('Error fetching question stats:', error);
    throw new Error(error.message || 'Failed to fetch question statistics');
  }
};

/**
 * Interface for usage trends response
 */
export interface UsageTrendsResponse {
  data: {
    month: string;
    monthName: string;
    questionsCreated: number;
    papersGenerated: number;
    totalUsage: number;
  }[];
  summary: {
    totalMonths: number;
    totalQuestionsCreated: number;
    totalPapersGenerated: number;
    averageMonthlyQuestions: number;
    averageMonthlyPapers: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

/**
 * Get usage trends data for charts
 * @param year Optional year to filter by (e.g., 2024)
 * @param startDate Optional start date for custom range (ISO string)
 * @param endDate Optional end date for custom range (ISO string)
 * @returns Usage trends data
 */
export const getUsageTrends = async (
  year?: string,
  startDate?: string,
  endDate?: string
): Promise<UsageTrendsResponse> => {
  try {
    // Build query string
    let queryParams = '';
    if (year) queryParams += `year=${year}`;
    if (startDate) queryParams += `${queryParams ? '&' : ''}startDate=${startDate}`;
    if (endDate) queryParams += `${queryParams ? '&' : ''}endDate=${endDate}`;
    
    const endpoint = `/analytics/usage-trends${queryParams ? `?${queryParams}` : ''}`;
    
    return await apiCall(endpoint);
  } catch (error: any) {
    console.error('Error fetching usage trends:', error);
    throw new Error(error.message || 'Failed to fetch usage trends data');
  }
};
