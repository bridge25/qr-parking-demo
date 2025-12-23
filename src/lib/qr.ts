// Design-TAG-002: QR Code and Phone Number Utilities
// Function-TAG-002: Provides QR generation, safe number generation, and phone formatting
// Supports both data URL and buffer outputs for flexible QR code handling

import QRCode from 'qrcode';
import { customAlphabet } from 'nanoid';

// Initialize nanoid with uppercase alphanumeric characters for short IDs
const nanoIdUpperAlpha = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

/**
 * Function-TAG-002: Generate 6-character uppercase short ID
 * Used for readable QR code URLs like /qr/ABC123
 * @returns 6-character uppercase alphanumeric string
 */
export function generateShortId(): string {
  return nanoIdUpperAlpha();
}

/**
 * Function-TAG-002: Generate QR code as data URL (base64 PNG image)
 * @param url - URL to encode in QR code
 * @returns Promise<string> - Data URL of PNG image
 */
export async function generateQRCodeDataURL(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 300,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
}

/**
 * Function-TAG-002: Generate QR code as PNG buffer
 * @param url - URL to encode in QR code
 * @returns Promise<Buffer> - Binary PNG image buffer
 */
export async function generateQRCodeBuffer(url: string): Promise<Buffer> {
  const buffer = await QRCode.toBuffer(url, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 300,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
  return buffer;
}

/**
 * Function-TAG-002: Generate mock safe number in format 050-XXXX-XXXX
 * In production, this would be replaced with actual safe number API
 * @returns string - Mock safe number like "050-1234-5678"
 */
export function generateMockSafeNumber(): string {
  const part1 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const part2 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `050-${part1}-${part2}`;
}

/**
 * Function-TAG-002: Mask phone number to protect privacy
 * Shows format "010-****-5678" (first part and last 4 digits)
 * @param phone - Phone number in any format (01012345678 or 010-1234-5678)
 * @returns string - Masked phone number
 */
export function maskPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Extract prefix and last 4 digits
  const prefix = digits.substring(0, 3); // 010, 011, 016, etc.
  const lastFour = digits.substring(digits.length - 4);

  return `${prefix}-****-${lastFour}`;
}

/**
 * Function-TAG-002: Format phone number to standard Korean format
 * Converts to format like "010-1234-5678"
 * @param phone - Phone number in any format (01012345678 or 010-1234-5678)
 * @returns string - Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Handle 11-digit Korean phone numbers
  if (digits.length === 11) {
    const prefix = digits.substring(0, 3); // 010, 011, 016, etc.
    const middle = digits.substring(3, 7);
    const last = digits.substring(7);
    return `${prefix}-${middle}-${last}`;
  }

  // Return as-is if can't parse
  return phone;
}
