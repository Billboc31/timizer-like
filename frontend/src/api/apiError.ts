export type ApiErrorCode =
  | 'invalid_work_value'
  | 'cra_validated'
  | 'cra_not_found'
  | 'cra_day_not_found'
  | 'invalid_cra_transition'
  | 'duplicate_cra_transition'
  | 'invalid_signature_image'
  | 'token_invalid'
  | 'token_not_found'
  | 'token_already_consumed'
  | 'token_expired'
  | 'cra_not_signed'
  | 'cra_wrong_status'
  | 'cra_not_deletable'
  | 'consent_not_given'
  | 'validation_blocked'
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
