import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { CraSummaryPanel } from './CraSummaryPanel';
import type { CraDetails } from '../../types/cra';

afterEach(cleanup);

const BASE_CRA: CraDetails = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 12.5,
  status: 'DRAFT',
  days: [],
  providerFirstName: 'Jean',
  providerLastName: 'Dupont',
  providerCompany: 'Acme Corp',
  clientFirstName: 'Alice',
  clientLastName: 'Martin',
  clientCompany: 'Lyra Network',
};

describe('CraSummaryPanel', () => {
  it('displays the period as month name and year', () => {
    render(<CraSummaryPanel cra={BASE_CRA} loading={false} error={null} />);
    expect(screen.getByTestId('summary-period')).toHaveTextContent('July 2026');
  });

  it('displays the CRA status', () => {
    render(<CraSummaryPanel cra={BASE_CRA} loading={false} error={null} />);
    expect(screen.getByTestId('summary-status')).toHaveTextContent('DRAFT');
  });

  it('displays total worked days', () => {
    render(<CraSummaryPanel cra={BASE_CRA} loading={false} error={null} />);
    expect(screen.getByTestId('summary-total')).toHaveTextContent('12.5');
  });

  it('displays provider full name', () => {
    render(<CraSummaryPanel cra={BASE_CRA} loading={false} error={null} />);
    expect(screen.getByTestId('summary-provider')).toHaveTextContent('Jean Dupont');
  });

  it('displays provider company', () => {
    render(<CraSummaryPanel cra={BASE_CRA} loading={false} error={null} />);
    expect(screen.getByTestId('summary-provider-company')).toHaveTextContent('Acme Corp');
  });

  it('displays client full name', () => {
    render(<CraSummaryPanel cra={BASE_CRA} loading={false} error={null} />);
    expect(screen.getByTestId('summary-client')).toHaveTextContent('Alice Martin');
  });

  it('updates total when cra.totalWorkedDays changes', () => {
    const { rerender } = render(<CraSummaryPanel cra={BASE_CRA} loading={false} error={null} />);
    expect(screen.getByTestId('summary-total')).toHaveTextContent('12.5');

    rerender(<CraSummaryPanel cra={{ ...BASE_CRA, totalWorkedDays: 15 }} loading={false} error={null} />);
    expect(screen.getByTestId('summary-total')).toHaveTextContent('15');
  });

  it('shows loading state', () => {
    render(<CraSummaryPanel cra={null} loading={true} error={null} />);
    expect(screen.getByTestId('summary-loading')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<CraSummaryPanel cra={null} loading={false} error="Network error" />);
    expect(screen.getByTestId('summary-error')).toBeInTheDocument();
    expect(screen.getByTestId('summary-error')).toHaveTextContent('Network error');
  });

  it('renders nothing when cra is null and not loading', () => {
    const { container } = render(<CraSummaryPanel cra={null} loading={false} error={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows dash when provider names are null', () => {
    const cra: CraDetails = { ...BASE_CRA, providerFirstName: null, providerLastName: null };
    render(<CraSummaryPanel cra={cra} loading={false} error={null} />);
    expect(screen.getByTestId('summary-provider')).toHaveTextContent('—');
  });

  it('shows dash when provider company is null', () => {
    const cra: CraDetails = { ...BASE_CRA, providerCompany: null };
    render(<CraSummaryPanel cra={cra} loading={false} error={null} />);
    expect(screen.getByTestId('summary-provider-company')).toHaveTextContent('—');
  });

  it('shows VALIDATED status', () => {
    const cra: CraDetails = { ...BASE_CRA, status: 'VALIDATED' };
    render(<CraSummaryPanel cra={cra} loading={false} error={null} />);
    expect(screen.getByTestId('summary-status')).toHaveTextContent('VALIDATED');
  });
});
