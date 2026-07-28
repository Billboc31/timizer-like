import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CraSignaturePage } from './CraSignaturePage';
import { getPublicCra } from '../api/craPublicClient';
import type { CraPublicView } from '../types/craPublicView';

vi.mock('../api/craPublicClient', () => ({
  getPublicCra: vi.fn(),
}));

const mockGetPublicCra = vi.mocked(getPublicCra);

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const MOCK_CRA: CraPublicView = {
  month: 7,
  year: 2026,
  providerFirstName: 'Alice',
  providerLastName: 'Durand',
  providerCompany: 'Provider SARL',
  clientFirstName: 'Bob',
  clientLastName: 'Martin',
  clientCompany: 'Client SA',
  clientContactEmail: 'bob@client.example',
  providerSignatureDate: '2026-07-31',
  totalWorkedDays: 20.5,
  dayEntries: [
    { day: 1, worked: 1, note: null },
    { day: 2, worked: 0.5, note: 'demi-journée' },
  ],
};

describe('CraSignaturePage', () => {
  it('renders loading state initially', () => {
    mockGetPublicCra.mockReturnValue(new Promise(() => {}));
    render(<CraSignaturePage token="valid-token" />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders CRA data after successful fetch', async () => {
    mockGetPublicCra.mockResolvedValue(MOCK_CRA);
    render(<CraSignaturePage token="valid-token" />);

    await waitFor(() => expect(screen.getByTestId('cra-public-view')).toBeInTheDocument());

    expect(screen.getByText(/Juillet 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Alice Durand/)).toBeInTheDocument();
    expect(screen.getByText(/Provider SARL/)).toBeInTheDocument();
    expect(screen.getByText(/Bob Martin/)).toBeInTheDocument();
    expect(screen.getByText(/Client SA/)).toBeInTheDocument();
    expect(screen.getByText(/2026-07-31/)).toBeInTheDocument();
    expect(screen.getByTestId('total-worked-days')).toHaveTextContent('20.5');
  });

  it('renders day entries table', async () => {
    mockGetPublicCra.mockResolvedValue(MOCK_CRA);
    render(<CraSignaturePage token="valid-token" />);

    await waitFor(() => expect(screen.getByTestId('cra-public-view')).toBeInTheDocument());

    const rows = screen.getAllByRole('row');
    // 1 header row + 2 data rows
    expect(rows).toHaveLength(3);
  });

  it('renders generic error message on 404', async () => {
    mockGetPublicCra.mockRejectedValue(new Error('Not Found'));
    render(<CraSignaturePage token="bad-token" />);

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Ce lien est invalide, expiré ou déjà utilisé.',
    );
  });

  it('renders generic error message on network error', async () => {
    mockGetPublicCra.mockRejectedValue(new Error('Network error'));
    render(<CraSignaturePage token="any-token" />);

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Ce lien est invalide, expiré ou déjà utilisé.',
    );
  });

  it('calls getPublicCra with the provided token', async () => {
    mockGetPublicCra.mockResolvedValue(MOCK_CRA);
    render(<CraSignaturePage token="my-secret-token" />);

    await waitFor(() => expect(screen.getByTestId('cra-public-view')).toBeInTheDocument());
    expect(mockGetPublicCra).toHaveBeenCalledWith('my-secret-token');
  });
});
