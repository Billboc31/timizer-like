import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { CraDetailModal } from './CraDetailModal';
import * as craApi from '../../api/craClient';
import * as signatureClient from '../../api/signatureClient';
import type { CraDetailsDto } from '../../api/types';

vi.mock('../../api/craClient');
vi.mock('../../api/signatureClient');

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const VALIDATED_DETAIL: CraDetailsDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 21,
  status: 'VALIDATED',
  validationDate: '2026-07-31',
  providerSignatureDate: '2026-07-31',
  clientSignatureDate: '2026-08-01',
  clientRepresentativeName: null,
  providerFirstName: 'Jean',
  providerLastName: 'Dupont',
  providerCompany: 'Prestataire SARL',
  clientFirstName: 'Marie',
  clientLastName: 'Martin',
  clientCompany: 'Client SA',
  clientContactFirstName: 'Pierre',
  clientContactLastName: 'Durand',
  days: [
    { day: 1, worked: 1, note: null },
    { day: 2, worked: 0.5, note: null },
  ],
};

const DRAFT_DETAIL: CraDetailsDto = {
  ...VALIDATED_DETAIL,
  id: 2,
  status: 'DRAFT',
  validationDate: null,
  providerSignatureDate: null,
  clientSignatureDate: null,
};

const AWAITING_DETAIL: CraDetailsDto = {
  ...VALIDATED_DETAIL,
  id: 3,
  status: 'AWAITING_CLIENT_SIGNATURE',
  validationDate: null,
  clientSignatureDate: null,
};

describe('CraDetailModal — visibility', () => {
  it('dialog is not open when craId is null', () => {
    render(<CraDetailModal craId={null} onClose={vi.fn()} />);
    expect(document.querySelector('dialog[open]')).not.toBeInTheDocument();
  });

  it('dialog opens when craId is set', () => {
    vi.mocked(craApi.getCra).mockReturnValue(new Promise(() => {}));
    render(<CraDetailModal craId={1} onClose={vi.fn()} />);
    expect(document.querySelector('dialog[open]')).toBeInTheDocument();
  });

  it('dialog closes when craId changes back to null', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(VALIDATED_DETAIL);
    const { rerender } = render(<CraDetailModal craId={1} onClose={vi.fn()} />);
    expect(document.querySelector('dialog[open]')).toBeInTheDocument();
    rerender(<CraDetailModal craId={null} onClose={vi.fn()} />);
    expect(document.querySelector('dialog[open]')).not.toBeInTheDocument();
  });
});

describe('CraDetailModal — content', () => {
  beforeEach(() => {
    vi.mocked(craApi.getCra).mockResolvedValue(VALIDATED_DETAIL);
  });

  it('shows loading skeleton while fetching', () => {
    vi.mocked(craApi.getCra).mockReturnValue(new Promise(() => {}));
    render(<CraDetailModal craId={1} onClose={vi.fn()} />);
    expect(screen.getByLabelText(/chargement du cra/i)).toBeInTheDocument();
  });

  it('renders CRA title in modal header after load', async () => {
    render(<CraDetailModal craId={1} onClose={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Juillet 2026' })).toBeInTheDocument(),
    );
  });

  it('renders covered period after load', async () => {
    render(<CraDetailModal craId={1} onClose={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByText('1 juillet 2026 – 31 juillet 2026')).toBeInTheDocument(),
    );
  });

  it('renders metadata section with provider and client names', async () => {
    render(<CraDetailModal craId={1} onClose={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('region', { name: /informations/i })).toBeInTheDocument(),
    );
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('Marie Martin')).toBeInTheDocument();
  });

  it('does not render previous/next navigation controls', async () => {
    render(<CraDetailModal craId={1} onClose={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Juillet 2026' })).toBeInTheDocument(),
    );
    expect(screen.queryByRole('button', { name: /précédent|suivant|previous|next/i })).not.toBeInTheDocument();
  });

  it('shows error alert and retry button when getCra fails', async () => {
    vi.mocked(craApi.getCra).mockRejectedValue(new Error('Network error'));
    render(<CraDetailModal craId={1} onClose={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
  });

  it('retries fetch when Réessayer is clicked', async () => {
    vi.mocked(craApi.getCra)
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(VALIDATED_DETAIL);
    render(<CraDetailModal craId={1} onClose={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Juillet 2026' })).toBeInTheDocument(),
    );
  });
});

describe('CraDetailModal — actions', () => {
  it('shows download PDF button for VALIDATED CRA', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(VALIDATED_DETAIL);
    render(<CraDetailModal craId={1} onClose={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /télécharger le pdf/i })).toBeInTheDocument(),
    );
  });

  it('does not show download PDF button for DRAFT CRA', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(DRAFT_DETAIL);
    render(<CraDetailModal craId={2} onClose={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Juillet 2026' })).toBeInTheDocument(),
    );
    expect(screen.queryByRole('button', { name: /télécharger le pdf/i })).not.toBeInTheDocument();
  });

  it('shows download PDF button for AWAITING_CLIENT_SIGNATURE CRA', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(AWAITING_DETAIL);
    render(<CraDetailModal craId={3} onClose={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /télécharger le pdf/i })).toBeInTheDocument(),
    );
  });

  it('shows reopen button for AWAITING_CLIENT_SIGNATURE CRA', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(AWAITING_DETAIL);
    render(<CraDetailModal craId={3} onClose={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /réouvrir le cra/i })).toBeInTheDocument(),
    );
  });

  it('does not show reopen button for DRAFT CRA', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(DRAFT_DETAIL);
    render(<CraDetailModal craId={2} onClose={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Juillet 2026' })).toBeInTheDocument(),
    );
    expect(screen.queryByRole('button', { name: /réouvrir le cra/i })).not.toBeInTheDocument();
  });

  it('triggers PDF download when download button is clicked', async () => {
    const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });
    vi.mocked(craApi.getCra).mockResolvedValue(VALIDATED_DETAIL);
    vi.mocked(craApi.downloadCraPdf).mockResolvedValue(mockBlob);
    const createObjectURL = vi.fn(() => 'blob:test');
    const revokeObjectURL = vi.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    render(<CraDetailModal craId={1} onClose={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /télécharger le pdf/i })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /télécharger le pdf/i }));
    await waitFor(() => expect(craApi.downloadCraPdf).toHaveBeenCalledWith(VALIDATED_DETAIL.id));
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();
  });
});

describe('CraDetailModal — close triggers', () => {
  it('calls onClose when × (Fermer) button is clicked', async () => {
    vi.mocked(craApi.getCra).mockReturnValue(new Promise(() => {}));
    const onClose = vi.fn();
    render(<CraDetailModal craId={1} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when the native cancel event fires (Escape key)', () => {
    vi.mocked(craApi.getCra).mockReturnValue(new Promise(() => {}));
    const onClose = vi.fn();
    render(<CraDetailModal craId={1} onClose={onClose} />);
    const dialog = document.querySelector('dialog')!;
    fireEvent(dialog, new Event('cancel', { bubbles: false }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop (dialog element itself) is clicked', () => {
    vi.mocked(craApi.getCra).mockReturnValue(new Promise(() => {}));
    const onClose = vi.fn();
    render(<CraDetailModal craId={1} onClose={onClose} />);
    const dialog = document.querySelector('dialog')!;
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose when clicking inside the modal content', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(VALIDATED_DETAIL);
    const onClose = vi.fn();
    render(<CraDetailModal craId={1} onClose={onClose} />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Juillet 2026' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('heading', { name: 'Juillet 2026' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows confirm dialog and aborts close when action is in-flight and user cancels', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(VALIDATED_DETAIL);
    vi.mocked(craApi.downloadCraPdf).mockReturnValue(new Promise(() => {}));
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    const onClose = vi.fn();
    render(<CraDetailModal craId={1} onClose={onClose} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /télécharger le pdf/i })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /télécharger le pdf/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));

    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('action est en cours'));
    expect(onClose).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('shows confirm dialog and aborts close via Escape (cancel event) when action is in-flight', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(VALIDATED_DETAIL);
    vi.mocked(craApi.downloadCraPdf).mockReturnValue(new Promise(() => {}));
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    const onClose = vi.fn();
    render(<CraDetailModal craId={1} onClose={onClose} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /télécharger le pdf/i })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /télécharger le pdf/i }));
    const dialog = document.querySelector('dialog')!;
    fireEvent(dialog, new Event('cancel', { bubbles: false }));

    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('action est en cours'));
    expect(onClose).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});

describe('CraDetailModal — accessibility', () => {
  it('close button has accessible label "Fermer"', () => {
    vi.mocked(craApi.getCra).mockReturnValue(new Promise(() => {}));
    render(<CraDetailModal craId={1} onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument();
  });

  it('dialog has aria-modal="true"', () => {
    vi.mocked(craApi.getCra).mockReturnValue(new Promise(() => {}));
    render(<CraDetailModal craId={1} onClose={vi.fn()} />);
    expect(document.querySelector('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('dialog is labelled by the title heading', () => {
    vi.mocked(craApi.getCra).mockReturnValue(new Promise(() => {}));
    render(<CraDetailModal craId={1} onClose={vi.fn()} />);
    const dialog = document.querySelector('dialog')!;
    const labelledById = dialog.getAttribute('aria-labelledby');
    expect(labelledById).toBeTruthy();
    const titleEl = document.getElementById(labelledById!);
    expect(titleEl).toBeInTheDocument();
  });
});

describe('CraDetailModal — entry points simulation', () => {
  it('opens and fetches CRA when craId is provided (calendar entry point)', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(VALIDATED_DETAIL);
    render(<CraDetailModal craId={1} onClose={vi.fn()} />);
    await waitFor(() => expect(craApi.getCra).toHaveBeenCalledWith(1));
    expect(document.querySelector('dialog[open]')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Juillet 2026' })).toBeInTheDocument(),
    );
  });

  it('re-fetches when craId changes (history entry point selecting a different CRA)', async () => {
    vi.mocked(craApi.getCra)
      .mockResolvedValueOnce(VALIDATED_DETAIL)
      .mockResolvedValueOnce({ ...DRAFT_DETAIL, id: 2, month: 6, year: 2026 });

    const { rerender } = render(<CraDetailModal craId={1} onClose={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Juillet 2026' })).toBeInTheDocument(),
    );

    rerender(<CraDetailModal craId={2} onClose={vi.fn()} />);
    await waitFor(() => expect(craApi.getCra).toHaveBeenCalledWith(2));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Juin 2026' })).toBeInTheDocument(),
    );
  });
});

describe('CraDetailModal — new interactions', () => {
  it('DRAFT CRA: renders CraValidation button', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(DRAFT_DETAIL);
    render(<CraDetailModal craId={2} onClose={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /valider et signer/i })).toBeInTheDocument(),
    );
  });

  it('DRAFT CRA: clicking a day calls updateDay', async () => {
    const updatedDto: CraDetailsDto = { ...DRAFT_DETAIL, totalWorkedDays: 0 };
    vi.mocked(craApi.getCra).mockResolvedValue(DRAFT_DETAIL);
    vi.mocked(craApi.updateDay).mockResolvedValue(updatedDto);

    render(<CraDetailModal craId={2} onClose={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Juillet 2026' })).toBeInTheDocument(),
    );

    // Day 1 of July 2026 is a Wednesday; DRAFT_DETAIL has worked=1 for day 1
    const dayCell = screen.getByRole('button', { name: 'Wednesday 1 — worked' });
    fireEvent.click(dayCell);

    await waitFor(() => expect(craApi.updateDay).toHaveBeenCalled());
  });

  it('DRAFT CRA: successful day update calls onMutated', async () => {
    const updatedDto: CraDetailsDto = { ...DRAFT_DETAIL, totalWorkedDays: 0 };
    vi.mocked(craApi.getCra).mockResolvedValue(DRAFT_DETAIL);
    vi.mocked(craApi.updateDay).mockResolvedValue(updatedDto);

    const onMutated = vi.fn();
    render(<CraDetailModal craId={2} onClose={vi.fn()} onMutated={onMutated} />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Juillet 2026' })).toBeInTheDocument(),
    );

    const dayCell = screen.getByRole('button', { name: 'Wednesday 1 — worked' });
    fireEvent.click(dayCell);

    await waitFor(() => expect(onMutated).toHaveBeenCalledWith(updatedDto));
  });

  it('AWAITING_CLIENT_SIGNATURE CRA: shows generate signature link button', async () => {
    vi.mocked(craApi.getCra).mockResolvedValue(AWAITING_DETAIL);
    render(<CraDetailModal craId={3} onClose={vi.fn()} />);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /générer le lien de signature/i }),
      ).toBeInTheDocument(),
    );
  });

  it('DRAFT CRA: successful validation calls onMutated', async () => {
    const sig = { signerName: 'Test Signer', signatureImage: 'data:image/png;base64,abc' };
    const validated: CraDetailsDto = { ...DRAFT_DETAIL, status: 'AWAITING_CLIENT_SIGNATURE' };

    vi.mocked(craApi.getCra).mockResolvedValue(DRAFT_DETAIL);
    vi.mocked(signatureClient.getSignature).mockResolvedValue(sig);
    vi.mocked(craApi.validateCra).mockResolvedValue(validated);

    const onMutated = vi.fn();
    render(<CraDetailModal craId={2} onClose={vi.fn()} onMutated={onMutated} />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /valider et signer/i })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /valider et signer/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Confirmer' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    // CraValidation calls onValidated after a 2s success animation
    await waitFor(() => expect(onMutated).toHaveBeenCalledWith(validated), { timeout: 3000 });
  }, 5000);

  it('after reopen success, calls onMutated with refreshed DTO', async () => {
    const reopened: CraDetailsDto = { ...AWAITING_DETAIL, status: 'DRAFT' };
    vi.mocked(craApi.getCra)
      .mockResolvedValueOnce(AWAITING_DETAIL)
      .mockResolvedValueOnce(reopened);
    vi.mocked(craApi.reopenCra).mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const onMutated = vi.fn();
    render(<CraDetailModal craId={3} onClose={vi.fn()} onMutated={onMutated} />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /réouvrir le cra/i })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /réouvrir le cra/i }));

    await waitFor(() => expect(onMutated).toHaveBeenCalledWith(reopened));
  });
});
