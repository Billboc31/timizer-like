import type { ReactNode } from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  status?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, status, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__main">
        <h1 className="page-header__title">{title}</h1>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
      {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      {status && <span className="page-header__status">{status}</span>}
    </header>
  );
}
