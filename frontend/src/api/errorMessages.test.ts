import { describe, it, expect } from 'vitest';
import { getErrorMessage } from './errorMessages';
import { ApiError } from './apiError';

describe('getErrorMessage', () => {
  it('maps invalid_work_value to French', () => {
    expect(getErrorMessage(new ApiError('invalid_work_value', 422))).toBe(
      "La valeur saisie n'est pas valide.",
    );
  });

  it('maps cra_validated to French', () => {
    expect(getErrorMessage(new ApiError('cra_validated', 409))).toBe(
      'Ce CRA est déjà validé et ne peut plus être modifié.',
    );
  });

  it('maps cra_not_found to French', () => {
    expect(getErrorMessage(new ApiError('cra_not_found', 404))).toBe(
      'Ce CRA est introuvable.',
    );
  });

  it('maps cra_day_not_found to French', () => {
    expect(getErrorMessage(new ApiError('cra_day_not_found', 404))).toBe(
      "Ce jour n'existe pas dans ce CRA.",
    );
  });

  it('maps network_error to French', () => {
    expect(getErrorMessage(new ApiError('network_error', null))).toBe(
      'Impossible de contacter le serveur. Vérifiez votre connexion.',
    );
  });

  it('maps unknown_error to French', () => {
    expect(getErrorMessage(new ApiError('unknown_error', 500))).toBe(
      'Une erreur est survenue. Veuillez réessayer.',
    );
  });

  it('returns generic French message for plain Error', () => {
    expect(getErrorMessage(new Error('Network error'))).toBe(
      'Une erreur est survenue. Veuillez réessayer.',
    );
  });

  it('returns generic French message for non-Error', () => {
    expect(getErrorMessage('something broke')).toBe(
      'Une erreur est survenue. Veuillez réessayer.',
    );
  });
});
