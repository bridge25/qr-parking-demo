// Design-TAG-006: SafeNumberCard component
// Function-TAG-006: Display safe number with copy functionality

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SafeNumberCardProps {
  safeNumber: string;
}

const formatSafeNumber = (number: string): string => {
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.length >= 10) { // Handle 050 numbers etc.
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  return number;
};

export default function SafeNumberCard({
  safeNumber,
}: SafeNumberCardProps) {
  const formattedNumber = formatSafeNumber(safeNumber);

  return (
    <Card className={cn('w-full rounded-xl bg-white/20 border-white/20')}>
      <CardHeader className="text-center pb-2">
        <CardTitle className={cn('text-lg font-semibold text-white')}>
          안심번호
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="text-center text-3xl font-bold text-white whitespace-nowrap p-4"
          aria-label={`안심번호 ${formattedNumber}`}
        >
          {formattedNumber}
        </div>
      </CardContent>
    </Card>
  );
}
