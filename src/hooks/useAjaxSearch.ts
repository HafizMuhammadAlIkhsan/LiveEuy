import { useState, useEffect, useRef } from 'react';
import { MediaItem } from '../types';
import { LiveEuyApi } from '../services/api';

export interface UseAjaxSearchOptions {
  debounceMs?: number;
  limit?: number;
  type?: 'all' | 'movie' | 'tv';
  genre?: string;
  minRating?: number;
  sortBy?: 'relevance' | 'rating' | 'newest';
  enabled?: boolean;
}

export interface UseAjaxSearchResult {
  results: MediaItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

/**
 * Custom React hook for live debounced AJAX search with AbortController cancellation.
 */
export function useAjaxSearch(
  query: string,
  options: UseAjaxSearchOptions = {}
): UseAjaxSearchResult {
  const {
    debounceMs = 250,
    limit,
    type = 'all',
    genre = 'all',
    minRating = 0,
    sortBy = 'relevance',
    enabled = true
  } = options;

  const [results, setResults] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // If disabled or empty query, reset state immediately
    if (!enabled || !query.trim()) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setResults([]);
      setTotal(0);
      setIsLoading(false);
      setError(null);
      setHasSearched(false);
      return;
    }

    // Set loading preview state while waiting for debounce
    setIsLoading(true);
    setError(null);

    // Cancel pending debounce timer and in-flight HTTP request
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this specific request cycle
    const controller = new AbortController();
    abortControllerRef.current = controller;

    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await LiveEuyApi.ajaxSearchMedia(query, controller.signal, {
          limit,
          type,
          genre,
          minRating,
          sortBy
        });

        // Only update if this request wasn't aborted
        if (!controller.signal.aborted) {
          setResults(response.items);
          setTotal(response.total);
          setIsLoading(false);
          setHasSearched(true);
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || controller.signal.aborted) {
          // Normal cancellation, keep current state or wait for next query
          return;
        }
        setError(err?.message || 'Gagal memuat hasil pencarian.');
        setIsLoading(false);
        setHasSearched(true);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, debounceMs, limit, type, genre, minRating, sortBy, enabled]);

  return {
    results,
    total,
    isLoading,
    error,
    hasSearched
  };
}
