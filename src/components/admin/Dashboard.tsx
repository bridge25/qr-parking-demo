// Design-TAG-005: Dashboard component
// Function-TAG-005: Display admin dashboard with statistics

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardStats {
  totalQRCodes: number;
  registeredCount: number;
  unregisteredCount: number;
  timestamp: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/stats');

        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError('통계를 불러올 수 없습니다');
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="text-center text-gray-500">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!stats) {
    return <div className="text-center text-gray-500">데이터를 불러올 수 없습니다</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card role="region" aria-label="Total QR Codes">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 whitespace-nowrap">전체 QR 코드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalQRCodes}</div>
          <p className="text-xs text-gray-500 mt-1">개 생성됨</p>
        </CardContent>
      </Card>

      <Card role="region" aria-label="Registered QR Codes">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-600 whitespace-nowrap">등록됨</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.registeredCount}</div>
          <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">
            {stats.totalQRCodes > 0 ? Math.round((stats.registeredCount / stats.totalQRCodes) * 100) : 0}% 등록률
          </p>
        </CardContent>
      </Card>

      <Card role="region" aria-label="Unregistered QR Codes">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-600 whitespace-nowrap">미등록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.unregisteredCount}</div>
          <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">
            {stats.totalQRCodes > 0 ? Math.round((stats.unregisteredCount / stats.totalQRCodes) * 100) : 0}% 미등록
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
