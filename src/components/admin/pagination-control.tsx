"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationControlProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function PaginationControl({ currentPage, totalPages, onPageChange }: PaginationControlProps) {
  // Generate page numbers
  const pageNumbers = []
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center px-4 py-2 text-[15px] font-[500] text-[#667085] disabled:opacity-50"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        PREVIOUS
      </button>

      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`w-8 h-8 flex items-center justify-center rounded-md text-[15px] font-medium
            ${currentPage === number ? "bg-[#6B7280] text-white" : "text-[#6B7280] hover:bg-gray-100"}`}
        >
          {number}
        </button>
      ))}

      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center px-4 py-2 text-[15px] font-[500] text-[#667085] disabled:opacity-50"
      >
        NEXT
        <ChevronRight className="ml-1 h-4 w-4" />
      </button>
    </div>
  )
}
