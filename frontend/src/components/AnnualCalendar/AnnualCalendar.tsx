import { useEffect, useRef, useState } from 'react';
import { getCra, listCras } from '../../api/craClient';
import { getErrorMessage } from '../../api/errorMessages';
import type { CraDetailsDto, CraSummaryDto } from '../../api/types';
import { MonthMiniCard } from '../MonthMiniCard/MonthMiniCard';
import './AnnualCalendar.css';

const STORAGE_KEY = 'annual-calendar-year';

interface Props {
  onOpenCra: (cra: CraSummaryDto) => void;
  onNewCra: (month: number, year: number) => void;
  refreshKey?: number;
}

function SkeletonGrid() {
  return (
    <div className="annual-calendar-grid" aria-busy="true" aria-label="Chargement du calendrier annuel">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="annual-calendar-skeleton-card" aria-hidden="true" />
      ))}
    </div>
  );
}

export function AnnualCalendar({ onOpenCra, onNewCra, refreshKey }: Props) {
  const today = useRef(new Date()).current;
  const currentYear = today.getFullYear();

  const [displayedYear, setDisplayedYear] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return currentYear;
  });

  const [summaries, setSummaries] = useState<CraSummaryDto[] | null>(null);
  const [detailsMap, setDetailsMap] = useState<Map<string, CraDetailsDto>>(new Map());
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingYear, setLoadingYear] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tracks which CRA IDs have already been fetched to avoid duplicate requests
  const loadedIds = useRef(new Set<number>());
  const [loadKey, setLoadKey] = useState(0);

  // Initial load: fetch all summaries
  useEffect(() => {
    const controller = new AbortController();
    setInitialLoading(true);
    setError(null);
    setSummaries(null);
    setDetailsMap(new Map());
    loadedIds.current.clear();

    listCras({ signal: controller.signal })
      .then(data => {
        setSummaries(data);
        setInitialLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(getErrorMessage(err));
        setInitialLoading(false);
      });

    return () => { controller.abort(); };
  }, [loadKey, refreshKey]);

  // Fetch day-level details for any CRAs in the displayed year not yet loaded
  useEffect(() => {
    if (summaries === null) return;
    localStorage.setItem(STORAGE_KEY, String(displayedYear));

    const yearSums = summaries.filter(s => s.year === displayedYear);
    const needed = yearSums.filter(s => !loadedIds.current.has(s.id));
    if (needed.length === 0) return;

    setLoadingYear(true);
    Promise.all(needed.map(s => getCra(s.id)))
      .then(dets => {
        dets.forEach(d => loadedIds.current.add(d.id));
        setDetailsMap(prev => {
          const next = new Map(prev);
          dets.forEach(d => next.set(`${d.year}-${d.month}`, d));
          return next;
        });
        setLoadingYear(false);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err));
        setLoadingYear(false);
      });
  }, [summaries, displayedYear]);

  const navigateYear = (delta: number) => {
    setDisplayedYear(prev => prev + delta);
  };

  const goToCurrentYear = () => {
    setDisplayedYear(currentYear);
  };

  const handleCardClick = (month: number) => {
    if (!summaries) return;
    const summary = summaries.find(s => s.year === displayedYear && s.month === month);
    if (summary) {
      onOpenCra(summary);
    } else {
      onNewCra(month, displayedYear);
    }
  };

  if (initialLoading) return <SkeletonGrid />;

  if (error) {
    return (
      <div>
        <div role="alert" className="annual-calendar__error">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </div>
        <button
          className="annual-calendar__retry"
          onClick={() => { setLoadKey(k => k + 1); }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  const isCurrentYear = displayedYear === currentYear;

  return (
    <div className="annual-calendar">
      <div className="annual-calendar-header">
        <button
          className="annual-calendar-header__btn"
          onClick={() => navigateYear(-1)}
          aria-label="Année précédente"
        >
          ◀
        </button>
        <span className="annual-calendar-header__year" aria-live="polite">
          {displayedYear}
        </span>
        <button
          className="annual-calendar-header__btn"
          onClick={() => navigateYear(1)}
          aria-label="Année suivante"
        >
          ▶
        </button>
        {!isCurrentYear && (
          <button
            className="annual-calendar-header__today"
            onClick={goToCurrentYear}
          >
            Aujourd'hui
          </button>
        )}
      </div>

      {loadingYear && (
        <div className="annual-calendar__loading-bar" aria-label="Chargement des données" />
      )}

      <div className="annual-calendar-grid">
        {Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const cra = detailsMap.get(`${displayedYear}-${month}`);
          return (
            <MonthMiniCard
              key={month}
              month={month}
              year={displayedYear}
              cra={cra}
              today={today}
              onClick={() => handleCardClick(month)}
            />
          );
        })}
      </div>
    </div>
  );
}
