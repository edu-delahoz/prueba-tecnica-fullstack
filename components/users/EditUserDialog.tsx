import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Role, UserRow } from '@/lib/users/types';

interface EditUserDialogProps {
  open: boolean;
  user: UserRow | null;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, payload: { name: string; role: Role }) => Promise<void>;
}

export const EditUserDialog = ({
  open,
  user,
  onOpenChange,
  onSave,
}: EditUserDialogProps) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('USER');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !user) {
      setName('');
      setRole('USER');
      setError(null);
      setLoading(false);
      return;
    }
    setName(user.name ?? '');
    setRole(user.role);
    setError(null);
    setLoading(false);
  }, [open, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      return;
    }
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSave(user.id, { name: name.trim(), role });
      onOpenChange(false);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Unable to update user.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>
            Update the name and access level for this member.
          </DialogDescription>
        </DialogHeader>
        <form className='mt-6 space-y-4' onSubmit={handleSubmit}>
          <div className='space-y-2'>
            <Label htmlFor='edit-user-name'>Name</Label>
            <Input
              id='edit-user-name'
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='Full name'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='edit-user-role'>Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as Role)}
            >
              <SelectTrigger id='edit-user-role'>
                <SelectValue placeholder='Select role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ADMIN'>ADMIN</SelectItem>
                <SelectItem value='USER'>USER</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className='text-sm text-destructive'>{error}</p>}
          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
