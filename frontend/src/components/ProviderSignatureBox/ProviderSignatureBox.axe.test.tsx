import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { axe } from 'jest-axe';
import { ProviderSignatureBox } from './ProviderSignatureBox';
import type { CraDetails } from '../../types/cra';

afterEach(() => {
  cleanup();
});

const DRAFT_CRA: CraDetails = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 10,
  status: 'DRAFT',
  days: [],
  providerSignatureDate: null,
};

const SIGNED_CRA: CraDetails = {
  ...DRAFT_CRA,
  status: 'VALIDATED',
  providerSignatureDate: '2026-07-20',
  providerSignerName: 'Alice Provider',
};

describe('ProviderSignatureBox accessibility', () => {
  it('has no axe violations in empty state', async () => {
    const { container } = render(
      <ProviderSignatureBox cra={DRAFT_CRA} onSignClick={() => {}} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations in signed state', async () => {
    const { container } = render(
      <ProviderSignatureBox cra={SIGNED_CRA} onSignClick={() => {}} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
