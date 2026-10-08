import React, { useState } from 'react';
import { useAiAssistant } from '../../hooks/useAiAssistant';

export const AiAssistantPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const { processPrompt, loading, error } = useAiAssistant();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const result = await processPrompt(input);
    if (result?.success) {
      console.log('AI Processed:', result.data);
      setInput('');
      alert('Giao dịch đã được tạo thành công!');
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Stitch AI Assistant</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ví dụ: Chi 50k ăn sáng bằng tiền mặt..."
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          rows={3}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 transition-colors"
        >
          {loading ? 'Đang xử lý...' : 'Phân tích'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
};
