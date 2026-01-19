import { TablePagination } from '@/components/table/Pagination';

interface MovementsPaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
  onPageSizeChange: (size: number) => void;
}

export const MovementsPagination = ({
  page,
  totalPages,
  pageSize,
  onPrev,
  onNext,
  onPageSizeChange,
}: MovementsPaginationProps) => (
  <TablePagination
    page={page}
    totalPages={totalPages}
    onPrev={onPrev}
    onNext={onNext}
    pageSize={pageSize}
    onPageSizeChange={onPageSizeChange}
  />
);
