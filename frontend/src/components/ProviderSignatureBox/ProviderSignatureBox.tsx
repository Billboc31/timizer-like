import './ProviderSignatureBox.css';
import type { CraDetails } from '../../types/cra';

interface Props {
  cra: CraDetails;
  onSignClick: () => void;
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function ProviderSignatureBox({ cra, onSignClick }: Props) {
  const isSigned = cra.providerSignatureDate !== null;

  if (!isSigned) {
    return (
      <div
        className="provider-signature-box provider-signature-box--empty"
        role="button"
        tabIndex={0}
        aria-label="Cliquer pour signer le CRA"
        onClick={onSignClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSignClick();
          }
        }}
      >
        <span className="provider-signature-box__invite">Cliquez pour signer</span>
      </div>
    );
  }

  const nameParts = [cra.providerFirstName, cra.providerLastName].filter(Boolean);
  const providerName = nameParts.length > 0 ? nameParts.join(' ') : null;

  return (
    <div className="provider-signature-box provider-signature-box--signed">
      <div className="provider-signature-box__footer">
        {providerName && (
          <span className="provider-signature-box__name">{providerName}</span>
        )}
        <span className="provider-signature-box__date">
          {formatDate(cra.providerSignatureDate as string)}
        </span>
      </div>
    </div>
  );
}
