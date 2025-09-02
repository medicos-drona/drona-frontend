"use client";

import React, { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import { Users, UserCheck, FileText, FileQuestion, Download } from "lucide-react";
import SubjectQuestionsChart from "@/components/SubjectQuestionsChart";
import TopTeachersList from "@/components/TopTeachersList";
import { getCollegeAnalytics, getTopTeachers } from "@/lib/api/college";

export default function DashboardPage() {
  const [collegeId, setCollegeId] = useState<string | null>(null);

  // Top teachers state
  const [teachers, setTeachers] = useState<any[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersError, setTeachersError] = useState<string | null>(null);

  // Subject colors
  const subjectColors = [
    { subject: "Math", color: "#4F46E5" },
    { subject: "Physics", color: "#10B981" },
    { subject: "Chemistry", color: "#F59E0B" },
    { subject: "Biology", color: "#EC4899" }
  ];

    // Add this useEffect to get collegeId from multiple sources
    useEffect(() => {
      // Try to get collegeId from localStorage
      const storedCollegeId = localStorage.getItem('collegeId');
      
      if (storedCollegeId) {
        console.log("Found collegeId in localStorage:", storedCollegeId);
        setCollegeId(storedCollegeId);
        return;
      }
      
      // If not found in localStorage, try to extract from JWT token
      try {
        const possibleTokenKeys = ['token', 'backendToken', 'authToken', 'jwtToken'];
        
        for (const key of possibleTokenKeys) {
          const token = localStorage.getItem(key);
          if (token) {
            try {
              const parts = token.split('.');
              if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                console.log("JWT payload:", payload);
                
                if (payload.collegeId) {
                  console.log(`Found collegeId in ${key}:`, payload.collegeId);
                  setCollegeId(payload.collegeId);
                  // Store it in localStorage for future use
                  localStorage.setItem('collegeId', payload.collegeId);
                  return;
                }
              }
            } catch (e) {
              console.error(`Error parsing token from ${key}:`, e);
            }
          }
        }
        
        // Log all localStorage keys for debugging
        console.log("All localStorage keys:", Object.keys(localStorage));
        console.error("Could not find collegeId in any token or localStorage");
      } catch (error) {
        console.error('Error getting collegeId:', error);
      }
    }, []);

  const handleTeacherClick = (teacher: { id: string; name: string; avatar: string; status?: "online" | "offline" | "away" }) => {
    if (teacher.status === "online" || teacher.status === "offline") {
      console.log("Clicked on teacher:", teacher.name);
    } else {
      console.warn("Teacher status is not clickable:", teacher.status ?? "unknown");
    }
  };

  // TODO: Replace with actual collegeId source if needed
  // const collegeId = "YOUR_COLLEGE_ID_HERE";
  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!collegeId) return;
      setSummaryLoading(true);
      setSummaryError(null);
      try {
        const data = await getCollegeAnalytics(collegeId);
        setSummary(data);
      } catch (err: any) {
        setSummaryError(err.message || 'Failed to load summary');
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, [collegeId]);

  useEffect(() => {
    const fetchTopTeachers = async () => {
      if (!collegeId) return;
      setTeachersLoading(true);
      setTeachersError(null);
      try {
        const data = await getTopTeachers(collegeId, 10);
        setTeachers(data);
      } catch (err: any) {
        setTeachersError(err.message || 'Failed to load top teachers');
        console.error('Error fetching top teachers:', err);
      } finally {
        setTeachersLoading(false);
      }
    };
    fetchTopTeachers();
  }, [collegeId]);

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          <StatCard 
            icon={<Users className="h-5 w-5 text-muted-foreground" />} 
            label="Total Teachers" 
            value={summary?.totalTeachers ?? 0} 
            loading={summaryLoading} 
            error={!!summaryError} 
          />
          <StatCard 
            icon={<UserCheck className="h-5 w-5 text-muted-foreground" />} 
            label="Active Teachers" 
            value={summary?.activeTeachers ?? 0} 
            loading={summaryLoading} 
            error={!!summaryError} 
            iconClassName="bg-green-100"
            valueClassName="text-green-600"
          />
          <StatCard 
            icon={<FileText className="h-5 w-5 text-muted-foreground" />} 
            label="Total Question Papers" 
            value={summary?.totalQuestionPapers ?? 0} 
            loading={summaryLoading} 
            error={!!summaryError} 
            iconClassName="bg-green-100" 
            valueClassName="text-green-600" 
          />
          <StatCard 
            icon={<FileQuestion className="h-5 w-5 text-muted-foreground" />} 
            label="Total Questions" 
            value={summary?.totalQuestions ?? 0} 
            loading={summaryLoading} 
            error={!!summaryError} 
            iconClassName="bg-amber-100" 
            valueClassName="text-amber-600" 
          />
          <StatCard 
            icon={<Download className="h-5 w-5 text-muted-foreground" />} 
            label="Total Downloads" 
            value={summary?.totalDownloads ?? 0} 
            loading={summaryLoading} 
            error={!!summaryError} 
            iconClassName="bg-purple-100" 
            valueClassName="text-purple-600" 
          />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
          {/* Important: Added overflow-hidden to prevent chart overflow */}
          <div className="lg:col-span-2 overflow-hidden">
            <SubjectQuestionsChart 
          title="Questions created per subject"
          collegeId={collegeId || ""}
          subjectColors={subjectColors}
          defaultTimeRange="Monthly"
          className="w-full h-full"
            />
          </div>
          <div className="lg:col-span-1">
            <TopTeachersList
              title="Top Teachers Generating Papers"
              teachers={teachersLoading ? [] : teachers}
              onTeacherClick={handleTeacherClick}
            />
            {teachersLoading && (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-muted-foreground">Loading top teachers...</div>
              </div>
            )}
            {teachersError && (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-red-500">Error: {teachersError}</div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}