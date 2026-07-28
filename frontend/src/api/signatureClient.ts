import { apiDelete, apiGet, apiPut } from './httpClient';
import type { ProviderSignatureDto } from './types';

export function getSignature(): Promise<ProviderSignatureDto> {
  return apiGet<ProviderSignatureDto>('/api/signature');
}

export function saveSignature(signerName: string, signatureImage: string): Promise<ProviderSignatureDto> {
  return apiPut<ProviderSignatureDto>('/api/signature', { signerName, signatureImage });
}

export function deleteSignature(): Promise<void> {
  return apiDelete('/api/signature');
}
