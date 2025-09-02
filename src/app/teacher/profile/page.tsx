'use client';
import React, { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import { UserProfile } from '@/components/teacher/user-profile';
import { getTeacherById } from '@/services/teacherService';
import { getCurrentUserInfo } from '@/lib/api/api';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const TeacherProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Get current user info to get the user ID
        const currentUser = await getCurrentUserInfo();
        
        if (!currentUser || !currentUser._id) {
          throw new Error('Unable to retrieve user information');
        }
        
        // Fetch teacher profile using the ID
        const teacherData = await getTeacherById(currentUser._id);
        
        if (!teacherData) {
          throw new Error('Unable to retrieve teacher profile');
        }
        
        // Transform API response to match the UserProfile component's expected format
        setProfileData({
          firstName: teacherData.firstName || '',
          lastName: teacherData.lastName || '',
          occupation: "Teacher",
          location: teacherData.cityState || '',
          email: teacherData.email || '',
          gender: teacherData.gender || '',
          designation: teacherData.designation || '',
          dateOfBirth: teacherData.dateOfBirth || '',
          phone: teacherData.phone || '',
          country: teacherData.country || '',
          cityState: teacherData.cityState || '',
          postalCode: teacherData.postalCode || '',
          taxId: teacherData.taxId || '',
          profileImage: teacherData.profileImageUrl || "",
          department: teacherData.department || '',
        });
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        setError(error.message || 'Failed to load profile data');
        toast({
          title: "Error",
          description: error.message || "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div>
          <h1 className="text-xl font-semibold text-black">User Profile</h1>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/teacher' },
              { label: '...', href: '#' },
              { label: 'User Profile' },
            ]}
            className="text-sm mt-1"
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading profile...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">
            <p>{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : profileData ? (
          <UserProfile
            profileData={profileData}
            onEdit={(section) => {
              console.log(`Edit ${section} section`);
              // Here you would typically open a modal or navigate to an edit page
            }}
          />
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            No profile data available
          </div>
        )}
      </div>
    </main>
  );
};

export default TeacherProfilePage;
