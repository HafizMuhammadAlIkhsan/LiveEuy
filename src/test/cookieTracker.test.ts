import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  detectOS, 
  detectBrowser, 
  detectDeviceType, 
  getCookie, 
  setCookie, 
  deleteCookie,
  TRACKER_COOKIE_NAME,
  SESSIONS_STORAGE_KEY,
  getStoredSessions,
  saveStoredSessions,
  fetchClientIP,
  maskEmail,
  trackCurrentVisitor
} from '../utils/cookieTracker';

describe('cookieTracker Utils', () => {
  beforeEach(() => {
    // Clear cookies & localStorage before each test
    deleteCookie(TRACKER_COOKIE_NAME);
    localStorage.clear();
  });

  describe('OS Detection', () => {
    it('detects Windows 11/10 correctly', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      expect(detectOS(ua)).toBe('Windows 11/10');
    });

    it('detects macOS correctly', () => {
      const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15';
      expect(detectOS(ua)).toBe('macOS');
    });

    it('detects Android correctly', () => {
      const ua = 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36';
      expect(detectOS(ua)).toBe('Android');
    });

    it('detects iOS correctly', () => {
      const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15';
      expect(detectOS(ua)).toBe('iOS');
    });
  });

  describe('Browser Detection', () => {
    it('detects Google Chrome', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36';
      expect(detectBrowser(ua)).toBe('Google Chrome');
    });

    it('detects Mozilla Firefox', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0';
      expect(detectBrowser(ua)).toBe('Mozilla Firefox');
    });

    it('detects Microsoft Edge', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Edg/128.0.0.0';
      expect(detectBrowser(ua)).toBe('Microsoft Edge');
    });
  });

  describe('Device Type Detection (Desktop & Mobile Only, No Smart TV)', () => {
    it('identifies desktop browser by default', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      const device = detectDeviceType(ua);
      expect(['Desktop', 'Mobile', 'Tablet']).toContain(device);
      expect(device).not.toBe('Smart TV');
    });

    it('identifies mobile browser for iPhone UA', () => {
      const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148';
      expect(detectDeviceType(ua)).toBe('Mobile');
    });

    it('identifies tablet for iPad UA', () => {
      const ua = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
      expect(detectDeviceType(ua)).toBe('Tablet');
    });
  });

  describe('Cookie Management', () => {
    it('sets and retrieves cookie token', () => {
      setCookie('test_token', 'sample_123', 1);
      expect(getCookie('test_token')).toBe('sample_123');
    });

    it('deletes cookie correctly', () => {
      setCookie('test_token', 'sample_123', 1);
      deleteCookie('test_token');
      expect(getCookie('test_token')).toBeNull();
    });
  });

  describe('Session Storage Persistence', () => {
    it('saves and retrieves stored sessions from localStorage', () => {
      const mockSessions = [
        {
          sessionId: 'sess-test-01',
          cookieToken: 'lv_test_token',
          ipAddress: '127.0.0.1',
          city: 'Bandung',
          country: 'Indonesia',
          deviceType: 'Desktop' as const,
          os: 'Windows 11/10',
          browser: 'Google Chrome',
          screenResolution: '1920x1080',
          language: 'id-ID',
          timeZone: 'Asia/Jakarta',
          userAgent: 'Test UA',
          firstSeen: '24 Sep 2026',
          lastActive: 'Baru saja',
          currentPage: 'Beranda',
          visitedPages: ['home'],
          isCurrentDevice: true
        }
      ];

      saveStoredSessions(mockSessions);
      const retrieved = getStoredSessions();
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].sessionId).toBe('sess-test-01');
      expect(retrieved[0].city).toBe('Bandung');
    });
  });

  describe('fetchClientIP Privacy Protection', () => {
    it('does not contact third-party api.ipify.org and returns safe IP information', async () => {
      const mockFetch = vi.fn().mockImplementation(async (url: string) => {
        expect(url).not.toContain('ipify.org');
        return new Response(JSON.stringify({ ip: '192.168.1.10', city: 'Jakarta', country: 'Indonesia' }), {
          status: 200
        });
      });
      global.fetch = mockFetch;

      const ipInfo = await fetchClientIP();
      expect(ipInfo.ip).toBe('192.168.1.10');
      expect(mockFetch).toHaveBeenCalled();
      expect(mockFetch.mock.calls[0][0]).not.toContain('ipify.org');
    });

    it('falls back gracefully to local network info on network error without leaking data', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

      const ipInfo = await fetchClientIP();
      expect(ipInfo.ip).toBe('127.0.0.1');
      expect(ipInfo.city).toBe('Local Network');
      expect(ipInfo.country).toBe('Indonesia');
    });
  });

  describe('PII Protection (User Email Masking)', () => {
    it('masks email addresses properly', () => {
      expect(maskEmail('hafiz@liveeuy.id')).toBe('ha***z@liveeuy.id');
      expect(maskEmail('budi.santoso@liveeuy.id')).toBe('bu***o@liveeuy.id');
      expect(maskEmail('ab@liveeuy.id')).toBe('a***@liveeuy.id');
      expect(maskEmail('')).toBeUndefined();
      expect(maskEmail(undefined)).toBeUndefined();
    });

    it('stores masked email in localStorage visitor sessions avoiding plaintext PII leaks', async () => {
      global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ip: '127.0.0.1' }), { status: 200 }));

      await trackCurrentVisitor('home', 'sensitive_user@liveeuy.id');

      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      expect(raw).not.toBeNull();
      expect(raw).not.toContain('sensitive_user@liveeuy.id');
      expect(raw).toContain('se***r@liveeuy.id');
    });
  });
});
