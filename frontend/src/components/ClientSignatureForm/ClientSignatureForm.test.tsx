import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { ClientSignatureForm } from './ClientSignatureForm';
import { submitClientSignature } from '../../api/craPublicClient';
import { ApiError } from '../../api/apiError';

vi.mock('../../api/craPublicClient', () => ({
  submitClientSignature: vi.fn(),
}));

const mockGetContext = vi.fn(() => ({
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  strokeStyle: '#000',
  lineWidth: 2,
  lineCap: 'round',
}));

const mockToDataURL = vi.fn(() => 'data:image/png;base64,abc123');

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(mockGetContext as unknown as typeof HTMLCanvasElement.prototype.getContext);
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(mockToDataURL);
  Element.prototype.setPointerCapture = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

const mockSubmit = vi.mocked(submitClientSignature);

function drawOnCanvas(canvas: Element) {
  fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
  fireEvent.pointerMove(canvas, { clientX: 50, clientY: 50 });
  fireEvent.pointerUp(canvas);
}

describe('ClientSignatureForm', () => {
  it('submit button is disabled initially', () => {
    render(<ClientSignatureForm token="tok" onSuccess={vi.fn()} />);
    expect(screen.getByTestId('submit-button')).toBeDisabled();
  });

  it('submit button stays disabled without signer name', () => {
    render(<ClientSignatureForm token="tok" onSuccess={vi.fn()} />);
    fireEvent.click(screen.getByTestId('consent-checkbox'));
    drawOnCanvas(screen.getByRole('img'));
    expect(screen.getByTestId('submit-button')).toBeDisabled();
  });

  it('submit button stays disabled without consent', () => {
    render(<ClientSignatureForm token="tok" onSuccess={vi.fn()} />);
    fireEvent.change(screen.getByTestId('signer-name-input'), { target: { value: 'Bob' } });
    drawOnCanvas(screen.getByRole('img'));
    expect(screen.getByTestId('submit-button')).toBeDisabled();
  });

  it('submit button stays disabled without signature', () => {
    render(<ClientSignatureForm token="tok" onSuccess={vi.fn()} />);
    fireEvent.change(screen.getByTestId('signer-name-input'), { target: { value: 'Bob' } });
    fireEvent.click(screen.getByTestId('consent-checkbox'));
    expect(screen.getByTestId('submit-button')).toBeDisabled();
  });

  it('submit button enabled when all three conditions met', () => {
    render(<ClientSignatureForm token="tok" onSuccess={vi.fn()} />);
    fireEvent.change(screen.getByTestId('signer-name-input'), { target: { value: 'Bob' } });
    fireEvent.click(screen.getByTestId('consent-checkbox'));
    drawOnCanvas(screen.getByRole('img'));
    expect(screen.getByTestId('submit-button')).not.toBeDisabled();
  });

  it('clear button resets pad state and re-disables submit', () => {
    render(<ClientSignatureForm token="tok" onSuccess={vi.fn()} />);
    fireEvent.change(screen.getByTestId('signer-name-input'), { target: { value: 'Bob' } });
    fireEvent.click(screen.getByTestId('consent-checkbox'));
    drawOnCanvas(screen.getByRole('img'));
    expect(screen.getByTestId('submit-button')).not.toBeDisabled();

    fireEvent.click(screen.getByTestId('clear-button'));
    expect(screen.getByTestId('submit-button')).toBeDisabled();
  });

  it('calls submitClientSignature with correct payload on submit', async () => {
    mockSubmit.mockResolvedValueOnce(undefined as unknown as void);
    const onSuccess = vi.fn();

    render(<ClientSignatureForm token="my-token" onSuccess={onSuccess} />);
    fireEvent.change(screen.getByTestId('signer-name-input'), { target: { value: 'Bob Martin' } });
    fireEvent.change(screen.getByTestId('signer-role-input'), { target: { value: 'Manager' } });
    fireEvent.click(screen.getByTestId('consent-checkbox'));
    drawOnCanvas(screen.getByRole('img'));
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(mockSubmit).toHaveBeenCalledWith('my-token', {
      signerName: 'Bob Martin',
      signerRole: 'Manager',
      consentApproved: true,
      signatureImageBase64: 'data:image/png;base64,abc123',
    });
  });

  it('calls onSuccess with signer name and date', async () => {
    mockSubmit.mockResolvedValueOnce(undefined as unknown as void);
    const onSuccess = vi.fn();

    render(<ClientSignatureForm token="tok" onSuccess={onSuccess} />);
    fireEvent.change(screen.getByTestId('signer-name-input'), { target: { value: 'Alice' } });
    fireEvent.click(screen.getByTestId('consent-checkbox'));
    drawOnCanvas(screen.getByRole('img'));
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    const [name, date] = onSuccess.mock.calls[0];
    expect(name).toBe('Alice');
    expect(date).toBeInstanceOf(Date);
  });

  it('shows error message on API failure', async () => {
    mockSubmit.mockRejectedValueOnce(new Error('Server error'));

    render(<ClientSignatureForm token="tok" onSuccess={vi.fn()} />);
    fireEvent.change(screen.getByTestId('signer-name-input'), { target: { value: 'Bob' } });
    fireEvent.click(screen.getByTestId('consent-checkbox'));
    drawOnCanvas(screen.getByRole('img'));
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent('Une erreur est survenue');
  });

  it('shows already-consumed message for token_already_consumed error', async () => {
    mockSubmit.mockRejectedValueOnce(new ApiError('token_already_consumed', 410));

    render(<ClientSignatureForm token="tok" onSuccess={vi.fn()} />);
    fireEvent.change(screen.getByTestId('signer-name-input'), { target: { value: 'Bob' } });
    fireEvent.click(screen.getByTestId('consent-checkbox'));
    drawOnCanvas(screen.getByRole('img'));
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent('déjà été utilisé');
  });

  it('re-enables submit after API failure', async () => {
    mockSubmit.mockRejectedValueOnce(new Error('error'));

    render(<ClientSignatureForm token="tok" onSuccess={vi.fn()} />);
    fireEvent.change(screen.getByTestId('signer-name-input'), { target: { value: 'Bob' } });
    fireEvent.click(screen.getByTestId('consent-checkbox'));
    drawOnCanvas(screen.getByRole('img'));
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByTestId('submit-button')).not.toBeDisabled();
  });

  it('omits signerRole when blank', async () => {
    mockSubmit.mockResolvedValueOnce(undefined as unknown as void);
    const onSuccess = vi.fn();

    render(<ClientSignatureForm token="tok" onSuccess={onSuccess} />);
    fireEvent.change(screen.getByTestId('signer-name-input'), { target: { value: 'Bob' } });
    fireEvent.click(screen.getByTestId('consent-checkbox'));
    drawOnCanvas(screen.getByRole('img'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-button'));
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(mockSubmit).toHaveBeenCalledWith('tok', expect.objectContaining({
      signerRole: undefined,
    }));
  });
});
