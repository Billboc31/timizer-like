import { ApiError, type ApiErrorCode } from './apiError';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function toApiErrorCode(raw: unknown): ApiErrorCode {
  const known: ApiErrorCode[] = [
    'invalid_work_value',
    'cra_validated',
    'cra_not_found',
    'cra_day_not_found',
    'invalid_cra_transition',
    'duplicate_cra_transition',
    'invalid_signature_image',
    'token_invalid',
    'token_already_consumed',
    'token_expired',
    'cra_not_signed',
    'consent_not_given',
    'validation_blocked',
  ];
  if (typeof raw === 'string' && (known as string[]).includes(raw)) {
    return raw as ApiErrorCode;
  }
  return 'unknown_error';
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }
  let body: Record<string, unknown> = {};
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    // non-JSON body — fall through to unknown_error
  }
  throw new ApiError(toApiErrorCode(body['error']), res.status, body);
}

export async function apiGet<T>(path: string, options?: { signal?: AbortSignal }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, options?.signal ? { signal: options.signal } : undefined);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError('network_error', null, err);
  }
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError('network_error', null, err);
  }
  return handleResponse<T>(res);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError('network_error', null, err);
  }
  return handleResponse<T>(res);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError('network_error', null, err);
  }
  return handleResponse<T>(res);
}

export async function apiDelete(path: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { method: 'DELETE' });
  } catch (err) {
    throw new ApiError('network_error', null, err);
  }
  if (!res.ok) {
    let body: Record<string, unknown> = {};
    try {
      body = (await res.json()) as Record<string, unknown>;
    } catch {
      // non-JSON body — ignore
    }
    throw new ApiError(toApiErrorCode(body['error']), res.status, body);
  }
}

export async function apiGetBlob(path: string, options?: { signal?: AbortSignal }): Promise<Blob> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, options?.signal ? { signal: options.signal } : undefined);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError('network_error', null, err);
  }
  if (!res.ok) {
    let body: Record<string, unknown> = {};
    try {
      body = (await res.json()) as Record<string, unknown>;
    } catch {
      // ignore
    }
    throw new ApiError(toApiErrorCode(body['error']), res.status, body);
  }
  return res.blob();
}
