import { render, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { axe } from 'jest-axe';
import { CraPeriodNavigator } from './CraPeriodNavigator';

afterEach(cleanup);

const defaultProps = {
  month: 7,
  year: 2026,
  onChange: vi.fn(),
};

describe('CraPeriodNavigator accessibility', () => {
  it('has no axe violations in default state', async () => {
    const { container } = render(
      <div>
        <h1>App</h1>
        <CraPeriodNavigator {...defaultProps} />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations with dialog open', async () => {
    const { container, getByRole } = render(
      <div>
        <h1>App</h1>
        <CraPeriodNavigator {...defaultProps} />
      </div>,
    );
    fireEvent.click(getByRole('button', { name: 'July 2026' }));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations in disabled state', async () => {
    const { container } = render(
      <div>
        <h1>App</h1>
        <CraPeriodNavigator {...defaultProps} disabled />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
