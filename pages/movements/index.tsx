import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { TopNav } from '@/components/layout/TopNav';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useMe } from '@/lib/hooks/useMe';
import { MovementsCreateDialog } from '@/src/features/movements/components/MovementsCreateDialog';
import { MovementsListSection } from '@/src/features/movements/components/MovementsListSection';
import { useMovementsQuery } from '@/src/features/movements/hooks/useMovementsQuery';
import { useMovementsPageState } from '@/src/features/movements/hooks/useMovementsPageState';

// eslint-disable-next-line complexity
const MovementsPage: NextPage = () => {
  const {
    user,
    loading: userLoading,
    error: meError,
    refresh: refreshMe,
  } = useMe();
  const isAdmin = user?.role === 'ADMIN';
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: movements,
    meta: paginationMeta,
    loading: queryLoading,
    error: queryError,
    refresh: refreshMovements,
  } = useMovementsQuery({
    page,
    limit: pageSize,
    enabled: Boolean(user) && !userLoading,
  });

  useEffect(() => {
    if (!user) {
      setPage(1);
    }
  }, [user]);

  useEffect(() => {
    if (
      paginationMeta.totalPages > 0 &&
      page > paginationMeta.totalPages &&
      paginationMeta.totalPages !== 0
    ) {
      setPage(paginationMeta.totalPages);
    }
  }, [page, paginationMeta.totalPages]);

  const {
    banner,
    dialogOpen,
    form,
    formError,
    formLoading,
    headerDescription,
    listLoading,
    listError,
    handleDialogChange,
    handleInputChange,
    handleSubmit,
    handleSignIn,
    handleSignOut,
  } = useMovementsPageState({
    user,
    userLoading,
    meError,
    refreshMe,
    refreshMovements,
    queryLoading,
    queryError,
  });

  const totalRecords = paginationMeta.total;
  const hasMovements = totalRecords > 0;

  return (
    <>
      <Head>
        <title>Movements | Finance Manager</title>
      </Head>
      <div className='min-h-screen bg-background'>
        <TopNav
          user={user}
          loading={userLoading}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
        />
        <main className='mx-auto max-w-6xl px-6 py-10'>
          <div className='mb-4'>
            <Button asChild variant='ghost' className='gap-2 rounded-full px-4'>
              <Link href='/'>
                <ArrowLeft className='h-4 w-4' />
                Back to dashboard
              </Link>
            </Button>
          </div>

          {!user && !userLoading && (
            <Card className='mb-6 border-dashed'>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Sign in with GitHub to view and create new movements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleSignIn}>Sign in with GitHub</Button>
              </CardContent>
            </Card>
          )}

          <div className='mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <p className='text-sm uppercase tracking-[0.25em] text-muted-foreground'>
                Movements
              </p>
              <h1 className='text-3xl font-semibold text-foreground'>
                Cashflow overview
              </h1>
              <p className='text-sm text-muted-foreground'>
                {headerDescription}
              </p>
            </div>
            <MovementsCreateDialog
              isAdmin={isAdmin}
              open={dialogOpen}
              form={form}
              formError={formError}
              formLoading={formLoading}
              onOpenChange={handleDialogChange}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
            />
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

          <MovementsListSection
            listLoading={listLoading}
            listError={listError}
            user={user}
            isAdmin={isAdmin}
            totalRecords={totalRecords}
            hasMovements={hasMovements}
            movements={movements}
            paginationMeta={paginationMeta}
            page={page}
            pageSize={pageSize}
            onPrev={() => setPage((current) => Math.max(current - 1, 1))}
            onNext={() =>
              setPage((current) =>
                Math.min(current + 1, Math.max(paginationMeta.totalPages, 1))
              )
            }
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            onRetry={refreshMovements}
          />

          <Card className='mt-10'>
            <CardHeader>
              <CardTitle>Need more insights?</CardTitle>
              <CardDescription>
                Reports summarize incomes vs expenses so you can share updates
                with stakeholders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant='secondary'
                className='group rounded-full'
              >
                <Link href='/reports'>
                  Go to reports
                  <ArrowRight className='ml-2 h-4 w-4 transition group-hover:translate-x-1' />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default MovementsPage;
