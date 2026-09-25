import React, { createContext, useContext, useState, useEffect } from 'react';
import { MediaItem, Episode, WatchProgress, ViewTab, User, VisitorSession, BroadcastAnnouncement, AdminAuditLog, AdCampaign, AdInquiry } from '../types';
import { MOCK_MEDIA, MOCK_ADS, MOCK_AD_INQUIRIES } from '../data/mockData';
import { apiService } from '../services/api';
import { trackCurrentVisitor, getStoredSessions, resetVisitorTracking, saveStoredSessions, deleteCookie, TRACKER_COOKIE_NAME } from '../utils/cookieTracker';

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
  // Broadcast Announcement Banner
  broadcastAnnouncement: BroadcastAnnouncement;
  updateBroadcastAnnouncement: (updated: Partial<BroadcastAnnouncement>) => void;
  toggleBroadcastAnnouncement: () => void;
  // Hero Carousel Order & Featured Items
  featuredOrder: string[];
  setFeaturedOrder: (order: string[]) => void;
  toggleFeaturedItem: (id: string) => void;
  moveFeaturedItem: (id: string, direction: 'up' | 'down') => void;
  // Admin Audit Logs
  auditLogs: AdminAuditLog[];
  addAuditLog: (action: string, category: AdminAuditLog['category'], detail: string) => void;
  clearAuditLogs: () => void;
  // Advertising & Sponsorship System (Multi-Layer Monetization)
  ads: AdCampaign[];
  addAdCampaign: (campaign: AdCampaign) => void;
  updateAdCampaign: (id: string, updated: Partial<AdCampaign>) => void;
  deleteAdCampaign: (id: string) => void;
  toggleAdCampaign: (id: string) => void;
  recordAdImpression: (id: string) => void;
  recordAdClick: (id: string) => void;
  adInquiries: AdInquiry[];
  submitAdInquiry: (inquiry: Omit<AdInquiry, 'id' | 'submittedAt' | 'status'>) => void;
  updateAdInquiryStatus: (id: string, status: AdInquiry['status'], notes?: string) => void;
  isPartnershipModalOpen: boolean;
  openPartnershipModal: () => void;
  closePartnershipModal: () => void;
  // Authentication & Guest State
  user: User | null;
  isLoggedIn: boolean;
  login: (userData?: Partial<User>) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  // Mobile & Cross-Platform Sync
  isMobileSyncOpen: boolean;
  mobileSyncItem: MediaItem | null;
  openMobileSync: (target?: MediaItem) => void;
  closeMobileSync: () => void;
  // Device Security & Logout All Devices
  isDeviceSecurityOpen: boolean;
  openDeviceSecurityModal: () => void;
  closeDeviceSecurityModal: () => void;
  logoutDevice: (sessionId: string) => Promise<{ success: boolean; message: string }>;
  logoutAllDevices: (includeCurrent?: boolean) => Promise<{ success: boolean; message: string; count?: number }>;
  // Visitor Cookie & Device Tracking
  visitorSessions: VisitorSession[];
  currentSession: VisitorSession | null;
  refreshTracking: () => Promise<void>;
  resetTracking: () => void;
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

const VALID_TABS: ViewTab[] = ['home', 'movies', 'tv', 'trending', 'watchlist', 'search', 'admin'];

const getInitialTab = (): ViewTab => {
  if (typeof window !== 'undefined') {
    const rawHash = window.location.hash.replace('#', '').trim().toLowerCase();
    if (VALID_TABS.includes(rawHash as ViewTab)) {
      return rawHash as ViewTab;
    }
    const params = new URLSearchParams(window.location.search);
    const tabParam = (params.get('tab') || params.get('page') || '').trim().toLowerCase();
    if (VALID_TABS.includes(tabParam as ViewTab)) {
      return tabParam as ViewTab;
    }
  }
  return 'home';
};

const DEFAULT_ANNOUNCEMENT: BroadcastAnnouncement = {
  id: 'announcement-01',
  isActive: true,
  type: 'promo',
  badge: 'PROMO VIP ULTRA',
  title: 'Diskon Spesial 50% Akses Bioskop 4K',
  description: 'Buka seluruh tayangan bioskop 4K UHD & Dolby Atmos tanpa batas di semua perangkat.',
  actionText: 'Klaim Sekarang',
  targetTab: 'home'
};

const DEFAULT_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-01',
    timestamp: '24 Sep 2026, 15:30:12',
    actor: 'Hafiz Muhammad',
    actorEmail: 'hafiz@liveeuy.id',
    action: 'Inisialisasi Sistem CMS',
    category: 'system',
    detail: 'Sistem live tracking cookie dan modul statistik analitik diaktifkan.',
    ipAddress: '180.252.164.88'
  },
  {
    id: 'log-02',
    timestamp: '24 Sep 2026, 15:42:00',
    actor: 'Hafiz Muhammad',
    actorEmail: 'hafiz@liveeuy.id',
    action: 'Pembaruan Navbar Terpisah',
    category: 'banner',
    detail: 'Navbar admin console dan tampilan penonton berhasil dipisahkan.',
    ipAddress: '180.252.164.88'
  }
];

const WatchContext = createContext<WatchContextType | undefined>(undefined);

export const WatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<ViewTab>(getInitialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Semua Genre');

  // Synchronize currentTab with browser URL hash
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentHash = window.location.hash.replace('#', '').trim().toLowerCase();
    if (currentTab === 'home') {
      if (currentHash && VALID_TABS.includes(currentHash as ViewTab)) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } else if (currentHash !== currentTab) {
      window.location.hash = currentTab;
    }
  }, [currentTab]);

  // Listen to browser navigation (back/forward buttons and hashchange)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim().toLowerCase();
      if (VALID_TABS.includes(hash as ViewTab)) {
        setCurrentTab(hash as ViewTab);
      } else if (!hash) {
        setCurrentTab('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  // Admin Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('liveeuy_audit_logs');
      return saved ? JSON.parse(saved) : DEFAULT_AUDIT_LOGS;
    } catch {
      return DEFAULT_AUDIT_LOGS;
    }
  });

  const addAuditLog = (action: string, category: AdminAuditLog['category'], detail: string) => {
    const newLog: AdminAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      actor: user?.name || 'Administrator',
      actorEmail: user?.email || 'hafiz@liveeuy.id',
      action,
      category,
      detail,
      ipAddress: currentSession?.ipAddress || '180.252.164.88'
    };
    setAuditLogs(prev => {
      const next = [newLog, ...prev].slice(0, 100);
      try {
        localStorage.setItem('liveeuy_audit_logs', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
    try {
      localStorage.removeItem('liveeuy_audit_logs');
    } catch (e) {
      console.error(e);
    }
  };

  // Broadcast Announcement State
  const [broadcastAnnouncement, setBroadcastAnnouncement] = useState<BroadcastAnnouncement>(() => {
    try {
      const saved = localStorage.getItem('liveeuy_announcement');
      return saved ? JSON.parse(saved) : DEFAULT_ANNOUNCEMENT;
    } catch {
      return DEFAULT_ANNOUNCEMENT;
    }
  });

  const updateBroadcastAnnouncement = (updated: Partial<BroadcastAnnouncement>) => {
    setBroadcastAnnouncement(prev => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('liveeuy_announcement', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    addAuditLog('Perbarui Banner Promo/Pengumuman', 'banner', `Pesan diperbarui: "${updated.title || broadcastAnnouncement.title}"`);
  };

  const toggleBroadcastAnnouncement = () => {
    setBroadcastAnnouncement(prev => {
      const next = { ...prev, isActive: !prev.isActive };
      try {
        localStorage.setItem('liveeuy_announcement', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    addAuditLog('Ubah Status Banner', 'banner', `Status banner diubah menjadi: ${!broadcastAnnouncement.isActive ? 'Aktif' : 'Nonaktif'}`);
  };

  // Hero Carousel Order & Featured Items
  const [featuredOrder, setFeaturedOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('liveeuy_featured_order');
      if (saved) return JSON.parse(saved);
      return MOCK_MEDIA.filter(m => m.isFeatured).map(m => m.id);
    } catch {
      return MOCK_MEDIA.filter(m => m.isFeatured).map(m => m.id);
    }
  });

  const saveFeaturedOrder = (newOrder: string[]) => {
    setFeaturedOrder(newOrder);
    try {
      localStorage.setItem('liveeuy_featured_order', JSON.stringify(newOrder));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFeaturedItem = (id: string) => {
    const isNowFeatured = !featuredOrder.includes(id);
    let newOrder: string[];
    if (isNowFeatured) {
      newOrder = [...featuredOrder, id];
    } else {
      newOrder = featuredOrder.filter(item => item !== id);
    }
    saveFeaturedOrder(newOrder);
    updateMedia(id, { isFeatured: isNowFeatured });
    addAuditLog(
      isNowFeatured ? 'Pin ke Hero Banner' : 'Hapus dari Hero Banner',
      'banner',
      `Film ID "${id}" ${isNowFeatured ? 'ditambahkan ke' : 'dikeluarkan dari'} sorotan utama carousel beranda.`
    );
  };

  const moveFeaturedItem = (id: string, direction: 'up' | 'down') => {
    const idx = featuredOrder.indexOf(id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= featuredOrder.length) return;
    const copy = [...featuredOrder];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    saveFeaturedOrder(copy);
    addAuditLog(
      'Ubah Urutan Carousel',
      'banner',
      `Posisi film "${id}" dipindahkan ke urutan ${targetIdx + 1} di Hero Carousel.`
    );
  };

  const addMedia = (item: MediaItem) => {
    setMediaList(prev => [item, ...prev]);
    addAuditLog('Tambah Film/Serial Baru', 'media', `Menambahkan "${item.title}" (${item.type === 'movie' ? 'Film' : 'Serial TV'}) ke katalog.`);
    // Asynchronous backend database sync
    apiService.createMedia(item).catch(err => {
      console.warn('Sync backend database error on addMedia:', err);
    });
  };

  const updateMedia = (id: string, updated: Partial<MediaItem>) => {
    setMediaList(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
    addAuditLog('Ubah Data Film', 'media', `Memperbarui detail film ID: "${id}".`);
    // Asynchronous backend database sync
    apiService.updateMedia(id, updated).catch(err => {
      console.warn('Sync backend database error on updateMedia:', err);
    });
  };

  const deleteMedia = (id: string) => {
    setMediaList(prev => prev.filter(m => m.id !== id));
    addAuditLog('Hapus Film dari Katalog', 'media', `Menghapus film ID: "${id}" dari database.`);
    // Asynchronous backend database sync
    apiService.deleteMedia(id).catch(err => {
      console.warn('Sync backend database error on deleteMedia:', err);
    });
  };

  const resetMediaToDefault = () => {
    setMediaList(MOCK_MEDIA);
    try {
      localStorage.removeItem('liveeuy_custom_media');
    } catch (e) {
      console.error(e);
    }
    addAuditLog('Reset Katalog ke Standar', 'media', 'Mengembalikan seluruh katalog film ke data bawaan awal.');
  };

  // ==========================================
  // ADVERTISING & SPONSORSHIP SYSTEM (Multi-Layer Monetization)
  // ==========================================
  const [ads, setAds] = useState<AdCampaign[]>(() => {
    try {
      const saved = localStorage.getItem('liveeuy_ads');
      return saved ? JSON.parse(saved) : MOCK_ADS;
    } catch {
      return MOCK_ADS;
    }
  });

  const [adInquiries, setAdInquiries] = useState<AdInquiry[]>(() => {
    try {
      const saved = localStorage.getItem('liveeuy_ad_inquiries');
      return saved ? JSON.parse(saved) : MOCK_AD_INQUIRIES;
    } catch {
      return MOCK_AD_INQUIRIES;
    }
  });

  const [isPartnershipModalOpen, setIsPartnershipModalOpen] = useState(false);
  const openPartnershipModal = () => setIsPartnershipModalOpen(true);
  const closePartnershipModal = () => setIsPartnershipModalOpen(false);

  const saveAdsToStorage = (newAds: AdCampaign[]) => {
    setAds(newAds);
    try {
      localStorage.setItem('liveeuy_ads', JSON.stringify(newAds));
    } catch (e) {
      console.error(e);
    }
  };

  const addAdCampaign = (campaign: AdCampaign) => {
    const next = [campaign, ...ads];
    saveAdsToStorage(next);
    addAuditLog('Tambah Kampanye Iklan Baru', 'ads', `Mitra: "${campaign.partnerName}" (${campaign.title}) pada layer ${campaign.layer}.`);
  };

  const updateAdCampaign = (id: string, updated: Partial<AdCampaign>) => {
    const next = ads.map(a => a.id === id ? { ...a, ...updated } : a);
    saveAdsToStorage(next);
    addAuditLog('Ubah Kampanye Iklan', 'ads', `Memperbarui kampanye iklan ID: "${id}".`);
  };

  const deleteAdCampaign = (id: string) => {
    const target = ads.find(a => a.id === id);
    const next = ads.filter(a => a.id !== id);
    saveAdsToStorage(next);
    addAuditLog('Hapus Kampanye Iklan', 'ads', `Menghapus iklan mitra: "${target?.partnerName || id}".`);
  };

  const toggleAdCampaign = (id: string) => {
    const next = ads.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a);
    saveAdsToStorage(next);
    const target = next.find(a => a.id === id);
    addAuditLog('Ubah Status Iklan', 'ads', `Iklan "${target?.partnerName}" diubah menjadi ${target?.isActive ? 'Aktif' : 'Nonaktif'}.`);
  };

  const recordAdImpression = (id: string) => {
    setAds(prev => {
      const next = prev.map(a => a.id === id ? { ...a, impressions: a.impressions + 1 } : a);
      try {
        localStorage.setItem('liveeuy_ads', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const recordAdClick = (id: string) => {
    setAds(prev => {
      const next = prev.map(a => a.id === id ? { ...a, clicks: a.clicks + 1 } : a);
      try {
        localStorage.setItem('liveeuy_ads', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const submitAdInquiry = (inquiry: Omit<AdInquiry, 'id' | 'submittedAt' | 'status'>) => {
    const newInquiry: AdInquiry = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      submittedAt: new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'new'
    };
    const next = [newInquiry, ...adInquiries];
    setAdInquiries(next);
    try {
      localStorage.setItem('liveeuy_ad_inquiries', JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
    addAuditLog('Pengajuan Iklan Baru Masuk', 'ads', `Pengajuan kemitraan dari "${inquiry.companyName}" (${inquiry.contactName}).`);
  };

  const updateAdInquiryStatus = (id: string, status: AdInquiry['status'], notes?: string) => {
    const next = adInquiries.map(inq => inq.id === id ? { ...inq, status, ...(notes !== undefined ? { notes } : {}) } : inq);
    setAdInquiries(next);
    try {
      localStorage.setItem('liveeuy_ad_inquiries', JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
    addAuditLog('Status Pengajuan Iklan Diperbarui', 'ads', `Status pengajuan ID "${id}" diubah menjadi: ${status}.`);
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

  // Cross-Platform Mobile & Backend Sync Modal
  const [isMobileSyncOpen, setIsMobileSyncOpen] = useState(false);
  const [mobileSyncItem, setMobileSyncItem] = useState<MediaItem | null>(null);

  const openMobileSync = (target?: MediaItem) => {
    setMobileSyncItem(target || playerState.item || detailItem || mediaList[0] || null);
    setIsMobileSyncOpen(true);
  };

  const closeMobileSync = () => {
    setIsMobileSyncOpen(false);
  };

  const login = (userData?: Partial<User>) => {
    const newUser: User = {
      id: userData?.id || `user-${Date.now()}`,
      name: userData?.name || 'Pengguna LiveEuy',
      email: userData?.email || 'user@liveeuy.id',
      avatar: userData?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      tier: userData?.tier || 'VIP Standard',
      role: userData?.role || (userData?.email?.toLowerCase().includes('admin') || userData?.email === 'hafiz@liveeuy.id' ? 'admin' : 'user'),
      memberSince: userData?.memberSince || 'Hari ini',
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

  // Visitor Cookie & Device Tracking
  const [visitorSessions, setVisitorSessions] = useState<VisitorSession[]>(() => getStoredSessions());
  const [currentSession, setCurrentSession] = useState<VisitorSession | null>(null);

  // Device Security & Logout All Devices
  const [isDeviceSecurityOpen, setIsDeviceSecurityOpen] = useState(false);
  const openDeviceSecurityModal = () => setIsDeviceSecurityOpen(true);
  const closeDeviceSecurityModal = () => setIsDeviceSecurityOpen(false);

  const logoutDevice = async (sessionId: string): Promise<{ success: boolean; message: string }> => {
    if (currentSession?.sessionId === sessionId) {
      logout();
      return { success: true, message: 'Sesi perangkat ini telah berhasil diakhiri.' };
    }
    const currentList = getStoredSessions();
    const updated = currentList.filter(s => s.sessionId !== sessionId);
    saveStoredSessions(updated);
    setVisitorSessions(updated);
    if (user) {
      const nextDevices = Math.max(1, (user.devices || 1) - 1);
      const updatedUser = { ...user, devices: nextDevices };
      setUser(updatedUser);
      try {
        localStorage.setItem('liveeuy_user', JSON.stringify(updatedUser));
      } catch (e) {
        console.error(e);
      }
    }
    apiService.logoutDevice(sessionId).catch(() => {});
    return { success: true, message: 'Perangkat berhasil dikeluarkan dari akun Anda.' };
  };

  const logoutAllDevices = async (includeCurrent = true): Promise<{ success: boolean; message: string; count?: number }> => {
    const all = getStoredSessions();
    const totalCount = all.length;
    apiService.logoutAllDevices(includeCurrent).catch(() => {});

    if (includeCurrent) {
      deleteCookie(TRACKER_COOKIE_NAME);
      saveStoredSessions([]);
      setVisitorSessions([]);
      setCurrentSession(null);
      logout();
      setIsDeviceSecurityOpen(false);
      return { 
        success: true, 
        message: `Berhasil logout dari semua ${totalCount} perangkat. Seluruh sesi telah dicabut.`,
        count: totalCount
      };
    } else {
      const remaining = currentSession ? [{ ...currentSession, isCurrentDevice: true }] : [];
      saveStoredSessions(remaining);
      setVisitorSessions(remaining);
      if (user) {
        const updatedUser = { ...user, devices: 1 };
        setUser(updatedUser);
        try {
          localStorage.setItem('liveeuy_user', JSON.stringify(updatedUser));
        } catch (e) {
          console.error(e);
        }
      }
      return { 
        success: true, 
        message: `Berhasil mengeluarkan ${Math.max(1, totalCount - 1)} perangkat lain. Sesi perangkat ini tetap aktif.`,
        count: totalCount - 1
      };
    }
  };

  useEffect(() => {
    trackCurrentVisitor(currentTab, user?.email).then(sess => {
      setCurrentSession(sess);
      setVisitorSessions(getStoredSessions());
    });
  }, [currentTab, user?.email]);

  const refreshTracking = async () => {
    const sess = await trackCurrentVisitor(currentTab, user?.email);
    setCurrentSession(sess);
    setVisitorSessions(getStoredSessions());
  };

  const resetTracking = () => {
    resetVisitorTracking();
    trackCurrentVisitor(currentTab, user?.email).then(sess => {
      setCurrentSession(sess);
      setVisitorSessions(getStoredSessions());
    });
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
        broadcastAnnouncement,
        updateBroadcastAnnouncement,
        toggleBroadcastAnnouncement,
        featuredOrder,
        setFeaturedOrder: saveFeaturedOrder,
        toggleFeaturedItem,
        moveFeaturedItem,
        auditLogs,
        addAuditLog,
        clearAuditLogs,
        // Advertising & Sponsorship System
        ads,
        addAdCampaign,
        updateAdCampaign,
        deleteAdCampaign,
        toggleAdCampaign,
        recordAdImpression,
        recordAdClick,
        adInquiries,
        submitAdInquiry,
        updateAdInquiryStatus,
        isPartnershipModalOpen,
        openPartnershipModal,
        closePartnershipModal,
        user,
        isLoggedIn: Boolean(user),
        login,
        logout,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        isMobileSyncOpen,
        mobileSyncItem,
        openMobileSync,
        closeMobileSync,
        isDeviceSecurityOpen,
        openDeviceSecurityModal,
        closeDeviceSecurityModal,
        logoutDevice,
        logoutAllDevices,
        visitorSessions,
        currentSession,
        refreshTracking,
        resetTracking
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
