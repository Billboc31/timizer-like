import { render, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { axe } from 'jest-axe';
import { CraValidation } from './CraValidation';
import type { CraDetails } from '../../types/cra';

vi.mock('../../api/craClient', () => ({
  validateCra: vi.fn(),
}));

vi.mock('../../api/signatureClient', () => ({
  getSignature: vi.fn().mockResolvedValue({
    signerName: 'Jean Dupont',
    signatureImage: 'data:image/png;base64,abc',
  }),
}));

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

describe('CraValidation accessibility', () => {
  it('has no axe violations in idle state', async () => {
    const { container } = render(
      <CraValidation cra={DRAFT_CRA} onValidated={vi.fn()} onGoToSettings={vi.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations in confirming state (dialog open)', async () => {
    const { container, getByRole } = render(
      <CraValidation cra={DRAFT_CRA} onValidated={vi.fn()} onGoToSettings={vi.fn()} />,
    );
    fireEvent.click(getByRole('button', { name: /valider et signer le cra/i }));
    await waitFor(() => getByRole('dialog'));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
