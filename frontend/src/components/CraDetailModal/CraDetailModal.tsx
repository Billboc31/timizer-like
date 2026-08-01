import { useEffect, useRef, useState } from 'react';
import { getCra, downloadCraPdf, reopenCra } from '../../api/craClient';
import { getErrorMessage } from '../../api/errorMessages';
import { CalendarGrid } from '../CalendarGrid/CalendarGrid';
import type { CraDetailsDto } from '../../api/types';
import type { CraDetails } from '../../types/cra';
import './CraDetailModal.css';

const TITLE_ID = 'cra-detail-modal-title';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function monthTitle(month: number, year: number): string {
  const label = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
    .format(new Date(year, month - 1, 1));
  return capitalize(label);
}

function coveredPeriod(month: number, year: number): string {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const fmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${fmt.format(first)} – ${fmt.format(last)}`;
}

function nameOr(first?: string | null, last?: string | null): string {
  const parts = [first, last].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : '—';
}

function dtoToCraDetails(dto: CraDetailsDto): CraDetails {
  return {
    id: dto.id,
    month: dto.month,
    year: dto.year,
    totalWorkedDays: dto.totalWorkedDays,
    status: dto.status,
    days: dto.days.map(d => ({ day: d.day, worked: d.worked, note: d.note ?? '' })),
    providerSignatureDate: dto.providerSignatureDate,
    providerFirstName: dto.providerFirstName,
    providerLastName: dto.providerLastName,
    providerCompany: dto.providerCompany,
    clientFirstName: dto.clientFirstName,
    clientLastName: dto.clientLastName,
    clientCompany: dto.clientCompany,
    clientContactFirstName: dto.clientContactFirstName,
    clientContactLastName: dto.clientContactLastName,
    clientSignatureDate: dto.clientSignatureDate,
  };
}

function LoadingSkeleton() {
  return (
    <div className="cra-detail__skeleton-wrapper" role="status" aria-label="Chargement du CRA">
      <div className="cra-detail__skeleton cra-detail__skeleton--title" />
      <div className="cra-detail__skeleton cra-detail__skeleton--subtitle" />
      <div className="cra-detail__skeleton cra-detail__skeleton--meta" />
      <div className="cra-detail__skeleton cra-detail__skeleton--calendar" />
    </div>
  );
}

interface Props {
  craId: number | null;
  onClose: () => void;
}

export function CraDetailModal({ craId, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [cra, setCra] = useState<CraDetailsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [reopening, setReopening] = useState(false);
  const [reopenError, setReopenError] = useState<string | null>(null);

  useEffect(() => {
    if (craId !== null) {
      if (!dialogRef.current?.open) {
        dialogRef.current?.showModal();
        closeButtonRef.current?.focus();
      }
    } else {
      dialogRef.current?.close();
    }
  }, [craId]);

  useEffect(() => {
    if (craId === null) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [craId]);

  useEffect(() => {
    if (craId === null) {
      setCra(null);
      setError(null);
      setDownloadError(null);
      setReopenError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setCra(null);
    getCra(craId)
      .then(dto => {
        if (!cancelled) { setCra(dto); setLoading(false); }
      })
      .catch((err: unknown) => {
        if (!cancelled) { setError(getErrorMessage(err)); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [craId]);

  const handleRetry = () => {
    if (craId === null) return;
    setLoading(true);
    setError(null);
    getCra(craId)
      .then(dto => { setCra(dto); setLoading(false); })
      .catch((err: unknown) => { setError(getErrorMessage(err)); setLoading(false); });
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'
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
  };

  const handleReopen = () => {
    if (!cra) return;
    const id = cra.id;
    if (!window.confirm('Réouvrir ce CRA invalidera les signatures existantes et le remettra en brouillon. Continuer ?')) return;
    setReopening(true);
    setReopenError(null);
    reopenCra(id)
      .then(() => getCra(id))
      .then(dto => setCra(dto))
      .catch((err: unknown) => setReopenError(getErrorMessage(err)))
      .finally(() => setReopening(false));
  };

  const handleDownload = () => {
    if (!cra) return;
    setDownloading(true);
    setDownloadError(null);
    downloadCraPdf(cra.id)
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cra-${cra.year}-${String(cra.month).padStart(2, '0')}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err: unknown) => setDownloadError(getErrorMessage(err)))
      .finally(() => setDownloading(false));
  };

  return (
    <dialog
      ref={dialogRef}
      className="cra-detail-modal"
      aria-modal="true"
      aria-labelledby={TITLE_ID}
      onClick={handleBackdropClick}
      onCancel={handleCancel}
      onKeyDown={handleKeyDown}
    >
      <div className="cra-detail-modal__content">
        <header className="cra-detail-modal__header">
          <h2 id={TITLE_ID} className="cra-detail-modal__title">
            {cra ? monthTitle(cra.month, cra.year) : 'Détail CRA'}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="cra-detail-modal__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </header>

        <div className="cra-detail-modal__body">
          {loading && <LoadingSkeleton />}

          {error && !loading && (
            <div>
              <div role="alert" className="cra-detail__error">
                <span className="cra-detail__error-icon" aria-hidden="true">⚠</span>
                <span>{error}</span>
              </div>
              <button className="cra-detail__btn" onClick={handleRetry}>
                Réessayer
              </button>
            </div>
          )}

          {!loading && !error && cra && (
            <>
              <p className="cra-detail__period">{coveredPeriod(cra.month, cra.year)}</p>

              <section className="cra-detail__meta" aria-label="Informations du CRA">
                <dl className="cra-detail__meta-grid">
                  <div className="cra-detail__meta-item">
                    <dt>Prestataire</dt>
                    <dd>{nameOr(cra.providerFirstName, cra.providerLastName)}</dd>
                  </div>
                  <div className="cra-detail__meta-item">
                    <dt>Société prestataire</dt>
                    <dd>{cra.providerCompany ?? '—'}</dd>
                  </div>
                  <div className="cra-detail__meta-item">
                    <dt>Client</dt>
                    <dd>{nameOr(cra.clientFirstName, cra.clientLastName)}</dd>
                  </div>
                  <div className="cra-detail__meta-item">
                    <dt>Société client</dt>
                    <dd>{cra.clientCompany ?? '—'}</dd>
                  </div>
                  <div className="cra-detail__meta-item">
                    <dt>Contact client</dt>
                    <dd>{nameOr(cra.clientContactFirstName, cra.clientContactLastName)}</dd>
                  </div>
                  <div className="cra-detail__meta-item">
                    <dt>Jours travaillés</dt>
                    <dd>{cra.totalWorkedDays}</dd>
                  </div>
                  <div className="cra-detail__meta-item">
                    <dt>Statut</dt>
                    <dd>
                      <span className={`cra-detail__badge cra-detail__badge--${cra.status.toLowerCase()}`}>
                        {cra.status}
                      </span>
                    </dd>
                  </div>
                  <div className="cra-detail__meta-item">
                    <dt>Date de validation</dt>
                    <dd>{cra.validationDate ?? '—'}</dd>
                  </div>
                  <div className="cra-detail__meta-item">
                    <dt>Signature prestataire</dt>
                    <dd>{cra.providerSignatureDate ?? '—'}</dd>
                  </div>
                  <div className="cra-detail__meta-item">
                    <dt>Signature client</dt>
                    <dd>{cra.clientSignatureDate ?? '—'}</dd>
                  </div>
                </dl>
              </section>

              <CalendarGrid
                cra={dtoToCraDetails(cra)}
                loading={false}
                error={null}
                onDayClick={() => undefined}
              />
            </>
          )}

          {downloadError && (
            <div role="alert" className="cra-detail__error cra-detail__error--inline">
              <span className="cra-detail__error-icon" aria-hidden="true">⚠</span>
              <span>{downloadError}</span>
            </div>
          )}

          {reopenError && (
            <div role="alert" className="cra-detail__error cra-detail__error--inline">
              <span className="cra-detail__error-icon" aria-hidden="true">⚠</span>
              <span>{reopenError}</span>
            </div>
          )}
        </div>

        {cra && (
          <div className="cra-detail__actions">
            {cra.status === 'VALIDATED' && (
              <button
                className="cra-detail__btn cra-detail__btn--download"
                onClick={handleDownload}
                disabled={downloading}
                aria-label="Télécharger le PDF"
              >
                {downloading ? 'Téléchargement…' : 'Télécharger PDF'}
              </button>
            )}
            {cra.status !== 'DRAFT' && (
              <button
                className="cra-detail__btn cra-detail__btn--reopen"
                onClick={handleReopen}
                disabled={reopening}
                aria-label="Réouvrir le CRA"
              >
                {reopening ? 'Réouverture…' : 'Réouvrir et modifier'}
              </button>
            )}
          </div>
        )}
      </div>
    </dialog>
  );
}
