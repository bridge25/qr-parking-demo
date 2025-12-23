// Design-TAG-008: Vehicle Delete API
// Function-TAG-008: DELETE /api/qr/[shortId]/delete - Unregister vehicle

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

interface RouteContext {
  params: Promise<{ shortId: string }>;
}

export async function DELETE(request: NextRequest, context: RouteContext) {
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

    // Delete vehicle and reset QR code status
    await db.vehicle.delete({
      where: { qrCodeId: qrCode.id },
    });

    await db.qRCode.update({
      where: { id: qrCode.id },
      data: { status: 'UNREGISTERED' },
    });

    return NextResponse.json({
      success: true,
      message: '등록이 해제되었습니다',
    });
  } catch (error) {
    console.error('Vehicle delete API error:', error);
    return NextResponse.json(
      { error: '삭제 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
