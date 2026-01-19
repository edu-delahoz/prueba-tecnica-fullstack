import { useMemo } from 'react';

import { TableCell, TableRow } from '@/components/ui/table';

interface TableSkeletonRowsProps {
  columns: number;
  rows?: number;
  renderCell?: (columnIndex: number) => React.ReactNode;
}

export const TableSkeletonRows = ({
  columns,
  rows = 5,
  renderCell,
}: TableSkeletonRowsProps) => {
  const columnCount = Math.max(columns, 1);
  const rowCount = Math.max(rows, 1);
  const buildCell = (columnIndex: number) =>
    renderCell ? (
      renderCell(columnIndex)
    ) : (
      <div className='h-4 w-full animate-pulse rounded bg-muted/60' />
    );

  const rowKeys = useMemo(
    () =>
      Array.from({ length: rowCount }, () => {
        if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
          return crypto.randomUUID();
        }
        return Math.random().toString(36).slice(2, 11);
      }),
    [rowCount]
  );

  const columnKeys = useMemo(
    () =>
      Array.from({ length: columnCount }, (_, index) => `column-${index + 1}`),
    [columnCount]
  );

  return (
    <>
      {rowKeys.map((rowKey) => (
        <TableRow key={rowKey}>
          {columnKeys.map((columnKey, columnIndex) => (
            <TableCell key={`${rowKey}-${columnKey}`}>
              {buildCell(columnIndex)}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};
