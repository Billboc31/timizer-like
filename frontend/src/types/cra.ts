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
  status: 'DRAFT' | 'READY_FOR_PROVIDER_SIGNATURE' | 'SIGNED_BY_PROVIDER' | 'AWAITING_CLIENT_SIGNATURE' | 'FULLY_SIGNED' | 'VALIDATED';
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
  clientContactFirstName?: string | null;
  clientContactLastName?: string | null;
  clientSignatureDate?: string | null;
}
