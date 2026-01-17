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

interface UsersTableProps {
  users: UserRow[];
  canEdit: boolean;
  onEdit: (user: UserRow) => void;
}

export const UsersTable = ({ users, canEdit, onEdit }: UsersTableProps) => {
  const shouldShowPhoneColumn = users.some((entry) => Boolean(entry.phone));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          {shouldShowPhoneColumn && <TableHead>Phone</TableHead>}
          <TableHead>Role</TableHead>
          {canEdit && <TableHead className='text-right'>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className='font-medium'>{entry.name ?? '—'}</TableCell>
            <TableCell>{entry.email}</TableCell>
            {shouldShowPhoneColumn && (
              <TableCell>
                {entry.phone ?? (
                  <span className='text-muted-foreground'>—</span>
                )}
              </TableCell>
            )}
            <TableCell>
              <Badge variant={entry.role === 'ADMIN' ? 'default' : 'secondary'}>
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
