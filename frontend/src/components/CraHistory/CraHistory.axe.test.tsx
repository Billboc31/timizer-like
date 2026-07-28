import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { axe } from 'jest-axe';
import { CraHistory } from './CraHistory';
import * as craApi from '../../api/craClient';
import type { CraSummaryDto } from '../../types/cra';

vi.mock('../../api/craClient');

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const VALIDATED_CRA: CraSummaryDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 21,
  status: 'VALIDATED',
  validationDate: '2026-07-01',
};

const DRAFT_CRA: CraSummaryDto = {
  id: 2,
  month: 6,
  year: 2026,
  totalWorkedDays: 20,
  status: 'DRAFT',
  validationDate: null,
};

describe('CraHistory accessibility', () => {
  it('has no axe violations when listing CRAs', async () => {
    vi.mocked(craApi.listCras).mockResolvedValueOnce([VALIDATED_CRA, DRAFT_CRA]);
    const { container } = render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() =>
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument(),
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations when the list is empty', async () => {
    vi.mocked(craApi.listCras).mockResolvedValueOnce([]);
    const { container } = render(<CraHistory onOpen={vi.fn()} />);
    await waitFor(() =>
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument(),
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
