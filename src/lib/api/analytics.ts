import { apiCall } from '../api';
import { handleApiError, createSuccessResponse, ApiResponse } from '@/lib/utils/errorHandler';

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
export const getTopColleges = async (): Promise<ApiResponse> => {
  try {
    const result = await apiCall('/analytics/top-colleges');
    return createSuccessResponse(result);
  } catch (error: any) {
    console.error('Error fetching top colleges:', error);
    return handleApiError(
      error.message || 'Failed to fetch top colleges data',
      'Failed to load top colleges data. Please try again.'
    );
  }
};

/**
 * Get question usage statistics
 * @returns Question usage data
 */
export const getQuestionUsage = async (): Promise<ApiResponse> => {
  try {
    const result = await apiCall('/analytics/question-usage');
    return createSuccessResponse(result);
  } catch (error: any) {
    console.error('Error fetching question usage:', error);
    return handleApiError(
      error.message || 'Failed to fetch question usage data',
      'Failed to load question usage data. Please try again.'
    );
  }
};

/**
 * Get question statistics
 * @returns Question statistics data
 */
export const getQuestionStats = async (): Promise<ApiResponse> => {
  try {
    const result = await apiCall('/analytics/question-stats');
    return createSuccessResponse(result);
  } catch (error: any) {
    console.error('Error fetching question stats:', error);
    return handleApiError(
      error.message || 'Failed to fetch question statistics',
      'Failed to load question statistics. Please try again.'
    );
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
    throw new Error(error.message || 'Failed to fetch usage trends');
  }
};

/**
 * Interface for college growth response
 */
export interface CollegeGrowthResponse {
  data: {
    month: string;
    monthName: string;
    collegesAdded: number;
    cumulativeColleges: number;
    monthlyTarget: number;
    targetAchievement: number;
    revenue: number;
    salesMetrics: {
      conversions: number;
      leads: number;
      conversionRate: number;
    };
  }[];
  summary: {
    totalMonths: number;
    totalCollegesAdded: number;
    averageMonthlyGrowth: number;
    totalTargetAchievement: number;
    totalRevenue: number;
  };
  targets: {
    monthlyTarget: number;
    yearlyTarget: number;
    currentProgress: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

/**
 * Get college growth data for charts
 * @param year Optional year to filter by (e.g., 2024)
 * @param startDate Optional start date for custom range (ISO string)
 * @param endDate Optional end date for custom range (ISO string)
 * @param view Optional view type (e.g., 'overview', 'sales', 'revenue')
 * @returns College growth data
 */
export const getCollegeGrowth = async (
  year?: string,
  startDate?: string,
  endDate?: string,
  view?: string
): Promise<CollegeGrowthResponse> => {
  try {
    // Build query string
    let queryParams = '';
    if (year) queryParams += `year=${year}`;
    if (startDate) queryParams += `${queryParams ? '&' : ''}startDate=${startDate}`;
    if (endDate) queryParams += `${queryParams ? '&' : ''}endDate=${endDate}`;
    if (view) queryParams += `${queryParams ? '&' : ''}view=${view}`;

    const endpoint = `/analytics/college-growth${queryParams ? `?${queryParams}` : ''}`;
    return await apiCall(endpoint);
  } catch (error: any) {
    console.error('Error fetching college growth:', error);
    throw new Error(error.message || 'Failed to fetch college growth');
  }
};