
import { Teacher, TeacherFilterValues } from '@/types/teacher';
import { getCollegeTeachers } from '@/lib/api/teachers';
import { isApiSuccess } from '@/lib/utils/errorHandler';

// Get all teachers
export const getTeachers = async (collegeId: string): Promise<Teacher[]> => {
  try {
    const response = await getCollegeTeachers(collegeId);
    if (isApiSuccess(response)) {
      return response.data || [];
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('Error fetching teachers:', error);
    throw error;
  }
};

// Filter teachers
export const filterTeachers = async (collegeId: string, filters: TeacherFilterValues): Promise<Teacher[]> => {
  try {
    const response = await getCollegeTeachers(collegeId);
    if (!isApiSuccess(response)) {
      throw new Error(response.error);
    }
    const teachers = response.data || [];
    
    return teachers.filter((teacher: any) => {
      // Filter by name
      if (filters.name && !teacher.displayName?.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      
      // Filter by department
      if (filters.department && !teacher.department?.toLowerCase().includes(filters.department.toLowerCase())) {
        return false;
      }
      
      // Filter by status
      if (filters.status && teacher.status !== filters.status) {
        return false;
      }
      
      // Filter by email
      if (filters.email && !teacher.email?.toLowerCase().includes(filters.email.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error filtering teachers:', error);
    throw error;
  }
};

// Get teacher by ID
export const getTeacherById = async (id: string): Promise<Teacher | undefined> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/teachers/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('backendToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch teacher');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching teacher by ID:', error);
    throw error;
  }
};

// Get teachers for a college
export const getTeachersForCollege = async (collegeId: string): Promise<Teacher[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/colleges/${collegeId}/teachers`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('backendToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch teachers');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching teachers for college:', error);
    throw error;
  }
};
