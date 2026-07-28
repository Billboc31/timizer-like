import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { ClientSettingsForm } from './ClientSettingsForm';
import * as settingsClient from '../../api/settingsClient';
import type { ClientSettingsDto } from '../../types/settings';

vi.mock('../../api/settingsClient');

const INITIAL: ClientSettingsDto = {
  clientCompany: 'Lyra Network',
  clientAddress: "109 rue de l'Ancienne Poste, Villeurbanne",
  contactFullName: 'Bob Client',
  contactRole: 'Manager',
  contactEmail: 'bob@lyra.com',
};

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('ClientSettingsForm', () => {
  it('renders pre-loaded values', () => {
    render(<ClientSettingsForm initialValues={INITIAL} />);

    expect((screen.getByLabelText('Client company') as HTMLInputElement).value).toBe('Lyra Network');
    expect((screen.getByLabelText('Postal address') as HTMLInputElement).value).toBe(
      "109 rue de l'Ancienne Poste, Villeurbanne",
    );
    expect((screen.getByLabelText('Contact full name') as HTMLInputElement).value).toBe('Bob Client');
    expect((screen.getByLabelText('Contact role') as HTMLInputElement).value).toBe('Manager');
    expect((screen.getByLabelText('Contact email') as HTMLInputElement).value).toBe('bob@lyra.com');
  });

  it('blocks save on blank required field and does not call API', async () => {
    render(<ClientSettingsForm initialValues={INITIAL} />);

    fireEvent.change(screen.getByLabelText('Client company'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText('This field is required.')).toBeInTheDocument();
    expect(vi.mocked(settingsClient.updateClientSettings)).not.toHaveBeenCalled();
  });

  it('blocks save on invalid email and does not call API', async () => {
    render(<ClientSettingsForm initialValues={INITIAL} />);

    fireEvent.change(screen.getByLabelText('Contact email'), { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(vi.mocked(settingsClient.updateClientSettings)).not.toHaveBeenCalled();
  });

  it('calls updateClientSettings with correct payload on valid submit', async () => {
    vi.mocked(settingsClient.updateClientSettings).mockResolvedValue(INITIAL);

    render(<ClientSettingsForm initialValues={INITIAL} />);

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(vi.mocked(settingsClient.updateClientSettings)).toHaveBeenCalledWith(INITIAL);
    });

    expect(screen.getByText('Settings saved.')).toBeInTheDocument();
  });
});
