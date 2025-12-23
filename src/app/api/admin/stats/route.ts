// Design-TAG-003: Admin Stats API Route
// Function-TAG-003: GET /api/admin/stats - Return dashboard statistics
// Returns total QR count, registered, and unregistered counts

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get total QR codes count
    const totalQRCodes = await db.qRCode.findMany({
      select: { id: true },
    });

    // Count registered (has vehicle) and unregistered
    const registeredQRCodes = await db.qRCode.findMany({
      where: {
        status: 'REGISTERED',
      },
      select: { id: true },
    });

    const stats = {
      totalQRCodes: totalQRCodes.length,
      registeredCount: registeredQRCodes.length,
      unregisteredCount: totalQRCodes.length - registeredQRCodes.length,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
