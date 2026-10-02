import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PwaInstallPrompt } from '../components/PwaInstallPrompt';
import { isStandaloneMode, isIosDevice, registerServiceWorker } from '../utils/pwa';

describe('PWA Utilities and Components Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('PWA Helpers (utils/pwa.ts)', () => {
    it('detects standalone mode correctly based on matchMedia', () => {
      const matchMediaSpy = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('standalone'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      window.matchMedia = matchMediaSpy;

      expect(isStandaloneMode()).toBe(true);
    });

    it('detects iOS devices based on userAgent', () => {
      const originalUserAgent = window.navigator.userAgent;
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        configurable: true,
      });

      expect(isIosDevice()).toBe(true);

      // Restore user agent
      Object.defineProperty(window.navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true,
      });
    });

    it('registerServiceWorker skips execution in test environment safely', async () => {
      const result = await registerServiceWorker();
      expect(result).toBeNull();
    });
  });

  describe('PwaInstallPrompt Component', () => {
    it('does not render if already running in standalone mode', () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('standalone'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(<PwaInstallPrompt />);
      expect(screen.queryByText('Pasang Aplikasi LiveEuy')).not.toBeInTheDocument();
    });

    it('renders banner when beforeinstallprompt event is fired', () => {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(<PwaInstallPrompt />);

      // Initially not rendered
      expect(screen.queryByText('Pasang Aplikasi LiveEuy')).not.toBeInTheDocument();

      // Dispatch beforeinstallprompt
      const installEvent = new Event('beforeinstallprompt');
      (installEvent as any).prompt = vi.fn().mockResolvedValue(undefined);
      (installEvent as any).userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });

      act(() => {
        window.dispatchEvent(installEvent);
      });

      expect(screen.getByText('Pasang Aplikasi LiveEuy')).toBeInTheDocument();
      expect(screen.getByText('Pasang')).toBeInTheDocument();
    });

    it('handles dismissal and remembers dismissed state in localStorage', () => {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(<PwaInstallPrompt />);

      const installEvent = new Event('beforeinstallprompt');
      (installEvent as any).prompt = vi.fn().mockResolvedValue(undefined);
      (installEvent as any).userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });

      act(() => {
        window.dispatchEvent(installEvent);
      });

      const dismissBtn = screen.getByLabelText('Tutup notifikasi pemasangan aplikasi');
      fireEvent.click(dismissBtn);

      expect(screen.queryByText('Pasang Aplikasi LiveEuy')).not.toBeInTheDocument();
      expect(localStorage.getItem('liveeuy_pwa_dismissed_until')).toBeTruthy();
    });
  });
});
