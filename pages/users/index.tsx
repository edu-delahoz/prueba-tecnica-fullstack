import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, ShieldOff } from 'lucide-react';

import { EditUserDialog } from '@/components/users/EditUserDialog';
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
import { Input } from '@/components/ui/input';
import { useMe } from '@/lib/hooks/useMe';
import { UsersPageIntro } from '@/src/features/users/components/UsersPageIntro';
import { UsersPagination } from '@/src/features/users/components/UsersPagination';
import { UsersTable } from '@/src/features/users/components/UsersTable';
import { useUsersPageState } from '@/src/features/users/hooks/useUsersPageState';
import { useUsersQuery } from '@/src/features/users/hooks/useUsersQuery';

// eslint-disable-next-line complexity
const UsersPage: NextPage = () => {
  const { user, loading: meLoading, refresh: refreshMe } = useMe();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);
  const {
    data: users,
    meta,
    loading: listLoading,
    error: listError,
    refresh,
  } = useUsersQuery({
    page,
    limit: pageSize,
    enabled: user?.role === 'ADMIN' && !meLoading,
    search: debouncedSearch,
  });
  const {
    ui: { banner, dialogOpen, selectedUser, canEdit },
    actions: {
      openEditModal,
      handleDialogOpenChange,
      handleSaveUser,
      handleSignIn,
      handleSignOut,
    },
  } = useUsersPageState({
    user,
    refreshMe,
    refreshUsers: refresh,
  });
  const isAdmin = canEdit;

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

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

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
          <div className='mb-4 flex justify-end'>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Search by name or email'
              className='w-full max-w-sm'
            />
          </div>
          <UsersTable users={users} canEdit={isAdmin} onEdit={openEditModal} />
          {hasUsers && (
            <UsersPagination
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

          <UsersPageIntro />

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
