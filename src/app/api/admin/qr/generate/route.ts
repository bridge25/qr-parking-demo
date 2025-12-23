// Design-TAG-003: Admin QR Generate API Route
// Function-TAG-003: POST /api/admin/qr/generate - Generate new QR codes
// Creates specified number of QR codes and returns them

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateShortId, generateQRCodeDataURL } from '@/lib/qr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { count } = body;

    // Validate input
    if (!count || typeof count !== 'number' || count < 1 || count > 1000) {
      return NextResponse.json(
        { error: 'Invalid count. Must be between 1 and 1000.' },
        { status: 400 }
      );
    }

    const createdQRCodes = [];

    // Generate QR codes
    for (let i = 0; i < count; i++) {
      const shortId = generateShortId();

      // Ensure unique shortId
      let existingQR = await db.qRCode.findUnique({
        where: { shortId },
      });

      while (existingQR) {
        const newShortId = generateShortId();
        existingQR = await db.qRCode.findUnique({
          where: { shortId: newShortId },
        });
        if (!existingQR) {
          shortId;
        }
      }

      const qrCode = await db.qRCode.create({
        data: {
          shortId,
          status: 'UNREGISTERED',
        },
      });

      // Generate QR code image URL
      const qrURL = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/qr/${shortId}`;
      const dataUrl = await generateQRCodeDataURL(qrURL);

      createdQRCodes.push({
        id: qrCode.id,
        shortId: qrCode.shortId,
        dataUrl,
        qrURL,
      });
    }

    return NextResponse.json({
      success: true,
      count: createdQRCodes.length,
      qrCodes: createdQRCodes,
    });
  } catch (error) {
    console.error('QR Generate API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR codes' },
      { status: 500 }
    );
  }
}
