import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, ShieldOff } from 'lucide-react';

import { CsvPreviewTable } from '@/components/reports/CsvPreviewTable';
import { DownloadCsvButton } from '@/components/reports/DownloadCsvButton';
import { TopNav } from '@/components/layout/TopNav';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth/client';
import { useMe } from '@/lib/hooks/useMe';
import {
  fetchCsvPreview,
  type CsvPreviewData,
  type CsvRangeParams,
} from '@/lib/reports/csvPreview';

const toSingleValue = (value?: string | string[]): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const formatDateLabel = (value?: string) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return value;
  }
  return parsed.toLocaleDateString();
};

const buildRangeLabel = (range?: CsvRangeParams) => {
  const from = formatDateLabel(range?.from);
  const to = formatDateLabel(range?.to);
  if (from && to) {
    return `${from} – ${to}`;
  }
  if (from) {
    return `Since ${from}`;
  }
  if (to) {
    return `Up to ${to}`;
  }
  return 'Last 30 days';
};

const CsvPreviewPage: NextPage = () => {
  const router = useRouter();
  const { user, loading: meLoading, refresh: refreshMe } = useMe();
  const [preview, setPreview] = useState<CsvPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const isAdmin = user?.role === 'ADMIN';
  const rangeParams: CsvRangeParams = useMemo(
    () => ({
      from: toSingleValue(router.query.from),
      to: toSingleValue(router.query.to),
    }),
    [router.query.from, router.query.to]
  );

  const loadPreview = useCallback(async () => {
    if (!isAdmin || meLoading) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCsvPreview(rangeParams);
      setPreview(data);
    } catch (caught) {
      setPreview(null);
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unexpected error loading CSV preview.'
      );
    } finally {
      setLoading(false);
    }
  }, [isAdmin, meLoading, rangeParams]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) {
      return preview?.rows ?? [];
    }
    const query = search.trim().toLowerCase();
    return (
      preview?.rows.filter((row) =>
        row.some((cell) => cell.toLowerCase().includes(query))
      ) ?? []
    );
  }, [preview, search]);

  const rowCount = preview?.rows.length ?? 0;
  const filterLabel =
    rowCount === filteredRows.length
      ? `${rowCount} rows`
      : `${filteredRows.length} of ${rowCount} rows match your search`;

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

  const renderContent = () => {
    if (meLoading) {
      return (
        <Card className='bg-white'>
          <CardContent className='py-6 text-sm text-muted-foreground'>
            Loading session...
          </CardContent>
        </Card>
      );
    }

    if (!user) {
      return (
        <Card className='bg-white'>
          <CardHeader>
            <CardTitle>Please sign in</CardTitle>
            <CardDescription>
              Sign in with GitHub to view the CSV preview.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSignIn}>Sign in with GitHub</Button>
          </CardContent>
        </Card>
      );
    }

    if (!isAdmin) {
      return (
        <Card className='bg-white'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-destructive'>
              <ShieldOff className='h-4 w-4' />
              Restricted area
            </CardTitle>
            <CardDescription>
              Only administrators can access the CSV preview.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }

    if (loading) {
      return (
        <Card className='bg-white'>
          <CardContent className='py-6 text-sm text-muted-foreground'>
            Loading CSV preview...
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className='bg-white'>
          <CardHeader>
            <CardTitle className='text-destructive'>
              Unable to load CSV preview
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant='outline'
              onClick={() => {
                void loadPreview();
              }}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (!preview || preview.headers.length === 0) {
      return (
        <Card className='bg-white'>
          <CardContent className='py-6 text-sm text-muted-foreground'>
            No CSV data available for this range.
          </CardContent>
        </Card>
      );
    }

    return (
      <div className='space-y-6'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-3xl font-semibold text-foreground'>
              CSV Preview
            </h1>
            <p className='text-sm text-muted-foreground'>
              {buildRangeLabel(rangeParams)}
            </p>
          </div>
          <div className='flex flex-col gap-3 sm:flex-row'>
            <DownloadCsvButton from={rangeParams.from} to={rangeParams.to} />
            <Button asChild variant='ghost' className='gap-2'>
              <Link href='/reports' prefetch={false}>
                <ArrowLeft className='h-4 w-4' />
                Back to Reports
              </Link>
            </Button>
          </div>
        </div>

        <Card className='bg-white'>
          <CardHeader>
            <CardTitle>Movements table</CardTitle>
            <CardDescription>{filterLabel}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-sm text-muted-foreground'>
                Range: {buildRangeLabel(rangeParams)}
              </p>
              <Input
                type='search'
                placeholder='Search rows'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className='w-full sm:w-64'
              />
            </div>

            {filteredRows.length === 0 ? (
              <div className='flex h-48 items-center justify-center text-sm text-muted-foreground'>
                {search.trim()
                  ? 'No rows match your search.'
                  : 'No rows available for this range.'}
              </div>
            ) : (
              <CsvPreviewTable headers={preview.headers} rows={filteredRows} />
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const content = renderContent();

  return (
    <>
      <Head>
        <title>CSV Preview | Finance Manager</title>
      </Head>
      <div className='min-h-screen bg-slate-50'>
        <TopNav
          user={user}
          loading={meLoading}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
        />
        <main className='mx-auto max-w-6xl px-6 py-10'>
          <div className='mb-8 space-y-2'>
            <p className='text-sm uppercase tracking-[0.25em] text-muted-foreground'>
              Reports
            </p>
            <h2 className='text-3xl font-semibold text-foreground'>
              Online CSV preview
            </h2>
            <p className='text-sm text-muted-foreground'>
              Inspect the exported CSV data before downloading it.
            </p>
          </div>

          {content}
        </main>
      </div>
    </>
  );
};

export default CsvPreviewPage;
