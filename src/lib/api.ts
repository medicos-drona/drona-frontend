import { User } from "firebase/auth";

/**
 * Gets the Firebase ID token for the current user
 * @param user - Firebase User object
 * @returns Firebase ID token
 */
export async function getFirebaseToken(user: User): Promise<string> {
  try {
    const token = await user.getIdToken(true);
    // Store token in localStorage for API calls
    localStorage.setItem("firebaseToken", token);
    return token;
  } catch (error) {
    console.error("Error getting Firebase token:", error);
    throw error;
  }
}

/**
 * Login to backend using Firebase token
 * @returns JWT token and user info from backend
 */
export async function loginWithFirebaseToken() {
  const firebaseToken = localStorage.getItem('firebaseToken');
  
  if (!firebaseToken) {
    throw new Error('No Firebase token available');
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  
  try {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseToken }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.accessToken || !data.user || !data.user.role) {
      throw new Error('Invalid response format from server');
    }
    
    return data;
  } catch (error) {
    console.error('Error in loginWithFirebaseToken:', error);
    throw error;
  }
}

/**
 * Login to backend using email and password
 * @param email User email
 * @param password User password
 * @returns JWT token and user info from backend
 */
export async function loginWithEmailPassword(email: string, password: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  
  try {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.accessToken || !data.user || !data.user.role) {
      throw new Error('Invalid response format from server');
    }
    
    return data;
  } catch (error) {
    console.error('Error in loginWithEmailPassword:', error);
    throw error;
  }
}

/**
 * Makes an authenticated API call to the backend using Firebase token
 * @param endpoint - API endpoint path (without base URL)
 * @param options - Fetch options (method, body, etc.)
 * @returns Response data
 */
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Get Firebase token from localStorage
  const firebaseToken = localStorage.getItem('firebaseToken');
  const backendToken = localStorage.getItem('backendToken');
  
  // Set default headers - prefer backend token if available
  const headers = {
    'Content-Type': 'application/json',
    ...(backendToken ? { 'Authorization': `Bearer ${backendToken}` } : 
       firebaseToken ? { 'Authorization': `Bearer ${firebaseToken}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    // Parse JSON response if available
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}







