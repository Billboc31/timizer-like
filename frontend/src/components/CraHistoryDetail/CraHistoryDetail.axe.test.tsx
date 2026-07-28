import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { axe } from 'jest-axe';
import { CraHistoryDetail } from './CraHistoryDetail';
import * as craApi from '../../api/craClient';
import type { CraDetailsDto } from '../../api/types';

vi.mock('../../api/craClient');

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const VALIDATED_DETAIL: CraDetailsDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 21,
  status: 'VALIDATED',
  validationDate: '2026-07-31',
  providerSignatureDate: '2026-07-31',
  clientSignatureDate: '2026-08-01',
  providerFirstName: 'Jean',
  providerLastName: 'Dupont',
  providerCompany: 'Prestataire SARL',
  clientFirstName: 'Marie',
  clientLastName: 'Martin',
  clientCompany: 'Client SA',
  clientContactFirstName: 'Pierre',
  clientContactLastName: 'Durand',
  days: [{ day: 1, worked: 1, note: null }],
};

describe('CraHistoryDetail accessibility', () => {
  it('has no axe violations in loaded state', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(VALIDATED_DETAIL);
    const { container } = render(<CraHistoryDetail craId={1} onBack={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Juillet 2026')).toBeInTheDocument());
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations in loading state', async () => {
    vi.mocked(craApi.getCra).mockReturnValue(new Promise(() => {}));
    const { container } = render(<CraHistoryDetail craId={1} onBack={vi.fn()} />);
    expect(screen.getByLabelText(/chargement/i)).toBeInTheDocument();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations in error state', async () => {
    vi.mocked(craApi.getCra).mockRejectedValue(new Error('Network error'));
    const { container } = render(<CraHistoryDetail craId={1} onBack={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
