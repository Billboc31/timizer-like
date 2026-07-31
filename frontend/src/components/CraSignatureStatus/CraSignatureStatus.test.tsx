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

  it('renders correct label for AWAITING_CLIENT_SIGNATURE', () => {
    render(<CraSignatureStatus status="AWAITING_CLIENT_SIGNATURE" />);
    expect(screen.getByText('En attente de signature client')).toBeInTheDocument();
    expect(screen.getByText('En attente de signature client')).toHaveClass('cra-signature-status--awaiting-client');
  });

  it('renders "Validé" for VALIDATED', () => {
    render(<CraSignatureStatus status="VALIDATED" />);
    expect(screen.getByText('Validé')).toBeInTheDocument();
    expect(screen.getByText('Validé')).toHaveClass('cra-signature-status--signed');
  });

  it('always applies the base cra-signature-status class', () => {
    const statuses: CraStatus[] = ['DRAFT', 'AWAITING_CLIENT_SIGNATURE', 'VALIDATED'];
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
