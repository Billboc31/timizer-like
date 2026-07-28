import { useState, useRef, useEffect } from 'react';
import { SignatureCanvas } from '../SignatureCanvas/SignatureCanvas';
import type { SignatureCanvasHandle } from '../SignatureCanvas/SignatureCanvas';
import { getSignature, saveSignature, deleteSignature } from '../../api/signatureClient';
import { getErrorMessage } from '../../api/errorMessages';
import './SignatureSettings.css';

const MAX_FILE_SIZE = 500 * 1024;
const ACCEPTED_MIME = ['image/png', 'image/jpeg', 'image/svg+xml'];

type Mode = 'draw' | 'upload';

export function SignatureSettings() {
  const [mode, setMode] = useState<Mode>('draw');
  const [signerName, setSignerName] = useState('');
  const [savedSignerName, setSavedSignerName] = useState<string | null>(null);
  const [savedImage, setSavedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const canvasRef = useRef<SignatureCanvasHandle>(null);

  useEffect(() => {
    getSignature()
      .then(sig => {
        setSavedImage(sig.signatureImage);
        setSavedSignerName(sig.signerName);
        setSignerName(sig.signerName);
      })
      .catch(() => {
        // 404 or network error — no saved signature yet
      });
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_MIME.includes(file.type)) {
      setFileError('Le format de fichier est invalide. Formats acceptés : PNG, JPEG, SVG.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Le fichier est trop volumineux (max 500 Ko).');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      setUploadedImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setApiError(null);
    const imageData =
      mode === 'upload'
        ? uploadedImage
        : hasDrawn
          ? canvasRef.current?.toDataURL() ?? null
          : null;

    if (!imageData) {
      setApiError(
        mode === 'upload'
          ? 'Veuillez sélectionner un fichier.'
          : 'Veuillez dessiner votre signature.',
      );
      return;
    }
    if (!signerName.trim()) {
      setApiError('Veuillez saisir votre nom.');
      return;
    }

    setSaving(true);
    try {
      const saved = await saveSignature(signerName.trim(), imageData);
      setSavedImage(saved.signatureImage);
      setSavedSignerName(saved.signerName);
      setHasDrawn(false);
      setUploadedImage(null);
    } catch (e) {
      setApiError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setApiError(null);
    setDeleting(true);
    try {
      await deleteSignature();
      setSavedImage(null);
      setSavedSignerName(null);
      setSignerName('');
      setHasDrawn(false);
      setUploadedImage(null);
      canvasRef.current?.clear();
    } catch (e) {
      setApiError(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  }

  function handleReplace() {
    setSavedImage(null);
    setSavedSignerName(null);
    setHasDrawn(false);
    setUploadedImage(null);
    canvasRef.current?.clear();
  }

  return (
    <section className="signature-settings" aria-labelledby="signature-settings-title">
      <h3 id="signature-settings-title" className="signature-settings__title">
        Signature prestataire
      </h3>

      {savedImage ? (
        <div className="signature-settings__preview">
          <p className="signature-settings__signer-label">Signataire : {savedSignerName}</p>
          <img
            src={savedImage}
            alt="Signature enregistrée"
            className="signature-settings__preview-img"
          />
          <div className="signature-settings__preview-actions">
            <button
              className="signature-settings__btn signature-settings__btn--secondary"
              onClick={handleReplace}
            >
              Remplacer
            </button>
            <button
              className="signature-settings__btn signature-settings__btn--danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Suppression…' : 'Supprimer'}
            </button>
          </div>
          {apiError && (
            <p role="alert" className="signature-settings__error">
              {apiError}
            </p>
          )}
        </div>
      ) : (
        <div className="signature-settings__editor">
          <div className="signature-settings__mode-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={mode === 'draw'}
              className={`signature-settings__tab${mode === 'draw' ? ' signature-settings__tab--active' : ''}`}
              onClick={() => setMode('draw')}
            >
              Dessiner
            </button>
            <button
              role="tab"
              aria-selected={mode === 'upload'}
              className={`signature-settings__tab${mode === 'upload' ? ' signature-settings__tab--active' : ''}`}
              onClick={() => setMode('upload')}
            >
              Importer un fichier
            </button>
          </div>

          {mode === 'draw' && (
            <div className="signature-settings__canvas-wrapper">
              <SignatureCanvas
                ref={canvasRef}
                onDraw={() => setHasDrawn(true)}
                className="signature-settings__canvas"
              />
              <button
                className="signature-settings__btn--link"
                onClick={() => {
                  canvasRef.current?.clear();
                  setHasDrawn(false);
                }}
              >
                Effacer
              </button>
            </div>
          )}

          {mode === 'upload' && (
            <div className="signature-settings__upload">
              <label htmlFor="sig-file" className="signature-settings__file-label">
                Fichier (PNG, JPEG, SVG — max 500 Ko)
              </label>
              <input
                id="sig-file"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleFileChange}
              />
              {fileError && (
                <p role="alert" className="signature-settings__error">
                  {fileError}
                </p>
              )}
              {uploadedImage && (
                <img
                  src={uploadedImage}
                  alt="Aperçu du fichier importé"
                  className="signature-settings__upload-preview"
                />
              )}
            </div>
          )}

          <div className="signature-settings__name-row">
            <label htmlFor="sig-name" className="signature-settings__name-label">
              Nom du signataire
            </label>
            <input
              id="sig-name"
              type="text"
              className="signature-settings__name-input"
              value={signerName}
              onChange={e => setSignerName(e.target.value)}
              placeholder="Prénom Nom"
            />
          </div>

          {apiError && (
            <p role="alert" className="signature-settings__error">
              {apiError}
            </p>
          )}

          <button
            className="signature-settings__btn signature-settings__btn--primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Enregistrement…' : 'Enregistrer la signature'}
          </button>
        </div>
      )}
    </section>
  );
}
