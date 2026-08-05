import { useEffect, useState } from 'react';
import { getProviderSettings, updateProviderSettings } from '../../api/craClient';
import { getErrorMessage } from '../../api/errorMessages';
import type { ProviderSettingsDto } from '../../api/types';
import './ProviderSettingsForm.css';

interface FormValues {
  raisonSociale: string;
  siret: string;
  adresse: string;
  codePostal: string;
  ville: string;
  pays: string;
}

interface FieldErrors {
  raisonSociale?: string;
  siret?: string;
}

function dtoToValues(dto: ProviderSettingsDto): FormValues {
  return {
    raisonSociale: dto.raisonSociale,
    siret: dto.siret ?? '',
    adresse: dto.adresse ?? '',
    codePostal: dto.codePostal ?? '',
    ville: dto.ville ?? '',
    pays: dto.pays ?? '',
  };
}

function valuesToDto(values: FormValues): ProviderSettingsDto {
  return {
    raisonSociale: values.raisonSociale,
    siret: values.siret || null,
    adresse: values.adresse || null,
    codePostal: values.codePostal || null,
    ville: values.ville || null,
    pays: values.pays || null,
  };
}

export function ProviderSettingsForm() {
  const [values, setValues] = useState<FormValues>({
    raisonSociale: '',
    siret: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: '',
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
    if (!values.raisonSociale.trim()) errors.raisonSociale = 'La raison sociale est obligatoire';
    if (values.siret && !/^\d{14}$/.test(values.siret)) {
      errors.siret = 'Le SIRET doit contenir exactement 14 chiffres';
    }
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
        setSuccessMessage('Paramètres enregistrés.');
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
    return <p aria-busy="true">Chargement des paramètres prestataire...</p>;
  }

  if (fetchError) {
    return <p role="alert">{fetchError}</p>;
  }

  return (
    <form className="provider-settings-form" onSubmit={handleSubmit} noValidate>
      <div className="provider-settings-form__field">
        <label htmlFor="ps-raison-sociale">Raison sociale *</label>
        <input
          id="ps-raison-sociale"
          type="text"
          value={values.raisonSociale}
          onChange={handleChange('raisonSociale')}
          aria-describedby={fieldErrors.raisonSociale ? 'ps-raison-sociale-error' : undefined}
          aria-invalid={!!fieldErrors.raisonSociale}
        />
        {fieldErrors.raisonSociale && (
          <span id="ps-raison-sociale-error" className="provider-settings-form__error" role="alert">
            {fieldErrors.raisonSociale}
          </span>
        )}
      </div>

      <div className="provider-settings-form__field">
        <label htmlFor="ps-siret">SIRET</label>
        <input
          id="ps-siret"
          type="text"
          value={values.siret}
          onChange={handleChange('siret')}
          aria-describedby={fieldErrors.siret ? 'ps-siret-error' : undefined}
          aria-invalid={!!fieldErrors.siret}
        />
        {fieldErrors.siret && (
          <span id="ps-siret-error" className="provider-settings-form__error" role="alert">
            {fieldErrors.siret}
          </span>
        )}
      </div>

      <div className="provider-settings-form__field">
        <label htmlFor="ps-adresse">Adresse</label>
        <input
          id="ps-adresse"
          type="text"
          value={values.adresse}
          onChange={handleChange('adresse')}
        />
      </div>

      <div className="provider-settings-form__field">
        <label htmlFor="ps-code-postal">Code postal</label>
        <input
          id="ps-code-postal"
          type="text"
          value={values.codePostal}
          onChange={handleChange('codePostal')}
        />
      </div>

      <div className="provider-settings-form__field">
        <label htmlFor="ps-ville">Ville</label>
        <input
          id="ps-ville"
          type="text"
          value={values.ville}
          onChange={handleChange('ville')}
        />
      </div>

      <div className="provider-settings-form__field">
        <label htmlFor="ps-pays">Pays</label>
        <input
          id="ps-pays"
          type="text"
          value={values.pays}
          onChange={handleChange('pays')}
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
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button type="button" onClick={handleCancel} disabled={saving}>
          Annuler
        </button>
      </div>
    </form>
  );
}
