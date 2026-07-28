import './CraSignatureStatus.css';
import type { CraStatus } from '../../api/types';

interface StatusConfig {
  label: string;
  className: string;
}

const STATUS_CONFIG: Record<CraStatus, StatusConfig> = {
  DRAFT: { label: 'Brouillon', className: 'draft' },
  READY_FOR_PROVIDER_SIGNATURE: { label: 'En attente de signature prestataire', className: 'ready-for-provider' },
  SIGNED_BY_PROVIDER: { label: 'Signé par le prestataire', className: 'signed-by-provider' },
  AWAITING_CLIENT_SIGNATURE: { label: 'En attente de signature client', className: 'awaiting-client' },
  FULLY_SIGNED: { label: 'Signé', className: 'signed' },
  VALIDATED: { label: 'Signé', className: 'signed' },
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
