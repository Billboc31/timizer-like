import { useState } from 'react';
import { updateClientSettings } from '../../api/settingsClient';
import { getErrorMessage } from '../../api/errorMessages';
import type { ClientSettingsDto } from '../../types/settings';
import './ClientSettingsForm.css';

interface ClientSettingsFormProps {
  initialValues: ClientSettingsDto;
}

function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ClientSettingsForm({ initialValues }: ClientSettingsFormProps) {
  const [values, setValues] = useState<ClientSettingsDto>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof ClientSettingsDto, string>>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof ClientSettingsDto, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setSaved(false);
    setSaveError(null);
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof ClientSettingsDto, string>> = {};
    const required: (keyof ClientSettingsDto)[] = [
      'clientCompany',
      'clientAddress',
      'contactFullName',
      'contactRole',
      'contactEmail',
    ];
    for (const field of required) {
      if (!values[field].trim()) {
        next[field] = 'This field is required.';
      }
    }
    if (!next.contactEmail && !validateEmail(values.contactEmail)) {
      next.contactEmail = 'Enter a valid email address.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    updateClientSettings(values)
      .then(() => {
        setSaved(true);
        setSaving(false);
      })
      .catch(err => {
        setSaveError(getErrorMessage(err));
        setSaving(false);
      });
  };

  return (
    <form className="client-settings-form" onSubmit={handleSubmit} noValidate>
      <div className="client-settings-form__group">
        <label htmlFor="csf-clientCompany">Client company</label>
        <input
          id="csf-clientCompany"
          type="text"
          value={values.clientCompany}
          onChange={e => handleChange('clientCompany', e.target.value)}
          aria-invalid={!!errors.clientCompany}
        />
        {errors.clientCompany && (
          <span className="client-settings-form__error">{errors.clientCompany}</span>
        )}
      </div>

      <div className="client-settings-form__group">
        <label htmlFor="csf-clientAddress">Postal address</label>
        <input
          id="csf-clientAddress"
          type="text"
          value={values.clientAddress}
          onChange={e => handleChange('clientAddress', e.target.value)}
          aria-invalid={!!errors.clientAddress}
        />
        {errors.clientAddress && (
          <span className="client-settings-form__error">{errors.clientAddress}</span>
        )}
      </div>

      <div className="client-settings-form__group">
        <label htmlFor="csf-contactFullName">Contact full name</label>
        <input
          id="csf-contactFullName"
          type="text"
          value={values.contactFullName}
          onChange={e => handleChange('contactFullName', e.target.value)}
          aria-invalid={!!errors.contactFullName}
        />
        {errors.contactFullName && (
          <span className="client-settings-form__error">{errors.contactFullName}</span>
        )}
      </div>

      <div className="client-settings-form__group">
        <label htmlFor="csf-contactRole">Contact role</label>
        <input
          id="csf-contactRole"
          type="text"
          value={values.contactRole}
          onChange={e => handleChange('contactRole', e.target.value)}
          aria-invalid={!!errors.contactRole}
        />
        {errors.contactRole && (
          <span className="client-settings-form__error">{errors.contactRole}</span>
        )}
      </div>

      <div className="client-settings-form__group">
        <label htmlFor="csf-contactEmail">Contact email</label>
        <input
          id="csf-contactEmail"
          type="email"
          value={values.contactEmail}
          onChange={e => handleChange('contactEmail', e.target.value)}
          aria-invalid={!!errors.contactEmail}
        />
        {errors.contactEmail && (
          <span className="client-settings-form__error">{errors.contactEmail}</span>
        )}
      </div>

      {saveError && <p className="client-settings-form__save-error">{saveError}</p>}
      {saved && <p className="client-settings-form__success">Settings saved.</p>}

      <button type="submit" className="client-settings-form__save" disabled={saving}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}
