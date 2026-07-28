import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CalendarGrid } from './CalendarGrid';
import { updateDay } from '../../api/craClient';
import type { CraDetails } from '../../types/cra';
import type { CraDetailsDto } from '../../api/types';

vi.mock('../../api/craClient', () => ({
  updateDay: vi.fn(),
}));

const mockUpdateDay = vi.mocked(updateDay);

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const JULY_2026: CraDetails = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 0,
  status: 'DRAFT',
  days: [],
  providerSignatureDate: null,
};

const JULY_2026_DTO: CraDetailsDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 0,
  status: 'DRAFT',
  days: [],
  validationDate: null,
  providerSignatureDate: null,
};

describe('CalendarGrid', () => {
  it('renders 31 cells for July 2026', () => {
    render(<CalendarGrid cra={JULY_2026} loading={false} error={null} />);
    expect(screen.getAllByTestId('day-cell')).toHaveLength(31);
  });

  it('renders 28 cells for February 2026', () => {
    const FEB_2026: CraDetails = { ...JULY_2026, month: 2, year: 2026 };
    render(<CalendarGrid cra={FEB_2026} loading={false} error={null} />);
    expect(screen.getAllByTestId('day-cell')).toHaveLength(28);
  });

  it('applies day-cell--weekend to Saturday and Sunday cells only', () => {
    render(<CalendarGrid cra={JULY_2026} loading={false} error={null} />);
    const cells = screen.getAllByTestId('day-cell');
    // July 1, 2026 is Wednesday; weekends fall on: 4,5,11,12,18,19,25,26
    const weekendDays = new Set([4, 5, 11, 12, 18, 19, 25, 26]);
    cells.forEach((cell, i) => {
      const day = i + 1;
      if (weekendDays.has(day)) {
        expect(cell).toHaveClass('day-cell--weekend');
      } else {
        expect(cell).not.toHaveClass('day-cell--weekend');
      }
    });
  });

  it('shows the worked value for days present in cra.days', () => {
    const cra: CraDetails = {
      ...JULY_2026,
      days: [{ day: 3, worked: 1, note: '' }],
    };
    render(<CalendarGrid cra={cra} loading={false} error={null} />);
    const cells = screen.getAllByTestId('day-cell');
    // Day 3 has worked=1; day number is 3, so "1" unambiguously comes from worked
    expect(cells[2].querySelector('.day-cell__worked')).toHaveTextContent('1');
  });

  it('shows 0 as worked value for days absent from cra.days', () => {
    render(<CalendarGrid cra={JULY_2026} loading={false} error={null} />);
    const cells = screen.getAllByTestId('day-cell');
    expect(cells[0]).toHaveTextContent('0');
  });

  it('renders a loading indicator when loading is true', () => {
    render(<CalendarGrid cra={null} loading={true} error={null} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the error message when error is provided', () => {
    render(<CalendarGrid cra={null} loading={false} error="Network error" />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('shows retry button when error and onRetry provided', () => {
    const onRetry = vi.fn();
    render(<CalendarGrid cra={null} loading={false} error="Network error" onRetry={onRetry} />);
    const btn = screen.getByRole('button', { name: 'Réessayer' });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('does not show retry button when error but no onRetry', () => {
    render(<CalendarGrid cra={null} loading={false} error="Network error" />);
    expect(screen.queryByRole('button', { name: 'Réessayer' })).not.toBeInTheDocument();
  });

  it('renders an empty state when cra is null and not loading', () => {
    render(<CalendarGrid cra={null} loading={false} error={null} />);
    expect(screen.getByText('No CRA data available.')).toBeInTheDocument();
  });

  // Header
  it('renders a header with the month and year', () => {
    render(<CalendarGrid cra={JULY_2026} loading={false} error={null} />);
    expect(screen.getByText('July 2026')).toBeInTheDocument();
  });

  // Legend
  it('renders legend with all state labels', () => {
    render(<CalendarGrid cra={JULY_2026} loading={false} error={null} />);
    expect(screen.getByText('Worked')).toBeInTheDocument();
    expect(screen.getByText('Half-day')).toBeInTheDocument();
    expect(screen.getByText('Not worked')).toBeInTheDocument();
    expect(screen.getByText('Weekend')).toBeInTheDocument();
  });

  // Click cycle
  it('clicking an unworked weekday cell calls onDayClick(day, 1)', () => {
    const onDayClick = vi.fn();
    render(<CalendarGrid cra={JULY_2026} loading={false} error={null} onDayClick={onDayClick} />);
    // Day 2 is Thursday (not a weekend)
    fireEvent.click(screen.getAllByTestId('day-cell')[1]);
    expect(onDayClick).toHaveBeenCalledWith(2, 1);
  });

  it('cycles worked value 0 → 1 → 0.5 → 0 on successive clicks', () => {
    const onDayClick = vi.fn();
    const { rerender } = render(
      <CalendarGrid cra={JULY_2026} loading={false} error={null} onDayClick={onDayClick} />,
    );
    const getCell2 = () => screen.getAllByTestId('day-cell')[1];

    fireEvent.click(getCell2());
    expect(onDayClick).toHaveBeenLastCalledWith(2, 1);

    rerender(
      <CalendarGrid
        cra={{ ...JULY_2026, days: [{ day: 2, worked: 1, note: '' }] }}
        loading={false}
        error={null}
        onDayClick={onDayClick}
      />,
    );
    fireEvent.click(getCell2());
    expect(onDayClick).toHaveBeenLastCalledWith(2, 0.5);

    rerender(
      <CalendarGrid
        cra={{ ...JULY_2026, days: [{ day: 2, worked: 0.5, note: '' }] }}
        loading={false}
        error={null}
        onDayClick={onDayClick}
      />,
    );
    fireEvent.click(getCell2());
    expect(onDayClick).toHaveBeenLastCalledWith(2, 0);
  });

  // Keyboard
  it('pressing Enter on an interactive cell calls onDayClick', () => {
    const onDayClick = vi.fn();
    render(<CalendarGrid cra={JULY_2026} loading={false} error={null} onDayClick={onDayClick} />);
    fireEvent.keyDown(screen.getAllByTestId('day-cell')[1], { key: 'Enter' });
    expect(onDayClick).toHaveBeenCalledWith(2, 1);
  });

  it('pressing Space on an interactive cell calls onDayClick', () => {
    const onDayClick = vi.fn();
    render(<CalendarGrid cra={JULY_2026} loading={false} error={null} onDayClick={onDayClick} />);
    fireEvent.keyDown(screen.getAllByTestId('day-cell')[1], { key: ' ' });
    expect(onDayClick).toHaveBeenCalledWith(2, 1);
  });

  // Weekends
  it('clicking a weekend cell does not call onDayClick even when handler is provided', () => {
    const onDayClick = vi.fn();
    render(<CalendarGrid cra={JULY_2026} loading={false} error={null} onDayClick={onDayClick} />);
    // Day 5 is Sunday (weekend)
    fireEvent.click(screen.getAllByTestId('day-cell')[4]);
    expect(onDayClick).not.toHaveBeenCalled();
  });

  it('clicking weekend cells when onDayClick is absent does not throw', () => {
    render(<CalendarGrid cra={JULY_2026} loading={false} error={null} />);
    expect(() => fireEvent.click(screen.getAllByTestId('day-cell')[4])).not.toThrow();
  });

  // Disabled (validated CRA)
  it('cells carry day-cell--disabled and tabIndex=-1 when onDayClick is absent', () => {
    const VALIDATED_CRA: CraDetails = { ...JULY_2026, status: 'VALIDATED' };
    render(<CalendarGrid cra={VALIDATED_CRA} loading={false} error={null} />);
    const cells = screen.getAllByTestId('day-cell');
    expect(cells[1]).toHaveClass('day-cell--disabled');
    expect(cells[1]).toHaveAttribute('tabindex', '-1');
  });

  // Loading state for individual day update
  it('adds day-cell--updating class and shows … when updatingDay matches', () => {
    const onDayClick = vi.fn();
    render(
      <CalendarGrid
        cra={JULY_2026}
        loading={false}
        error={null}
        onDayClick={onDayClick}
        updatingDay={2}
      />,
    );
    const cells = screen.getAllByTestId('day-cell');
    expect(cells[1]).toHaveClass('day-cell--updating');
    expect(cells[1].querySelector('.day-cell__worked')).toHaveTextContent('…');
  });

  it('clicking an updating cell does not call onDayClick', () => {
    const onDayClick = vi.fn();
    render(
      <CalendarGrid
        cra={JULY_2026}
        loading={false}
        error={null}
        onDayClick={onDayClick}
        updatingDay={2}
      />,
    );
    fireEvent.click(screen.getAllByTestId('day-cell')[1]);
    expect(onDayClick).not.toHaveBeenCalled();
  });

  it('renders dayUpdateError as role="alert" below the grid', () => {
    render(
      <CalendarGrid
        cra={JULY_2026}
        loading={false}
        error={null}
        dayUpdateError="La valeur saisie n'est pas valide."
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent("La valeur saisie n'est pas valide.");
  });
});

describe('CalendarGrid — day interaction', () => {
  it('cycle 0 → 1: clicking a day with worked 0 calls updateDay with workValue 1', async () => {
    mockUpdateDay.mockResolvedValueOnce(JULY_2026_DTO);
    render(<CalendarGrid cra={JULY_2026} loading={false} error={null} />);
    fireEvent.click(screen.getAllByTestId('day-cell')[0]);
    await waitFor(() =>
      expect(mockUpdateDay).toHaveBeenCalledWith(1, '2026-07-01', { workValue: 1 }),
    );
  });

  it('cycle 1 → 0.5: clicking a day with worked 1 calls updateDay with workValue 0.5', async () => {
    const cra: CraDetails = { ...JULY_2026, days: [{ day: 1, worked: 1, note: '' }] };
    mockUpdateDay.mockResolvedValueOnce(JULY_2026_DTO);
    render(<CalendarGrid cra={cra} loading={false} error={null} />);
    fireEvent.click(screen.getAllByTestId('day-cell')[0]);
    await waitFor(() =>
      expect(mockUpdateDay).toHaveBeenCalledWith(1, '2026-07-01', { workValue: 0.5 }),
    );
  });

  it('cycle 0.5 → 0: clicking a day with worked 0.5 calls updateDay with workValue 0', async () => {
    const cra: CraDetails = { ...JULY_2026, days: [{ day: 1, worked: 0.5, note: '' }] };
    mockUpdateDay.mockResolvedValueOnce(JULY_2026_DTO);
    render(<CalendarGrid cra={cra} loading={false} error={null} />);
    fireEvent.click(screen.getAllByTestId('day-cell')[0]);
    await waitFor(() =>
      expect(mockUpdateDay).toHaveBeenCalledWith(1, '2026-07-01', { workValue: 0 }),
    );
  });

  it('calls onDayChange with the resolved CraDetailsDto including updated totalWorkedDays', async () => {
    const updatedDto: CraDetailsDto = { ...JULY_2026_DTO, totalWorkedDays: 10 };
    mockUpdateDay.mockResolvedValueOnce(updatedDto);
    const onDayChange = vi.fn();
    render(
      <CalendarGrid cra={JULY_2026} loading={false} error={null} onDayChange={onDayChange} />,
    );
    fireEvent.click(screen.getAllByTestId('day-cell')[0]);
    await waitFor(() => expect(onDayChange).toHaveBeenCalledWith(updatedDto));
  });

  it('marks all day cells aria-disabled while updateDay is pending', async () => {
    let resolve!: (v: CraDetailsDto) => void;
    mockUpdateDay.mockReturnValueOnce(new Promise(r => { resolve = r; }));
    render(<CalendarGrid cra={JULY_2026} loading={false} error={null} />);
    fireEvent.click(screen.getAllByTestId('day-cell')[0]);
    await waitFor(() =>
      expect(screen.getAllByTestId('day-cell')[0]).toHaveAttribute('aria-disabled', 'true'),
    );
    screen.getAllByTestId('day-cell').forEach(cell =>
      expect(cell).toHaveAttribute('aria-disabled', 'true'),
    );
    resolve(JULY_2026_DTO);
  });

  it('removes aria-disabled from all cells after updateDay resolves', async () => {
    mockUpdateDay.mockResolvedValueOnce(JULY_2026_DTO);
    render(<CalendarGrid cra={JULY_2026} loading={false} error={null} />);
    fireEvent.click(screen.getAllByTestId('day-cell')[0]);
    await waitFor(() =>
      expect(screen.getAllByTestId('day-cell')[0]).not.toHaveAttribute('aria-disabled'),
    );
    screen.getAllByTestId('day-cell').forEach(cell =>
      expect(cell).not.toHaveAttribute('aria-disabled'),
    );
  });

  it('renders role="alert" with the error message and re-enables cells on API error', async () => {
    mockUpdateDay.mockRejectedValueOnce(new Error('Server error'));
    render(<CalendarGrid cra={JULY_2026} loading={false} error={null} />);
    fireEvent.click(screen.getAllByTestId('day-cell')[0]);
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Server error'),
    );
    screen.getAllByTestId('day-cell').forEach(cell =>
      expect(cell).not.toHaveAttribute('aria-disabled'),
    );
  });

  it('does not call updateDay when cra status is VALIDATED', () => {
    const validatedCra: CraDetails = { ...JULY_2026, status: 'VALIDATED' };
    render(<CalendarGrid cra={validatedCra} loading={false} error={null} />);
    fireEvent.click(screen.getAllByTestId('day-cell')[0]);
    expect(mockUpdateDay).not.toHaveBeenCalled();
  });
});
