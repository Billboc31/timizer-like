import { useState, useEffect, useRef } from 'react';
import { CraMonthSelector } from './components/CraMonthSelector/CraMonthSelector';
import { CalendarGrid } from './components/CalendarGrid/CalendarGrid';
import { CraSummaryPanel } from './components/CraSummaryPanel/CraSummaryPanel';
import { CraHistory } from './components/CraHistory/CraHistory';
import { ClientSettingsForm } from './components/ClientSettingsForm/ClientSettingsForm';
import { ProviderSettingsForm } from './components/ProviderSettingsForm/ProviderSettingsForm';
import { ProviderSignatureBox } from './components/ProviderSignatureBox/ProviderSignatureBox';
import { CraHistoryDetail } from './components/CraHistoryDetail/CraHistoryDetail';
import { CraValidation } from './components/CraValidation/CraValidation';
import { SignatureSettings } from './components/SignatureSettings/SignatureSettings';
import { AppShell } from './components/AppShell/AppShell';
import type { AppView } from './components/AppShell/AppShell';
import { NewCraDialog } from './components/NewCraDialog/NewCraDialog';
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
    providerFirstName: dto.providerFirstName ?? null,
    providerLastName: dto.providerLastName ?? null,
    providerCompany: dto.providerCompany ?? null,
    clientFirstName: dto.clientFirstName ?? null,
    clientLastName: dto.clientLastName ?? null,
    clientCompany: dto.clientCompany ?? null,
    providerSignatureImage: dto.providerSignatureImage ?? null,
    providerSignerName: dto.providerSignerName ?? null,
  };
}

type View = AppView | 'history-detail';

export default function App() {
  const [view, setView] = useState<View>('selector');
  const [historyDetailId, setHistoryDetailId] = useState<number | null>(null);
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
  const [selectedPeriod, setSelectedPeriod] = useState<{ startDate: string; endDate: string } | null>(null);
  const newCraTriggerRef = useRef<HTMLButtonElement>(null);

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

  const handleOpenDetail = (summary: CraSummaryDto) => {
    setHistoryDetailId(summary.id);
    setView('history-detail');
  };

  const handleSignatureSuccess = (updated: CraDetailsDto) => {
    setCra(dtoToDetails(updated));
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

  useEffect(() => {
    if (cra === null) setSelectedPeriod(null);
  }, [cra]);

  const didOpenDialog = useRef(false);
  useEffect(() => {
    if (newCraDialogOpen) {
      didOpenDialog.current = true;
    } else if (didOpenDialog.current) {
      newCraTriggerRef.current?.focus();
    }
  }, [newCraDialogOpen]);

  const handleNewCraOpen = () => {
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
        setSelectedPeriod({ startDate, endDate });
        setNewCraDialogOpen(false);
        setNewCraLoading(false);
        handleOpen(existing);
        setView('selector');
        return;
      }

      const created = await createCra(year, month);
      setSelectedPeriod({ startDate, endDate });
      setNewCraDialogOpen(false);
      setNewCraLoading(false);
      handleOpen(created);
      setView('selector');
    } catch (err) {
      setNewCraError(getErrorMessage(err));
      setNewCraLoading(false);
    }
  };

  const shellView: AppView = view === 'history-detail' ? 'history' : view;

  return (
    <AppShell
      activeView={shellView}
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
      ) : view === 'history-detail' ? (
        <CraHistoryDetail
          craId={historyDetailId}
          onBack={() => setView('history')}
        />
      ) : (
        <>
          {view === 'selector' ? (
            <CraMonthSelector onOpen={handleOpen} />
          ) : (
            <CraHistory onOpenDetail={handleOpenDetail} />
          )}
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
      )}
      <NewCraDialog
        open={newCraDialogOpen}
        onConfirm={handleNewCraConfirm}
        onCancel={handleNewCraCancel}
        loading={newCraLoading}
        error={newCraError}
      />
    </AppShell>
  );
}
