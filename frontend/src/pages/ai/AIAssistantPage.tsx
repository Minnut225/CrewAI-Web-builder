import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { TopHeader } from '../../components/layout/TopHeader';
import { aiService } from '../../services/aiService';
import { ChatMessage, AiParseResponse } from '../../types/ai';
import { TransactionPreviewCard } from '../../components/ai/TransactionPreviewCard';

const SAMPLE_PROMPTS = [
  'Ăn bún bò 45k tiền mặt',
  'Nhận lương tháng này 15 triệu chuyển khoản',
  'Đổ xăng xe 80k ví Momo',
  'Uống cà phê 45k tiền mặt',
  'Mua sách 120k chuyển khoản',
];

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý FinMan AI được hỗ trợ bởi Google Gemini. Bạn chỉ cần nhập một câu tự nhiên (ví dụ: "Ăn bún bò 45k tiền mặt"), tôi sẽ tự động bóc tách số tiền, danh mục, ví và tạo giao dịch cho bạn ngay lập tức!',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Financial Insights widget state
  const [insightsText, setInsightsText] = useState<string>(
    'Đang kết nối mô hình Gemini 2.0 Flash để tổng hợp nhận xét dòng tiền...'
  );
  const [loadingInsights, setLoadingInsights] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    fetchInitialInsights();
  }, []);

  const fetchInitialInsights = async () => {
    try {
      setLoadingInsights(true);
      const res = await aiService.getInsights({
        monthlyIncome: 15000000,
        monthlyExpense: 8500000,
        topCategory: 'Ăn uống',
        topCategoryAmount: 3200000,
        budgetLimit: 10000000,
      });
      if (res && res.insights) {
        setInsightsText(res.insights);
      }
    } catch (err) {
      setInsightsText(
        'Tình trạng tài chính: Thu 15.000.000đ, Chi 8.500.000đ (56%). Kỷ luật chi tiêu tốt, bạn có thể tăng tích lũy thêm 20% vào quỹ dự phòng.'
      );
    } finally {
      setLoadingInsights(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSendPrompt = async (promptToSend?: string) => {
    const textToSend = promptToSend || input;
    if (!textToSend.trim() || loading) return;

    const userMessageId = Date.now().toString();
    const userMsg: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptToSend) setInput('');
    setLoading(true);

    try {
      // Check if user is asking for general financial advice or insights
      const lower = textToSend.toLowerCase();
      if (lower.includes('tư vấn') || lower.includes('đánh giá') || lower.includes('sức khỏe') || lower.includes('nhận xét')) {
        const insightsRes = await aiService.getInsights({
          monthlyIncome: 15000000,
          monthlyExpense: 8500000,
        });

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: insightsRes.insights,
          timestamp: new Date().toISOString(),
          isInsight: true,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        // Natural language transaction quick-add
        const parseResult = await aiService.quickAdd(textToSend);

        let aiReplyText = `Tôi đã bóc tách được giao dịch "${parseResult.description || textToSend}". Vui lòng kiểm tra thông tin chi tiết dưới đây:`;
        if (parseResult.amount === 0) {
          aiReplyText = 'Tôi chưa nhận diện rõ số tiền trong câu của bạn. Bạn có thể kiểm tra hoặc thử lại với mẫu: "Ăn phở 45k tiền mặt" nhé!';
        }

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReplyText,
          timestamp: new Date().toISOString(),
          previewData: parseResult.amount > 0 ? parseResult : undefined,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (error: any) {
      console.error('Failed to parse prompt with AI', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Xin lỗi, đã xảy ra lỗi trong quá trình xử lý với AI. Vui lòng thử lại với một câu ngắn gọn hơn.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransaction = async (msgId: string, previewData: AiParseResponse) => {
    try {
      setConfirmingId(msgId);
      await aiService.confirmTransaction(previewData);

      showNotification('success', `Đã lưu thành công giao dịch "${previewData.categoryName || 'Chi tiêu'}"!`);

      // Update message state to remove preview card and show success acknowledgment
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === msgId) {
            return {
              ...msg,
              text: `✅ Đã ghi nhận thành công giao dịch: ${previewData.type === 'INCOME' ? '+' : '-'}${previewData.amount.toLocaleString('vi-VN')}đ (${previewData.categoryName}) vào ví "${previewData.accountName || previewData.paymentMethod || 'Ví tiền mặt'}". Số dư tài khoản đã được cập nhật chính xác!`,
              previewData: undefined,
            };
          }
          return msg;
        })
      );
    } catch (err: any) {
      console.error('Failed to confirm transaction', err);
      showNotification('error', 'Không thể lưu giao dịch. Vui lòng thử lại.');
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCancelPreview = (msgId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          return {
            ...msg,
            text: 'Đã hủy bỏ giao dịch này theo yêu cầu của bạn.',
            previewData: undefined,
          };
        }
        return msg;
      })
    );
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      {/* Stitch Dual-Rail Navigation */}
      <Sidebar />
      <TopHeader />

      {/* Main Analytical Canvas */}
      <main className="lg:pl-72 pt-20 flex-1 flex flex-col max-w-[1440px] mx-auto w-full p-6 sm:p-8">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`fixed top-24 right-8 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {notification.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {notification.message}
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-[24px]">neurology</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface font-heading">
                Trợ lý FinMan AI
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Google Gemini 2.0 Flash • Bóc tách giao dịch tự nhiên tiếng Việt & Tư vấn tài chính thông minh
            </p>
          </div>

          <button
            onClick={fetchInitialInsights}
            disabled={loadingInsights}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low text-xs font-bold transition shrink-0"
          >
            <span className={`material-symbols-outlined text-[16px] ${loadingInsights ? 'animate-spin' : ''}`}>
              refresh
            </span>
            Làm mới đánh giá AI
          </button>
        </div>

        {/* Gemini Financial Advisor Banner */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-[28px]">psychology</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                Nhận định tài chính từ Gemini AI
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold">
                Live Analysis
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface leading-relaxed font-medium">
              {insightsText}
            </p>
          </div>
        </div>

        {/* Chat History & Interactive Dialogue Box */}
        <div className="flex-1 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
          {/* Chat Messages Container */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-primary text-white rounded-tr-none shadow-sm font-medium'
                        : 'bg-surface-container-low text-on-surface rounded-tl-none border border-outline-variant/20 font-normal'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Transaction Preview Card */}
                    {msg.previewData && (
                      <TransactionPreviewCard
                        data={msg.previewData}
                        onConfirm={() => handleConfirmTransaction(msg.id, msg.previewData!)}
                        onCancel={() => handleCancelPreview(msg.id)}
                        isConfirming={confirmingId === msg.id}
                      />
                    )}

                    <span
                      className={`block text-[10px] mt-1.5 ${
                        isUser ? 'text-white/70 text-right' : 'text-on-surface-variant text-left'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {isUser && (
                    <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface shrink-0 shadow-sm mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3 justify-start">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[20px] animate-pulse">neurology</span>
                </div>
                <div className="p-4 rounded-2xl rounded-tl-none bg-surface-container-low border border-outline-variant/20 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <span className="text-xs text-on-surface-variant font-medium ml-2">
                    Gemini đang bóc tách giao dịch...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions Bar */}
          <div className="px-6 py-2.5 bg-surface-container-low/50 border-t border-outline-variant/15 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-on-surface-variant shrink-0 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">lightbulb</span>
              Gợi ý:
            </span>
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendPrompt(sample)}
                disabled={loading}
                className="px-3 py-1 rounded-full bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/30 text-[11px] font-semibold text-on-surface-variant hover:text-on-surface whitespace-nowrap transition shadow-sm"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 sm:p-5 bg-surface-container-lowest border-t border-outline-variant/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="flex items-center gap-3"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ví dụ: Ăn phở 45k tiền mặt, hoặc 'Tư vấn chi tiêu tháng này'..."
                  disabled={loading}
                  className="w-full pl-4 pr-10 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-5 sm:px-6 py-3.5 bg-primary hover:bg-primary/95 disabled:bg-surface-container-high disabled:text-on-surface-variant/40 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-sm hover:shadow transition flex items-center gap-2 shrink-0"
              >
                <span>Gửi</span>
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
