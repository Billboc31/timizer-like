import { useState } from 'react';
import './CraSignatureActions.css';
import type { CraDetails } from '../../types/cra';
import type { CraDetailsDto } from '../../api/types';
import { generateSignatureLink } from '../../api/craClient';

interface Props {
  cra: CraDetails;
  onSuccess: (updated: CraDetailsDto) => void;
}

export function CraSignatureActions({ cra }: Props) {
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerateLink() {
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const result = await generateSignatureLink(cra.id);
      setSignatureUrl(result.signatureUrl);
      await navigator.clipboard.writeText(result.signatureUrl);
      setCopied(true);
    } catch {
      setError('Impossible de générer le lien de signature. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyLink() {
    if (!signatureUrl) return;
    try {
      await navigator.clipboard.writeText(signatureUrl);
      setCopied(true);
    } catch {
      setError('Impossible de copier le lien dans le presse-papier.');
    }
  }

  if (cra.status === 'AWAITING_CLIENT_SIGNATURE') {
    return (
      <div className="cra-signature-actions">
        <p className="cra-signature-actions__info">
          En attente de la signature client. Partagez le lien de signature avec le client.
        </p>
        {error && <p className="cra-signature-actions__error">{error}</p>}
        {signatureUrl ? (
          <>
            <p className="cra-signature-actions__info cra-signature-actions__link-value">
              {signatureUrl}
            </p>
            <button
              className="cra-signature-actions__button"
              onClick={handleCopyLink}
            >
              {copied ? 'Lien copié !' : 'Copier le lien'}
            </button>
          </>
        ) : (
          <button
            className="cra-signature-actions__button"
            onClick={handleGenerateLink}
            disabled={loading}
          >
            {loading ? 'Génération en cours…' : 'Générer le lien de signature'}
          </button>
        )}
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
