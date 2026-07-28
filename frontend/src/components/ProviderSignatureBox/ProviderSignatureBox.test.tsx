import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ProviderSignatureBox } from './ProviderSignatureBox';
import type { CraDetails } from '../../types/cra';

afterEach(() => {
  cleanup();
});

const BASE_CRA: CraDetails = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 10,
  status: 'DRAFT',
  days: [],
  providerSignatureDate: null,
};

const SIGNED_CRA: CraDetails = {
  ...BASE_CRA,
  status: 'VALIDATED',
  providerSignatureDate: '2026-07-20',
  providerFirstName: 'Alice',
  providerLastName: 'Provider',
  providerSignatureImageUrl: 'https://example.com/sig.png',
};

describe('ProviderSignatureBox — empty state', () => {
  it('renders invitation text when unsigned', () => {
    render(<ProviderSignatureBox cra={BASE_CRA} onSignClick={vi.fn()} />);
    expect(screen.getByText(/cliquez pour signer/i)).toBeInTheDocument();
  });

  it('applies empty modifier class', () => {
    const { container } = render(<ProviderSignatureBox cra={BASE_CRA} onSignClick={vi.fn()} />);
    expect(container.firstChild).toHaveClass('provider-signature-box--empty');
  });

  it('calls onSignClick when clicked with pointer', () => {
    const onSignClick = vi.fn();
    render(<ProviderSignatureBox cra={BASE_CRA} onSignClick={onSignClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSignClick).toHaveBeenCalledOnce();
  });

  it('calls onSignClick when Enter key is pressed', () => {
    const onSignClick = vi.fn();
    render(<ProviderSignatureBox cra={BASE_CRA} onSignClick={onSignClick} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onSignClick).toHaveBeenCalledOnce();
  });

  it('calls onSignClick when Space key is pressed', () => {
    const onSignClick = vi.fn();
    render(<ProviderSignatureBox cra={BASE_CRA} onSignClick={onSignClick} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(onSignClick).toHaveBeenCalledOnce();
  });

  it('does not call onSignClick on other keys', () => {
    const onSignClick = vi.fn();
    render(<ProviderSignatureBox cra={BASE_CRA} onSignClick={onSignClick} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Tab' });
    expect(onSignClick).not.toHaveBeenCalled();
  });
});

describe('ProviderSignatureBox — signed state', () => {
  it('renders provider name when signed', () => {
    render(<ProviderSignatureBox cra={SIGNED_CRA} onSignClick={vi.fn()} />);
    expect(screen.getByText('Alice Provider')).toBeInTheDocument();
  });

  it('renders signing date formatted as dd/MM/yyyy', () => {
    render(<ProviderSignatureBox cra={SIGNED_CRA} onSignClick={vi.fn()} />);
    expect(screen.getByText('20/07/2026')).toBeInTheDocument();
  });

  it('applies signed modifier class', () => {
    const { container } = render(<ProviderSignatureBox cra={SIGNED_CRA} onSignClick={vi.fn()} />);
    expect(container.firstChild).toHaveClass('provider-signature-box--signed');
  });

  it('does not render invitation text when signed', () => {
    render(<ProviderSignatureBox cra={SIGNED_CRA} onSignClick={vi.fn()} />);
    expect(screen.queryByText(/cliquez pour signer/i)).not.toBeInTheDocument();
  });

  it('does not render provider name element when name fields are absent', () => {
    const cra: CraDetails = { ...BASE_CRA, status: 'VALIDATED', providerSignatureDate: '2026-07-20' };
    render(<ProviderSignatureBox cra={cra} onSignClick={vi.fn()} />);
    expect(screen.queryByText(/alice/i)).not.toBeInTheDocument();
    expect(screen.getByText('20/07/2026')).toBeInTheDocument();
  });

  it('renders signature image with correct src and alt when url is present', () => {
    render(<ProviderSignatureBox cra={SIGNED_CRA} onSignClick={vi.fn()} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/sig.png');
    expect(img).toHaveAttribute('alt', 'Signature de Alice Provider');
  });

  it('does not render image when providerSignatureImageUrl is absent', () => {
    const cra: CraDetails = {
      ...BASE_CRA,
      status: 'VALIDATED',
      providerSignatureDate: '2026-07-20',
      providerFirstName: 'Alice',
      providerLastName: 'Provider',
    };
    render(<ProviderSignatureBox cra={cra} onSignClick={vi.fn()} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});

describe('ProviderSignatureBox — class toggling', () => {
  it('has empty class for null providerSignatureDate', () => {
    const { container } = render(<ProviderSignatureBox cra={BASE_CRA} onSignClick={vi.fn()} />);
    expect(container.firstChild).toHaveClass('provider-signature-box--empty');
    expect(container.firstChild).not.toHaveClass('provider-signature-box--signed');
  });

  it('has signed class for non-null providerSignatureDate', () => {
    const { container } = render(<ProviderSignatureBox cra={SIGNED_CRA} onSignClick={vi.fn()} />);
    expect(container.firstChild).toHaveClass('provider-signature-box--signed');
    expect(container.firstChild).not.toHaveClass('provider-signature-box--empty');
  });
});
