// Design-TAG-004: Mobile QR Info API Route
// Function-TAG-004: GET /api/qr/[shortId] - Get QR code and vehicle info
// Returns registration status and vehicle details if registered

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { maskPhoneNumber } from '@/lib/qr';

interface RouteParams {
  params: Promise<{
    shortId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { shortId } = await params;

    // Find QR code by shortId
    const qrCode = await db.qRCode.findUnique({
      where: { shortId },
      include: {
        vehicle: true,
      },
    });

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      );
    }

    // If unregistered, return minimal info
    if (qrCode.status === 'UNREGISTERED' || !qrCode.vehicle) {
      return NextResponse.json({
        id: qrCode.id,
        shortId: qrCode.shortId,
        status: 'UNREGISTERED',
        message: '차량 등록이 필요합니다',
      });
    }

    // If registered, return vehicle info (with masked phone)
    return NextResponse.json({
      id: qrCode.id,
      shortId: qrCode.shortId,
      status: 'REGISTERED',
      vehicle: {
        vehicleNumber: qrCode.vehicle.vehicleNumber,
        safeNumber: qrCode.vehicle.safeNumber,
        maskedPhoneNumber: maskPhoneNumber(qrCode.vehicle.phoneNumber),
        registeredAt: qrCode.vehicle.registeredAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('QR Info API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QR information' },
      { status: 500 }
    );
  }
}
