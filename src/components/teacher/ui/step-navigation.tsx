"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

type StepNavigationProps = {
  onNext: () => void
  onSkip: () => void
  onBack: () => void
  nextDisabled?: boolean
  backDisabled?: boolean
  nextLabel?: string
  skipLabel?: string
  showSkip?: boolean
}

export function StepNavigation({
  onNext,
  onSkip,
  onBack,
  nextDisabled = false,
  backDisabled = false,
  nextLabel = "Next",
  skipLabel = "Skip",
  showSkip = true
}: StepNavigationProps) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <Button onClick={onNext} disabled={nextDisabled} className="w-full max-w-sm h-12 bg-[#05603A] hover:bg-[#04502F]">
        {nextLabel} <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onBack} disabled={backDisabled} className="text-sm text-gray-500">
          Back
        </Button>
        {showSkip && (
          <Button variant="ghost" onClick={onSkip} className="text-sm text-gray-500">
            {skipLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
