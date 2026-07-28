import { useEffect, useState } from 'react';
import { listCras, createCra } from '../../api/craClient';
import { getErrorMessage } from '../../api/errorMessages';
import type { CraSummaryDto } from '../../types/cra';
import { CraPeriodNavigator } from '../CraPeriodNavigator/CraPeriodNavigator';
import './CraMonthSelector.css';

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
        <button onClick={() => { loadCras(); }}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="cra-month-selector">
      <CraPeriodNavigator
        month={selectedMonth}
        year={selectedYear}
        disabled={loading || creating}
        onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
      />
      <button onClick={handleAction} disabled={creating}>
        {existingCra ? 'Open CRA' : 'Create CRA'}
      </button>
      {creating && !successMessage && <p>Creating...</p>}
      {successMessage && <p role="status">{successMessage}</p>}
      {createError && <p role="alert">{createError}</p>}
    </div>
  );
}
