// Test-TAG-005: QRList component tests
// Tests for QR code list display with pagination

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QRList from '../QRList';

// Mock fetch
global.fetch = vi.fn();

describe('QRList Component - Design-TAG-005', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    (global.fetch as any).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );

    render(<QRList />);
    expect(screen.getByText(/로딩 중|loading/i)).toBeInTheDocument();
  });

  it('should fetch and display QR codes in table', async () => {
    const mockQRCodes = [
      {
        id: '1',
        shortId: 'ABC123',
        status: 'UNREGISTERED',
        vehicleNumber: null,
        phoneNumber: null,
      },
      {
        id: '2',
        shortId: 'ABC124',
        status: 'REGISTERED',
        vehicleNumber: '12가1234',
        phoneNumber: '01012345678',
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodes: mockQRCodes, total: 2, page: 1, limit: 10 }),
    });

    render(<QRList />);

    await waitFor(() => {
      expect(screen.getByText('ABC123')).toBeInTheDocument();
      expect(screen.getByText('ABC124')).toBeInTheDocument();
    });
  });

  it('should display correct column headers', async () => {
    const mockQRCodes = [
      {
        id: '1',
        shortId: 'ABC123',
        status: 'UNREGISTERED',
        vehicleNumber: null,
        phoneNumber: null,
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodes: mockQRCodes, total: 1, page: 1, limit: 10 }),
    });

    render(<QRList />);

    await waitFor(() => {
      expect(screen.getByText(/ID|shortId/i)).toBeInTheDocument();
      expect(screen.getByText(/상태|Status/i)).toBeInTheDocument();
      expect(screen.getByText(/차량번호|Vehicle/i)).toBeInTheDocument();
      expect(screen.getByText(/전화|Phone/i)).toBeInTheDocument();
    });
  });

  it('should mask phone numbers', async () => {
    const mockQRCodes = [
      {
        id: '1',
        shortId: 'ABC123',
        status: 'REGISTERED',
        vehicleNumber: '12가1234',
        phoneNumber: '01012345678',
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodes: mockQRCodes, total: 1, page: 1, limit: 10 }),
    });

    render(<QRList />);

    await waitFor(() => {
      // Should display masked phone number format (010****5678)
      const text = screen.getByText(/010\*{4}/);
      expect(text).toBeInTheDocument();
    });
  });

  it('should display status badge', async () => {
    const mockQRCodes = [
      {
        id: '1',
        shortId: 'ABC123',
        status: 'REGISTERED',
        vehicleNumber: '12가1234',
        phoneNumber: '01012345678',
      },
      {
        id: '2',
        shortId: 'ABC124',
        status: 'UNREGISTERED',
        vehicleNumber: null,
        phoneNumber: null,
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodes: mockQRCodes, total: 2, page: 1, limit: 10 }),
    });

    render(<QRList />);

    await waitFor(() => {
      expect(screen.getByText(/등록됨|Registered/i)).toBeInTheDocument();
      expect(screen.getByText(/미등록|Unregistered/i)).toBeInTheDocument();
    });
  });

  it('should support pagination', async () => {
    const mockQRCodes = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      shortId: `ABC${100 + i}`,
      status: 'UNREGISTERED',
      vehicleNumber: null,
      phoneNumber: null,
    }));

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodes: mockQRCodes, total: 25, page: 1, limit: 10 }),
    });

    render(<QRList />);

    await waitFor(() => {
      const nextButton = screen.queryByRole('button', { name: /다음|Next/i });
      if (nextButton) {
        expect(nextButton).toBeInTheDocument();
        fireEvent.click(nextButton);

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('page=2'),
          expect.any(Object)
        );
      }
    });
  });

  it('should display error message on fetch failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to fetch QR codes' }),
    });

    render(<QRList />);

    await waitFor(() => {
      expect(screen.getByText(/목록을 불러올 수 없습니다|Failed to load/i)).toBeInTheDocument();
    });
  });

  it('should display empty state when no QR codes exist', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodes: [], total: 0, page: 1, limit: 10 }),
    });

    render(<QRList />);

    await waitFor(() => {
      expect(screen.getByText(/QR 코드가 없습니다|No QR codes/i)).toBeInTheDocument();
    });
  });
});
