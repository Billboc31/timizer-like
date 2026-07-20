import { useEffect, useState } from 'react';
import { listCras, createCra } from '../../api/cra';
import type { CraSummaryDto } from '../../types/cra';

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

  useEffect(() => {
    listCras()
      .then(data => {
        setCras(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load CRAs');
        setLoading(false);
      });
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
        setCreating(false);
        onOpen(summary);
      })
      .catch((err: unknown) => {
        setCreateError(err instanceof Error ? err.message : 'Failed to create CRA');
        setCreating(false);
      });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <div>
      <h2>{periodLabel}</h2>
      <div>
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
      <div>
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
      {creating && <p>Creating...</p>}
      {createError && <p role="alert">{createError}</p>}
    </div>
  );
}
