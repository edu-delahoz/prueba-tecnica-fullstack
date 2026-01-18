import { useEffect, useMemo, useState } from 'react';

export interface PaginationState<T> {
  page: number;
  pageSize: number;
  totalPages: number;
  items: T[];
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
}

const clampPage = (page: number, totalPages: number) =>
  Math.min(Math.max(page, 1), totalPages || 1);

export const usePagination = <T>(
  data: T[],
  initialPageSize = 10
): PaginationState<T> => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setPage(1);
  }, [data]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  useEffect(() => {
    setPage((current) => clampPage(current, totalPages));
  }, [totalPages]);

  const items = useMemo(() => {
    const currentPage = clampPage(page, totalPages);
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize, totalPages]);

  const nextPage = () =>
    setPage((current) => clampPage(current + 1, totalPages));
  const prevPage = () =>
    setPage((current) => clampPage(current - 1, totalPages));

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return {
    page: clampPage(page, totalPages),
    pageSize,
    totalPages,
    items,
    nextPage,
    prevPage,
    setPageSize: handlePageSizeChange,
  };
};
