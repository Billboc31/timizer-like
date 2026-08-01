import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import App from './App';
import * as craClient from './api/craClient';
import type { CraDetailsDto, CraSummaryDto } from './api/types';

vi.mock('./api/craClient');

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
});

const SUMMARY: CraSummaryDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 20,
  status: 'DRAFT',
  validationDate: null,
  clientSignatureDate: null,
};

const DETAILS: CraDetailsDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 20,
  status: 'DRAFT',
  days: [{ day: 1, worked: 1, note: null }],
  validationDate: null,
  providerSignatureDate: null,
  providerFirstName: null,
  providerLastName: null,
  providerCompany: null,
  clientFirstName: null,
  clientLastName: null,
  clientCompany: null,
  clientContactFirstName: null,
  clientContactLastName: null,
  clientSignatureDate: null,
};

const HISTORY_SUMMARY: CraSummaryDto = {
  id: 2,
  month: 6,
  year: 2026,
  totalWorkedDays: 21,
  status: 'VALIDATED',
  validationDate: '2026-07-01',
  clientSignatureDate: null,
};

const HISTORY_DETAILS: CraDetailsDto = {
  id: 2,
  month: 6,
  year: 2026,
  totalWorkedDays: 21,
  status: 'VALIDATED',
  days: [{ day: 1, worked: 1, note: null }],
  validationDate: '2026-07-01',
  providerSignatureDate: '2026-07-01',
  providerFirstName: 'Jean',
  providerLastName: 'Dupont',
  providerCompany: null,
  clientFirstName: null,
  clientLastName: null,
  clientCompany: null,
  clientContactFirstName: null,
  clientContactLastName: null,
  clientSignatureDate: null,
};

describe('App — D2: history-detail navigation', () => {
  it('clicking Open on a history entry opens the CRA detail modal', async () => {
    vi.mocked(craClient.listCras).mockResolvedValue([HISTORY_SUMMARY]);
    vi.mocked(craClient.getCra).mockResolvedValue(HISTORY_DETAILS);

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'History' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Open CRA for June 2026' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open CRA for June 2026' }));

    await waitFor(() => expect(craClient.getCra).toHaveBeenCalledWith(HISTORY_SUMMARY.id));
    expect(document.querySelector('dialog[open]')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument(),
    );
    expect(screen.queryByRole('button', { name: /retour/i })).not.toBeInTheDocument();
  });

  it('closing the CRA detail modal returns to the history list', async () => {
    vi.mocked(craClient.listCras).mockResolvedValue([HISTORY_SUMMARY]);
    vi.mocked(craClient.getCra).mockResolvedValue(HISTORY_DETAILS);

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'History' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Open CRA for June 2026' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open CRA for June 2026' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));

    await waitFor(() =>
      expect(document.querySelector('dialog[open]')).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Open CRA for June 2026' })).toBeInTheDocument();
  });
});

describe('App — D1: getCra on open', () => {
  it('calls getCra automatically for CRAs in the displayed year', async () => {
    vi.mocked(craClient.listCras).mockResolvedValue([SUMMARY]);
    vi.mocked(craClient.getCra).mockResolvedValue(DETAILS);

    render(<App />);

    // AnnualCalendar auto-fetches details for any CRA in the displayed year
    await waitFor(() => expect(craClient.getCra).toHaveBeenCalledWith(1));
  });

  it('clicking a month card opens the CRA detail modal with calendar data', async () => {
    vi.mocked(craClient.listCras).mockResolvedValue([SUMMARY]);
    vi.mocked(craClient.getCra).mockResolvedValue(DETAILS);

    render(<App />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Juillet 2026 — 1 jour(s) travaillé(s)' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Juillet 2026 — 1 jour(s) travaillé(s)' }));

    expect(document.querySelector('dialog[open]')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getAllByTestId('day-cell').length).toBeGreaterThan(0),
    );
  });

  it('shows loading state in modal while CRA details are being fetched', async () => {
    vi.mocked(craClient.listCras).mockResolvedValue([SUMMARY]);
    let resolveGetCra!: (v: CraDetailsDto) => void;
    // First call: AnnualCalendar auto-fetch resolves immediately so the card renders
    // Second call: modal fetch stays pending to test the loading state
    vi.mocked(craClient.getCra)
      .mockResolvedValueOnce(DETAILS)
      .mockReturnValueOnce(new Promise(r => { resolveGetCra = r; }));

    render(<App />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Juillet 2026 — 1 jour(s) travaillé(s)' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Juillet 2026 — 1 jour(s) travaillé(s)' }));

    expect(screen.getByLabelText(/chargement du cra/i)).toBeInTheDocument();

    resolveGetCra(DETAILS);
    await waitFor(() =>
      expect(screen.queryByLabelText(/chargement du cra/i)).not.toBeInTheDocument(),
    );
  });

  it('shows error state in modal when getCra fails', async () => {
    vi.mocked(craClient.listCras).mockResolvedValue([SUMMARY]);
    // First call: AnnualCalendar auto-fetch resolves so the card renders
    // Second call: modal fetch fails to test the error state
    vi.mocked(craClient.getCra)
      .mockResolvedValueOnce(DETAILS)
      .mockRejectedValueOnce(new Error('Not found'));

    render(<App />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Juillet 2026 — 1 jour(s) travaillé(s)' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Juillet 2026 — 1 jour(s) travaillé(s)' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument(),
    );
    expect(document.querySelector('dialog[open]')).toBeInTheDocument();
  });
});
