"use client"

import { useState, useEffect } from "react"
import type { TeacherData, TeacherTableProps } from "./types"
import { User, CheckCircle, Pencil, Trash2, Filter } from "lucide-react"

export function TeachersTable({
  data = [],
  title = "View Teachers list",
  onEdit,
  onDelete,
  columns = ["name", "department", "email", "phone", "status", "actions"],
  itemsPerPage = 5,
  isLoading = false,
  onRefresh,
  onFilter,
}: TeacherTableProps) {
  const [displayData, setDisplayData] = useState<TeacherData[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (Array.isArray(data)) {
      setDisplayData(data);
    } else {
      setDisplayData([]);
    }
  }, [data]);

  useEffect(() => {
    setCurrentPage(1)
  }, [data])

  const totalPages = Math.max(1, Math.ceil((displayData?.length || 0) / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = displayData?.slice(startIndex, startIndex + itemsPerPage) || []

  return (
    <div className="w-full bg-white rounded-xl shadow border border-gray-200 p-0">
      {/* Main Section Title and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-6 pt-6 pb-2">
        <h2 className="text-xl font-bold mb-2 md:mb-0">View Techers list</h2>
        <div className="flex gap-2">
          {/* <button
            className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium"
            onClick={onFilter}
          >
            <Filter className="w-4 h-4 mr-1" /> Filter
          </button>
          <button
            className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium"
            onClick={onRefresh}
          >
            See all
          </button> */}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-6 pb-6">
        <table className="min-w-full bg-white rounded-xl">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-sm">
              <th className="py-3 px-4 text-left font-medium">Teacher Name</th>
              <th className="py-3 px-4 text-left font-medium">Subject Assigned</th>
              <th className="py-3 px-4 text-left font-medium">Email Id</th>
              <th className="py-3 px-4 text-left font-medium">Phone number</th>
              <th className="py-3 px-4 text-left font-medium">Status</th>
              <th className="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-10">Loading...</td></tr>
            ) : paginatedData.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">No teachers found</td></tr>
            ) : (
              paginatedData.map((teacher) => (
                <tr key={teacher.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  {/* Teacher Name with avatar and badge */}
                  <td className="py-3 px-4 flex items-center gap-3 min-w-[200px]">
                    {teacher.avatar ? (
                      <img src={teacher.avatar} alt={teacher.name} className="w-10 h-10 rounded-full object-cover border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <span className="font-medium text-gray-900">{teacher.name}</span>
                    <CheckCircle className="w-4 h-4 text-blue-500 ml-1" fill="#3b82f6" />
                  </td>
                  {/* Subject Assigned */}
                  <td className="py-3 px-4 text-gray-700">{teacher.department || "-"}</td>
                  {/* Email Id */}
                  <td className="py-3 px-4 text-gray-700">{teacher.email}</td>
                  {/* Phone number */}
                  <td className="py-3 px-4 font-medium text-green-600">{teacher.phone}</td>
                  {/* Status */}
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${teacher.status.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                      {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit && onEdit(teacher.id)}
                        className="rounded-full bg-yellow-100 hover:bg-yellow-200 p-2 text-yellow-700 transition"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete && onDelete(teacher.id)}
                        className="rounded-full bg-red-100 hover:bg-red-200 p-2 text-red-700 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
