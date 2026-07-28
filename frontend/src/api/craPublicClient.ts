import { apiGet, apiPost } from './httpClient';
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

export function submitClientSignature(token: string, body: ClientSignatureBody): Promise<void> {
  return apiPost<void>(`/public/cra-link/${token}/sign`, body);
}
