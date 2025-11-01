import { MoreVertical, Edit, Trash2, Download, Crown } from "lucide-react"
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
import { deleteCollege, updateCollegeTier } from "@/lib/api/college"
import { toast } from "@/components/ui/use-toast"
import { isApiSuccess } from '@/lib/utils/errorHandler';

interface UniversityCardProps {
  university: University
  onDelete?: () => void
  onTierChange?: () => void
}

export default function UniversityCard({ university, onDelete, onTierChange }: UniversityCardProps) {
  const { id, name, location, tier, logo, contactDetails, downloadedQuestions } = university
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTierDialogOpen, setIsTierDialogOpen] = useState(false)
  const [isUpdatingTier, setIsUpdatingTier] = useState(false)
  const [targetTier, setTargetTier] = useState<'free' | 'pro'>(tier)
  const router = useRouter()

  const formatContactNumber = (value: string) => {
    if (!value) return 'Not provided'

    const digitsOnly = value.replace(/\D/g, '')
    if (digitsOnly.length === 10) {
      return `+91 ${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`
    }

    if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      const phone = digitsOnly.slice(2)
      return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
    }

    if (value.trim().startsWith('+91')) {
      return value.trim()
    }

    return value.trim().startsWith('+') ? value.trim() : `+91 ${value.trim()}`
  }

  const formattedContact = formatContactNumber(contactDetails)
  const usageLimit = downloadedQuestions.limit
  const usageBadgeText =
    usageLimit === null
      ? `${downloadedQuestions.used}`
      : `${downloadedQuestions.used}/${usageLimit}`
  const usageBadgeClasses =
    usageLimit === null ? 'bg-blue-600' : 'bg-[#EF4444]'
  const remainingCount =
    usageLimit === null
      ? null
      : downloadedQuestions.remaining ?? Math.max(usageLimit - downloadedQuestions.used, 0)
  const footerMessage =
    tier === 'free'
      ? `Remaining: ${remainingCount ?? 0} questions. Contact admin to upgrade to the Pro tier for unlimited access.`
      : 'Unlimited question generation enabled.'
  const isUpgrade = tier === 'free' && targetTier === 'pro'
  const tierDialogTitle = isUpgrade ? 'Upgrade to Pro tier?' : 'Change tier'
  const tierDialogDescription = isUpgrade
    ? 'Are you sure you want to change this college to the Pro tier? Teachers will be able to generate unlimited questions.'
    : 'Are you sure you want to change this college to the Free tier? Question generation will be capped at 500 questions.'
  const tierActionClasses =
    targetTier === 'pro' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'
  
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

  const handleTierSelection = (nextTier: 'free' | 'pro') => {
    setTargetTier(nextTier)
    setIsTierDialogOpen(true)
  }

  const handleTierUpdate = async () => {
    try {
      setIsUpdatingTier(true)
      const response = await updateCollegeTier(id, targetTier)

      if (!isApiSuccess(response)) {
        throw new Error(response.error || "Failed to update tier")
      }

      toast({
        title: "Tier updated",
        description: `College moved to ${targetTier === 'pro' ? 'Pro' : 'Free'} tier.`,
      })
      onTierChange?.()
    } catch (error: any) {
      console.error("Error updating tier:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to update tier",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingTier(false)
      setIsTierDialogOpen(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                tier === 'pro' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Crown
                className={`h-3.5 w-3.5 ${
                  tier === 'pro' ? 'text-blue-500' : 'text-amber-500'
                }`}
              />
              {tier === 'pro' ? 'Pro Tier' : 'Free Tier'}
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
                onClick={() => handleTierSelection(tier === 'pro' ? 'free' : 'pro')}
                className="cursor-pointer"
              >
                <Crown className="mr-2 h-4 w-4" />
                {tier === 'pro' ? 'Set to Free Tier' : 'Upgrade to Pro Tier'}
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
          <p className="text-[#98A2B3] text-[13px] font-[500] leading-[16px]">
            Contact: {formattedContact}
          </p>
        </div>

        <div className="border-t pt-3">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="flex items-center space-x-2">
              <Download size={16} className="text-gray-500" />
              <span className="font-[600] text-[12px] leading-[100%] tracking-[0.5%]">
                Questions generated
              </span>
              <span className={`${usageBadgeClasses} text-white text-[12px] font-medium px-2 py-0.5 rounded-full`}>
                {usageBadgeText}
              </span>
            </div>
            <span className="text-xs text-[#667085] font-medium px-4">
              {footerMessage}
            </span>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this college?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Removing this college will also delete every teacher assigned to it and all question papers they have generated.
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

      <AlertDialog open={isTierDialogOpen} onOpenChange={setIsTierDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tierDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{tierDialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingTier}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTierUpdate}
              className={tierActionClasses}
              disabled={isUpdatingTier}
            >
              {isUpdatingTier ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
