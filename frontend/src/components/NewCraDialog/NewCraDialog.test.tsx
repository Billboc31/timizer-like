import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { NewCraDialog } from './NewCraDialog';

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const noop = vi.fn();

describe('NewCraDialog', () => {
  it('dialog is not open when open prop is false', () => {
    render(<NewCraDialog open={false} onConfirm={noop} onCancel={noop} />);
    expect(document.querySelector('dialog')).not.toHaveAttribute('open');
  });

  it('dialog is open and inputs are visible when open prop is true', () => {
    render(<NewCraDialog open={true} onConfirm={noop} onCancel={noop} />);
    expect(document.querySelector('dialog')).toHaveAttribute('open');
    expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date de fin/i)).toBeInTheDocument();
  });

  it('shows validation error when start date is empty', () => {
    const onConfirm = vi.fn();
    render(<NewCraDialog open={true} onConfirm={onConfirm} onCancel={noop} />);
    fireEvent.change(screen.getByLabelText(/date de début/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/les deux dates sont requises/i);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('shows validation error when end date is before start date', () => {
    const onConfirm = vi.fn();
    render(<NewCraDialog open={true} onConfirm={onConfirm} onCancel={noop} />);
    fireEvent.change(screen.getByLabelText(/date de début/i), { target: { value: '2026-07-15' } });
    fireEvent.change(screen.getByLabelText(/date de fin/i), { target: { value: '2026-07-01' } });
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/antérieure/i);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm with the selected dates on valid submit', () => {
    const onConfirm = vi.fn();
    render(<NewCraDialog open={true} onConfirm={onConfirm} onCancel={noop} />);
    fireEvent.change(screen.getByLabelText(/date de début/i), { target: { value: '2026-07-01' } });
    fireEvent.change(screen.getByLabelText(/date de fin/i), { target: { value: '2026-07-31' } });
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    expect(onConfirm).toHaveBeenCalledWith('2026-07-01', '2026-07-31');
  });

  it('calls onCancel when the cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<NewCraDialog open={true} onConfirm={noop} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /annuler/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onCancel when the native cancel event fires (ESC key)', () => {
    const onCancel = vi.fn();
    render(<NewCraDialog open={true} onConfirm={noop} onCancel={onCancel} />);
    const dialog = document.querySelector('dialog')!;
    fireEvent(dialog, new Event('cancel', { bubbles: false }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('displays the error prop as an alert', () => {
    render(<NewCraDialog open={true} onConfirm={noop} onCancel={noop} error="Erreur serveur" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Erreur serveur');
  });

  it('disables inputs and buttons when loading is true', () => {
    render(<NewCraDialog open={true} onConfirm={noop} onCancel={noop} loading={true} />);
    expect(screen.getByLabelText(/date de début/i)).toBeDisabled();
    expect(screen.getByLabelText(/date de fin/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /création/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /annuler/i })).toBeDisabled();
  });
});
