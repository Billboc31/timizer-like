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
  firstName: 'Jean',
  lastName: 'Dupont',
  company: 'Acme',
  address: '1 rue Paix',
  email: 'jean@acme.com',
  phone: '0600000000',
};

describe('ProviderSettingsForm', () => {
  it('shows loading indicator while fetching initial data', () => {
    vi.mocked(craApi.getProviderSettings).mockReturnValue(new Promise(() => {}));
    render(<ProviderSettingsForm />);
    expect(screen.getByText(/loading provider settings/i)).toBeInTheDocument();
  });

  it('renders form pre-filled with values returned by getProviderSettings', async () => {
    vi.mocked(craApi.getProviderSettings).mockResolvedValue(SETTINGS);
    render(<ProviderSettingsForm />);
    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeInTheDocument());
    expect(screen.getByLabelText(/first name/i)).toHaveValue('Jean');
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Dupont');
    expect(screen.getByLabelText(/company/i)).toHaveValue('Acme');
    expect(screen.getByLabelText(/address/i)).toHaveValue('1 rue Paix');
    expect(screen.getByLabelText(/email/i)).toHaveValue('jean@acme.com');
    expect(screen.getByLabelText(/phone/i)).toHaveValue('0600000000');
  });

  it('displays required-field error on submit when firstName is blank', async () => {
    vi.mocked(craApi.getProviderSettings).mockResolvedValue(SETTINGS);
    render(<ProviderSettingsForm />);
    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
  });

  it('displays required-field error on submit when lastName is blank', async () => {
    vi.mocked(craApi.getProviderSettings).mockResolvedValue(SETTINGS);
    render(<ProviderSettingsForm />);
    await waitFor(() => expect(screen.getByLabelText(/last name/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
  });

  it('displays required-field error on submit when company is blank', async () => {
    vi.mocked(craApi.getProviderSettings).mockResolvedValue(SETTINGS);
    render(<ProviderSettingsForm />);
    await waitFor(() => expect(screen.getByLabelText(/company/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/company/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByText(/company is required/i)).toBeInTheDocument();
  });

  it('calls updateProviderSettings with form values on valid submit', async () => {
    vi.mocked(craApi.getProviderSettings).mockResolvedValue(SETTINGS);
    vi.mocked(craApi.updateProviderSettings).mockResolvedValue(SETTINGS);
    render(<ProviderSettingsForm />);
    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() =>
      expect(vi.mocked(craApi.updateProviderSettings)).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'Jean', lastName: 'Dupont', company: 'Acme' }),
      ),
    );
  });

  it('shows saving state during save', async () => {
    vi.mocked(craApi.getProviderSettings).mockResolvedValue(SETTINGS);
    vi.mocked(craApi.updateProviderSettings).mockReturnValue(new Promise(() => {}));
    render(<ProviderSettingsForm />);
    await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  it('shows success message after successful save', async () => {
    vi.mocked(craApi.getProviderSettings).mockResolvedValue(SETTINGS);
    vi.mocked(craApi.updateProviderSettings).mockResolvedValue(SETTINGS);
    render(<ProviderSettingsForm />);
    await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/saved successfully/i),
    );
  });

  it('shows error banner when updateProviderSettings rejects', async () => {
    vi.mocked(craApi.getProviderSettings).mockResolvedValue(SETTINGS);
    vi.mocked(craApi.updateProviderSettings).mockRejectedValue(new Error('Server error'));
    render(<ProviderSettingsForm />);
    await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(screen.getAllByRole('alert').length).toBeGreaterThan(0));
  });

  it('cancel restores original values without calling the API', async () => {
    vi.mocked(craApi.getProviderSettings).mockResolvedValue(SETTINGS);
    render(<ProviderSettingsForm />);
    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Changed' } });
    expect(screen.getByLabelText(/first name/i)).toHaveValue('Changed');
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.getByLabelText(/first name/i)).toHaveValue('Jean');
    expect(vi.mocked(craApi.updateProviderSettings)).not.toHaveBeenCalled();
  });
});
