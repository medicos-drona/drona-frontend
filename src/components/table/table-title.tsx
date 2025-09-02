import { Button } from "@/components/ui/button"
import { Search, Filter, RefreshCw } from "lucide-react"

interface TableTitleProps {
  title: string
  onFilter?: () => void
  onSeeAll?: () => void
}

export function TableTitle({ title, onFilter, onSeeAll }: TableTitleProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex items-center gap-2">
        {onFilter && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onFilter}
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
        )}
        {onSeeAll && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onSeeAll}
          >
            <RefreshCw className="h-4 w-4" />
            <span>See All</span>
          </Button>
        )}
      </div>
    </div>
  )
}
