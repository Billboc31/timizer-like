import { render, screen, waitFor, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CraMonthSelector } from './CraMonthSelector';
import * as craApi from '../../api/craClient';
import type { CraSummaryDto } from '../../types/cra';
import type { CraDetailsDto } from '../../api/types';

vi.mock('../../api/craClient');

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const JULY_2026: CraSummaryDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 20,
  status: 'DRAFT',
  validationDate: null,
};

const JULY_2026_DETAILS: CraDetailsDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 20,
  status: 'DRAFT',
  validationDate: null,
  providerSignatureDate: null,
  days: [],
};

/** Navigate to a specific period via the jump dialog. Requires the navigator to be rendered. */
function jumpToPeriod(month: number, year: number) {
  fireEvent.click(screen.getByRole('button', { name: /\w+ \d{4}/ }));
  fireEvent.change(screen.getByLabelText('Month'), { target: { value: String(month) } });
  fireEvent.change(screen.getByLabelText('Year'), { target: { value: String(year) } });
  fireEvent.click(screen.getByRole('button', { name: /^go$/i }));
}

describe('CraMonthSelector', () => {
  it('renders loading indicator while fetching', () => {
    vi.mocked(craApi.listCras).mockReturnValue(new Promise(() => {}));
    render(<CraMonthSelector onOpen={vi.fn()} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error with retry button when listCras fails', async () => {
    vi.mocked(craApi.listCras).mockRejectedValue(new Error('Network error'));
    render(<CraMonthSelector onOpen={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Une erreur est survenue. Veuillez réessayer.'),
    );
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
  });

  it('retries list load when Réessayer is clicked', async () => {
    vi.mocked(craApi.listCras)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce([]);
    render(<CraMonthSelector onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Create CRA' })).toBeInTheDocument());
  });

  it('renders the period navigator after loading', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([]);
    render(<CraMonthSelector onOpen={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\w+ \d{4}/ })).toBeInTheDocument();
  });

  it('shows "Create CRA" button when no CRA exists for the period', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([]);
    render(<CraMonthSelector onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Create CRA')).toBeInTheDocument());
  });

  it('shows "Open CRA" button when a CRA exists for July 2026', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([JULY_2026]);
    render(<CraMonthSelector onOpen={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument(),
    );
    jumpToPeriod(7, 2026);
    expect(screen.getByText('Open CRA')).toBeInTheDocument();
  });

  it('calls onOpen with the existing CRA when "Open CRA" is clicked', async () => {
    const onOpen = vi.fn();
    vi.mocked(craApi.listCras).mockResolvedValue([JULY_2026]);
    render(<CraMonthSelector onOpen={onOpen} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument(),
    );
    jumpToPeriod(7, 2026);
    fireEvent.click(screen.getByText('Open CRA'));
    expect(onOpen).toHaveBeenCalledWith(JULY_2026);
  });

  it('shows success message then calls onOpen after create', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const onOpen = vi.fn();
    vi.mocked(craApi.listCras).mockResolvedValue([]);
    vi.mocked(craApi.createCra).mockResolvedValue(JULY_2026_DETAILS);
    render(<CraMonthSelector onOpen={onOpen} />);
    await act(async () => {}); // flush listCras promise → navigator rendered
    fireEvent.click(screen.getByText('Create CRA'));
    await act(async () => {}); // flush createCra promise → success state
    expect(screen.getByText('CRA créé avec succès.')).toBeInTheDocument();
    expect(onOpen).not.toHaveBeenCalled();
    // Button is disabled during success delay (label may be "Open CRA" since CRA was added to list)
    expect(screen.getByRole('button', { name: /CRA$/ })).toBeDisabled();
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 1, month: 7, year: 2026 }));
    expect(craApi.createCra).toHaveBeenCalled();
  });

  it('shows create error and re-enables button on failure', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([]);
    vi.mocked(craApi.createCra).mockRejectedValue(new Error('Server error'));
    render(<CraMonthSelector onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Create CRA')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Create CRA'));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Une erreur est survenue. Veuillez réessayer.'),
    );
    expect(screen.getByText('Create CRA')).not.toBeDisabled();
  });

  it('updates the period label when navigating via the dialog', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([]);
    render(<CraMonthSelector onOpen={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument(),
    );
    jumpToPeriod(3, 2025);
    expect(screen.getByRole('button', { name: 'March 2025' })).toBeInTheDocument();
  });
});
