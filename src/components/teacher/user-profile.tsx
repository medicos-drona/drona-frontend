"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Facebook, Instagram, Linkedin, Pencil, Twitter, User } from "lucide-react"
import Image from "next/image"

interface ProfileData {
  firstName: string
  lastName: string
  occupation: string
  location: string
  email: string
  gender: string
  designation: string
  dateOfBirth: string
  phone: string
  country: string
  cityState: string
  postalCode: string
  taxId: string
  profileImage: string
  department: string
}

interface UserProfileProps {
  profileData: ProfileData
  onEdit?: (section: "profile" | "personal" | "address") => void
}

export function UserProfile({ profileData, onEdit }: UserProfileProps) {
  const handleEdit = (section: "profile" | "personal" | "address") => {
    if (onEdit) {
      onEdit(section)
    }
  }

  return (
    <div className="w-full mx-auto space-y-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">My Profile</CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden">
                {/* <Image
                  src={profileData.profileImage || "/placeholder.svg?height=64&width=64"}
                  alt={`${profileData.firstName} ${profileData.lastName}`}
                  fill
                  className="object-cover"
                /> */}
                                    {profileData.profileImage ? (
                      <img src={profileData.profileImage} alt={profileData.firstName} className="w-10 h-10 rounded-full object-cover border" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
              </div>
              <div>
                <h3 className="font-medium text-base">{`${profileData.firstName} ${profileData.lastName}`}</h3>
                <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:gap-2">
                  <span>{profileData.designation}</span>
                  {profileData.location && <span className="hidden sm:inline">•</span>}
                  <span>{profileData.location}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                  <Facebook className="h-4 w-4" />
                  <span className="sr-only">Facebook</span>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                  <Linkedin className="h-4 w-4" />
                  <span className="sr-only">LinkedIn</span>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                  <Instagram className="h-4 w-4" />
                  <span className="sr-only">Instagram</span>
                </Button>
              </div> */}
              {/* <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs bg-blue-50 hover:bg-blue-100 border-blue-100"
                onClick={() => handleEdit("profile")}
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Button> */}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Personal Information</CardTitle>
          {/* <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs bg-blue-50 hover:bg-blue-100 border-blue-100"
            onClick={() => handleEdit("personal")}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button> */}
        </CardHeader>
        <CardContent className="pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">First Name</p>
              <p className="font-medium">{profileData.firstName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Name</p>
              <p className="font-medium">{profileData.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email address</p>
              <p className="font-medium">{profileData.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Designation</p>
              <p className="font-medium">{profileData.designation}</p>
            </div>
                        <div>
              <p className="text-sm text-muted-foreground mb-1">Department</p>
              <p className="font-medium">{profileData.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Address</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs bg-blue-50 hover:bg-blue-100 border-blue-100"
            onClick={() => handleEdit("address")}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Country</p>
              <p className="font-medium">{profileData.country}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">City/State</p>
              <p className="font-medium">{profileData.cityState}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Postal Code</p>
              <p className="font-medium">{profileData.postalCode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">TAX ID</p>
              <p className="font-medium">{profileData.taxId}</p>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}
