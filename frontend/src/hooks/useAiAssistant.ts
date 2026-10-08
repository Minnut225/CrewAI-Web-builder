import { useState } from 'react';
import axios from 'axios';

export interface AiTransactionData {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  account: string;
  note: string;
}

export interface AiResponse {
  success: boolean;
  data?: AiTransactionData;
  message: string;
}

export const useAiAssistant = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPrompt = async (userInput: string): Promise<AiResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<AiResponse>('/api/v1/ai/process', { userInput });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { processPrompt, loading, error };
};
