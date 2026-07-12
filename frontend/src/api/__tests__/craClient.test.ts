import { describe, it, expect, vi, afterEach } from 'vitest';
import { createCra, getCra, updateDay, validateCra, listCras, downloadCraPdf } from '../craClient';
import { ApiError, isApiError } from '../apiError';
import type { CraDetailsDto, CraSummaryDto } from '../types';

const mockCraDetails: CraDetailsDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 20,
  status: 'DRAFT',
  days: [{ day: 1, worked: 1, note: null }],
  validationDate: null,
  providerSignatureDate: null,
};

const mockSummaries: CraSummaryDto[] = [
  { id: 1, month: 7, year: 2026, totalWorkedDays: 20, status: 'DRAFT' },
];

function mockFetchOk(body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(body),
      blob: () => Promise.resolve(new Blob(['%PDF'], { type: 'application/pdf' })),
    }),
  );
}

function mockFetchError(status: number, errorCode: string): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      status,
      json: () => Promise.resolve({ error: errorCode }),
    }),
  );
}

function mockFetchNetworkFailure(): void {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
}

function mockFetchBlobOk(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['%PDF'], { type: 'application/pdf' })),
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createCra', () => {
  it('calls POST /api/cra and returns CraDetailsDto', async () => {
    mockFetchOk(mockCraDetails);
    const result = await createCra(2026, 7);
    expect(result).toEqual(mockCraDetails);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      '/api/cra',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('getCra', () => {
  it('calls GET /api/cras/:id and returns CraDetailsDto', async () => {
    mockFetchOk(mockCraDetails);
    const result = await getCra(1);
    expect(result).toEqual(mockCraDetails);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/cras/1');
  });
});

describe('updateDay', () => {
  it('calls PATCH /api/cras/:craId/days/:date and returns CraDetailsDto', async () => {
    mockFetchOk(mockCraDetails);
    const result = await updateDay(1, '2026-07-01', { workValue: 1 });
    expect(result).toEqual(mockCraDetails);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      '/api/cras/1/days/2026-07-01',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
});

describe('validateCra', () => {
  it('calls POST /api/cras/:craId/validate and returns CraDetailsDto', async () => {
    mockFetchOk({ ...mockCraDetails, status: 'VALIDATED' });
    const result = await validateCra(1, { providerSignatureDate: '2026-07-12' });
    expect(result.status).toBe('VALIDATED');
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      '/api/cras/1/validate',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('listCras', () => {
  it('calls GET /api/cras and returns CraSummaryDto[]', async () => {
    mockFetchOk(mockSummaries);
    const result = await listCras();
    expect(result).toEqual(mockSummaries);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/cras');
  });
});

describe('downloadCraPdf', () => {
  it('calls GET /api/cras/:id/pdf and returns a Blob', async () => {
    mockFetchBlobOk();
    const result = await downloadCraPdf(1);
    expect(result).toBeInstanceOf(Blob);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/cras/1/pdf');
  });
});

describe('error mapping', () => {
  it('maps 400 invalid_work_value to ApiError with correct code', async () => {
    mockFetchError(400, 'invalid_work_value');
    await expect(updateDay(1, '2026-07-01', { workValue: 0.5 })).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'invalid_work_value' && e.httpStatus === 400,
    );
  });

  it('maps 409 cra_validated to ApiError with correct code', async () => {
    mockFetchError(409, 'cra_validated');
    await expect(updateDay(1, '2026-07-01', { workValue: 1 })).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'cra_validated' && e.httpStatus === 409,
    );
  });

  it('maps 404 cra_not_found to ApiError with correct code', async () => {
    mockFetchError(404, 'cra_not_found');
    await expect(getCra(99)).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'cra_not_found' && e.httpStatus === 404,
    );
  });

  it('maps 404 cra_day_not_found to ApiError with correct code', async () => {
    mockFetchError(404, 'cra_day_not_found');
    await expect(updateDay(1, '2026-07-31', {})).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'cra_day_not_found' && e.httpStatus === 404,
    );
  });

  it('maps unknown error code to unknown_error', async () => {
    mockFetchError(500, 'something_unexpected');
    await expect(createCra(2026, 7)).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'unknown_error' && e.httpStatus === 500,
    );
  });

  it('maps network failure to ApiError with code network_error', async () => {
    mockFetchNetworkFailure();
    await expect(createCra(2026, 7)).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'network_error' && e.httpStatus === null,
    );
  });
});
