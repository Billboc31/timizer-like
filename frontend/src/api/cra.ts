import type { CraSummaryDto, CraDetailsDto } from '../types/cra';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080';

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
