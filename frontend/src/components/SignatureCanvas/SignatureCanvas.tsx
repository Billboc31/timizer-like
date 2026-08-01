import { forwardRef, useImperativeHandle, useRef } from 'react';
import './SignatureCanvas.css';

export interface SignatureCanvasHandle {
  toDataURL(): string;
  clear(): void;
  isEmpty(): boolean;
}

interface Props extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  onDraw?: () => void;
  width?: number;
  height?: number;
  disabled?: boolean;
}

export const SignatureCanvas = forwardRef<SignatureCanvasHandle, Props>(
  ({ onDraw, width = 600, height = 200, className, disabled = false, ...rest }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const hasMoved = useRef(false);
    const hasDrawn = useRef(false);
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    useImperativeHandle(ref, () => ({
      toDataURL() {
        return canvasRef.current?.toDataURL('image/png') ?? '';
      },
      clear() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        hasDrawn.current = false;
      },
      isEmpty() {
        return !hasDrawn.current;
      },
    }));

    function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    }

    function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
      if (disabled) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      isDrawing.current = true;
      hasMoved.current = false;
      lastPos.current = getPos(e);
    }

    function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
      if (disabled || !isDrawing.current || !lastPos.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
      lastPos.current = pos;
      hasMoved.current = true;
    }

    function handlePointerUp() {
      if (isDrawing.current) {
        isDrawing.current = false;
        lastPos.current = null;
        if (hasMoved.current) {
          hasDrawn.current = true;
          onDraw?.();
        }
        hasMoved.current = false;
      }
    }

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`signature-canvas${disabled ? ' signature-canvas--disabled' : ''}${className ? ' ' + className : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        aria-label="Zone de dessin de la signature"
        role="img"
        {...rest}
      />
    );
  },
);

SignatureCanvas.displayName = 'SignatureCanvas';
