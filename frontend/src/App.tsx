import { CraMonthSelector } from './components/CraMonthSelector/CraMonthSelector';
import type { CraSummaryDto } from './types/cra';

export default function App() {
  const handleOpen = (cra: CraSummaryDto) => {
    console.log('Opening CRA:', cra);
  };

  return (
    <div>
      <h1>Timizer Like</h1>
      <CraMonthSelector onOpen={handleOpen} />
    </div>
  );
}
