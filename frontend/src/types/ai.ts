export interface AiParseRequest {
  prompt: string;
}

export interface AiParseResponse {
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'QUERY';
  categoryName: string;
  description: string;
  paymentMethod?: string;
  accountName?: string;
  confidence?: number;
  confidenceScore?: number;
  transactionDate?: string;
  rawPrompt?: string;
}

export interface AiInsightsRequest {
  monthlyIncome: number;
  monthlyExpense: number;
  topCategory?: string;
  topCategoryAmount?: number;
  budgetLimit?: number;
}

export interface AiInsightsResponse {
  success: boolean;
  insights: string;
}

export interface AiConfirmRequest {
  amount: number;
  type?: string;
  categoryName?: string;
  categoryId?: number;
  accountName?: string;
  accountId?: number;
  note?: string;
  description?: string;
  transactionDate?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isInsight?: boolean;
  previewData?: AiParseResponse;
}
