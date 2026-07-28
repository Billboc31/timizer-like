import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CraHistory } from './CraHistory';
import * as craApi from '../../api/craClient';
import type { CraSummaryDto } from '../../api/types';

vi.mock('../../api/craClient');

afterEach(cleanup);

const DRAFT_CRA: CraSummaryDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 20,
  status: 'DRAFT',
  validationDate: null,
};

const VALIDATED_CRA: CraSummaryDto = {
  id: 2,
  month: 6,
  year: 2026,
  totalWorkedDays: 21,
  status: 'VALIDATED',
  validationDate: '2026-07-01',
};

const OLDER_CRA: CraSummaryDto = {
  id: 3,
  month: 5,
  year: 2026,
  totalWorkedDays: 18,
  status: 'DRAFT',
  validationDate: null,
};

const READY_CRA: CraSummaryDto = {
  id: 4,
  month: 4,
  year: 2026,
  totalWorkedDays: 15,
  status: 'READY_FOR_PROVIDER_SIGNATURE',
  validationDate: null,
};

const SIGNED_PROVIDER_CRA: CraSummaryDto = {
  id: 5,
  month: 3,
  year: 2026,
  totalWorkedDays: 22,
  status: 'SIGNED_BY_PROVIDER',
  validationDate: null,
};

const AWAITING_CLIENT_CRA: CraSummaryDto = {
  id: 6,
  month: 2,
  year: 2026,
  totalWorkedDays: 18,
  status: 'AWAITING_CLIENT_SIGNATURE',
  validationDate: null,
};

const FULLY_SIGNED_CRA: CraSummaryDto = {
  id: 7,
  month: 1,
  year: 2026,
  totalWorkedDays: 20,
  status: 'FULLY_SIGNED',
  validationDate: null,
};

describe('CraHistory', () => {
  it('renders loading skeleton while fetching', () => {
    vi.mocked(craApi.listCras).mockReturnValue(new Promise(() => {}));
    render(<CraHistory onOpen={vi.fn()} />);
    expect(screen.getByRole('list', { name: /loading/i })).toBeInTheDocument();
  });

  it('renders error with retry button when listCras fails', async () => {
    vi.mocked(craApi.listCras).mockRejectedValue(new Error('Network error'));
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Une erreur est survenue. Veuillez réessayer.'),
    );
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
  });

  it('retries list load when Réessayer is clicked', async () => {
    vi.mocked(craApi.listCras)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce([]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    await waitFor(() =>
      expect(screen.getByText('No CRA records found.')).toBeInTheDocument(),
    );
  });

  it('renders empty state when no CRAs exist', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByText('No CRA records found.')).toBeInTheDocument(),
    );
  });

  it('renders CRA cards with period, status label, and worked days', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([DRAFT_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('July 2026')).toBeInTheDocument());
    expect(screen.getByText('Brouillon')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('shows validation date when available', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([VALIDATED_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('2026-07-01')).toBeInTheDocument());
  });

  it('shows dash when validation date is null', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([DRAFT_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('—')).toBeInTheDocument());
  });

  it('calls onOpen when Open button is clicked', async () => {
    const onOpen = vi.fn();
    vi.mocked(craApi.listCras).mockResolvedValue([DRAFT_CRA]);
    render(<CraHistory onOpen={onOpen} />);
    await waitFor(() => expect(screen.getByText('Open')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Open'));
    expect(onOpen).toHaveBeenCalledWith(DRAFT_CRA);
  });

  it('does not show Download PDF button for DRAFT CRA', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([DRAFT_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Open')).toBeInTheDocument());
    expect(screen.queryByText('Download PDF')).not.toBeInTheDocument();
  });

  it('does not show Download PDF button for READY_FOR_PROVIDER_SIGNATURE CRA', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([READY_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Open')).toBeInTheDocument());
    expect(screen.queryByText('Download PDF')).not.toBeInTheDocument();
  });

  it('shows Download PDF button for SIGNED_BY_PROVIDER CRA', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([SIGNED_PROVIDER_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Download PDF')).toBeInTheDocument());
  });

  it('shows Download PDF button for AWAITING_CLIENT_SIGNATURE CRA', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([AWAITING_CLIENT_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Download PDF')).toBeInTheDocument());
  });

  it('shows Download PDF button for FULLY_SIGNED CRA', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([FULLY_SIGNED_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Download PDF')).toBeInTheDocument());
  });

  it('shows Download PDF button for VALIDATED CRA', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([VALIDATED_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Download PDF')).toBeInTheDocument());
  });

  it('shows "Signé" badge for VALIDATED CRA with signed class', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([VALIDATED_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => {
      const badge = screen.getByText('Signé');
      expect(badge).toHaveClass('cra-history__badge--signed');
    });
  });

  it('shows "Brouillon" badge for DRAFT CRA with draft class', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([DRAFT_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => {
      const badge = screen.getByText('Brouillon');
      expect(badge).toHaveClass('cra-history__badge--draft');
    });
  });

  it('shows correct label for READY_FOR_PROVIDER_SIGNATURE', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([READY_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => {
      const badge = screen.getByText('En attente prestataire');
      expect(badge).toHaveClass('cra-history__badge--ready-for-provider');
    });
  });

  it('shows correct label for SIGNED_BY_PROVIDER', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([SIGNED_PROVIDER_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => {
      const badge = screen.getByText('Signé prestataire');
      expect(badge).toHaveClass('cra-history__badge--signed-by-provider');
    });
  });

  it('shows correct label for AWAITING_CLIENT_SIGNATURE', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([AWAITING_CLIENT_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => {
      const badge = screen.getByText('En attente client');
      expect(badge).toHaveClass('cra-history__badge--awaiting-client');
    });
  });

  it('shows "Signé" label for FULLY_SIGNED', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([FULLY_SIGNED_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => {
      const badge = screen.getByText('Signé');
      expect(badge).toHaveClass('cra-history__badge--signed');
    });
  });

  it('sorts CRAs newest first', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([OLDER_CRA, VALIDATED_CRA, DRAFT_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('July 2026')).toBeInTheDocument());
    const cards = screen.getAllByRole('listitem');
    expect(cards[0]).toHaveTextContent('July 2026');
    expect(cards[1]).toHaveTextContent('June 2026');
    expect(cards[2]).toHaveTextContent('May 2026');
  });

  it('Open button has aria-label containing the period', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([DRAFT_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Open CRA for July 2026' }),
      ).toBeInTheDocument(),
    );
  });

  it('Download PDF button has aria-label containing the period', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([VALIDATED_CRA]);
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Download PDF for June 2026' }),
      ).toBeInTheDocument(),
    );
  });

  it('disables Open and Download PDF buttons while PDF is downloading', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([VALIDATED_CRA]);
    vi.mocked(craApi.downloadCraPdf).mockReturnValue(new Promise(() => {}));
    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Download PDF for June 2026' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Download PDF for June 2026' }));
    await waitFor(() => expect(screen.getByText('Downloading…')).toBeDisabled());
    expect(screen.getByRole('button', { name: 'Open CRA for June 2026' })).toBeDisabled();
  });

  it('shows error banner when PDF download fails and keeps list visible', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([VALIDATED_CRA]);
    vi.mocked(craApi.downloadCraPdf).mockRejectedValue(new Error('Download failed'));

    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Download PDF')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Download PDF'));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Une erreur est survenue. Veuillez réessayer.'),
    );
    expect(screen.getByText('June 2026')).toBeInTheDocument();
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
  });

  it('triggers PDF download when Download PDF is clicked', async () => {
    const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });
    vi.mocked(craApi.listCras).mockResolvedValue([VALIDATED_CRA]);
    vi.mocked(craApi.downloadCraPdf).mockResolvedValue(mockBlob);

    const createObjectURL = vi.fn(() => 'blob:test');
    const revokeObjectURL = vi.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Download PDF')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Download PDF'));

    await waitFor(() => expect(craApi.downloadCraPdf).toHaveBeenCalledWith(VALIDATED_CRA.id));
  });
});
