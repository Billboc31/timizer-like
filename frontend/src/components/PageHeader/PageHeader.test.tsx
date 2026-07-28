import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { PageHeader } from './PageHeader';

afterEach(cleanup);

describe('PageHeader', () => {
  it('renders the title as an h1', () => {
    render(<PageHeader title="My Page" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('My Page');
  });

  it('renders the subtitle when provided', () => {
    render(<PageHeader title="My Page" subtitle="A brief description" />);
    expect(screen.getByText('A brief description')).toBeInTheDocument();
  });

  it('omits the subtitle element when not provided', () => {
    render(<PageHeader title="My Page" />);
    expect(screen.queryByText('A brief description')).not.toBeInTheDocument();
  });

  it('renders the actions slot when provided', () => {
    render(<PageHeader title="My Page" actions={<button>Save</button>} />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('omits the actions slot when not provided', () => {
    render(<PageHeader title="My Page" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders the status when provided', () => {
    render(<PageHeader title="My Page" status="DRAFT" />);
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
  });

  it('omits the status element when not provided', () => {
    const { container } = render(<PageHeader title="My Page" />);
    expect(container.querySelector('.page-header__status')).not.toBeInTheDocument();
  });
});
