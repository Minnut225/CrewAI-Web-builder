export type AccountType = 'CASH' | 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT' | 'LOAN' | 'OTHER';

export interface Account {
  id: number;
  userId: number;
  name: string;
  type: AccountType;
  balance: number; // Stored and transmitted as number (Long/integer in backend)
  currency: string;
  color?: string;
  icon?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountSummary {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  accounts: Account[];
}

export interface AccountRequest {
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color?: string;
  icon?: string;
}
