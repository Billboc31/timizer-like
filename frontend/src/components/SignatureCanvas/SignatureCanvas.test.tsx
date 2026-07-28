import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createRef } from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { SignatureCanvas } from './SignatureCanvas';
import type { SignatureCanvasHandle } from './SignatureCanvas';

const mockClearRect = vi.fn();
const mockBeginPath = vi.fn();
const mockMoveTo = vi.fn();
const mockLineTo = vi.fn();
const mockStroke = vi.fn();

const mockContext = {
  clearRect: mockClearRect,
  beginPath: mockBeginPath,
  moveTo: mockMoveTo,
  lineTo: mockLineTo,
  stroke: mockStroke,
  strokeStyle: '#000000',
  lineWidth: 2,
  lineCap: 'round',
};

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    mockContext as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
    'data:image/png;base64,testdata',
  );
  Element.prototype.setPointerCapture = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('SignatureCanvas', () => {
  it('renders a canvas element', () => {
    render(<SignatureCanvas />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('toDataURL returns non-empty PNG data URL', () => {
    const ref = createRef<SignatureCanvasHandle>();
    render(<SignatureCanvas ref={ref} />);
    expect(ref.current?.toDataURL()).toBe('data:image/png;base64,testdata');
  });

  it('clear calls clearRect on the canvas context', () => {
    const ref = createRef<SignatureCanvasHandle>();
    render(<SignatureCanvas ref={ref} width={300} height={100} />);
    ref.current?.clear();
    expect(mockClearRect).toHaveBeenCalledWith(0, 0, 300, 100);
  });

  it('calls onDraw callback after pointer up following a draw', () => {
    const onDraw = vi.fn();
    render(<SignatureCanvas onDraw={onDraw} />);
    const canvas = screen.getByRole('img');

    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 20 });
    fireEvent.pointerMove(canvas, { clientX: 30, clientY: 40 });
    fireEvent.pointerUp(canvas);

    expect(onDraw).toHaveBeenCalledOnce();
  });

  it('draws a path when pointer moves while held', () => {
    render(<SignatureCanvas />);
    const canvas = screen.getByRole('img');

    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 20 });
    fireEvent.pointerMove(canvas, { clientX: 50, clientY: 60 });
    fireEvent.pointerUp(canvas);

    expect(mockBeginPath).toHaveBeenCalled();
    expect(mockStroke).toHaveBeenCalled();
  });

  it('does not draw when pointer moves without being held', () => {
    render(<SignatureCanvas />);
    const canvas = screen.getByRole('img');

    fireEvent.pointerMove(canvas, { clientX: 50, clientY: 60 });

    expect(mockBeginPath).not.toHaveBeenCalled();
    expect(mockStroke).not.toHaveBeenCalled();
  });

  it('does not call onDraw if pointer is not down', () => {
    const onDraw = vi.fn();
    render(<SignatureCanvas onDraw={onDraw} />);
    const canvas = screen.getByRole('img');

    fireEvent.pointerUp(canvas);

    expect(onDraw).not.toHaveBeenCalled();
  });
});
