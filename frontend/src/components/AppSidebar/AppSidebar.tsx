import { useEffect, useRef, useState } from 'react';
import type { AppView } from '../AppShell/AppShell';
import './AppSidebar.css';

interface AppSidebarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MOBILE_MQ = '(max-width: 767px)';

export function AppSidebar({ activeView, onNavigate, isOpen, onClose }: AppSidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(
    () => typeof window.matchMedia === 'function' && window.matchMedia(MOBILE_MQ).matches
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(MOBILE_MQ);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const first = sidebarRef.current?.querySelector<HTMLElement>('button:not(:disabled)');
    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && sidebarRef.current) {
        const focusable = Array.from(
          sidebarRef.current.querySelectorAll<HTMLElement>(
            'button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleNavClick = (view: AppView) => {
    onNavigate(view);
    onClose();
  };

  const isHidden = isMobile && !isOpen;
  const isDialog = isMobile && isOpen;

  return (
    <>
      <div
        className={`app-sidebar__backdrop${isOpen ? ' app-sidebar__backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        id="app-sidebar"
        ref={sidebarRef}
        className={`app-sidebar${isOpen ? ' app-sidebar--open' : ''}`}
        inert={isHidden || undefined}
        role={isDialog ? 'dialog' : undefined}
        aria-modal={isDialog || undefined}
        aria-label={isDialog ? 'Navigation menu' : undefined}
      >
        <div className="app-sidebar__brand">Timizer Like</div>
        <nav aria-label="Main navigation">
          <button
            className="app-sidebar__new-cra"
            aria-current={activeView === 'selector' ? 'page' : undefined}
            onClick={() => handleNavClick('selector')}
          >
            New CRA
          </button>
          <button
            className="app-sidebar__nav-item"
            aria-current={activeView === 'history' ? 'page' : undefined}
            onClick={() => handleNavClick('history')}
          >
            History
          </button>
          <button
            className="app-sidebar__nav-item"
            aria-current={activeView === 'settings' ? 'page' : undefined}
            onClick={() => handleNavClick('settings')}
          >
            Paramètres
          </button>
        </nav>
      </aside>
    </>
  );
}
