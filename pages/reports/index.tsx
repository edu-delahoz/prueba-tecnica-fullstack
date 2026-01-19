import { useCallback, useMemo } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, ShieldOff } from 'lucide-react';

import { BalanceCard } from '@/components/reports/BalanceCard';
import { DownloadCsvButton } from '@/components/reports/DownloadCsvButton';
import { ReportsChart } from '@/components/reports/ReportsChart';
import { TopNav } from '@/components/layout/TopNav';
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
import { buildCsvQuery } from '@/lib/reports/csvPreview';
import { useReportsSummary } from '@/lib/reports/useReportsSummary';
import { requireAdminPage } from '@/lib/auth/pageGuard';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const formatCurrency = (value: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return value;
  }
  return currencyFormatter.format(parsed);
};

const ReportsPage = () => {
  const { user, loading: meLoading, refresh: refreshMe } = useMe();
  const isAdmin = user?.role === 'ADMIN';

  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
    refresh: refreshSummary,
    chartData,
  } = useReportsSummary({
    enabled: isAdmin && !meLoading,
  });

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

  const rangeLabel = useMemo(() => {
    if (!summary?.range) {
      return 'Last 30 days';
    }
    const from = new Date(summary.range.from);
    const to = new Date(summary.range.to);
    const fromLabel = from.toLocaleDateString();
    const toLabel = to.toLocaleDateString();
    return `${fromLabel} – ${toLabel}`;
  }, [summary]);

  let content: React.ReactNode = null;

  if (meLoading) {
    content = (
      <Card>
        <CardContent className='py-6 text-sm text-muted-foreground'>
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
            Sign in with GitHub to view financial reports.
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
            Only administrators can access financial reports.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  } else if (summaryLoading) {
    content = (
      <Card>
        <CardContent className='py-6 text-sm text-muted-foreground'>
          Loading summary...
        </CardContent>
      </Card>
    );
  } else if (summaryError) {
    content = (
      <Card>
        <CardHeader>
          <CardTitle className='text-destructive'>
            Unable to load report
          </CardTitle>
          <CardDescription>{summaryError}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant='outline' onClick={refreshSummary}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  } else if (!summary) {
    content = (
      <Card>
        <CardContent className='py-6 text-sm text-muted-foreground'>
          No data available for the selected range.
        </CardContent>
      </Card>
    );
  } else {
    content = (
      <div className='space-y-8'>
        <BalanceCard
          balance={formatCurrency(summary.balance)}
          totalIncome={formatCurrency(summary.totalIncome)}
          totalExpense={formatCurrency(summary.totalExpense)}
          rangeLabel={rangeLabel}
        />

        <Card>
          <CardHeader className='flex flex-row items-center justify-between gap-4'>
            <div>
              <CardTitle>Performance overview</CardTitle>
              <CardDescription>
                Income, expenses, and net balance grouped by period.
              </CardDescription>
            </div>
            <div className='flex flex-row gap-3'>
              <DownloadCsvButton
                from={summary.range.from}
                to={summary.range.to}
              />
              <Button asChild variant='secondary' className='gap-2'>
                <Link
                  href={`/reports/csv${buildCsvQuery(summary.range)}`}
                  prefetch={false}
                >
                  View CSV online
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ReportsChart data={chartData} />
            ) : (
              <div className='flex h-48 items-center justify-center text-sm text-muted-foreground'>
                No movements available for charting yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Reports | Finance Manager</title>
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
              Reports
            </p>
            <h1 className='text-3xl font-semibold text-foreground'>
              Financial summary
            </h1>
            <p className='text-sm text-muted-foreground'>
              Track revenue, spending, and balance for the latest period.
            </p>
          </div>

          {content}
        </main>
      </div>
    </>
  );
};

export default ReportsPage;

export const getServerSideProps: GetServerSideProps = requireAdminPage;
