import api from './api';
import { Account, AccountSummary, AccountRequest } from '../types/account';

export const accountService = {
  async getAccounts(): Promise<AccountSummary> {
    const response = await api.get<{ success: boolean; message: string; data: AccountSummary }>('/v1/accounts');
    if (response.data && response.data.data) {
      return response.data.data;
    }
    // Fallback if response structure varies
    return (response.data as unknown) as AccountSummary;
  },

  async createAccount(data: AccountRequest): Promise<Account> {
    const response = await api.post<{ success: boolean; message: string; data: Account }>('/v1/accounts', data);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return (response.data as unknown) as Account;
  },

  async archiveAccount(id: number): Promise<void> {
    await api.patch(`/v1/accounts/${id}/archive`);
  }
};
