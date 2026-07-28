import { useEffect, useState } from 'react';
import { getProviderSettings, updateProviderSettings } from '../../api/craClient';
import { getErrorMessage } from '../../api/errorMessages';
import type { ProviderSettingsDto } from '../../api/types';
import './ProviderSettingsForm.css';

interface FormValues {
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  email: string;
  phone: string;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  company?: string;
}

function dtoToValues(dto: ProviderSettingsDto): FormValues {
  return {
    firstName: dto.firstName,
    lastName: dto.lastName,
    company: dto.company,
    address: dto.address ?? '',
    email: dto.email ?? '',
    phone: dto.phone ?? '',
  };
}

function valuesToDto(values: FormValues): ProviderSettingsDto {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    company: values.company,
    address: values.address || null,
    email: values.email || null,
    phone: values.phone || null,
  };
}

export function ProviderSettingsForm() {
  const [values, setValues] = useState<FormValues>({
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    email: '',
    phone: '',
  });
  const [savedValues, setSavedValues] = useState<FormValues | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    getProviderSettings()
      .then(dto => {
        const initial = dtoToValues(dto);
        setValues(initial);
        setSavedValues(initial);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setFetchError(getErrorMessage(err));
        setLoading(false);
      });
  }, []);

  const handleChange = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues(prev => ({ ...prev, [field]: e.target.value }));
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!values.firstName.trim()) errors.firstName = 'First name is required';
    if (!values.lastName.trim()) errors.lastName = 'Last name is required';
    if (!values.company.trim()) errors.company = 'Company is required';
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSuccessMessage(null);
    updateProviderSettings(valuesToDto(values))
      .then(dto => {
        const updated = dtoToValues(dto);
        setValues(updated);
        setSavedValues(updated);
        setSaving(false);
        setSuccessMessage('Settings saved successfully.');
      })
      .catch((err: unknown) => {
        setSaveError(getErrorMessage(err));
        setSaving(false);
      });
  };

  const handleCancel = () => {
    if (savedValues) {
      setValues(savedValues);
      setFieldErrors({});
      setSaveError(null);
      setSuccessMessage(null);
    }
  };

  if (loading) {
    return <p aria-busy="true">Loading provider settings...</p>;
  }

  if (fetchError) {
    return <p role="alert">{fetchError}</p>;
  }

  return (
    <form className="provider-settings-form" onSubmit={handleSubmit} noValidate>
      <div className="provider-settings-form__field">
        <label htmlFor="ps-first-name">First name *</label>
        <input
          id="ps-first-name"
          type="text"
          value={values.firstName}
          onChange={handleChange('firstName')}
          aria-describedby={fieldErrors.firstName ? 'ps-first-name-error' : undefined}
          aria-invalid={!!fieldErrors.firstName}
        />
        {fieldErrors.firstName && (
          <span id="ps-first-name-error" className="provider-settings-form__error" role="alert">
            {fieldErrors.firstName}
          </span>
        )}
      </div>

      <div className="provider-settings-form__field">
        <label htmlFor="ps-last-name">Last name *</label>
        <input
          id="ps-last-name"
          type="text"
          value={values.lastName}
          onChange={handleChange('lastName')}
          aria-describedby={fieldErrors.lastName ? 'ps-last-name-error' : undefined}
          aria-invalid={!!fieldErrors.lastName}
        />
        {fieldErrors.lastName && (
          <span id="ps-last-name-error" className="provider-settings-form__error" role="alert">
            {fieldErrors.lastName}
          </span>
        )}
      </div>

      <div className="provider-settings-form__field">
        <label htmlFor="ps-company">Company *</label>
        <input
          id="ps-company"
          type="text"
          value={values.company}
          onChange={handleChange('company')}
          aria-describedby={fieldErrors.company ? 'ps-company-error' : undefined}
          aria-invalid={!!fieldErrors.company}
        />
        {fieldErrors.company && (
          <span id="ps-company-error" className="provider-settings-form__error" role="alert">
            {fieldErrors.company}
          </span>
        )}
      </div>

      <div className="provider-settings-form__field">
        <label htmlFor="ps-address">Address</label>
        <input
          id="ps-address"
          type="text"
          value={values.address}
          onChange={handleChange('address')}
        />
      </div>

      <div className="provider-settings-form__field">
        <label htmlFor="ps-email">Email</label>
        <input
          id="ps-email"
          type="email"
          value={values.email}
          onChange={handleChange('email')}
        />
      </div>

      <div className="provider-settings-form__field">
        <label htmlFor="ps-phone">Phone</label>
        <input
          id="ps-phone"
          type="tel"
          value={values.phone}
          onChange={handleChange('phone')}
        />
      </div>

      {saveError && (
        <p className="provider-settings-form__save-error" role="alert">{saveError}</p>
      )}

      {successMessage && (
        <p className="provider-settings-form__success" role="status">{successMessage}</p>
      )}

      <div className="provider-settings-form__actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={handleCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}
