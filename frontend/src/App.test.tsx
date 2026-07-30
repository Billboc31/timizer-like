import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import App from './App';
import * as craClient from './api/craClient';
import type { CraDetailsDto, CraSummaryDto } from './api/types';

vi.mock('./api/craClient');

afterEach(cleanup);

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
  it('clicking Open on a history entry transitions to detail view', async () => {
    vi.mocked(craClient.listCras).mockResolvedValue([HISTORY_SUMMARY]);
    vi.mocked(craClient.getCra).mockResolvedValue(HISTORY_DETAILS);

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'History' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Open CRA for June 2026' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open CRA for June 2026' }));

    await waitFor(() => expect(craClient.getCra).toHaveBeenCalledWith(HISTORY_SUMMARY.id));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument(),
    );
  });

  it('clicking back from detail returns to the history list', async () => {
    vi.mocked(craClient.listCras).mockResolvedValue([HISTORY_SUMMARY]);
    vi.mocked(craClient.getCra).mockResolvedValue(HISTORY_DETAILS);

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'History' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Open CRA for June 2026' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open CRA for June 2026' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /retour/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Open CRA for June 2026' })).toBeInTheDocument(),
    );
  });
});

describe('App — D1: getCra on open', () => {
  it('calls getCra when a CRA is opened via CraOverview', async () => {
    vi.mocked(craClient.listCras).mockResolvedValue([SUMMARY]);
    vi.mocked(craClient.getCra).mockResolvedValue(DETAILS);

    render(<App />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Ouvrir le CRA de Juillet 2026' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le CRA de Juillet 2026' }));

    await waitFor(() => expect(craClient.getCra).toHaveBeenCalledWith(1));
  });

  it('CalendarGrid renders real day data after opening a CRA', async () => {
    vi.mocked(craClient.listCras).mockResolvedValue([SUMMARY]);
    vi.mocked(craClient.getCra).mockResolvedValue(DETAILS);

    render(<App />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Ouvrir le CRA de Juillet 2026' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le CRA de Juillet 2026' }));

    await waitFor(() =>
      expect(screen.getAllByTestId('day-cell').length).toBeGreaterThan(0),
    );
  });

  it('shows loading state while CRA details are being fetched', async () => {
    vi.mocked(craClient.listCras).mockResolvedValue([SUMMARY]);
    let resolveGetCra!: (v: CraDetailsDto) => void;
    vi.mocked(craClient.getCra).mockReturnValue(
      new Promise(r => { resolveGetCra = r; }),
    );

    render(<App />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Ouvrir le CRA de Juillet 2026' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le CRA de Juillet 2026' }));

    expect(screen.getByTestId('summary-loading')).toBeInTheDocument();

    resolveGetCra(DETAILS);
    await waitFor(() =>
      expect(screen.queryByTestId('summary-loading')).not.toBeInTheDocument(),
    );
  });

  it('shows error state when getCra fails', async () => {
    vi.mocked(craClient.listCras).mockResolvedValue([SUMMARY]);
    vi.mocked(craClient.getCra).mockRejectedValue(new Error('Not found'));

    render(<App />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Ouvrir le CRA de Juillet 2026' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le CRA de Juillet 2026' }));

    await waitFor(() =>
      expect(screen.getByTestId('summary-error')).toBeInTheDocument(),
    );
  });
});
