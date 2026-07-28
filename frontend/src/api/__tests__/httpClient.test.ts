import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

afterEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function mockFetchOk(body: unknown = {}, emptyBody = false): void {
  const text = emptyBody ? '' : JSON.stringify(body);
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(text),
      blob: () => Promise.resolve(new Blob()),
    }),
  );
}

describe('httpClient — VITE_API_BASE_URL (D2)', () => {
  it('prefixes requests with VITE_API_BASE_URL when set', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3001');
    mockFetchOk({});
    const { apiGet } = await import('../httpClient');

    await apiGet('/test');

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/test',
      undefined,
    );
  });

  it('uses empty base URL when VITE_API_BASE_URL is not set', async () => {
    mockFetchOk({});
    const { apiGet } = await import('../httpClient');

    await apiGet('/test');

    expect(vi.mocked(fetch)).toHaveBeenCalledWith('/test', undefined);
  });
});

describe('httpClient — AbortSignal (D7)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('forwards AbortSignal to fetch in apiGet', async () => {
    mockFetchOk({});
    const { apiGet } = await import('../httpClient');
    const controller = new AbortController();

    await apiGet('/test', { signal: controller.signal });

    expect(vi.mocked(fetch)).toHaveBeenCalledWith('/test', { signal: controller.signal });
  });

  it('re-throws AbortError without wrapping in ApiError', async () => {
    const abortError = new DOMException('Aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));
    const { apiGet } = await import('../httpClient');

    await expect(apiGet('/test', {})).rejects.toBeInstanceOf(DOMException);
  });

  it('wraps network errors in ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const { apiGet, } = await import('../httpClient');
    const { isApiError } = await import('../apiError');

    await expect(apiGet('/test')).rejects.toSatisfy(isApiError);
  });
});

describe('httpClient — empty body handling (D8)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('resolves undefined for 200 response with empty body', async () => {
    mockFetchOk({}, true);
    const { apiPost } = await import('../httpClient');

    const result = await apiPost<void>('/sign', {});

    expect(result).toBeUndefined();
  });

  it('parses JSON for 200 response with non-empty body', async () => {
    mockFetchOk({ id: 42 });
    const { apiGet } = await import('../httpClient');

    const result = await apiGet<{ id: number }>('/test');

    expect(result).toEqual({ id: 42 });
  });
});
