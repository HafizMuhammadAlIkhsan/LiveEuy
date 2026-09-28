import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundPage, ForbiddenPage, ServerErrorPage } from '../pages/ErrorPages';
import * as WatchContextModule from '../context/WatchContext';

describe('Error Pages Suite (404, 403, 500)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('NotFoundPage (404 Not Found)', () => {
    it('renders cinematic 404 headline and navigation buttons', () => {
      vi.spyOn(WatchContextModule, 'useWatch').mockReturnValue({
        setSearchQuery: vi.fn(),
      } as any);

      render(
        <MemoryRouter>
          <NotFoundPage />
        </MemoryRouter>
      );

      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText(/404 • Adegan Tidak Ditemukan/i)).toBeInTheDocument();
      expect(screen.getByText('Gulungan Film Terputus dari Proyektor')).toBeInTheDocument();
      expect(screen.getByText('Kembali ke Beranda')).toBeInTheDocument();
      expect(screen.getByText('Jelajahi Film Bioskop')).toBeInTheDocument();
      expect(screen.getByText('Sedang Tren')).toBeInTheDocument();
      expect(screen.getByText('Serial TV')).toBeInTheDocument();
    });

    it('allows typing and submitting quick search', () => {
      const mockSetSearchQuery = vi.fn();
      vi.spyOn(WatchContextModule, 'useWatch').mockReturnValue({
        setSearchQuery: mockSetSearchQuery,
      } as any);

      render(
        <MemoryRouter>
          <NotFoundPage />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText(/Cari judul film atau aktor/i);
      fireEvent.change(input, { target: { value: 'Cyberpunk' } });
      const submitBtn = screen.getByRole('button', { name: 'Cari' });
      fireEvent.click(submitBtn);

      expect(mockSetSearchQuery).toHaveBeenCalledWith('Cyberpunk');
    });
  });

  describe('ForbiddenPage (403 Forbidden)', () => {
    it('renders unauthenticated state when user is not logged in', () => {
      vi.spyOn(WatchContextModule, 'useWatch').mockReturnValue({
        user: null,
        isLoggedIn: false,
        openAuthModal: vi.fn(),
      } as any);

      render(
        <MemoryRouter>
          <ForbiddenPage />
        </MemoryRouter>
      );

      expect(screen.getByText('Autentikasi Admin Diperlukan')).toBeInTheDocument();
      expect(screen.getByText('Masuk dengan Akun Admin')).toBeInTheDocument();
      expect(screen.getByText('Kembali ke Beranda Penonton')).toBeInTheDocument();
    });

    it('renders regular member unauthorized state when user role is not admin', () => {
      vi.spyOn(WatchContextModule, 'useWatch').mockReturnValue({
        user: {
          id: 'usr-member',
          name: 'Sarah Maharani',
          email: 'sarah@liveeuy.id',
          role: 'user',
          tier: 'VIP Ultra'
        },
        isLoggedIn: true,
        openAuthModal: vi.fn(),
      } as any);

      render(
        <MemoryRouter>
          <ForbiddenPage />
        </MemoryRouter>
      );

      expect(screen.getByText(/403 • Akses Terlarang/i)).toBeInTheDocument();
      expect(screen.getByText('Hak Akses Administrator Dibutuhkan')).toBeInTheDocument();
      expect(screen.getAllByText('Sarah Maharani').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('sarah@liveeuy.id')).toBeInTheDocument();
      expect(screen.getByText('Ganti dengan Akun Administrator')).toBeInTheDocument();
    });
  });

  describe('ServerErrorPage (500 Server Error)', () => {
    it('renders 500 error display and recovery actions', () => {
      render(
        <MemoryRouter>
          <ServerErrorPage />
        </MemoryRouter>
      );

      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText(/500 • Gangguan Server Internal/i)).toBeInTheDocument();
      expect(screen.getByText('Transmisi Sinyal Studio Terganggu')).toBeInTheDocument();
      expect(screen.getByText('Muat Ulang Halaman')).toBeInTheDocument();
      expect(screen.getByText('Uji Koneksi Server')).toBeInTheDocument();
      expect(screen.getByText('Beranda')).toBeInTheDocument();
    });

    it('triggers test connection status when clicked', () => {
      vi.useFakeTimers();

      render(
        <MemoryRouter>
          <ServerErrorPage />
        </MemoryRouter>
      );

      const testBtn = screen.getByText('Uji Koneksi Server');
      fireEvent.click(testBtn);

      expect(screen.getByText('Menguji...')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1400);
      });

      expect(screen.getByText(/Mencoba menyambungkan kembali/i)).toBeInTheDocument();

      vi.useRealTimers();
    });
  });
});
