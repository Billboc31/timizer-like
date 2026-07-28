import { forwardRef, useImperativeHandle, useRef } from 'react';

export interface SignatureCanvasHandle {
  toDataURL(): string;
  clear(): void;
}

interface Props {
  onDraw?: () => void;
  width?: number;
  height?: number;
  className?: string;
}

export const SignatureCanvas = forwardRef<SignatureCanvasHandle, Props>(
  ({ onDraw, width = 400, height = 150, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
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
      },
    }));

    function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
      const rect = e.currentTarget.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
      e.currentTarget.setPointerCapture(e.pointerId);
      isDrawing.current = true;
      lastPos.current = getPos(e);
    }

    function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
      if (!isDrawing.current || !lastPos.current) return;
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
    }

    function handlePointerUp() {
      if (isDrawing.current) {
        isDrawing.current = false;
        lastPos.current = null;
        onDraw?.();
      }
    }

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={className}
        style={{ touchAction: 'none', cursor: 'crosshair' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        aria-label="Zone de dessin de la signature"
        role="img"
      />
    );
  },
);

SignatureCanvas.displayName = 'SignatureCanvas';
