import { useEffect, useState } from 'react';
import { listCras, downloadCraPdf } from '../../api/craClient';
import { getErrorMessage } from '../../api/errorMessages';
import type { CraStatus, CraSummaryDto } from '../../api/types';
import './CraHistory.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function periodLabel(cra: CraSummaryDto): string {
  return `${MONTH_NAMES[cra.month - 1]} ${cra.year}`;
}

function statusLabel(status: CraStatus): string {
  switch (status) {
    case 'DRAFT': return 'Brouillon';
    case 'READY_FOR_PROVIDER_SIGNATURE': return 'En attente prestataire';
    case 'SIGNED_BY_PROVIDER': return 'Signé prestataire';
    case 'AWAITING_CLIENT_SIGNATURE': return 'En attente client';
    case 'FULLY_SIGNED':
    case 'VALIDATED': return 'Signé';
  }
}

function statusBadgeModifier(status: CraStatus): string {
  switch (status) {
    case 'DRAFT': return 'draft';
    case 'READY_FOR_PROVIDER_SIGNATURE': return 'ready-for-provider';
    case 'SIGNED_BY_PROVIDER': return 'signed-by-provider';
    case 'AWAITING_CLIENT_SIGNATURE': return 'awaiting-client';
    case 'FULLY_SIGNED':
    case 'VALIDATED': return 'signed';
  }
}

function isPdfAvailable(status: CraStatus): boolean {
  return status === 'SIGNED_BY_PROVIDER'
    || status === 'AWAITING_CLIENT_SIGNATURE'
    || status === 'FULLY_SIGNED'
    || status === 'VALIDATED';
}

interface Props {
  onOpenDetail: (cra: CraSummaryDto) => void;
}

function LoadingSkeleton() {
  return (
    <ul
      role="list"
      className="cra-history__list"
      aria-label="Loading CRA history"
      aria-busy="true"
    >
      {[1, 2, 3].map(i => (
        <li key={i} className="cra-history__card cra-history__card--skeleton" aria-hidden="true">
          <div className="cra-history__skeleton-block cra-history__skeleton-block--period" />
          <div className="cra-history__skeleton-block cra-history__skeleton-block--badge" />
          <div className="cra-history__skeleton-block cra-history__skeleton-block--days" />
          <div className="cra-history__skeleton-block cra-history__skeleton-block--actions" />
        </li>
      ))}
    </ul>
  );
}

export function CraHistory({ onOpenDetail }: Props) {
  const [cras, setCras] = useState<CraSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const loadCras = (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    listCras({ signal })
      .then(data => {
        const sorted = [...data].sort((a, b) =>
          b.year !== a.year ? b.year - a.year : b.month - a.month,
        );
        setCras(sorted);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(getErrorMessage(err));
        setLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    loadCras(controller.signal);
    return () => { controller.abort(); };
  }, []);

  const handleDownloadPdf = (cra: CraSummaryDto) => {
    setDownloading(cra.id);
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
      .finally(() => { setDownloading(null); });
  };

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div>
        <div role="alert" className="cra-history__error">
          <span className="cra-history__error-icon" aria-hidden="true">⚠</span>
          <span>{error}</span>
        </div>
        <button onClick={() => { loadCras(); }}>Réessayer</button>
      </div>
    );
  }

  if (cras.length === 0) {
    return (
      <div className="cra-history__empty">
        <span className="cra-history__empty-icon" aria-hidden="true">📋</span>
        <p>No CRA records found.</p>
        <p className="cra-history__empty-hint">Submit your first CRA to see it here.</p>
      </div>
    );
  }

  return (
    <div className="cra-history">
      {downloadError && (
        <div role="alert" className="cra-history__error cra-history__error--inline">
          <span className="cra-history__error-icon" aria-hidden="true">⚠</span>
          <span>{downloadError}</span>
        </div>
      )}
      <ul role="list" className="cra-history__list">
        {cras.map(cra => {
          const period = periodLabel(cra);
          const isDownloading = downloading === cra.id;
          return (
            <li key={cra.id} className="cra-history__card">
              <div className="cra-history__card-period">{period}</div>
              <div className="cra-history__card-meta">
                <span
                  className={`cra-history__badge cra-history__badge--${statusBadgeModifier(cra.status)}`}
                >
                  {statusLabel(cra.status)}
                </span>
                <span className="cra-history__days">
                  <span className="cra-history__label" aria-hidden="true">Days: </span>
                  <span>{cra.totalWorkedDays}</span>
                </span>
                <span className="cra-history__validation">
                  <span className="cra-history__label" aria-hidden="true">Validated: </span>
                  <span>
                    {cra.validationDate ?? '—'}
                  </span>
                </span>
              </div>
              <div className="cra-history__card-actions">
                <button
                  className="cra-history__btn"
                  onClick={() => { onOpenDetail(cra); }}
                  disabled={isDownloading}
                  aria-label={`Open CRA for ${period}`}
                >
                  Open
                </button>
                {isPdfAvailable(cra.status) && (
                  <button
                    className="cra-history__btn cra-history__btn--download"
                    onClick={() => { handleDownloadPdf(cra); }}
                    disabled={isDownloading}
                    aria-label={`Download PDF for ${period}`}
                  >
                    {isDownloading ? 'Downloading…' : 'Download PDF'}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
