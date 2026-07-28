import { apiGet, apiPut } from './httpClient';
import type { ClientSettingsDto } from '../types/settings';

export function getClientSettings(): Promise<ClientSettingsDto> {
  return apiGet<ClientSettingsDto>('/api/settings/client');
}

export function updateClientSettings(dto: ClientSettingsDto): Promise<ClientSettingsDto> {
  return apiPut<ClientSettingsDto>('/api/settings/client', dto);
}
