"use client"

import type { FormData } from "../question-paper-wizard"
import { Button } from "@/components/ui/button"
import { Download, Eye, Edit, ArrowLeft } from "lucide-react"

type ActionsStepProps = {
  formData: FormData
  onSubmit: () => void
  isLoading?: boolean
  onBack?: () => void
  isSubmitDisabled?: boolean
  submitDisabledReason?: string
}

export function ActionsStep({ formData, onSubmit, isLoading = false, onBack, isSubmitDisabled = false, submitDisabledReason }: ActionsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Actions</h2>
        <p className="text-gray-500">Finalize your selections.</p>
      </div>

      <div className="flex flex-col items-center gap-4 py-4">
        {/* <Button variant="outline" className="w-full max-w-xs flex gap-2">
          <Edit className="h-4 w-4" />
          Edit Questions
        </Button> */}

        <Button
          className="w-full max-w-xs flex gap-2 bg-[#05603A] hover:bg-[#04502F] disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
          onClick={onSubmit}
          disabled={isLoading || isSubmitDisabled}
        >
          <Download className="h-4 w-4" />
          {isLoading ? "Generating PDF..." : "Download PDF"}
        </Button>

        {isSubmitDisabled && submitDisabledReason && (
          <p className="text-sm text-red-600 text-center max-w-sm">{submitDisabledReason}</p>
        )}

        {onBack && (
          <Button
            variant="outline"
            className="w-full max-w-xs flex gap-2"
            onClick={onBack}
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Start
          </Button>
        )}

        {/* <Button variant="ghost" className="flex gap-2">
          <Eye className="h-4 w-4" />
          Preview
        </Button> */}
      </div>
    </div>
  )
}
