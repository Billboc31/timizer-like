import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { CraSignaturePage } from './public/CraSignaturePage';

const signMatch = window.location.pathname.match(/^\/sign\/(.+)$/);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {signMatch ? <CraSignaturePage token={signMatch[1]} /> : <App />}
    </ErrorBoundary>
  </StrictMode>,
);
