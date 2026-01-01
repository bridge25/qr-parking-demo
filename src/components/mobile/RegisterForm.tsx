// Design-TAG-006: RegisterForm component
// Function-TAG-006: Mobile vehicle registration form with validation

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

interface RegisterFormProps {
  shortId: string;
  onSuccess?: () => void;
}

const validatePhoneNumber = (phone: string): boolean => {
  const koreanPhoneRegex = /^01[0-9]\d{7,8}$/;
  return koreanPhoneRegex.test(phone.replace(/-/g, ''));
};

const validateVehicleNumber = (vehicle: string): boolean => {
  // 2자리(12가1234) 또는 3자리(158라5487) 형식 허용
  const koreanVehicleRegex = /^\d{2,3}[가-힣]\d{4}$/;
  return koreanVehicleRegex.test(vehicle);
};

const validatePassword = (password: string): boolean => {
  return /^\d{4}$/.test(password);
};

export default function RegisterForm({ shortId, onSuccess }: RegisterFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid =
    validatePhoneNumber(phoneNumber) &&
    validateVehicleNumber(vehicleNumber) &&
    validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setError('모든 필드를 올바르게 입력해주세요');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/qr/${shortId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/-/g, ''),
          vehicleNumber,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      setPhoneNumber('');
      setVehicleNumber('');
      setPassword('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('등록 실패: 다시 시도해주세요');
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>차량 등록</CardTitle>
        <CardDescription>안전번호를 받기 위해 정보를 입력하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">전화번호</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="010-1234-5678"
              value={phoneNumber}
              onChange={(e) => {
                const formatted = e.target.value
                  .replace(/\D/g, '')
                  .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
                setPhoneNumber(formatted);
              }}
              disabled={isSubmitting}
              aria-invalid={Boolean(
                phoneNumber && !validatePhoneNumber(phoneNumber.replace(/-/g, '')),
              )}
              maxLength={13}
            />
            {phoneNumber && !validatePhoneNumber(phoneNumber.replace(/-/g, '')) && (
              <p className="text-sm text-red-500">올바른 전화번호를 입력하세요 (01x-xxxx-xxxx)</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle">차량번호 (예: 12가1234, 158라5487)</Label>
            <Input
              id="vehicle"
              type="text"
              placeholder="12가1234 또는 158라5487"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              disabled={isSubmitting}
              aria-invalid={Boolean(vehicleNumber && !validateVehicleNumber(vehicleNumber))}
              maxLength={9}
            />
            {vehicleNumber && !validateVehicleNumber(vehicleNumber) && (
              <p className="text-sm text-red-500">올바른 차량번호를 입력하세요 (예: 12가1234 또는 158라5487)</p>
            )}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="password">비밀번호 (4자리)</Label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="0000"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
              disabled={isSubmitting}
              aria-invalid={Boolean(password && !validatePassword(password))}
              maxLength={4}
              inputMode="numeric"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-0 transform -translate-y-1/2 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            {password && !validatePassword(password) && (
              <p className="text-sm text-red-500">4자리 숫자를 입력하세요</p>
            )}
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? '등록 중...' : '등록'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
