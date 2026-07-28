import { useState } from 'react';
import './CalendarGrid.css';
import type { CraDetails } from '../../types/cra';
import type { CraDetailsDto } from '../../api/types';
import { updateDay } from '../../api/craClient';
import { SectionHeading } from '../SectionHeading/SectionHeading';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function toEuropeanDay(jsDay: number): number {
  return (jsDay + 6) % 7;
}

function nextWorkValue(current: number): 0 | 0.5 | 1 {
  if (current === 0) return 1;
  if (current === 1) return 0.5;
  return 0;
}

function stateLabel(worked: number): string {
  if (worked === 1) return 'worked';
  if (worked === 0.5) return 'half-day';
  return 'not worked';
}

function CalendarLegend() {
  return (
    <div className="calendar-legend" aria-label="Legend">
      <div className="calendar-legend__item">
        <span className="calendar-legend__swatch calendar-legend__swatch--worked" aria-hidden="true" />
        <span>Worked</span>
      </div>
      <div className="calendar-legend__item">
        <span className="calendar-legend__swatch calendar-legend__swatch--half" aria-hidden="true" />
        <span>Half-day</span>
      </div>
      <div className="calendar-legend__item">
        <span className="calendar-legend__swatch calendar-legend__swatch--rest" aria-hidden="true" />
        <span>Not worked</span>
      </div>
      <div className="calendar-legend__item">
        <span className="calendar-legend__swatch calendar-legend__swatch--weekend" aria-hidden="true" />
        <span>Weekend</span>
      </div>
    </div>
  );
}

interface Props {
  cra: CraDetails | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onDayClick?: (day: number, newValue: 0 | 0.5 | 1) => void;
  updatingDay?: number | null;
  dayUpdateError?: string | null;
  onDayChange?: (updatedCra: CraDetailsDto) => void;
}

export function CalendarGrid({ cra, loading, error, onRetry, onDayClick, updatingDay, dayUpdateError, onDayChange }: Props) {
  const [internalUpdatingDay, setInternalUpdatingDay] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  if (loading) {
    return <div className="calendar-loading">Loading...</div>;
  }
  if (error) {
    return (
      <div className="calendar-error">
        <p>{error}</p>
        {onRetry && <button onClick={onRetry}>Réessayer</button>}
      </div>
    );
  }
  if (!cra) {
    return <div className="calendar-empty">No CRA data available.</div>;
  }

  const daysInMonth = new Date(cra.year, cra.month, 0).getDate();
  const dayMap = new Map(cra.days.map(d => [d.day, d]));
  const isValidated = cra.status === 'VALIDATED';
  const isBusy = internalUpdatingDay !== null;

  const firstColOffset = toEuropeanDay(new Date(cra.year, cra.month - 1, 1).getDay());

  async function handleDayClickInternal(day: number, currentWorked: number) {
    if (isBusy) return;
    setApiError(null);
    setInternalUpdatingDay(day);
    const dateStr = `${cra.year}-${String(cra.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    try {
      const dto = await updateDay(cra.id, dateStr, { workValue: nextWorkValue(currentWorked) });
      onDayChange?.(dto);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setInternalUpdatingDay(null);
    }
  }

  return (
    <>
      <div className="calendar-grid-wrapper">
        <SectionHeading title={`${MONTH_NAMES[cra.month - 1]} ${cra.year}`} />
        <div className="calendar-grid">
          {WEEKDAY_HEADERS.map(h => (
            <div key={h} className="calendar-grid__weekday-header" aria-hidden="true">{h}</div>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const jsDay = new Date(cra.year, cra.month - 1, day).getDay();
            const europeanDay = toEuropeanDay(jsDay);
            const isWeekend = jsDay === 0 || jsDay === 6;
            const worked = dayMap.get(day)?.worked ?? 0;
            const isUpdating = day === updatingDay || day === internalUpdatingDay;

            const stateClass = isWeekend
              ? 'day-cell--weekend'
              : worked === 1
                ? 'day-cell--worked'
                : worked === 0.5
                  ? 'day-cell--half'
                  : 'day-cell--rest';

            const interactive = !isValidated && !isWeekend;

            const handleClick = () => {
              if (!interactive || isUpdating || isBusy) return;
              if (onDayClick) {
                onDayClick(day, nextWorkValue(worked));
              } else {
                void handleDayClickInternal(day, worked);
              }
            };

            const handleKeyDown = (e: React.KeyboardEvent) => {
              if ((e.key === 'Enter' || e.key === ' ') && interactive && !isUpdating && !isBusy) {
                e.preventDefault();
                if (onDayClick) {
                  onDayClick(day, nextWorkValue(worked));
                } else {
                  void handleDayClickInternal(day, worked);
                }
              }
            };

            return (
              <div
                key={day}
                className={`day-cell ${stateClass}${isValidated ? ' day-cell--disabled' : ''}${isUpdating ? ' day-cell--updating' : ''}`}
                data-testid="day-cell"
                role={interactive ? 'button' : undefined}
                tabIndex={interactive ? 0 : -1}
                aria-label={`${WEEKDAY_FULL[europeanDay]} ${day} — ${stateLabel(worked)}`}
                aria-disabled={(isBusy || isUpdating) || undefined}
                style={day === 1 ? { gridColumn: firstColOffset + 1 } : undefined}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
              >
                <span className="day-cell__number">{day}</span>
                <span className="day-cell__weekday">{WEEKDAY_HEADERS[europeanDay]}</span>
                {!isWeekend && <span className="day-cell__worked">{isUpdating ? '…' : worked}</span>}
              </div>
            );
          })}
        </div>
        <CalendarLegend />
      </div>
      {(dayUpdateError || apiError) && (
        <p role="alert" className="calendar-grid__day-update-error">{dayUpdateError ?? apiError}</p>
      )}
    </>
  );
}
