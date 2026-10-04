import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { WatchProvider, useWatch } from '../context/WatchContext';

describe('Profile Menu & Logout Responsiveness Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders responsive profile menu when clicking avatar and executes logout cleanly', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <WatchProvider>
          <Navbar />
        </WatchProvider>
      </MemoryRouter>
    );

    // Initial state: logged in as default user (Hafiz Muhammad / VIP)
    const profileTriggerButtons = screen.getAllByRole('button', { name: /Profil Pengguna|Profil Akun/i });
    expect(profileTriggerButtons.length).toBeGreaterThan(0);

    // Open profile menu
    fireEvent.click(profileTriggerButtons[0]);

    // Check dialog appears
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Verify brand harmonized scrollbar classes
    const scrollContainer = dialog.querySelector('.profile-scrollbar');
    expect(scrollContainer).toBeInTheDocument();
    expect(scrollContainer).toHaveClass('custom-scrollbar');

    // Check sticky logout button is rendered
    const logoutBtn = screen.getByRole('button', { name: /Keluar dari Sesi Ini \(Logout\)/i });
    expect(logoutBtn).toBeInTheDocument();

    // Check "Logout Semua Device" button is present
    const logoutAllBtn = screen.getByRole('button', { name: /Logout Semua Device/i });
    expect(logoutAllBtn).toBeInTheDocument();

    // Click logout button
    fireEvent.click(logoutBtn);

    // Menu should close
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders explicit close button on mobile and closes when clicked', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <WatchProvider>
          <Navbar />
        </WatchProvider>
      </MemoryRouter>
    );

    const profileTrigger = screen.getAllByRole('button', { name: /Profil Pengguna|Profil Akun/i })[0];
    fireEvent.click(profileTrigger);

    // Close button with aria-label
    const closeBtn = screen.getByRole('button', { name: /Tutup Menu Profil/i });
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not render Family button in navbar and keeps profile menu clean of family sharing', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <WatchProvider>
          <Navbar />
        </WatchProvider>
      </MemoryRouter>
    );

    // Family button should not exist in the navbar
    const familyBtn = screen.queryByRole('button', { name: /Keluarga|Profil Akun Keluarga/i });
    expect(familyBtn).not.toBeInTheDocument();

    // Open profile menu
    const profileTrigger = screen.getAllByRole('button', { name: /Profil Pengguna|Profil Akun/i })[0];
    fireEvent.click(profileTrigger);

    // Family Sharing should not exist in profile menu
    expect(screen.queryByText(/Family Sharing/i)).not.toBeInTheDocument();
  });

  it('does not render CMS Admin button in the navbar for a clean aesthetic', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <WatchProvider>
          <Navbar />
        </WatchProvider>
      </MemoryRouter>
    );

    // CMS Admin button should not exist in the navbar
    const cmsBtn = screen.queryByRole('button', { name: /Buka Panel Manajemen CMS Admin|CMS Admin/i });
    expect(cmsBtn).not.toBeInTheDocument();
  });

  it('hides Panel CMS Admin in profile menu for regular users', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <WatchProvider>
          <Navbar />
        </WatchProvider>
      </MemoryRouter>
    );

    // Open profile menu as regular user
    const profileTrigger = screen.getAllByRole('button', { name: /Profil Pengguna|Profil Akun/i })[0];
    fireEvent.click(profileTrigger);

    // Panel CMS Admin should not be visible for regular user
    expect(screen.queryByText('Panel CMS Admin')).not.toBeInTheDocument();
  });
});
