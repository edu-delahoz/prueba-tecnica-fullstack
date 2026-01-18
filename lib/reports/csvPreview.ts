import Papa from 'papaparse';

export interface CsvRangeParams {
  from?: string;
  to?: string;
}

export interface CsvPreviewData {
  headers: string[];
  rows: string[][];
}

const normalizeCell = (value: unknown) => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString();
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return value === null || value === undefined ? '' : String(value);
};

export const buildCsvQuery = (params?: CsvRangeParams) => {
  const search = new URLSearchParams();
  if (params?.from) {
    search.set('from', params.from);
  }
  if (params?.to) {
    search.set('to', params.to);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
};

export const buildCsvApiUrl = (params?: CsvRangeParams) =>
  `/api/reports/csv${buildCsvQuery(params)}`;

export const parseCsvPreview = (csvText: string): CsvPreviewData => {
  if (!csvText.trim()) {
    return { headers: [], rows: [] };
  }

  const { data } = Papa.parse<string[]>(csvText, {
    skipEmptyLines: true,
  });

  const parsedRows = data.filter(
    (row): row is string[] => Array.isArray(row) && row.length > 0
  );

  if (parsedRows.length === 0) {
    return { headers: [], rows: [] };
  }

  const [rawHeaders, ...rawRows] = parsedRows;
  const normalizedHeaders = rawHeaders.map((header, index) => {
    const value = normalizeCell(header);
    return value || `Column ${index + 1}`;
  });

  const maxColumns = rawRows.reduce(
    (max, row) => Math.max(max, row.length),
    normalizedHeaders.length
  );

  while (normalizedHeaders.length < maxColumns) {
    normalizedHeaders.push(`Column ${normalizedHeaders.length + 1}`);
  }

  const rows = rawRows.map((row) =>
    Array.from({ length: normalizedHeaders.length }, (_, columnIndex) => {
      const cell = row[columnIndex];
      return cell === null || cell === undefined ? '' : normalizeCell(cell);
    })
  );

  return {
    headers: normalizedHeaders,
    rows,
  };
};

export const fetchCsvPreview = async (
  params?: CsvRangeParams
): Promise<CsvPreviewData> => {
  const response = await fetch(buildCsvApiUrl(params));

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      let payload: { error?: string } | null = null;
      try {
        payload = (await response.json()) as { error?: string };
      } catch {
        // ignore JSON errors
      }
      throw new Error(payload?.error ?? 'Unable to load CSV preview.');
    }

    const fallback = await response.text();
    throw new Error(fallback || 'Unable to load CSV preview.');
  }

  const csvText = await response.text();
  return parseCsvPreview(csvText);
};
