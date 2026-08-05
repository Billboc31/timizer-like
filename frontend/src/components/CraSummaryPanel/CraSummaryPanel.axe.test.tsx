import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { axe } from 'jest-axe';
import { CraSummaryPanel } from './CraSummaryPanel';
import type { CraDetails } from '../../types/cra';

afterEach(cleanup);

const SAMPLE_CRA: CraDetails = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 15,
  status: 'DRAFT',
  days: [],
  providerSignatureDate: null,
  providerRaisonSociale: 'Acme Corp',
  clientFirstName: 'Alice',
  clientLastName: 'Martin',
};

describe('CraSummaryPanel accessibility', () => {
  it('has no axe violations when rendering a CRA summary', async () => {
    const { container } = render(
      <CraSummaryPanel cra={SAMPLE_CRA} loading={false} error={null} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations in loading state', async () => {
    const { container } = render(
      <CraSummaryPanel cra={null} loading={true} error={null} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations in error state', async () => {
    const { container } = render(
      <CraSummaryPanel cra={null} loading={false} error="Failed to load" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
