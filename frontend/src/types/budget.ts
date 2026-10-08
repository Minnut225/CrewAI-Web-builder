export type BudgetStatus = 'NORMAL' | 'WARNING' | 'OVERBUDGET';

export interface BudgetCategoryItem {
  budgetId?: number;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor?: string;
  limitAmount: number;
  amountSpent: number;
  spentAmount?: number;
  remaining: number;
  remainingAmount?: number;
  percentage: number;
  status: BudgetStatus;
}

export interface BudgetStatusBreakdown {
  NORMAL: number;
  WARNING: number;
  OVERBUDGET: number;
}

export interface BudgetSummaryResponse {
  month: string;
  totalBudget: number;
  totalLimit?: number;
  totalSpent: number;
  spentAmount?: number;
  totalRemaining: number;
  remainingAmount?: number;
  overallPercentage: number;
  statusBreakdown?: BudgetStatusBreakdown;
  categories: BudgetCategoryItem[];
}

export interface UpsertBudgetRequest {
  categoryId: number;
  limitAmount: number;
  month: string;
}

export interface BudgetResponse {
  id: number;
  categoryId: number;
  categoryName: string;
  limitAmount: number;
  month: string;
  createdAt: string;
}