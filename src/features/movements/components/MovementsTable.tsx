import { CalendarDays, DollarSign } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { MovementRow } from '@/src/features/movements/hooks/useMovementsQuery';
import { TableSkeletonRows } from '@/src/shared/components/TableSkeletonRows';

interface MovementsTableProps {
  movements: MovementRow[];
  formatAmount: (value: string) => string;
  formatDate: (value: string) => string;
  loading: boolean;
}

export const MovementsTable = ({
  movements,
  formatAmount,
  formatDate,
  loading,
}: MovementsTableProps) => {
  const columns = 4;
  const showSkeleton = loading && movements.length === 0;
  const showEmptyState = !loading && movements.length === 0;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Concept</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>User</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {showSkeleton && <TableSkeletonRows columns={columns} />}
        {showEmptyState && (
          <TableRow>
            <TableCell
              colSpan={columns}
              className='py-8 text-center text-sm text-muted-foreground'
            >
              No movements available.
            </TableCell>
          </TableRow>
        )}
        {!showEmptyState &&
          movements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell className='font-medium'>{movement.concept}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center gap-2 font-semibold ${
                    movement.type === 'INCOME'
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  <DollarSign className='h-4 w-4' />
                  {formatAmount(movement.amount)}
                </span>
              </TableCell>
              <TableCell className='text-muted-foreground'>
                <span className='inline-flex items-center gap-2'>
                  <CalendarDays className='h-4 w-4' />
                  {formatDate(movement.date)}
                </span>
              </TableCell>
              <TableCell>
                {movement.user.name ?? movement.user.email}
                <p className='text-xs text-muted-foreground'>
                  {movement.user.email}
                </p>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};
