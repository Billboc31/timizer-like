import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { CalendarGrid } from './CalendarGrid';
import type { CraDetails } from '../../types/cra';

afterEach(cleanup);

const JULY_2026: CraDetails = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 0,
  status: 'DRAFT',
  days: [],
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
});
