// Design-TAG-003: Admin QR List API Route
// Function-TAG-003: GET /api/admin/qr - Return list of all QR codes
// Function-TAG-003: DELETE /api/admin/qr - Delete QR code by ID
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

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'QR code ID is required' },
        { status: 400 }
      );
    }

    // First delete related vehicle if exists
    await db.vehicle.deleteMany({
      where: { qrCodeId: id },
    });

    // Then delete the QR code
    await db.qRCode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('QR Delete API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete QR code' },
      { status: 500 }
    );
  }
}
