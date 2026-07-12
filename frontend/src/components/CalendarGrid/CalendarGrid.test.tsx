import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
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
});
