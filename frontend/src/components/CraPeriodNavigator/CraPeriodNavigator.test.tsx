import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CraPeriodNavigator } from './CraPeriodNavigator';

afterEach(cleanup);

describe('CraPeriodNavigator', () => {
  it('renders the period label with month and year', () => {
    render(<CraPeriodNavigator month={7} year={2026} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'July 2026' })).toBeInTheDocument();
  });

  it('calls onChange with previous month when prev is clicked', () => {
    const onChange = vi.fn();
    render(<CraPeriodNavigator month={3} year={2026} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /previous month/i }));
    expect(onChange).toHaveBeenCalledWith(2, 2026);
  });

  it('wraps to December of previous year when prev is clicked in January', () => {
    const onChange = vi.fn();
    render(<CraPeriodNavigator month={1} year={2026} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /previous month/i }));
    expect(onChange).toHaveBeenCalledWith(12, 2025);
  });

  it('calls onChange with next month when next is clicked', () => {
    const onChange = vi.fn();
    render(<CraPeriodNavigator month={7} year={2026} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /next month/i }));
    expect(onChange).toHaveBeenCalledWith(8, 2026);
  });

  it('wraps to January of next year when next is clicked in December', () => {
    const onChange = vi.fn();
    render(<CraPeriodNavigator month={12} year={2026} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /next month/i }));
    expect(onChange).toHaveBeenCalledWith(1, 2027);
  });

  it('disables all three navigator buttons when disabled prop is true', () => {
    render(<CraPeriodNavigator month={7} year={2026} disabled onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /previous month/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'July 2026' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next month/i })).toBeDisabled();
  });

  it('opens the dialog when the label button is clicked', () => {
    render(<CraPeriodNavigator month={7} year={2026} onChange={vi.fn()} />);
    const dialog = document.querySelector('dialog')!;
    expect(dialog).not.toHaveAttribute('open');
    fireEvent.click(screen.getByRole('button', { name: 'July 2026' }));
    expect(dialog).toHaveAttribute('open');
  });

  it('closes dialog without calling onChange when Cancel is clicked', () => {
    const onChange = vi.fn();
    render(<CraPeriodNavigator month={7} year={2026} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'July 2026' }));
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(onChange).not.toHaveBeenCalled();
    expect(document.querySelector('dialog')).not.toHaveAttribute('open');
  });

  it('calls onChange with selected values and closes dialog when Go is clicked', () => {
    const onChange = vi.fn();
    render(<CraPeriodNavigator month={7} year={2026} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'July 2026' }));
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2025' } });
    fireEvent.click(screen.getByRole('button', { name: /^go$/i }));
    expect(onChange).toHaveBeenCalledWith(3, 2025);
    expect(document.querySelector('dialog')).not.toHaveAttribute('open');
  });

  it('initialises dialog values from current props when opened', () => {
    render(<CraPeriodNavigator month={5} year={2024} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'May 2024' }));
    expect(screen.getByLabelText<HTMLSelectElement>('Month').value).toBe('5');
    expect(screen.getByLabelText<HTMLInputElement>('Year').value).toBe('2024');
  });
});
