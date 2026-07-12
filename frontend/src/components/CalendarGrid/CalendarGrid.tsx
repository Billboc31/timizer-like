import './CalendarGrid.css';
import type { CraDetails } from '../../types/cra';

const WEEKDAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  cra: CraDetails | null;
  loading: boolean;
  error: string | null;
}

export function CalendarGrid({ cra, loading, error }: Props) {
  if (loading) {
    return <div className="calendar-loading">Loading...</div>;
  }
  if (error) {
    return <div className="calendar-error">{error}</div>;
  }
  if (!cra) {
    return <div className="calendar-empty">No CRA data available.</div>;
  }

  const daysInMonth = new Date(cra.year, cra.month, 0).getDate();
  const dayMap = new Map(cra.days.map(d => [d.day, d]));

  return (
    <div className="calendar-grid">
      {Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const date = new Date(cra.year, cra.month - 1, day);
        const weekdayIndex = date.getDay();
        const isWeekend = weekdayIndex === 0 || weekdayIndex === 6;
        const worked = dayMap.get(day)?.worked ?? 0;

        return (
          <div
            key={day}
            className={`day-cell${isWeekend ? ' day-cell--weekend' : ''}`}
            data-testid="day-cell"
          >
            <span className="day-cell__number">{day}</span>
            <span className="day-cell__weekday">{WEEKDAY_ABBR[weekdayIndex]}</span>
            <span className="day-cell__worked">{worked}</span>
          </div>
        );
      })}
    </div>
  );
}
