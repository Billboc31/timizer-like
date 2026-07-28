import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CraValidation } from './CraValidation';
import { validateCra } from '../../api/craClient';
import { getSignature } from '../../api/signatureClient';
import { ApiError } from '../../api/apiError';
import type { CraDetails } from '../../types/cra';
import type { CraDetailsDto, ProviderSignatureDto } from '../../api/types';

vi.mock('../../api/craClient', () => ({
  validateCra: vi.fn(),
}));

vi.mock('../../api/signatureClient', () => ({
  getSignature: vi.fn(),
}));

const mockValidateCra = vi.mocked(validateCra);
const mockGetSignature = vi.mocked(getSignature);

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  vi.useRealTimers();
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

const SIGNATURE: ProviderSignatureDto = {
  signerName: 'Jean Dupont',
  signatureImage: 'data:image/png;base64,abc',
};

const VALIDATED_DTO: CraDetailsDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 10,
  status: 'VALIDATED',
  days: [],
  validationDate: '2026-07-20',
  providerSignatureDate: '2026-07-20',
  providerSignatureImage: 'data:image/png;base64,abc',
  providerSignerName: 'Jean Dupont',
};

const noop = vi.fn();

describe('CraValidation', () => {
  it('renders validate button for DRAFT CRA', () => {
    render(<CraValidation cra={DRAFT_CRA} onValidated={noop} onGoToSettings={noop} />);
    expect(screen.getByRole('button', { name: /valider le cra/i })).toBeInTheDocument();
  });

  it('renders nothing for VALIDATED CRA', () => {
    const { container } = render(<CraValidation cra={VALIDATED_CRA} onValidated={noop} onGoToSettings={noop} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when cra is null', () => {
    const { container } = render(<CraValidation cra={null} onValidated={noop} onGoToSettings={noop} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows blocking no-sig message when signature not configured', async () => {
    mockGetSignature.mockRejectedValueOnce(new ApiError('cra_not_found', 404));
    render(<CraValidation cra={DRAFT_CRA} onValidated={noop} onGoToSettings={noop} />);

    fireEvent.click(screen.getByRole('button', { name: /valider le cra/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(/aucune signature/i);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('clicking settings link in no-sig message calls onGoToSettings', async () => {
    mockGetSignature.mockRejectedValueOnce(new ApiError('cra_not_found', 404));
    const onGoToSettings = vi.fn();
    render(<CraValidation cra={DRAFT_CRA} onValidated={noop} onGoToSettings={onGoToSettings} />);

    fireEvent.click(screen.getByRole('button', { name: /valider le cra/i }));
    await waitFor(() => screen.getByText(/paramètres/i));
    fireEvent.click(screen.getByRole('button', { name: /paramètres/i }));
    expect(onGoToSettings).toHaveBeenCalled();
  });

  it('shows confirmation dialog with signature preview when signature is configured', async () => {
    mockGetSignature.mockResolvedValueOnce(SIGNATURE);
    render(<CraValidation cra={DRAFT_CRA} onValidated={noop} onGoToSettings={noop} />);

    fireEvent.click(screen.getByRole('button', { name: /valider le cra/i }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    expect(screen.getByAltText('Aperçu de la signature')).toBeInTheDocument();
    expect(screen.getByText(/jean dupont/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmer/i })).toBeInTheDocument();
  });

  it('clicking annuler hides confirmation and does not call validateCra', async () => {
    mockGetSignature.mockResolvedValueOnce(SIGNATURE);
    render(<CraValidation cra={DRAFT_CRA} onValidated={noop} onGoToSettings={noop} />);

    fireEvent.click(screen.getByRole('button', { name: /valider le cra/i }));
    await waitFor(() => screen.getByRole('button', { name: /annuler/i }));
    fireEvent.click(screen.getByRole('button', { name: /annuler/i }));
    expect(screen.getByRole('button', { name: /valider le cra/i })).toBeInTheDocument();
    expect(mockValidateCra).not.toHaveBeenCalled();
  });

  it('shows success message then calls onValidated with signature data', async () => {
    mockGetSignature.mockResolvedValueOnce(SIGNATURE);
    mockValidateCra.mockResolvedValueOnce(VALIDATED_DTO);
    const onValidated = vi.fn();
    render(<CraValidation cra={DRAFT_CRA} onValidated={onValidated} onGoToSettings={noop} />);

    fireEvent.click(screen.getByRole('button', { name: /valider le cra/i }));
    await waitFor(() => screen.getByRole('button', { name: /confirmer/i }));

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    await act(async () => {});
    expect(screen.getByText('CRA validé avec succès.')).toBeInTheDocument();
    expect(onValidated).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(2000); });
    expect(onValidated).toHaveBeenCalledWith(VALIDATED_DTO);
    expect(mockValidateCra).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        providerSignatureDate: expect.any(String),
        providerSignatureImage: SIGNATURE.signatureImage,
        providerSignerName: SIGNATURE.signerName,
      }),
    );
  });

  it('disables confirmer and annuler while request is in-flight', async () => {
    mockGetSignature.mockResolvedValueOnce(SIGNATURE);
    let resolve!: (v: CraDetailsDto) => void;
    mockValidateCra.mockReturnValueOnce(new Promise(r => { resolve = r; }));
    render(<CraValidation cra={DRAFT_CRA} onValidated={noop} onGoToSettings={noop} />);

    fireEvent.click(screen.getByRole('button', { name: /valider le cra/i }));
    await waitFor(() => screen.getByRole('button', { name: /confirmer/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /validation/i })).toBeDisabled(),
    );
    expect(screen.getByRole('button', { name: /annuler/i })).toBeDisabled();
    resolve(VALIDATED_DTO);
  });

  it('displays error inside dialog and re-enables action buttons on API error', async () => {
    mockGetSignature.mockResolvedValueOnce(SIGNATURE);
    mockValidateCra.mockRejectedValueOnce(new Error('Server error'));
    render(<CraValidation cra={DRAFT_CRA} onValidated={noop} onGoToSettings={noop} />);

    fireEvent.click(screen.getByRole('button', { name: /valider le cra/i }));
    await waitFor(() => screen.getByRole('button', { name: /confirmer/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmer/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /annuler/i })).not.toBeDisabled();
  });
});
