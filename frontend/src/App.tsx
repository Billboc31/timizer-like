import { useState } from 'react';
import { CraMonthSelector } from './components/CraMonthSelector/CraMonthSelector';
import { CalendarGrid } from './components/CalendarGrid/CalendarGrid';
import { CraSummaryPanel } from './components/CraSummaryPanel/CraSummaryPanel';
import { CraHistory } from './components/CraHistory/CraHistory';
import { CraValidation } from './components/CraValidation/CraValidation';
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

  return (
    <div>
      <h1>Timizer Like</h1>
      <nav>
        <button onClick={() => { setView('selector'); }}>New CRA</button>
        <button onClick={() => { setView('history'); }}>History</button>
      </nav>
      {view === 'selector' ? (
        <CraMonthSelector onOpen={handleOpen} />
      ) : (
        <CraHistory onOpen={handleOpen} />
      )}
      <CraSummaryPanel cra={cra} loading={false} error={null} />
      <CalendarGrid cra={cra} loading={false} error={null} />
      <CraValidation cra={cra} onValidated={handleCraValidated} />
    </div>
  );
}
