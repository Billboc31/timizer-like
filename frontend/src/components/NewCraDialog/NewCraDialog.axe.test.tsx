import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { axe } from 'jest-axe';
import { NewCraDialog } from './NewCraDialog';

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('NewCraDialog accessibility', () => {
  it('has no axe violations when open', async () => {
    const { container } = render(
      <NewCraDialog open={true} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
