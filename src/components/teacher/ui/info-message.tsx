import { Info } from "lucide-react"

type InfoMessageProps = {
  message: string
}

export function InfoMessage({ message }: InfoMessageProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-600">
      <Info className="h-5 w-5 text-blue-500" />
      <p>{message}</p>
    </div>
  )
}
