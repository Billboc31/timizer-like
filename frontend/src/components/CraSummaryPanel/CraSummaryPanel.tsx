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
  if (loading) return <p data-testid="summary-loading">Loading summary...</p>;
  if (error) return <p data-testid="summary-error">Error: {error}</p>;
  if (!cra) return null;

  const period = `${MONTH_NAMES[cra.month - 1]} ${cra.year}`;
  const providerName = [cra.providerFirstName, cra.providerLastName].filter(Boolean).join(' ') || '—';
  const clientName = [cra.clientFirstName, cra.clientLastName].filter(Boolean).join(' ') || '—';

  return (
    <section aria-label="CRA Summary">
      <dl>
        <div>
          <dt>Period</dt>
          <dd data-testid="summary-period">{period}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd data-testid="summary-status">{cra.status}</dd>
        </div>
        <div>
          <dt>Total worked days</dt>
          <dd data-testid="summary-total">{cra.totalWorkedDays}</dd>
        </div>
        <div>
          <dt>Provider</dt>
          <dd data-testid="summary-provider">{providerName}</dd>
        </div>
        <div>
          <dt>Provider company</dt>
          <dd data-testid="summary-provider-company">{cra.providerCompany ?? '—'}</dd>
        </div>
        <div>
          <dt>Client</dt>
          <dd data-testid="summary-client">{clientName}</dd>
        </div>
      </dl>
    </section>
  );
}
