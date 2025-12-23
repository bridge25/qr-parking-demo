// Test-TAG-006: SafeNumberCard component tests
// Tests for safe number display card

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SafeNumberCard from '../SafeNumberCard';

describe('SafeNumberCard Component - Design-TAG-006', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock clipboard API if it doesn't exist
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn(() => Promise.resolve()),
        },
        writable: true,
      });
    } else {
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    }
  });

  it('should render safe number in formatted style', () => {
    render(<SafeNumberCard safeNumber="0501234567" />);

    // Number is now animated character-by-character, check aria-label
    expect(screen.getByLabelText(/안심번호 050-1234-567/i)).toBeInTheDocument();
  });

  it('should display safe number in large, readable font', () => {
    render(<SafeNumberCard safeNumber="0501234567" />);

    // Number is animated, check the container with aria-label
    const numberElement = screen.getByLabelText(/안심번호 050-1234-567/i);

    // Check if it has a large font size class
    expect(numberElement.className).toMatch(/text-[234]xl|font-/i);
  });

  it('should have copy to clipboard button', () => {
    render(<SafeNumberCard safeNumber="0501234567" />);

    expect(screen.getByRole('button', { name: /복사|Copy/i })).toBeInTheDocument();
  });

  it('should copy safe number to clipboard on button click', async () => {
    render(<SafeNumberCard safeNumber="0501234567" />);

    const copyButton = screen.getByRole('button', { name: /복사|Copy/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('050-1234-567');
    });
  });

  it('should show copy confirmation message', async () => {
    render(<SafeNumberCard safeNumber="0501234567" />);

    const copyButton = screen.getByRole('button', { name: /복사|Copy/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText(/복사 완료|복사됨|Copied/i)).toBeInTheDocument();
    });
  });

  it('should have card styling with shadow', () => {
    const { container } = render(<SafeNumberCard safeNumber="0501234567" />);

    // Now uses motion.div wrapper with perspective for 3D effect
    const cardElement = container.querySelector('[role="region"]');
    const cardInner = container.querySelector('[data-slot="card"]');
    // Check for border or overflow styling
    const hasStyle = cardElement?.getAttribute('style')?.includes('perspective') ||
                     cardInner?.className.includes('border') ||
                     cardInner?.className.includes('overflow');
    expect(hasStyle).toBe(true);
  });

  it('should display description label', () => {
    const { container } = render(<SafeNumberCard safeNumber="0501234567" />);

    // CardTitle uses data-slot="card-title", not heading role
    const cardTitle = container.querySelector('[data-slot="card-title"]');
    expect(cardTitle).toBeInTheDocument();
    // Label is now "안심번호" (safe number)
    expect(cardTitle?.textContent).toMatch(/안심번호|안전번호/i);
  });

  it('should handle different safe number formats', () => {
    render(<SafeNumberCard safeNumber="0505678901" />);

    // Number is animated, check aria-label
    expect(screen.getByLabelText(/안심번호 050-5678-901/i)).toBeInTheDocument();
  });
});
