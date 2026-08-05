import { useState, useEffect, useRef } from 'react';
import { CraMonthSelector } from './components/CraMonthSelector/CraMonthSelector';
import { CalendarGrid } from './components/CalendarGrid/CalendarGrid';
import { CraSummaryPanel } from './components/CraSummaryPanel/CraSummaryPanel';
import { CraHistory } from './components/CraHistory/CraHistory';
import { ClientSettingsForm } from './components/ClientSettingsForm/ClientSettingsForm';
import { ProviderSettingsForm } from './components/ProviderSettingsForm/ProviderSettingsForm';
import { ProviderSignatureBox } from './components/ProviderSignatureBox/ProviderSignatureBox';
import { CraValidation } from './components/CraValidation/CraValidation';
import { SignatureSettings } from './components/SignatureSettings/SignatureSettings';
import { AppShell } from './components/AppShell/AppShell';
import type { AppView } from './components/AppShell/AppShell';
import { NewCraDialog } from './components/NewCraDialog/NewCraDialog';
import { CraDetailModal } from './components/CraDetailModal/CraDetailModal';
import { AnnualCalendar } from './components/AnnualCalendar/AnnualCalendar';
import { getCra, updateDay, listCras, createCra } from './api/craClient';
import { getClientSettings } from './api/settingsClient';
import { getErrorMessage } from './api/errorMessages';
import type { CraSummaryDto, CraDetails } from './types/cra';
import type { CraDetailsDto } from './api/types';
import type { ClientSettingsDto } from './types/settings';

function dtoToDetails(dto: CraDetailsDto): CraDetails {
  return {
    id: dto.id,
    month: dto.month,
    year: dto.year,
    totalWorkedDays: dto.totalWorkedDays,
    status: dto.status,
    days: dto.days.map(d => ({ day: d.day, worked: d.worked, note: d.note ?? '' })),
    providerSignatureDate: dto.providerSignatureDate,
    providerRaisonSociale: dto.providerRaisonSociale ?? null,
    providerSiret: dto.providerSiret ?? null,
    providerAdresse: dto.providerAdresse ?? null,
    providerCodePostal: dto.providerCodePostal ?? null,
    providerVille: dto.providerVille ?? null,
    providerPays: dto.providerPays ?? null,
    clientFirstName: dto.clientFirstName ?? null,
    clientLastName: dto.clientLastName ?? null,
    clientCompany: dto.clientCompany ?? null,
    providerSignatureImage: dto.providerSignatureImage ?? null,
    providerSignerName: dto.providerSignerName ?? null,
  };
}

export default function App() {
  const [view, setView] = useState<AppView>('overview');
  const [modalCraId, setModalCraId] = useState<number | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('cra');
    if (!id) return null;
    const n = parseInt(id, 10);
    return isNaN(n) ? null : n;
  });
  const modalTriggerRef = useRef<HTMLElement | null>(null);
  const modalPushedState = useRef(false);
  const modalActionInFlightRef = useRef(false);
  const modalCraIdRef = useRef<number | null>(null);
  const [cra, setCra] = useState<CraDetails | null>(null);
  const [craLoading, setCraLoading] = useState(false);
  const [craError, setCraError] = useState<string | null>(null);
  const [lastCraId, setLastCraId] = useState<number | null>(null);
  const [updatingDay, setUpdatingDay] = useState<number | null>(null);
  const [dayUpdateError, setDayUpdateError] = useState<string | null>(null);
  const [clientSettings, setClientSettings] = useState<ClientSettingsDto | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [newCraDialogOpen, setNewCraDialogOpen] = useState(false);
  const [newCraLoading, setNewCraLoading] = useState(false);
  const [newCraError, setNewCraError] = useState<string | null>(null);
  const [newCraPrefill, setNewCraPrefill] = useState<{ month: number; year: number } | null>(null);
  const newCraTriggerRef = useRef<HTMLButtonElement>(null);
  const [annualCalendarRefreshKey, setAnnualCalendarRefreshKey] = useState(0);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  useEffect(() => {
    modalCraIdRef.current = modalCraId;
  }, [modalCraId]);

  useEffect(() => {
    if (view === 'settings' && clientSettings === null) {
      setSettingsError(null);
      getClientSettings()
        .then(setClientSettings)
        .catch(err => setSettingsError(getErrorMessage(err)));
    }
  }, [view, clientSettings]);

  const loadCra = (id: number) => {
    setCraLoading(true);
    setCraError(null);
    setCra(null);
    getCra(id)
      .then(dto => {
        setCra(dtoToDetails(dto));
        setCraLoading(false);
      })
      .catch(err => {
        setCraError(getErrorMessage(err));
        setCraLoading(false);
      });
  };

  const handleOpen = (summary: CraSummaryDto) => {
    setLastCraId(summary.id);
    loadCra(summary.id);
  };

  const handleOpenModal = (summary: CraSummaryDto) => {
    modalTriggerRef.current = document.activeElement as HTMLElement;
    setModalCraId(summary.id);
    window.history.pushState({ modalCraId: summary.id }, '', `?cra=${summary.id}`);
    modalPushedState.current = true;
  };

  const handleModalClose = () => {
    setModalCraId(null);
    if (modalPushedState.current) {
      modalPushedState.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
    modalTriggerRef.current?.focus();
    modalTriggerRef.current = null;
  };

  useEffect(() => {
    const onPopstate = () => {
      if (!window.history.state?.modalCraId) {
        if (modalActionInFlightRef.current) {
          if (!window.confirm('Une action est en cours dans le CRA. Fermer quand même ?')) {
            const id = modalCraIdRef.current;
            if (id !== null) {
              window.history.pushState({ modalCraId: id }, '', `?cra=${id}`);
            }
            return;
          }
        }
        modalPushedState.current = false;
        setModalCraId(null);
        modalTriggerRef.current?.focus();
        modalTriggerRef.current = null;
      }
    };
    window.addEventListener('popstate', onPopstate);
    return () => window.removeEventListener('popstate', onPopstate);
  }, []);

  const handleSignatureSuccess = (updated: CraDetailsDto) => {
    setCra(dtoToDetails(updated));
  };

  const handleModalMutated = (_: CraDetailsDto) => {
    setAnnualCalendarRefreshKey(k => k + 1);
    setHistoryRefreshKey(k => k + 1);
  };

  const handleModalDeleted = () => {
    setAnnualCalendarRefreshKey(k => k + 1);
    setHistoryRefreshKey(k => k + 1);
  };

  const handleDayClick = (day: number, newValue: 0 | 0.5 | 1) => {
    if (!cra) return;
    setUpdatingDay(day);
    setDayUpdateError(null);
    const isoDate = `${cra.year}-${String(cra.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    updateDay(cra.id, isoDate, { workValue: newValue })
      .then(dto => {
        setCra(dtoToDetails(dto));
        setUpdatingDay(null);
      })
      .catch(err => {
        setDayUpdateError(getErrorMessage(err));
        setUpdatingDay(null);
      });
  };

  const didOpenDialog = useRef(false);
  useEffect(() => {
    if (newCraDialogOpen) {
      didOpenDialog.current = true;
    } else if (didOpenDialog.current) {
      newCraTriggerRef.current?.focus();
    }
  }, [newCraDialogOpen]);

  const handleNewCraOpen = () => {
    setNewCraPrefill(null);
    setNewCraError(null);
    setNewCraDialogOpen(true);
  };

  const handleNewCraOpenForMonth = (month: number, year: number) => {
    setNewCraPrefill({ month, year });
    setNewCraError(null);
    setNewCraDialogOpen(true);
  };

  const handleNewCraCancel = () => {
    setNewCraDialogOpen(false);
    setNewCraError(null);
  };

  const handleNewCraConfirm = async (startDate: string, endDate: string) => {
    const parsed = new Date(startDate + 'T00:00:00');
    const year = parsed.getFullYear();
    const month = parsed.getMonth() + 1;

    setNewCraLoading(true);
    setNewCraError(null);

    try {
      const cras = await listCras();
      const existing = cras.find(c => c.year === year && c.month === month);

      if (existing) {
        setNewCraDialogOpen(false);
        setNewCraLoading(false);
        handleOpen(existing);
        setView('selector');
        return;
      }

      const created = await createCra(year, month);
      setNewCraDialogOpen(false);
      setNewCraLoading(false);
      handleOpen(created);
      setView('selector');
    } catch (err) {
      setNewCraError(getErrorMessage(err));
      setNewCraLoading(false);
    }
  };

  return (
    <AppShell
      activeView={view}
      onNavigate={setView}
      onNewCra={handleNewCraOpen}
      newCraTriggerRef={newCraTriggerRef}
    >
      {view === 'settings' ? (
        <>
          <ProviderSettingsForm />
          <SignatureSettings />
          {settingsError !== null ? (
            <p role="alert">{settingsError}</p>
          ) : clientSettings !== null ? (
            <ClientSettingsForm initialValues={clientSettings} />
          ) : null}
        </>
      ) : view === 'overview' ? (
        <AnnualCalendar
          onOpenCra={handleOpenModal}
          onNewCra={handleNewCraOpenForMonth}
          refreshKey={annualCalendarRefreshKey}
        />
      ) : view === 'selector' ? (
        <>
          <CraMonthSelector onOpen={handleOpen} />
          <CraSummaryPanel cra={cra} loading={craLoading} error={craError} onSuccess={handleSignatureSuccess} />
          <CalendarGrid
            cra={cra}
            loading={craLoading}
            error={craError}
            onRetry={lastCraId !== null ? () => loadCra(lastCraId) : undefined}
            onDayClick={cra?.status === 'DRAFT' ? handleDayClick : undefined}
            updatingDay={updatingDay}
            dayUpdateError={dayUpdateError}
          />
          {cra && (
            <ProviderSignatureBox cra={cra} onSignClick={() => {}} />
          )}
          <CraValidation cra={cra} onValidated={handleSignatureSuccess} onGoToSettings={() => setView('settings')} />
        </>
      ) : (
        <CraHistory onOpenDetail={handleOpenModal} refreshKey={historyRefreshKey} />
      )}
      <NewCraDialog
        open={newCraDialogOpen}
        onConfirm={handleNewCraConfirm}
        onCancel={handleNewCraCancel}
        loading={newCraLoading}
        error={newCraError}
        initialStartDate={newCraPrefill
          ? `${newCraPrefill.year}-${String(newCraPrefill.month).padStart(2, '0')}-01`
          : undefined}
        initialEndDate={newCraPrefill
          ? (() => {
              const last = new Date(newCraPrefill.year, newCraPrefill.month, 0).getDate();
              return `${newCraPrefill.year}-${String(newCraPrefill.month).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
            })()
          : undefined}
      />
      <CraDetailModal
        craId={modalCraId}
        onClose={handleModalClose}
        onMutated={handleModalMutated}
        onDeleted={handleModalDeleted}
        onActionInFlightChange={inFlight => { modalActionInFlightRef.current = inFlight; }}
      />
    </AppShell>
  );
}
