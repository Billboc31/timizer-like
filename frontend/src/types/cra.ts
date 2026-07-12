export interface CraDayEntry {
  day: number;
  worked: number;
  note: string;
}

export interface CraDetails {
  id: number;
  month: number;
  year: number;
  totalWorkedDays: number;
  status: 'DRAFT' | 'VALIDATED';
  days: CraDayEntry[];
}
