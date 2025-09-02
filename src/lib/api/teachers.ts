import { api } from './api';
import { handleApiError, createSuccessResponse, ApiResponse } from '@/lib/utils/errorHandler';

export interface TeacherData {
  name: string;
  email: string;
  phone: string;
  department?: string;
  designation?: string;
}

export interface UpdateTeacherProfileData {
  name: string;
  email: string;
  phone: string;
  profileImageUrl?: string;
}

interface AddTeacherData {
  name: string;
  email: string;
  phone: string;
  department?: string;
  designation?: string;
}

export const addTeacherToCollege = async (collegeId: string, data: AddTeacherData): Promise<ApiResponse> => {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('backendToken');

    if (!token) {
      return handleApiError(
        'Authentication token is missing. Please log in again.',
        'Authentication required. Please log in again.'
      );
    }

    // Set the authorization header with the token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Make the API request with the token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/colleges/${collegeId}/teachers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Return error response instead of throwing
      return handleApiError(
        errorData.message || `Error: ${response.status}`,
        'Failed to add teacher. Please try again.'
      );
    }

    const result = await response.json();
    return createSuccessResponse(result, true, 'Teacher added successfully!');
  } catch (error: any) {
    // Don't throw errors that would cause a redirect to login
    console.error('Error adding teacher:', error);
    return handleApiError(
      error.message || 'Failed to add teacher. Please try again.',
      'Failed to add teacher. Please try again.'
    );
  }
};

// Get teachers for a college with pagination
export const getCollegeTeachers = async (
  collegeId: string,
  page = 1,
  limit = 10,
  filters = {}
): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('backendToken');

    if (!token) {
      console.error('No authentication token found');
      return handleApiError(
        'Authentication token is missing. Please log in again.',
        'Authentication required. Please log in again.'
      );
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    // Update the URL to match the backend route structure
    const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/colleges/${collegeId}/teachers?${queryParams}`;
    console.log(`Fetching teachers: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store' // Prevent caching
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        return handleApiError(
          errorData.message || `Error: ${response.status}`,
          'Failed to load teachers. Please try again.'
        );
      } catch (e) {
        return handleApiError(
          `Error: ${response.status} - ${response.statusText}`,
          'Failed to load teachers. Please try again.'
        );
      }
    }

    const data = await response.json();
    console.log("Raw API response:", data);

    // If the API returns an array directly, wrap it in an object with pagination info
    if (Array.isArray(data)) {
      console.log("API returned an array, converting to paginated format");
      const result = {
        teachers: data,
        total: data.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(data.length / limit)
      };
      return createSuccessResponse(result);
    }

    return createSuccessResponse(data);
  } catch (error: any) {
    console.error('Error fetching college teachers:', error);
    return handleApiError(
      error.message || 'Failed to load teachers. Please try again.',
      'Failed to load teachers. Please try again.'
    );
  }
};

// Update a teacher
export const updateTeacher = async (teacherId: string, teacherData: any): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('backendToken');

    if (!token) {
      return handleApiError(
        'Authentication token is missing. Please log in again.',
        'Authentication required. Please log in again.'
      );
    }

    console.log('Updating teacher with data:', teacherData);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/teachers/${teacherId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(teacherData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return handleApiError(
        errorData.message || `Error: ${response.status}`,
        'Failed to update teacher. Please try again.'
      );
    }

    const result = await response.json();
    return createSuccessResponse(result, true, 'Teacher updated successfully!');
  } catch (error: any) {
    console.error('Error updating teacher:', error);
    return handleApiError(
      error.message || 'Failed to update teacher. Please try again.',
      'Failed to update teacher. Please try again.'
    );
  }
};

// Delete a teacher
export const deleteTeacher = async (teacherId: string): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('backendToken');

    if (!token) {
      return handleApiError(
        'Authentication token is missing. Please log in again.',
        'Authentication required. Please log in again.'
      );
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/teachers/${teacherId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return handleApiError(
        errorData.message || `Error: ${response.status}`,
        'Failed to delete teacher. Please try again.'
      );
    }

    const result = await response.json();
    return createSuccessResponse(result, true, 'Teacher deleted successfully!');
  } catch (error: any) {
    console.error('Error deleting teacher:', error);
    return handleApiError(
      error.message || 'Failed to delete teacher',
      'Failed to delete teacher. Please try again.'
    );
  }
};

// Update teacher's own profile
export const updateTeacherProfile = async (data: UpdateTeacherProfileData): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('backendToken');

    if (!token) {
      return handleApiError(
        'Authentication token is missing. Please log in again.',
        'Authentication required. Please log in again.'
      );
    }

    console.log('Updating teacher profile with data:', data);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/teachers/me`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return handleApiError(
        errorData.message || `Error: ${response.status}`,
        'Failed to update profile. Please try again.'
      );
    }

    const result = await response.json();
    return createSuccessResponse(result, true, 'Profile updated successfully!');
  } catch (error: any) {
    console.error('Error updating teacher profile:', error);
    return handleApiError(
      error.message || 'Failed to update profile. Please try again.',
      'Failed to update profile. Please try again.'
    );
  }
};

// Get current teacher's profile
export const getCurrentTeacherProfile = async (): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('backendToken');

    if (!token) {
      return handleApiError(
        'Authentication token is missing. Please log in again.',
        'Authentication required. Please log in again.'
      );
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/users/me`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return handleApiError(
        errorData.message || `Error: ${response.status}`,
        'Failed to load profile. Please try again.'
      );
    }

    const result = await response.json();
    return createSuccessResponse(result);
  } catch (error: any) {
    console.error('Error fetching current teacher profile:', error);
    return handleApiError(
      error.message || 'Failed to load profile. Please try again.',
      'Failed to load profile. Please try again.'
    );
  }
};














