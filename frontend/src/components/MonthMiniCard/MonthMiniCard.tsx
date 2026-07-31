import type { CraDetailsDto } from '../../api/types';
import './MonthMiniCard.css';

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const DAY_NAMES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

interface Props {
  month: number;
  year: number;
  cra: CraDetailsDto | undefined;
  today: Date;
  onClick: () => void;
}

export function MonthMiniCard({ month, year, cra, today, onClick }: Props) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDate = new Date(year, month - 1, 1);
  // Convert Sunday=0 to Monday-first: Mon=0, Tue=1, ..., Sun=6
  const firstWeekday = (firstDate.getDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const workedTotal = cra
    ? cra.days.reduce((sum, d) => sum + d.worked, 0)
    : 0;

  return (
    <button
      className="month-mini-card"
      onClick={onClick}
      aria-label={`${MONTH_NAMES[month - 1]} ${year} — ${workedTotal} jour(s) travaillé(s)`}
      type="button"
    >
      <div className="month-mini-card__header">
        {MONTH_NAMES[month - 1]} {year}
      </div>

      <div className="month-mini-card__days-header" aria-hidden="true">
        {DAY_NAMES.map((name, i) => (
          <span key={i} className="month-mini-card__day-name">{name}</span>
        ))}
      </div>

      <div className="month-mini-card__grid" aria-hidden="true">
        {cells.map((day, i) => {
          if (day === null) {
            return <span key={`blank-${i}`} className="month-mini-card__day month-mini-card__day--blank" />;
          }

          const date = new Date(year, month - 1, day);
          const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const isToday =
            year === today.getFullYear() &&
            month === today.getMonth() + 1 &&
            day === today.getDate();

          let worked = 0;
          if (cra) {
            const entry = cra.days.find(d => d.day === day);
            worked = entry?.worked ?? 0;
          }

          let stateClass: string;
          if (isWeekend) stateClass = 'month-mini-card__day--weekend';
          else if (worked === 1) stateClass = 'month-mini-card__day--worked';
          else if (worked === 0.5) stateClass = 'month-mini-card__day--half';
          else stateClass = 'month-mini-card__day--empty';

          const todayClass = isToday ? ' month-mini-card__day--today' : '';

          return (
            <span
              key={day}
              className={`month-mini-card__day ${stateClass}${todayClass}`}
            >
              {day}
            </span>
          );
        })}
      </div>

      <div className="month-mini-card__footer">
        {workedTotal} j travaillé{workedTotal !== 1 ? 's' : ''}
      </div>
    </button>
  );
}
