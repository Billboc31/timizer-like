import type { ReactNode } from 'react';
import { PageHeader } from '../PageHeader/PageHeader';
import './AppShell.css';

type View = 'selector' | 'history' | 'settings';

interface AppShellProps {
  activeView: View;
  onNavigate: (view: View) => void;
  children: ReactNode;
}

const PAGE_TITLES: Record<View, string> = {
  selector: 'New CRA',
  history: 'CRA History',
  settings: 'Client Settings',
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
            Settings
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
