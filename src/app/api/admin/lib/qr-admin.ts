// Design-TAG-003: Admin QR Business Logic
// Function-TAG-003: Extracted business logic for testing
// Separates logic from Next.js API routes for better testability

import db from '@/lib/db';
import { generateShortId, generateQRCodeDataURL, maskPhoneNumber } from '@/lib/qr';

/**
 * Function-TAG-003: Get dashboard statistics
 */
export async function getAdminStats() {
  try {
    const totalQRCodes = await db.qRCode.findMany({
      select: { id: true },
    });

    const registeredQRCodes = await db.qRCode.findMany({
      where: {
        status: 'REGISTERED',
      },
      select: { id: true },
    });

    return {
      totalQRCodes: totalQRCodes.length,
      registeredCount: registeredQRCodes.length,
      unregisteredCount: totalQRCodes.length - registeredQRCodes.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error('Failed to fetch statistics');
  }
}

/**
 * Function-TAG-003: Get paginated QR codes list
 */
export async function getAdminQRList(page: number = 1, limit: number = 20) {
  try {
    const skip = (page - 1) * limit;

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

    const total = await db.qRCode.findMany({
      select: { id: true },
    });

    const formattedQRCodes = qrCodes.map((qr) => ({
      id: qr.id,
      shortId: qr.shortId,
      status: qr.status,
      createdAt: qr.createdAt.toISOString(),
      phoneNumber: qr.vehicle ? maskPhoneNumber(qr.vehicle.phoneNumber) : null,
      vehicleNumber: qr.vehicle?.vehicleNumber || null,
    }));

    return {
      data: formattedQRCodes,
      pagination: {
        page,
        limit,
        total: total.length,
        pages: Math.ceil(total.length / limit),
      },
    };
  } catch (error) {
    throw new Error('Failed to fetch QR codes');
  }
}

/**
 * Function-TAG-003: Generate new QR codes
 */
export async function generateAdminQRCodes(count: number, baseUrl: string) {
  if (!count || typeof count !== 'number' || count < 1 || count > 1000) {
    throw new Error('Invalid count. Must be between 1 and 1000.');
  }

  try {
    const createdQRCodes = [];

    for (let i = 0; i < count; i++) {
      let shortId = generateShortId();

      // Ensure unique shortId
      let existingQR = await db.qRCode.findUnique({
        where: { shortId },
      });

      while (existingQR) {
        shortId = generateShortId();
        existingQR = await db.qRCode.findUnique({
          where: { shortId },
        });
      }

      const qrCode = await db.qRCode.create({
        data: {
          shortId,
          status: 'UNREGISTERED',
        },
      });

      const qrURL = `${baseUrl}/qr/${shortId}`;
      const dataUrl = await generateQRCodeDataURL(qrURL);

      createdQRCodes.push({
        id: qrCode.id,
        shortId: qrCode.shortId,
        dataUrl,
        qrURL,
      });
    }

    return {
      success: true,
      count: createdQRCodes.length,
      qrCodes: createdQRCodes,
    };
  } catch (error) {
    throw new Error('Failed to generate QR codes');
  }
}
