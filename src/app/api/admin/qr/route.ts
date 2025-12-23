// Design-TAG-003: Admin QR List API Route
// Function-TAG-003: GET /api/admin/qr - Return list of all QR codes
// Supports pagination and filtering

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { maskPhoneNumber } from '@/lib/qr';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Get QR codes with optional vehicle info
    const qrCodes = await db.qRCode.findMany({
      include: {
        vehicle: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get total count
    const total = await db.qRCode.findMany({
      select: { id: true },
    });

    // Format response with masked phone numbers
    const formattedQRCodes = qrCodes.map((qr) => ({
      id: qr.id,
      shortId: qr.shortId,
      status: qr.status,
      createdAt: qr.createdAt.toISOString(),
      phoneNumber: qr.vehicle ? maskPhoneNumber(qr.vehicle.phoneNumber) : null,
      vehicleNumber: qr.vehicle?.vehicleNumber || null,
    }));

    return NextResponse.json({
      qrCodes: formattedQRCodes,
      total: total.length,
      page,
      limit,
    });
  } catch (error) {
    console.error('QR List API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QR codes' },
      { status: 500 }
    );
  }
}
