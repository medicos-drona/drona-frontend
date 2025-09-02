"use client"
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Breadcrumb from '@/components/Breadcrumb';
import { toast } from 'sonner';
import { TeachersTable } from '@/components/table/teachers-table';
import { TeacherData } from '@/components/table/types';
import TeacherTabs from '@/components/TeacherList/Tabs';
import AddTeacherForm from '@/components/TeacherList/AddTeacherForm';
import EditTeacherForm from '@/components/TeacherList/EditTeacherForm';
import { TeacherFilterValues } from '@/components/TeacherList/FilterModal';
import { getCollegeTeachers, deleteTeacher, updateTeacher } from '@/lib/api/teachers';
import { isApiSuccess } from '@/lib/utils/errorHandler';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';

const TeachersListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('view');
  const [editingTeacher, setEditingTeacher] = useState<TeacherData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<TeacherFilterValues>({
    name: '',
    department: '',
    status: 'all',
    email: ''
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherData[]>([]);
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [showCollegeIdInput, setShowCollegeIdInput] = useState(false);
  const [manualCollegeId, setManualCollegeId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Add this function to handle manual collegeId setting
  const handleManualCollegeIdSubmit = () => {
    if (manualCollegeId.trim()) {
      console.log("Setting manual collegeId:", manualCollegeId);
      setCollegeId(manualCollegeId);
      localStorage.setItem('collegeId', manualCollegeId);
      setShowCollegeIdInput(false);
      refetch();
    }
  };

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

  // Fetch teachers data
  const { 
    data: teachersData = [], 
    isLoading,
    refetch,
    error
  } = useQuery({
    queryKey: ['teachers', collegeId, currentPage, pageSize, filters],
    queryFn: async () => {
      if (!collegeId) {
        console.log("No collegeId found, returning empty array");
        return [];
      }
      
      try {
        console.log(`Fetching teachers for collegeId: ${collegeId}, page: ${currentPage}, limit: ${pageSize}`);
        
        // Create filter object for API
        const apiFilters: Record<string, string> = {};
        if (filters.name) apiFilters.name = filters.name;
        if (filters.email) apiFilters.email = filters.email;
        if (filters.department && filters.department !== 'all_departments') {
          apiFilters.department = filters.department;
        }
        if (filters.status && filters.status !== 'all') {
          apiFilters.status = filters.status;
        }
        
        const response = await getCollegeTeachers(collegeId, currentPage, pageSize, apiFilters);

        console.log("API returned response:", response);

        // Check if the API call was successful
        if (!isApiSuccess(response)) {
          // Error is already handled by the API function (toast shown)
          return [];
        }

        const data = response.data;

        // Handle both response formats (array or object with teachers property)
        let teachersArray = [];
        let total = 0;
        let totalPages = 1;

        if (Array.isArray(data)) {
          // API returned an array directly
          teachersArray = data;
          total = data.length;
          totalPages = 1;
        } else if (data && data.teachers) {
          // API returned an object with teachers property
          teachersArray = data.teachers;
          total = data.total || data.teachers.length;
          totalPages = data.totalPages || Math.ceil(total / pageSize);
        } else {
          console.error("API returned invalid data format:", data);
          return [];
        }
        
        // Set total counts for pagination
        setTotalTeachers(total);
        setTotalPages(totalPages);
        
        // Transform the data to match the TeacherData interface
        const transformedData = teachersArray.map((teacher: any) => {
          return {
            id: teacher._id,
            name: teacher.displayName || teacher.name || 'Unknown',
            email: teacher.email || 'No email',
            department: teacher.department || 'N/A',
            phone: teacher.phone || 'N/A',
            status: teacher.status === 'active' ? 'Active' : 'Inactive',
            avatar: teacher.avatar || null
          };
        });
        
        return transformedData;
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
        toast.error('Failed to load teachers. Please try again.');
        return [];
      }
    },
    enabled: !!collegeId,
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  // Add debugging to see if there's an error
  useEffect(() => {
    if (error) {
      console.error("Query error:", error);
    }
  }, [error]);

  // Extract unique departments for filter dropdown
  useEffect(() => {
    console.log("teachersData changed:", teachersData);
    console.log("teachersData length:", teachersData?.length || 0);
    
    if (teachersData && teachersData.length > 0) {
      interface DepartmentMap {
        [department: string]: boolean;
      }

      const uniqueDepartments: string[] = Array.from(
        new Set(
          (teachersData as TeacherData[])
        .map((teacher: TeacherData) => teacher.department)
        .filter(Boolean) as string[]
        )
      );
      setDepartments(uniqueDepartments);
      
      // Make sure we're setting the filtered teachers to the full data set initially
      setFilteredTeachers([...teachersData]);
      console.log("Setting filtered teachers to:", teachersData.length);
    } else {
      console.log("No teachers data to set");
    }
  }, [teachersData]);

  const handleTabChange = (tab: string) => {
    console.log('Page received tab change:', tab);
    
    // If switching to edit mode from view, don't clear the editing teacher
    if (tab !== 'edit') {
      setEditingTeacher(null);
    }
    
    // Set the active tab with a small delay to allow for animation
    setTimeout(() => {
      setActiveTab(tab);
    }, 100);
  };

  const handleTeacherAdded = () => {
    refetch(); // Refresh the teachers list
    setActiveTab('view'); // Switch back to view tab
  };

  const handleEdit = (id: string) => {
    console.log(`Edit teacher with id: ${id}`);
    const teacher = teachersData.find((t: TeacherData) => t.id === id);
    if (teacher) {
      setEditingTeacher(teacher);
      setActiveTab('edit');
    }
  };

  const handleDelete = (id: string) => {
    console.log(`Delete teacher with id: ${id}`);
    setTeacherToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!teacherToDelete) return;

    try {
      const response = await deleteTeacher(teacherToDelete);

      if (isApiSuccess(response)) {
        // Success toast is already shown by the API function
        refetch(); // Refresh the list
      }
      // Error case is already handled by the API function (toast shown)
    } catch (error: any) {
      // Fallback error handling for unexpected errors
      console.error("Unexpected error deleting teacher:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleteDialogOpen(false);
      setTeacherToDelete(null);
    }
  };

  const handleUpdateTeacher = async (formData: any) => {
    if (!editingTeacher) return;

    try {
      // Only send the allowed fields and ensure status is lowercase
      const updateData = {
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        status: formData.status.toLowerCase()
      };

      const response = await updateTeacher(editingTeacher.id, updateData);

      if (isApiSuccess(response)) {
        // Success toast is already shown by the API function
        refetch(); // Refresh the list
        setActiveTab('view'); // Switch back to view tab
        setEditingTeacher(null);
      }
      // Error case is already handled by the API function (toast shown)
    } catch (error: any) {
      // Fallback error handling for unexpected errors
      console.error('Unexpected error updating teacher:', error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };
const handleFilterApply = async (filterValues: TeacherFilterValues) => {
  // Update filter state used by React Query
  setFilters(filterValues);
  // Reset to page 1 whenever new filter is applied
  setCurrentPage(1);

  // Refetch teacher list using updated filters
  if (collegeId) {
    refetch();
  }

  // Optional: Inform user when default filter (i.e., all fields empty) is applied
  const isEmptyFilter =
    !filterValues.name &&
    !filterValues.email &&
    (!filterValues.department || filterValues.department === 'all_departments') &&
    (!filterValues.status || filterValues.status === 'all');

  if (isEmptyFilter) {
    toast.info('Showing all teachers');
  }
};


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const paginatedTeachers = (filteredTeachers.length > 0 ? filteredTeachers : teachersData).slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize
);

  const renderTeachersTable = () => {
    return (
      <div className="flex flex-col">
        <TeachersTable 
          data={paginatedTeachers} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          itemsPerPage={pageSize}
          isLoading={isLoading}
          onRefresh={() => {
            // Reset filters and show all teachers
            setFilters({
              name: '',
              department: '',
              status: 'all',
              email: ''
            });
            setFilteredTeachers([]);
            refetch();
          }}
          onFilter={handleOpenFilterModal}
          columns={["name", "department", "email", "phone", "status", "actions"]}
        />
        
        {!isLoading && teachersData.length > 0 && (
          <Pagination
  currentPage={currentPage}
  totalPages={Math.ceil(
    (filteredTeachers.length > 0 ? filteredTeachers.length : totalTeachers) / pageSize
  )}
  pageSize={pageSize}
  totalItems={filteredTeachers.length > 0 ? filteredTeachers.length : totalTeachers}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  pageSizeOptions={[5, 10, 20, 50]}
          />
        )}
      </div>
    );
  };

  return (
    <div className="container py-6">
      {!collegeId && (
        <div className="mb-6 p-4 border border-yellow-300 bg-yellow-50 rounded-md">
          <div className="flex flex-col space-y-2">
            <p className="text-yellow-800">
              College ID not found. Please enter it manually or check your login status.
            </p>
            {!showCollegeIdInput ? (
              <Button 
                variant="outline" 
                onClick={() => setShowCollegeIdInput(true)}
              >
                Enter College ID Manually
              </Button>
            ) : (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={manualCollegeId}
                  onChange={(e) => setManualCollegeId(e.target.value)}
                  placeholder="Enter College ID"
                  className="px-3 py-2 border rounded-md flex-1"
                />
                <Button onClick={handleManualCollegeIdSubmit}>
                  Submit
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCollegeIdInput(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {activeTab === 'view' ? "Teacher's List View" : 
             activeTab === 'add' ? "Add Teachers" : 
             activeTab === 'edit' ? "Edit Teacher" : 
             "Teacher Activity Logs"}
          </h1>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: '...', href: '#' },
              { label: activeTab === 'view' ? 'Teacher list' : 
                      activeTab === 'add' ? 'Add teachers' : 
                      activeTab === 'edit' ? 'Edit teacher' : 
                      'Teacher activity logs' }
            ]}
            className="mt-2"
          />
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow">
          <div className="flex justify-between items-center px-6 pt-6">
            <TeacherTabs
              activeTab={activeTab === 'edit' ? 'view' : activeTab}
              onTabChange={handleTabChange}
              collegeIdMissing={!collegeId}
            />
            
            {/* {activeTab === 'view' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  console.log("Manual refresh triggered");
                  refetch();
                }}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
            )} */}
          </div>
          
          {activeTab === 'view' && renderTeachersTable()}

          {activeTab === 'add' && (
            <div className="p-6">
              <AddTeacherForm 
                onCancel={() => handleTabChange('view')} 
                onSuccess={handleTeacherAdded}
              />
            </div>
          )}

          {activeTab === 'edit' && editingTeacher && (
            <div className="p-6">
              <EditTeacherForm 
                teacher={editingTeacher}
                onCancel={() => handleTabChange('view')}
                onSubmit={handleUpdateTeacher}
              />
            </div>
          )}

          {/* {activeTab === 'logs' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-8 md:mb-0">Teacher Activity Logs</h2>
              <p className="text-muted-foreground">
                Teacher activity logs would be displayed here. This is a placeholder for the Teacher Activity Logs tab.
              </p>
            </div>
          )} */}
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this teacher? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* <FilterModal
        open={isFilterModalOpen}
        onOpenChange={setIsFilterModalOpen}
        onFilter={handleFilterApply}
        currentFilters={filters}
        departments={departments}
      /> */}
    </div>
  );
};

export default TeachersListPage;
