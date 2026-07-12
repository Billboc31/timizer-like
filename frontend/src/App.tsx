import { useEffect, useState } from 'react';
import { fetchCra } from './api/cra';
import type { CraDetails } from './types/cra';
import { CalendarGrid } from './components/CalendarGrid/CalendarGrid';

export default function App() {
  const [cra, setCra] = useState<CraDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchCra(2026, 7)
      .then(data => {
        setCra(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>CRA — July 2026</h1>
      <CalendarGrid cra={cra} loading={loading} error={error} />
    </div>
  );
}
