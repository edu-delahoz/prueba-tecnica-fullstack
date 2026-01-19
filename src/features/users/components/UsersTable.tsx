import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { UserRow } from '@/lib/users/types';
import { TableSkeletonRows } from '@/src/shared/components/TableSkeletonRows';

interface UsersTableProps {
  users: UserRow[];
  canEdit: boolean;
  loading: boolean;
  onEdit: (user: UserRow) => void;
}

export const UsersTable = ({
  users,
  canEdit,
  loading,
  onEdit,
}: UsersTableProps) => {
  const columns = canEdit ? 5 : 4;
  const showSkeleton = loading && users.length === 0;
  const showEmptyState = !loading && users.length === 0;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Role</TableHead>
          {canEdit && <TableHead className='text-right'>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {showSkeleton && (
          <TableSkeletonRows
            columns={columns}
            renderCell={(columnIndex) => {
              if (canEdit && columnIndex === columns - 1) {
                return (
                  <div className='flex justify-end'>
                    <div className='h-6 w-16 animate-pulse rounded bg-muted/60' />
                  </div>
                );
              }
              return (
                <div className='h-4 w-full animate-pulse rounded bg-muted/60' />
              );
            }}
          />
        )}
        {showEmptyState && (
          <TableRow>
            <TableCell
              colSpan={columns}
              className='py-8 text-center text-sm text-muted-foreground'
            >
              No users found.
            </TableCell>
          </TableRow>
        )}
        {!showEmptyState &&
          users.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className='font-medium'>{entry.name ?? '—'}</TableCell>
              <TableCell>{entry.email}</TableCell>
              <TableCell>
                {entry.phone ? (
                  entry.phone
                ) : (
                  <span className='text-muted-foreground'>—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={entry.role === 'ADMIN' ? 'default' : 'secondary'}
                >
                  {entry.role}
                </Badge>
              </TableCell>
              {canEdit && (
                <TableCell className='text-right'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onEdit(entry)}
                  >
                    Edit
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};
