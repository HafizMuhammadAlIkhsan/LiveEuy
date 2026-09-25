import React, { createContext, useContext, useState, useEffect } from 'react';
import { MediaItem, Episode, WatchProgress, ViewTab, User } from '../types';
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
  // CMS & Admin Management Methods
  addMedia: (item: MediaItem) => void;
  updateMedia: (id: string, updated: Partial<MediaItem>) => void;
  deleteMedia: (id: string) => void;
  resetMediaToDefault: () => void;
  // Authentication & Guest State
  user: User | null;
  isLoggedIn: boolean;
  login: (userData?: Partial<User>) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
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

  const [mediaList, setMediaList] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('liveeuy_custom_media');
      return saved ? JSON.parse(saved) : MOCK_MEDIA;
    } catch {
      return MOCK_MEDIA;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('liveeuy_custom_media', JSON.stringify(mediaList));
    } catch (e) {
      console.error(e);
    }
  }, [mediaList]);

  const addMedia = (item: MediaItem) => {
    setMediaList(prev => [item, ...prev]);
  };

  const updateMedia = (id: string, updated: Partial<MediaItem>) => {
    setMediaList(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
  };

  const deleteMedia = (id: string) => {
    setMediaList(prev => prev.filter(m => m.id !== id));
  };

  const resetMediaToDefault = () => {
    setMediaList(MOCK_MEDIA);
    try {
      localStorage.removeItem('liveeuy_custom_media');
    } catch (e) {
      console.error(e);
    }
  };

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

  const DEFAULT_USER: User = {
    id: 'user-vip-01',
    name: 'Hafiz Muhammad',
    email: 'hafiz@liveeuy.id',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    tier: 'VIP Cinema Ultra',
    role: 'admin',
    memberSince: 'September 2024',
    watchHours: 48.5,
    devices: 3
  };

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('liveeuy_user');
      if (saved === 'guest') return null;
      if (saved) return JSON.parse(saved);
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = (userData?: Partial<User>) => {
    const newUser: User = {
      id: userData?.id || `user-${Date.now()}`,
      name: userData?.name || 'Pengguna LiveEuy',
      email: userData?.email || 'user@liveeuy.id',
      avatar: userData?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      tier: userData?.tier || 'VIP Standard',
      memberSince: 'Hari ini',
      watchHours: userData?.watchHours || 0,
      devices: userData?.devices || 1
    };
    setUser(newUser);
    try {
      localStorage.setItem('liveeuy_user', JSON.stringify(newUser));
    } catch (e) {
      console.error(e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.setItem('liveeuy_user', 'guest');
    } catch (e) {
      console.error(e);
    }
  };

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
        allMedia: mediaList,
        addMedia,
        updateMedia,
        deleteMedia,
        resetMediaToDefault,
        user,
        isLoggedIn: Boolean(user),
        login,
        logout,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal
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
