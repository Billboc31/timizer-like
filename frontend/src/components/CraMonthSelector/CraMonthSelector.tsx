import { useEffect, useState } from 'react';
import { listCras, createCra } from '../../api/craClient';
import { getErrorMessage } from '../../api/errorMessages';
import type { CraSummaryDto } from '../../types/cra';
import { SectionHeading } from '../SectionHeading/SectionHeading';
import './CraMonthSelector.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  onOpen: (cra: CraSummaryDto) => void;
}

export function CraMonthSelector({ onOpen }: Props) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [cras, setCras] = useState<CraSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadCras = (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    listCras({ signal })
      .then(data => {
        setCras(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(getErrorMessage(err));
        setLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    loadCras(controller.signal);
    return () => { controller.abort(); };
  }, []);

  const existingCra = cras.find(c => c.month === selectedMonth && c.year === selectedYear) ?? null;
  const periodLabel = `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;

  const handleAction = () => {
    if (existingCra) {
      onOpen(existingCra);
      return;
    }
    setCreating(true);
    setCreateError(null);
    createCra(selectedYear, selectedMonth)
      .then(created => {
        const summary: CraSummaryDto = {
          id: created.id,
          month: created.month,
          year: created.year,
          totalWorkedDays: created.totalWorkedDays,
          status: created.status,
          validationDate: created.validationDate ?? null,
        };
        setCras(prev => [...prev, summary]);
        setSuccessMessage('CRA créé avec succès.');
        setTimeout(() => {
          setSuccessMessage(null);
          setCreating(false);
          onOpen(summary);
        }, 3000);
      })
      .catch((err: unknown) => {
        setCreateError(getErrorMessage(err));
        setCreating(false);
      });
  };

  if (loading) return <p>Loading...</p>;
  if (error) {
    return (
      <div>
        <p role="alert">{error}</p>
        <button onClick={loadCras}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="cra-month-selector">
      <SectionHeading title={periodLabel} />
      <div className="cra-month-selector__controls">
        <div className="cra-month-selector__field">
          <label htmlFor="month-select">Month</label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
        <div className="cra-month-selector__field">
          <label htmlFor="year-input">Year</label>
          <input
            id="year-input"
            type="number"
            value={selectedYear}
            min={2000}
            onChange={e => setSelectedYear(Number(e.target.value))}
          />
        </div>
        <button onClick={handleAction} disabled={creating}>
          {existingCra ? 'Open CRA' : 'Create CRA'}
        </button>
      </div>
      {creating && !successMessage && <p>Creating...</p>}
      {successMessage && <p role="status">{successMessage}</p>}
      {createError && <p role="alert">{createError}</p>}
    </div>
  );
}
