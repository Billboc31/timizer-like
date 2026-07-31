export type { CraSummaryDto } from '../api/types';

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
  status: 'DRAFT' | 'AWAITING_CLIENT_SIGNATURE' | 'VALIDATED';
  days: CraDayEntry[];
  providerSignatureDate: string | null;
  providerFirstName?: string | null;
  providerLastName?: string | null;
  providerCompany?: string | null;
  clientFirstName?: string | null;
  clientLastName?: string | null;
  clientCompany?: string | null;
  clientContactFirstName?: string | null;
  clientContactLastName?: string | null;
  clientSignatureDate?: string | null;
  providerSignatureImage?: string | null;
  providerSignerName?: string | null;
  clientRepresentativeName?: string | null;
}

export interface CraDetailsDto extends CraSummaryDto {
  days: CraDayEntry[];
  providerSignatureDate: string | null;
  clientSignatureDate: string | null;
  clientRepresentativeName?: string | null;
  providerFirstName?: string | null;
  providerLastName?: string | null;
  providerCompany?: string | null;
  clientFirstName?: string | null;
  clientLastName?: string | null;
  clientCompany?: string | null;
  clientContactFirstName?: string | null;
  clientContactLastName?: string | null;
  clientSignatureDate?: string | null;
}
