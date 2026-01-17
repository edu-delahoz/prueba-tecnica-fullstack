import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, ShieldOff } from 'lucide-react';

import { TopNav } from '@/components/layout/TopNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { authClient } from '@/lib/auth/client';
import { useMe } from '@/lib/hooks/useMe';

type Role = 'ADMIN' | 'USER';

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string;
};

const UsersPage: NextPage = () => {
  const { user, loading: meLoading, error: meError, refresh: refreshMe } = useMe();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<Role>('USER');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const shouldShowPhoneColumn = useMemo(
    () => users.some((u) => Boolean(u.phone)),
    [users],
  );

  const fetchUsers = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const response = await fetch('/api/users');
      if (response.status === 401) {
        setUsers([]);
        setListError('Please sign in to view users.');
        return;
      }
      if (response.status === 403) {
        setUsers([]);
        setListError('You do not have access to this resource.');
        return;
      }
      if (!response.ok) {
        throw new Error('Unable to load users.');
      }
      const data = (await response.json()) as { data: UserRow[] };
      setUsers(data.data);
    } catch (error) {
      setListError(error instanceof Error ? error.message : 'Unexpected error loading users.');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin || meLoading) {
      return;
    }
    void fetchUsers();
  }, [isAdmin, meLoading, fetchUsers]);

  const handleSignIn = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: `${window.location.origin}/`,
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    await refreshMe();
  }, [refreshMe]);

  const openEditModal = (target: UserRow) => {
    setSelectedUser(target);
    setFormName(target.name ?? '');
    setFormRole(target.role);
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setFormError(null);
    setFormLoading(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUser) {
      return;
    }
    if (!formName.trim()) {
      setFormError('Name is required.');
      return;
    }
    setFormLoading(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName.trim(), role: formRole }),
      });
      if (response.status === 401) {
        throw new Error('Please sign in again.');
      }
      if (response.status === 403) {
        throw new Error('Only admins can edit users.');
      }
      if (response.status === 404) {
        throw new Error('User not found.');
      }
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? 'Unable to update user.');
      }
      setBanner({ type: 'success', message: 'User updated successfully.' });
      closeDialog();
      await fetchUsers();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unexpected error.');
    } finally {
      setFormLoading(false);
    }
  };

  let content: React.ReactNode;
  if (meLoading) {
    content = (
      <Card className='bg-white'>
        <CardContent className='flex items-center gap-2 py-6 text-muted-foreground'>
          Loading session...
        </CardContent>
      </Card>
    );
  } else if (!user) {
    content = (
      <Card className='bg-white'>
        <CardHeader>
          <CardTitle>Please sign in</CardTitle>
          <CardDescription>Sign in with GitHub to manage user roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn}>Sign in with GitHub</Button>
        </CardContent>
      </Card>
    );
  } else if (!isAdmin) {
    content = (
      <Card className='bg-white'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-destructive'>
            <ShieldOff className='h-4 w-4' />
            Restricted area
          </CardTitle>
          <CardDescription>Only administrators can access this section.</CardDescription>
        </CardHeader>
      </Card>
    );
  } else if (listLoading) {
    content = (
      <Card className='bg-white'>
        <CardContent className='flex items-center gap-2 py-6 text-muted-foreground'>
          Loading users...
        </CardContent>
      </Card>
    );
  } else if (listError) {
    content = (
      <Card className='bg-white'>
        <CardHeader>
          <CardTitle className='text-destructive'>Unable to load users</CardTitle>
          <CardDescription>{listError}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant='outline' onClick={fetchUsers}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  } else {
    content = (
      <Card className='bg-white'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0'>
          <div>
            <CardTitle>Team members</CardTitle>
            <CardDescription>Manage access and roles for each collaborator.</CardDescription>
          </div>
          <Badge variant='secondary'>Admin-only</Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                {shouldShowPhoneColumn && <TableHead>Phone</TableHead>}
                <TableHead>Role</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className='font-medium'>{entry.name ?? '—'}</TableCell>
                  <TableCell>{entry.email}</TableCell>
                  {shouldShowPhoneColumn && (
                    <TableCell>{entry.phone ?? <span className='text-muted-foreground'>—</span>}</TableCell>
                  )}
                  <TableCell>
                    <Badge variant={entry.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {entry.role}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button variant='outline' size='sm' onClick={() => openEditModal(entry)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Head>
        <title>Users | Finance Manager</title>
      </Head>
      <div className='min-h-screen bg-slate-50'>
        <TopNav user={user} loading={meLoading} onSignIn={handleSignIn} onSignOut={handleSignOut} />
        <main className='mx-auto max-w-6xl px-6 py-10'>
          <div className='mb-6'>
            <Button asChild variant='ghost' className='gap-2 rounded-full px-4'>
              <Link href='/'>
                <ArrowLeft className='h-4 w-4' />
                Back to dashboard
              </Link>
            </Button>
          </div>

          <div className='mb-8 space-y-2'>
            <p className='text-sm uppercase tracking-[0.25em] text-muted-foreground'>Users</p>
            <h1 className='text-3xl font-semibold text-foreground'>Admin control</h1>
            <p className='text-sm text-muted-foreground'>
              Review team members, promote admins, and keep identities up to date.
            </p>
          </div>

          {banner && (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                banner.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-destructive/40 bg-destructive/10 text-destructive'
              }`}
            >
              {banner.message}
            </div>
          )}

          {content}
        </main>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? undefined : closeDialog())}>
        <DialogTrigger asChild>
          <span className='hidden' />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>Update the name and access level for this member.</DialogDescription>
          </DialogHeader>
          <form className='mt-6 space-y-4' onSubmit={handleSubmit}>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                value={formName}
                onChange={(event) => setFormName(event.target.value)}
                placeholder='Full name'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='role'>Role</Label>
              <Select value={formRole} onValueChange={(value) => setFormRole(value as Role)}>
                <SelectTrigger id='role'>
                  <SelectValue placeholder='Select role' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ADMIN'>ADMIN</SelectItem>
                  <SelectItem value='USER'>USER</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formError && <p className='text-sm text-destructive'>{formError}</p>}
            <div className='flex justify-end gap-2'>
              <Button type='button' variant='ghost' onClick={closeDialog}>
                Cancel
              </Button>
              <Button type='submit' disabled={formLoading}>
                {formLoading ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersPage;
