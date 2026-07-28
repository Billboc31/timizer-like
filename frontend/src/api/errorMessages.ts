import type { ApiErrorCode } from './apiError';
import { isApiError } from './apiError';

const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  invalid_work_value: "La valeur saisie n'est pas valide.",
  cra_validated: 'Ce CRA est déjà validé et ne peut plus être modifié.',
  cra_not_found: 'Ce CRA est introuvable.',
  cra_day_not_found: "Ce jour n'existe pas dans ce CRA.",
  invalid_cra_transition: "Cette action n'est pas autorisée pour l'état actuel du CRA.",
  duplicate_cra_transition: 'Cette action a déjà été effectuée sur ce CRA.',
  network_error: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
  unknown_error: 'Une erreur est survenue. Veuillez réessayer.',
};

export function getErrorMessage(err: unknown): string {
  if (isApiError(err)) {
    return ERROR_MESSAGES[err.code];
  }
  return ERROR_MESSAGES.unknown_error;
}
