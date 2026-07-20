import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CraValidation } from './CraValidation';
import { validateCra } from '../../api/craClient';
import type { CraDetails } from '../../types/cra';
import type { CraDetailsDto } from '../../api/types';

vi.mock('../../api/craClient', () => ({
  validateCra: vi.fn(),
}));

const mockValidateCra = vi.mocked(validateCra);

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const DRAFT_CRA: CraDetails = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 10,
  status: 'DRAFT',
  days: [],
};

const VALIDATED_CRA: CraDetails = { ...DRAFT_CRA, status: 'VALIDATED' };

const VALIDATED_DTO: CraDetailsDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 10,
  status: 'VALIDATED',
  days: [],
  validationDate: '2026-07-20',
  providerSignatureDate: '2026-07-20',
};

describe('CraValidation', () => {
  it('renders validate button for DRAFT CRA', () => {
    render(<CraValidation cra={DRAFT_CRA} onValidated={vi.fn()} />);
    expect(screen.getByRole('button', { name: /valider le cra/i })).toBeInTheDocument();
  });

  it('renders nothing for VALIDATED CRA', () => {
    const { container } = render(<CraValidation cra={VALIDATED_CRA} onValidated={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when cra is null', () => {
    const { container } = render(<CraValidation cra={null} onValidated={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('clicking validate button shows confirmation UI', () => {
    render(<CraValidation cra={DRAFT_CRA} onValidated={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /valider le cra/i }));
    expect(screen.getByText(/verrouille le cra/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
  });

  it('clicking annuler hides confirmation and does not call validateCra', () => {
    render(<CraValidation cra={DRAFT_CRA} onValidated={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /valider le cra/i }));
    fireEvent.click(screen.getByRole('button', { name: /annuler/i }));
    expect(screen.getByRole('button', { name: /valider le cra/i })).toBeInTheDocument();
    expect(mockValidateCra).not.toHaveBeenCalled();
  });

  it('clicking confirmer calls validateCra then onValidated with the result', async () => {
    mockValidateCra.mockResolvedValueOnce(VALIDATED_DTO);
    const onValidated = vi.fn();
    render(<CraValidation cra={DRAFT_CRA} onValidated={onValidated} />);
    fireEvent.click(screen.getByRole('button', { name: /valider le cra/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    await waitFor(() => expect(onValidated).toHaveBeenCalledWith(VALIDATED_DTO));
    expect(mockValidateCra).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ providerSignatureDate: expect.any(String) }),
    );
  });

  it('disables confirmer and annuler while request is in-flight', async () => {
    let resolve!: (v: CraDetailsDto) => void;
    mockValidateCra.mockReturnValueOnce(new Promise(r => { resolve = r; }));
    render(<CraValidation cra={DRAFT_CRA} onValidated={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /valider le cra/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /validation/i })).toBeDisabled(),
    );
    expect(screen.getByRole('button', { name: /annuler/i })).toBeDisabled();
    resolve(VALIDATED_DTO);
  });

  it('displays error and re-enables validate button on API error', async () => {
    mockValidateCra.mockRejectedValueOnce(new Error('Server error'));
    render(<CraValidation cra={DRAFT_CRA} onValidated={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /valider le cra/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /valider le cra/i })).toBeInTheDocument();
  });
});
