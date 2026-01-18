import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

export const TablePagination = ({
  page,
  totalPages,
  onPrev,
  onNext,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageSizeChange,
}: PaginationProps) => (
  <div className='mt-4 flex flex-col gap-3 border-t border-border/60 pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={onPrev}
        disabled={page <= 1}
        className='gap-2'
      >
        <ChevronLeft className='h-4 w-4' />
        Prev
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={onNext}
        disabled={page >= totalPages}
        className='gap-2'
      >
        Next
        <ChevronRight className='h-4 w-4' />
      </Button>
      <span className='select-none'>
        Page {totalPages === 0 ? 0 : page} of {totalPages}
      </span>
    </div>
    {onPageSizeChange && (
      <div className='flex items-center gap-2 sm:justify-end'>
        <span className='select-none'>Rows per page</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className='w-[100px]'>
            <SelectValue placeholder='Select' />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={option.toString()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )}
  </div>
);
