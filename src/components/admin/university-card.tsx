import { MoreVertical, Edit, Trash2, Download } from "lucide-react"
import type { University } from "@/lib/types/university"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteCollege } from "@/lib/api/college"
import { toast } from "@/components/ui/use-toast"
import { isApiSuccess } from '@/lib/utils/errorHandler';

interface UniversityCardProps {
  university: University
  onDelete?: () => void
}

export default function UniversityCard({ university, onDelete }: UniversityCardProps) {
  const { id, name, location, status, logo, contactDetails, downloadedQuestions } = university
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  
  // Check if the logo URL is external (starts with http or https)
  const isExternalLogo = logo && (logo.startsWith('http://') || logo.startsWith('https://'))
  // Use a placeholder for external logos to avoid the Next.js domain error
  const logoSrc = isExternalLogo ? "/placeholder.svg" : logo || "/placeholder.svg"

  const handleEdit = () => {
    router.push(`/admin/edit-college/${id}`)
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteCollege(id)
      toast({
        title: "Success",
        description: "College deleted successfully",
      })
      if (onDelete) onDelete()
    } catch (error: any) {
      console.error("Error deleting college:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete college",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <span className="text-[13px] font-medium leading-[16px] text-[#98A2B3]">
              Status :
              <span className={`ml-1 ${status === "Active" ? "text-[#039855]" : "text-[#EF4444]"}`}>{status}</span>
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setIsDeleteDialogOpen(true)} 
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex justify-center">
          <div className="bg-gray-100 p-3 rounded-md w-20 h-20 flex items-center justify-center">
            {isExternalLogo ? (
              // For external images, use a regular img tag
              <img
                src={logo}
                alt={`${name} logo`}
                className="object-contain w-[60px] h-[60px]"
              />
            ) : (
              // For internal images, use Next.js Image component
              <Image
                src={logoSrc}
                alt={`${name} logo`}
                width={60}
                height={60}
                className="object-contain"
              />
            )}
          </div>
        </div>

        <div className="text-center space-y-1">
          <h3 className="font-[600] text-[17px] leading-[24px] tracking-[-0.5%] text-[#333333]">{name}</h3>
          <p className="font-[400] text-[15px] leading-[20px] tracking-[-0.5%] text-gray-600">
            {location.city}, {location.state}
          </p>
          <p className="text-[#98A2B3] text-[13px] font-[500] leading-[16px]">Contact details : {contactDetails}</p>
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center justify-center space-x-2">
            <Download size={16} className="text-gray-500" />
            <span className="font-[600] text-[12px] leading-[100%] tracking-[0.5%]">Downloaded questions</span>
            <span className="bg-[#EF4444] text-white text-[12px] font-medium px-2 py-0.5 rounded-full">
              {downloadedQuestions.current}/{downloadedQuestions.total}
            </span>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this college?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the college
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
