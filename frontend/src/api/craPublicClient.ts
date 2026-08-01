import { apiGet, apiGetBlob, apiPost } from './httpClient';
import type { CraPublicView } from '../types/craPublicView';

export function getPublicCra(token: string): Promise<CraPublicView> {
  return apiGet<CraPublicView>(`/public/cra-link/${token}`);
}

export interface ClientSignatureBody {
  signerName: string;
  signerRole?: string;
  consentApproved: boolean;
  signatureImageBase64: string;
}

export interface ClientSignatureResponse {
  downloadToken: string;
}

export function submitClientSignature(token: string, body: ClientSignatureBody): Promise<ClientSignatureResponse> {
  return apiPost<ClientSignatureResponse>(`/public/cra-link/${token}/sign`, body);
}

export function downloadPublicCraPdf(downloadToken: string): Promise<Blob> {
  return apiGetBlob(`/public/cra/${downloadToken}/pdf`);
}
