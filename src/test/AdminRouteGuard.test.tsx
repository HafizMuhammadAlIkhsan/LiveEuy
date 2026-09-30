import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminRouteGuard } from '../components/AdminRouteGuard';
import * as WatchContextModule from '../context/WatchContext';
import { apiService } from '../services/api';

describe('AdminRouteGuard Component (Role-Based Access Control & Server Verification)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('blocks unauthenticated guests and displays Admin Authentication Required screen', () => {
    vi.spyOn(WatchContextModule, 'useWatch').mockReturnValue({
      user: null,
      isLoggedIn: false,
      openAuthModal: vi.fn(),
    } as any);

    render(
      <MemoryRouter>
        <AdminRouteGuard>
          <div data-testid="protected-cms">Konten Rahasia Studio CMS</div>
        </AdminRouteGuard>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-cms')).not.toBeInTheDocument();
    expect(screen.getByText('Autentikasi Admin Diperlukan')).toBeInTheDocument();
    expect(screen.getByText('Masuk dengan Akun Admin')).toBeInTheDocument();
  });

  it('blocks regular members (role !== admin) and displays 403 Forbidden screen', () => {
    vi.spyOn(WatchContextModule, 'useWatch').mockReturnValue({
      user: {
        id: 'usr-regular',
        name: 'Budi Santoso',
        email: 'budi@liveeuy.id',
        role: 'user',
        tier: 'VIP Standard'
      },
      isLoggedIn: true,
      openAuthModal: vi.fn(),
    } as any);

    render(
      <MemoryRouter>
        <AdminRouteGuard>
          <div data-testid="protected-cms">Konten Rahasia Studio CMS</div>
        </AdminRouteGuard>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-cms')).not.toBeInTheDocument();
    expect(screen.getByText(/403 • Akses Terlarang/i)).toBeInTheDocument();
    expect(screen.getByText('Hak Akses Administrator Dibutuhkan')).toBeInTheDocument();
    expect(screen.getAllByText('Budi Santoso').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('budi@liveeuy.id')).toBeInTheDocument();
  });

  it('allows access to protected CMS children when user has admin role and is verified by server', async () => {
    vi.spyOn(WatchContextModule, 'useWatch').mockReturnValue({
      user: {
        id: 'usr-admin',
        name: 'Hafiz Muhammad',
        email: 'hafiz@liveeuy.id',
        role: 'admin',
        tier: 'VIP Cinema Ultra'
      },
      isLoggedIn: true,
      openAuthModal: vi.fn(),
    } as any);

    vi.spyOn(apiService, 'verifyAdminAccess').mockResolvedValue({ verified: true });

    render(
      <MemoryRouter>
        <AdminRouteGuard>
          <div data-testid="protected-cms">Konten Rahasia Studio CMS</div>
        </AdminRouteGuard>
      </MemoryRouter>
    );

    expect(await screen.findByTestId('protected-cms')).toBeInTheDocument();
    expect(screen.getByText('Konten Rahasia Studio CMS')).toBeInTheDocument();
    expect(screen.queryByText('Autentikasi Admin Diperlukan')).not.toBeInTheDocument();
  });

  it('blocks access when client role is admin but server verification fails (DevTools bypass attempt)', async () => {
    // Simulating attacker changing user.role to 'admin' via React DevTools
    vi.spyOn(WatchContextModule, 'useWatch').mockReturnValue({
      user: {
        id: 'usr-attacker',
        name: 'Hacker Santoso',
        email: 'attacker@liveeuy.id',
        role: 'admin', // Tampered client state
        tier: 'VIP Standard'
      },
      isLoggedIn: true,
      openAuthModal: vi.fn(),
    } as any);

    // Server rejects because real server session is not an admin
    vi.spyOn(apiService, 'verifyAdminAccess').mockResolvedValue({
      verified: false,
      message: 'Manipulasi client-side terdeteksi. Akun Anda bukan administrator di server.'
    });

    render(
      <MemoryRouter>
        <AdminRouteGuard>
          <div data-testid="protected-cms">Konten Rahasia Studio CMS</div>
        </AdminRouteGuard>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('protected-cms')).not.toBeInTheDocument();
    });

    expect(await screen.findByText(/403 • Akses Terlarang/i)).toBeInTheDocument();
    expect(screen.getByText(/Manipulasi client-side terdeteksi/i)).toBeInTheDocument();
  });
});
