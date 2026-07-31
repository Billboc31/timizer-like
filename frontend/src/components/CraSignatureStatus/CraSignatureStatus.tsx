import './CraSignatureStatus.css';
import type { CraStatus } from '../../api/types';

interface StatusConfig {
  label: string;
  className: string;
}

const STATUS_CONFIG: Record<CraStatus, StatusConfig> = {
  DRAFT: { label: 'Brouillon', className: 'draft' },
  AWAITING_CLIENT_SIGNATURE: { label: 'En attente de signature client', className: 'awaiting-client' },
  VALIDATED: { label: 'Validé', className: 'signed' },
};

interface Props {
  status: CraStatus;
  'data-testid'?: string;
}

export function CraSignatureStatus({ status, 'data-testid': testId }: Props) {
  const { label, className } = STATUS_CONFIG[status];
  return (
    <span
      className={`cra-signature-status cra-signature-status--${className}`}
      data-testid={testId}
    >
      {label}
    </span>
  );
}
