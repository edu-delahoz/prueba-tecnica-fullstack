import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  ReportsGroup,
  ReportsSummaryData,
  ReportsSummaryResponse,
} from './types';

export interface UseReportsSummaryParams {
  group?: ReportsGroup;
  from?: string;
  to?: string;
  enabled?: boolean;
}

const parseNumeric = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildQuery = (params?: UseReportsSummaryParams) => {
  if (!params) {
    return '';
  }
  const search = new URLSearchParams();
  if (params.group) {
    search.set('group', params.group);
  }
  if (params.from) {
    search.set('from', params.from);
  }
  if (params.to) {
    search.set('to', params.to);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
};

export const useReportsSummary = (params?: UseReportsSummaryParams) => {
  const [data, setData] = useState<ReportsSummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = buildQuery(params);
  const isEnabled = params?.enabled ?? true;

  const refresh = useCallback(async () => {
    if (!isEnabled) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/reports/summary${query}`);
      const payload = (await response.json()) as ReportsSummaryResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to load summary.');
      }

      setData(payload.data);
    } catch (caught) {
      setData(null);
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unexpected error loading summary.'
      );
    } finally {
      setLoading(false);
    }
  }, [query, isEnabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const chartData = useMemo(
    () =>
      data?.points.map((point) => ({
        period: point.period,
        income: parseNumeric(point.income),
        expense: parseNumeric(point.expense),
        net: parseNumeric(point.net),
      })) ?? [],
    [data]
  );

  return {
    data,
    loading,
    error,
    refresh,
    chartData,
  };
};
