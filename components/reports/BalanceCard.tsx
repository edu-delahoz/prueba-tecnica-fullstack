import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface BalanceCardProps {
  balance: string;
  totalIncome: string;
  totalExpense: string;
  rangeLabel: string;
}

export const BalanceCard = ({
  balance,
  totalIncome,
  totalExpense,
  rangeLabel,
}: BalanceCardProps) => (
  <section className='grid gap-4 md:grid-cols-3'>
    <Card className='bg-gradient-to-br from-slate-900 to-slate-700 text-white'>
      <CardHeader>
        <CardDescription className='text-slate-200'>
          Current balance
        </CardDescription>
        <CardTitle className='text-4xl font-semibold'>{balance}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-sm text-slate-200'>Period: {rangeLabel}</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardDescription>Total income</CardDescription>
        <CardTitle className='text-3xl font-semibold text-emerald-600'>
          {totalIncome}
        </CardTitle>
      </CardHeader>
    </Card>
    <Card>
      <CardHeader>
        <CardDescription>Total expense</CardDescription>
        <CardTitle className='text-3xl font-semibold text-red-500'>
          {totalExpense}
        </CardTitle>
      </CardHeader>
    </Card>
  </section>
);
