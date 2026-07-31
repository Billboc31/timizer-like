import { useRef, useState } from 'react';
import { SignatureCanvas } from '../SignatureCanvas/SignatureCanvas';
import type { SignatureCanvasHandle } from '../SignatureCanvas/SignatureCanvas';
import { submitClientSignature } from '../../api/craPublicClient';
import { ApiError } from '../../api/apiError';
import './ClientSignatureForm.css';

interface ClientSignatureFormProps {
  token: string;
  onSuccess: (signerName: string, signedAt: Date, downloadToken: string) => void;
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
      const { downloadToken } = await submitClientSignature(token, {
        signerName: signerName.trim(),
        signerRole: signerRole.trim() || undefined,
        consentApproved: true,
        signatureImageBase64,
      });
      onSuccess(signerName.trim(), new Date(), downloadToken);
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
    <form onSubmit={handleSubmit} data-testid="client-signature-form" className="signature-form">
      <div className="signature-form__explanation">
        <p>
          En signant ce document, vous certifiez avoir vérifié les informations ci-dessus
          et vous approuvez le Compte Rendu d'Activité du prestataire.
        </p>
      </div>

      {error && (
        <div role="alert" data-testid="form-error" className="signature-form__error">
          {error}
        </div>
      )}

      <div className="signature-form__field">
        <label htmlFor="signer-name" className="signature-form__label">
          Nom du signataire <span aria-hidden="true">*</span>
        </label>
        <input
          id="signer-name"
          type="text"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          required
          data-testid="signer-name-input"
          className="input"
          autoComplete="name"
        />
      </div>

      <div className="signature-form__field">
        <label htmlFor="signer-role" className="signature-form__label">
          Fonction <span className="signature-form__optional">(optionnel)</span>
        </label>
        <input
          id="signer-role"
          type="text"
          value={signerRole}
          onChange={(e) => setSignerRole(e.target.value)}
          data-testid="signer-role-input"
          className="input"
          autoComplete="organization-title"
        />
      </div>

      <div className="signature-form__field">
        <label className="signature-form__consent">
          <input
            type="checkbox"
            checked={consentApproved}
            onChange={(e) => setConsentApproved(e.target.checked)}
            data-testid="consent-checkbox"
          />
          <span>Je confirme avoir examiné ce CRA et l&apos;approuve</span>
        </label>
      </div>

      <div className="signature-form__field">
        <label className="signature-form__label" id="signature-pad-label">
          Votre signature <span aria-hidden="true">*</span>
        </label>
        <div className="signature-form__pad-wrapper">
          <SignatureCanvas
            ref={canvasRef}
            onDraw={() => setPadNonEmpty(true)}
            data-testid="signature-canvas"
            disabled={submitting}
            aria-labelledby="signature-pad-label"
          />
          {!padNonEmpty && (
            <span className="signature-form__pad-hint" aria-hidden="true">
              Dessinez votre signature ici
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleClear}
          data-testid="clear-button"
          className="btn btn-secondary signature-form__clear"
        >
          Effacer
        </button>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        data-testid="submit-button"
        className="btn btn-primary signature-form__submit"
      >
        {submitting ? 'Signature en cours…' : 'Signer et valider le CRA'}
      </button>
    </form>
  );
}
