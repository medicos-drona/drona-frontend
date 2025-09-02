import React, { useState, useEffect, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { z } from 'zod';
import { addTeacherToCollege } from '@/lib/api/teachers';
import { useAuth } from '@/lib/AuthContext'; // Fix the import path
import { isApiSuccess } from '@/lib/utils/errorHandler';

interface AddTeacherFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

// Form validation schema
const teacherFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  department: z.string().optional(),
  designation: z.string().optional(),
});

type TeacherFormValues = z.infer<typeof teacherFormSchema>;

const AddTeacherForm: React.FC<AddTeacherFormProps> = ({ onCancel, onSuccess }) => {
  const params = useParams();
  const { user, userRole } = useAuth(); // Get user data from auth context
  
  // Get collegeId from JWT token data stored in localStorage
  const [collegeId, setCollegeId] = useState<string | null>(null);
  
  useEffect(() => {
    // Try to get collegeId from JWT token
    try {
      // Check all possible token keys in localStorage
      const possibleTokenKeys = ['token', 'backendToken', 'authToken', 'jwtToken'];
      let foundToken = null;
      
      for (const key of possibleTokenKeys) {
        const token = localStorage.getItem(key);
        if (token) {
          console.log(`Found token with key: ${key}`);
          foundToken = token;
          break;
        }
      }
      
      if (foundToken) {
        // Parse JWT token to get collegeId
        const parts = foundToken.split('.');
        if (parts.length === 3) {
          // Standard JWT format: header.payload.signature
          const payload = JSON.parse(atob(parts[1]));
          console.log("JWT payload:", payload);
          
          // Extract collegeId directly from the payload
          if (payload.collegeId) {
            console.log("Found collegeId in JWT:", payload.collegeId);
            setCollegeId(payload.collegeId);
          }
        }
      } else {
        console.warn("No token found in localStorage");
      }
    } catch (error) {
      console.error('Error parsing JWT token:', error);
    }
  }, []);
  
  // Add debugging to show what's in localStorage
  useEffect(() => {
    console.log("localStorage keys:", Object.keys(localStorage));
    // Try to find any token-like keys in localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.toLowerCase().includes('token')) {
        console.log(`Found potential token in localStorage with key: ${key}`);
      }
    });
  }, []);
  
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!collegeId) {
      console.warn("College ID is missing. Form submission will fail.");
    }
  }, [collegeId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!collegeId) {
    return null;
  }

  const validateForm = (): boolean => {
    try {
      teacherFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Get the collegeId at submission time to ensure we have the latest value
    let submissionCollegeId = collegeId;
    
    // If we still don't have a collegeId, try one more time to get it from the token
    if (!submissionCollegeId) {
      try {
        // Check all possible token keys
        const possibleTokenKeys = ['token', 'backendToken', 'authToken', 'jwtToken'];
        
        for (const key of possibleTokenKeys) {
          const token = localStorage.getItem(key);
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              if (payload.collegeId) {
                submissionCollegeId = payload.collegeId;
                console.log(`Found collegeId in ${key}:`, submissionCollegeId);
                break;
              }
            } catch (e) {
              console.error(`Error parsing token from ${key}:`, e);
            }
          }
        }
      } catch (error) {
        console.error('Error getting collegeId from tokens:', error);
      }
    }

    if (!submissionCollegeId) {
      toast.error("College ID is missing. Please try again or contact support.");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting teacher with collegeId:", submissionCollegeId);
      const response = await addTeacherToCollege(submissionCollegeId, formData);

      if (isApiSuccess(response)) {
        // Success - the toast is already shown by the API function

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          department: '',
          designation: '',
        });

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
      // Error case is already handled by the API function (toast shown)
    } catch (error: any) {
      // Fallback error handling for unexpected errors
      console.error("Unexpected error adding teacher:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
    });
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Updated phone change handler with TypeScript
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Extract only digits from the input
    const digitsOnly = inputValue.replace(/\D/g, '');
    
    // If no digits, clear the field
    if (digitsOnly.length === 0) {
      setFormData({ ...formData, phone: '' });
      if (errors.phone) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.phone;
          return newErrors;
        });
      }
      return;
    }
    
    let phoneDigits = digitsOnly;
    
    // If user entered number starting with 91, use those digits as is
    // If user entered number NOT starting with 91, treat as Indian mobile number
    if (phoneDigits.startsWith('91')) {
      // Remove the 91 prefix to get the actual phone number
      phoneDigits = phoneDigits.slice(2);
    }
    
    // Limit to 10 digits max for Indian mobile numbers
    if (phoneDigits.length > 10) {
      phoneDigits = phoneDigits.slice(0, 10);
    }
    
    // Format the number for display
    let formattedNumber = '';
    if (phoneDigits.length === 0) {
      formattedNumber = '';
    } else if (phoneDigits.length <= 5) {
      formattedNumber = `+91 ${phoneDigits}`;
    } else {
      formattedNumber = `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`;
    }
    
    // Update form data
    setFormData({ ...formData, phone: formattedNumber });
    
    // Clear phone error when user starts typing
    if (errors.phone) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-[450px]">
      <h2 className="text-xl font-bold mb-8 md:mb-0">Add Teachers</h2>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between">
            <Label htmlFor="name" className="font-family-outfit font-medium text-[15px] leading-[100%] tracking-[0.005em]">
              Teacher's Name
            </Label>
            <span className="text-gray-500 text-sm">Required</span>
          </div>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter teacher name"
            className={`mt-1 w-[450px] h-[46px] ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <div className="flex justify-between">
            <Label htmlFor="email" className="font-family-outfit font-medium text-[15px] leading-[100%] tracking-[0.005em]">
              Email
            </Label>
            <span className="text-gray-500 text-sm">Required</span>
          </div>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email address"
              className={`pl-10 w-[450px] h-[46px] ${errors.email ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Updated Phone Input Section */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="phone" className="text-base font-medium text-gray-700">Phone</Label>
            <span className="text-gray-500 text-sm">Required</span>
          </div>
          <div className={`flex w-full h-12 border rounded-md overflow-hidden ${errors.phone ? 'border-red-500' : 'border-gray-200'}`} style={{width: '450px', height: '46px'}}>
            <div className="flex items-center justify-center bg-white border-r border-gray-200 w-24 px-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 rounded-sm overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-b from-orange-500 via-white to-green-600 flex items-center justify-center">
                    <div className="w-3 h-3 border border-blue-800 rounded-full bg-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-blue-800 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <span className="text-sm">IN</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="+91 00000 00000"
              className="border-none flex-1 focus-visible:ring-0 h-full"
            />
          </div>
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <Label htmlFor="department" className="font-family-outfit font-medium text-[15px] leading-[100%] tracking-[0.005em]">
            Teacher's Department
          </Label>
          <Input
            id="department"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            placeholder="Enter teacher department"
            className="mt-1 w-[450px] h-[46px]"
          />
        </div>

        <div>
          <Label htmlFor="designation" className="font-family-outfit font-medium text-[15px] leading-[100%] tracking-[0.005em]">
            Teacher's Designation
          </Label>
          <Input
            id="designation"
            name="designation"
            value={formData.designation}
            onChange={handleInputChange}
            placeholder="Enter teacher designation"
            className="mt-1 w-[450px] h-[46px]"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-white hover:text-white bg-[#EF4444] hover:bg-red-600 border-none"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="text-white bg-[#05603A] hover:bg-[#04502F] border-none"
        >
          {isSubmitting ? 'Adding...' : 'Add Teacher'}
        </Button>
      </div>
    </form>
  );
};

export default AddTeacherForm;