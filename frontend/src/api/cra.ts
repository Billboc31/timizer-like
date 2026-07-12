import type { CraDetails } from '../types/cra';

export async function fetchCra(year: number, month: number): Promise<CraDetails> {
  const res = await fetch(`/api/cras?year=${year}&month=${month}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<CraDetails>;
}
