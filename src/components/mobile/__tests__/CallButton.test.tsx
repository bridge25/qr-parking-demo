// Test-TAG-006: CallButton component tests
// Tests for direct calling button

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CallButton from '../CallButton';

describe('CallButton Component - Design-TAG-006', () => {
  it('should render call button with proper text', () => {
    render(<CallButton phoneNumber="050123456" />);

    // Now uses motion.a as the main element, text changed to "전화하기"
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('전화하기');

    // Check for large size classes
    const hasLargeClass = link.className.includes('py-4') || link.className.includes('text-xl');
    expect(hasLargeClass).toBe(true);
  });

  it('should have tel: link for direct dialing', () => {
    render(<CallButton phoneNumber="050123456" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'tel:050123456');
  });

  it('should display call text in button', () => {
    render(<CallButton phoneNumber="050123456" />);

    // Text is now "전화하기" instead of phone number
    expect(screen.getByText('전화하기')).toBeInTheDocument();
  });

  it('should have animation styling', () => {
    const { container } = render(<CallButton phoneNumber="050123456" />);

    // Framer Motion adds style attributes for animation
    const link = screen.getByRole('link');
    // Check for gradient background or animation-related styling
    const hasAnimation = link.className.includes('rounded-full') ||
                        container.querySelector('[class*="gradient"]') !== null ||
                        link.getAttribute('style')?.includes('transform');
    expect(hasAnimation).toBe(true);
  });

  it('should be accessible with aria labels', () => {
    render(<CallButton phoneNumber="050123456" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label');
  });

  it('should handle different phone numbers in href', () => {
    render(<CallButton phoneNumber="01012345678" />);

    // Text remains "전화하기", phone number is in href
    expect(screen.getByText('전화하기')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', 'tel:01012345678');
  });

  it('should have gradient background styling', () => {
    const { container } = render(<CallButton phoneNumber="050123456" />);

    // Check for gradient background div
    const gradientElement = container.querySelector('[class*="gradient"]');
    expect(gradientElement).toBeInTheDocument();
  });
});
