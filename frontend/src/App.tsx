import { useState } from 'react';
import { CraMonthSelector } from './components/CraMonthSelector/CraMonthSelector';
import { CraSummaryPanel } from './components/CraSummaryPanel/CraSummaryPanel';
import { CraHistory } from './components/CraHistory/CraHistory';
import type { CraSummaryDto, CraDetails } from './types/cra';

type View = 'selector' | 'history';

export default function App() {
  const [view, setView] = useState<View>('selector');
  const [cra, setCra] = useState<CraDetails | null>(null);

  const handleOpen = (summary: CraSummaryDto) => {
    setCra({ ...summary, days: [] });
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
    </div>
  );
}
