import { useState } from 'react';
import { downloadPublicCraPdf } from '../../api/craPublicClient';
import './SigningSuccessScreen.css';

interface SigningSuccessScreenProps {
  signerName: string;
  signedAt: Date;
  craId: number;
  month: number;
  year: number;
}

export function SigningSuccessScreen({ signerName, signedAt, craId, month, year }: SigningSuccessScreenProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const dateStr = signedAt.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  async function handleDownload() {
    setDownloading(true);
    setDownloadError(null);
    try {
      const blob = await downloadPublicCraPdf(craId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cra-${year}-${String(month).padStart(2, '0')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError('Le téléchargement a échoué. Veuillez réessayer.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div data-testid="signing-success" role="status" className="signing-success">
      <div className="signing-success__icon" aria-hidden="true">✓</div>
      <h2 className="signing-success__title">CRA signé avec succès</h2>
      <p className="signing-success__details">
        Signé par <strong>{signerName}</strong> le {dateStr}.
      </p>
      {downloadError && (
        <p role="alert" className="signing-success__error">{downloadError}</p>
      )}
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        data-testid="download-pdf-button"
        className="btn btn-secondary signing-success__download"
      >
        {downloading ? 'Téléchargement…' : 'Télécharger le CRA signé (PDF)'}
      </button>
    </div>
  );
}
