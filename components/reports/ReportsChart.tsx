import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export interface ChartPoint {
  period: string;
  income: number;
  expense: number;
  net: number;
}

interface ReportsChartProps {
  data: ChartPoint[];
}

export const ReportsChart = ({ data }: ReportsChartProps) => (
  <div className='h-[360px] w-full'>
    <ResponsiveContainer width='100%' height='100%'>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray='4 4' stroke='#e2e8f0' />
        <XAxis
          dataKey='period'
          tick={{ fontSize: 12 }}
          stroke='#94a3b8'
          tickLine={false}
        />
        <YAxis stroke='#94a3b8' tickFormatter={(value) => `$${value}`} />
        <Tooltip
          formatter={(value: number | undefined) =>
            currencyFormatter.format(value ?? 0)
          }
          labelFormatter={(value) => `Period: ${value}`}
        />
        <Legend />
        <Area
          type='monotone'
          dataKey='income'
          stroke='#10b981'
          fill='#d1fae5'
          strokeWidth={2}
          name='Income'
        />
        <Area
          type='monotone'
          dataKey='expense'
          stroke='#ef4444'
          fill='#fee2e2'
          strokeWidth={2}
          name='Expense'
        />
        <Area
          type='monotone'
          dataKey='net'
          stroke='#6366f1'
          fill='#e0e7ff'
          strokeWidth={2}
          name='Net'
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
