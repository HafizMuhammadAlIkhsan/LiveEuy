import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService } from '../services/api';

describe('LiveEuyApiService (Dual-Token Auth & 401 Interceptor)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    apiService.setAccessToken(null);
    vi.restoreAllMocks();
  });

  describe('Access Token Management', () => {
    it('sets and retrieves access token from memory and sessionStorage', () => {
      apiService.setAccessToken('sample-jwt-token-xyz');
      expect(apiService.getAccessToken()).toBe('sample-jwt-token-xyz');
      expect(sessionStorage.getItem('liveeuy_access_token')).toBe('sample-jwt-token-xyz');
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
});
