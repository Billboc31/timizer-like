import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CraSignatureActions } from './CraSignatureActions';
import type { CraDetails } from '../../types/cra';
import type { CraDetailsDto } from '../../api/types';

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const makeCra = (overrides: Partial<CraDetails> = {}): CraDetails => ({
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 10,
  status: 'DRAFT',
  days: [],
  providerSignatureDate: null,
  ...overrides,
});

describe('CraSignatureActions', () => {
  it('renders nothing for DRAFT (validation is handled by CraValidation)', () => {
    const { container } = render(
      <CraSignatureActions cra={makeCra({ status: 'DRAFT' })} onSuccess={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders info message for AWAITING_CLIENT_SIGNATURE', () => {
    render(
      <CraSignatureActions cra={makeCra({ status: 'AWAITING_CLIENT_SIGNATURE' })} onSuccess={vi.fn()} />,
    );
    expect(screen.getByText(/en attente de la signature client/i)).toBeInTheDocument();
  });

  it('renders both signer names and dates for VALIDATED', () => {
    render(
      <CraSignatureActions
        cra={makeCra({
          status: 'VALIDATED',
          providerSignerName: 'Jean Dupont',
          providerSignatureDate: '2026-07-31',
          clientRepresentativeName: 'Alice Martin',
          clientSignatureDate: '2026-07-31',
        })}
        onSuccess={vi.fn()}
      />,
    );
    expect(screen.getByText(/Jean Dupont/)).toBeInTheDocument();
    expect(screen.getByText(/Alice Martin/)).toBeInTheDocument();
  });

  it('renders nothing for VALIDATED when signatures are missing', () => {
    const { container } = render(
      <CraSignatureActions
        cra={makeCra({ status: 'VALIDATED' })}
        onSuccess={vi.fn()}
      />,
    );
    expect(container.querySelector('.cra-signature-actions__info')).toBeNull();
  });
});
