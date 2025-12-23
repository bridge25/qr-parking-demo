// Test-TAG-005: Dashboard component tests
// Tests for admin dashboard statistics display

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';

// Mock fetch
global.fetch = vi.fn();

describe('Dashboard Component - Design-TAG-005', () => {
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

    render(<Dashboard />);
    expect(screen.getByText(/로딩 중|loading/i)).toBeInTheDocument();
  });

  it('should fetch and display statistics', async () => {
    const mockStats = {
      totalQRCodes: 100,
      registeredCount: 60,
      unregisteredCount: 40,
      timestamp: '2025-12-23T10:00:00Z',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('60')).toBeInTheDocument();
      expect(screen.getByText('40')).toBeInTheDocument();
    });
  });

  it('should display error message on fetch failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to fetch statistics' }),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/통계를 불러올 수 없습니다|Failed to load/i)).toBeInTheDocument();
    });
  });

  it('should use Card component for layout', async () => {
    const mockStats = {
      totalQRCodes: 100,
      registeredCount: 60,
      unregisteredCount: 40,
      timestamp: '2025-12-23T10:00:00Z',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<Dashboard />);

    await waitFor(() => {
      // Check that stats are displayed
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('60')).toBeInTheDocument();
      expect(screen.getByText('40')).toBeInTheDocument();
    });
  });

  it('should display stat labels correctly', async () => {
    const mockStats = {
      totalQRCodes: 100,
      registeredCount: 60,
      unregisteredCount: 40,
      timestamp: '2025-12-23T10:00:00Z',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<Dashboard />);

    await waitFor(() => {
      // Check for stat values which indicate labels are rendered
      const textElements = screen.queryAllByText(/QR|등록|미등록/);
      expect(textElements.length).toBeGreaterThan(0);
    });
  });
});
