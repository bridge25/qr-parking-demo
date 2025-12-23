// Design-TAG-006: CallButton component
// Function-TAG-006: Large call button with pulse animation

'use client';

import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface CallButtonProps {
  phoneNumber: string;
  className?: string;
}

export default function CallButton({ phoneNumber, className }: CallButtonProps) {
  return (
    <motion.a
      href={`tel:${phoneNumber}`}
      aria-label={`Call ${phoneNumber}`}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'flex items-center justify-center gap-3 w-full py-4 px-6 bg-white text-blue-600 text-xl font-bold rounded-xl shadow-lg hover:bg-gray-100 transition-colors',
        className
      )}
    >
      <Phone className="w-6 h-6" />
      전화하기
    </motion.a>
  );
}