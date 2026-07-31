export type CraStatus =
  | 'DRAFT'
  | 'AWAITING_CLIENT_SIGNATURE'
  | 'VALIDATED';

export interface CraDayEntryDto {
  day: number;
  worked: 0 | 0.5 | 1;
  note: string | null;
}

export interface CraDetailsDto {
  id: number;
  month: number;
  year: number;
  totalWorkedDays: number;
  status: CraStatus;
  days: CraDayEntryDto[];
  validationDate: string | null;
  providerSignatureDate: string | null;
  providerFirstName?: string | null;
  providerLastName?: string | null;
  providerCompany?: string | null;
  clientFirstName?: string | null;
  clientLastName?: string | null;
  clientCompany?: string | null;
  clientAddress?: string | null;
  clientContactRole?: string | null;
  providerSignatureImage?: string | null;
  providerSignerName?: string | null;
  clientContactFirstName?: string | null;
  clientContactLastName?: string | null;
  clientSignatureDate: string | null;
  clientRepresentativeName: string | null;
}

export interface CraSummaryDto {
  id: number;
  month: number;
  year: number;
  totalWorkedDays: number;
  status: CraStatus;
  validationDate: string | null;
  clientSignatureDate: string | null;
}

export interface CraDayUpdateRequest {
  workValue?: 0 | 0.5 | 1 | null;
  note?: string | null;
}

export interface ValidateCraRequestDto {
  providerSignatureDate: string;
  providerSignatureImage: string;
  providerSignerName: string;
}

export interface ProviderSignatureDto {
  signerName: string;
  signatureImage: string;
}

export interface ProviderSettingsDto {
  firstName: string;
  lastName: string;
  company: string;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface SignatureLinkDto {
  signatureUrl: string;
}
