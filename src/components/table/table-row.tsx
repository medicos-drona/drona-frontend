import Image from "next/image"
import { User } from "lucide-react"
import type { TableRowProps } from "./types"

export function TableRow({ teacher, onEdit, onDelete, columns }: TableRowProps) {
  // Ensure status is properly formatted for display
  const displayStatus = typeof teacher.status === 'string' 
    ? teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1).toLowerCase()
    : 'Unknown';
  
  const isActive = displayStatus === 'Active' || displayStatus.toLowerCase() === 'active';

  return (
    <tr className="border-b border-gray-200 last:border-b-0">
      {columns.includes("name") && (
        <td className="px-4 py-3 text-left text-[14px] font-normal text-[#667085] font-semibold">
          <div className="flex items-center gap-3">
            <div className="relative">
              {teacher.avatar ? (
                <Image
                  src={teacher.avatar}
                  alt={teacher.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">
                ✓
              </div>
            </div>
            <span>{teacher.name}</span>
          </div>
        </td>
      )}
      {columns.includes("department") && (
        <td className="px-4 py-3 text-left text-[14px] font-normal text-[#667085]">
          {teacher.department || "N/A"}
        </td>
      )}
      {columns.includes("email") && (
        <td className="px-4 py-3 text-left text-[14px] font-normal text-[#667085]">
          {teacher.email || "N/A"}
        </td>
      )}
      {columns.includes("phone") && (
        <td className="px-4 py-3 text-left text-[14px] font-normal text-[#667085]">
          {teacher.phone || "N/A"}
        </td>
      )}
      {columns.includes("status") && (
        <td className="px-4 py-3 text-left text-[14px] font-normal">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {displayStatus}
          </span>
        </td>
      )}
      {columns.includes("actions") && (
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => onEdit && onEdit(teacher.id)}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(teacher.id)}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </td>
      )}
    </tr>
  )
}
