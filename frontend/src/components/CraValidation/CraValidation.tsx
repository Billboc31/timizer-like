import { useState } from 'react';
import './CraValidation.css';
import { validateCra } from '../../api/craClient';
import { isApiError } from '../../api/apiError';
import type { CraDetails } from '../../types/cra';
import type { CraDetailsDto } from '../../api/types';

interface Props {
  cra: CraDetails | null;
  onValidated: (updated: CraDetailsDto) => void;
}

type UIState = 'idle' | 'confirming' | 'loading';

export function CraValidation({ cra, onValidated }: Props) {
  const [uiState, setUiState] = useState<UIState>('idle');
  const [error, setError] = useState<string | null>(null);

  if (!cra || cra.status === 'VALIDATED') return null;

  const handleValidateClick = () => {
    setError(null);
    setUiState('confirming');
  };

  const handleCancel = () => {
    setError(null);
    setUiState('idle');
  };

  const handleConfirm = async () => {
    setUiState('loading');
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const updated = await validateCra(cra.id, { providerSignatureDate: today });
      onValidated(updated);
    } catch (e) {
      const msg =
        isApiError(e) && e.code !== 'unknown_error'
          ? e.message
          : 'Une erreur est survenue. Veuillez réessayer.';
      setError(msg);
      setUiState('idle');
    }
  };

  if (uiState === 'idle') {
    return (
      <div className="cra-validation">
        <button className="cra-validation__button" onClick={handleValidateClick}>
          Valider le CRA
        </button>
        {error && (
          <p role="alert" className="cra-validation__error">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="cra-validation">
      <p className="cra-validation__warning">
        La validation verrouille le CRA, cette action est irréversible.
      </p>
      <div className="cra-validation__actions">
        <button
          className="cra-validation__confirm"
          onClick={handleConfirm}
          disabled={uiState === 'loading'}
        >
          {uiState === 'loading' ? 'Validation…' : 'Confirmer'}
        </button>
        <button
          className="cra-validation__cancel"
          onClick={handleCancel}
          disabled={uiState === 'loading'}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
