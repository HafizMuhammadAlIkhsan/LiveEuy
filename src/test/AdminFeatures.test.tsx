import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WatchProvider, useWatch } from '../context/WatchContext';
import { MediaItem } from '../types';
import * as CookieTrackerModule from '../utils/cookieTracker';

describe('Admin Media Suite & Batch Operations', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <WatchProvider>{children}</WatchProvider>
    </MemoryRouter>
  );

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(CookieTrackerModule, 'trackCurrentVisitor').mockResolvedValue(null as any);
  });

  it('performs batchDeleteMedia successfully', () => {
    const { result } = renderHook(() => useWatch(), { wrapper });
    
    expect(result.current.allMedia.length).toBeGreaterThan(2);
    const initialCount = result.current.allMedia.length;
    const targetIds = [result.current.allMedia[0].id, result.current.allMedia[1].id];

    act(() => {
      result.current.batchDeleteMedia(targetIds);
    });

    expect(result.current.allMedia.length).toBe(initialCount - 2);
    expect(result.current.allMedia.some(m => targetIds.includes(m.id))).toBe(false);
  });

  it('performs batchUpdateMedia to set isTrending across selected items', () => {
    const { result } = renderHook(() => useWatch(), { wrapper });
    const targetIds = [result.current.allMedia[0].id, result.current.allMedia[1].id];

    act(() => {
      result.current.batchUpdateMedia(targetIds, { isTrending: true });
    });

    const updated1 = result.current.allMedia.find(m => m.id === targetIds[0]);
    const updated2 = result.current.allMedia.find(m => m.id === targetIds[1]);
    expect(updated1?.isTrending).toBe(true);
    expect(updated2?.isTrending).toBe(true);
  });

  it('imports media catalog in replace mode', () => {
    const { result } = renderHook(() => useWatch(), { wrapper });
    const customMedia: MediaItem[] = [
      {
        id: 'test-film-1',
        title: 'Film Uji Coba 1',
        type: 'movie',
        overview: 'Ringkasan uji coba',
        tagline: 'Tagline uji',
        posterUrl: 'https://test.com/poster.jpg',
        backdropUrl: 'https://test.com/backdrop.jpg',
        releaseYear: 2026,
        rating: 9.0,
        matchScore: 98,
        ageRating: '13+',
        duration: '2j',
        quality: '4K UHD',
        audio: 'Dolby Atmos',
        director: 'Sutradara Test',
        cast: ['Aktor Test'],
        genres: ['Aksi'],
        videoUrl: 'https://test.com/stream.mp4'
      }
    ];

    act(() => {
      result.current.importMediaCatalog(customMedia, 'replace');
    });

    expect(result.current.allMedia.length).toBe(1);
    expect(result.current.allMedia[0].id).toBe('test-film-1');
  });

  it('imports media catalog in merge mode without removing existing items', () => {
    const { result } = renderHook(() => useWatch(), { wrapper });
    const initialCount = result.current.allMedia.length;

    const newMedia: MediaItem[] = [
      {
        id: 'merged-film-new',
        title: 'Film Gabungan Baru',
        type: 'movie',
        overview: 'Overview gabungan',
        tagline: 'Tagline gabungan',
        posterUrl: 'https://test.com/poster.jpg',
        backdropUrl: 'https://test.com/backdrop.jpg',
        releaseYear: 2026,
        rating: 8.7,
        matchScore: 92,
        ageRating: '16+',
        quality: '4K UHD',
        audio: 'Dolby Atmos',
        director: 'Sutradara Baru',
        cast: ['Aktor Baru'],
        genres: ['Drama'],
        videoUrl: 'https://test.com/stream2.mp4'
      }
    ];

    act(() => {
      result.current.importMediaCatalog(newMedia, 'merge');
    });

    expect(result.current.allMedia.length).toBe(initialCount + 1);
    expect(result.current.allMedia.some(m => m.id === 'merged-film-new')).toBe(true);
  });
});
