import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { AuthModal } from '../components/AuthModal';
import { WatchProvider, useWatch } from '../context/WatchContext';
import { apiService } from '../services/api';

describe('ResetPasswordPage & AuthModal Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('ResetPasswordPage Standalone Route', () => {
    it('renders in forgot-password mode by default when no token query parameter is present', () => {
      render(
        <MemoryRouter initialEntries={['/reset-password']}>
          <WatchProvider>
            <ResetPasswordPage />
          </WatchProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('Lupa Kata Sandi?')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('nama@email.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /kirim tautan pemulihan/i })).toBeInTheDocument();
    });

    it('automatically switches to reset-password mode and fills token if token query param is provided', () => {
      render(
        <MemoryRouter initialEntries={['/reset-password?token=my-secret-token-777']}>
          <WatchProvider>
            <ResetPasswordPage />
          </WatchProvider>
        </MemoryRouter>
      );

      const tokenInput = screen.getByPlaceholderText('Tempel token verifikasi dari email') as HTMLInputElement;
      expect(tokenInput).toBeInTheDocument();
      expect(tokenInput.value).toBe('my-secret-token-777');
      expect(screen.getByPlaceholderText('Minimal 6 karakter')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /simpan kata sandi baru/i })).toBeInTheDocument();
    });

    it('submits forgot password request and displays success message', async () => {
      const forgotSpy = vi.spyOn(apiService, 'forgotPassword').mockResolvedValue({
        success: true,
        message: 'Jika email terdaftar, tautan pengaturan ulang kata sandi telah dikirimkan ke kotak masuk Anda.'
      });

      render(
        <MemoryRouter initialEntries={['/reset-password']}>
          <WatchProvider>
            <ResetPasswordPage />
          </WatchProvider>
        </MemoryRouter>
      );

      const emailInput = screen.getByPlaceholderText('nama@email.com');
      fireEvent.change(emailInput, { target: { value: 'member@liveeuy.id' } });

      const submitButton = screen.getByRole('button', { name: /kirim tautan pemulihan/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(forgotSpy).toHaveBeenCalledWith('member@liveeuy.id');
        expect(screen.getByText('Tautan Pemulihan Dikirim!')).toBeInTheDocument();
      });
    });

    it('submits reset password with new password and navigates or shows success', async () => {
      const resetSpy = vi.spyOn(apiService, 'resetPassword').mockResolvedValue({
        success: true,
        message: 'Kata sandi Anda telah berhasil direset. Silakan login kembali.'
      });

      render(
        <MemoryRouter initialEntries={['/reset-password?token=valid-token-123']}>
          <WatchProvider>
            <ResetPasswordPage />
          </WatchProvider>
        </MemoryRouter>
      );

      const passInput = screen.getByPlaceholderText('Minimal 6 karakter');
      const confirmInput = screen.getByPlaceholderText('Ulangi kata sandi baru');

      fireEvent.change(passInput, { target: { value: 'SecretPassword99!' } });
      fireEvent.change(confirmInput, { target: { value: 'SecretPassword99!' } });

      const submitBtn = screen.getByRole('button', { name: /simpan kata sandi baru/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(resetSpy).toHaveBeenCalledWith('valid-token-123', 'SecretPassword99!');
        expect(screen.getByText('Kata Sandi Berhasil Diperbarui!')).toBeInTheDocument();
      });
    });
  });

  describe('AuthModal View Switching', () => {
    const ModalTestOpener: React.FC<{ initialMode?: 'login' | 'register' | 'forgot-password' | 'reset-password' }> = ({ initialMode }) => {
      const { openAuthModal } = useWatch();
      return (
        <div>
          <button onClick={() => openAuthModal(initialMode || 'login')}>Buka Modal</button>
          <AuthModal />
        </div>
      );
    };

    it('allows navigating from Login view to Forgot Password view via "Lupa sandi?" button', () => {
      render(
        <MemoryRouter>
          <WatchProvider>
            <ModalTestOpener initialMode="login" />
          </WatchProvider>
        </MemoryRouter>
      );

      // Open modal
      fireEvent.click(screen.getByText('Buka Modal'));

      // Check login form is rendered
      expect(screen.getByText('Selamat Datang Kembali')).toBeInTheDocument();

      // Click "Lupa sandi?"
      const forgotLink = screen.getByText('Lupa sandi?');
      fireEvent.click(forgotLink);

      // Should now show Forgot Password view
      expect(screen.getByText('Lupa Kata Sandi?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /kirim tautan pemulihan/i })).toBeInTheDocument();

      // Back button should return to Login
      const backBtn = screen.getByText('Kembali ke Halaman Masuk');
      fireEvent.click(backBtn);
      expect(screen.getByText('Selamat Datang Kembali')).toBeInTheDocument();
    });

    it('opens directly in reset-password mode when requested', () => {
      render(
        <MemoryRouter>
          <WatchProvider>
            <ModalTestOpener initialMode="reset-password" />
          </WatchProvider>
        </MemoryRouter>
      );

      fireEvent.click(screen.getByText('Buka Modal'));

      expect(screen.getByText('Atur Ulang Kata Sandi')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Tempel token reset dari email Anda')).toBeInTheDocument();
    });
  });
});
