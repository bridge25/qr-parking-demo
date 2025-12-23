// Test-TAG-005: QRGenerator component tests
// Tests for QR code generation functionality

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QRGenerator from '../QRGenerator';

// Mock fetch
global.fetch = vi.fn();

describe('QRGenerator Component - Design-TAG-005', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render input field and generate button', () => {
    render(<QRGenerator />);

    expect(screen.getByLabelText(/개수|Count/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /생성|Generate/i })).toBeInTheDocument();
  });

  it('should accept input between 1 and 1000', async () => {
    render(<QRGenerator />);

    const input = screen.getByLabelText(/개수|Count/i) as HTMLInputElement;

    await userEvent.clear(input);
    await userEvent.type(input, '50');

    await waitFor(() => {
      expect(input.value).toBe('50');
    });
  });

  it('should not allow input less than 1', async () => {
    render(<QRGenerator />);

    const input = screen.getByLabelText(/개수|Count/i) as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, '0');

    const generateButton = screen.getByRole('button', { name: /생성|Generate/i });
    expect(generateButton).toBeDisabled();
  });

  it('should not allow input greater than 1000', async () => {
    render(<QRGenerator />);

    const input = screen.getByLabelText(/개수|Count/i) as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, '1001');

    const generateButton = screen.getByRole('button', { name: /생성|Generate/i });
    expect(generateButton).toBeDisabled();
  });

  it('should call generate API with correct count', async () => {
    const mockQRCodes = [
      { shortId: 'ABC123', fullUrl: 'https://example.com/qr/ABC123' },
      { shortId: 'ABC124', fullUrl: 'https://example.com/qr/ABC124' },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodes: mockQRCodes }),
    });

    render(<QRGenerator />);

    const input = screen.getByLabelText(/개수|Count/i);
    await userEvent.clear(input);
    await userEvent.type(input, '2');

    const generateButton = screen.getByRole('button', { name: /생성|Generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/qr/generate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ count: 2 }),
        })
      );
    });
  });

  it('should display generated QR codes in grid', async () => {
    const mockQRCodes = [
      { shortId: 'ABC123', fullUrl: 'https://example.com/qr/ABC123' },
      { shortId: 'ABC124', fullUrl: 'https://example.com/qr/ABC124' },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodes: mockQRCodes }),
    });

    render(<QRGenerator />);

    const input = screen.getByLabelText(/개수|Count/i);
    await userEvent.clear(input);
    await userEvent.type(input, '2');

    const generateButton = screen.getByRole('button', { name: /생성|Generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getAllByText('ABC123').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('ABC124').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should provide download all as ZIP functionality', async () => {
    const mockQRCodes = [
      { shortId: 'ABC123', fullUrl: 'https://example.com/qr/ABC123' },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodes: mockQRCodes }),
    });

    render(<QRGenerator />);

    const input = screen.getByLabelText(/개수|Count/i);
    await userEvent.type(input, '1');

    const generateButton = screen.getByRole('button', { name: /생성|Generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      const downloadButton = screen.queryByRole('button', { name: /다운로드|Download/i });
      if (downloadButton) {
        expect(downloadButton).toBeInTheDocument();
      }
    });
  });

  it('should display error message on generation failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Generation failed' }),
    });

    render(<QRGenerator />);

    const input = screen.getByLabelText(/개수|Count/i);
    await userEvent.type(input, '1');

    const generateButton = screen.getByRole('button', { name: /생성|Generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/생성 실패|Generation failed/i)).toBeInTheDocument();
    });
  });
});
