export type ApiErrorCode =
  | 'invalid_work_value'
  | 'cra_validated'
  | 'cra_not_found'
  | 'cra_day_not_found'
  | 'invalid_cra_transition'
  | 'duplicate_cra_transition'
  | 'signature_too_large'
  | 'signature_invalid_format'
  | 'token_invalid'
  | 'network_error'
  | 'unknown_error';

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly httpStatus: number | null;
  readonly detail?: unknown;

  constructor(code: ApiErrorCode, httpStatus: number | null, detail?: unknown) {
    super(code);
    this.name = 'ApiError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.detail = detail;
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}
