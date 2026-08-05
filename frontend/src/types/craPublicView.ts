export interface CraPublicView {
  craId: number;
  status: string;
  month: number;
  year: number;
  providerRaisonSociale: string;
  clientFirstName: string;
  clientLastName: string;
  clientCompany: string;
  clientContactEmail: string;
  providerSignatureDate: string;
  totalWorkedDays: number;
  dayEntries: Array<{
    day: number;
    worked: number;
    note: string | null;
  }>;
}
