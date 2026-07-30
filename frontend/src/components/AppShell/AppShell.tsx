import { useEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { PageHeader } from '../PageHeader/PageHeader';
import { AppSidebar } from '../AppSidebar/AppSidebar';
import './AppShell.css';

export type AppView = 'overview' | 'selector' | 'history' | 'settings';

interface AppShellProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onNewCra: () => void;
  newCraTriggerRef?: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
}

const PAGE_TITLES: Record<AppView, string> = {
  overview: 'Mes CRA',
  selector: 'New CRA',
  history: 'CRA History',
  settings: 'Paramètres',
};

export function AppShell({ activeView, onNavigate, onNewCra, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const prevSidebarOpen = useRef(false);

  useEffect(() => {
    if (prevSidebarOpen.current && !sidebarOpen) {
      hamburgerRef.current?.focus();
    }
    prevSidebarOpen.current = sidebarOpen;
  }, [sidebarOpen]);

  return (
    <div className="app-shell">
      <AppSidebar
        activeView={activeView}
        onNavigate={(view) => (view === 'selector' ? onNewCra() : onNavigate(view))}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-shell__mobile-topbar">
        <button
          ref={hamburgerRef}
          className="app-shell__hamburger"
          aria-label="Open navigation menu"
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>
        <span className="app-shell__brand">Timizer Like</span>
      </div>
      <main className="app-shell__main">
        <PageHeader title={PAGE_TITLES[activeView]} />
        {children}
      </main>
    </div>
  );
}
