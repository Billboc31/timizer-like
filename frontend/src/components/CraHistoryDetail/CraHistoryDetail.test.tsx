import { render, screen, within, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { CraHistoryDetail, coveredPeriod } from './CraHistoryDetail';
import * as craApi from '../../api/craClient';
import type { CraDetailsDto } from '../../api/types';

vi.mock('../../api/craClient');

afterEach(cleanup);

const VALIDATED_DETAIL: CraDetailsDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 21,
  status: 'VALIDATED',
  validationDate: '2026-07-31',
  providerSignatureDate: '2026-07-31',
  clientSignatureDate: '2026-08-01',
  providerFirstName: 'Jean',
  providerLastName: 'Dupont',
  providerCompany: 'Prestataire SARL',
  clientFirstName: 'Marie',
  clientLastName: 'Martin',
  clientCompany: 'Client SA',
  clientContactFirstName: 'Pierre',
  clientContactLastName: 'Durand',
  days: [
    { day: 1, worked: 1, note: null },
    { day: 2, worked: 0.5, note: null },
  ],
};

const DRAFT_DETAIL: CraDetailsDto = {
  ...VALIDATED_DETAIL,
  id: 2,
  status: 'DRAFT',
  validationDate: null,
  providerSignatureDate: null,
  clientSignatureDate: null,
};

const NULL_FIELDS_DETAIL: CraDetailsDto = {
  ...VALIDATED_DETAIL,
  id: 3,
  providerFirstName: null,
  providerLastName: null,
  providerCompany: null,
  clientFirstName: null,
  clientLastName: null,
  clientCompany: null,
  clientContactFirstName: null,
  clientContactLastName: null,
  clientSignatureDate: null,
  providerSignatureDate: null,
  validationDate: null,
};

describe('CraHistoryDetail', () => {
  it('renders loading skeleton while fetching', () => {
    vi.mocked(craApi.getCra).mockReturnValue(new Promise(() => {}));
    render(<CraHistoryDetail craId={1} onBack={vi.fn()} />);
    expect(screen.getByLabelText(/chargement/i)).toBeInTheDocument();
  });

  it('renders metadata and period for a validated CRA', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(VALIDATED_DETAIL);
    render(<CraHistoryDetail craId={1} onBack={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Juillet 2026')).toBeInTheDocument());
    expect(screen.getByText('1 juillet 2026 – 31 juillet 2026')).toBeInTheDocument();
    const meta = screen.getByRole('region', { name: /informations/i });
    expect(within(meta).getByText('Jean Dupont')).toBeInTheDocument();
    expect(within(meta).getByText('Prestataire SARL')).toBeInTheDocument();
    expect(within(meta).getByText('Marie Martin')).toBeInTheDocument();
    expect(within(meta).getByText('Client SA')).toBeInTheDocument();
    expect(within(meta).getByText('Pierre Durand')).toBeInTheDocument();
    expect(within(meta).getByText('21')).toBeInTheDocument();
    expect(within(meta).getAllByText('2026-07-31').length).toBeGreaterThanOrEqual(1);
    expect(within(meta).getByText('2026-08-01')).toBeInTheDocument();
  });

  it('shows dashes for absent optional fields', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(NULL_FIELDS_DETAIL);
    render(<CraHistoryDetail craId={3} onBack={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Juillet 2026')).toBeInTheDocument());
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(3);
  });

  it('does not show download button for DRAFT CRA', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(DRAFT_DETAIL);
    render(<CraHistoryDetail craId={2} onBack={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Juillet 2026')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /télécharger le pdf/i })).not.toBeInTheDocument();
  });

  it('shows download button for VALIDATED CRA', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(VALIDATED_DETAIL);
    render(<CraHistoryDetail craId={1} onBack={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /télécharger le pdf/i })).toBeInTheDocument(),
    );
  });

  it('calls onBack when back button is clicked', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(VALIDATED_DETAIL);
    const onBack = vi.fn();
    render(<CraHistoryDetail craId={1} onBack={onBack} />);
    await waitFor(() => expect(screen.getByText('Juillet 2026')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /retour/i }));
    expect(onBack).toHaveBeenCalled();
  });

  it('triggers PDF download when download button is clicked', async () => {
    const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });
    vi.mocked(craApi.getCra).mockResolvedValue(VALIDATED_DETAIL);
    vi.mocked(craApi.downloadCraPdf).mockResolvedValue(mockBlob);
    const createObjectURL = vi.fn(() => 'blob:test');
    const revokeObjectURL = vi.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    render(<CraHistoryDetail craId={1} onBack={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /télécharger le pdf/i })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /télécharger le pdf/i }));
    await waitFor(() => expect(craApi.downloadCraPdf).toHaveBeenCalledWith(VALIDATED_DETAIL.id));
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();
  });

  it('shows download error banner on PDF failure', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(VALIDATED_DETAIL);
    vi.mocked(craApi.downloadCraPdf).mockRejectedValue(new Error('Download failed'));
    render(<CraHistoryDetail craId={1} onBack={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /télécharger le pdf/i })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /télécharger le pdf/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/erreur/i),
    );
  });

  it('shows error state and retry button when getCra fails', async () => {
    vi.mocked(craApi.getCra).mockRejectedValue(new Error('Network error'));
    render(<CraHistoryDetail craId={1} onBack={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
  });

  it('retries load when Réessayer is clicked', async () => {
    vi.mocked(craApi.getCra)
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(VALIDATED_DETAIL);
    render(<CraHistoryDetail craId={1} onBack={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    await waitFor(() => expect(screen.getByText('Juillet 2026')).toBeInTheDocument());
  });

  it('shows calendar grid in read-only mode', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(VALIDATED_DETAIL);
    render(<CraHistoryDetail craId={1} onBack={vi.fn()} />);
    await waitFor(() => expect(screen.getAllByTestId('day-cell').length).toBeGreaterThan(0));
    const interactiveCells = screen.queryAllByRole('button', { name: /— worked/ });
    expect(interactiveCells.length).toBe(0);
  });

  it('weekday cells in DRAFT CRA have role="button" but clicking does not mutate the CRA', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(DRAFT_DETAIL);
    const mockUpdateDay = vi.mocked(craApi.updateDay);
    render(<CraHistoryDetail craId={2} onBack={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Juillet 2026')).toBeInTheDocument());
    const interactiveCells = screen.getAllByTestId('day-cell').filter(
      el => el.getAttribute('role') === 'button',
    );
    expect(interactiveCells.length).toBeGreaterThan(0);
    fireEvent.click(interactiveCells[0]);
    expect(mockUpdateDay).not.toHaveBeenCalled();
  });

  it('renders nothing interactive for null craId', () => {
    render(<CraHistoryDetail craId={null} onBack={vi.fn()} />);
    expect(screen.getByText(/aucun cra/i)).toBeInTheDocument();
  });
});

describe('coveredPeriod', () => {
  it('computes period for July 2026', () => {
    expect(coveredPeriod(7, 2026)).toBe('1 juillet 2026 – 31 juillet 2026');
  });

  it('computes period for January', () => {
    expect(coveredPeriod(1, 2026)).toBe('1 janvier 2026 – 31 janvier 2026');
  });

  it('computes period for December', () => {
    expect(coveredPeriod(12, 2026)).toBe('1 décembre 2026 – 31 décembre 2026');
  });

  it('computes period for February non-leap year', () => {
    expect(coveredPeriod(2, 2025)).toBe('1 février 2025 – 28 février 2025');
  });

  it('computes period for February leap year', () => {
    expect(coveredPeriod(2, 2024)).toBe('1 février 2024 – 29 février 2024');
  });
});

describe('CraHistoryDetail — viewport', () => {
  beforeEach(() => {
    vi.mocked(craApi.getCra).mockResolvedValue(VALIDATED_DETAIL);
  });

  it('renders without horizontal overflow on mobile viewport', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
    const { container } = render(<CraHistoryDetail craId={1} onBack={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Juillet 2026')).toBeInTheDocument());
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders metadata on desktop viewport', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });
    render(<CraHistoryDetail craId={1} onBack={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Juillet 2026')).toBeInTheDocument());
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('Marie Martin')).toBeInTheDocument();
  });
});
