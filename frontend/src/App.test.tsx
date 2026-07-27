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
};

describe('App — D1: getCra on open', () => {
  it('calls getCra when a CRA is opened via CraMonthSelector', async () => {
    vi.mocked(craClient.listCras).mockResolvedValue([SUMMARY]);
    vi.mocked(craClient.getCra).mockResolvedValue(DETAILS);

    render(<App />);

    await waitFor(() => expect(screen.getByText('Open CRA')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Open CRA'));

    await waitFor(() => expect(craClient.getCra).toHaveBeenCalledWith(1));
  });

  it('CalendarGrid renders real day data after opening a CRA', async () => {
    vi.mocked(craClient.listCras).mockResolvedValue([SUMMARY]);
    vi.mocked(craClient.getCra).mockResolvedValue(DETAILS);

    render(<App />);

    await waitFor(() => expect(screen.getByText('Open CRA')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Open CRA'));

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

    await waitFor(() => expect(screen.getByText('Open CRA')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Open CRA'));

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

    await waitFor(() => expect(screen.getByText('Open CRA')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Open CRA'));

    await waitFor(() =>
      expect(screen.getByTestId('summary-error')).toBeInTheDocument(),
    );
  });
});
