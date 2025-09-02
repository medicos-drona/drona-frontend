"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { FileUploader } from "./file-uploader"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PhoneInput } from "./phone-input"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { updateCollege, CollegeData } from "@/lib/api/college"
import { isApiSuccess } from '@/lib/utils/errorHandler';
import { uploadFile } from "@/lib/api/upload"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"]

const formSchema = z.object({
  collegeName: z.string().min(2, {
    message: "College name must be at least 2 characters.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be valid.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  address: z.string().max(100, {
    message: "Address must not exceed 100 characters.",
  }),
  logo: z
    .any()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 50MB.`
    )
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_FILE_TYPES.includes(files[0]?.type),
      "Only .jpg, .jpeg, .png and .svg formats are supported."
    ),
})

interface CollegeEditFormProps {
  collegeData: any
  collegeId: string
}

export function CollegeEditForm({ collegeData, collegeId }: CollegeEditFormProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collegeName: "",
      phone: "",
      email: "",
      address: "",
    },
  })

  useEffect(() => {
    if (collegeData) {
      form.reset({
        collegeName: collegeData.name || "",
        phone: collegeData.contactPhone || "",
        email: collegeData.contactEmail || "",
        address: collegeData.address || "",
      })
      
      if (collegeData.logoUrl) {
        setExistingLogoUrl(collegeData.logoUrl)
      }
    }
  }, [collegeData, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    try {
      // Handle logo upload if a new file is selected
      let logoUrl = existingLogoUrl
      if (files.length > 0) {
        logoUrl = await uploadFile(files[0])
      }
      
      // Prepare data for API
      const updatedCollegeData: CollegeData = {
        name: values.collegeName,
        address: values.address,
        contactPhone: values.phone,
        contactEmail: values.email,
        logoUrl: logoUrl || undefined
      }
      
      // Update college
      const response = await updateCollege(collegeId, updatedCollegeData)

      if (isApiSuccess(response)) {
        // Success toast is already shown by the API function

        // Redirect to college list
        router.push("/admin/college")
      }
      // Error case is already handled by the API function (toast shown)
    } catch (error: any) {
      // Fallback error handling for unexpected errors
      console.error("Unexpected error updating college:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCancel() {
    router.push("/admin/college")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="collegeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>College name</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Phone
                  <span className="text-sm text-muted-foreground font-normal ml-2">Required</span>
                </FormLabel>
                <FormControl>
                  <PhoneInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormDescription>We&apos;ll never share your details.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between">
                  <FormLabel>Address details</FormLabel>
                  <span className="text-sm text-muted-foreground">{field.value.length}/100</span>
                </div>
                <FormControl>
                  <Textarea placeholder="" className="resize-none" maxLength={100} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Upload logo
                <span className="text-sm text-muted-foreground font-normal ml-2">Optional</span>
              </FormLabel>
              {existingLogoUrl && (
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground">Current logo:</p>
                  <div className="w-20 h-20 bg-gray-100 rounded-md p-2 flex items-center justify-center">
                    <img src={existingLogoUrl} alt="Current logo" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
              )}
              <FormControl>
                <FileUploader
                  value={field.value}
                  onChange={(files) => {
                    field.onChange(files)
                    setFiles(Array.from(files || []))
                  }}
                  maxSize={MAX_FILE_SIZE}
                  acceptedTypes={ACCEPTED_FILE_TYPES}
                />
              </FormControl>
              <FormDescription>
                Upload a new logo to replace the current one, or leave empty to keep the existing logo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button 
            type="submit" 
            className="bg-[#05603A] hover:bg-[#04502F]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update college"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}