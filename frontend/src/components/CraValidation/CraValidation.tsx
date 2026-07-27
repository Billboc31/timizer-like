import { useState, useEffect, useRef } from 'react';
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prevStateRef = useRef<UIState>('idle');

  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = uiState;

    if (uiState === 'confirming') {
      const el = dialogRef.current?.querySelector<HTMLElement>('button:not(:disabled)');
      el?.focus();
    } else if (uiState === 'idle' && (prev === 'confirming' || prev === 'loading')) {
      triggerRef.current?.focus();
    }
  }, [uiState]);

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

  const handleDialogKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'Tab') {
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled)') ?? []
      );
      if (focusable.length < 2) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
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
      <button ref={triggerRef} className="cra-validation__button" onClick={handleValidateClick}>
        Valider le CRA
      </button>

      <dialog
        ref={dialogRef}
        className="cra-validation-dialog"
        aria-modal="true"
        aria-labelledby="cra-validation-dialog-title"
        onKeyDown={handleDialogKeyDown}
      >
        <p id="cra-validation-dialog-title" className="cra-validation__warning">
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
