import { useState } from 'react';
import './CraSignatureActions.css';
import { submitCra, signCraByProvider, sendCraToClient } from '../../api/craClient';
import { getErrorMessage } from '../../api/errorMessages';
import type { CraDetails } from '../../types/cra';
import type { CraDetailsDto } from '../../api/types';

interface Props {
  cra: CraDetails;
  onSuccess: (updated: CraDetailsDto) => void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CraSignatureActions({ cra, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerSignatureDate, setProviderSignatureDate] = useState<string>(todayIso);

  async function callAction(action: () => Promise<CraDetailsDto>) {
    setLoading(true);
    setError(null);
    try {
      const updated = await action();
      onSuccess(updated);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  if (cra.status === 'DRAFT') {
    return (
      <div className="cra-signature-actions">
        {error && <p role="alert" className="cra-signature-actions__error">{error}</p>}
        <button
          className="cra-signature-actions__button"
          onClick={() => callAction(() => submitCra(cra.id))}
          disabled={loading}
        >
          {loading ? 'En cours…' : 'Soumettre pour signature'}
        </button>
      </div>
    );
  }

  if (cra.status === 'READY_FOR_PROVIDER_SIGNATURE') {
    return (
      <div className="cra-signature-actions">
        {error && <p role="alert" className="cra-signature-actions__error">{error}</p>}
        <div className="cra-signature-actions__date-field">
          <label className="cra-signature-actions__label" htmlFor="provider-signature-date">
            Date de signature prestataire
          </label>
          <input
            id="provider-signature-date"
            type="date"
            className="cra-signature-actions__date-input"
            value={providerSignatureDate}
            onChange={e => setProviderSignatureDate(e.target.value)}
          />
        </div>
        <button
          className="cra-signature-actions__button"
          onClick={() => callAction(() => signCraByProvider(cra.id, { providerSignatureDate }))}
          disabled={loading || !providerSignatureDate}
        >
          {loading ? 'En cours…' : 'Signer (prestataire)'}
        </button>
      </div>
    );
  }

  if (cra.status === 'SIGNED_BY_PROVIDER') {
    return (
      <div className="cra-signature-actions">
        {error && <p role="alert" className="cra-signature-actions__error">{error}</p>}
        <button
          className="cra-signature-actions__button"
          onClick={() => callAction(() => sendCraToClient(cra.id))}
          disabled={loading}
        >
          {loading ? 'En cours…' : 'Envoyer au client'}
        </button>
      </div>
    );
  }

  return null;
}
