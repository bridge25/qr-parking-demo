// Design-TAG-006: Admin QR Generate page
// Function-TAG-006: Admin page for QR code generation

import QRGenerator from '@/components/admin/QRGenerator';

export const metadata = {
  title: 'QR 코드 생성 - 관리자',
  description: '주차장 QR 코드를 일괄 생성하고 다운로드합니다',
};

export default function AdminGeneratePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">QR 코드 생성</h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            주차장에서 사용할 QR 코드를 일괄로 생성하고 다운로드할 수 있습니다.
          </p>
        </header>

        <QRGenerator />
      </div>
    </div>
  );
}
