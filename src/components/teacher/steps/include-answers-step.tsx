"use client"

import type { FormData } from "../question-paper-wizard"
import { OptionButton } from "../ui/option-button"
import { StepNavigation } from "../ui/step-navigation"
import { InfoMessage } from "../ui/info-message"

type IncludeAnswersStepProps = {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onSkip: () => void
  onBack: () => void
  backDisabled: boolean
}

export function IncludeAnswersStep({ formData, updateFormData, onNext, onSkip, onBack, backDisabled }: IncludeAnswersStepProps) {
  const handleSelect = (includeAnswers: boolean) => {
    updateFormData({ includeAnswers })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Include Answers?</h2>
        <p className="text-gray-500">Choose whether to include answers in the paper. (Default: No)</p>
      </div>

      <div className="flex justify-center py-4">
        <div className="inline-flex rounded-sm border border-gray-200 overflow-hidden min-h-[48px]">
          <OptionButton
            selected={formData.includeAnswers === true}
            onClick={() => handleSelect(true)}
            grouped={true}
            position="left"
            className="rounded-none border-0"
          >
            Yes
          </OptionButton>
          <div className="w-px bg-gray-200 min-h-full"></div>

          <OptionButton
            selected={formData.includeAnswers === false}
            onClick={() => handleSelect(false)}
            grouped={true}
            position="right"
            className="rounded-none border-0"
          >
            No
          </OptionButton>
        </div>
      </div>

      <StepNavigation 
        onNext={onNext} 
        onSkip={onSkip} 
        onBack={onBack}
        backDisabled={backDisabled}
      />

      <InfoMessage message="Please select an option before proceeding." />
    </div>
  )
}
