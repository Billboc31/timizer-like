import './CraSignatureActions.css';
import type { CraDetails } from '../../types/cra';
import type { CraDetailsDto } from '../../api/types';

interface Props {
  cra: CraDetails;
  onSuccess: (updated: CraDetailsDto) => void;
}

export function CraSignatureActions({ cra }: Props) {
  if (cra.status === 'AWAITING_CLIENT_SIGNATURE') {
    return (
      <div className="cra-signature-actions">
        <p className="cra-signature-actions__info">
          En attente de la signature client. Partagez le lien de signature avec le client.
        </p>
      </div>
    );
  }

  if (cra.status === 'VALIDATED') {
    return (
      <div className="cra-signature-actions">
        {cra.providerSignerName && cra.providerSignatureDate && (
          <p className="cra-signature-actions__info">
            Signé par le prestataire&nbsp;: {cra.providerSignerName} le {cra.providerSignatureDate}
          </p>
        )}
        {cra.clientRepresentativeName && cra.clientSignatureDate && (
          <p className="cra-signature-actions__info">
            Signé par le client&nbsp;: {cra.clientRepresentativeName} le {cra.clientSignatureDate}
          </p>
        )}
      </div>
    );
  }

  return null;
}
