"use client"

import React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { User, Upload, Phone, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

// Form validation schema
const settingsFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().regex(/^\+?[0-9\s-]{10,15}$/, {
    message: "Please enter a valid phone number.",
  }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  profileImageUrl: z.string().optional(),
})

type SettingsFormValues = z.infer<typeof settingsFormSchema>

interface SettingsFormProps {
  defaultValues?: Partial<SettingsFormValues>
  onSubmit?: (data: SettingsFormValues & { profileImageUrl?: string }) => void
  onCancel?: () => void
}

export function SettingsForm({
  defaultValues = {
    name: "",
    phone: "",
    email: "",
    profileImageUrl: "",
  },
  onSubmit = () => {},
  onCancel = () => {},
}: SettingsFormProps) {
  const [profileImage, setProfileImage] = useState<string | null>(defaultValues.profileImageUrl || null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  })

  // Update profile image when defaultValues change
  useEffect(() => {
    if (defaultValues.profileImageUrl) {
      setProfileImage(defaultValues.profileImageUrl)
    }
  }, [defaultValues.profileImageUrl])

  const handleSubmit = async (data: SettingsFormValues) => {
    setIsSubmitting(true)
    try {
      // Include the profile image URL (base64) if available
      const submitData = {
        ...data,
        profileImageUrl: profileImage || data.profileImageUrl || undefined
      }
      await onSubmit(submitData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageDelete = () => {
    setProfileImage(null)
  }

  return (
    <div className="w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Settings Page</h1>
          <p className="text-muted-foreground font-medium">
            {/* Lorem ipsum dolor sit amet, consectetur adipiscing elit ante ipsum primis in faucibus. */}
          </p>
        </div>
        <div className="flex gap-2">
        <Button
            variant="outline"
            onClick={onCancel}
            className="text-[#05603A] font-medium w-[101px] h-[48px] rounded-[6px] border-[1px] border-[#05603A] p-3 text-center bg-white"
            style={{ top: '113px', left: '1210px', gap: '8px' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="settings-form"
            disabled={isSubmitting}
            className="bg-[#05603A] text-white font-medium w-[101px] h-[48px] rounded-[6px] border-[1px] p-3 text-center"
            style={{ top: '113px', left: '1210px', gap: '8px' }}
          >
            Save
          </Button>
        </div>
      </div>

      <Separator className="my-6" />
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <Form {...form}>
          <form id="settings-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-[789px]">
            {/* Profile Photo Section */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-base font-medium mb-4">Edit profile photo</h3>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profileImage || "/placeholder.svg?height=64&width=64"} alt="Profile" />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Button type="button" className="relative bg-[#2563EB] text-white font-medium">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload new picture
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-[#EF4444] hover:text-red-600 hover:bg-red-50 bg-white font-medium"
                    onClick={handleImageDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            {/* Form Fields Section */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            className="pl-10 font-medium text-[#6B7280]"
                            placeholder="John Doe"
                            {...field}
                          />
                        </div>
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
                      <FormLabel className="font-medium">Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            className="pl-10 font-medium text-[#6B7280]"
                            placeholder="+91 85535 77004"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            className="pl-10 font-medium text-[#6B7280]"
                            placeholder="you@example.com"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}