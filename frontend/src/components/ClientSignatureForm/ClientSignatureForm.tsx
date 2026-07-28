import { useRef, useState } from 'react';
import { SignatureCanvas } from '../SignatureCanvas/SignatureCanvas';
import type { SignatureCanvasHandle } from '../SignatureCanvas/SignatureCanvas';
import { submitClientSignature } from '../../api/craPublicClient';
import { ApiError } from '../../api/apiError';

interface ClientSignatureFormProps {
  token: string;
  onSuccess: (signerName: string, signedAt: Date) => void;
}

export function ClientSignatureForm({ token, onSuccess }: ClientSignatureFormProps) {
  const [signerName, setSignerName] = useState('');
  const [signerRole, setSignerRole] = useState('');
  const [consentApproved, setConsentApproved] = useState(false);
  const [padNonEmpty, setPadNonEmpty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<SignatureCanvasHandle>(null);

  const canSubmit = signerName.trim().length > 0 && consentApproved && padNonEmpty && !submitting;

  function handleClear() {
    canvasRef.current?.clear();
    setPadNonEmpty(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const signatureImageBase64 = canvasRef.current?.toDataURL() ?? '';
    if (!signatureImageBase64 || canvasRef.current?.isEmpty()) {
      setError('Veuillez dessiner votre signature.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitClientSignature(token, {
        signerName: signerName.trim(),
        signerRole: signerRole.trim() || undefined,
        consentApproved: true,
        signatureImageBase64,
      });
      onSuccess(signerName.trim(), new Date());
    } catch (err) {
      if (err instanceof ApiError && err.code === 'token_already_consumed') {
        setError('Ce lien de signature a déjà été utilisé.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} data-testid="client-signature-form">
      <h2>Signer le CRA</h2>

      {error && (
        <div role="alert" data-testid="form-error">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="signer-name">Nom du signataire *</label>
        <input
          id="signer-name"
          type="text"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          required
          data-testid="signer-name-input"
        />
      </div>

      <div>
        <label htmlFor="signer-role">Fonction (optionnel)</label>
        <input
          id="signer-role"
          type="text"
          value={signerRole}
          onChange={(e) => setSignerRole(e.target.value)}
          data-testid="signer-role-input"
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={consentApproved}
            onChange={(e) => setConsentApproved(e.target.checked)}
            data-testid="consent-checkbox"
          />
          {' '}Je confirme avoir examiné ce CRA et l&apos;approuve
        </label>
      </div>

      <div>
        <p>Signature *</p>
        <SignatureCanvas
          ref={canvasRef}
          onDraw={() => setPadNonEmpty(true)}
          data-testid="signature-canvas"
        />
        <button type="button" onClick={handleClear} data-testid="clear-button">
          Effacer la signature
        </button>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        data-testid="submit-button"
      >
        {submitting ? 'Envoi en cours...' : 'Soumettre la signature'}
      </button>
    </form>
  );
}
