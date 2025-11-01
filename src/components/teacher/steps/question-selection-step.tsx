"use client"

import type { FormData } from "../question-paper-wizard"
import { StepNavigation } from "../ui/step-navigation"
import { InfoMessage } from "../ui/info-message"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"

type QuestionSelectionStepProps = {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onSkip: () => void
  onBack: () => void
  backDisabled: boolean
}

export function QuestionSelectionStep({ formData, updateFormData, onNext, onSkip, onBack, backDisabled }: QuestionSelectionStepProps) {
  const MAX_QUESTIONS = 200
  const adjustQuestionCount = (amount: number) => {
    const newValue = Math.max(1, Math.min(MAX_QUESTIONS, formData.numberOfQuestions + amount))
    updateFormData({ numberOfQuestions: newValue })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Question Selection Criteria</h2>
        <p className="text-gray-500">
          Define the number of questions and total marks. Please select the number of questions to proceed.
        </p>
      </div>

      <div className="space-y-4 text-center py-4">
        <p className="text-left font-medium">Select number of Questions</p>
        <div className="flex max-w-[600px]">
          <Input
            type="number"
            value={formData.numberOfQuestions === 0 ? "" : formData.numberOfQuestions}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                updateFormData({ numberOfQuestions: 0 });
              } else {
                const numValue = parseInt(value);
                if (!isNaN(numValue) && numValue >= 1 && numValue <= MAX_QUESTIONS) {
                  updateFormData({ numberOfQuestions: numValue });
                }
              }
            }}
            onBlur={(e) => {
              // If field is empty on blur, set to minimum value
              if (e.target.value === "" || formData.numberOfQuestions === 0) {
                updateFormData({ numberOfQuestions: 1 });
              } else if (formData.numberOfQuestions > MAX_QUESTIONS) {
                updateFormData({ numberOfQuestions: MAX_QUESTIONS });
              }
            }}
            className="rounded-l-sm border-[#E5E7EB] h-[54px] text-lg"
            min={1}
            max={MAX_QUESTIONS}
          />
          <div className="flex flex-col -ml-px">
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustQuestionCount(1)}
              className="rounded-none rounded-tr-sm border-[#E5E7EB] h-[27px]"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustQuestionCount(-1)}
              disabled={formData.numberOfQuestions <= 1}
              className="rounded-none rounded-br-sm border-[#E5E7EB] h-[27px] -mt-px"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-left text-gray-500">Maximum {MAX_QUESTIONS} questions per paper.</p>
      </div>

      <StepNavigation 
        onNext={onNext} 
        onSkip={onSkip} 
        onBack={onBack}
        backDisabled={backDisabled}
      />

      <InfoMessage message="Please specify the number of questions and total marks before proceeding. This ensures accurate question selection." />
    </div>
  )
}
