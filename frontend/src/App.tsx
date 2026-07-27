import { useState } from 'react';
import { CraMonthSelector } from './components/CraMonthSelector/CraMonthSelector';
import { CalendarGrid } from './components/CalendarGrid/CalendarGrid';
import { CraSummaryPanel } from './components/CraSummaryPanel/CraSummaryPanel';
import { CraHistory } from './components/CraHistory/CraHistory';
import { CraValidation } from './components/CraValidation/CraValidation';
import { AppShell } from './components/AppShell/AppShell';
import { getCra, updateDay } from './api/craClient';
import { getErrorMessage } from './api/errorMessages';
import type { CraSummaryDto, CraDetails } from './types/cra';
import type { CraDetailsDto } from './api/types';

function dtoToDetails(dto: CraDetailsDto): CraDetails {
  return {
    id: dto.id,
    month: dto.month,
    year: dto.year,
    totalWorkedDays: dto.totalWorkedDays,
    status: dto.status,
    days: dto.days.map(d => ({ day: d.day, worked: d.worked, note: d.note ?? '' })),
  };
}

type View = 'selector' | 'history';

export default function App() {
  const [view, setView] = useState<View>('selector');
  const [cra, setCra] = useState<CraDetails | null>(null);
  const [craLoading, setCraLoading] = useState(false);
  const [craError, setCraError] = useState<string | null>(null);
  const [lastCraId, setLastCraId] = useState<number | null>(null);
  const [updatingDay, setUpdatingDay] = useState<number | null>(null);
  const [dayUpdateError, setDayUpdateError] = useState<string | null>(null);

  const loadCra = (id: number) => {
    setCraLoading(true);
    setCraError(null);
    setCra(null);
    getCra(id)
      .then(dto => {
        setCra(dtoToDetails(dto));
        setCraLoading(false);
      })
      .catch(err => {
        setCraError(getErrorMessage(err));
        setCraLoading(false);
      });
  };

  const handleOpen = (summary: CraSummaryDto) => {
    setLastCraId(summary.id);
    loadCra(summary.id);
  };

  const handleCraValidated = (updated: CraDetailsDto) => {
    setCra(dtoToDetails(updated));
  };

  const handleDayClick = (day: number, newValue: 0 | 0.5 | 1) => {
    if (!cra) return;
    setUpdatingDay(day);
    setDayUpdateError(null);
    const isoDate = `${cra.year}-${String(cra.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    updateDay(cra.id, isoDate, { workValue: newValue })
      .then(dto => {
        setCra(dtoToDetails(dto));
        setUpdatingDay(null);
      })
      .catch(err => {
        setDayUpdateError(getErrorMessage(err));
        setUpdatingDay(null);
      });
  };

  return (
    <AppShell activeView={view} onNavigate={setView}>
      {view === 'selector' ? (
        <CraMonthSelector onOpen={handleOpen} />
      ) : (
        <CraHistory onOpen={handleOpen} />
      )}
      <CraSummaryPanel cra={cra} loading={craLoading} error={craError} />
      <CalendarGrid
        cra={cra}
        loading={craLoading}
        error={craError}
        onRetry={lastCraId !== null ? () => loadCra(lastCraId) : undefined}
        onDayClick={cra?.status !== 'VALIDATED' ? handleDayClick : undefined}
        updatingDay={updatingDay}
        dayUpdateError={dayUpdateError}
      />
      <CraValidation cra={cra} onValidated={handleCraValidated} />
    </AppShell>
  );
}
