import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService } from '../services/api';

describe('LiveEuyApiService (Dual-Token Auth & 401 Interceptor)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    apiService.setAccessToken(null);
    vi.restoreAllMocks();
  });

  describe('Access Token Management (In-Memory Only, Anti-XSS)', () => {
    it('sets and retrieves access token strictly in memory without sessionStorage', () => {
      apiService.setAccessToken('sample-jwt-token-xyz');
      expect(apiService.getAccessToken()).toBe('sample-jwt-token-xyz');
      expect(sessionStorage.getItem('liveeuy_access_token')).toBeNull();
      expect(localStorage.getItem('liveeuy_access_token')).toBeNull();
    });

    it('clears access token on logout or null set', () => {
      apiService.setAccessToken('sample-jwt-token-xyz');
      apiService.setAccessToken(null);
      expect(apiService.getAccessToken()).toBeNull();
      expect(sessionStorage.getItem('liveeuy_access_token')).toBeNull();
    });
  });

  describe('authorizedFetch Wrapper', () => {
    it('automatically adds Authorization Bearer header when access token is present', async () => {
      apiService.setAccessToken('valid-access-token');

      const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
      global.fetch = mockFetch;

      await apiService.authorizedFetch('http://localhost:8080/api/v1/user/profile');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callArgs = mockFetch.mock.calls[0];
      const requestOptions = callArgs[1] as RequestInit;
      const headers = requestOptions.headers as Headers;

      expect(headers.get('Authorization')).toBe('Bearer valid-access-token');
      expect(requestOptions.credentials).toBe('include');
    });

    it('intercepts 401 Unauthorized and automatically replays request after silent refresh', async () => {
      apiService.setAccessToken('expired-access-token');

      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.includes('/refresh')) {
          return new Response(JSON.stringify({
            data: { accessToken: 'refreshed-new-token' }
          }), { status: 200 });
        }

        callCount++;
        if (callCount === 1) {
          // First call returns 401 Expired
          return new Response(JSON.stringify({ message: 'Token expired' }), { status: 401 });
        }
        // Second call with new token returns 200 OK
        return new Response(JSON.stringify({ success: true, data: 'Protected Content' }), { status: 200 });
      });

      const res = await apiService.authorizedFetch('http://localhost:8080/api/v1/protected-resource');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data).toBe('Protected Content');
      expect(apiService.getAccessToken()).toBe('refreshed-new-token');
    });
  });

  describe('Admin CMS Mutating APIs (createMedia, updateMedia, deleteMedia)', () => {
    it('sends Authorization Bearer header with createMedia', async () => {
      apiService.setAccessToken('admin-token-123');

      const mockFetch = vi.fn().mockImplementation(async (url: string, opts: RequestInit) => {
        if (url.includes('/media/featured')) {
          return new Response(JSON.stringify({ success: true }), { status: 200 });
        }
        return new Response(JSON.stringify({ data: { id: 'media-new', title: 'Film Baru' } }), { status: 200 });
      });
      global.fetch = mockFetch;

      const result = await apiService.createMedia({ title: 'Film Baru', type: 'movie' });
      expect(result).not.toBeNull();
      expect(result?.title).toBe('Film Baru');

      const createCall = mockFetch.mock.calls.find(c => c[0].endsWith('/media') && c[1]?.method === 'POST');
      expect(createCall).toBeDefined();
      const headers = createCall![1]?.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer admin-token-123');
    });

    it('sends Authorization Bearer header with updateMedia', async () => {
      apiService.setAccessToken('admin-token-123');

      const mockFetch = vi.fn().mockImplementation(async (url: string, opts: RequestInit) => {
        if (url.includes('/media/featured')) {
          return new Response(JSON.stringify({ success: true }), { status: 200 });
        }
        return new Response(JSON.stringify({ data: { id: 'm-1', title: 'Judul Diperbarui' } }), { status: 200 });
      });
      global.fetch = mockFetch;

      const result = await apiService.updateMedia('m-1', { title: 'Judul Diperbarui' });
      expect(result).not.toBeNull();
      expect(result?.title).toBe('Judul Diperbarui');

      const updateCall = mockFetch.mock.calls.find(c => c[0].includes('/media/m-1') && c[1]?.method === 'PUT');
      expect(updateCall).toBeDefined();
      const headers = updateCall![1]?.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer admin-token-123');
    });

    it('sends Authorization Bearer header with deleteMedia', async () => {
      apiService.setAccessToken('admin-token-123');

      const mockFetch = vi.fn().mockImplementation(async (url: string, opts: RequestInit) => {
        if (url.includes('/media/featured')) {
          return new Response(JSON.stringify({ success: true }), { status: 200 });
        }
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      });
      global.fetch = mockFetch;

      const result = await apiService.deleteMedia('m-1');
      expect(result).toBe(true);

      const deleteCall = mockFetch.mock.calls.find(c => c[0].includes('/media/m-1') && c[1]?.method === 'DELETE');
      expect(deleteCall).toBeDefined();
      const headers = deleteCall![1]?.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer admin-token-123');
    });
  });

  describe('User Endpoints with authorizedFetch (toggleWatchlist, syncWatchProgress, addReview)', () => {
    it('sends Authorization Bearer header when calling toggleWatchlist', async () => {
      apiService.setAccessToken('member-token-456');

      const mockFetch = vi.fn().mockImplementation(async (url: string, opts: RequestInit) => {
        if (url.includes('/media/featured')) {
          return new Response(JSON.stringify({ success: true }), { status: 200 });
        }
        return new Response(JSON.stringify({ data: { inWatchlist: true } }), { status: 200 });
      });
      global.fetch = mockFetch;

      const inWatchlist = await apiService.toggleWatchlist('m-1');
      expect(inWatchlist).toBe(true);

      const toggleCall = mockFetch.mock.calls.find(c => c[0].includes('/user/watchlist/m-1/toggle') && c[1]?.method === 'POST');
      expect(toggleCall).toBeDefined();
      const headers = toggleCall![1]?.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer member-token-456');
    });

    it('sends Authorization Bearer header when calling syncWatchProgress', async () => {
      apiService.setAccessToken('member-token-456');

      const mockFetch = vi.fn().mockImplementation(async (url: string, opts: RequestInit) => {
        if (url.includes('/media/featured')) {
          return new Response(JSON.stringify({ success: true }), { status: 200 });
        }
        return new Response(JSON.stringify({ data: { mediaId: 'm-1', currentTime: 120, duration: 600 } }), { status: 200 });
      });
      global.fetch = mockFetch;

      const progress = await apiService.syncWatchProgress('m-1', 120, 600);
      expect(progress).not.toBeNull();

      const progressCall = mockFetch.mock.calls.find(c => c[0].includes('/user/progress') && c[1]?.method === 'PUT');
      expect(progressCall).toBeDefined();
      const headers = progressCall![1]?.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer member-token-456');
    });

    it('sends Authorization Bearer header when calling addReview', async () => {
      apiService.setAccessToken('member-token-456');

      const mockFetch = vi.fn().mockImplementation(async (url: string, opts: RequestInit) => {
        if (url.includes('/media/featured')) {
          return new Response(JSON.stringify({ success: true }), { status: 200 });
        }
        return new Response(JSON.stringify({ data: { id: 'rev-1', comment: 'Bagus sekali!' } }), { status: 200 });
      });
      global.fetch = mockFetch;

      const review = await apiService.addReview('m-1', 'Hafiz', 9, 'Bagus sekali!');
      expect(review).not.toBeNull();

      const reviewCall = mockFetch.mock.calls.find(c => c[0].includes('/media/m-1/reviews') && c[1]?.method === 'POST');
      expect(reviewCall).toBeDefined();
      const headers = reviewCall![1]?.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer member-token-456');
    });
  });

  describe('Server-Side Admin Role Verification (verifyAdminAccess)', () => {
    it('rejects verification when no token is present and refresh fails', async () => {
      apiService.setAccessToken(null);
      global.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 401 }));

      const res = await apiService.verifyAdminAccess();
      expect(res.verified).toBe(false);
      expect(res.message).toContain('tidak ditemukan');
    });

    it('rejects verification when server user has role user (prevents DevTools role bypass)', async () => {
      apiService.setAccessToken('member-jwt-token');
      global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
        data: { id: 'u1', name: 'Member', email: 'member@liveeuy.id', role: 'user' }
      }), { status: 200 }));

      const res = await apiService.verifyAdminAccess();
      expect(res.verified).toBe(false);
      expect(res.message).toContain('bukan administrator');
    });

    it('accepts verification when server confirms admin role', async () => {
      apiService.setAccessToken('admin-jwt-token');
      global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
        data: { id: 'adm-1', name: 'Admin', email: 'admin@liveeuy.id', role: 'admin' }
      }), { status: 200 }));

      const res = await apiService.verifyAdminAccess();
      expect(res.verified).toBe(true);
    });
  });

  describe('Authentication Flows', () => {
    it('sets access token upon successful login', async () => {
      global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
        success: true,
        data: {
          accessToken: 'fresh-jwt-login-token',
          user: { id: 'u1', name: 'Test User', email: 'test@liveeuy.id' }
        }
      }), { status: 200 }));

      const res = await apiService.login('test@liveeuy.id', 'password123');

      expect(res).not.toBeNull();
      expect(res?.success).toBe(true);
      expect(res?.token).toBe('fresh-jwt-login-token');
      expect(apiService.getAccessToken()).toBe('fresh-jwt-login-token');
    });

    it('clears access token on logout', async () => {
      apiService.setAccessToken('active-token-to-be-cleared');

      global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true }), {
        status: 200
      }));

      await apiService.logout();

      expect(apiService.getAccessToken()).toBeNull();
      expect(sessionStorage.getItem('liveeuy_access_token')).toBeNull();
    });
  });

  describe('Search Sanitization (Anti-Stored XSS in custom_media)', () => {
    it('sanitizes custom media from localStorage before searching', async () => {
      // Simulate malicious XSS payload in localStorage custom media
      const maliciousMedia = [
        {
          id: 'mal-1',
          title: '<script>alert("xss")</script>Injected Movie',
          type: 'movie',
          overview: '<img src=x onerror=alert(1)>Sinopsis bahaya',
          videoUrl: 'https://liveeuy.id/stream.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1'
        },
        {
          id: 'mal-2',
          title: 'Dangerous Protocol Media',
          type: 'movie',
          videoUrl: 'javascript:alert("pwned")', // Dangerous protocol
          posterUrl: 'https://images.unsplash.com/photo-2'
        }
      ];

      localStorage.setItem('liveeuy_custom_media', JSON.stringify(maliciousMedia));

      // Resolve catalog URL to null so it uses fallback search
      global.fetch = vi.fn().mockRejectedValue(new Error('Backend offline'));

      const result = await apiService.ajaxSearchMedia('Injected');
      expect(result.items.length).toBe(1);
      // Script tags stripped
      expect(result.items[0].title).toBe('alert("xss")Injected Movie');
      expect(result.items[0].overview).not.toContain('<img');

      // The item with javascript: protocol was rejected completely
      const dangerousResult = await apiService.ajaxSearchMedia('Dangerous');
      expect(dangerousResult.items.length).toBe(0);

      localStorage.removeItem('liveeuy_custom_media');
    });
  });
});
