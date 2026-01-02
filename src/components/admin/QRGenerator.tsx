// Design-TAG-005: QRGenerator component
// Function-TAG-005: Generate QR codes with batch operations

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import JSZip from 'jszip';
import QRCode from 'qrcode';

interface GeneratedQRCode {
  shortId: string;
  fullUrl: string;
  imageDataUrl?: string;
}

export default function QRGenerator() {
  const [count, setCount] = useState<string>('10');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodes, setQRCodes] = useState<GeneratedQRCode[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isValidCount = () => {
    const num = parseInt(count, 10);
    return !isNaN(num) && num >= 1 && num <= 1000;
  };

  const handleGenerate = async () => {
    if (!isValidCount()) {
      setError('1에서 1000 사이의 숫자를 입력하세요');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch('/api/admin/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: parseInt(count, 10) }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();

      // Generate QR code images for display
      const qrCodesWithImages = await Promise.all(
        data.qrCodes.map(async (qr: GeneratedQRCode) => {
          const imageDataUrl = await QRCode.toDataURL(qr.fullUrl, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 200,
            margin: 1,
          });
          return { ...qr, imageDataUrl };
        })
      );

      setQRCodes(qrCodesWithImages);
      setError(null);
    } catch (err) {
      setError('생성 실패: 다시 시도해주세요');
      console.error('QR generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAll = async () => {
    try {
      const zip = new JSZip();

      for (const qr of qrCodes) {
        const qrImage = await QRCode.toDataURL(qr.fullUrl, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 200,
        });

        const base64Data = qrImage.replace(/^data:image\/png;base64,/, '');
        zip.file(`${qr.shortId}.png`, base64Data, { base64: true });
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-codes-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('다운로드 실패: 다시 시도해주세요');
      console.error('Download error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>QR 코드 생성</CardTitle>
          <CardDescription>일괄로 QR 코드를 생성하고 다운로드합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="count">생성할 개수 (1-1000)</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="1000"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="10"
              disabled={isGenerating}
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <Button
            onClick={handleGenerate}
            disabled={!isValidCount() || isGenerating}
            className="w-full"
          >
            {isGenerating ? '생성 중...' : '생성'}
          </Button>
        </CardContent>
      </Card>

      {qrCodes.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>생성된 QR 코드</CardTitle>
                <CardDescription>{qrCodes.length}개 생성됨</CardDescription>
              </div>
              <Button onClick={handleDownloadAll} variant="outline" size="sm">
                모두 다운로드
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {qrCodes.map((qr) => (
                <div key={qr.shortId} className="flex flex-col items-center gap-2">
                  <div className="w-full aspect-square bg-white rounded border border-gray-300 flex items-center justify-center overflow-hidden">
                    {qr.imageDataUrl ? (
                      <img
                        src={qr.imageDataUrl}
                        alt={`QR Code ${qr.shortId}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <p className="text-xs font-mono text-gray-400">{qr.shortId}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {qr.shortId}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
