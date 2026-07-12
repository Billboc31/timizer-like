export interface CraSummaryDto {
  id: number;
  month: number;
  year: number;
  totalWorkedDays: number;
  status: 'DRAFT' | 'VALIDATED';
  validationDate: string | null;
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
  providerFirstName?: string | null;
  providerLastName?: string | null;
  providerCompany?: string | null;
  clientFirstName?: string | null;
  clientLastName?: string | null;
  clientCompany?: string | null;
}

export interface CraDetailsDto extends CraSummaryDto {
  days: CraDayEntry[];
  providerSignatureDate: string | null;
  providerFirstName?: string | null;
  providerLastName?: string | null;
  providerCompany?: string | null;
  clientFirstName?: string | null;
  clientLastName?: string | null;
  clientCompany?: string | null;
}
