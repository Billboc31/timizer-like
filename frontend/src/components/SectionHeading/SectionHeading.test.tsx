import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { SectionHeading } from './SectionHeading';

afterEach(cleanup);

describe('SectionHeading', () => {
  it('renders the heading text as an h2', () => {
    render(<SectionHeading title="Section Title" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Section Title');
  });

  it('renders supporting text when provided', () => {
    render(<SectionHeading title="Section Title" supportingText="Some context" />);
    expect(screen.getByText('Some context')).toBeInTheDocument();
  });

  it('omits the supporting text element when not provided', () => {
    const { container } = render(<SectionHeading title="Section Title" />);
    expect(container.querySelector('.section-heading__supporting-text')).not.toBeInTheDocument();
  });
});
