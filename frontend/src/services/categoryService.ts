import { api } from './api';
import { Category, CategoryRequest } from '../types/category';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<ApiResponse<Category[]> | Category[]>('/v1/categories');
    const resData = response.data;
    if (resData && typeof resData === 'object' && 'data' in resData && resData.data) {
      return (resData as ApiResponse<Category[]>).data;
    }
    return resData as Category[];
  },

  async createCategory(data: CategoryRequest): Promise<Category> {
    const response = await api.post<ApiResponse<Category> | Category>('/v1/categories', data);
    const resData = response.data;
    if (resData && typeof resData === 'object' && 'data' in resData && resData.data) {
      return (resData as ApiResponse<Category>).data;
    }
    return resData as Category;
  },

  async updateCategory(id: number, data: CategoryRequest): Promise<Category> {
    const response = await api.put<ApiResponse<Category> | Category>(`/v1/categories/${id}`, data);
    const resData = response.data;
    if (resData && typeof resData === 'object' && 'data' in resData && resData.data) {
      return (resData as ApiResponse<Category>).data;
    }
    return resData as Category;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/v1/categories/${id}`);
  },
};
