import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { axe } from 'jest-axe';
import { CalendarGrid } from './CalendarGrid';
import type { CraDetails } from '../../types/cra';

afterEach(cleanup);

const SAMPLE_CRA: CraDetails = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 15,
  status: 'DRAFT',
  days: [
    { day: 1, worked: 1, note: '' },
    { day: 2, worked: 0.5, note: '' },
  ],
};

describe('CalendarGrid accessibility', () => {
  it('has no axe violations when rendering a month', async () => {
    const { container } = render(
      <CalendarGrid cra={SAMPLE_CRA} loading={false} error={null} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations in loading state', async () => {
    const { container } = render(
      <CalendarGrid cra={null} loading={true} error={null} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations in error state', async () => {
    const { container } = render(
      <CalendarGrid cra={null} loading={false} error="Network error" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
