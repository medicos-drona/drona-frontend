
import React, { useState, useMemo } from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, Search, X } from 'lucide-react';
import TablePagination from './TablePagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

export interface ColumnDef<T> {
  accessorKey: string;
  header: string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  className?: string;
  headerClassName?: string;
}

export type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  className?: string;
  onRowClick?: (item: T) => void;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  caption?: string;
  showCaption?: boolean;
  hideHeader?: boolean;
  noResultsMessage?: string;
}

function DataTable<T>({
  columns,
  data,
  isLoading = false,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  className,
  onRowClick,
  enableSearch = false,
  searchPlaceholder = "Search...",
  caption,
  showCaption = false,
  hideHeader = false,
  noResultsMessage = "No results found.",
}: DataTableProps<T>) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sort, setSort] = useState<SortState>({ column: null, direction: null });
  const [searchTerm, setSearchTerm] = useState("");
  
  // Apply search filter to data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item => {
      return columns.some(column => {
        if (!column.searchable) return false;
        
        const value = (item as any)[column.accessorKey];
        if (value == null) return false;
        
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, columns, searchTerm]);
  
  // Apply sorting if needed
  const sortedData = useMemo(() => {
    if (!sort.column || !sort.direction) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = (a as any)[sort.column as string];
      const bValue = (b as any)[sort.column as string];
      
      // Handle null or undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      // For string comparison (case-insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
        return sort.direction === 'asc' ? comparison : -comparison;
      }
      
      // For other types
      if (aValue === bValue) return 0;
      const comparison = aValue > bValue ? 1 : -1;
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sort.column, sort.direction]);
  
  // Reset to first page when search changes
  React.useEffect(() => {
    setPageIndex(0);
  }, [searchTerm]);
  
  // Apply pagination
  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, pageIndex, pageSize]);
  
  const totalPages = Math.ceil(sortedData.length / pageSize);
  
  const handleSort = (column: string) => {
    setSort(prev => {
      if (prev.column === column) {
        if (prev.direction === 'asc') return { column, direction: 'desc' };
        if (prev.direction === 'desc') return { column: null, direction: null };
      }
      return { column, direction: 'asc' };
    });
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      {enableSearch && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-8 pr-10"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button 
              onClick={clearSearch} 
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          {showCaption && caption && (
            <caption className="p-4 text-sm text-muted-foreground">
              {caption}
            </caption>
          )}
          
          {!hideHeader && (
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead 
                    key={column.accessorKey}
                    className={cn(column.headerClassName, column.className)}
                  >
                    <div 
                      className={cn(
                        "flex items-center space-x-1", 
                        column.sortable && "cursor-pointer select-none"
                      )}
                      onClick={() => {
                        if (column.sortable) {
                          handleSort(column.accessorKey);
                        }
                      }}
                      role={column.sortable ? "button" : undefined}
                      tabIndex={column.sortable ? 0 : undefined}
                      aria-sort={
                        sort.column === column.accessorKey
                          ? sort.direction === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : undefined
                      }
                      onKeyDown={(e) => {
                        if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                          handleSort(column.accessorKey);
                          e.preventDefault();
                        }
                      }}
                    >
                      <span>{column.header}</span>
                      {column.sortable && sort.column === column.accessorKey && (
                        <span className="ml-1">
                          {sort.direction === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : sort.direction === 'desc' ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : null}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          )}
          
          <TableBody>
            {isLoading ? (
              // Display loading skeletons
              Array.from({ length: pageSize }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {columns.map((column, cellIndex) => (
                    <TableCell key={`skeleton-${rowIndex}-${cellIndex}`}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex}
                  className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                  onClick={() => onRowClick && onRowClick(row)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                      onRowClick(row);
                      e.preventDefault();
                    }
                  }}
                  role={onRowClick ? "button" : undefined}
                >
                  {columns.map((column, cellIndex) => (
                    <TableCell 
                      key={`${rowIndex}-${cellIndex}`} 
                      className={cn(column.className)}
                    >
                      {column.cell ? column.cell(row) : (row as any)[column.accessorKey]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {searchTerm ? (
                    <p className="text-muted-foreground">
                      No results found for "{searchTerm}".
                    </p>
                  ) : (
                    noResultsMessage
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {!isLoading && sortedData.length > 0 && (
        <TablePagination
          currentPage={pageIndex + 1}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageChange={(page) => setPageIndex(page - 1)}
          onPageSizeChange={setPageSize}
          totalItems={sortedData.length}
        />
      )}
    </div>
  );
}

export default DataTable;
