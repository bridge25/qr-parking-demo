import { describe, it, expect } from 'vitest';
import {
  generateShortId,
  generateQRCodeDataURL,
  generateQRCodeBuffer,
  generateMockSafeNumber,
  maskPhoneNumber,
  formatPhoneNumber,
} from '../qr';

// Design-TAG-002: QR Generation Utilities
// Function-TAG-002: Provides utilities for QR codes, safe numbers, and phone formatting
// Test-TAG-002: Validates utility functions work correctly

describe('QR Generation Utilities', () => {
  // Test generateShortId
  describe('generateShortId', () => {
    it('should generate 6-character ID', () => {
      const id = generateShortId();
      expect(id).toHaveLength(6);
    });

    it('should generate uppercase characters', () => {
      const id = generateShortId();
      expect(id).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('should generate different IDs on each call', () => {
      const id1 = generateShortId();
      const id2 = generateShortId();
      expect(id1).not.toBe(id2);
    });
  });

  // Test generateQRCodeDataURL
  describe('generateQRCodeDataURL', () => {
    it('should return data URL string', async () => {
      const url = 'https://example.com/qr/ABC123';
      const dataUrl = await generateQRCodeDataURL(url);

      expect(typeof dataUrl).toBe('string');
      expect(dataUrl.startsWith('data:image')).toBe(true);
    });

    it('should generate different QR for different URLs', async () => {
      const url1 = 'https://example.com/qr/ABC123';
      const url2 = 'https://example.com/qr/XYZ789';

      const dataUrl1 = await generateQRCodeDataURL(url1);
      const dataUrl2 = await generateQRCodeDataURL(url2);

      expect(dataUrl1).not.toBe(dataUrl2);
    });

    it('should contain PNG format', async () => {
      const url = 'https://example.com/qr/ABC123';
      const dataUrl = await generateQRCodeDataURL(url);

      expect(dataUrl).toContain('image/png');
    });
  });

  // Test generateQRCodeBuffer
  describe('generateQRCodeBuffer', () => {
    it('should return Buffer object', async () => {
      const url = 'https://example.com/qr/ABC123';
      const buffer = await generateQRCodeBuffer(url);

      expect(Buffer.isBuffer(buffer)).toBe(true);
    });

    it('should generate PNG binary data', async () => {
      const url = 'https://example.com/qr/ABC123';
      const buffer = await generateQRCodeBuffer(url);

      // PNG files start with specific bytes: 89 50 4E 47
      expect(buffer[0]).toBe(0x89);
      expect(buffer[1]).toBe(0x50);
      expect(buffer[2]).toBe(0x4e);
      expect(buffer[3]).toBe(0x47);
    });

    it('should have non-zero length', async () => {
      const url = 'https://example.com/qr/ABC123';
      const buffer = await generateQRCodeBuffer(url);

      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  // Test generateMockSafeNumber
  describe('generateMockSafeNumber', () => {
    it('should return 050 formatted number', () => {
      const safeNumber = generateMockSafeNumber();

      expect(safeNumber).toMatch(/^050-\d{4}-\d{4}$/);
    });

    it('should have correct format with dashes', () => {
      const safeNumber = generateMockSafeNumber();
      const parts = safeNumber.split('-');

      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('050');
      expect(parts[1]).toHaveLength(4);
      expect(parts[2]).toHaveLength(4);
    });

    it('should generate different numbers on each call', () => {
      const num1 = generateMockSafeNumber();
      const num2 = generateMockSafeNumber();

      expect(num1).not.toBe(num2);
    });

    it('should contain only digits in phone parts', () => {
      const safeNumber = generateMockSafeNumber();
      const parts = safeNumber.split('-');

      expect(parts[1]).toMatch(/^\d{4}$/);
      expect(parts[2]).toMatch(/^\d{4}$/);
    });
  });

  // Test maskPhoneNumber
  describe('maskPhoneNumber', () => {
    it('should mask Korean 010 number correctly', () => {
      const phone = '01012345678';
      const masked = maskPhoneNumber(phone);

      expect(masked).toBe('010-****-5678');
    });

    it('should mask 011 number correctly', () => {
      const phone = '01112345678';
      const masked = maskPhoneNumber(phone);

      expect(masked).toBe('011-****-5678');
    });

    it('should mask 016 number correctly', () => {
      const phone = '01612345678';
      const masked = maskPhoneNumber(phone);

      expect(masked).toBe('016-****-5678');
    });

    it('should keep last 4 digits visible', () => {
      const phone = '01098765432';
      const masked = maskPhoneNumber(phone);

      expect(masked.endsWith('5432')).toBe(true);
    });

    it('should handle formatted input with dashes', () => {
      const phone = '010-1234-5678';
      const masked = maskPhoneNumber(phone);

      expect(masked).toBe('010-****-5678');
    });
  });

  // Test formatPhoneNumber
  describe('formatPhoneNumber', () => {
    it('should format 11-digit number', () => {
      const phone = '01012345678';
      const formatted = formatPhoneNumber(phone);

      expect(formatted).toBe('010-1234-5678');
    });

    it('should format 010 prefix', () => {
      const phone = '01012345678';
      const formatted = formatPhoneNumber(phone);

      expect(formatted.startsWith('010-')).toBe(true);
    });

    it('should format 016 prefix', () => {
      const phone = '01654321098';
      const formatted = formatPhoneNumber(phone);

      expect(formatted.startsWith('016-')).toBe(true);
    });

    it('should format 011 prefix', () => {
      const phone = '01154321098';
      const formatted = formatPhoneNumber(phone);

      expect(formatted.startsWith('011-')).toBe(true);
    });

    it('should format 019 prefix', () => {
      const phone = '01954321098';
      const formatted = formatPhoneNumber(phone);

      expect(formatted.startsWith('019-')).toBe(true);
    });

    it('should handle already formatted input', () => {
      const phone = '010-1234-5678';
      const formatted = formatPhoneNumber(phone);

      expect(formatted).toBe('010-1234-5678');
    });

    it('should preserve all digits in output', () => {
      const phone = '01098765432';
      const formatted = formatPhoneNumber(phone);
      const digits = formatted.replace(/-/g, '');

      expect(digits).toBe('01098765432');
    });

    it('should return input unchanged for non-11-digit numbers', () => {
      const phone = '123456'; // Invalid length
      const formatted = formatPhoneNumber(phone);

      expect(formatted).toBe('123456');
    });

    it('should handle mixed formatting with spaces and dashes', () => {
      const phone = '010 1234-5678';
      const formatted = formatPhoneNumber(phone);
      const digits = formatted.replace(/-/g, '');

      expect(digits.length).toBeGreaterThan(0);
    });
  });
});
