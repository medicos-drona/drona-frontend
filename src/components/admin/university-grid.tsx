"use client"

import { useState } from "react"
import UniversityCard from "@/components/admin/university-card"
import PaginationControl from "@/components/admin/pagination-control"
import type { University } from "@/lib/types/university"

interface UniversityGridProps {
  universities: University[]
  itemsPerPage: number
  onCollegeDeleted?: () => void
  onTierUpdated?: () => void
}

export default function UniversityGrid({ universities, itemsPerPage, onCollegeDeleted, onTierUpdated }: UniversityGridProps) {
  const [currentPage, setCurrentPage] = useState(1)

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = universities.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(universities.length / itemsPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentItems.map((university, index) => (
          <UniversityCard
            key={index}
            university={university}
            onDelete={onCollegeDeleted}
            onTierChange={onTierUpdated}
          />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <PaginationControl currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  )
}
