// Design-TAG-005: QRList component
// Function-TAG-005: Display paginated QR code list with filtering

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUp, ArrowDown, Trash2, QrCode, Loader2 } from 'lucide-react';
import QRCodeLib from 'qrcode';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface QRCodeRow {
  id: string;
  shortId: string;
  status: 'REGISTERED' | 'UNREGISTERED';
  vehicleNumber: string | null;
  phoneNumber: string | null;
}

interface ListResponse {
  qrCodes: QRCodeRow[];
  total: number;
  page: number;
  limit: number;
}

const SortableHeader = ({
  sortKey,
  currentSortKey,
  sortOrder,
  handleSort,
  children,
  className,
}: {
  sortKey: string;
  currentSortKey: string;
  sortOrder: string;
  handleSort: (key: string) => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <TableHead onClick={() => handleSort(sortKey)} className={`cursor-pointer ${className || ''}`}>
    <div className="flex items-center gap-2">
      {children}
      {currentSortKey === sortKey &&
        (sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
    </div>
  </TableHead>
);

const maskPhoneNumber = (phone: string | null): string => {
  if (!phone) return '-';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};


export default function QRList() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showQrId, setShowQrId] = useState<string | null>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
    setSubmittedSearchTerm(searchTerm);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch('/api/admin/qr', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      // Refresh the list
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          qrCodes: prev.qrCodes.filter((qr) => qr.id !== id),
          total: prev.total - 1,
        };
      });
    } catch (err) {
      console.error('Delete error:', err);
      alert('삭제 실패: 다시 시도해주세요');
    } finally {
      setDeletingId(null);
    }
  };

  const generateQrImage = async (shortId: string) => {
    if (qrImages[shortId]) {
      setShowQrId(showQrId === shortId ? null : shortId);
      return;
    }

    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const url = `${baseUrl}/qr/${shortId}`;
      const imageDataUrl = await QRCodeLib.toDataURL(url, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 200,
        margin: 1,
      });
      setQrImages((prev) => ({ ...prev, [shortId]: imageDataUrl }));
      setShowQrId(shortId);
    } catch (err) {
      console.error('QR generation error:', err);
    }
  };

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        setIsLoading(true);
        const url = `/api/admin/qr?page=${page}&limit=10&search=${submittedSearchTerm}&sortBy=${sortKey}&order=${sortOrder}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch QR codes');
        }

        const responseData = await response.json();
        setData(responseData);
        setError(null);
      } catch (err) {
        setError('목록을 불러올 수 없습니다');
        console.error('QRList fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQRCodes();
  }, [page, submittedSearchTerm, sortKey, sortOrder]);

  if (isLoading) {
    return <div className="text-center text-gray-500">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!data || !data.qrCodes || data.qrCodes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">QR 코드가 없습니다</div>
        </CardContent>
      </Card>
    );
  }

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR 코드 목록</CardTitle>
        <CardDescription className="text-sm sm:text-base whitespace-nowrap">
          총 {data.total}개 중 {(data.page - 1) * data.limit + 1}-
          {Math.min(data.page * data.limit, data.total)}개 표시
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="search"
            placeholder="차량번호 또는 전화번호로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="text-sm sm:text-base"
          />
          <Button onClick={handleSearch}>검색</Button>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader
                  sortKey="shortId"
                  currentSortKey={sortKey}
                  sortOrder={sortOrder}
                  handleSort={handleSort}
                >
                  ID
                </SortableHeader>
                <SortableHeader
                  sortKey="status"
                  currentSortKey={sortKey}
                  sortOrder={sortOrder}
                  handleSort={handleSort}
                >
                  상태
                </SortableHeader>
                <SortableHeader
                  sortKey="vehicleNumber"
                  currentSortKey={sortKey}
                  sortOrder={sortOrder}
                  handleSort={handleSort}
                  className="whitespace-nowrap"
                >
                  차량번호
                </SortableHeader>
                <SortableHeader
                  sortKey="phoneNumber"
                  currentSortKey={sortKey}
                  sortOrder={sortOrder}
                  handleSort={handleSort}
                  className="whitespace-nowrap"
                >
                  전화
                </SortableHeader>
                <TableHead className="text-center">QR</TableHead>
                <TableHead className="text-center">삭제</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.qrCodes.map((qr) => (
                <TableRow key={qr.id}>
                  <TableCell className="font-mono text-sm">{qr.shortId}</TableCell>
                  <TableCell>
                    <Badge
                      variant={qr.status === 'REGISTERED' ? 'default' : 'outline'}
                      className={
                        `${qr.status === 'REGISTERED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        } whitespace-nowrap`}
                    >
                      {qr.status === 'REGISTERED' ? '등록됨' : '미등록'}
                    </Badge>
                  </TableCell>
                  <TableCell>{qr.vehicleNumber || '-'}</TableCell>
                  <TableCell>{maskPhoneNumber(qr.phoneNumber)}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generateQrImage(qr.shortId)}
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                    {showQrId === qr.shortId && qrImages[qr.shortId] && (
                      <div className="absolute z-10 mt-2 p-2 bg-white border rounded-lg shadow-lg">
                        <img
                          src={qrImages[qr.shortId]}
                          alt={`QR ${qr.shortId}`}
                          className="w-32 h-32"
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(qr.id)}
                      disabled={deletingId === qr.id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === qr.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="grid gap-4 md:hidden">
          {data.qrCodes.map((qr) => (
            <Card key={qr.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="font-mono text-sm font-semibold">{qr.shortId}</div>
                  <div className="grid grid-cols-[auto_1fr] gap-x-2 text-sm">
                    <span className="text-gray-500">차량:</span>
                    <span className="font-medium">{qr.vehicleNumber || '-'}</span>
                    <span className="text-gray-500">전화:</span>
                    <span className="font-medium">{maskPhoneNumber(qr.phoneNumber)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={qr.status === 'REGISTERED' ? 'default' : 'outline'}
                    className={
                      `${qr.status === 'REGISTERED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                      } whitespace-nowrap flex-shrink-0`}
                  >
                    {qr.status === 'REGISTERED' ? '등록됨' : '미등록'}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generateQrImage(qr.shortId)}
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(qr.id)}
                      disabled={deletingId === qr.id}
                      className="text-red-500 hover:text-red-700"
                    >
                      {deletingId === qr.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              {showQrId === qr.shortId && qrImages[qr.shortId] && (
                <div className="mt-3 flex justify-center">
                  <img
                    src={qrImages[qr.shortId]}
                    alt={`QR ${qr.shortId}`}
                    className="w-32 h-32 border rounded"
                  />
                </div>
              )}
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              페이지 {data.page} / {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
