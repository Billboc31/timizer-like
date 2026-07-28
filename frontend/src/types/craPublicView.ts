export interface CraPublicView {
  month: number;
  year: number;
  providerFirstName: string;
  providerLastName: string;
  providerCompany: string;
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
