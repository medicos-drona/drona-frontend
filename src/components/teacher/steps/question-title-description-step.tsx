"use client"

import type { FormData } from "../question-paper-wizard"
import { OptionButton } from "../ui/option-button"
import { StepNavigation } from "../ui/step-navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"


type QuestionTitleAndDescriptionStepProps = {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onSkip: () => void
  onBack: () => void
  backDisabled: boolean
}

export function QuestionTitleAndDescriptionStep({ formData, updateFormData, onNext, onSkip, onBack, backDisabled }: QuestionTitleAndDescriptionStepProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ title: e.target.value })
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateFormData({ description: e.target.value })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Paper Details</h2>
        <p className="text-gray-500">Add a title and description for your question paper.</p>
      </div>

      {/* <div className="flex justify-center py-4">
        <div className="inline-flex rounded-sm border border-gray-200 overflow-hidden min-h-[48px]">
          <OptionButton
            selected={formData.questionType === "NEET"}
            onClick={() => handleSelect("NEET")}
            grouped={true}
            position="left"
            className="rounded-none border-0"
          >
            NEET
          </OptionButton>
          <div className="w-px bg-gray-200 min-h-full"></div>
          <OptionButton
            selected={formData.questionType === "CEET"}
            onClick={() => handleSelect("CEET")}
            grouped={true}
            position="right"
            className="rounded-none border-0"
          >
            CEET
          </OptionButton>
        </div>
      </div> */}
      
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="space-y-2">
          <Label htmlFor="paper-title" className="text-sm font-medium">
            Paper Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="paper-title"
            type="text"
            placeholder="Enter the title of your question paper"
            value={formData.title || ""}
            onChange={handleTitleChange}
            className="w-full"
          />
          <p className="text-xs text-gray-500">This will appear at the top of your question paper</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paper-description" className="text-sm font-medium">
            Description (Optional)
          </Label>
          <Textarea
            id="paper-description"
            placeholder="Add instructions, time limit, or other details for the paper"
            value={formData.description || ""}
            onChange={handleDescriptionChange}
            className="w-full min-h-[100px] resize-none"
          />
          <p className="text-xs text-gray-500">Additional instructions or information for students</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900">Preview</h4>
              <div className="mt-2 text-sm text-blue-800">
                <div className="font-semibold">{formData.title || "Your Paper Title"}</div>
                {formData.description && <div className="mt-1 text-blue-700">{formData.description}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <StepNavigation
        onNext={onNext}
        onSkip={onSkip}
        onBack={onBack}
        backDisabled={backDisabled}
        nextDisabled={!formData.title?.trim()}
      />
    </div>
  )
}
