export interface CraSummaryApi {
  id: number;
  month: number;
  year: number;
  totalWorkedDays: number;
  status: 'DRAFT' | 'VALIDATED';
  validationDate: string | null;
}

// CRA for March 2024, partially filled (DRAFT)
export const mockCraInProgressSummary: CraSummaryApi = {
  id: 1,
  month: 3,
  year: 2024,
  totalWorkedDays: 5,
  status: 'DRAFT',
  validationDate: null,
};

// CRA for March 2024, fully validated
export const mockCraValidatedSummary: CraSummaryApi = {
  id: 2,
  month: 3,
  year: 2024,
  totalWorkedDays: 21,
  status: 'VALIDATED',
  validationDate: '2024-04-01',
};

// Three CRAs at various states for the history table
export const mockCraList: CraSummaryApi[] = [
  {
    id: 1,
    month: 1,
    year: 2024,
    totalWorkedDays: 20,
    status: 'VALIDATED',
    validationDate: '2024-02-01',
  },
  {
    id: 2,
    month: 2,
    year: 2024,
    totalWorkedDays: 18,
    status: 'VALIDATED',
    validationDate: '2024-03-01',
  },
  {
    id: 3,
    month: 3,
    year: 2024,
    totalWorkedDays: 5,
    status: 'DRAFT',
    validationDate: null,
  },
];
