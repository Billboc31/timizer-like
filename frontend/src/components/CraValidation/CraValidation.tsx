import { useState, useEffect, useRef } from 'react';
import './CraValidation.css';
import { validateCra } from '../../api/craClient';
import { getSignature } from '../../api/signatureClient';
import { getErrorMessage } from '../../api/errorMessages';
import { isApiError } from '../../api/apiError';
import type { CraDetails } from '../../types/cra';
import type { CraDetailsDto, ProviderSignatureDto } from '../../api/types';

interface Props {
  cra: CraDetails | null;
  onValidated: (updated: CraDetailsDto) => void;
  onGoToSettings?: () => void;
}

type UIState = 'idle' | 'loading-sig' | 'no-sig' | 'confirming' | 'loading' | 'success';

const BLOCKING_REASON_LABELS: Record<string, string> = {
  STATUS_NOT_DRAFT: "Le CRA n'est pas en état Brouillon.",
  INVALID_SIGNATURE_IMAGE: "L'image de signature est invalide ou manquante.",
};

export function CraValidation({ cra, onValidated, onGoToSettings }: Props) {
  const [uiState, setUiState] = useState<UIState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [blockingReasons, setBlockingReasons] = useState<string[]>([]);
  const [signature, setSignature] = useState<ProviderSignatureDto | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prevStateRef = useRef<UIState>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = uiState;

    if (uiState === 'confirming') {
      const el = dialogRef.current?.querySelector<HTMLElement>('button:not(:disabled)');
      el?.focus();
    } else if (uiState === 'idle' && (prev === 'confirming' || prev === 'loading' || prev === 'loading-sig')) {
      triggerRef.current?.focus();
    }
  }, [uiState]);

  if (!cra || cra.status !== 'DRAFT') return null;

  const handleValidateClick = async () => {
    setError(null);
    setUiState('loading-sig');
    try {
      const sig = await getSignature();
      setSignature(sig);
      setUiState('confirming');
      dialogRef.current?.showModal();
    } catch (e) {
      if (isApiError(e) && e.httpStatus === 404) {
        setUiState('no-sig');
      } else {
        setError(getErrorMessage(e));
        setUiState('idle');
      }
    }
  };

  const handleCancel = () => {
    setError(null);
    setBlockingReasons([]);
    setUiState('idle');
    dialogRef.current?.close();
  };

  const handleConfirm = async () => {
    if (!signature) return;
    setUiState('loading');
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const updated = await validateCra(cra.id, {
        providerSignatureDate: today,
        providerSignatureImage: signature.signatureImage,
        providerSignerName: signature.signerName,
      });
      setUiState('success');
      dialogRef.current?.close();
      timeoutRef.current = setTimeout(() => {
        onValidated(updated);
      }, 2000);
    } catch (e) {
      if (isApiError(e) && e.code === 'validation_blocked') {
        const detail = e.detail as Record<string, unknown>;
        setBlockingReasons(Array.isArray(detail?.reasons) ? (detail.reasons as string[]) : []);
      } else {
        setBlockingReasons([]);
      }
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

  if (uiState === 'no-sig') {
    return (
      <div className="cra-validation">
        <p role="alert" className="cra-validation__no-sig">
          {onGoToSettings ? (
            <>
              Aucune signature configurée. Rendez-vous dans les{' '}
              <button className="cra-validation__settings-link" onClick={onGoToSettings}>
                Paramètres
              </button>{' '}
              pour créer votre signature avant de valider ce CRA.
            </>
          ) : (
            'Aucune signature configurée. Configurez votre signature dans les Paramètres de l\'application avant de valider ce CRA.'
          )}
        </p>
        <button
          className="cra-validation__cancel cra-validation__back-btn"
          onClick={() => setUiState('idle')}
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="cra-validation">
      <button
        ref={triggerRef}
        className="cra-validation__button"
        onClick={handleValidateClick}
        disabled={uiState === 'loading-sig'}
      >
        {uiState === 'loading-sig' ? 'Chargement…' : 'Valider et signer le CRA'}
      </button>

      {error && uiState === 'idle' && (
        <p role="alert" className="cra-validation__error">
          {error}
        </p>
      )}

      <dialog
        ref={dialogRef}
        className="cra-validation-dialog"
        aria-modal="true"
        aria-labelledby="cra-validation-dialog-title"
        onKeyDown={handleDialogKeyDown}
        onCancel={handleCancel}
      >
        <p id="cra-validation-dialog-title" className="cra-validation__warning">
          La validation verrouille le CRA, cette action est irréversible. Le CRA validé devient en lecture seule.
        </p>
        {signature && (
          <div className="cra-validation__sig-preview">
            <p className="cra-validation__sig-name">Signataire : {signature.signerName}</p>
            <img
              src={signature.signatureImage}
              alt="Aperçu de la signature"
              className="cra-validation__sig-img"
            />
          </div>
        )}
        {error && (
          <div role="alert" className="cra-validation__error">
            <p>{error}</p>
            {blockingReasons.length > 0 && (
              <ul className="cra-validation__blocking-reasons">
                {blockingReasons.map(r => (
                  <li key={r}>{BLOCKING_REASON_LABELS[r] ?? r}</li>
                ))}
              </ul>
            )}
          </div>
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
