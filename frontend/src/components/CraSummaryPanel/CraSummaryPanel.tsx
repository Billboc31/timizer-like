import './CraSummaryPanel.css';
import { CraSignatureStatus } from '../CraSignatureStatus/CraSignatureStatus';
import { CraSignatureActions } from '../CraSignatureActions/CraSignatureActions';
import type { CraDetails } from '../../types/cra';
import { SectionHeading } from '../SectionHeading/SectionHeading';
import type { CraDetailsDto } from '../../api/types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  cra: CraDetails | null;
  loading: boolean;
  error: string | null;
  onSuccess?: (updated: CraDetailsDto) => void;
}

export function CraSummaryPanel({ cra, loading, error, onSuccess }: Props) {
  if (loading) {
    return (
      <div className="cra-summary-panel__loading" data-testid="summary-loading">
        Loading summary...
      </div>
    );
  }
  if (error) {
    return (
      <div className="cra-summary-panel__error" data-testid="summary-error" role="alert">
        Error: {error}
      </div>
    );
  }
  if (!cra) return null;

  const period = `${MONTH_NAMES[cra.month - 1]} ${cra.year}`;
  const providerName = [cra.providerFirstName, cra.providerLastName].filter(Boolean).join(' ') || '—';
  const clientName = [cra.clientFirstName, cra.clientLastName].filter(Boolean).join(' ') || '—';

  return (
    <section className="cra-summary-panel" aria-label="CRA Summary">
      <header className="cra-summary-panel__header">
        <SectionHeading title="Compte Rendu d'Activité" />
        <p className="cra-summary-panel__period" data-testid="summary-period">{period}</p>
      </header>
      <div className="cra-summary-panel__hero">
        <strong data-testid="summary-total" className="cra-summary-panel__hero-value">
          {cra.totalWorkedDays}
        </strong>
        <span className="cra-summary-panel__hero-label">Total worked days</span>
      </div>
      <div className="cra-summary-panel__status-row">
        <CraSignatureStatus status={cra.status} data-testid="summary-status" />
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
      {onSuccess && (
        <CraSignatureActions cra={cra} onSuccess={onSuccess} />
      )}
    </section>
  );
}
