import { useState } from 'react';
import { CraMonthSelector } from './components/CraMonthSelector/CraMonthSelector';
import { CraSummaryPanel } from './components/CraSummaryPanel/CraSummaryPanel';
import type { CraSummaryDto, CraDetails } from './types/cra';

export default function App() {
  const [cra, setCra] = useState<CraDetails | null>(null);

  const handleOpen = (summary: CraSummaryDto) => {
    setCra({ ...summary, days: [] });
  };

  return (
    <div>
      <h1>Timizer Like</h1>
      <CraMonthSelector onOpen={handleOpen} />
      <CraSummaryPanel cra={cra} loading={false} error={null} />
    </div>
  );
}
