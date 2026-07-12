import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CraMonthSelector } from './CraMonthSelector';
import * as craApi from '../../api/cra';
import type { CraSummaryDto, CraDetailsDto } from '../../types/cra';

vi.mock('../../api/cra');

afterEach(cleanup);

const JULY_2026: CraSummaryDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 20,
  status: 'DRAFT',
};

const JULY_2026_DETAILS: CraDetailsDto = {
  ...JULY_2026,
  days: [],
  validationDate: null,
  providerSignatureDate: null,
};

describe('CraMonthSelector', () => {
  it('renders loading indicator while fetching', () => {
    vi.mocked(craApi.listCras).mockReturnValue(new Promise(() => {}));
    render(<CraMonthSelector onOpen={vi.fn()} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error when listCras fails', async () => {
    vi.mocked(craApi.listCras).mockRejectedValue(new Error('Network error'));
    render(<CraMonthSelector onOpen={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Network error'),
    );
  });

  it('renders month select and year input after loading', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([]);
    render(<CraMonthSelector onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByLabelText('Month')).toBeInTheDocument());
    expect(screen.getByLabelText('Year')).toBeInTheDocument();
  });

  it('shows "Create CRA" button when no CRA exists for the period', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([]);
    render(<CraMonthSelector onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Create CRA')).toBeInTheDocument());
  });

  it('shows "Open CRA" button when a CRA exists for the current period (July 2026)', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([JULY_2026]);
    render(<CraMonthSelector onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByLabelText('Month')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2026' } });
    await waitFor(() => expect(screen.getByText('Open CRA')).toBeInTheDocument());
  });

  it('calls onOpen with the existing CRA when "Open CRA" is clicked', async () => {
    const onOpen = vi.fn();
    vi.mocked(craApi.listCras).mockResolvedValue([JULY_2026]);
    render(<CraMonthSelector onOpen={onOpen} />);
    await waitFor(() => expect(screen.getByLabelText('Month')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2026' } });
    await waitFor(() => fireEvent.click(screen.getByText('Open CRA')));
    expect(onOpen).toHaveBeenCalledWith(JULY_2026);
  });

  it('calls createCra then onOpen when "Create CRA" is clicked', async () => {
    const onOpen = vi.fn();
    vi.mocked(craApi.listCras).mockResolvedValue([]);
    vi.mocked(craApi.createCra).mockResolvedValue(JULY_2026_DETAILS);
    render(<CraMonthSelector onOpen={onOpen} />);
    await waitFor(() => expect(screen.getByText('Create CRA')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Create CRA'));
    await waitFor(() => expect(onOpen).toHaveBeenCalled());
    expect(craApi.createCra).toHaveBeenCalled();
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 1, month: 7, year: 2026 }));
  });

  it('shows create error and re-enables button on failure', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([]);
    vi.mocked(craApi.createCra).mockRejectedValue(new Error('Server error'));
    render(<CraMonthSelector onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Create CRA')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Create CRA'));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Server error'),
    );
    expect(screen.getByText('Create CRA')).not.toBeDisabled();
  });

  it('displays the selected period as a formatted label', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([]);
    render(<CraMonthSelector onOpen={vi.fn()} />);
    await waitFor(() => expect(screen.getByLabelText('Month')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2025' } });
    expect(screen.getByText('March 2025')).toBeInTheDocument();
  });
});
