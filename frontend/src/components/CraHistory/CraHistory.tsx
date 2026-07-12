import { useEffect, useState } from 'react';
import { listCras, downloadCraPdf } from '../../api/cra';
import type { CraSummaryDto } from '../../types/cra';
import './CraHistory.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  onOpen: (cra: CraSummaryDto) => void;
}

export function CraHistory({ onOpen }: Props) {
  const [cras, setCras] = useState<CraSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    listCras()
      .then(data => {
        setCras(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load CRA history');
        setLoading(false);
      });
  }, []);

  const handleDownloadPdf = (cra: CraSummaryDto) => {
    setDownloading(cra.id);
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
        setError(err instanceof Error ? err.message : 'Failed to download PDF');
      })
      .finally(() => { setDownloading(null); });
  };

  if (loading) return <p className="cra-history__status">Loading...</p>;
  if (error) return <p className="cra-history__status cra-history__status--error" role="alert">{error}</p>;

  if (cras.length === 0) {
    return <p className="cra-history__status cra-history__status--empty">No CRA records found.</p>;
  }

  return (
    <div className="cra-history">
      <table className="cra-history__table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Status</th>
            <th>Worked Days</th>
            <th>Validation Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cras.map(cra => (
            <tr key={cra.id} className="cra-history__row">
              <td>{MONTH_NAMES[cra.month - 1]} {cra.year}</td>
              <td>{cra.status}</td>
              <td>{cra.totalWorkedDays}</td>
              <td>{cra.validationDate ?? '—'}</td>
              <td className="cra-history__actions">
                <button onClick={() => { onOpen(cra); }}>Open</button>
                {cra.status === 'VALIDATED' && (
                  <button
                    onClick={() => { handleDownloadPdf(cra); }}
                    disabled={downloading === cra.id}
                  >
                    {downloading === cra.id ? 'Downloading...' : 'Download PDF'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
