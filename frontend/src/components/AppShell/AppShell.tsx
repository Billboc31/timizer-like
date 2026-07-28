import type { ReactNode } from 'react';
import { PageHeader } from '../PageHeader/PageHeader';
import './AppShell.css';

export type AppView = 'selector' | 'history' | 'settings';

interface AppShellProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  children: ReactNode;
}

const PAGE_TITLES: Record<AppView, string> = {
  selector: 'New CRA',
  history: 'CRA History',
  settings: 'Paramètres',
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
          <button
            className="app-shell__nav-item"
            aria-current={activeView === 'settings' ? 'page' : undefined}
            onClick={() => onNavigate('settings')}
          >
            Paramètres
          </button>
        </nav>
      </header>
      <main className="app-shell__main">
        <PageHeader title={PAGE_TITLES[activeView]} />
        {children}
      </main>
    </div>
  );
}
