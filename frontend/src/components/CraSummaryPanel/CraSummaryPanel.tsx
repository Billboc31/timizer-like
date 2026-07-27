import './CraSummaryPanel.css';
import type { CraDetails } from '../../types/cra';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  cra: CraDetails | null;
  loading: boolean;
  error: string | null;
}

export function CraSummaryPanel({ cra, loading, error }: Props) {
  if (loading) {
    return (
      <div className="cra-summary-panel__loading" data-testid="summary-loading">
        Loading summary...
      </div>
    );
  }
  if (error) {
    return (
      <div className="cra-summary-panel__error" data-testid="summary-error">
        Error: {error}
      </div>
    );
  }
  if (!cra) return null;

  const period = `${MONTH_NAMES[cra.month - 1]} ${cra.year}`;
  const providerName = [cra.providerFirstName, cra.providerLastName].filter(Boolean).join(' ') || '—';
  const clientName = [cra.clientFirstName, cra.clientLastName].filter(Boolean).join(' ') || '—';
  const statusKey = cra.status.toLowerCase() as 'draft' | 'validated';

  return (
    <section className="cra-summary-panel" aria-label="CRA Summary">
      <header className="cra-summary-panel__header">
        <h2 className="cra-summary-panel__title">Compte Rendu d'Activité</h2>
        <p className="cra-summary-panel__period" data-testid="summary-period">{period}</p>
      </header>
      <div className="cra-summary-panel__hero">
        <strong data-testid="summary-total" className="cra-summary-panel__hero-value">
          {cra.totalWorkedDays}
        </strong>
        <span className="cra-summary-panel__hero-label">Total worked days</span>
      </div>
      <div className="cra-summary-panel__status-row">
        <span
          className={`cra-summary-panel__badge cra-summary-panel__badge--${statusKey}`}
          data-testid="summary-status"
        >
          {cra.status}
        </span>
      </div>
      <dl className="cra-summary-panel__meta">
        <div className="cra-summary-panel__meta-item">
          <dt>Provider</dt>
          <dd data-testid="summary-provider">{providerName}</dd>
        </div>
        <div className="cra-summary-panel__meta-item">
          <dt>Provider company</dt>
          <dd data-testid="summary-provider-company">{cra.providerCompany ?? '—'}</dd>
        </div>
        <div className="cra-summary-panel__meta-item">
          <dt>Client</dt>
          <dd data-testid="summary-client">{clientName}</dd>
        </div>
      </dl>
    </section>
  );
}
