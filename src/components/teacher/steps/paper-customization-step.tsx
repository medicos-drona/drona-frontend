"use client"

import React from "react"
import type { FormData } from "../question-paper-wizard"
import { StepNavigation } from "../ui/step-navigation"
import { InfoMessage } from "../ui/info-message"
import { Slider } from "@/components/ui/slider"

type PaperCustomizationStepProps = {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onSkip: () => void
  onBack: () => void
  backDisabled: boolean
}

export function PaperCustomizationStep({ formData, updateFormData, onNext, onSkip, onBack, backDisabled }: PaperCustomizationStepProps) {
  const handleMarksChange = (value: number[]) => {
    updateFormData({ totalMarks: value[0] })
  }

  const handleDurationChange = (value: number[]) => {
    updateFormData({ duration: value[0] })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Paper Customization</h2>
        <p className="text-gray-500">
          Customize your exam paper by selecting the desired format, structure, and preferences.
        </p>
      </div>

      <div className="space-y-6 py-4">
        {/* Total Marks Configuration */}
        <div className="space-y-4">
          <p className="text-left font-medium">Select Total Marks of paper</p>
          <div className="px-4">
            <div className="flex justify-end mb-2">
              <span className="font-medium">{formData.totalMarks}</span>
            </div>
            <Slider
              defaultValue={[formData.totalMarks]}
              max={2000}
              min={10}
              step={5}
              onValueChange={handleMarksChange}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>10 marks</span>
              <span>2000 marks</span>
            </div>
          </div>
        </div>

        {/* Duration Configuration */}
        <div className="space-y-4">
          <p className="text-left font-medium">Select Duration (minutes)</p>
          <div className="px-4">
            <div className="flex justify-end mb-2">
              <span className="font-medium">{formData.duration} min ({Math.floor(formData.duration / 60)}h {formData.duration % 60}m)</span>
            </div>
            <Slider
              defaultValue={[formData.duration]}
              max={1440}
              min={30}
              step={15}
              onValueChange={handleDurationChange}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>30 min</span>
              <span>1440 min (24 hours)</span>
            </div>
          </div>
        </div>
      </div>

      <StepNavigation 
        onNext={onNext} 
        onSkip={onSkip} 
        onBack={onBack}
        backDisabled={backDisabled}
      />

      <InfoMessage message="Please complete the customization settings before proceeding." />
    </div>
  )
}
