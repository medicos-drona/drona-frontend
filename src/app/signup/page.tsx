"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/AuthContext";
import { loginWithFirebaseToken } from "@/lib/api";

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SignupPage() {
  const router = useRouter();
  const { signUp, loginWithGoogle, deleteAccount, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // First sign up with Firebase
      await signUp(values.email, values.password, values.name);
      
      // Then authenticate with backend using Firebase token
      try {
        const backendAuth = await loginWithFirebaseToken();
        
        // Verify we have a valid response with access token
        if (!backendAuth || !backendAuth.accessToken) {
          throw new Error("Invalid response from server. Missing access token.");
        }
        
        // Store backend JWT token
        localStorage.setItem("backendToken", backendAuth.accessToken);
        
        // Store user role
        if (backendAuth.user && backendAuth.user.role) {
          localStorage.setItem("userRole", backendAuth.user.role);
          
          // Redirect based on role
          redirectBasedOnRole(backendAuth.user.role);
          toast.success("Signed up successfully!");
        } else {
          throw new Error("User role not provided in response");
        }
      } catch (backendError: any) {
        console.error("Backend authentication failed:", backendError);
        toast.error(backendError.message || "Backend authentication failed. Please try again.");
        
        // Delete the Firebase account since backend auth failed
        try {
          await deleteAccount();
        } catch (deleteError) {
          console.error("Failed to delete Firebase account:", deleteError);
        }
        return;
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to sign up. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      
      // Then authenticate with backend using Firebase token
      try {
        const backendAuth = await loginWithFirebaseToken();
        
        // Verify we have a valid response with access token
        if (!backendAuth || !backendAuth.accessToken) {
          throw new Error("Invalid response from server. Missing access token.");
        }
        
        // Store backend JWT token
        localStorage.setItem("backendToken", backendAuth.accessToken);
        
        // Store user role
        if (backendAuth.user && backendAuth.user.role) {
          localStorage.setItem("userRole", backendAuth.user.role);
          
          // Redirect based on role
          redirectBasedOnRole(backendAuth.user.role);
          toast.success("Signed up with Google successfully!");
        } else {
          throw new Error("User role not provided in response");
        }
      } catch (backendError: any) {
        console.error("Backend authentication failed:", backendError);
        toast.error(backendError.message || "Backend authentication failed. Please try again.");
        
        // Sign out from Firebase since backend auth failed
        await logout();
        return;
      }
    } catch (error: any) {
      console.error("Google signup error:", error);
      toast.error(error.message || "Failed to sign up with Google. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  }

  // Function to redirect based on user role
  function redirectBasedOnRole(role: string) {
    switch (role) {
      case 'superAdmin':
        router.push("/admin");  // Use your existing admin page
        break;
      case 'collegeAdmin':
        router.push("/college"); // Use your existing college page
        break;
      case 'teacher':
        router.push("/teacher"); // Use your existing teacher page
        break;
      default:
        router.push("/"); // Default to home page
        break;
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Signup Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center">
              <img src="/assets/logo/medicos-logo.svg" alt="MEDICOS" className="h-[70px] w-auto" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-sm text-gray-600 mb-6">Enter your details to create a new account</p>

          {/* Google Sign Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 px-4 mb-6 text-gray-700 hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.9895 10.1871C19.9895 9.36767 19.9214 8.76973 19.7742 8.14966H10.1992V11.848H15.8195C15.7062 12.7671 15.0943 14.1512 13.7346 15.0813L13.7155 15.2051L16.7429 17.4969L16.9527 17.5174C18.879 15.7789 19.9895 13.221 19.9895 10.1871Z" fill="#4285F4"/>
                <path d="M10.1993 19.9313C12.9527 19.9313 15.2643 19.0454 16.9527 17.5174L13.7346 15.0813C12.8734 15.6682 11.7176 16.0779 10.1993 16.0779C7.50243 16.0779 5.21352 14.3395 4.39759 11.9366L4.27799 11.9466L1.13003 14.3273L1.08887 14.4391C2.76588 17.6945 6.21061 19.9313 10.1993 19.9313Z" fill="#34A853"/>
                <path d="M4.39748 11.9366C4.18219 11.3166 4.05759 10.6521 4.05759 9.96565C4.05759 9.27909 4.18219 8.61473 4.38615 7.99466L4.38045 7.8626L1.19304 5.44366L1.08875 5.49214C0.397576 6.84305 0.000976562 8.36008 0.000976562 9.96565C0.000976562 11.5712 0.397576 13.0882 1.08875 14.4391L4.39748 11.9366Z" fill="#FBBC05"/>
                <path d="M10.1993 3.85336C12.1142 3.85336 13.406 4.66168 14.1425 5.33717L17.0207 2.59107C15.253 0.985496 12.9527 0 10.1993 0C6.2106 0 2.76588 2.23672 1.08887 5.49214L4.38626 7.99466C5.21352 5.59183 7.50242 3.85336 10.1993 3.85336Z" fill="#EB4335"/>
              </svg>
            )}
            {isGoogleLoading ? "Signing up..." : "Sign up with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center mb-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-sm text-gray-500">Or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Full Name*</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="w-full rounded-md border border-gray-300 py-2 px-3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Email Address*</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        className="w-full rounded-md border border-gray-300 py-2 px-3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Password*</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="w-full rounded-md border border-gray-300 py-2 px-3"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-gray-400"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Confirm Password*</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          className="w-full rounded-md border border-gray-300 py-2 px-3"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 text-gray-400"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Right Panel - Green Background with Quote */}
      <div className="hidden md:flex md:w-1/2 bg-green-800 items-center justify-center p-12 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 text-center max-w-md">
          <blockquote className="text-white text-xl font-medium">
            "Education is the most powerful weapon which you can use to change the world."
            <footer className="mt-2 text-white text-opacity-80">– Nelson Mandela</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}





