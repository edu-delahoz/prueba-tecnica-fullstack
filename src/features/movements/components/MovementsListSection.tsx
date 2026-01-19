import { RefreshCw, ShieldOff } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MovementsPagination } from '@/src/features/movements/components/MovementsPagination';
import { MovementsTable } from '@/src/features/movements/components/MovementsTable';
import type {
  MovementRow,
  MovementsMeta,
} from '@/src/features/movements/hooks/useMovementsQuery';
import {
  formatMovementAmount,
  formatMovementDate,
} from '@/src/features/movements/utils/format';
import type { MeUser } from '@/lib/hooks/useMe';

interface MovementsListSectionProps {
  listLoading: boolean;
  listError: string | null;
  user: MeUser | null;
  isAdmin: boolean;
  totalRecords: number;
  hasMovements: boolean;
  movements: MovementRow[];
  paginationMeta: MovementsMeta;
  page: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
}

export const MovementsListSection = ({
  listLoading,
  listError,
  user,
  isAdmin,
  totalRecords,
  hasMovements,
  movements,
  paginationMeta,
  page,
  pageSize,
  onPrev,
  onNext,
  onPageSizeChange,
  onRetry,
}: MovementsListSectionProps) => {
  const showRetry = Boolean(listError) && Boolean(user);

  if (listLoading) {
    return (
      <Card>
        <CardContent className='flex items-center gap-3 py-10 text-muted-foreground'>
          <RefreshCw className='h-4 w-4 animate-spin' />
          Loading movements...
        </CardContent>
      </Card>
    );
  }

  if (listError) {
    return (
      <Card className='border border-destructive/30 bg-destructive/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-destructive'>
            <ShieldOff className='h-4 w-4' />
            {listError}
          </CardTitle>
          <CardDescription>
            {user
              ? 'Please try again. If the issue persists contact support.'
              : 'Sign in to access this section.'}
          </CardDescription>
        </CardHeader>
        {showRetry && (
          <CardContent>
            <Button variant='outline' onClick={onRetry}>
              Retry
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  if (!hasMovements) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No movements yet</CardTitle>
          <CardDescription>
            {isAdmin
              ? 'Create your first income or expense to populate the table.'
              : 'Movements will appear here once admins add them.'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0'>
        <div>
          <CardTitle>Latest movements</CardTitle>
          <CardDescription>Showing {totalRecords} records</CardDescription>
        </div>
        <Badge variant='secondary' className='text-xs'>
          Updated {new Date().toLocaleDateString()}
        </Badge>
      </CardHeader>
      <CardContent>
        <MovementsTable
          movements={movements}
          formatAmount={formatMovementAmount}
          formatDate={formatMovementDate}
        />
        {hasMovements && (
          <MovementsPagination
            page={page}
            totalPages={paginationMeta.totalPages}
            onPrev={onPrev}
            onNext={onNext}
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </CardContent>
    </Card>
  );
};
