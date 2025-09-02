import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { TeacherData } from '@/components/table/types';

interface EditTeacherFormProps {
  teacher: TeacherData;
  onCancel: () => void;
  onSubmit: (formData: any) => Promise<void>;
}

const EditTeacherForm: React.FC<EditTeacherFormProps> = ({ teacher, onCancel, onSubmit }) => {
  const [formData, setFormData] = useState({
    phone: '',
    department: '',
    designation: '',
    status: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize form with teacher data
    setFormData({
      phone: teacher.phone || '',
      department: teacher.department || '',
      designation: '', // Add if available in teacher data
      status: teacher.status?.toLowerCase() || 'active'
    });
  }, [teacher]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        status: formData.status
      });
    } catch (error) {
      console.error('Error updating teacher:', error);
      toast.error('Failed to update teacher. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-[450px]">
      <div className="space-y-4">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
{/*         
        <div>
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="Enter department"
          />
        </div> */}
        
        <div>
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            placeholder="Enter designation"
          />
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full p-2 border rounded-md"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="text-white hover:text-white bg-[#EF4444] hover:bg-red-600 border-none">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="text-white bg-[#05603A] hover:bg-[#04502F] border-none">
          {isSubmitting ? 'Updating...' : 'Update Teacher'}
        </Button>
      </div>
    </form>
  );
};

export default EditTeacherForm;
