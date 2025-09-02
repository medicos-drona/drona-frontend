'use client';
import React, { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import UniversityGrid from '@/components/admin/university-grid';
import { University } from '@/lib/types/university';
import Link from 'next/link';
import { getColleges } from '@/lib/api/college';
import { toast } from '@/components/ui/use-toast';
import { isApiSuccess } from '@/lib/utils/errorHandler';

const CollegeListPage: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await getColleges();

      if (isApiSuccess(response)) {
        const collegesData = response.data;
        // Transform the data to match the University type
        const transformedData = collegesData.map((college: any) => ({
          id: college._id,
          name: college.name,
          location: {
            city: college.city || '',
            state: college.state || '',
          },
          status: college.status || 'Active',
          logo: college.logoUrl || "/placeholder.svg?height=60&width=60",
          contactDetails: college.contactPhone || '',
          downloadedQuestions: {
            current: 0,
            total: 100,
          },
        }));
        setUniversities(transformedData);
      }
      // Error case is already handled by the API function (toast shown)
    } catch (error: any) {
      // Fallback error handling for unexpected errors
      console.error('Unexpected error fetching colleges:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const handleCollegeDeleted = () => {
    // Refresh the college list after deletion
    fetchColleges();
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-black">College Management List</h1>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: '...', href: '#' },
              { label: 'College Management' },
            ]}
            className="text-sm mt-1"
          />
        </div>
        <Link href="/admin/add-college">
          <Button className="bg-[#05603A] hover:bg-[#04502F] text-white">
            Add college
            <Plus className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
      <div className="container mx-auto py-8 px-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#05603A]"></div>
          </div>
        ) : (
          <UniversityGrid 
            universities={universities} 
            itemsPerPage={8} 
            onCollegeDeleted={handleCollegeDeleted}
          />
        )}
      </div>
    </main>
  );
};

export default CollegeListPage;
