'use client';
import React, { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import { CollegeEditForm } from '@/components/admin/college-edit-form';
import { getCollegeById } from '@/lib/api/college';
import { toast } from '@/components/ui/use-toast';
import { useParams, useRouter } from 'next/navigation';

const EditCollegePage: React.FC = () => {
  const [collegeData, setCollegeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const collegeId = (params?.id as string | undefined) || '';

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const response = await getCollegeById(collegeId);
        if (response.success && response.data) {
          setCollegeData(response.data);
        } else {
          // Handle error response
          const errorMessage = !response.success ? response.error : 'Failed to load college data';
          throw new Error(errorMessage);
        }
      } catch (error: any) {
        console.error('Failed to fetch college:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load college data. Please try again.',
          variant: 'destructive',
        });
        router.push('/admin/college');
      } finally {
        setLoading(false);
      }
    };

    if (collegeId) {
      fetchCollege();
    }
  }, [collegeId, router]);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div>
          <h1 className="text-xl font-semibold text-black">Edit College</h1>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'College Management', href: '/admin/college' },
              { label: 'Edit College' },
            ]}
            className="text-sm mt-1"
          />
        </div>
        <div className="container mx-auto py-10">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#05603A]"></div>
            </div>
          ) : (
            <CollegeEditForm collegeData={collegeData} collegeId={collegeId} />
          )}
        </div>
      </div>
    </main>
  );
};

export default EditCollegePage;