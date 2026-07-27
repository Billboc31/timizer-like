import type { ReactNode } from 'react';
import './AppShell.css';

interface AppShellProps {
  activeView: 'selector' | 'history';
  onNavigate: (view: 'selector' | 'history') => void;
  children: ReactNode;
}

const PAGE_TITLES: Record<'selector' | 'history', string> = {
  selector: 'New CRA',
  history: 'CRA History',
};

export function AppShell({ activeView, onNavigate, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <span className="app-shell__brand">Timizer Like</span>
        <nav className="app-shell__nav" aria-label="Main navigation">
          <button
            className="app-shell__nav-item"
            aria-current={activeView === 'selector' ? 'page' : undefined}
            onClick={() => onNavigate('selector')}
          >
            New CRA
          </button>
          <button
            className="app-shell__nav-item"
            aria-current={activeView === 'history' ? 'page' : undefined}
            onClick={() => onNavigate('history')}
          >
            History
          </button>
        </nav>
      </header>
      <main className="app-shell__main">
        <h2 className="app-shell__page-title">{PAGE_TITLES[activeView]}</h2>
        {children}
      </main>
    </div>
  );
}
