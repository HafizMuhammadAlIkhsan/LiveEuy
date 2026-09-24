import { MediaItem, WatchProgress, Review } from '../types';
import { MOCK_MEDIA } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';

class LiveEuyApiService {
  private isBackendAvailable: boolean | null = null;

  private async checkBackendHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${API_BASE_URL}/media/featured`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);
      this.isBackendAvailable = res.ok;
      return res.ok;
    } catch {
      this.isBackendAvailable = false;
      return false;
    }
  }

  public getBackendStatus(): boolean | null {
    return this.isBackendAvailable;
  }

  // Get all media with filtering and sorting
  async getMedia(params?: { type?: string; genre?: string; search?: string; sortBy?: string }): Promise<MediaItem[]> {
    const isOnline = this.isBackendAvailable ?? (await this.checkBackendHealth());
    if (isOnline) {
      try {
        const query = new URLSearchParams();
        if (params?.type && params.type !== 'all') query.append('type', params.type);
        if (params?.genre && params.genre !== 'Semua Genre') query.append('genre', params.genre);
        if (params?.search) query.append('search', params.search);
        if (params?.sortBy) query.append('sortBy', params.sortBy);

        const res = await fetch(`${API_BASE_URL}/media?${query.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            return json.data;
          }
        }
      } catch (err) {
        console.warn('Gagal memuat dari Spring Boot API, beralih ke data lokal:', err);
      }
    }

    // Fallback to local data
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

  // Get single media by ID
  async getMediaById(id: string): Promise<MediaItem | null> {
    const isOnline = this.isBackendAvailable ?? (await this.checkBackendHealth());
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/media/${id}`);
        if (res.ok) {
          const json = await res.json();
          return json.data || null;
        }
      } catch (err) {
        console.warn('Gagal memuat detail dari Spring Boot API:', err);
      }
    }
    return MOCK_MEDIA.find(m => m.id === id) || null;
  }

  // Toggle watchlist
  async toggleWatchlist(mediaId: string): Promise<boolean> {
    const isOnline = this.isBackendAvailable ?? (await this.checkBackendHealth());
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/user/watchlist/${mediaId}/toggle`, {
          method: 'POST'
        });
        if (res.ok) {
          const json = await res.json();
          return json.data?.inWatchlist ?? false;
        }
      } catch (err) {
        console.warn('Gagal sinkronisasi watchlist ke Spring Boot API:', err);
      }
    }
    // Fallback: toggle locally
    return false;
  }

  // Sync watch progress to server
  async syncWatchProgress(mediaId: string, currentTime: number, duration: number, episodeId?: string): Promise<WatchProgress | null> {
    const isOnline = this.isBackendAvailable ?? (await this.checkBackendHealth());
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/user/progress`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaId, currentTime, duration, episodeId })
        });
        if (res.ok) {
          const json = await res.json();
          return json.data;
        }
      } catch (err) {
        console.warn('Gagal sinkronisasi progress ke Spring Boot API:', err);
      }
    }
    return null;
  }

  // Add review
  async addReview(mediaId: string, author: string, rating: number, comment: string): Promise<Review | null> {
    const isOnline = this.isBackendAvailable ?? (await this.checkBackendHealth());
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/media/${mediaId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author, rating, comment })
        });
        if (res.ok) {
          const json = await res.json();
          return json.data;
        }
      } catch (err) {
        console.warn('Gagal mengirim review ke Spring Boot API:', err);
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
