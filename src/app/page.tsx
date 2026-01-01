import Link from "next/link";
import { Car, Shield, Phone, QrCode, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800">
      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center text-white space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-white/20 rounded-full">
              <Car className="w-16 h-16" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold">
            주차 안심 서비스
          </h1>

          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            QR 코드로 간편하게 차량을 등록하고,<br />
            안심번호로 개인정보를 보호하세요.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-white text-center">
            <QrCode className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">QR 코드 스캔</h3>
            <p className="text-blue-100 text-sm">
              차량에 부착된 QR 코드를 스캔하면 바로 연락 가능
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-white text-center">
            <Shield className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">안심번호 보호</h3>
            <p className="text-blue-100 text-sm">
              실제 전화번호 대신 050 안심번호로 개인정보 보호
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-white text-center">
            <Phone className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">즉시 연결</h3>
            <p className="text-blue-100 text-sm">
              버튼 한 번으로 차주에게 바로 전화 연결
            </p>
          </div>
        </div>

        {/* Demo Links */}
        <div className="mt-16 space-y-4">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            데모 체험하기
          </h2>

          {/* 데모 시나리오 설명 */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 max-w-2xl mx-auto mb-6">
            <p className="text-blue-100 text-sm text-center">
              💡 <strong className="text-white">시연 시나리오:</strong> 신규 등록 → 안심번호 발급 → 바로 호출자 화면 확인
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Link
              href="/qr/J6UQDV"
              className="flex items-center gap-4 bg-white rounded-xl p-4 hover:shadow-lg transition-shadow border-2 border-yellow-400"
            >
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Car className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">1️⃣ 신규 차량 등록</h3>
                <p className="text-sm text-gray-500">등록 → 안심번호 발급 → 호출자 화면</p>
              </div>
            </Link>

            <Link
              href="/qr/J6UQDV"
              className="flex items-center gap-4 bg-white rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              <div className="p-3 bg-green-100 rounded-lg">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">2️⃣ 등록 결과 확인</h3>
                <p className="text-sm text-gray-500">호출자 화면 (등록 후 확인)</p>
              </div>
            </Link>
          </div>

          <div className="flex justify-center mt-8">
            <Link
              href="/admin"
              className="flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-full hover:bg-white/30 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>관리자 대시보드</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-blue-200 text-sm">
          <p>© 2024 주차 안심 서비스 - Demo Version</p>
        </footer>
      </main>
    </div>
  );
}
