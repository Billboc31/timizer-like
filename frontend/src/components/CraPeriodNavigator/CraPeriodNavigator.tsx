import { useRef, useState } from 'react';
import './CraPeriodNavigator.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export interface CraPeriodNavigatorProps {
  month: number;
  year: number;
  disabled?: boolean;
  onChange: (month: number, year: number) => void;
}

export function CraPeriodNavigator({ month, year, disabled, onChange }: CraPeriodNavigatorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const labelRef = useRef<HTMLButtonElement>(null);
  const [jumpMonth, setJumpMonth] = useState(month);
  const [jumpYear, setJumpYear] = useState(year);

  const periodLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  const handlePrev = () => {
    if (month === 1) {
      onChange(12, year - 1);
    } else {
      onChange(month - 1, year);
    }
  };

  const handleNext = () => {
    if (month === 12) {
      onChange(1, year + 1);
    } else {
      onChange(month + 1, year);
    }
  };

  const openDialog = () => {
    setJumpMonth(month);
    setJumpYear(year);
    dialogRef.current?.showModal();
  };

  const handleGo = () => {
    onChange(jumpMonth, jumpYear);
    dialogRef.current?.close();
    labelRef.current?.focus();
  };

  const handleCancel = () => {
    dialogRef.current?.close();
    labelRef.current?.focus();
  };

  const handleDialogCancel = () => {
    labelRef.current?.focus();
  };

  const handleDialogKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'select, input:not(:disabled), button:not(:disabled)'
      ) ?? []
    );
    if (focusable.length < 2) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="cra-period-navigator">
      <button
        className="cra-period-navigator__prev"
        onClick={handlePrev}
        disabled={disabled}
        aria-label="Previous month"
      >
        ‹
      </button>

      <button
        ref={labelRef}
        className="cra-period-navigator__label"
        onClick={openDialog}
        disabled={disabled}
      >
        {periodLabel}
      </button>

      <button
        className="cra-period-navigator__next"
        onClick={handleNext}
        disabled={disabled}
        aria-label="Next month"
      >
        ›
      </button>

      <dialog
        ref={dialogRef}
        className="cra-period-navigator__dialog"
        aria-modal="true"
        aria-labelledby="period-navigator-dialog-title"
        onKeyDown={handleDialogKeyDown}
        onCancel={handleDialogCancel}
      >
        <h2 id="period-navigator-dialog-title">Jump to period</h2>
        <div className="cra-period-navigator__dialog-fields">
          <div className="cra-period-navigator__dialog-field">
            <label htmlFor="jump-month">Month</label>
            <select
              id="jump-month"
              value={jumpMonth}
              onChange={e => setJumpMonth(Number(e.target.value))}
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>
          <div className="cra-period-navigator__dialog-field">
            <label htmlFor="jump-year">Year</label>
            <input
              id="jump-year"
              type="number"
              value={jumpYear}
              min={2000}
              onChange={e => setJumpYear(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="cra-period-navigator__dialog-actions">
          <button className="cra-period-navigator__go" onClick={handleGo}>Go</button>
          <button className="cra-period-navigator__cancel" onClick={handleCancel}>Cancel</button>
        </div>
      </dialog>
    </div>
  );
}
