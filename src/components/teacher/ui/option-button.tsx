"use client"

import type React from "react"
import { cn } from "@/lib/utils"

type OptionButtonProps = {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
  grouped?: boolean
  position?: "left" | "right" | "single"
}

export function OptionButton({
  selected,
  onClick,
  children,
  className,
  grouped = false,
  position = "single",
}: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center px-4 py-2 text-sm font-medium transition-colors",
        grouped
          ? position === "left"
            ? "rounded-l-sm border border-gray-200"
            : position === "right"
              ? "rounded-r-sm border border-gray-200 border-l-0"
              : "border border-gray-200"
          : "rounded-sm border border-gray-200",
        selected ? "bg-white text-gray-900" : "bg-white text-gray-900",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full mr-2",
          selected ? "bg-[#05603A]" : "border border-gray-300",
        )}
      >
        {selected && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>
      {children}
    </button>
  )
}
