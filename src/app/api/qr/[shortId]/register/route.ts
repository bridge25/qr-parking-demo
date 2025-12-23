// Design-TAG-004: Mobile QR Register API Route
// Function-TAG-004: POST /api/qr/[shortId]/register - Register vehicle for QR code
// Validates input and creates vehicle record with safe number

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateMockSafeNumber, formatPhoneNumber } from '@/lib/qr';
import bcrypt from 'bcryptjs';

interface RouteParams {
  params: Promise<{
    shortId: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { shortId } = await params;
    const body = await request.json();
    const { phoneNumber, vehicleNumber, password } = body;

    // Validate required fields
    if (!phoneNumber || !vehicleNumber || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: phoneNumber, vehicleNumber, password' },
        { status: 400 }
      );
    }

    // Find QR code
    const qrCode = await db.qRCode.findUnique({
      where: { shortId },
    });

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      );
    }

    // Check if already registered
    if (qrCode.status === 'REGISTERED') {
      return NextResponse.json(
        { error: 'QR code already registered' },
        { status: 400 }
      );
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Generate mock safe number (in production, call actual API)
    const safeNumber = generateMockSafeNumber();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create vehicle record
    const vehicle = await db.vehicle.create({
      data: {
        qrCodeId: qrCode.id,
        phoneNumber: formattedPhone,
        vehicleNumber: vehicleNumber.toUpperCase(),
        safeNumber,
        password: hashedPassword,
      },
    });

    // Update QR code status
    await db.qRCode.update({
      where: { id: qrCode.id },
      data: {
        status: 'REGISTERED',
      },
    });

    return NextResponse.json({
      success: true,
      message: '차량이 등록되었습니다',
      vehicle: {
        vehicleNumber: vehicle.vehicleNumber,
        safeNumber: vehicle.safeNumber,
        registeredAt: vehicle.registeredAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('QR Register API error:', error);
    return NextResponse.json(
      { error: 'Failed to register vehicle' },
      { status: 500 }
    );
  }
}
