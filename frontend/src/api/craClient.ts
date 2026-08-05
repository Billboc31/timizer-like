import { apiDelete, apiGet, apiGetBlob, apiPatch, apiPost, apiPut } from './httpClient';
import type {
  CraDetailsDto,
  CraDayUpdateRequest,
  CraSummaryDto,
  ProviderSettingsDto,
  SignatureLinkDto,
  ValidateCraRequestDto,
} from './types';

export function createCra(year: number, month: number): Promise<CraDetailsDto> {
  return apiPost<CraDetailsDto>('/api/cra', { year, month });
}

export function getCra(id: number): Promise<CraDetailsDto> {
  return apiGet<CraDetailsDto>(`/api/cras/${id}`);
}

export function updateDay(
  craId: number,
  date: string,
  body: CraDayUpdateRequest,
): Promise<CraDetailsDto> {
  return apiPatch<CraDetailsDto>(`/api/cras/${craId}/days/${date}`, body);
}

export function validateCra(
  craId: number,
  body: ValidateCraRequestDto,
): Promise<CraDetailsDto> {
  return apiPost<CraDetailsDto>(`/api/cras/${craId}/validate`, body);
}

export function listCras(options?: { signal?: AbortSignal }): Promise<CraSummaryDto[]> {
  return apiGet<CraSummaryDto[]>('/api/cras', options);
}

export function downloadCraPdf(craId: number, options?: { signal?: AbortSignal }): Promise<Blob> {
  return apiGetBlob(`/api/cras/${craId}/pdf`, options);
}

export function getProviderSettings(): Promise<ProviderSettingsDto> {
  return apiGet<ProviderSettingsDto>('/api/provider-settings');
}

export function updateProviderSettings(data: ProviderSettingsDto): Promise<ProviderSettingsDto> {
  return apiPut<ProviderSettingsDto>('/api/provider-settings', data);
}

export function reopenCra(craId: number): Promise<void> {
  return apiPost<void>(`/api/cras/${craId}/reopen`, undefined);
}

export function generateSignatureLink(craId: number): Promise<SignatureLinkDto> {
  return apiPost<SignatureLinkDto>(`/api/cras/${craId}/signature-link`, undefined);
}

export function deleteCra(craId: number): Promise<void> {
  return apiDelete(`/api/cras/${craId}`);
}
