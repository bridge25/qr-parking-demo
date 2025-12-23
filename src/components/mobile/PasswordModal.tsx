// Design-TAG-008: PasswordModal component
// Function-TAG-008: Modal for password verification before editing

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Lock, Loader2 } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (vehicleData: {
    vehicleNumber: string;
    phoneNumber: string;
    safeNumber: string;
  }, password: string) => void;
  shortId: string;
}

export default function PasswordModal({
  isOpen,
  onClose,
  onVerified,
  shortId,
}: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError('비밀번호를 입력해주세요');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/qr/${shortId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '확인에 실패했습니다');
        return;
      }

      onVerified(data.vehicle, password);
      setPassword('');
    } catch (err) {
      console.error('Password verification error:', err);
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <Card className="shadow-2xl">
              <CardHeader className="relative">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Lock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">본인 확인</CardTitle>
                    <CardDescription>
                      등록 시 설정한 비밀번호를 입력해주세요
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">비밀번호 (4자리)</Label>
                    <Input
                      id="password"
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="0000"
                      value={password}
                      onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>

                  {error && (
                    <motion.p
                      className="text-sm text-red-500"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.p>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleClose}
                      disabled={isLoading}
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading || password.length !== 4}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          확인 중
                        </>
                      ) : (
                        '확인'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
