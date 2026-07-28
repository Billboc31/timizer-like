import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { axe } from 'jest-axe';
import { CraMonthSelector } from './CraMonthSelector';
import * as craApi from '../../api/craClient';

vi.mock('../../api/craClient');

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('CraMonthSelector accessibility', () => {
  it('has no axe violations when rendered with no existing CRAs', async () => {
    vi.mocked(craApi.listCras).mockResolvedValueOnce([]);
    const { container } = render(
      <div>
        <h1>App</h1>
        <CraMonthSelector onOpen={vi.fn()} />
      </div>,
    );
    await waitFor(() =>
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument(),
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
