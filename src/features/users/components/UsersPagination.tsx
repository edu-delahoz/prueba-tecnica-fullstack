import { TablePagination } from '@/components/table/Pagination';

interface UsersPaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
  onPageSizeChange: (size: number) => void;
}

export const UsersPagination = ({
  page,
  totalPages,
  pageSize,
  onPrev,
  onNext,
  onPageSizeChange,
}: UsersPaginationProps) => (
  <TablePagination
    page={page}
    totalPages={totalPages}
    onPrev={onPrev}
    onNext={onNext}
    pageSize={pageSize}
    onPageSizeChange={onPageSizeChange}
  />
);
