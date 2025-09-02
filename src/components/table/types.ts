export interface TeacherData {
  id: string
  name: string
  avatar?: string
  department?: string
  email: string
  phone?: string
  status: string
}

export interface TeacherTableProps {
  data: TeacherData[]
  title?: string
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  columns?: Array<"name" | "department" | "email" | "phone" | "status" | "actions">
  itemsPerPage?: number
  isLoading?: boolean
  onRefresh?: () => void
  onFilter?: () => void
}

export interface TableTitleProps {
  title: string
  onFilter: () => void
  onSeeAll: () => void
}

export interface TableHeaderProps {
  columns: Array<"name" | "department" | "email" | "phone" | "status" | "actions">
}

export interface TableRowProps {
  teacher: TeacherData
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  columns: Array<"name" | "department" | "email" | "phone" | "status" | "actions">
}
