import type { LucideIcon } from "lucide-react"
import { HelpCircle, BookOpen, BarChart2, FileText, FileEdit, CheckSquare, FileOutput } from "lucide-react"

type StepInfo = {
  title: string
  icon: string
}

type StepIndicatorProps = {
  currentStep: number
  steps: StepInfo[]
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  const getIcon = (iconName: string) => {
    const icons: Record<string, LucideIcon> = {
      HelpCircle,
      BookOpen,
      BarChart2,
      FileText,
      FileEdit,
      CheckSquare,
      FileOutput,
    }

    const Icon = icons[iconName] || HelpCircle
    return <Icon className="h-10 w-10 border border-gray-200 rounded-sm p-2" style={{ border: '1px solid var(--Components-Button-White-Border-Color, #E5E7EB)' }} />  }

  return <div className="flex justify-center mb-6">{getIcon(steps[currentStep].icon)}</div>
}
