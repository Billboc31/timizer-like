import { useEffect, useState } from 'react';
import { listCras } from '../../api/craClient';
import { getErrorMessage } from '../../api/errorMessages';
import type { CraStatus, CraSummaryDto } from '../../api/types';
import './CraOverview.css';

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
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

interface Props {
  onOpen: (cra: CraSummaryDto) => void;
  onNewCra: () => void;
}

function LoadingSkeleton() {
  return (
    <ul
      role="list"
      className="cra-overview__list"
      aria-label="Loading CRA overview"
      aria-busy="true"
    >
      {[1, 2, 3].map(i => (
        <li key={i} className="cra-overview__card cra-overview__card--skeleton" aria-hidden="true">
          <div className="cra-overview__skeleton-block cra-overview__skeleton-block--period" />
          <div className="cra-overview__skeleton-block cra-overview__skeleton-block--badge" />
          <div className="cra-overview__skeleton-block cra-overview__skeleton-block--days" />
        </li>
      ))}
    </ul>
  );
}

export function CraOverview({ onOpen, onNewCra }: Props) {
  const [cras, setCras] = useState<CraSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div>
        <div role="alert" className="cra-overview__error">
          <span className="cra-overview__error-icon" aria-hidden="true">⚠</span>
          <span>{error}</span>
        </div>
        <button className="cra-overview__btn" onClick={() => { loadCras(); }}>Réessayer</button>
      </div>
    );
  }

  if (cras.length === 0) {
    return (
      <div className="cra-overview__empty">
        <span className="cra-overview__empty-icon" aria-hidden="true">📋</span>
        <p>Aucun CRA trouvé.</p>
        <p className="cra-overview__empty-hint">Créez votre premier CRA pour commencer.</p>
        <button className="cra-overview__btn cra-overview__btn--primary" onClick={onNewCra}>
          Nouveau CRA
        </button>
      </div>
    );
  }

  return (
    <div className="cra-overview">
      <ul role="list" className="cra-overview__list">
        {cras.map(cra => {
          const period = periodLabel(cra);
          return (
            <li key={cra.id} className="cra-overview__card">
              <button
                className="cra-overview__card-inner"
                onClick={() => { onOpen(cra); }}
                aria-label={`Ouvrir le CRA de ${period}`}
              >
                <div className="cra-overview__card-period">{period}</div>
                <div className="cra-overview__card-meta">
                  <span
                    className={`cra-overview__badge cra-overview__badge--${statusBadgeModifier(cra.status)}`}
                  >
                    {statusLabel(cra.status)}
                  </span>
                  <span className="cra-overview__days">
                    <span className="cra-overview__label" aria-hidden="true">Jours : </span>
                    <span>{cra.totalWorkedDays}</span>
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
