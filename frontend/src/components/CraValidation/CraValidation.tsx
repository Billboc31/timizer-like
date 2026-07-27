import { useRef, useState } from 'react';
import './CraValidation.css';
import { validateCra } from '../../api/craClient';
import { getErrorMessage } from '../../api/errorMessages';
import type { CraDetails } from '../../types/cra';
import type { CraDetailsDto } from '../../api/types';

interface Props {
  cra: CraDetails | null;
  onValidated: (updated: CraDetailsDto) => void;
}

type UIState = 'idle' | 'confirming' | 'loading' | 'success';

export function CraValidation({ cra, onValidated }: Props) {
  const [uiState, setUiState] = useState<UIState>('idle');
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (!cra || cra.status === 'VALIDATED') return null;

  const handleValidateClick = () => {
    setError(null);
    setUiState('confirming');
    dialogRef.current?.showModal();
  };

  const handleCancel = () => {
    setError(null);
    setUiState('idle');
    dialogRef.current?.close();
  };

  const handleConfirm = async () => {
    setUiState('loading');
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const updated = await validateCra(cra.id, { providerSignatureDate: today });
      setUiState('success');
      dialogRef.current?.close();
      setTimeout(() => {
        onValidated(updated);
      }, 2000);
    } catch (e) {
      setError(getErrorMessage(e));
      setUiState('confirming');
    }
  };

  if (uiState === 'success') {
    return (
      <div className="cra-validation">
        <p className="cra-validation__success" role="status">
          CRA validé avec succès.
        </p>
      </div>
    );
  }

  return (
    <div className="cra-validation">
      <button className="cra-validation__button" onClick={handleValidateClick}>
        Valider le CRA
      </button>

      <dialog ref={dialogRef} className="cra-validation-dialog" aria-modal="true">
        <p className="cra-validation__warning">
          La validation verrouille le CRA, cette action est irréversible. Le CRA validé devient en lecture seule.
        </p>
        {error && (
          <p role="alert" className="cra-validation__error">
            {error}
          </p>
        )}
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
      </dialog>
    </div>
  );
}
