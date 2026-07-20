import type { CraDetails, CraSummaryDto, CraDetailsDto } from '../types/cra';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080';

export async function fetchCra(year: number, month: number): Promise<CraDetails> {
  const res = await fetch(`${API_BASE_URL}/api/cras?year=${year}&month=${month}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<CraDetails>;
}

export async function downloadCraPdf(id: number): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/cras/${id}/pdf`);
  if (!response.ok) throw new Error(`Failed to download PDF: ${response.status}`);
  return response.blob();
}

export async function listCras(): Promise<CraSummaryDto[]> {
  const response = await fetch(`${API_BASE_URL}/api/cras`);
  if (!response.ok) throw new Error(`Failed to list CRAs: ${response.status}`);
  return response.json() as Promise<CraSummaryDto[]>;
}

export async function createCra(year: number, month: number): Promise<CraDetailsDto> {
  const response = await fetch(`${API_BASE_URL}/api/cra`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ year, month }),
  });
  if (!response.ok) throw new Error(`Failed to create CRA: ${response.status}`);
  return response.json() as Promise<CraDetailsDto>;
}
