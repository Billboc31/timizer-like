import { useEffect, useState } from 'react';
import { getCra, downloadCraPdf, reopenCra } from '../../api/craClient';
import { getErrorMessage } from '../../api/errorMessages';
import { CalendarGrid } from '../CalendarGrid/CalendarGrid';
import type { CraDetailsDto } from '../../api/types';
import type { CraDetails } from '../../types/cra';
import './CraHistoryDetail.css';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function monthTitle(month: number, year: number): string {
  const label = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
    .format(new Date(year, month - 1, 1));
  return capitalize(label);
}

export function coveredPeriod(month: number, year: number): string {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const fmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${fmt.format(first)} – ${fmt.format(last)}`;
}

function nameOr(
  first: string | null | undefined,
  last: string | null | undefined,
): string {
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
  onBack: () => void;
}

export function CraHistoryDetail({ craId, onBack }: Props) {
  const [cra, setCra] = useState<CraDetailsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [reopening, setReopening] = useState(false);
  const [reopenError, setReopenError] = useState<string | null>(null);

  const load = (id: number) => {
    setLoading(true);
    setError(null);
    setCra(null);
    getCra(id)
      .then(dto => {
        setCra(dto);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err));
        setLoading(false);
      });
  };

  useEffect(() => {
    if (craId !== null) load(craId);
  }, [craId]);

  const handleReopen = () => {
    if (!cra) return;
    if (!window.confirm('Réouvrir ce CRA invalidera les signatures existantes et le remettra en brouillon. Continuer ?')) return;
    setReopening(true);
    setReopenError(null);
    reopenCra(cra.id)
      .then(() => load(cra.id))
      .catch((err: unknown) => { setReopenError(getErrorMessage(err)); })
      .finally(() => { setReopening(false); });
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
      .catch((err: unknown) => {
        setDownloadError(getErrorMessage(err));
      })
      .finally(() => { setDownloading(false); });
  };

  if (craId === null) {
    return (
      <div className="cra-detail">
        <p className="cra-detail__missing">Aucun CRA sélectionné.</p>
      </div>
    );
  }

  return (
    <div className="cra-detail">
      {loading && <LoadingSkeleton />}

      {error && !loading && (
        <div>
          <div role="alert" className="cra-detail__error">
            <span className="cra-detail__error-icon" aria-hidden="true">⚠</span>
            <span>{error}</span>
          </div>
          <button onClick={() => load(craId)}>Réessayer</button>
        </div>
      )}

      {!loading && !error && cra && (
        <>
          <header className="cra-detail__header">
            <h1 className="cra-detail__title">{monthTitle(cra.month, cra.year)}</h1>
            <p className="cra-detail__period">{coveredPeriod(cra.month, cra.year)}</p>
          </header>

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
                  <span
                    className={`cra-detail__badge cra-detail__badge--${cra.status.toLowerCase()}`}
                  >
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

      <div className="cra-detail__actions">
        <button className="cra-detail__btn" onClick={onBack}>
          ← Retour à l'historique
        </button>
        {cra?.status === 'VALIDATED' && (
          <button
            className="cra-detail__btn cra-detail__btn--download"
            onClick={handleDownload}
            disabled={downloading}
            aria-label="Télécharger le PDF"
          >
            {downloading ? 'Téléchargement…' : 'Télécharger PDF'}
          </button>
        )}
        {cra && cra.status !== 'DRAFT' && (
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
    </div>
  );
}
