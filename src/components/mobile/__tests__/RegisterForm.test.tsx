// Test-TAG-006: RegisterForm component tests
// Tests for vehicle registration form

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../RegisterForm';

// Mock fetch
global.fetch = vi.fn();

describe('RegisterForm Component - Design-TAG-006', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields', () => {
    render(<RegisterForm shortId="ABC123" />);

    expect(screen.getByLabelText(/전화번호|Phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/차량번호|Vehicle/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호|Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /등록|Register/i })).toBeInTheDocument();
  });

  it('should validate phone number format', async () => {
    render(<RegisterForm shortId="ABC123" />);

    const phoneInput = screen.getByLabelText(/전화번호|Phone/i);
    await userEvent.type(phoneInput, '123456789'); // Invalid format

    const submitButton = screen.getByRole('button', { name: /등록|Register/i });
    expect(submitButton).toBeDisabled();
  });

  it('should validate vehicle number format', async () => {
    render(<RegisterForm shortId="ABC123" />);

    const vehicleInput = screen.getByLabelText(/차량번호|Vehicle/i);
    await userEvent.type(vehicleInput, 'invalid'); // Invalid format

    const submitButton = screen.getByRole('button', { name: /등록|Register/i });
    expect(submitButton).toBeDisabled();
  });

  it('should validate 4-digit password', async () => {
    render(<RegisterForm shortId="ABC123" />);

    const phoneInput = screen.getByLabelText(/전화번호|Phone/i);
    const vehicleInput = screen.getByLabelText(/차량번호|Vehicle/i);
    const passwordInput = screen.getByLabelText(/비밀번호|Password/i) as HTMLInputElement;

    // First fill valid phone and vehicle
    await userEvent.type(phoneInput, '01012345678');
    await userEvent.type(vehicleInput, '12가1234');

    // Type 3 digits password
    await userEvent.type(passwordInput, '123');

    const submitButton = screen.getByRole('button', { name: /등록|Register/i });
    expect(submitButton).toBeDisabled();

    // Type 4 digits (total becomes '1234')
    await userEvent.type(passwordInput, '4');
    expect(submitButton).not.toBeDisabled();
  });

  it('should accept valid Korean phone format', async () => {
    render(<RegisterForm shortId="ABC123" />);

    const phoneInput = screen.getByLabelText(/전화번호|Phone/i);
    const vehicleInput = screen.getByLabelText(/차량번호|Vehicle/i);
    const passwordInput = screen.getByLabelText(/비밀번호|Password/i);

    await userEvent.type(phoneInput, '01012345678');
    await userEvent.type(vehicleInput, '12가1234');
    await userEvent.type(passwordInput, '1234');

    const submitButton = screen.getByRole('button', { name: /등록|Register/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('should accept valid vehicle number', async () => {
    render(<RegisterForm shortId="ABC123" />);

    const phoneInput = screen.getByLabelText(/전화번호|Phone/i);
    const vehicleInput = screen.getByLabelText(/차량번호|Vehicle/i);
    const passwordInput = screen.getByLabelText(/비밀번호|Password/i);

    await userEvent.type(phoneInput, '01012345678');
    await userEvent.type(vehicleInput, '12가1234');
    await userEvent.type(passwordInput, '1234');

    const submitButton = screen.getByRole('button', { name: /등록|Register/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('should submit form with valid data', async () => {
    const mockOnSuccess = vi.fn();

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<RegisterForm shortId="ABC123" onSuccess={mockOnSuccess} />);

    const phoneInput = screen.getByLabelText(/전화번호|Phone/i);
    const vehicleInput = screen.getByLabelText(/차량번호|Vehicle/i);
    const passwordInput = screen.getByLabelText(/비밀번호|Password/i);

    await userEvent.type(phoneInput, '01012345678');
    await userEvent.type(vehicleInput, '12가1234');
    await userEvent.type(passwordInput, '1234');

    const submitButton = screen.getByRole('button', { name: /등록|Register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('ABC123'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            phoneNumber: '01012345678',
            vehicleNumber: '12가1234',
            password: '1234',
          }),
        })
      );
    });
  });

  it('should display error message on submission failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Registration failed' }),
    });

    render(<RegisterForm shortId="ABC123" />);

    const phoneInput = screen.getByLabelText(/전화번호|Phone/i);
    const vehicleInput = screen.getByLabelText(/차량번호|Vehicle/i);
    const passwordInput = screen.getByLabelText(/비밀번호|Password/i);

    await userEvent.type(phoneInput, '01012345678');
    await userEvent.type(vehicleInput, '12가1234');
    await userEvent.type(passwordInput, '1234');

    const submitButton = screen.getByRole('button', { name: /등록|Register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/등록 실패|Registration failed/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    (global.fetch as any).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );

    render(<RegisterForm shortId="ABC123" />);

    const phoneInput = screen.getByLabelText(/전화번호|Phone/i);
    const vehicleInput = screen.getByLabelText(/차량번호|Vehicle/i);
    const passwordInput = screen.getByLabelText(/비밀번호|Password/i);

    await userEvent.type(phoneInput, '01012345678');
    await userEvent.type(vehicleInput, '12가1234');
    await userEvent.type(passwordInput, '1234');

    const submitButton = screen.getByRole('button', { name: /등록|Register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/등록 중|Submitting/i)).toBeInTheDocument();
    });
  });
});
