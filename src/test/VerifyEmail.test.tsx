import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { VerifyEmailPage } from '../pages/VerifyEmailPage';
import { AuthModal } from '../components/AuthModal';
import { WatchProvider, useWatch } from '../context/WatchContext';
import { apiService } from '../services/api';

describe('Email PIN Verification (VerifyEmailPage & AuthModal Flow)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('VerifyEmailPage Standalone Route', () => {
    it('renders email input and 6 PIN boxes', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/verify-email']}>
          <WatchProvider>
            <VerifyEmailPage />
          </WatchProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('Masukkan PIN Verifikasi')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('nama@email.com')).toBeInTheDocument();
      const pinInputs = container.querySelectorAll('input[type="text"]');
      expect(pinInputs.length).toBe(6);
      expect(screen.getByRole('button', { name: /verifikasi & aktifkan akun/i })).toBeInTheDocument();
    });

    it('pre-populates email and PIN from query parameters', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/verify-email?email=testuser@liveeuy.id&pin=987654']}>
          <WatchProvider>
            <VerifyEmailPage />
          </WatchProvider>
        </MemoryRouter>
      );

      const emailInput = screen.getByPlaceholderText('nama@email.com') as HTMLInputElement;
      expect(emailInput.value).toBe('testuser@liveeuy.id');

      const pinInputs = container.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>;
      expect(pinInputs.length).toBe(6);
      expect(pinInputs[0].value).toBe('9');
      expect(pinInputs[1].value).toBe('8');
      expect(pinInputs[2].value).toBe('7');
      expect(pinInputs[3].value).toBe('6');
      expect(pinInputs[4].value).toBe('5');
      expect(pinInputs[5].value).toBe('4');
    });

    it('submits verification and shows success message', async () => {
      const verifySpy = vi.spyOn(apiService, 'verifyEmailPin').mockResolvedValue({
        success: true,
        message: 'Email berhasil diverifikasi! Selamat datang di LiveEuy.',
        user: { name: 'Test User', email: 'testuser@liveeuy.id', tier: 'VIP Standard' }
      });

      render(
        <MemoryRouter initialEntries={['/verify-email?email=testuser@liveeuy.id&pin=987654']}>
          <WatchProvider>
            <VerifyEmailPage />
          </WatchProvider>
        </MemoryRouter>
      );

      const submitButton = screen.getByRole('button', { name: /verifikasi & aktifkan akun/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(verifySpy).toHaveBeenCalledWith('testuser@liveeuy.id', '987654');
        expect(screen.getByText('Email Berhasil Diverifikasi!')).toBeInTheDocument();
      });
    });

    it('allows resending PIN and activates cooldown', async () => {
      const resendSpy = vi.spyOn(apiService, 'resendVerificationPin').mockResolvedValue({
        success: true,
        message: 'Kode PIN baru telah dikirimkan ke email Anda.'
      });

      render(
        <MemoryRouter initialEntries={['/verify-email?email=testuser@liveeuy.id']}>
          <WatchProvider>
            <VerifyEmailPage />
          </WatchProvider>
        </MemoryRouter>
      );

      const resendButton = screen.getByText('Kirim Ulang PIN');
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(resendSpy).toHaveBeenCalledWith('testuser@liveeuy.id');
        expect(screen.getByText(/kirim ulang \([0-9]+s\)/i)).toBeInTheDocument();
      });
    });
  });

  describe('AuthModal Registration Transition to PIN Verification', () => {
    const ModalOpener: React.FC = () => {
      const { openAuthModal } = useWatch();
      return (
        <div>
          <button onClick={() => openAuthModal('register')}>Daftar VIP</button>
          <AuthModal />
        </div>
      );
    };

    it('transitions to PIN verification view after submitting registration form', async () => {
      vi.spyOn(apiService, 'register').mockResolvedValue({
        success: true,
        message: 'Pendaftaran akun berhasil!',
        user: { name: 'Budi Cinema', email: 'budi.cinema@liveeuy.id', tier: 'VIP Standard' }
      });

      render(
        <MemoryRouter>
          <WatchProvider>
            <ModalOpener />
          </WatchProvider>
        </MemoryRouter>
      );

      // Open registration modal
      fireEvent.click(screen.getByText('Daftar VIP'));
      expect(screen.getByText('Mulai Eksplorasi Sinema VIP')).toBeInTheDocument();

      // Fill in registration form
      fireEvent.change(screen.getByPlaceholderText('Contoh: Sarah Wijaya'), { target: { value: 'Budi Cinema' } });
      fireEvent.change(screen.getByPlaceholderText('nama@email.com'), { target: { value: 'budi.cinema@liveeuy.id' } });
      fireEvent.change(screen.getByPlaceholderText('Minimal 6 karakter'), { target: { value: 'Pass123!Safe' } });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /buat akun vip gratis/i }));

      // Should transition to PIN verification view!
      await waitFor(() => {
        expect(screen.getByText('Verifikasi PIN Email')).toBeInTheDocument();
        expect(screen.getByText('budi.cinema@liveeuy.id')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /verifikasi & aktifkan akun/i })).toBeInTheDocument();
      });
    });
  });
});
