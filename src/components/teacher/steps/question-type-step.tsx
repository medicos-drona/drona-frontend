"use client"

import type { FormData } from "../question-paper-wizard"
import { OptionButton } from "../ui/option-button"
import { StepNavigation } from "../ui/step-navigation"

type QuestionTypeStepProps = {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onSkip: () => void
  onBack: () => void
  backDisabled: boolean
}

export function QuestionTypeStep({ formData, updateFormData, onNext, onSkip, onBack, backDisabled }: QuestionTypeStepProps) {
  const handleSelect = (type: string) => {
    updateFormData({ questionType: type })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Question Type</h2>
        <p className="text-gray-500">Select the types of questions you want.</p>
      </div>

      <div className="flex justify-center py-4">
        <div className="grid grid-cols-3 gap-2 w-full max-w-2xl">
          <OptionButton
            selected={formData.questionType === "NEET"}
            onClick={() => handleSelect("NEET")}
            className="w-full"
          >
            NEET
          </OptionButton>
          <OptionButton
            selected={formData.questionType === "CET"}
            onClick={() => handleSelect("CET")}
            className="w-full"
          >
            CET
          </OptionButton>
          <OptionButton
            selected={formData.questionType === "JEE"}
            onClick={() => handleSelect("JEE")}
            className="w-full"
          >
            JEE
          </OptionButton>
          <OptionButton
            selected={formData.questionType === "AIIMS"}
            onClick={() => handleSelect("AIIMS")}
            className="w-full"
          >
            AIIMS
          </OptionButton>
          <OptionButton
            selected={formData.questionType === "JIPMER"}
            onClick={() => handleSelect("JIPMER")}
            className="w-full"
          >
            JIPMER
          </OptionButton>
          <OptionButton
            selected={formData.questionType === "CUSTOM"}
            onClick={() => handleSelect("CUSTOM")}
            className="w-full"
          >
            CUSTOM
          </OptionButton>
        </div>
      </div>

      <StepNavigation 
        onNext={onNext} 
        onSkip={onSkip} 
        onBack={onBack}
        backDisabled={backDisabled}
        nextDisabled={!formData.questionType} 
      />
    </div>
  )
}
