import { render, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { AnnualCalendar } from './AnnualCalendar';
import * as craApi from '../../api/craClient';

vi.mock('../../api/craClient');

afterEach(cleanup);

describe('AnnualCalendar — refreshKey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('re-fetches CRA list when refreshKey increments', async () => {
    vi.mocked(craApi.listCras).mockResolvedValue([]);

    const { rerender } = render(
      <AnnualCalendar refreshKey={0} onOpenCra={vi.fn()} onNewCra={vi.fn()} />,
    );

    await waitFor(() => expect(craApi.listCras).toHaveBeenCalledTimes(1));

    rerender(
      <AnnualCalendar refreshKey={1} onOpenCra={vi.fn()} onNewCra={vi.fn()} />,
    );

    await waitFor(() => expect(craApi.listCras).toHaveBeenCalledTimes(2));
  });
});
