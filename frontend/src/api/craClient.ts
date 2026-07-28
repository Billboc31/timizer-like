import { apiGet, apiGetBlob, apiPatch, apiPost, apiPut } from './httpClient';
import type {
  CraDetailsDto,
  CraDayUpdateRequest,
  CraSummaryDto,
  ProviderSettingsDto,
  ValidateCraRequest,
} from './types';

export function createCra(year: number, month: number): Promise<CraDetailsDto> {
  return apiPost<CraDetailsDto>('/api/cra', { year, month });
}

// NOTE: backend endpoint GET /api/cras/:id is pending implementation
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

export function validateCra(craId: number, body: ValidateCraRequest): Promise<CraDetailsDto> {
  return apiPost<CraDetailsDto>(`/api/cras/${craId}/validate`, body);
}

// NOTE: backend endpoint GET /api/cras is pending implementation
export function listCras(options?: { signal?: AbortSignal }): Promise<CraSummaryDto[]> {
  return apiGet<CraSummaryDto[]>('/api/cras', options);
}

// NOTE: backend endpoint GET /api/cras/:id/pdf is pending implementation
export function downloadCraPdf(craId: number, options?: { signal?: AbortSignal }): Promise<Blob> {
  return apiGetBlob(`/api/cras/${craId}/pdf`, options);
}

export function getProviderSettings(): Promise<ProviderSettingsDto> {
  return apiGet<ProviderSettingsDto>('/api/provider-settings');
}

export function updateProviderSettings(data: ProviderSettingsDto): Promise<ProviderSettingsDto> {
  return apiPut<ProviderSettingsDto>('/api/provider-settings', data);
}
