interface SigningSuccessScreenProps {
  signerName: string;
  signedAt: Date;
}

export function SigningSuccessScreen({ signerName, signedAt }: SigningSuccessScreenProps) {
  const dateStr = signedAt.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div data-testid="signing-success" role="status">
      <h2>Le CRA a bien été signé</h2>
      <p>
        Signé par <strong>{signerName}</strong> le {dateStr}.
      </p>
    </div>
  );
}
