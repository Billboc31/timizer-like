import { useState } from 'react';
import { CraMonthSelector } from './components/CraMonthSelector/CraMonthSelector';
import { CalendarGrid } from './components/CalendarGrid/CalendarGrid';
import { CraSummaryPanel } from './components/CraSummaryPanel/CraSummaryPanel';
import { CraHistory } from './components/CraHistory/CraHistory';
import { CraValidation } from './components/CraValidation/CraValidation';
import { AppShell } from './components/AppShell/AppShell';
import { updateDay } from './api/craClient';
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

  const handleOpen = (summary: CraSummaryDto) => {
    setCra({ ...summary, days: [] });
  };

  const handleCraValidated = (updated: CraDetailsDto) => {
    setCra(dtoToDetails(updated));
  };

  const handleDayClick = async (day: number, newValue: 0 | 0.5 | 1) => {
    if (!cra) return;
    const dateStr = `${cra.year}-${String(cra.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const updated = await updateDay(cra.id, dateStr, { workValue: newValue });
    setCra(dtoToDetails(updated));
  };

  return (
    <AppShell activeView={view} onNavigate={setView}>
      {view === 'selector' ? (
        <CraMonthSelector onOpen={handleOpen} />
      ) : (
        <CraHistory onOpen={handleOpen} />
      )}
      <CraSummaryPanel cra={cra} loading={false} error={null} />
      <CalendarGrid
        cra={cra}
        loading={false}
        error={null}
        onDayClick={cra?.status !== 'VALIDATED' ? handleDayClick : undefined}
      />
      <CraValidation cra={cra} onValidated={handleCraValidated} />
    </AppShell>
  );
}
