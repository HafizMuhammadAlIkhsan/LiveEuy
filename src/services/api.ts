import { MediaItem, WatchProgress, Review } from '../types';
import { MOCK_MEDIA } from '../data/mockData';

const DEFAULT_CATALOG_URL = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:8081/api/v1';
const FALLBACK_CATALOG_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const DEFAULT_AUTH_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080';

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: {
    name: string;
    email: string;
    createdAt?: string;
  };
}

class LiveEuyApiService {
  private activeCatalogUrl: string | null = null;
  private isCatalogOnline: boolean | null = null;
  private isAuthOnline: boolean | null = null;

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
   * Cek kesehatan Auth Service (Golang)
   */
  private async checkAuthHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${DEFAULT_AUTH_URL}/api/health`, {
        signal: controller.signal
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
  // AUTHENTICATION ENDPOINTS (Go Auth Service)
  // ==========================================

  async login(email: string, password: string): Promise<AuthResponse | null> {
    try {
      const res = await fetch(`${DEFAULT_AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          token: data.token,
          user: data.user
        };
      }
    } catch (err) {
      console.warn('Auth Service offline atau gagal terhubung:', err);
    }
    return null;
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse | null> {
    try {
      const res = await fetch(`${DEFAULT_AUTH_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          token: data.token,
          user: data.user
        };
      }
    } catch (err) {
      console.warn('Auth Service offline atau gagal registrasi:', err);
    }
    return null;
  }

  // ==========================================
  // CATALOG ENDPOINTS (Spring Boot Service)
  // ==========================================

  async getMedia(params?: { type?: string; genre?: string; search?: string; sortBy?: string }): Promise<MediaItem[]> {
    const catalogBase = await this.resolveCatalogUrl();
    if (catalogBase) {
      try {
        const query = new URLSearchParams();
        if (params?.type && params.type !== 'all') query.append('type', params.type);
        if (params?.genre && params.genre !== 'Semua Genre') query.append('genre', params.genre);
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
    } else if (params?.sortBy === 'newest') {
      items.sort((a, b) => b.releaseYear - a.releaseYear);
    } else {
      items.sort((a, b) => (a.topRank || 99) - (b.topRank || 99));
    }
    return items;
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
}

export const apiService = new LiveEuyApiService();
