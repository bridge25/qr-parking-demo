// Design-TAG-007: Mobile QR Page
// Function-TAG-007: QR code landing page with status-based routing

'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { motion } from 'framer-motion';
import RegisterForm from '@/components/mobile/RegisterForm';
import SafeNumberCard from '@/components/mobile/SafeNumberCard';
import CallButton from '@/components/mobile/CallButton';
import PasswordModal from '@/components/mobile/PasswordModal';
import EditForm from '@/components/mobile/EditForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Car, Settings, Home } from 'lucide-react';
import Link from 'next/link';

type QRStatus = 'UNREGISTERED' | 'REGISTERED';
type ViewMode = 'caller' | 'edit';

interface VehicleInfo {
  vehicleNumber: string;
  safeNumber: string;
  maskedPhoneNumber?: string;
  registeredAt?: string;
}

interface VehicleEditData {
  vehicleNumber: string;
  phoneNumber: string;
  safeNumber: string;
}

interface QRData {
  id?: string;
  shortId: string;
  status: QRStatus;
  message?: string;
  vehicle?: VehicleInfo;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function QRPage({ params }: PageProps) {
  const { id } = use(params);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode states
  const [viewMode, setViewMode] = useState<ViewMode>('caller');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [verifiedPassword, setVerifiedPassword] = useState<string>('');
  const [vehicleEditData, setVehicleEditData] = useState<VehicleEditData | null>(null);
  const [hasAutoDialed, setHasAutoDialed] = useState(false);

  const fetchQRData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/qr/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('유효하지 않은 QR 코드입니다');
        } else {
          setError('정보를 불러오는데 실패했습니다');
        }
        return;
      }

      const data: QRData = await response.json();
      setQrData(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQRData();
  }, [fetchQRData]);

  // Auto-dial when registered vehicle page loads (for callers)
  useEffect(() => {
    if (
      qrData?.status === 'REGISTERED' &&
      qrData?.vehicle?.safeNumber &&
      viewMode === 'caller' &&
      !hasAutoDialed &&
      !isLoading
    ) {
      setHasAutoDialed(true);
      // Small delay to ensure page renders first
      const timer = setTimeout(() => {
        window.location.href = `tel:${qrData.vehicle!.safeNumber}`;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [qrData, viewMode, hasAutoDialed, isLoading]);

  const handleRegistrationSuccess = () => {
    fetchQRData();
  };

  const handlePasswordVerified = (vehicleData: VehicleEditData) => {
    setVehicleEditData(vehicleData);
    setIsPasswordModalOpen(false);
    setViewMode('edit');
  };

  const handleEditBack = () => {
    setViewMode('caller');
    setVehicleEditData(null);
    setVerifiedPassword('');
  };

  const handleDeleted = () => {
    setViewMode('caller');
    setVehicleEditData(null);
    setVerifiedPassword('');
    fetchQRData(); // Refresh to show registration form
  };

  const openPasswordModal = (password: string) => {
    setVerifiedPassword(password);
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-600">정보를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">오류 발생</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={fetchQRData}>다시 시도</Button>
              <Link href="/">
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  메인으로
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // No data state (shouldn't happen, but handle gracefully)
  if (!qrData) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-600">데이터를 찾을 수 없습니다</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Unregistered state - show registration form (for car owner)
  if (qrData.status === 'UNREGISTERED') {
    return (
      <motion.main
        className="min-h-screen bg-gray-50 py-8 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <motion.div className="text-center space-y-2" variants={itemVariants}>
            <Car className="w-12 h-12 text-blue-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">주차 안심 서비스</h1>
            <p className="text-gray-500 text-sm">QR 코드: {qrData.shortId}</p>
          </motion.div>

          {/* Registration Form */}
          <motion.div variants={itemVariants}>
            <RegisterForm
              shortId={qrData.shortId}
              onSuccess={handleRegistrationSuccess}
            />
          </motion.div>

          {/* Info */}
          <motion.div
            className="bg-blue-50 rounded-lg p-4"
            variants={itemVariants}
          >
            <p className="text-sm text-gray-600 text-center">
              차량 정보를 등록하면 안심번호가 발급됩니다.
              <br />
              주차장에서 안심번호로 연락받으세요.
            </p>
          </motion.div>

          {/* Home Button */}
          <motion.div variants={itemVariants}>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                메인으로 돌아가기
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.main>
    );
  }

  // Edit mode - show edit form (for car owner after password verification)
  if (viewMode === 'edit' && vehicleEditData) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <EditForm
          shortId={qrData.shortId}
          initialData={vehicleEditData}
          password={verifiedPassword}
          onBack={handleEditBack}
          onDeleted={handleDeleted}
        />

        {/* Password Modal */}
        <PasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onVerified={handlePasswordVerified}
          shortId={qrData.shortId}
        />
      </main>
    );
  }

  // Registered state - show safe number and call button (for caller/third party)
  return (
    <motion.main
      className="min-h-screen py-8 px-4 text-white"
      style={{
        background: 'linear-gradient(135deg, #1E3A5F, #3B82F6)',
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-sm mx-auto space-y-6">
        {/* Header */}
        <motion.div className="text-center space-y-2" variants={itemVariants}>
          <Car className="w-12 h-12 text-white mx-auto" />
          <h1 className="text-2xl font-bold">주차 안심 서비스</h1>
          <p className="text-gray-300 text-sm">QR 코드: {qrData.shortId}</p>
        </motion.div>

        {/* Vehicle Info */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/10 border-white/20 rounded-xl">
            <CardContent className="py-4">
              <div className="flex items-center justify-center gap-2">
                <Car className="w-5 h-5 text-white" />
                <span className="text-lg font-semibold">
                  {qrData.vehicle?.vehicleNumber}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Safe Number Card */}
        {qrData.vehicle?.safeNumber && (
          <motion.div variants={itemVariants}>
            <SafeNumberCard safeNumber={qrData.vehicle.safeNumber} />
          </motion.div>
        )}

        {/* Call Button */}
        {qrData.vehicle?.safeNumber && (
          <motion.div variants={itemVariants}>
            <CallButton phoneNumber={qrData.vehicle.safeNumber} />
          </motion.div>
        )}

        {/* Footer Info */}
        <motion.div
          className="bg-white/10 rounded-lg p-4"
          variants={itemVariants}
        >
          <p className="text-xs text-gray-300 text-center">
            주차장에서 차량 이동이 필요하면 안심번호로 연락이 옵니다.
            <br />
            개인정보는 안전하게 보호됩니다.
          </p>
        </motion.div>

        {/* Edit Button (for car owner) */}
        <motion.div variants={itemVariants}>
          <Button
            variant="ghost"
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full text-gray-300 hover:text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            <span>내 정보 수정</span>
          </Button>
        </motion.div>

        {/* Home Button */}
        <motion.div variants={itemVariants}>
          <Link href="/">
            <Button variant="ghost" className="w-full text-gray-300 hover:text-white">
              <Home className="w-4 h-4 mr-2" />
              메인으로 돌아가기
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Password Modal */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onVerified={(data, password) => {
          setVehicleEditData(data);
          setVerifiedPassword(password);
          setIsPasswordModalOpen(false);
          setViewMode('edit');
        }}
        shortId={qrData.shortId}
      />
    </motion.main>
  );
}
