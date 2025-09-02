"use client"

import { useState, useEffect } from "react"
import { SettingsForm } from "@/components/teacher/settings-form"
import { getCurrentTeacherProfile, updateTeacherProfile } from "@/lib/api/teachers"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface TeacherProfile {
  displayName?: string;
  name?: string;
  phone?: string;
  email?: string;
  profileImageUrl?: string;
}

export default function SettingsPage() {
  const [profileData, setProfileData] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await getCurrentTeacherProfile()
        if (response.success && response.data) {
          setProfileData(response.data)
        } else {
          const errorMessage = !response.success ? response.error : 'Failed to load profile data'
          throw new Error(errorMessage)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load profile data')
        toast({
          title: "Error",
          description: 'Failed to load profile data',
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (data: any) => {
    try {
      await updateTeacherProfile(data)
      toast({
        title: "Success",
        description: "Settings saved successfully!"
      })

      // Refresh profile data
      const updatedResponse = await getCurrentTeacherProfile()
      if (updatedResponse.success && updatedResponse.data) {
        setProfileData(updatedResponse.data)
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save settings",
        variant: "destructive"
      })
      throw err // Re-throw to let the form handle the error state
    }
  }

  const handleCancel = () => {
    toast({
      title: "Info",
      description: "Changes discarded"
    })
  }

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <SettingsForm
        defaultValues={{
          name: profileData?.displayName || profileData?.name || "",
          phone: profileData?.phone || "",
          email: profileData?.email || "",
          profileImageUrl: profileData?.profileImageUrl || "",
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}
