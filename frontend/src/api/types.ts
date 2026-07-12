export type CraStatus = 'DRAFT' | 'VALIDATED';

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
}

export interface CraSummaryDto {
  id: number;
  month: number;
  year: number;
  totalWorkedDays: number;
  status: CraStatus;
}

export interface CraDayUpdateRequest {
  workValue?: 0 | 0.5 | 1 | null;
  note?: string | null;
}

export interface ValidateCraRequest {
  providerSignatureDate: string;
}
