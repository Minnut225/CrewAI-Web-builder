import api from './api';
import { BudgetSummaryResponse, UpsertBudgetRequest, BudgetResponse } from '../types/budget';

export const budgetService = {
  getBudgetSummary: async (month?: string): Promise<BudgetSummaryResponse> => {
    const params = month ? { month } : {};
    const res = await api.get('/api/v1/budgets', { params });
    return res.data?.data || res.data;
  },

  upsertBudget: async (data: UpsertBudgetRequest): Promise<BudgetResponse> => {
    const res = await api.post('/api/v1/budgets', data);
    return res.data?.data || res.data;
  },

  deleteBudget: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/budgets/${id}`);
  },
};

export default budgetService;
