import { toast } from 'sonner';

export interface ApiError {
  success: false;
  error: string;
  statusCode?: number;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

/**
 * Handles API errors and shows appropriate user notifications
 * @param error - The error object or message
 * @param defaultMessage - Default message to show if error message is not available
 * @param showToast - Whether to show a toast notification (default: true)
 * @returns Formatted error object
 */
export function handleApiError(
  error: any, 
  defaultMessage: string = 'An error occurred. Please try again.',
  showToast: boolean = true
): ApiError {
  let errorMessage = defaultMessage;
  let statusCode: number | undefined;

  // Extract error message from different error formats
  if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error?.data?.message) {
    errorMessage = error.data.message;
  }

  // Extract status code if available
  if (error?.status) {
    statusCode = error.status;
  } else if (error?.response?.status) {
    statusCode = error.response.status;
  }

  // Improve error messages based on common patterns
  if (errorMessage.includes('already exists')) {
    // Keep the original message for duplicate entries as it's already user-friendly
  } else if (errorMessage.includes('Authentication') || errorMessage.includes('Unauthorized')) {
    errorMessage = 'Please log in again to continue. Your session may have expired.';
  } else if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
    errorMessage = 'Please check your internet connection and try again.';
  } else if (errorMessage.includes('not found')) {
    errorMessage = 'The requested resource was not found.';
  } else if (errorMessage.includes('Forbidden')) {
    errorMessage = 'You do not have permission to perform this action.';
  } else if (statusCode === 500) {
    errorMessage = 'Server error. Please try again later.';
  } else if (statusCode === 503) {
    errorMessage = 'Service temporarily unavailable. Please try again later.';
  }

  // Show toast notification if requested
  if (showToast) {
    toast.error(errorMessage);
  }

  return {
    success: false,
    error: errorMessage,
    statusCode
  };
}

/**
 * Creates a success response object
 * @param data - The success data
 * @param showToast - Whether to show a success toast (default: false)
 * @param successMessage - Success message to show in toast
 * @returns Success response object
 */
export function createSuccessResponse<T>(
  data: T, 
  showToast: boolean = false, 
  successMessage?: string
): ApiSuccess<T> {
  if (showToast && successMessage) {
    toast.success(successMessage);
  }

  return {
    success: true,
    data
  };
}

/**
 * Wrapper for API calls that handles errors consistently
 * @param apiCall - The API function to call
 * @param defaultErrorMessage - Default error message
 * @param showErrorToast - Whether to show error toast
 * @returns Promise with ApiResponse
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  defaultErrorMessage: string = 'Operation failed. Please try again.',
  showErrorToast: boolean = true
): Promise<ApiResponse<T>> {
  try {
    const result = await apiCall();
    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError(error, defaultErrorMessage, showErrorToast);
  }
}

/**
 * Checks if an API response is successful
 * @param response - The API response to check
 * @returns True if successful, false otherwise
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success === true;
}

/**
 * Checks if an API response is an error
 * @param response - The API response to check
 * @returns True if error, false otherwise
 */
export function isApiError<T>(response: ApiResponse<T>): response is ApiError {
  return response.success === false;
}
