import Link from 'next/link';
import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface DownloadCsvButtonProps {
  href?: string;
}

export const DownloadCsvButton = ({
  href = '/api/reports/csv',
}: DownloadCsvButtonProps) => (
  <Button asChild variant='outline' className='gap-2'>
    <Link href={href} target='_blank' rel='noreferrer' prefetch={false}>
      <Download className='h-4 w-4' />
      Download CSV
    </Link>
  </Button>
);
