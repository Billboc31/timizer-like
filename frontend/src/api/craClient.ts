import { apiGet, apiGetBlob, apiPatch, apiPost, apiPut } from './httpClient';
import type {
  CraDetailsDto,
  CraDayUpdateRequest,
  CraSummaryDto,
  ProviderSettingsDto,
  SignProviderRequest,
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

export function submitCra(craId: number): Promise<CraDetailsDto> {
  return apiPost<CraDetailsDto>(`/api/cras/${craId}/submit`, null);
}

export function signCraByProvider(craId: number, body: SignProviderRequest): Promise<CraDetailsDto> {
  return apiPost<CraDetailsDto>(`/api/cras/${craId}/sign-provider`, body);
}

export function sendCraToClient(craId: number): Promise<CraDetailsDto> {
  return apiPost<CraDetailsDto>(`/api/cras/${craId}/send-to-client`, null);
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
