export interface CraSummaryDto {
  id: number;
  month: number;
  year: number;
  totalWorkedDays: number;
  status: 'DRAFT' | 'VALIDATED';
}

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

export interface CraDetailsDto extends CraSummaryDto {
  days: CraDayEntry[];
  validationDate: string | null;
  providerSignatureDate: string | null;
}
