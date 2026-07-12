import { ApiError, type ApiErrorCode } from './apiError';

const BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) || '';

function toApiErrorCode(raw: unknown): ApiErrorCode {
  const known: ApiErrorCode[] = [
    'invalid_work_value',
    'cra_validated',
    'cra_not_found',
    'cra_day_not_found',
  ];
  if (typeof raw === 'string' && (known as string[]).includes(raw)) {
    return raw as ApiErrorCode;
  }
  return 'unknown_error';
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return res.json() as Promise<T>;
  }
  let body: Record<string, unknown> = {};
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    // non-JSON body — fall through to unknown_error
  }
  throw new ApiError(toApiErrorCode(body['error']), res.status, body);
}

export async function apiGet<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`);
  } catch (err) {
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

export async function apiGetBlob(path: string): Promise<Blob> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`);
  } catch (err) {
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
