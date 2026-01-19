import { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, ShieldOff } from 'lucide-react';

import { EditUserDialog } from '@/components/users/EditUserDialog';
import { UsersTable } from '@/components/users/UsersTable';
import { TopNav } from '@/components/layout/TopNav';
import { TablePagination } from '@/components/table/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authClient } from '@/lib/auth/client';
import { useMe } from '@/lib/hooks/useMe';
import type { Role, UserRow } from '@/lib/users/types';
import { useUsers } from '@/lib/users/useUsers';

// eslint-disable-next-line complexity
const UsersPage: NextPage = () => {
  const { user, loading: meLoading, refresh: refreshMe } = useMe();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isAdmin = user?.role === 'ADMIN';
  const {
    users,
    loading: listLoading,
    error: listError,
    refresh,
    updateUser,
    meta,
  } = useUsers({
    enabled: isAdmin && !meLoading,
    page,
    limit: pageSize,
  });

  useEffect(() => {
    if (!isAdmin) {
      setPage(1);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (meta.totalPages > 0 && page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta.totalPages, page]);

  const [banner, setBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedUser(null);
    }
  };

  const handleSaveUser = useCallback(
    async (id: string, payload: { name: string; role: Role }) => {
      await updateUser(id, payload);
      setBanner({ type: 'success', message: 'User updated successfully.' });
    },
    [updateUser]
  );

  const hasUsers = meta.total > 0;

  let content: React.ReactNode;
  if (meLoading) {
    content = (
      <Card>
        <CardContent className='flex items-center gap-2 py-6 text-muted-foreground'>
          Loading session...
        </CardContent>
      </Card>
    );
  } else if (!user) {
    content = (
      <Card>
        <CardHeader>
          <CardTitle>Please sign in</CardTitle>
          <CardDescription>
            Sign in with GitHub to manage user roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn}>Sign in with GitHub</Button>
        </CardContent>
      </Card>
    );
  } else if (!isAdmin) {
    content = (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-destructive'>
            <ShieldOff className='h-4 w-4' />
            Restricted area
          </CardTitle>
          <CardDescription>
            Only administrators can access this section.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  } else if (listLoading) {
    content = (
      <Card>
        <CardContent className='flex items-center gap-2 py-6 text-muted-foreground'>
          Loading users...
        </CardContent>
      </Card>
    );
  } else if (listError) {
    content = (
      <Card>
        <CardHeader>
          <CardTitle className='text-destructive'>
            Unable to load users
          </CardTitle>
          <CardDescription>{listError}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant='outline' onClick={refresh}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  } else {
    content = (
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0'>
          <div>
            <CardTitle>Team members</CardTitle>
            <CardDescription>
              Manage access and roles for each collaborator.
            </CardDescription>
          </div>
          <Badge variant='secondary'>Admin-only</Badge>
        </CardHeader>
        <CardContent>
          <UsersTable users={users} canEdit={isAdmin} onEdit={openEditModal} />
          {hasUsers && (
            <TablePagination
              page={page}
              totalPages={meta.totalPages}
              onPrev={() => setPage((current) => Math.max(current - 1, 1))}
              onNext={() =>
                setPage((current) =>
                  Math.min(current + 1, Math.max(meta.totalPages, 1))
                )
              }
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Head>
        <title>Users | Finance Manager</title>
      </Head>
      <div className='min-h-screen bg-background'>
        <TopNav
          user={user}
          loading={meLoading}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
        />
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
            <p className='text-sm uppercase tracking-[0.25em] text-muted-foreground'>
              Users
            </p>
            <h1 className='text-3xl font-semibold text-foreground'>
              Admin control
            </h1>
            <p className='text-sm text-muted-foreground'>
              Review team members, promote admins, and keep identities up to
              date.
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

      <EditUserDialog
        open={dialogOpen}
        user={selectedUser}
        onOpenChange={handleDialogOpenChange}
        onSave={handleSaveUser}
      />
    </>
  );
};

export default UsersPage;
