import type { CraDetails } from '../types/cra';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080';

export async function fetchCra(year: number, month: number): Promise<CraDetails> {
  const response = await fetch(`${API_BASE_URL}/api/cra`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ year, month }),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch CRA: ${response.status}`);
  }
  return response.json() as Promise<CraDetails>;
}
