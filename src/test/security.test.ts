import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sanitizeUrl,
  sanitizeText,
  sanitizeSearchInput,
  sanitizeMediaItem,
  sanitizeMediaCatalog,
  getLoginLockoutStatus,
  recordFailedLoginAttempt,
  clearLoginLockout,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION_SECONDS
} from '../utils/security';

describe('Security Utility Module', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('sanitizeUrl', () => {
    it('allows safe http and https URLs', () => {
      expect(sanitizeUrl('https://liveeuy.id/stream.m3u8')).toBe('https://liveeuy.id/stream.m3u8');
      expect(sanitizeUrl('http://commondatastorage.googleapis.com/video.mp4')).toBe('http://commondatastorage.googleapis.com/video.mp4');
    });

    it('allows relative paths and blob URLs', () => {
      expect(sanitizeUrl('/media/stream.m3u8')).toBe('/media/stream.m3u8');
      expect(sanitizeUrl('blob:http://localhost:5173/abc-123')).toBe('blob:http://localhost:5173/abc-123');
    });

    it('allows safe data:image URIs', () => {
      expect(sanitizeUrl('data:image/png;base64,iVBORw0KGgo=')).toBe('data:image/png;base64,iVBORw0KGgo=');
    });

    it('blocks dangerous javascript:, vbscript:, and data:image/svg+xml protocols', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(sanitizeUrl('javascript:/*--></title></style></textarea></script></xmp><svg/onload=\'+/"/+/onmouseover=1/+/[*/[]/+alert(1)//\'>')).toBe('');
      expect(sanitizeUrl('vbscript:msgbox("xss")')).toBe('');
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
      expect(sanitizeUrl('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>')).toBe('');
      expect(sanitizeUrl('data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+PC9zdmc+')).toBe('');
    });

    it('blocks protocol-relative URLs preventing open redirects', () => {
      expect(sanitizeUrl('//evil.com/phishing')).toBe('');
      expect(sanitizeUrl('//google.com')).toBe('');
    });

    it('returns custom fallback when URL is invalid', () => {
      expect(sanitizeUrl('javascript:void(0)', 'https://fallback.com/video.mp4')).toBe('https://fallback.com/video.mp4');
      expect(sanitizeUrl(null, 'fallback')).toBe('fallback');
    });
  });

  describe('sanitizeText', () => {
    it('strips HTML tags and angle brackets', () => {
      expect(sanitizeText('<script>alert("hack")</script>Hello')).toBe('alert("hack")Hello');
      expect(sanitizeText('Normal <b>Film</b> Action')).toBe('Normal Film Action');
      expect(sanitizeText('<img src="x" onerror="alert(1)">')).toBe('');
    });
  });

  describe('sanitizeSearchInput (Database Query Injection Protection)', () => {
    it('strips dangerous SQL meta-characters and delimiters', () => {
      expect(sanitizeSearchInput("Avengers'; DROP TABLE media; --")).toBe("Avengers DROP TABLE media --");
      expect(sanitizeSearchInput('Movie "test" or 1=1')).toBe("Movie test or 1=1");
      expect(sanitizeSearchInput("test\\path\\query")).toBe("testpathquery");
    });

    it('strips ASCII control codes', () => {
      expect(sanitizeSearchInput("test\u0000payload\u001f")).toBe("testpayload");
    });

    it('truncates excessive search strings to avoid DoS/buffer overflow', () => {
      const longInput = 'A'.repeat(200);
      expect(sanitizeSearchInput(longInput)).toHaveLength(100);
    });

    it('handles non-string and whitespace gracefully', () => {
      expect(sanitizeSearchInput(null)).toBe('');
      expect(sanitizeSearchInput(undefined)).toBe('');
      expect(sanitizeSearchInput('   inception   ')).toBe('inception');
    });
  });

  describe('sanitizeMediaItem', () => {
    it('sanitizes a valid raw media item', () => {
      const raw = {
        title: 'Film <b>Bagus</b>',
        type: 'movie',
        videoUrl: 'https://example.com/stream.m3u8',
        rating: 8.5,
        director: '<script>evil()</script>Sutradara Handal'
      };

      const result = sanitizeMediaItem(raw);
      expect(result).not.toBeNull();
      expect(result?.title).toBe('Film Bagus');
      expect(result?.videoUrl).toBe('https://example.com/stream.m3u8');
      expect(result?.director).toBe('evil()Sutradara Handal');
      expect(result?.rating).toBe(8.5);
    });

    it('rejects media item without title or valid videoUrl', () => {
      expect(sanitizeMediaItem({ videoUrl: 'https://example.com/v.mp4' })).toBeNull();
      expect(sanitizeMediaItem({ title: 'Film A', videoUrl: 'javascript:alert(1)' })).toBeNull();
    });
  });

  describe('sanitizeMediaCatalog', () => {
    it('filters out malicious or empty items from catalog array', () => {
      const rawCatalog = [
        { title: 'Safe Movie 1', type: 'movie', videoUrl: 'https://example.com/movie1.mp4' },
        { title: 'Dangerous Movie', type: 'movie', videoUrl: 'javascript:alert(1)' },
        { title: 'Safe Series 1', type: 'tv', videoUrl: 'https://example.com/tv1.m3u8' }
      ];

      const { sanitized, rejectedCount } = sanitizeMediaCatalog(rawCatalog);
      expect(sanitized.length).toBe(2);
      expect(rejectedCount).toBe(1);
      expect(sanitized[0].title).toBe('Safe Movie 1');
      expect(sanitized[1].title).toBe('Safe Series 1');
    });
  });

  describe('Brute Force Lockout Throttle', () => {
    const testEmail = 'user@liveeuy.id';

    it('starts with 0 attempts and not locked', () => {
      const status = getLoginLockoutStatus(testEmail);
      expect(status.isLocked).toBe(false);
      expect(status.attempts).toBe(0);
      expect(status.remainingSeconds).toBe(0);
    });

    it('triggers lockout after reaching MAX_LOGIN_ATTEMPTS', () => {
      for (let i = 1; i < MAX_LOGIN_ATTEMPTS; i++) {
        const res = recordFailedLoginAttempt(testEmail);
        expect(res.isLocked).toBe(false);
        expect(res.attempts).toBe(i);
      }

      // 5th attempt triggers lockout
      const lockRes = recordFailedLoginAttempt(testEmail);
      expect(lockRes.isLocked).toBe(true);
      expect(lockRes.remainingSeconds).toBe(LOCKOUT_DURATION_SECONDS);

      // Verify status is locked
      const status = getLoginLockoutStatus(testEmail);
      expect(status.isLocked).toBe(true);
      expect(status.remainingSeconds).toBeGreaterThan(0);
    });

    it('clears lockout on success', () => {
      recordFailedLoginAttempt(testEmail);
      recordFailedLoginAttempt(testEmail);
      clearLoginLockout(testEmail);

      const status = getLoginLockoutStatus(testEmail);
      expect(status.isLocked).toBe(false);
      expect(status.attempts).toBe(0);
    });

    it('persists lockout attempts in localStorage preventing multi-tab reset', () => {
      recordFailedLoginAttempt(testEmail);
      recordFailedLoginAttempt(testEmail);

      // Verify stored in localStorage, not sessionStorage
      const throttleKey = `liveeuy_auth_throttle_${testEmail}`;
      expect(localStorage.getItem(throttleKey)).not.toBeNull();
      expect(sessionStorage.getItem(throttleKey)).toBeNull();

      const stored = JSON.parse(localStorage.getItem(throttleKey)!);
      expect(stored.attempts).toBe(2);
    });
  });
});
