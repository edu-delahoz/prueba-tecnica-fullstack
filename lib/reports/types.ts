export type ReportsGroup = 'day' | 'month';

export interface ReportPoint {
  period: string;
  income: string;
  expense: string;
  net: string;
}

export interface ReportsRange {
  from: string;
  to: string;
}

export interface ReportsSummaryData {
  totalIncome: string;
  totalExpense: string;
  balance: string;
  points: ReportPoint[];
  group: ReportsGroup;
  range: ReportsRange;
}

export interface ReportsSummaryResponse {
  data: ReportsSummaryData;
}
