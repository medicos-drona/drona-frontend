"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser
} from "firebase/auth";
import { auth } from "./firebase";
import { UserRole } from "./constants/enums";
import { getFirebaseToken, loginWithFirebaseToken } from "./api";

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setUserRole: (role: UserRole) => void;
  handlePasswordResetCompletion: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // User is signed in
        // Get user role from localStorage (set during login/signup)
        const storedRole = localStorage.getItem("userRole");
        console.log("AuthContext - Retrieved role from localStorage:", storedRole);
        
        if (storedRole) {
          setUserRole(storedRole as UserRole);
        } else {
          // If no role in localStorage but user is logged in, try to get it from backend
          try {
            console.log("No role in localStorage, trying to get from backend");
            const token = await user.getIdToken();
            localStorage.setItem("firebaseToken", token);
            
            // Try to authenticate with backend to get role
            const backendAuth = await loginWithFirebaseToken();
            if (backendAuth && backendAuth.user && backendAuth.user.role) {
              console.log("Got role from backend:", backendAuth.user.role);
              localStorage.setItem("userRole", backendAuth.user.role);
              setUserRole(backendAuth.user.role as UserRole);
            }
          } catch (error) {
            console.error("Failed to get role from backend:", error);
          }
        }
      } else {
        // User is signed out
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update the user's display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });

        // Get Firebase token
        await getFirebaseToken(userCredential.user);

        // Set default role
        // Comment out the default role setting to allow backend to determine role
        // localStorage.setItem("userRole", UserRole.TEACHER);
        // setUserRole(UserRole.TEACHER);
      }
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get Firebase token
      await getFirebaseToken(userCredential.user);
      
      // Note: We'll get the user role from the backend response in the login page
      // and set it there, rather than here
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Get Firebase token
      await getFirebaseToken(result.user);
      
      // Note: We'll get the user role from the backend response in the login page
      // and set it there, rather than here
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear local storage
      localStorage.removeItem('backendToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('firebaseToken');
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      
      // Optional: Notify backend about password reset request
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        await fetch(`${baseUrl}/auth/reset-password-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch (backendError) {
        console.warn("Failed to notify backend about password reset:", backendError);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  };

  const handlePasswordResetCompletion = async () => {
    try {
      if (!user) {
        throw new Error("No authenticated user found");
      }
      
      // Get and store Firebase token
      await getFirebaseToken(user);
      
      // Authenticate with backend
      try {
        const backendAuth = await loginWithFirebaseToken();
        if (backendAuth.accessToken) {
          localStorage.setItem("backendToken", backendAuth.accessToken);
        }
      } catch (backendError) {
        console.warn("Backend authentication after password reset failed:", backendError);
      }
    } catch (error) {
      console.error("Error handling password reset completion:", error);
    }
  };

  const updateUserRole = (role: UserRole) => {
    localStorage.setItem("userRole", role);
    setUserRole(role);
  };

  const deleteAccount = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteUser(currentUser);
        // Clear local storage
        localStorage.removeItem('backendToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('firebaseToken');
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };

  const value = {
    user,
    userRole,
    loading,
    signUp,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    setUserRole: updateUserRole,
    handlePasswordResetCompletion,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useSafeAuth() {
  const context = useContext(AuthContext);
  return context || {
    user: null,
    userRole: null,
    loading: true,
    signUp: async () => { throw new Error("AuthProvider not found") },
    login: async () => { throw new Error("AuthProvider not found") },
    loginWithGoogle: async () => { throw new Error("AuthProvider not found") },
    logout: async () => { throw new Error("AuthProvider not found") },
    resetPassword: async () => { throw new Error("AuthProvider not found") },
    setUserRole: () => { throw new Error("AuthProvider not found") },
    handlePasswordResetCompletion: async () => { throw new Error("AuthProvider not found") },
    deleteAccount: async () => { throw new Error("AuthProvider not found") }
  };
}

















