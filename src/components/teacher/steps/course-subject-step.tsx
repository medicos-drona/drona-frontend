"use client"

import { useState } from "react"
import type { FormData } from "../question-paper-wizard"
import { OptionButton } from "../ui/option-button"
import { StepNavigation } from "../ui/step-navigation"
import { InfoMessage } from "../ui/info-message"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"

type CourseSubjectStepProps = {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onSkip: () => void
  onBack: () => void
  backDisabled: boolean
}

const availableSubjects = [
  { display: "Physics", value: "physics" },
  { display: "Chemistry", value: "chemistry" },
  { display: "Biology", value: "biology" },
  { display: "Mathematics", value: "mathematics" },
  { display: "Botany", value: "botany" },    
  { display: "Zoology", value: "zoology" }
]

export function CourseSubjectStep({ formData, updateFormData, onNext, onSkip, onBack, backDisabled }: CourseSubjectStepProps) {
  // Handle paper mode selection
  const handleModeSelect = (mode: "single" | "multi") => {
    updateFormData({
      paperMode: mode,
      // Reset selections when switching modes
      subject: "",
      subjects: [],
      subjectConfigs: {}
    })
  }

  // Handle single subject selection
  const handleSelectSubject = (subjectValue: string) => {
    updateFormData({ subject: subjectValue })
  }

  // Handle multi-subject selection
  const handleToggleSubject = (subjectValue: string) => {
    const isSelected = formData.subjects.includes(subjectValue)
    let newSubjects: string[]

    if (isSelected) {
      // Remove subject
      newSubjects = formData.subjects.filter(s => s !== subjectValue)
      // Also remove from configs
      const newConfigs = { ...formData.subjectConfigs }
      delete newConfigs[subjectValue]
      updateFormData({
        subjects: newSubjects,
        subjectConfigs: newConfigs
      })
    } else {
      // Add subject
      newSubjects = [...formData.subjects, subjectValue]
      updateFormData({ subjects: newSubjects })
    }
  }

  // Validation logic
  const isNextDisabled = formData.paperMode === "single"
    ? !formData.subject
    : formData.subjects.length === 0

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Course & Subject Selection</h2>
        <p className="text-gray-500">
          Choose between single subject or multi-subject question paper
        </p>
      </div>

      {/* Paper Mode Selection */}
      <div className="flex justify-center py-4">
        <div className="inline-flex rounded-sm border border-gray-200 overflow-hidden min-h-[48px]">
          <OptionButton
            selected={formData.paperMode === "single"}
            onClick={() => handleModeSelect("single")}
            grouped={true}
            position="left"
            className="rounded-none border-0"
          >
            Single Subject
          </OptionButton>
          <div className="w-px bg-gray-200"></div>
          <OptionButton
            selected={formData.paperMode === "multi"}
            onClick={() => handleModeSelect("multi")}
            grouped={true}
            position="right"
            className="rounded-none border-0"
          >
            Multi-Subject
          </OptionButton>
        </div>
      </div>

      {/* Single Subject Selection */}
      {formData.paperMode === "single" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableSubjects.map((subject) => (
                <Button
                  key={subject.value}
                  variant={formData.subject === subject.value ? "default" : "outline"}
                  onClick={() => handleSelectSubject(subject.value)}
                  className="h-12"
                >
                  {subject.display}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Multi-Subject Selection */}
      {formData.paperMode === "multi" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Select Subjects</span>
              {formData.subjects.length > 0 && (
                <Badge variant="secondary">
                  {formData.subjects.length} selected
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableSubjects.map((subject) => {
                const isSelected = formData.subjects.includes(subject.value)
                return (
                  <Button
                    key={subject.value}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleToggleSubject(subject.value)}
                    className="h-12 relative"
                  >
                    <span className="flex items-center gap-2">
                      {subject.display}
                      {isSelected && <Check className="h-4 w-4" />}
                    </span>
                  </Button>
                )
              })}
            </div>

            {formData.subjects.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-700 font-medium">Selected Subjects:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.subjects.map((subjectValue) => {
                    const subjectObj = availableSubjects.find(s => s.value === subjectValue)
                    return (
                      <Badge key={subjectValue} variant="secondary" className="flex items-center gap-1">
                        {subjectObj?.display || subjectValue}
                        <button
                          onClick={() => handleToggleSubject(subjectValue)}
                          className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <StepNavigation
        onNext={onNext}
        onSkip={onSkip}
        onBack={onBack}
        backDisabled={backDisabled}
        nextDisabled={isNextDisabled}
      />

      {isNextDisabled && (
        <InfoMessage
          message={
            formData.paperMode === "single"
              ? "Please select a subject before proceeding."
              : "Please select at least one subject before proceeding."
          }
        />
      )}
    </div>
  )
}
