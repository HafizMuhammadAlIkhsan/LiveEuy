import { MediaItem, WatchProgress, Review, User } from '../types';
import { MOCK_MEDIA } from '../data/mockData';

const DEFAULT_CATALOG_URL = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:8081/api/v1';
const FALLBACK_CATALOG_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const DEFAULT_AUTH_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080';

export interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  message?: string;
  user?: Partial<User>;
}

class LiveEuyApiService {
  private activeCatalogUrl: string | null = null;
  private isCatalogOnline: boolean | null = null;
  private isAuthOnline: boolean | null = null;
  private accessToken: string | null = null;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string | null) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = sessionStorage.getItem('liveeuy_access_token');
    }
  }

  public setAccessToken(token: string | null): void {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        sessionStorage.setItem('liveeuy_access_token', token);
      } else {
        sessionStorage.removeItem('liveeuy_access_token');
      }
    }
  }

  public getAccessToken(): string | null {
    if (!this.accessToken && typeof window !== 'undefined') {
      this.accessToken = sessionStorage.getItem('liveeuy_access_token');
    }
    return this.accessToken;
  }

  /**
   * Universal HTTP fetch wrapper with Automatic 401 Silent Token Refresh & HttpOnly Cookies
   */
  public async authorizedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    const token = this.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include' // Always transmit and accept HttpOnly cookies (refreshToken)
    };

    let res = await fetch(url, fetchOptions);

    // If 401 Unauthorized, perform silent token refresh and replay request
    if (res.status === 401 && !url.includes('/refresh') && !url.includes('/login')) {
      const newToken = await this.refreshToken();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        res = await fetch(url, { ...fetchOptions, headers });
      }
    }

    return res;
  }

  /**
   * Cek ketersediaan layanan Catalog (Spring Boot) pada port 8081 (catalog-service) atau 8080 (backend starter)
   */
  private async resolveCatalogUrl(): Promise<string | null> {
    if (this.activeCatalogUrl) return this.activeCatalogUrl;

    const testUrls = [DEFAULT_CATALOG_URL, FALLBACK_CATALOG_URL];
    for (const url of testUrls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1200);
        const res = await fetch(`${url}/media/featured`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeout);
        if (res.ok) {
          this.activeCatalogUrl = url;
          this.isCatalogOnline = true;
          return url;
        }
      } catch {
        // Lanjutkan mencoba url alternatif
      }
    }
    this.isCatalogOnline = false;
    return null;
  }

  /**
   * Cek kesehatan Auth Service
   */
  private async checkAuthHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${DEFAULT_AUTH_URL}/api/v1/auth/me`, {
        signal: controller.signal,
        credentials: 'include'
      });
      clearTimeout(timeout);
      this.isAuthOnline = res.ok;
      return res.ok;
    } catch {
      this.isAuthOnline = false;
      return false;
    }
  }

  public getCatalogStatus(): boolean | null {
    return this.isCatalogOnline;
  }

  public getAuthStatus(): boolean | null {
    return this.isAuthOnline;
  }

  public getActiveCatalogUrl(): string {
    return this.activeCatalogUrl || DEFAULT_CATALOG_URL;
  }

  // ==========================================
  // AUTHENTICATION ENDPOINTS (Dual-Token Contract)
  // ==========================================

  async login(email: string, password: string): Promise<AuthResponse | null> {
    const authEndpoints = [
      `${DEFAULT_AUTH_URL}/api/v1/auth/login`,
      `${FALLBACK_CATALOG_URL}/auth/login`,
      `${DEFAULT_AUTH_URL}/login`
    ];

    for (const url of authEndpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include' // Accepts Set-Cookie: refreshToken (HttpOnly)
        });

        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          const token = data.accessToken || data.token;
          const user = data.user;

          if (token) {
            this.setAccessToken(token);
          }

          return {
            success: true,
            token,
            user,
            message: json.message || 'Login berhasil. Selamat datang kembali!'
          };
        } else {
          const errData = await res.json().catch(() => null);
          return {
            success: false,
            message: errData?.message || 'Email atau kata sandi tidak valid'
          };
        }
      } catch {
        // Try fallback endpoint
      }
    }

    return null;
  }

  async register(name: string, email: string, password: string, tier: string = 'VIP Standard'): Promise<AuthResponse | null> {
    const authEndpoints = [
      `${DEFAULT_AUTH_URL}/api/v1/auth/register`,
      `${FALLBACK_CATALOG_URL}/auth/register`,
      `${DEFAULT_AUTH_URL}/register`
    ];

    for (const url of authEndpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, tier }),
          credentials: 'include'
        });

        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          const token = data.accessToken || data.token;
          const user = data.user;

          if (token) {
            this.setAccessToken(token);
          }

          return {
            success: true,
            token,
            user,
            message: json.message || 'Pendaftaran akun berhasil!'
          };
        } else {
          const errData = await res.json().catch(() => null);
          return {
            success: false,
            message: errData?.message || 'Gagal mendaftarkan akun. Email mungkin sudah terdaftar.'
          };
        }
      } catch {
        // Try fallback endpoint
      }
    }

    return null;
  }

  /**
   * Silent Token Refresh via HttpOnly Cookie (POST /api/v1/auth/refresh)
   */
  async refreshToken(): Promise<string | null> {
    if (this.isRefreshing) {
      return new Promise<string | null>(resolve => {
        this.refreshSubscribers.push(token => resolve(token));
      });
    }

    this.isRefreshing = true;

    try {
      const refreshEndpoints = [
        `${DEFAULT_AUTH_URL}/api/v1/auth/refresh`,
        `${FALLBACK_CATALOG_URL}/auth/refresh`,
        `${DEFAULT_AUTH_URL}/refresh`
      ];

      for (const url of refreshEndpoints) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          });

          if (res.ok) {
            const json = await res.json();
            const data = json.data || json;
            const newToken = data.accessToken || data.token;

            if (newToken) {
              this.setAccessToken(newToken);
              this.refreshSubscribers.forEach(cb => cb(newToken));
              this.refreshSubscribers = [];
              this.isRefreshing = false;
              return newToken;
            }
          }
        } catch {
          // Try next
        }
      }
    } catch (e) {
      console.warn('Silent token refresh failed:', e);
    }

    this.setAccessToken(null);
    this.refreshSubscribers.forEach(cb => cb(null));
    this.refreshSubscribers = [];
    this.isRefreshing = false;
    return null;
  }

  /**
   * Mengambil profil pengguna aktif (GET /api/v1/auth/me)
   */
  async getCurrentUser(): Promise<User | null> {
    const meEndpoints = [
      `${DEFAULT_AUTH_URL}/api/v1/auth/me`,
      `${FALLBACK_CATALOG_URL}/auth/me`,
      `${DEFAULT_AUTH_URL}/me`
    ];

    for (const url of meEndpoints) {
      try {
        const res = await this.authorizedFetch(url, { method: 'GET' });
        if (res.ok) {
          const json = await res.json();
          const user = json.data || json.user || json;
          if (user && user.email) {
            return user as User;
          }
        }
      } catch {
        // Try next
      }
    }

    return null;
  }

  /**
   * Restore user session seamlessly on page load (Auto Silent Refresh)
   */
  async restoreSession(): Promise<User | null> {
    const user = await this.getCurrentUser();
    if (user) return user;

    // If no access token or 401, attempt silent refresh using HttpOnly cookie
    const token = await this.refreshToken();
    if (token) {
      return await this.getCurrentUser();
    }

    return null;
  }

  /**
   * Logout dari sesi saat ini (POST /api/v1/auth/logout)
   */
  async logout(): Promise<boolean> {
    const logoutEndpoints = [
      `${DEFAULT_AUTH_URL}/api/v1/auth/logout`,
      `${FALLBACK_CATALOG_URL}/auth/logout`,
      `${DEFAULT_AUTH_URL}/logout`
    ];

    for (const url of logoutEndpoints) {
      try {
        await this.authorizedFetch(url, { method: 'POST' });
        break;
      } catch {
        // Try next
      }
    }

    this.setAccessToken(null);
    return true;
  }

  /**
   * Logout dari SEMUA device/perangkat (POST /api/v1/auth/logout-all)
   */
  async logoutAllDevices(includeCurrent = true): Promise<boolean> {
    const testUrls = [
      `${DEFAULT_AUTH_URL}/api/v1/auth/logout-all`,
      `${FALLBACK_CATALOG_URL}/auth/logout-all`
    ];

    for (const url of testUrls) {
      try {
        const res = await this.authorizedFetch(url, {
          method: 'POST',
          body: JSON.stringify({ includeCurrent })
        });
        if (res.ok) return true;
      } catch {
        // Try next
      }
    }

    return true;
  }

  /**
   * Logout / revoke satu perangkat tertentu (DELETE /api/v1/auth/devices/:sessionId)
   */
  async logoutDevice(sessionId: string): Promise<boolean> {
    const testUrls = [
      `${DEFAULT_AUTH_URL}/api/v1/auth/devices/${sessionId}`,
      `${FALLBACK_CATALOG_URL}/auth/devices/${sessionId}`
    ];

    for (const url of testUrls) {
      try {
        const res = await this.authorizedFetch(url, { method: 'DELETE' });
        if (res.ok) return true;
      } catch {
        // Try next
      }
    }

    return true;
  }

  // ==========================================
  // CATALOG ENDPOINTS (Spring Boot Service)
  // ==========================================

  async getMedia(params?: { type?: string; genre?: string; country?: string; year?: number; search?: string; sortBy?: string }): Promise<MediaItem[]> {
    const catalogBase = await this.resolveCatalogUrl();
    if (catalogBase) {
      try {
        const query = new URLSearchParams();
        if (params?.type && params.type !== 'all') query.append('type', params.type);
        if (params?.genre && params.genre !== 'Semua Genre') query.append('genre', params.genre);
        if (params?.country && params.country !== 'Semua Negara') query.append('country', params.country);
        if (params?.year && params.year > 0) query.append('year', String(params.year));
        if (params?.search) query.append('search', params.search);
        if (params?.sortBy) query.append('sortBy', params.sortBy);

        const res = await fetch(`${catalogBase}/media?${query.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            return json.data;
          }
        }
      } catch (err) {
        console.warn('Gagal memuat katalog dari Spring Boot API, menggunakan fallback lokal:', err);
      }
    }

    // Fallback data lokal
    let items = [...MOCK_MEDIA];
    if (params?.type && params.type !== 'all') {
      items = items.filter(m => m.type === params.type);
    }
    if (params?.genre && params.genre !== 'Semua Genre') {
      items = items.filter(m => m.genres.includes(params.genre!));
    }
    if (params?.country && params.country !== 'Semua Negara') {
      items = items.filter(m => m.country === params.country);
    }
    if (params?.year && params.year > 0) {
      items = items.filter(m => m.releaseYear === params.year);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(m => 
        m.title.toLowerCase().includes(q) ||
        m.genres.some(g => g.toLowerCase().includes(q)) ||
        m.cast.some(c => c.toLowerCase().includes(q))
      );
    }
    if (params?.sortBy === 'rating') {
      items.sort((a, b) => b.rating - a.rating);
    } else if (params?.sortBy === 'newest' || params?.sortBy === 'year-desc') {
      items.sort((a, b) => b.releaseYear - a.releaseYear);
    } else if (params?.sortBy === 'oldest' || params?.sortBy === 'year-asc') {
      items.sort((a, b) => a.releaseYear - b.releaseYear);
    } else {
      items.sort((a, b) => (a.topRank || 99) - (b.topRank || 99));
    }
    return items;
  }

  /**
   * AJAX Live Search with AbortSignal support
   */
  async ajaxSearchMedia(
    query: string,
    signal?: AbortSignal,
    options?: {
      limit?: number;
      type?: 'all' | 'movie' | 'tv';
      genre?: string;
      minRating?: number;
      sortBy?: 'relevance' | 'rating' | 'newest';
    }
  ): Promise<{ items: MediaItem[]; total: number }> {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return { items: [], total: 0 };
    }

    const catalogBase = await this.resolveCatalogUrl();
    if (catalogBase) {
      try {
        const params = new URLSearchParams({ search: trimmed });
        if (options?.type && options.type !== 'all') params.append('type', options.type);
        if (options?.genre && options.genre !== 'Semua Genre') params.append('genre', options.genre);
        if (options?.limit) params.append('limit', String(options.limit));

        const res = await fetch(`${catalogBase}/media?${params.toString()}`, { signal });
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            const data: MediaItem[] = json.data;
            return {
              items: options?.limit ? data.slice(0, options.limit) : data,
              total: data.length
            };
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') throw err;
      }
    }

    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    // Micro async tick to simulate real asynchronous AJAX lifecycle
    await new Promise(resolve => setTimeout(resolve, 80));

    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    let sourceItems = [...MOCK_MEDIA];
    try {
      const saved = localStorage.getItem('liveeuy_custom_media');
      if (saved) sourceItems = JSON.parse(saved);
    } catch {
      // ignore
    }

    let filtered = sourceItems.filter(item => {
      if (options?.type && options.type !== 'all' && item.type !== options.type) return false;
      if (options?.genre && options.genre !== 'all' && options.genre !== 'Semua Genre' && !item.genres.includes(options.genre)) return false;
      if (options?.minRating && options.minRating > 0 && item.rating < options.minRating) return false;

      const titleMatch = item.title.toLowerCase().includes(trimmed);
      const origMatch = item.originalTitle?.toLowerCase().includes(trimmed);
      const genreMatch = item.genres.some(g => g.toLowerCase().includes(trimmed));
      const castMatch = item.cast.some(c => c.toLowerCase().includes(trimmed));
      const directorMatch = item.director?.toLowerCase().includes(trimmed);
      const overviewMatch = item.overview?.toLowerCase().includes(trimmed);

      return Boolean(titleMatch || origMatch || genreMatch || castMatch || directorMatch || overviewMatch);
    });

    if (options?.sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (options?.sortBy === 'newest') {
      filtered.sort((a, b) => b.releaseYear - a.releaseYear);
    } else {
      filtered.sort((a, b) => (a.topRank || 99) - (b.topRank || 99));
    }

    const total = filtered.length;
    const items = options?.limit ? filtered.slice(0, options.limit) : filtered;
    return { items, total };
  }

  async getMediaById(id: string): Promise<MediaItem | null> {
    const catalogBase = await this.resolveCatalogUrl();
    if (catalogBase) {
      try {
        const res = await fetch(`${catalogBase}/media/${id}`);
        if (res.ok) {
          const json = await res.json();
          return json.data || null;
        }
      } catch (err) {
        console.warn('Gagal memuat detail dari backend API:', err);
      }
    }
    return MOCK_MEDIA.find(m => m.id === id) || null;
  }

  async toggleWatchlist(mediaId: string): Promise<boolean> {
    const catalogBase = await this.resolveCatalogUrl();
    if (catalogBase) {
      try {
        const res = await fetch(`${catalogBase}/user/watchlist/${mediaId}/toggle`, {
          method: 'POST'
        });
        if (res.ok) {
          const json = await res.json();
          return json.data?.inWatchlist ?? false;
        }
      } catch (err) {
        console.warn('Gagal sinkronisasi watchlist ke backend API:', err);
      }
    }
    return false;
  }

  async syncWatchProgress(mediaId: string, currentTime: number, duration: number, episodeId?: string): Promise<WatchProgress | null> {
    const catalogBase = await this.resolveCatalogUrl();
    if (catalogBase) {
      try {
        const res = await fetch(`${catalogBase}/user/progress`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaId, currentTime, duration, episodeId })
        });
        if (res.ok) {
          const json = await res.json();
          return json.data;
        }
      } catch (err) {
        console.warn('Gagal sinkronisasi progress ke backend API:', err);
      }
    }
    return null;
  }

  async addReview(mediaId: string, author: string, rating: number, comment: string): Promise<Review | null> {
    const catalogBase = await this.resolveCatalogUrl();
    if (catalogBase) {
      try {
        const res = await fetch(`${catalogBase}/media/${mediaId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author, rating, comment })
        });
        if (res.ok) {
          const json = await res.json();
          return json.data;
        }
      } catch (err) {
        console.warn('Gagal mengirim review ke backend API:', err);
      }
    }
    return {
      id: `rev-${Date.now()}`,
      author,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      rating,
      date: 'Baru saja',
      comment
    };
  }

  // ==========================================
  // ADMIN CMS CATALOG DATABASE ENDPOINTS
  // ==========================================

  async createMedia(item: Partial<MediaItem>): Promise<MediaItem | null> {
    const catalogBase = await this.resolveCatalogUrl();
    if (catalogBase) {
      try {
        const payload = {
          title: item.title,
          originalTitle: item.originalTitle || item.title,
          type: item.type || 'movie',
          tagline: item.tagline || '',
          overview: item.overview || '',
          posterUrl: item.posterUrl || '',
          backdropUrl: item.backdropUrl || '',
          logoUrl: item.logoUrl || '',
          releaseYear: item.releaseYear || new Date().getFullYear(),
          country: item.country || 'Indonesia',
          rating: item.rating || 8.0,
          matchScore: item.matchScore || 95,
          ageRating: item.ageRating || '13+',
          duration: item.duration || '2j 00m',
          totalSeasons: item.totalSeasons || 1,
          genres: item.genres || ['Aksi'],
          cast: item.cast || [],
          director: item.director || '',
          videoUrl: item.videoUrl || '',
          trailerUrl: item.trailerUrl || '',
          isTrending: !!item.isTrending,
          isFeatured: !!item.isFeatured,
          topRank: item.topRank || null,
          quality: item.quality || '4K UHD',
          audio: item.audio || 'Dolby Atmos'
        };

        const res = await fetch(`${catalogBase}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          return json.data || null;
        }
      } catch (err) {
        console.warn('Gagal menambah media ke database backend Spring Boot:', err);
      }
    }
    return null;
  }

  async updateMedia(id: string, item: Partial<MediaItem>): Promise<MediaItem | null> {
    const catalogBase = await this.resolveCatalogUrl();
    if (catalogBase) {
      try {
        const payload = {
          title: item.title,
          originalTitle: item.originalTitle,
          type: item.type,
          tagline: item.tagline,
          overview: item.overview,
          posterUrl: item.posterUrl,
          backdropUrl: item.backdropUrl,
          logoUrl: item.logoUrl,
          releaseYear: item.releaseYear,
          country: item.country,
          rating: item.rating,
          matchScore: item.matchScore,
          ageRating: item.ageRating,
          duration: item.duration,
          totalSeasons: item.totalSeasons,
          genres: item.genres,
          cast: item.cast,
          director: item.director,
          videoUrl: item.videoUrl,
          trailerUrl: item.trailerUrl,
          isTrending: item.isTrending,
          isFeatured: item.isFeatured,
          topRank: item.topRank,
          quality: item.quality,
          audio: item.audio
        };

        const res = await fetch(`${catalogBase}/media/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          return json.data || null;
        }
      } catch (err) {
        console.warn('Gagal memperbarui media di database backend Spring Boot:', err);
      }
    }
    return null;
  }

  async deleteMedia(id: string): Promise<boolean> {
    const catalogBase = await this.resolveCatalogUrl();
    if (catalogBase) {
      try {
        const res = await fetch(`${catalogBase}/media/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          return true;
        }
      } catch (err) {
        console.warn('Gagal menghapus media dari database backend Spring Boot:', err);
      }
    }
    return false;
  }
}

export const apiService = new LiveEuyApiService();
export const LiveEuyApi = apiService;
