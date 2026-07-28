import { useEffect, useState } from 'react';
import { getPublicCra } from '../api/craPublicClient';
import type { CraPublicView } from '../types/craPublicView';
import { ClientSignatureForm } from '../components/ClientSignatureForm/ClientSignatureForm';
import { SigningSuccessScreen } from '../components/SigningSuccessScreen/SigningSuccessScreen';

interface CraSignaturePageProps {
  token: string;
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

interface SignedState {
  signerName: string;
  signedAt: Date;
}

export function CraSignaturePage({ token }: CraSignaturePageProps) {
  const [cra, setCra] = useState<CraPublicView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signed, setSigned] = useState<SignedState | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPublicCra(token)
      .then((data) => {
        if (!cancelled) {
          setCra(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Ce lien est invalide, expiré ou déjà utilisé.');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return <div data-testid="loading">Chargement...</div>;
  }

  if (error) {
    return (
      <div role="alert" data-testid="error">
        {error}
      </div>
    );
  }

  if (!cra) return null;

  const monthName = MONTH_NAMES[cra.month - 1] ?? String(cra.month);

  return (
    <main data-testid="cra-public-view">
      <h1>
        CRA — {monthName} {cra.year}
      </h1>

      <section>
        <h2>Prestataire</h2>
        <p>
          {cra.providerFirstName} {cra.providerLastName} — {cra.providerCompany}
        </p>
        <p>Signé le {cra.providerSignatureDate}</p>
      </section>

      <section>
        <h2>Client</h2>
        <p>
          {cra.clientFirstName} {cra.clientLastName} — {cra.clientCompany}
        </p>
      </section>

      <section>
        <h2>Jours travaillés</h2>
        <p data-testid="total-worked-days">Total : {cra.totalWorkedDays}</p>
        <table>
          <thead>
            <tr>
              <th>Jour</th>
              <th>Travaillé</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {cra.dayEntries.map((entry) => (
              <tr key={entry.day}>
                <td>{entry.day}</td>
                <td>{entry.worked}</td>
                <td>{entry.note ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        {signed ? (
          <SigningSuccessScreen signerName={signed.signerName} signedAt={signed.signedAt} />
        ) : (
          <ClientSignatureForm
            token={token}
            onSuccess={(signerName, signedAt) => setSigned({ signerName, signedAt })}
          />
        )}
      </section>
    </main>
  );
}
