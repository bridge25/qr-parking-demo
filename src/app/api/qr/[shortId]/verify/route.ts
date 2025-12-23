// Design-TAG-008: Password Verification API
// Function-TAG-008: POST /api/qr/[shortId]/verify - Verify owner password

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

interface RouteContext {
  params: Promise<{ shortId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { shortId } = await context.params;
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요' },
        { status: 400 }
      );
    }

    // Find QR code
    const qrCode = await db.qRCode.findUnique({
      where: { shortId },
      include: { vehicle: true },
    });

    if (!qrCode) {
      return NextResponse.json(
        { error: '유효하지 않은 QR 코드입니다' },
        { status: 404 }
      );
    }

    if (!qrCode.vehicle) {
      return NextResponse.json(
        { error: '등록되지 않은 QR 코드입니다' },
        { status: 400 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, qrCode.vehicle.password);

    if (!isValid) {
      return NextResponse.json(
        { error: '비밀번호가 일치하지 않습니다' },
        { status: 401 }
      );
    }

    // Return vehicle info for editing (without sensitive data)
    return NextResponse.json({
      success: true,
      vehicle: {
        vehicleNumber: qrCode.vehicle.vehicleNumber,
        phoneNumber: qrCode.vehicle.phoneNumber,
        safeNumber: qrCode.vehicle.safeNumber,
      },
    });
  } catch (error) {
    console.error('Password verify API error:', error);
    return NextResponse.json(
      { error: '확인 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
