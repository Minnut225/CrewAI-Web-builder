export interface CategoryResponseDTO {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  color?: string;
  isDefault?: boolean;
  budgetLimit?: number;
}

export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category extends CategoryResponseDTO {}

export interface CategoryRequest {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
}
