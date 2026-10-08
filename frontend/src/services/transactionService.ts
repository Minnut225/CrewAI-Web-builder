import { Transaction, TransactionCreateRequest, TransactionUpdateRequest, DashboardResponse } from '../types/transaction';
import api from './api';

export interface GetTransactionsParams {
  accountId?: number;
  categoryId?: number;
  type?: 'INCOME' | 'EXPENSE';
  startDate?: string;
  endDate?: string;
  fromDate?: string;
  toDate?: string;
  keyword?: string;
  search?: string;
  month?: string;
  page?: number;
  size?: number;
}

export const transactionService = {
  // Get all transactions with optional filters
  async getTransactions(params?: GetTransactionsParams): Promise<{ content: Transaction[]; totalElements: number; totalPages: number }> {
    try {
      const queryParams: Record<string, any> = { ...params };
      if (params?.fromDate && !params.startDate) queryParams.startDate = params.fromDate;
      if (params?.toDate && !params.endDate) queryParams.endDate = params.toDate;
      if (params?.search && !params.keyword) queryParams.keyword = params.search;

      const response = await api.get('/transactions', { params: queryParams });
      const raw = response.data?.data !== undefined ? response.data.data : response.data;

      if (Array.isArray(raw)) {
        return {
          content: raw,
          totalElements: raw.length,
          totalPages: 1,
        };
      }
      if (raw && Array.isArray(raw.content)) {
        return {
          content: raw.content,
          totalElements: raw.totalElements ?? raw.content.length,
          totalPages: raw.totalPages ?? 1,
        };
      }
      return { content: [], totalElements: 0, totalPages: 0 };
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  },

  // Get single transaction by ID
  async getTransactionById(id: number): Promise<Transaction> {
    const response = await api.get(`/transactions/${id}`);
    const raw = response.data?.data !== undefined ? response.data.data : response.data;
    return raw;
  },

  // Create transaction (TC_TXN_01, TC_TXN_02)
  async createTransaction(data: TransactionCreateRequest): Promise<Transaction> {
    const payload = {
      ...data,
      accountId: data.accountId ?? data.walletId,
      transactionDate: data.transactionDate ? data.transactionDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    };
    const response = await api.post('/transactions', payload);
    const raw = response.data?.data !== undefined ? response.data.data : response.data;
    return raw;
  },

  // Update transaction (TC_TXN_03, TC_TXN_04)
  async updateTransaction(id: number, data: TransactionUpdateRequest): Promise<Transaction> {
    const payload = {
      ...data,
      accountId: data.accountId ?? data.walletId,
      transactionDate: data.transactionDate ? data.transactionDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    };
    const response = await api.put(`/transactions/${id}`, payload);
    const raw = response.data?.data !== undefined ? response.data.data : response.data;
    return raw;
  },

  // Delete transaction (TC_TXN_05, TC_TXN_06)
  async deleteTransaction(id: number): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },

  // Get dashboard summary (Calculated or fallback)
  async getDashboardSummary(month?: string): Promise<DashboardResponse> {
    try {
      const response = await api.get('/dashboard/summary', { params: { month } });
      const raw = response.data?.data !== undefined ? response.data.data : response.data;
      return raw;
    } catch (err) {
      // Fallback calculation using getTransactions
      const txs = await this.getTransactions({ month });
      const totalIncome = txs.content.filter(t => t.type === 'INCOME').reduce((s, c) => s + (c.amount || 0), 0);
      const totalExpense = txs.content.filter(t => t.type === 'EXPENSE').reduce((s, c) => s + (c.amount || 0), 0);
      return {
        totalBalance: totalIncome - totalExpense,
        monthlyIncome: totalIncome,
        monthlyExpense: totalExpense,
        recentTransactions: txs.content
      };
    }
  },

  // Get monthly calendar aggregate view (TC_TXN_09)
  async getCalendarSummary(year: number, month: number): Promise<{
    year: number;
    month: number;
    dailySummaries: Array<{
      date: string;
      totalIncome: number;
      totalExpense: number;
      transactions: Transaction[];
    }>;
  }> {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const txs = await this.getTransactions({ month: monthStr, size: 200 });

    const grouped: Record<string, { totalIncome: number; totalExpense: number; transactions: Transaction[] }> = {};
    txs.content.forEach(t => {
      const d = t.transactionDate ? t.transactionDate.slice(0, 10) : '';
      if (!grouped[d]) {
        grouped[d] = { totalIncome: 0, totalExpense: 0, transactions: [] };
      }
      if (t.type === 'INCOME') grouped[d].totalIncome += t.amount;
      else grouped[d].totalExpense += t.amount;
      grouped[d].transactions.push(t);
    });

    const dailySummaries = Object.entries(grouped).map(([date, val]) => ({
      date,
      totalIncome: val.totalIncome,
      totalExpense: val.totalExpense,
      transactions: val.transactions
    }));

    return {
      year,
      month,
      dailySummaries
    };
  }
};
