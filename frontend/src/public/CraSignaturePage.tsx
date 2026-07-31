import { useEffect, useState } from 'react';
import { getPublicCra } from '../api/craPublicClient';
import { isApiError } from '../api/apiError';
import type { CraPublicView } from '../types/craPublicView';
import { ClientSignatureForm } from '../components/ClientSignatureForm/ClientSignatureForm';
import { SigningSuccessScreen } from '../components/SigningSuccessScreen/SigningSuccessScreen';
import './CraSignaturePage.css';

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
  craId: number;
  month: number;
  year: number;
}

function resolveErrorMessage(err: unknown): string {
  if (isApiError(err)) {
    if (err.code === 'token_already_consumed') {
      return 'Ce lien de signature a déjà été utilisé.';
    }
    if (err.code === 'cra_wrong_status') {
      return 'Ce CRA a déjà été signé ou n\'est plus disponible.';
    }
    return 'Ce lien est invalide ou expiré.';
  }
  return 'Ce lien est invalide, expiré ou déjà utilisé.';
}

function getStatusBadge(status: string): { label: string; badgeClass: string } {
  switch (status) {
    case 'AWAITING_CLIENT_SIGNATURE':
      return { label: 'En attente de votre signature', badgeClass: 'badge badge-warning' };
    case 'FULLY_SIGNED':
      return { label: 'Signé', badgeClass: 'badge badge-success' };
    case 'VALIDATED':
      return { label: 'Validé', badgeClass: 'badge badge-success' };
    default:
      return { label: status, badgeClass: 'badge badge-neutral' };
  }
}

function formatLocalDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDayDate(year: number, month: number, day: number): string {
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatWorked(worked: number): string {
  if (worked === 1) return 'Journée complète';
  if (worked === 0.5) return 'Demi-journée';
  return String(worked);
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
      .catch((err) => {
        if (!cancelled) {
          setError(resolveErrorMessage(err));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="cra-sign-loading" data-testid="loading">
        <div className="cra-sign-spinner" role="status" aria-label="Chargement…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="cra-sign-page">
        <header className="cra-sign-page__header">
          <div className="cra-sign-page__logo">Timizer</div>
          <p className="cra-sign-page__doc-label">Compte Rendu d'Activité</p>
        </header>
        <div className="cra-sign-page__card">
          <div role="alert" data-testid="error" className="cra-sign-error">
            <div className="cra-sign-error__icon" aria-hidden="true">⚠</div>
            <p className="cra-sign-error__message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cra) return null;

  const monthName = MONTH_NAMES[cra.month - 1] ?? String(cra.month);
  const statusBadge = getStatusBadge(cra.status);
  const activeDayEntries = cra.dayEntries.filter((e) => e.worked > 0);

  return (
    <div className="cra-sign-page">
      <header className="cra-sign-page__header">
        <div className="cra-sign-page__logo">Timizer</div>
        <p className="cra-sign-page__doc-label">Compte Rendu d'Activité</p>
      </header>

      <main className="cra-sign-page__card" data-testid="cra-public-view">
        <div className="cra-info-card">
          <div className="cra-info-card__header">
            <h1 className="cra-info-card__title">
              {monthName} {cra.year}
            </h1>
            <span className={statusBadge.badgeClass}>{statusBadge.label}</span>
          </div>

          <div className="cra-info-card__body">
            <div className="cra-info-row">
              <div className="cra-info-item">
                <div className="cra-info-item__label">Prestataire</div>
                <div className="cra-info-item__value">
                  {cra.providerFirstName} {cra.providerLastName}
                </div>
                <div className="cra-info-item__sub">{cra.providerCompany}</div>
              </div>

              <div className="cra-info-item">
                <div className="cra-info-item__label">Client</div>
                <div className="cra-info-item__value">
                  {cra.clientFirstName} {cra.clientLastName}
                </div>
                <div className="cra-info-item__sub">{cra.clientCompany}</div>
              </div>
            </div>

            <div className="cra-info-row">
              <div className="cra-info-item">
                <div className="cra-info-item__label">Jours travaillés</div>
                <div className="cra-total-days" data-testid="total-worked-days">
                  {cra.totalWorkedDays}
                </div>
              </div>

              <div className="cra-info-item">
                <div className="cra-info-item__label">Signé par le prestataire le</div>
                <div className="cra-info-item__value">
                  {formatLocalDate(cra.providerSignatureDate)}
                </div>
              </div>
            </div>

            {activeDayEntries.length > 0 && (
              <div className="cra-days-section">
                <table className="table cra-days-table">
                  <thead>
                    <tr>
                      <th>Jour</th>
                      <th>Travaillé</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDayEntries.map((entry) => (
                      <tr key={entry.day}>
                        <td>{formatDayDate(cra.year, cra.month, entry.day)}</td>
                        <td>{formatWorked(entry.worked)}</td>
                        <td>{entry.note ?? ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {signed ? (
          <SigningSuccessScreen
            signerName={signed.signerName}
            signedAt={signed.signedAt}
            craId={signed.craId}
            month={signed.month}
            year={signed.year}
          />
        ) : (
          <div className="cra-sign-form-card">
            <div className="cra-sign-form-card__header">
              <h2 className="cra-sign-form-card__title">Signer le CRA</h2>
            </div>
            <div className="cra-sign-form-card__body">
              <ClientSignatureForm
                token={token}
                onSuccess={(signerName, signedAt) =>
                  setSigned({ signerName, signedAt, craId: cra.craId, month: cra.month, year: cra.year })
                }
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
