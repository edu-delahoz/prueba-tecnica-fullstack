import { useMemo } from 'react';

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CsvPreviewTableProps {
  headers: string[];
  rows: string[][];
}

type ColumnMeta = {
  id: string;
  label: string;
};

type RowMeta = {
  id: string;
  values: string[];
};

const sanitizeKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const createColumns = (headers: string[]): ColumnMeta[] => {
  const counts = new Map<string, number>();
  let columnIndex = 0;

  return headers.map((header) => {
    columnIndex += 1;
    const label = header || `Column ${columnIndex}`;
    const key = sanitizeKey(label) || `column-${columnIndex}`;
    const seen = counts.get(key) ?? 0;
    counts.set(key, seen + 1);
    const uniqueId = `${key}-${seen}`;

    return { id: uniqueId, label };
  });
};

const createRows = (rows: string[][]): RowMeta[] => {
  const counts = new Map<string, number>();

  return rows.map((row) => {
    const signature = row.join('|') || 'empty';
    const seen = counts.get(signature) ?? 0;
    counts.set(signature, seen + 1);
    const id = `row-${sanitizeKey(signature)}-${seen}`;
    return { id, values: row };
  });
};

export const CsvPreviewTable = ({ headers, rows }: CsvPreviewTableProps) => {
  const columns = useMemo(() => createColumns(headers), [headers]);
  const rowEntries = useMemo(() => createRows(rows), [rows]);

  return (
    <div className='relative max-h-[65vh] overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm'>
      <div className='relative max-h-[65vh] overflow-auto'>
        <table className='w-full caption-bottom text-sm'>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowEntries.map((entry) => (
              <TableRow key={entry.id}>
                {columns.map((column, columnPosition) => (
                  <TableCell key={`${entry.id}-${column.id}`}>
                    {entry.values[columnPosition] ?? ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>
    </div>
  );
};
