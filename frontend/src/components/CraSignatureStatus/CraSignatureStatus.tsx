import './CraSignatureStatus.css';
import type { CraStatus } from '../../api/types';

interface StatusConfig {
  label: string;
  className: string;
}

const STATUS_CONFIG: Record<CraStatus, StatusConfig> = {
  DRAFT: { label: 'Brouillon', className: 'draft' },
  READY_FOR_PROVIDER_SIGNATURE: { label: 'Prêt à signer', className: 'ready' },
  SIGNED_BY_PROVIDER: { label: 'Signé prestataire', className: 'signed-provider' },
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
