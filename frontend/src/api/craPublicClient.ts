import { apiGet } from './httpClient';
import type { CraPublicView } from '../types/craPublicView';

export function getPublicCra(token: string): Promise<CraPublicView> {
  return apiGet<CraPublicView>(`/public/cra-link/${token}`);
}
