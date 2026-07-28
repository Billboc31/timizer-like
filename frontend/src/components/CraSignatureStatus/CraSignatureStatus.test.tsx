import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { CraSignatureStatus } from './CraSignatureStatus';
import type { CraStatus } from '../../api/types';

afterEach(cleanup);

describe('CraSignatureStatus', () => {
  it('renders "Brouillon" for DRAFT', () => {
    render(<CraSignatureStatus status="DRAFT" />);
    expect(screen.getByText('Brouillon')).toBeInTheDocument();
    expect(screen.getByText('Brouillon')).toHaveClass('cra-signature-status--draft');
  });

  it('renders correct label for READY_FOR_PROVIDER_SIGNATURE', () => {
    render(<CraSignatureStatus status="READY_FOR_PROVIDER_SIGNATURE" />);
    expect(screen.getByText('En attente de signature prestataire')).toBeInTheDocument();
    expect(screen.getByText('En attente de signature prestataire')).toHaveClass('cra-signature-status--ready-for-provider');
  });

  it('renders correct label for SIGNED_BY_PROVIDER', () => {
    render(<CraSignatureStatus status="SIGNED_BY_PROVIDER" />);
    expect(screen.getByText('Signé par le prestataire')).toBeInTheDocument();
    expect(screen.getByText('Signé par le prestataire')).toHaveClass('cra-signature-status--signed-by-provider');
  });

  it('renders correct label for AWAITING_CLIENT_SIGNATURE', () => {
    render(<CraSignatureStatus status="AWAITING_CLIENT_SIGNATURE" />);
    expect(screen.getByText('En attente de signature client')).toBeInTheDocument();
    expect(screen.getByText('En attente de signature client')).toHaveClass('cra-signature-status--awaiting-client');
  });

  it('renders "Signé" for FULLY_SIGNED', () => {
    render(<CraSignatureStatus status="FULLY_SIGNED" />);
    expect(screen.getByText('Signé')).toBeInTheDocument();
    expect(screen.getByText('Signé')).toHaveClass('cra-signature-status--signed');
  });

  it('renders "Signé" for VALIDATED (legacy)', () => {
    render(<CraSignatureStatus status="VALIDATED" />);
    expect(screen.getByText('Signé')).toBeInTheDocument();
    expect(screen.getByText('Signé')).toHaveClass('cra-signature-status--signed');
  });

  it('always applies the base cra-signature-status class', () => {
    const statuses: CraStatus[] = [
      'DRAFT', 'READY_FOR_PROVIDER_SIGNATURE', 'SIGNED_BY_PROVIDER',
      'AWAITING_CLIENT_SIGNATURE', 'FULLY_SIGNED', 'VALIDATED',
    ];
    statuses.forEach(status => {
      const { unmount } = render(<CraSignatureStatus status={status} />);
      const spans = document.querySelectorAll('.cra-signature-status');
      expect(spans.length).toBeGreaterThan(0);
      unmount();
    });
  });

  it('forwards data-testid to the span', () => {
    render(<CraSignatureStatus status="DRAFT" data-testid="my-status" />);
    expect(screen.getByTestId('my-status')).toBeInTheDocument();
  });
});
