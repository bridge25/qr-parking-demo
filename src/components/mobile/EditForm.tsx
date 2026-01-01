// Design-TAG-008: EditForm component
// Function-TAG-008: Form for editing vehicle info

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface EditFormProps {
  shortId: string;
  initialData: {
    vehicleNumber: string;
    phoneNumber: string;
    safeNumber: string;
  };
  password: string;
  onBack: () => void;
  onDeleted: () => void;
}

export default function EditForm({
  shortId,
  initialData,
  password,
  onBack,
  onDeleted,
}: EditFormProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialData.phoneNumber);
  const [vehicleNumber, setVehicleNumber] = useState(initialData.vehicleNumber);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate new password if provided
    if (newPassword && newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다');
      return;
    }

    if (newPassword && newPassword.length !== 4) {
      setError('비밀번호는 4자리여야 합니다');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/qr/${shortId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          phoneNumber,
          vehicleNumber,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '수정에 실패했습니다');
        return;
      }

      setSuccess('정보가 수정되었습니다');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Update error:', err);
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(`/api/qr/${shortId}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '삭제에 실패했습니다');
        return;
      }

      onDeleted();
    } catch (err) {
      console.error('Delete error:', err);
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>돌아가기</span>
      </button>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>정보 수정</CardTitle>
          <CardDescription>
            등록된 차량 정보를 수정할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">전화번호</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const formatted = e.target.value
                    .replace(/\D/g, '')
                    .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
                  setPhoneNumber(formatted);
                }}
                placeholder="010-1234-5678"
                disabled={isLoading}
                maxLength={13}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">차량번호</Label>
              <Input
                id="vehicleNumber"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="12가1234 또는 158라5487"
                disabled={isLoading}
                maxLength={9}
              />
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-3">
                비밀번호 변경 (선택)
              </p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">새 비밀번호 (4자리)</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value.replace(/\D/g, ''))}
                    placeholder="변경 시에만 입력"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value.replace(/\D/g, ''))}
                    placeholder="다시 입력"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.p
                className="text-sm text-red-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}

            {success && (
              <motion.p
                className="text-sm text-green-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {success}
              </motion.p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Delete Section */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            등록 해제
          </CardTitle>
          <CardDescription>
            차량 등록을 해제하면 안심번호가 삭제됩니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              등록 해제
            </Button>
          ) : (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm text-gray-600">
                정말 등록을 해제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      삭제 중...
                    </>
                  ) : (
                    '확인'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <p className="text-xs text-gray-400 text-center">
        안심번호: {initialData.safeNumber}
      </p>
    </motion.div>
  );
}
