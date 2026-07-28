import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { SignatureSettings } from './SignatureSettings';
import * as signatureClient from '../../api/signatureClient';
import { ApiError } from '../../api/apiError';

vi.mock('../../api/signatureClient', () => ({
  getSignature: vi.fn(),
  saveSignature: vi.fn(),
  deleteSignature: vi.fn(),
}));

vi.mock('../SignatureCanvas/SignatureCanvas', async () => {
  const React = await import('react');
  const MockSignatureCanvas = React.forwardRef<
    { toDataURL: () => string; clear: () => void },
    { onDraw?: () => void; className?: string }
  >(({ onDraw, className }, ref) => {
    React.useImperativeHandle(ref, () => ({
      toDataURL: () => 'data:image/png;base64,mockdrawing',
      clear: vi.fn(),
    }));
    return (
      <canvas
        data-testid="signature-canvas"
        className={className}
        role="img"
        aria-label="Zone de dessin de la signature"
        onClick={() => onDraw?.()}
      />
    );
  });
  return { SignatureCanvas: MockSignatureCanvas };
});

const mockGetSignature = vi.mocked(signatureClient.getSignature);
const mockSaveSignature = vi.mocked(signatureClient.saveSignature);
const mockDeleteSignature = vi.mocked(signatureClient.deleteSignature);

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

beforeEach(() => {
  mockGetSignature.mockRejectedValue(new ApiError('cra_not_found', 404));
});

describe('SignatureSettings', () => {
  it('renders the editor when no signature is saved', async () => {
    render(<SignatureSettings />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enregistrer la signature/i })).toBeInTheDocument();
    });
  });

  it('renders preview when a signature is already saved', async () => {
    mockGetSignature.mockResolvedValueOnce({ signerName: 'Alice', signatureImage: 'data:image/png;base64,abc' });
    render(<SignatureSettings />);
    await waitFor(() => {
      expect(screen.getByAltText('Signature enregistrée')).toBeInTheDocument();
    });
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
  });

  it('uploads valid PNG file and enables save', async () => {
    mockSaveSignature.mockResolvedValueOnce({ signerName: 'Bob', signatureImage: 'data:image/png;base64,xyz' });
    render(<SignatureSettings />);
    await waitFor(() => screen.getByRole('tab', { name: /importer/i }));

    fireEvent.click(screen.getByRole('tab', { name: /importer/i }));

    const file = new File(['(binary)'], 'sig.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 });
    const input = screen.getByLabelText(/fichier/i);
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('rejects oversized file with inline error', async () => {
    render(<SignatureSettings />);
    await waitFor(() => screen.getByRole('tab', { name: /importer/i }));
    fireEvent.click(screen.getByRole('tab', { name: /importer/i }));

    const file = new File(['x'.repeat(600 * 1024)], 'big.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 600 * 1024 });
    fireEvent.change(screen.getByLabelText(/fichier/i), { target: { files: [file] } });

    expect(screen.getByRole('alert')).toHaveTextContent(/trop volumineux/i);
  });

  it('rejects unsupported file type with inline error', async () => {
    render(<SignatureSettings />);
    await waitFor(() => screen.getByRole('tab', { name: /importer/i }));
    fireEvent.click(screen.getByRole('tab', { name: /importer/i }));

    const file = new File(['data'], 'sig.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 1024 });
    fireEvent.change(screen.getByLabelText(/fichier/i), { target: { files: [file] } });

    expect(screen.getByRole('alert')).toHaveTextContent(/format.*invalide/i);
  });

  it('saves after drawing and entering a name', async () => {
    mockSaveSignature.mockResolvedValueOnce({ signerName: 'Alice', signatureImage: 'data:image/png;base64,abc' });
    render(<SignatureSettings />);
    await waitFor(() => screen.getByTestId('signature-canvas'));

    fireEvent.click(screen.getByTestId('signature-canvas'));
    fireEvent.change(screen.getByPlaceholderText(/prénom nom/i), { target: { value: 'Alice' } });
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    await waitFor(() => {
      expect(mockSaveSignature).toHaveBeenCalledWith('Alice', expect.any(String));
    });
    await waitFor(() => {
      expect(screen.getByAltText('Signature enregistrée')).toBeInTheDocument();
    });
  });

  it('deletes saved signature and returns to editor', async () => {
    mockGetSignature.mockResolvedValueOnce({ signerName: 'Alice', signatureImage: 'data:image/png;base64,abc' });
    mockDeleteSignature.mockResolvedValueOnce(undefined);
    render(<SignatureSettings />);
    await waitFor(() => screen.getByRole('button', { name: /supprimer/i }));

    fireEvent.click(screen.getByRole('button', { name: /supprimer/i }));
    await waitFor(() => {
      expect(mockDeleteSignature).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enregistrer la signature/i })).toBeInTheDocument();
    });
  });

  it('shows replace UI when clicking Remplacer', async () => {
    mockGetSignature.mockResolvedValueOnce({ signerName: 'Alice', signatureImage: 'data:image/png;base64,abc' });
    render(<SignatureSettings />);
    await waitFor(() => screen.getByRole('button', { name: /remplacer/i }));

    fireEvent.click(screen.getByRole('button', { name: /remplacer/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enregistrer la signature/i })).toBeInTheDocument();
    });
  });
});
