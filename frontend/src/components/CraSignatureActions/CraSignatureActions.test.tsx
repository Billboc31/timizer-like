import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CraSignatureActions } from './CraSignatureActions';
import * as craClient from '../../api/craClient';
import type { CraDetails } from '../../types/cra';
import type { CraDetailsDto } from '../../api/types';

vi.mock('../../api/craClient');

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const makeCra = (status: CraDetails['status']): CraDetails => ({
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 10,
  status,
  days: [],
});

const UPDATED_DTO: CraDetailsDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 10,
  status: 'READY_FOR_PROVIDER_SIGNATURE',
  days: [],
  validationDate: null,
  providerSignatureDate: null,
};

describe('CraSignatureActions', () => {
  it('shows "Soumettre pour signature" button for DRAFT', () => {
    render(<CraSignatureActions cra={makeCra('DRAFT')} onSuccess={vi.fn()} />);
    expect(screen.getByRole('button', { name: /soumettre pour signature/i })).toBeInTheDocument();
  });

  it('shows "Signer (prestataire)" button and date input for READY_FOR_PROVIDER_SIGNATURE', () => {
    render(<CraSignatureActions cra={makeCra('READY_FOR_PROVIDER_SIGNATURE')} onSuccess={vi.fn()} />);
    expect(screen.getByRole('button', { name: /signer \(prestataire\)/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/date de signature prestataire/i)).toBeInTheDocument();
  });

  it('shows "Envoyer au client" button for SIGNED_BY_PROVIDER', () => {
    render(<CraSignatureActions cra={makeCra('SIGNED_BY_PROVIDER')} onSuccess={vi.fn()} />);
    expect(screen.getByRole('button', { name: /envoyer au client/i })).toBeInTheDocument();
  });

  it('renders nothing for AWAITING_CLIENT_SIGNATURE', () => {
    const { container } = render(
      <CraSignatureActions cra={makeCra('AWAITING_CLIENT_SIGNATURE')} onSuccess={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for FULLY_SIGNED', () => {
    const { container } = render(
      <CraSignatureActions cra={makeCra('FULLY_SIGNED')} onSuccess={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for VALIDATED', () => {
    const { container } = render(
      <CraSignatureActions cra={makeCra('VALIDATED')} onSuccess={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('calls submitCra and invokes onSuccess on DRAFT submit', async () => {
    vi.mocked(craClient.submitCra).mockResolvedValueOnce(UPDATED_DTO);
    const onSuccess = vi.fn();
    render(<CraSignatureActions cra={makeCra('DRAFT')} onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: /soumettre pour signature/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(UPDATED_DTO));
    expect(craClient.submitCra).toHaveBeenCalledWith(1);
  });

  it('calls signCraByProvider and invokes onSuccess for READY_FOR_PROVIDER_SIGNATURE', async () => {
    vi.mocked(craClient.signCraByProvider).mockResolvedValueOnce({
      ...UPDATED_DTO,
      status: 'SIGNED_BY_PROVIDER',
    });
    const onSuccess = vi.fn();
    render(<CraSignatureActions cra={makeCra('READY_FOR_PROVIDER_SIGNATURE')} onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: /signer \(prestataire\)/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(craClient.signCraByProvider).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ providerSignatureDate: expect.any(String) }),
    );
  });

  it('calls sendCraToClient and invokes onSuccess for SIGNED_BY_PROVIDER', async () => {
    vi.mocked(craClient.sendCraToClient).mockResolvedValueOnce({
      ...UPDATED_DTO,
      status: 'AWAITING_CLIENT_SIGNATURE',
    });
    const onSuccess = vi.fn();
    render(<CraSignatureActions cra={makeCra('SIGNED_BY_PROVIDER')} onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: /envoyer au client/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(craClient.sendCraToClient).toHaveBeenCalledWith(1);
  });

  it('displays error message when API call fails', async () => {
    vi.mocked(craClient.submitCra).mockRejectedValueOnce(new Error('Server error'));
    render(<CraSignatureActions cra={makeCra('DRAFT')} onSuccess={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /soumettre pour signature/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  it('disables submit button while loading', async () => {
    let resolve!: (v: CraDetailsDto) => void;
    vi.mocked(craClient.submitCra).mockReturnValueOnce(new Promise(r => { resolve = r; }));
    render(<CraSignatureActions cra={makeCra('DRAFT')} onSuccess={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /soumettre pour signature/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /en cours/i })).toBeDisabled(),
    );
    resolve(UPDATED_DTO);
  });
});
