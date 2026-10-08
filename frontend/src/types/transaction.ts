import { Category, CategoryResponseDTO } from './category';
import { Account, AccountSummary } from './account';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: number;
  userId?: number;
  accountId: number;
  accountName?: string;
  walletId?: number;
  walletName?: string;
  categoryId: number;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  note?: string;
  receiptUrl?: string;
  createdAt?: string;
}

export type TransactionResponse = Transaction;
export type TransactionResponseDTO = Transaction;

export interface TransactionCreateRequest {
  accountId?: number;
  walletId?: number;
  categoryId: number;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  note?: string;
  receiptUrl?: string;
}

export type TransactionCreateRequestDTO = TransactionCreateRequest;

export interface TransactionUpdateRequest {
  accountId?: number;
  walletId?: number;
  categoryId: number;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  note?: string;
  receiptUrl?: string;
}

export type TransactionUpdateRequestDTO = TransactionUpdateRequest;

export interface DashboardResponse {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  recentTransactions: Transaction[];
  budgetProgress?: Array<{
    categoryId: number;
    categoryName: string;
    spent: number;
    limit: number;
    percentage: number;
  }>;
}

export interface WalletResponseDTO {
  id: number;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export type Wallet = WalletResponseDTO;

export type { Category, CategoryResponseDTO, Account, AccountSummary };
