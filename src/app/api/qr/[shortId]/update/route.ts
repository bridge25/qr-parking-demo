// Design-TAG-008: Vehicle Info Update API
// Function-TAG-008: PUT /api/qr/[shortId]/update - Update vehicle info

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

interface RouteContext {
  params: Promise<{ shortId: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { shortId } = await context.params;
    const body = await request.json();
    const { password, phoneNumber, vehicleNumber, newPassword } = body;

    if (!password) {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요' },
        { status: 400 }
      );
    }

    // Find QR code with vehicle
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

    // Prepare update data
    const updateData: {
      phoneNumber?: string;
      vehicleNumber?: string;
      password?: string;
    } = {};

    if (phoneNumber && phoneNumber !== qrCode.vehicle.phoneNumber) {
      updateData.phoneNumber = phoneNumber;
    }

    if (vehicleNumber && vehicleNumber !== qrCode.vehicle.vehicleNumber) {
      updateData.vehicleNumber = vehicleNumber;
    }

    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update vehicle info
    if (Object.keys(updateData).length > 0) {
      await db.vehicle.update({
        where: { qrCodeId: qrCode.id },
        data: updateData,
      });
    }

    return NextResponse.json({
      success: true,
      message: '정보가 수정되었습니다',
    });
  } catch (error) {
    console.error('Vehicle update API error:', error);
    return NextResponse.json(
      { error: '수정 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
