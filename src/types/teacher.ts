// Teacher type definitions

export interface Teacher {
  id: string;
  name: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  status: 'active' | 'inactive';
  role: string;
  profileImageUrl?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  // Additional profile fields
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  cityState?: string;
  postalCode?: string;
  taxId?: string;
}

export interface TeacherFilterValues {
  name?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'all';
  email?: string;
}

export interface TeacherData {
  id: string;
  name: string;
  avatar?: string;
  department?: string;
  email: string;
  phone?: string;
  status: string;
}

export interface CreateTeacherData {
  name: string;
  email: string;
  phone: string;
  department?: string;
  designation?: string;
}

export interface UpdateTeacherProfileData {
  name: string;
  email: string;
  phone: string;
  profileImageUrl?: string;
}

export interface TeacherProfile {
  displayName?: string;
  name?: string;
  phone?: string;
  email?: string;
  profileImageUrl?: string;
}
