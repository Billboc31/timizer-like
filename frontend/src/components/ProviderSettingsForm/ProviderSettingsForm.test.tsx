import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ProviderSettingsForm } from './ProviderSettingsForm';
import * as craApi from '../../api/craClient';
import type { ProviderSettingsDto } from '../../api/types';

vi.mock('../../api/craClient');

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const SETTINGS: ProviderSettingsDto = {
  raisonSociale: 'Acme SARL',
  siret: '12345678901234',
  adresse: '1 rue de la Paix',
  codePostal: '75001',
  ville: 'Paris',
  pays: 'France',
};

describe('ProviderSettingsForm', () => {
  it('shows loading indicator while fetching initial data', () => {
    vi.mocked(craApi.getProviderSettings).mockReturnValue(new Promise(() => {}));
    render(<ProviderSettingsForm />);
    expect(screen.getByText(/chargement des paramètres prestataire/i)).toBeInTheDocument();
  });

  it('renders form pre-filled with values returned by getProviderSettings', async () => {
    vi.mocked(craApi.getProviderSettings).mockResolvedValue(SETTINGS);
    render(<ProviderSettingsForm />);
    await waitFor(() => expect(screen.getByLabelText(/raison sociale/i)).toBeInTheDocument());
    expect(screen.getByLabelText(/raison sociale/i)).toHaveValue('Acme SARL');
    expect(screen.getByLabelText(/siret/i)).toHaveValue('12345678901234');
    expect(screen.getByLabelText(/adresse/i)).toHaveValue('1 rue de la Paix');
    expect(screen.getByLabelText(/code postal/i)).toHaveValue('75001');
    expect(screen.getByLabelText(/ville/i)).toHaveValue('Paris');
    expect(screen.getByLabelText(/pays/i)).toHaveValue('France');
  });

  it('displays required-field error on submit when raisonSociale is blank', async () => {
    vi.mocked(craApi.getProviderSettings).mockResolvedValue(SETTINGS);
    render(<ProviderSettingsForm />);
    await waitFor(() => expect(screen.getByLabelText(/raison sociale/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/raison sociale/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));
    expect(screen.getByText(/raison sociale est obligatoire/i)).toBeInTheDocument();
  });

  it('displays SIRET format error when SIRET is not 14 digits', async () => {
    vi.mocked(craApi.getProviderSettings).mockResolvedValue(SETTINGS);
    render(<ProviderSettingsForm />);
    await waitFor(() => expect(screen.getByLabelText(/siret/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/siret/i), { target: { value: 'ABC' } });
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));
    expect(screen.getByText(/14 chiffres/i)).toBeInTheDocument();
  });

  it('calls updateProviderSettings with form values on valid submit', async () => {
    vi.mocked(craApi.getProviderSettings).mockResolvedValue(SETTINGS);
    vi.mocked(craApi.updateProviderSettings).mockResolvedValue(SETTINGS);
    render(<ProviderSettingsForm />);
    await waitFor(() => expect(screen.getByLabelText(/raison sociale/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));
    await waitFor(() =>
      expect(vi.mocked(craApi.updateProviderSettings)).toHaveBeenCalledWith(
        expect.objectContaining({ raisonSociale: 'Acme SARL' }),
      ),
    );
  });

  it('shows saving state during save', async () => {
    vi.mocked(craApi.getProviderSettings).mockResolvedValue(SETTINGS);
    vi.mocked(craApi.updateProviderSettings).mockReturnValue(new Promise(() => {}));
    render(<ProviderSettingsForm />);
    await waitFor(() => expect(screen.getByRole('button', { name: /enregistrer/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));
    expect(screen.getByRole('button', { name: /enregistrement/i })).toBeDisabled();
  });

  it('shows success message after successful save', async () => {
    vi.mocked(craApi.getProviderSettings).mockResolvedValue(SETTINGS);
    vi.mocked(craApi.updateProviderSettings).mockResolvedValue(SETTINGS);
    render(<ProviderSettingsForm />);
    await waitFor(() => expect(screen.getByRole('button', { name: /enregistrer/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/paramètres enregistrés/i),
    );
  });

  it('shows error banner when updateProviderSettings rejects', async () => {
    vi.mocked(craApi.getProviderSettings).mockResolvedValue(SETTINGS);
    vi.mocked(craApi.updateProviderSettings).mockRejectedValue(new Error('Server error'));
    render(<ProviderSettingsForm />);
    await waitFor(() => expect(screen.getByRole('button', { name: /enregistrer/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));
    await waitFor(() => expect(screen.getAllByRole('alert').length).toBeGreaterThan(0));
  });

  it('cancel restores original values without calling the API', async () => {
    vi.mocked(craApi.getProviderSettings).mockResolvedValue(SETTINGS);
    render(<ProviderSettingsForm />);
    await waitFor(() => expect(screen.getByLabelText(/raison sociale/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/raison sociale/i), { target: { value: 'Changed' } });
    expect(screen.getByLabelText(/raison sociale/i)).toHaveValue('Changed');
    fireEvent.click(screen.getByRole('button', { name: /annuler/i }));
    expect(screen.getByLabelText(/raison sociale/i)).toHaveValue('Acme SARL');
    expect(vi.mocked(craApi.updateProviderSettings)).not.toHaveBeenCalled();
  });
});
