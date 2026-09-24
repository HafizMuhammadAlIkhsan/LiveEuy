import React, { createContext, useContext, useState, useEffect } from 'react';
import { MediaItem, Episode, WatchProgress, ViewTab } from '../types';
import { MOCK_MEDIA } from '../data/mockData';
import { apiService } from '../services/api';

interface WatchContextType {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedGenre: string;
  setSelectedGenre: (g: string) => void;
  watchlist: string[];
  toggleWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  watchHistory: Record<string, WatchProgress>;
  updateWatchProgress: (mediaId: string, currentTime: number, duration: number, episodeId?: string) => void;
  detailItem: MediaItem | null;
  openDetail: (item: MediaItem) => void;
  closeDetail: () => void;
  playerState: {
    isOpen: boolean;
    item: MediaItem | null;
    episode?: Episode;
  };
  openPlayer: (item: MediaItem, episode?: Episode) => void;
  closePlayer: () => void;
  playNextEpisode: () => void;
  allMedia: MediaItem[];
}

export const withViewTransition = (fn: () => void) => {
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    (document as any).startViewTransition(() => {
      fn();
    });
  } else {
    fn();
  }
};

const WatchContext = createContext<WatchContextType | undefined>(undefined);

export const WatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<ViewTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Semua Genre');

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('liveeuy_watchlist');
      return saved ? JSON.parse(saved) : ['cyberpunk-neo-nusantara', 'chronicles-of-elysium'];
    } catch {
      return ['cyberpunk-neo-nusantara', 'chronicles-of-elysium'];
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('liveeuy_favorites');
      return saved ? JSON.parse(saved) : ['cyberpunk-neo-nusantara'];
    } catch {
      return ['cyberpunk-neo-nusantara'];
    }
  });

  const [watchHistory, setWatchHistory] = useState<Record<string, WatchProgress>>(() => {
    try {
      const saved = localStorage.getItem('liveeuy_history');
      return saved ? JSON.parse(saved) : {
        'cyberpunk-neo-nusantara': {
          mediaId: 'cyberpunk-neo-nusantara',
          currentTime: 1420,
          duration: 3120,
          percentage: 45,
          lastWatched: Date.now() - 3600000,
          episodeId: 'cp-s1-e1'
        },
        'tokyo-speedline': {
          mediaId: 'tokyo-speedline',
          currentTime: 3800,
          duration: 7440,
          percentage: 51,
          lastWatched: Date.now() - 86400000
        }
      };
    } catch {
      return {};
    }
  });

  const [detailItem, setDetailItem] = useState<MediaItem | null>(null);
  const [playerState, setPlayerState] = useState<{
    isOpen: boolean;
    item: MediaItem | null;
    episode?: Episode;
  }>({
    isOpen: false,
    item: null,
  });

  useEffect(() => {
    try {
      localStorage.setItem('liveeuy_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.error(e);
    }
  }, [watchlist]);

  useEffect(() => {
    try {
      localStorage.setItem('liveeuy_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('liveeuy_history', JSON.stringify(watchHistory));
    } catch (e) {
      console.error(e);
    }
  }, [watchHistory]);

  const toggleWatchlist = (id: string) => {
    setWatchlist(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
    apiService.toggleWatchlist(id).catch(() => {});
  };

  const isInWatchlist = (id: string) => watchlist.includes(id);

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const updateWatchProgress = (
    mediaId: string,
    currentTime: number,
    duration: number,
    episodeId?: string
  ) => {
    if (!duration || duration <= 0) return;
    const percentage = Math.min(100, Math.round((currentTime / duration) * 100));
    setWatchHistory(prev => ({
      ...prev,
      [mediaId]: {
        mediaId,
        currentTime,
        duration,
        percentage,
        lastWatched: Date.now(),
        episodeId
      }
    }));
    apiService.syncWatchProgress(mediaId, currentTime, duration, episodeId).catch(() => {});
  };

  const setTab = (tab: ViewTab) => {
    withViewTransition(() => {
      setCurrentTab(tab);
    });
  };

  const openDetail = (item: MediaItem) => {
    withViewTransition(() => {
      setDetailItem(item);
    });
  };

  const closeDetail = () => {
    withViewTransition(() => {
      setDetailItem(null);
    });
  };

  const openPlayer = (item: MediaItem, episode?: Episode) => {
    withViewTransition(() => {
      setPlayerState({
        isOpen: true,
        item,
        episode: episode || (item.seasons?.[0]?.episodes?.[0] || undefined)
      });
    });
  };

  const closePlayer = () => {
    withViewTransition(() => {
      setPlayerState({
        isOpen: false,
        item: null,
        episode: undefined
      });
    });
  };

  const playNextEpisode = () => {
    if (!playerState.item || !playerState.episode || !playerState.item.seasons) return;
    
    // Find next episode in same season or next season
    for (const season of playerState.item.seasons) {
      const epIndex = season.episodes.findIndex(e => e.id === playerState.episode?.id);
      if (epIndex !== -1) {
        if (epIndex + 1 < season.episodes.length) {
          setPlayerState(prev => ({
            ...prev,
            episode: season.episodes[epIndex + 1]
          }));
          return;
        } else {
          // Check next season
          const nextSeasonIndex = playerState.item.seasons.findIndex(s => s.seasonNumber === season.seasonNumber + 1);
          if (nextSeasonIndex !== -1 && playerState.item.seasons[nextSeasonIndex].episodes.length > 0) {
            setPlayerState(prev => ({
              ...prev,
              episode: playerState.item!.seasons![nextSeasonIndex].episodes[0]
            }));
            return;
          }
        }
      }
    }
  };

  return (
    <WatchContext.Provider
      value={{
        currentTab,
        setCurrentTab: setTab,
        searchQuery,
        setSearchQuery,
        selectedGenre,
        setSelectedGenre,
        watchlist,
        toggleWatchlist,
        isInWatchlist,
        favorites,
        toggleFavorite,
        isFavorite,
        watchHistory,
        updateWatchProgress,
        detailItem,
        openDetail,
        closeDetail,
        playerState,
        openPlayer,
        closePlayer,
        playNextEpisode,
        allMedia: MOCK_MEDIA
      }}
    >
      {children}
    </WatchContext.Provider>
  );
};

export const useWatch = () => {
  const context = useContext(WatchContext);
  if (!context) {
    throw new Error('useWatch must be used within a WatchProvider');
  }
  return context;
};
