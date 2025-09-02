import { handleApiError, createSuccessResponse, ApiResponse } from '@/lib/utils/errorHandler';

/**
 * Interface for college data
 */
export interface CollegeData {
  name: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  logoUrl?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
}

/**
 * Create a new college
 * @param collegeData The college data
 * @returns The created college
 */
export async function createCollege(collegeData: CollegeData): Promise<ApiResponse> {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    return handleApiError(
      "Authentication required",
      "Authentication required. Please log in again."
    );
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${baseUrl}/colleges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(collegeData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return handleApiError(
        errorData.message || `Error: ${response.status}`,
        "Failed to create college. Please try again."
      );
    }

    const result = await response.json();
    return createSuccessResponse(result, true, "College created successfully!");
  } catch (error) {
    console.error("Error creating college:", error);
    return handleApiError(
      error instanceof Error ? error.message : "Failed to create college. Please try again.",
      "Failed to create college. Please try again."
    );
  }
}

/**
 * Get all colleges
 * @returns List of colleges
 */
export async function getColleges(): Promise<ApiResponse> {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    return handleApiError(
      "Authentication required",
      "Authentication required. Please log in again."
    );
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${baseUrl}/colleges`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return handleApiError(
        errorData.message || `Error: ${response.status}`,
        "Failed to load colleges. Please try again."
      );
    }

    const result = await response.json();
    return createSuccessResponse(result);
  } catch (error) {
    console.error("Error fetching colleges:", error);
    return handleApiError(
      error instanceof Error ? error.message : "Failed to load colleges. Please try again.",
      "Failed to load colleges. Please try again."
    );
  }
}

/**
 * Delete a college
 * @param id College ID
 * @returns The deleted college
 */
export async function deleteCollege(id: string): Promise<ApiResponse> {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    return handleApiError(
      "Authentication required",
      "Authentication required. Please log in again."
    );
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${baseUrl}/colleges/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return handleApiError(
        errorData.message || `Error: ${response.status}`,
        "Failed to delete college. Please try again."
      );
    }

    const result = await response.json();
    return createSuccessResponse(result, true, "College deleted successfully!");
  } catch (error) {
    console.error("Error deleting college:", error);
    return handleApiError(
      error instanceof Error ? error.message : "Failed to delete college. Please try again.",
      "Failed to delete college. Please try again."
    );
  }
}

/**
 * Get a college by ID
 * @param id College ID
 * @returns The college
 */
export async function getCollegeById(id: string): Promise<ApiResponse> {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    return handleApiError(
      "Authentication required",
      "Authentication required. Please log in again."
    );
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${baseUrl}/colleges/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return handleApiError(
        errorData.message || `Error: ${response.status}`,
        "Failed to load college. Please try again."
      );
    }

    const result = await response.json();
    return createSuccessResponse(result);
  } catch (error) {
    console.error("Error fetching college:", error);
    return handleApiError(
      error instanceof Error ? error.message : "Failed to load college. Please try again.",
      "Failed to load college. Please try again."
    );
  }
}

/**
 * Update a college
 * @param id College ID
 * @param collegeData The updated college data
 * @returns The updated college
 */
export async function updateCollege(id: string, collegeData: CollegeData): Promise<ApiResponse> {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    return handleApiError(
      "Authentication required",
      "Authentication required. Please log in again."
    );
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${baseUrl}/colleges/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(collegeData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return handleApiError(
        errorData.message || `Error: ${response.status}`,
        "Failed to update college. Please try again."
      );
    }

    const result = await response.json();
    return createSuccessResponse(result, true, "College updated successfully!");
  } catch (error) {
    console.error("Error updating college:", error);
    return handleApiError(
      error instanceof Error ? error.message : "Failed to update college. Please try again.",
      "Failed to update college. Please try again."
    );
  }
}
/**
 * Get a college by ID
 * @param id College ID
 * @returns The college
 */
export async function getCollegeAnalytics(id: string) {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    throw new Error("Authentication required");
  }
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${baseUrl}/analytics/college/${id}/summary`, {
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
    console.error("Error fetching college:", error);
    throw error;
  }
}

/**
 * Get daily-wise question paper statistics by subject for a college
 * @param id College ID
 * @param startDate ISO start date string
 * @param endDate ISO end date string
 * @returns Statistics data
 */
export async function getQuestionPaperStatsByDateRange(id: string, startDate: string, endDate: string) {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const url = `${baseUrl}/analytics/college/${id}/question-papers?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching question paper stats:", error);
    throw error;
  }
}

/**
 * Get top teachers generating papers for a college
 * @param id College ID
 * @param limit Number of top teachers to return (optional, default: 10)
 * @returns Top teachers data
 */
export async function getTopTeachers(id: string, limit = 10) {
  const token = localStorage.getItem("backendToken");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const url = `${baseUrl}/analytics/college/${id}/top-teachers?limit=${limit}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching top teachers:", error);
    throw error;
  }
}
