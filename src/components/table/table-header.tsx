import type { TableHeaderProps } from "./types"

export function TableHeader({ columns }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {columns.includes("name") && (
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Teacher Name
          </th>
        )}
        {columns.includes("department") && (
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Department
          </th>
        )}
        {columns.includes("email") && (
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Email ID
          </th>
        )}
        {columns.includes("phone") && (
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Phone Number
          </th>
        )}
        {columns.includes("status") && (
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
        )}
        {columns.includes("actions") && (
          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        )}
      </tr>
    </thead>
  )
}
