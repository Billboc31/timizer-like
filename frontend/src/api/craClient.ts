import { apiGet, apiGetBlob, apiPatch, apiPost } from './httpClient';
import type {
  CraDetailsDto,
  CraDayUpdateRequest,
  CraSummaryDto,
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
export function listCras(): Promise<CraSummaryDto[]> {
  return apiGet<CraSummaryDto[]>('/api/cras');
}

// NOTE: backend endpoint GET /api/cras/:id/pdf is pending implementation
export function downloadCraPdf(craId: number): Promise<Blob> {
  return apiGetBlob(`/api/cras/${craId}/pdf`);
}
