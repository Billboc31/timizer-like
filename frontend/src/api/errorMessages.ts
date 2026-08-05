import type { ApiErrorCode } from './apiError';
import { isApiError } from './apiError';

const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  invalid_work_value: "La valeur saisie n'est pas valide.",
  cra_validated: 'Ce CRA est déjà validé et ne peut plus être modifié.',
  cra_not_found: 'Ce CRA est introuvable.',
  cra_day_not_found: "Ce jour n'existe pas dans ce CRA.",
  invalid_cra_transition: "Cette action n'est pas autorisée pour l'état actuel du CRA.",
  duplicate_cra_transition: 'Cette action a déjà été effectuée sur ce CRA.',
  invalid_signature_image: 'Le format de signature est invalide. Formats acceptés : PNG, JPEG, SVG.',
  token_invalid: 'Ce lien de signature est invalide ou a été révoqué.',
  token_not_found: 'Ce lien de signature est introuvable ou a été révoqué.',
  token_already_consumed: 'Ce lien de signature a déjà été utilisé.',
  token_expired: 'Ce lien de signature a expiré.',
  cra_not_signed: 'Le CRA doit être signé par le prestataire avant la signature client.',
  cra_wrong_status: "Cette action n'est pas autorisée pour l'état actuel du CRA.",
  consent_not_given: 'Le consentement est requis pour signer le CRA.',
  validation_blocked: 'La validation du CRA est bloquée. Vérifiez les prérequis.',
  cra_not_deletable: 'Ce CRA ne peut pas être supprimé dans son état actuel.',
  network_error: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
  unknown_error: 'Une erreur est survenue. Veuillez réessayer.',
};

export function getErrorMessage(err: unknown): string {
  if (isApiError(err)) {
    return ERROR_MESSAGES[err.code];
  }
  return ERROR_MESSAGES.unknown_error;
}
