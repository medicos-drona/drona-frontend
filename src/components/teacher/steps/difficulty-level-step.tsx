"use client"

import type { FormData } from "../question-paper-wizard"
import { OptionButton } from "../ui/option-button"
import { StepNavigation } from "../ui/step-navigation"
import { InfoMessage } from "../ui/info-message"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

type DifficultyLevelStepProps = {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onSkip: () => void
  onBack: () => void
  backDisabled: boolean
}

export function DifficultyLevelStep({ formData, updateFormData, onNext, onSkip, onBack, backDisabled }: DifficultyLevelStepProps) {
  const handleModeSelect = (mode: "auto" | "custom") => {
    if (mode === "auto") {
      // Set default percentages for auto generation
      updateFormData({
        difficultyMode: mode,
        difficultyLevels: {
          easyPercentage: 30,
          mediumPercentage: 50,
          hardPercentage: 20
        }
      })
    } else {
      updateFormData({ difficultyMode: mode })
    }
  }

  const adjustDifficulty = (level: keyof typeof formData.difficultyLevels, amount: number) => {
    const newValue = Math.max(0, Math.min(100, formData.difficultyLevels[level] + amount))
    updateFormData({
      difficultyLevels: {
        ...formData.difficultyLevels,
        [level]: newValue,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Select Difficulty Level</h2>
        <p className="text-gray-500">Choose the complexity of your questions: Easy, Medium, Hard, or Mixed</p>
      </div>
      <div className="flex justify-center py-4">
        <div className="inline-flex rounded-sm border border-gray-200 overflow-hidden min-h-[48px]">
          <OptionButton
            selected={formData.difficultyMode === "auto"}
            onClick={() => handleModeSelect("auto")}
            grouped={true}
            position="left"
            className="rounded-none border-0"
          >
            Auto generation
          </OptionButton>
                    <div className="w-px bg-gray-200"></div>

          <OptionButton
            selected={formData.difficultyMode === "custom"}
            onClick={() => handleModeSelect("custom")}
            grouped={true}
            position="right"
            className="rounded-none border-0"
          >
            Customization
          </OptionButton>
        </div>
      </div> 

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <p className="text-left font-medium">Easy</p>
          <div className="inline-flex items-center rounded-sm border-[#E5E7EB] border p-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustDifficulty("easyPercentage", -10)}
              className="rounded-sm border-[#E5E7EB] h-8"
              disabled={formData.difficultyMode === "auto"}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-[50px] text-center font-medium">{formData.difficultyLevels.easyPercentage}%</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustDifficulty("easyPercentage", 10)}
              className="rounded-sm border-[#E5E7EB] h-8"
              disabled={formData.difficultyMode === "auto"}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-left font-medium">Medium</p>
          <div className="inline-flex items-center rounded-sm border-[#E5E7EB] border p-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustDifficulty("mediumPercentage", -10)}
              className="rounded-sm border-[#E5E7EB] h-8"
              disabled={formData.difficultyMode === "auto"}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-[50px] text-center font-medium">{formData.difficultyLevels.mediumPercentage}%</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustDifficulty("mediumPercentage", 10)}
              className="rounded-sm border-[#E5E7EB] h-8"
              disabled={formData.difficultyMode === "auto"}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-left font-medium">Hard</p>
          <div className="inline-flex items-center rounded-sm border-[#E5E7EB] border p-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustDifficulty("hardPercentage", -10)}
              className="rounded-sm border-[#E5E7EB] h-8"
              disabled={formData.difficultyMode === "auto"}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-[50px] text-center font-medium">{formData.difficultyLevels.hardPercentage}%</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustDifficulty("hardPercentage", 10)}
              className="rounded-sm border-[#E5E7EB] h-8"
              disabled={formData.difficultyMode === "auto"}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <StepNavigation 
        onNext={onNext} 
        onSkip={onSkip} 
        onBack={onBack}
        backDisabled={backDisabled}
      />

      <InfoMessage message="Please select a difficulty level before proceeding. Your choice will determine the complexity of the questions generated." />
    </div>
  )
}
