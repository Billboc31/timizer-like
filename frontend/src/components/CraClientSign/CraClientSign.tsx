import { useState, useRef } from 'react';
import { clientSignCra } from '../../api/craClient';
import { getErrorMessage } from '../../api/errorMessages';
import type { CraSummaryDto } from '../../api/types';

interface Props {
  cra: CraSummaryDto;
  onSigned: () => void;
  onCancel: () => void;
}

export function CraClientSign({ cra, onSigned, onCancel }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [name, setName] = useState('');
  const [date, setDate] = useState(today);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageBase64(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] ?? null;
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Le nom du représentant est requis.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await clientSignCra(cra.id, {
        clientRepresentativeName: name.trim(),
        clientSignatureDate: date,
        signatureImageBase64: imageBase64,
      });
      onSigned();
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <dialog open aria-modal="true" aria-labelledby="client-sign-title">
      <h2 id="client-sign-title">Signature client</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="client-sign-name">Nom du représentant</label>
          <input
            id="client-sign-name"
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); }}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="client-sign-date">Date de signature</label>
          <input
            id="client-sign-date"
            type="date"
            value={date}
            onChange={e => { setDate(e.target.value); }}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="client-sign-image">Signature (image, optionnel)</label>
          <input
            id="client-sign-image"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>
        {error && <p role="alert">{error}</p>}
        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Envoi…' : 'Signer'}
          </button>
          <button type="button" onClick={onCancel} disabled={loading}>
            Annuler
          </button>
        </div>
      </form>
    </dialog>
  );
}
