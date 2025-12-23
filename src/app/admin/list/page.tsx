// Admin QR List Page
// Displays paginated list of all QR codes with filtering capabilities

import type { Metadata } from 'next';
import QRList from '@/components/admin/QRList';

export const metadata: Metadata = {
  title: 'QR 코드 목록 - 관리자',
  description: '등록된 모든 QR 코드를 조회하고 관리합니다.',
};

export default function AdminQRListPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">QR 코드 관리</h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            등록된 모든 QR 코드를 조회하고 관리할 수 있습니다.
          </p>
        </header>

        <QRList />
      </div>
    </main>
  );
}
