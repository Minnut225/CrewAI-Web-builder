import React from 'react';
import { TestSuiteView } from '../../components/transactions/TestSuiteView';
import Sidebar from '../../components/layout/Sidebar';
import { TopHeader } from '../../components/layout/TopHeader';

export const TestSuitePage: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-950 font-inter text-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopHeader title="Transaction Engine Test Suite (Task 4.6)" />
        <main className="p-6 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Kiểm thử tính toán & số dư tài khoản (TC_TXN_01 — TC_TXN_09)</h1>
            <p className="text-sm text-slate-400 mt-1">
              Thực thi toàn bộ các kịch bản kiểm thử tích hợp và đơn vị cho Core Transaction Engine theo đặc tả kỹ thuật Phase 4.
            </p>
          </div>
          <TestSuiteView />
        </main>
      </div>
    </div>
  );
};
