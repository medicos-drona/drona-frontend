"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UserRole } from "@/lib/constants/enums"
import CollegeChart from "@/components/CollegeChart"
import UsageChart from "@/components/UsageChart"
import StatCard from "@/components/StatCard"
import { Building, Users, FileQuestion, Download } from "lucide-react"
import { toast } from "sonner"
import { getPlatformSummary, PlatformSummary } from "@/lib/api/analytics"

export default function DashboardPage() {
  const currentMonth = new Date().getMonth();
  const [summary, setSummary] = useState<PlatformSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlatformSummary = async () => {
      try {
        setLoading(true);
        const data = await getPlatformSummary();
        setSummary(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching platform summary:", err);
        setError(err.message || "Failed to load dashboard data");
        toast.error("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformSummary();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            icon={<Building className="h-5 w-5 text-muted-foreground" />}
            label="Total Colleges"
            value={summary?.totalColleges ?? 0}
            loading={loading}
            error={error ? true : false}
          />
          
          <StatCard 
            icon={<Users className="h-5 w-5 text-muted-foreground" />}
            label="Total Teachers"
            value={summary?.totalTeachers ?? 0}
            loading={loading}
            error={error ? true : false}
            iconClassName="bg-blue-100"
            valueClassName="text-blue-600"
          />
          
          <StatCard 
            icon={<FileQuestion className="h-5 w-5 text-muted-foreground" />}
            label="Total Questions"
            value={summary?.totalQuestions ?? 0}
            loading={loading}
            error={error ? true : false}
            iconClassName="bg-green-100"
            valueClassName="text-green-600"
          />
          
          <StatCard 
            icon={<Download className="h-5 w-5 text-muted-foreground" />}
            label="Total Downloads"
            value={summary?.totalDownloads ?? 0}
            loading={loading}
            error={error ? true : false}
            iconClassName="bg-amber-100"
            valueClassName="text-amber-600"
          />
        </div>
      <div className="max-w-full mx-auto">
        <div className="grid gap-8">
          {/* <CollegeChart />  */}
          <UsageChart highlightIndex={currentMonth} />
          <CollegeChart />
        </div>
      </div>
    </div>
  )
}

DashboardPage.getLayout = function getLayout(page: React.ReactNode) {
  return <DashboardLayout role={UserRole.COLLEGE_ADMIN}>{page}</DashboardLayout>
}

