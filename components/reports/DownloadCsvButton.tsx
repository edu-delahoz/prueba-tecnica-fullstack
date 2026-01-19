import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { buildCsvApiUrl, type CsvRangeParams } from '@/lib/reports/csvPreview';

type DownloadCsvButtonProps = CsvRangeParams;

const toDateInputValue = (value?: string) => {
  if (!value) {
    return '';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return '';
  }
  return parsed.toISOString().slice(0, 10);
};

const formatRangeDescription = (from?: string, to?: string) => {
  if (from && to) {
    const fromLabel = new Date(from);
    const toLabel = new Date(to);
    const fromText = Number.isNaN(fromLabel.valueOf())
      ? from
      : fromLabel.toLocaleDateString();
    const toText = Number.isNaN(toLabel.valueOf())
      ? to
      : toLabel.toLocaleDateString();
    return `Downloads records from ${fromText} to ${toText}.`;
  }
  if (from) {
    const fromLabel = new Date(from);
    const fromText = Number.isNaN(fromLabel.valueOf())
      ? from
      : fromLabel.toLocaleDateString();
    return `Downloads records from ${fromText} onwards.`;
  }
  if (to) {
    const toLabel = new Date(to);
    const toText = Number.isNaN(toLabel.valueOf())
      ? to
      : toLabel.toLocaleDateString();
    return `Downloads records up to ${toText}.`;
  }
  return 'Downloads the latest 30 days of records.';
};

export const DownloadCsvButton = ({ from, to }: DownloadCsvButtonProps) => {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const defaultHref = useMemo(() => buildCsvApiUrl({ from, to }), [from, to]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setCustomFrom(toDateInputValue(from));
      setCustomTo(toDateInputValue(to));
    }
    setError(null);
  };

  const handleCustomDownload = () => {
    if (!customFrom || !customTo) {
      setError('Please select both dates.');
      return;
    }

    const fromDate = new Date(customFrom);
    const toDate = new Date(customTo);

    if (Number.isNaN(fromDate.valueOf()) || Number.isNaN(toDate.valueOf())) {
      setError('Please enter valid dates.');
      return;
    }

    if (fromDate > toDate) {
      setError('"From" date cannot be after the end date.');
      return;
    }

    const url = buildCsvApiUrl({ from: customFrom, to: customTo });
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    setError(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant='outline' className='gap-2'>
          <Download className='h-4 w-4' />
          Download CSV
        </Button>
      </DialogTrigger>
      <DialogContent className='space-y-6'>
        <DialogHeader>
          <DialogTitle>Download CSV</DialogTitle>
          <DialogDescription>
            Export the movements CSV for the current period or pick a custom
            date range to download.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='rounded-2xl border border-border/70 bg-muted/30 p-4'>
            <p className='text-sm font-medium text-foreground'>Current range</p>
            <p className='text-xs text-muted-foreground'>
              {formatRangeDescription(from, to)}
            </p>
            <DialogClose asChild>
              <Button
                asChild
                className='mt-3 w-full justify-center gap-2'
                variant='default'
              >
                <a href={defaultHref} target='_blank' rel='noreferrer'>
                  <Download className='h-4 w-4' />
                  Download current CSV
                </a>
              </Button>
            </DialogClose>
          </div>

          <div className='space-y-3'>
            <p className='text-sm font-medium text-foreground'>
              Custom date range
            </p>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='csv-download-from'>From</Label>
                <Input
                  id='csv-download-from'
                  type='date'
                  value={customFrom}
                  onChange={(event) => setCustomFrom(event.target.value)}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='csv-download-to'>To</Label>
                <Input
                  id='csv-download-to'
                  type='date'
                  value={customTo}
                  onChange={(event) => setCustomTo(event.target.value)}
                />
              </div>
            </div>
            <Button
              className='w-full justify-center gap-2'
              onClick={handleCustomDownload}
              type='button'
            >
              <Download className='h-4 w-4' />
              Download selected range
            </Button>
            {error && <p className='text-sm text-destructive'>{error}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
