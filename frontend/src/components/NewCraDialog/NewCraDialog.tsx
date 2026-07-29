import { useRef, useEffect, useState } from 'react';
import './NewCraDialog.css';

interface Props {
  open: boolean;
  onConfirm: (startDate: string, endDate: string) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

function getDefaultStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function getDefaultEnd(): string {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

export function NewCraDialog({ open, onConfirm, onCancel, loading = false, error = null }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [startDate, setStartDate] = useState(getDefaultStart);
  const [endDate, setEndDate] = useState(getDefaultEnd);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValidationError(null);
      dialogRef.current?.showModal();
      const input = dialogRef.current?.querySelector<HTMLElement>('input');
      input?.focus();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!startDate || !endDate) {
      setValidationError('Les deux dates sont requises.');
      return;
    }
    if (endDate < startDate) {
      setValidationError('La date de fin ne peut pas être antérieure à la date de début.');
      return;
    }

    onConfirm(startDate, endDate);
  };

  const handleCancel = () => {
    setValidationError(null);
    onCancel();
  };

  const handleDialogKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'Tab') {
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'input:not(:disabled), button:not(:disabled)'
        ) ?? []
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

  return (
    <dialog
      ref={dialogRef}
      className="new-cra-dialog"
      aria-modal="true"
      aria-labelledby="new-cra-dialog-title"
      onKeyDown={handleDialogKeyDown}
      onCancel={handleCancel}
    >
      <h2 id="new-cra-dialog-title" className="new-cra-dialog__title">
        Nouveau CRA
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="new-cra-dialog__field">
          <label htmlFor="new-cra-start" className="new-cra-dialog__label">
            Date de début
          </label>
          <input
            id="new-cra-start"
            type="date"
            className="new-cra-dialog__input"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div className="new-cra-dialog__field">
          <label htmlFor="new-cra-end" className="new-cra-dialog__label">
            Date de fin
          </label>
          <input
            id="new-cra-end"
            type="date"
            className="new-cra-dialog__input"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        {validationError && (
          <p role="alert" className="new-cra-dialog__error">
            {validationError}
          </p>
        )}
        {error && (
          <p role="alert" className="new-cra-dialog__error">
            {error}
          </p>
        )}
        <div className="new-cra-dialog__actions">
          <button
            type="submit"
            className="new-cra-dialog__confirm"
            disabled={loading}
          >
            {loading ? 'Création…' : 'Confirmer'}
          </button>
          <button
            type="button"
            className="new-cra-dialog__cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            Annuler
          </button>
        </div>
      </form>
    </dialog>
  );
}
