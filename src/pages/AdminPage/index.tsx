import React, { useState, useMemo, useEffect } from 'react';
import { useWatch } from '../../context/WatchContext';
import { MediaItem, Episode, Season, User } from '../../types';
import { GENRES, COUNTRIES, YEARS } from '../../data/mockData';
import { 
  Sliders, 
  Film, 
  Tv, 
  Users, 
  MessageSquare, 
  Settings, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  Flame, 
  Crown, 
  Play, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Server,
  Database,
  Layers,
  Star,
  Monitor,
  Smartphone,
  Tablet as TabletIcon,
  Globe,
  Cookie,
  RefreshCw,
  Copy,
  MapPin,
  Laptop,
  ChevronRight,
  Activity,
  BarChart3,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Award,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUp,
  ArrowDown,
  Download,
  Megaphone,
  FileSpreadsheet,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft,
  Menu,
  Home,
  Bookmark,
  LogOut,
  Bell,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

export type AdminModuleId = 'media' | 'banner' | 'episodes' | 'users' | 'tracking' | 'analytics' | 'reviews' | 'system';

export interface SidebarNavItem {
  id: AdminModuleId;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  pulse?: boolean;
}

export interface SidebarNavGroup {
  group: string;
  items: SidebarNavItem[];
}

const exportToCSV = (filename: string, rows: (string | number)[][]) => {
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const AdminPage: React.FC = () => {
  const { 
    allMedia, 
    addMedia, 
    updateMedia, 
    deleteMedia, 
    resetMediaToDefault, 
    setCurrentTab,
    openPlayer,
    openDetail,
    visitorSessions,
    currentSession,
    refreshTracking,
    resetTracking,
    broadcastAnnouncement,
    updateBroadcastAnnouncement,
    toggleBroadcastAnnouncement,
    featuredOrder,
    toggleFeaturedItem,
    moveFeaturedItem,
    auditLogs,
    clearAuditLogs,
    user,
    logout,
    openDeviceSecurityModal
  } = useWatch();

  // Active Admin Sub-Module Tab
  const [activeModule, setActiveModule] = useState<AdminModuleId>('media');

  // Sidebar Collapsible & Mobile Drawer State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Quick Public Web Navigation Items
  const publicWebNavItems = useMemo(() => [
    { id: 'home' as const, label: 'Beranda Web', icon: Home, desc: 'Tampilan Utama' },
    { id: 'movies' as const, label: 'Katalog Film', icon: Film, desc: 'Daftar Film Bioskop' },
    { id: 'tv' as const, label: 'Serial TV', icon: Tv, desc: 'Serial Drama & Musim' },
    { id: 'trending' as const, label: 'Sedang Tren', icon: Flame, desc: 'Tayangan Terpopuler' },
    { id: 'watchlist' as const, label: 'Koleksi Saya', icon: Bookmark, desc: 'Daftar Tontonan' },
  ], []);

  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const customEvent = e as CustomEvent<AdminModuleId>;
      if (customEvent.detail) {
        setActiveModule(customEvent.detail);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('admin-tab-change', handleTabChange);
    return () => window.removeEventListener('admin-tab-change', handleTabChange);
  }, []);

  // Tracking Search & Filter
  const [trackingSearch, setTrackingSearch] = useState('');
  const [trackingFilterOS, setTrackingFilterOS] = useState<'all' | 'macOS' | 'Windows' | 'iOS' | 'Android'>('all');

  // Banner & Announcement Editor State
  const [announcementForm, setAnnouncementForm] = useState({
    badge: broadcastAnnouncement.badge,
    title: broadcastAnnouncement.title,
    description: broadcastAnnouncement.description,
    actionText: broadcastAnnouncement.actionText,
    type: broadcastAnnouncement.type,
    targetTab: broadcastAnnouncement.targetTab || 'home'
  });
  const [isAnnouncementSaved, setIsAnnouncementSaved] = useState(false);
  const [bannerSearchTerm, setBannerSearchTerm] = useState('');
  const [auditLogFilter, setAuditLogFilter] = useState<'all' | 'media' | 'banner' | 'user' | 'tracking' | 'system'>('all');

  useEffect(() => {
    setAnnouncementForm({
      badge: broadcastAnnouncement.badge,
      title: broadcastAnnouncement.title,
      description: broadcastAnnouncement.description,
      actionText: broadcastAnnouncement.actionText,
      type: broadcastAnnouncement.type,
      targetTab: broadcastAnnouncement.targetTab || 'home'
    });
  }, [broadcastAnnouncement]);

  const handleSaveAnnouncement = () => {
    updateBroadcastAnnouncement(announcementForm);
    setIsAnnouncementSaved(true);
    setTimeout(() => setIsAnnouncementSaved(false), 2500);
  };

  // Backend System Diagnostic State
  const [isPingingBackend, setIsPingingBackend] = useState(false);
  const [backendPingResult, setBackendPingResult] = useState<{
    catalogOnline: boolean;
    catalogLatency: number | null;
    catalogUrl: string;
    authOnline: boolean;
    authLatency: number | null;
    testedAt: string | null;
  }>({
    catalogOnline: false,
    catalogLatency: null,
    catalogUrl: 'http://localhost:8081/api/v1',
    authOnline: false,
    authLatency: null,
    testedAt: null
  });

  const runBackendDiagnostic = async () => {
    setIsPingingBackend(true);
    const result = {
      catalogOnline: false,
      catalogLatency: null as number | null,
      catalogUrl: 'http://localhost:8081/api/v1',
      authOnline: false,
      authLatency: null as number | null,
      testedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    // 1. Ping Catalog Service (Spring Boot)
    const t0 = performance.now();
    try {
      const c = new AbortController();
      const to = setTimeout(() => c.abort(), 1500);
      const res = await fetch('http://localhost:8081/api/v1/media/featured', { signal: c.signal });
      clearTimeout(to);
      if (res.ok) {
        result.catalogOnline = true;
        result.catalogLatency = Math.round(performance.now() - t0);
        result.catalogUrl = 'http://localhost:8081/api/v1';
      }
    } catch {
      try {
        const c2 = new AbortController();
        const to2 = setTimeout(() => c2.abort(), 1500);
        const res2 = await fetch('http://localhost:8080/api/v1/media/featured', { signal: c2.signal });
        clearTimeout(to2);
        if (res2.ok) {
          result.catalogOnline = true;
          result.catalogLatency = Math.round(performance.now() - t0);
          result.catalogUrl = 'http://localhost:8080/api/v1';
        }
      } catch {
        result.catalogOnline = false;
      }
    }

    // 2. Ping Auth Service (Go Gin)
    const t1 = performance.now();
    try {
      const c = new AbortController();
      const to = setTimeout(() => c.abort(), 1500);
      const res = await fetch('http://localhost:8080/api/health', { signal: c.signal });
      clearTimeout(to);
      if (res.ok) {
        result.authOnline = true;
        result.authLatency = Math.round(performance.now() - t1);
      }
    } catch {
      result.authOnline = false;
    }

    setBackendPingResult(result);
    setIsPingingBackend(false);
  };

  useEffect(() => {
    if (activeModule === 'system') {
      runBackendDiagnostic();
    }
  }, [activeModule]);

  // Search in admin table
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  // Media Modal Form State (Create / Edit)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formOriginalTitle, setFormOriginalTitle] = useState('');
  const [formType, setFormType] = useState<'movie' | 'tv'>('movie');
  const [formTagline, setFormTagline] = useState('');
  const [formOverview, setFormOverview] = useState('');
  const [formPosterUrl, setFormPosterUrl] = useState('');
  const [formBackdropUrl, setFormBackdropUrl] = useState('');
  const [formReleaseYear, setFormReleaseYear] = useState<number>(2026);
  const [formCountry, setFormCountry] = useState('Indonesia');
  const [formRating, setFormRating] = useState<number>(8.5);
  const [formMatchScore, setFormMatchScore] = useState<number>(95);
  const [formAgeRating, setFormAgeRating] = useState<'SU' | '13+' | '16+' | '18+' | '21+'>('13+');
  const [formDuration, setFormDuration] = useState('2j 10m');
  const [formTotalSeasons, setFormTotalSeasons] = useState<number>(1);
  const [formQuality, setFormQuality] = useState<'4K UHD' | 'HD' | 'Dolby Vision'>('4K UHD');
  const [formAudio, setFormAudio] = useState<'Dolby Atmos' | '5.1 Surround' | 'Stereo'>('Dolby Atmos');
  const [formDirector, setFormDirector] = useState('');
  const [formCast, setFormCast] = useState('');
  const [formSelectedGenres, setFormSelectedGenres] = useState<string[]>(['Aksi']);
  const [formVideoUrl, setFormVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
  const [formTrailerUrl, setFormTrailerUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsTrending, setFormIsTrending] = useState(false);
  const [formTopRank, setFormTopRank] = useState<number | undefined>(undefined);

  // Episode Module states
  const seriesList = useMemo(() => allMedia.filter(m => m.type === 'tv'), [allMedia]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(seriesList[0]?.id || '');
  const activeSeries = useMemo(() => seriesList.find(s => s.id === selectedSeriesId) || seriesList[0], [seriesList, selectedSeriesId]);

  // Episode Form state
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [epSeasonNumber, setEpSeasonNumber] = useState<number>(1);
  const [epNumber, setEpNumber] = useState<number>(1);
  const [epTitle, setEpTitle] = useState('');
  const [epOverview, setEpOverview] = useState('');
  const [epDuration, setEpDuration] = useState('45m');
  const [epThumbnail, setEpThumbnail] = useState('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80');
  const [epVideoUrl, setEpVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');

  // Users Module Mock Data
  const [usersList, setUsersList] = useState<User[]>([
    {
      id: 'usr-101',
      name: 'Hafiz Muhammad',
      email: 'hafiz@liveeuy.id',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      tier: 'VIP Cinema Ultra',
      role: 'admin',
      memberSince: 'Sep 2024',
      watchHours: 48.5,
      devices: 4
    },
    {
      id: 'usr-102',
      name: 'Budi Santoso',
      email: 'budi@liveeuy.id',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
      tier: 'VIP Standard',
      role: 'user',
      memberSince: 'Okt 2024',
      watchHours: 14.2,
      devices: 2
    },
    {
      id: 'usr-103',
      name: 'Siti Sarah',
      email: 'siti@liveeuy.id',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      tier: 'VIP Cinema Ultra',
      role: 'user',
      memberSince: 'Nov 2024',
      watchHours: 32.0,
      devices: 3
    },
    {
      id: 'usr-104',
      name: 'Rian Pratama',
      email: 'rian@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      tier: 'Free Guest',
      role: 'user',
      memberSince: 'Jan 2025',
      watchHours: 2.5,
      devices: 1
    }
  ]);

  // Analytics Module States (Most watched, ratings best/worst)
  const [analyticsFilterType, setAnalyticsFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [analyticsSortBy, setAnalyticsSortBy] = useState<'views' | 'watchHours' | 'ratingDesc' | 'ratingAsc'>('views');
  const [analyticsSearch, setAnalyticsSearch] = useState('');

  // Compute analytics and watch stats for each media item
  const mediaAnalyticsList = useMemo(() => {
    return allMedia.map((m) => {
      const charSum = m.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const baseViews = Math.round(
        (m.rating * 13500) + 
        (m.matchScore * 920) + 
        (m.isTrending ? 48000 : 0) + 
        (m.isFeatured ? 26000 : 0) + 
        (charSum % 14000)
      );
      
      const views = Math.max(3800, baseViews);
      const avgMinutes = m.type === 'movie' ? 105 : 195;
      const watchHours = Math.round((views * avgMinutes * (0.68 + ((charSum % 25) / 100))) / 60);
      const completionRate = Math.min(98, Math.max(50, Math.round(55 + (m.rating * 4.2))));
      const likesCount = Math.round(views * 0.14 * (m.rating / 10));
      const dislikesCount = Math.round(views * 0.03 * Math.max(0.1, 1 - (m.rating / 10)));

      let sentiment: 'Masterpiece' | 'Sangat Bagus' | 'Bagus' | 'Cukup' | 'Perlu Evaluasi';
      let sentimentColor: string;
      if (m.rating >= 9.2) {
        sentiment = 'Masterpiece';
        sentimentColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      } else if (m.rating >= 8.5) {
        sentiment = 'Sangat Bagus';
        sentimentColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      } else if (m.rating >= 7.5) {
        sentiment = 'Bagus';
        sentimentColor = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      } else if (m.rating >= 6.5) {
        sentiment = 'Cukup';
        sentimentColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      } else {
        sentiment = 'Perlu Evaluasi';
        sentimentColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      }

      return {
        ...m,
        views,
        watchHours,
        completionRate,
        likesCount,
        dislikesCount,
        sentiment,
        sentimentColor
      };
    });
  }, [allMedia]);

  // Overall key metrics
  const totalViewsAccumulated = useMemo(() => {
    return mediaAnalyticsList.reduce((sum, item) => sum + item.views, 0);
  }, [mediaAnalyticsList]);

  const totalWatchHoursAccumulated = useMemo(() => {
    return mediaAnalyticsList.reduce((sum, item) => sum + item.watchHours, 0);
  }, [mediaAnalyticsList]);

  const averageRatingAcrossCatalog = useMemo(() => {
    if (allMedia.length === 0) return 0;
    const sum = allMedia.reduce((acc, m) => acc + m.rating, 0);
    return +(sum / allMedia.length).toFixed(1);
  }, [allMedia]);

  // Highlights: Best Rated, Lowest Rated, Most Watched
  const bestRatedMedia = useMemo(() => {
    if (mediaAnalyticsList.length === 0) return null;
    return [...mediaAnalyticsList].sort((a, b) => b.rating - a.rating)[0];
  }, [mediaAnalyticsList]);

  const lowestRatedMedia = useMemo(() => {
    if (mediaAnalyticsList.length === 0) return null;
    return [...mediaAnalyticsList].sort((a, b) => a.rating - b.rating)[0];
  }, [mediaAnalyticsList]);

  const mostWatchedMedia = useMemo(() => {
    if (mediaAnalyticsList.length === 0) return null;
    return [...mediaAnalyticsList].sort((a, b) => b.views - a.views)[0];
  }, [mediaAnalyticsList]);

  // Top 5 Most Watched for progress bar ranking
  const top5MostWatched = useMemo(() => {
    return [...mediaAnalyticsList].sort((a, b) => b.views - a.views).slice(0, 5);
  }, [mediaAnalyticsList]);

  // Top 3 Best vs Top 3 Lowest Rated
  const top3HighestRated = useMemo(() => {
    return [...mediaAnalyticsList].sort((a, b) => b.rating - a.rating).slice(0, 3);
  }, [mediaAnalyticsList]);

  const top3LowestRated = useMemo(() => {
    return [...mediaAnalyticsList].sort((a, b) => a.rating - b.rating).slice(0, 3);
  }, [mediaAnalyticsList]);

  // Rating distribution counts
  const ratingDistribution = useMemo(() => {
    const d9 = allMedia.filter(m => m.rating >= 9.0).length;
    const d8 = allMedia.filter(m => m.rating >= 8.0 && m.rating < 9.0).length;
    const d7 = allMedia.filter(m => m.rating >= 7.0 && m.rating < 8.0).length;
    const dLow = allMedia.filter(m => m.rating < 7.0).length;
    return { d9, d8, d7, dLow };
  }, [allMedia]);

  // Filtered & Sorted Analytics List for the data table
  const filteredAnalyticsMedia = useMemo(() => {
    let result = [...mediaAnalyticsList];

    if (analyticsFilterType !== 'all') {
      result = result.filter(item => item.type === analyticsFilterType);
    }

    if (analyticsSearch.trim()) {
      const q = analyticsSearch.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.director.toLowerCase().includes(q) ||
        item.genres.some(g => g.toLowerCase().includes(q))
      );
    }

    if (analyticsSortBy === 'views') {
      result.sort((a, b) => b.views - a.views);
    } else if (analyticsSortBy === 'watchHours') {
      result.sort((a, b) => b.watchHours - a.watchHours);
    } else if (analyticsSortBy === 'ratingDesc') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (analyticsSortBy === 'ratingAsc') {
      result.sort((a, b) => a.rating - b.rating);
    }

    return result;
  }, [mediaAnalyticsList, analyticsFilterType, analyticsSearch, analyticsSortBy]);

  // Export Analytics to CSV
  const exportAnalyticsCSV = () => {
    const headers = ['Peringkat', 'Judul Konten', 'Tipe', 'Genre', 'Rating', 'Total Views', 'Total Jam Tonton', 'Penyelesaian (%)', 'Jumlah Ulasan'];
    const sorted = [...mediaAnalyticsList].sort((a, b) => b.views - a.views);
    const rows = sorted.map((item, idx) => [
      idx + 1,
      item.title,
      item.type === 'movie' ? 'Film' : 'Serial TV',
      item.genres.join('; '),
      item.rating,
      item.views,
      item.watchHours,
      `${item.completionRate}%`,
      item.reviews?.length || 0
    ]);
    exportToCSV('liveeuy-analytics-report.csv', [headers, ...rows]);
    showToast('Laporan statistik & performa tayangan berhasil diekspor ke file CSV!');
  };

  // Export Tracking Logs to CSV
  const exportTrackingCSV = () => {
    const headers = ['Session ID', 'Cookie Token', 'IP Address', 'Kota', 'Negara', 'Device Type', 'Sistem Operasi', 'Browser', 'Resolusi Layar', 'Halaman Terakhir', 'Terakhir Aktif'];
    const rows = filteredTracking.map(sess => [
      sess.sessionId,
      sess.cookieToken,
      sess.ipAddress,
      sess.city || 'Indonesia',
      sess.country || 'ID',
      sess.deviceType,
      sess.os,
      sess.browser,
      sess.screenResolution,
      sess.currentPage,
      sess.lastActive
    ]);
    exportToCSV('liveeuy-visitor-logs.csv', [headers, ...rows]);
    showToast('Laporan log visitor, IP dan perangkat berhasil diekspor ke file CSV!');
  };

  // Hero Carousel Order Items
  const heroCarouselItems = useMemo(() => {
    return featuredOrder
      .map(id => allMedia.find(m => m.id === id))
      .filter((m): m is MediaItem => Boolean(m));
  }, [allMedia, featuredOrder]);

  const candidateForHero = useMemo(() => {
    return allMedia.filter(m => {
      const notInCarousel = !featuredOrder.includes(m.id);
      if (!notInCarousel) return false;
      if (bannerSearchTerm.trim()) {
        const q = bannerSearchTerm.toLowerCase();
        return m.title.toLowerCase().includes(q) || m.genres.some(g => g.toLowerCase().includes(q));
      }
      return true;
    });
  }, [allMedia, featuredOrder, bannerSearchTerm]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    if (auditLogFilter === 'all') return auditLogs;
    return auditLogs.filter(log => log.category === auditLogFilter);
  }, [auditLogs, auditLogFilter]);

  // Notification Banner
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormOriginalTitle('');
    setFormType('movie');
    setFormTagline('');
    setFormOverview('');
    setFormPosterUrl('https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80');
    setFormBackdropUrl('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80');
    setFormReleaseYear(2026);
    setFormCountry('Indonesia');
    setFormRating(8.8);
    setFormMatchScore(96);
    setFormAgeRating('16+');
    setFormDuration('2j 05m');
    setFormTotalSeasons(1);
    setFormQuality('4K UHD');
    setFormAudio('Dolby Atmos');
    setFormDirector('Sutradara Indonesia');
    setFormCast('Aktor Utama 1, Aktor Utama 2');
    setFormSelectedGenres(['Aksi', 'Fiksi Ilmiah']);
    setFormVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
    setFormTrailerUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    setFormIsFeatured(false);
    setFormIsTrending(true);
    setFormTopRank(undefined);
    setIsMediaModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: MediaItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormOriginalTitle(item.originalTitle || '');
    setFormType(item.type);
    setFormTagline(item.tagline);
    setFormOverview(item.overview);
    setFormPosterUrl(item.posterUrl);
    setFormBackdropUrl(item.backdropUrl);
    setFormReleaseYear(item.releaseYear);
    setFormCountry(item.country || 'Indonesia');
    setFormRating(item.rating);
    setFormMatchScore(item.matchScore);
    setFormAgeRating(item.ageRating);
    setFormDuration(item.duration || '2j 00m');
    setFormTotalSeasons(item.totalSeasons || 1);
    setFormQuality(item.quality);
    setFormAudio(item.audio);
    setFormDirector(item.director);
    setFormCast(item.cast.join(', '));
    setFormSelectedGenres(item.genres);
    setFormVideoUrl(item.videoUrl);
    setFormTrailerUrl(item.trailerUrl || '');
    setFormIsFeatured(item.isFeatured || false);
    setFormIsTrending(item.isTrending || false);
    setFormTopRank(item.topRank);
    setIsMediaModalOpen(true);
  };

  // Save Media Form
  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const slug = formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const castArray = formCast.split(',').map(c => c.trim()).filter(Boolean);

    if (editingItem) {
      // Update
      updateMedia(editingItem.id, {
        title: formTitle,
        originalTitle: formOriginalTitle,
        type: formType,
        tagline: formTagline,
        overview: formOverview,
        posterUrl: formPosterUrl,
        backdropUrl: formBackdropUrl,
        releaseYear: formReleaseYear,
        country: formCountry,
        rating: formRating,
        matchScore: formMatchScore,
        ageRating: formAgeRating,
        duration: formType === 'movie' ? formDuration : undefined,
        totalSeasons: formType === 'tv' ? formTotalSeasons : undefined,
        quality: formQuality,
        audio: formAudio,
        director: formDirector,
        cast: castArray,
        genres: formSelectedGenres,
        videoUrl: formVideoUrl,
        trailerUrl: formTrailerUrl,
        isFeatured: formIsFeatured,
        isTrending: formIsTrending,
        topRank: formTopRank
      });
      showToast(`Tayangan "${formTitle}" berhasil diperbarui!`);
    } else {
      // Create
      const newItem: MediaItem = {
        id: slug || `media-${Date.now()}`,
        title: formTitle,
        originalTitle: formOriginalTitle,
        type: formType,
        tagline: formTagline || 'Tayangan terbaru LiveEuy Cinema',
        overview: formOverview || 'Sinopsis belum ditambahkan.',
        posterUrl: formPosterUrl,
        backdropUrl: formBackdropUrl,
        releaseYear: formReleaseYear,
        country: formCountry,
        rating: formRating,
        matchScore: formMatchScore,
        ageRating: formAgeRating,
        duration: formType === 'movie' ? formDuration : undefined,
        totalSeasons: formType === 'tv' ? formTotalSeasons : undefined,
        quality: formQuality,
        audio: formAudio,
        director: formDirector || 'Sutradara',
        cast: castArray.length > 0 ? castArray : ['Aktor Utama'],
        genres: formSelectedGenres,
        videoUrl: formVideoUrl,
        trailerUrl: formTrailerUrl,
        isFeatured: formIsFeatured,
        isTrending: formIsTrending,
        topRank: formTopRank
      };
      addMedia(newItem);
      showToast(`Tayangan baru "${formTitle}" berhasil dipublikasikan ke katalog!`);
    }

    setIsMediaModalOpen(false);
  };

  // Add Episode to Active Series
  const handleAddEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeries || !epTitle.trim()) return;

    const newEp: Episode = {
      id: `ep-${Date.now()}`,
      episodeNumber: epNumber,
      seasonNumber: epSeasonNumber,
      title: epTitle,
      overview: epOverview || 'Sinopsis episode baru.',
      duration: epDuration,
      thumbnail: epThumbnail,
      videoUrl: epVideoUrl
    };

    const existingSeasons = activeSeries.seasons ? [...activeSeries.seasons] : [];
    let targetSeason = existingSeasons.find(s => s.seasonNumber === epSeasonNumber);

    if (targetSeason) {
      targetSeason.episodes.push(newEp);
    } else {
      targetSeason = {
        seasonNumber: epSeasonNumber,
        title: `Musim ${epSeasonNumber}`,
        episodes: [newEp]
      };
      existingSeasons.push(targetSeason);
    }

    updateMedia(activeSeries.id, {
      seasons: existingSeasons,
      totalSeasons: Math.max(activeSeries.totalSeasons || 1, epSeasonNumber)
    });

    setIsEpisodeModalOpen(false);
    setEpTitle('');
    setEpOverview('');
    showToast(`Episode "${epTitle}" berhasil ditambahkan ke ${activeSeries.title}!`);
  };

  // Delete Episode from Active Series
  const handleDeleteEpisode = (epId: string, seasonNumber: number) => {
    if (!activeSeries || !activeSeries.seasons) return;
    const updatedSeasons = activeSeries.seasons.map(s => {
      if (s.seasonNumber === seasonNumber) {
        return {
          ...s,
          episodes: s.episodes.filter(ep => ep.id !== epId)
        };
      }
      return s;
    });
    updateMedia(activeSeries.id, { seasons: updatedSeasons });
    showToast('Episode berhasil dihapus dari serial!');
  };

  // Filtered Media in Admin table
  const filteredAdminMedia = useMemo(() => {
    return allMedia.filter(item => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.director.toLowerCase().includes(q) ||
          Boolean(item.country && item.country.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allMedia, filterType, searchTerm]);

  // Copy cookie token helper
  const copyCookieToken = (token: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(token);
      showToast('Token cookie pelacak berhasil disalin!');
    }
  };

  // Helper for OS badge styling
  const getOSBadge = (os: string) => {
    if (os.includes('Mac') || os.includes('iOS')) {
      return { bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
    }
    if (os.includes('Windows')) {
      return { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    }
    if (os.includes('Android')) {
      return { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }
    if (os.includes('Linux')) {
      return { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
    return { bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
  };

  // Filtered Tracking sessions
  const filteredTracking = useMemo(() => {
    return visitorSessions.filter(sess => {
      if (trackingFilterOS !== 'all' && !sess.os.toLowerCase().includes(trackingFilterOS.toLowerCase())) {
        return false;
      }
      if (trackingSearch.trim()) {
        const q = trackingSearch.toLowerCase();
        return (
          sess.ipAddress.toLowerCase().includes(q) ||
          sess.cookieToken.toLowerCase().includes(q) ||
          sess.os.toLowerCase().includes(q) ||
          sess.browser.toLowerCase().includes(q) ||
          (sess.userEmail && sess.userEmail.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [visitorSessions, trackingFilterOS, trackingSearch]);

  // Sidebar Navigation Groups
  const sidebarNavGroups: SidebarNavGroup[] = useMemo(() => [
    {
      group: 'KONTEN & KATALOG',
      items: [
        {
          id: 'media',
          label: 'Katalog Media',
          desc: 'Kelola film & serial',
          icon: Film,
          badge: `${allMedia.length}`,
          badgeColor: 'bg-brand-500/20 text-brand-300 border-brand-500/30'
        },
        {
          id: 'banner',
          label: 'Banner & Pengumuman',
          desc: 'Hero carousel & broadcast promo',
          icon: Megaphone,
          badge: broadcastAnnouncement.isActive ? 'Live' : 'Off',
          badgeColor: broadcastAnnouncement.isActive
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            : 'bg-white/10 text-slate-400 border-white/10',
          pulse: broadcastAnnouncement.isActive
        },
        {
          id: 'episodes',
          label: 'Episode & Musim',
          desc: 'Manajemen serial TV',
          icon: Tv,
          badge: `${seriesList.length}`,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        },
      ]
    },
    {
      group: 'AUDIENCE & MONITORING',
      items: [
        {
          id: 'analytics',
          label: 'Statistik & Rating Tayangan',
          desc: 'Views terbanyak & rating terbaik/jelek',
          icon: BarChart3,
          badge: 'Tren',
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
        },
        {
          id: 'tracking',
          label: 'Pelacakan Cookie & IP',
          desc: 'Device, OS & sesi visitor',
          icon: Monitor,
          badge: `${visitorSessions.length}`,
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          pulse: true
        },
        {
          id: 'users',
          label: 'Pengguna & VIP',
          desc: 'Akun & status langganan',
          icon: Users,
          badge: `${usersList.length}`,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        },
        {
          id: 'reviews',
          label: 'Moderasi Ulasan',
          desc: 'Komentar komunitas',
          icon: MessageSquare,
          badge: '5 Baru',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
        },
      ]
    },
    {
      group: 'KONFIGURASI',
      items: [
        {
          id: 'system',
          label: 'Sistem & REST API',
          desc: 'Spring Boot & cache',
          icon: Settings,
          badge: 'Online',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        },
      ]
    }
  ], [allMedia.length, seriesList.length, visitorSessions.length, usersList.length]);

  const allNavItems: SidebarNavItem[] = useMemo(() => {
    return sidebarNavGroups.reduce<SidebarNavItem[]>((acc, g) => acc.concat(g.items), []);
  }, [sidebarNavGroups]);

  return (
    <div className="min-h-screen bg-[#07080d] text-white flex flex-col font-sans selection:bg-brand-500/30 selection:text-white">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-16 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2.5 animate-slide-up text-xs sm:text-sm font-bold border border-emerald-400/30">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ========================================================
          ENTERPRISE ADMIN TOPBAR / COMMAND BAR
          ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#090b12]/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shadow-xl">
        {/* Left: Sidebar Toggle + Brand + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Sidebar Toggle Button (Desktop) */}
          <button
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            className="hidden lg:flex p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all items-center justify-center cursor-pointer"
            title={isSidebarCollapsed ? "Tampilkan Sidebar Lengkap" : "Sembunyikan / Perkecil Sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4 text-brand-400" /> : <PanelLeftClose className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Mobile Drawer Toggle */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all cursor-pointer"
            title="Buka Navigasi Menu"
          >
            <Menu className="w-5 h-5 text-brand-400" />
          </button>

          {/* Brand Logo & Studio Title */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-secondary-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-white">LiveEuy</span>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">Studio</span>
              </div>
            </div>
          </div>

          <span className="text-slate-600 hidden md:inline">/</span>

          {/* Breadcrumb Context */}
          <div className="hidden md:flex items-center gap-1.5 text-xs truncate">
            <span className="text-slate-400">Admin Console</span>
            <span className="text-slate-600">/</span>
            <span className="font-bold text-brand-400 truncate">
              {activeModule === 'media' && 'Katalog & CMS Media'}
              {activeModule === 'banner' && 'Banner & Pengumuman'}
              {activeModule === 'episodes' && 'Episode & Musim Serial'}
              {activeModule === 'analytics' && 'Statistik & Rating Tayangan'}
              {activeModule === 'users' && 'Pengguna & Langganan VIP'}
              {activeModule === 'tracking' && 'Pelacakan Cookie, IP & Device'}
              {activeModule === 'reviews' && 'Moderasi Komunitas & Ulasan'}
              {activeModule === 'system' && 'Pengaturan Sistem & REST API'}
            </span>
          </div>
        </div>

        {/* Right: Quick Action Buttons, Server Indicators & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Server Status Pill (Desktop) */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Spring Boot :8080
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Go Auth :8081
            </span>
          </div>

          {/* Back to Public Web Button */}
          <button
            onClick={() => setCurrentTab('home')}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/10 hover:border-white/20 active:scale-95 cursor-pointer"
            title="Keluar dari Admin dan kembali ke Beranda Website Publik"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
            <span className="hidden sm:inline">Kunjungi Website</span>
            <span className="sm:hidden">Web</span>
          </button>

          {/* Quick Create Media Button */}
          <button
            onClick={openCreateModal}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-brand-600 to-secondary-500 hover:from-brand-500 hover:to-secondary-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Tambah judul tayangan baru ke katalog"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tambah Tayangan</span>
          </button>

          {/* Admin Profile Chip */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120"}
              alt="Admin"
              className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-md"
            />
            <div className="hidden lg:block text-left">
              <span className="text-xs font-bold text-white block leading-none">{user?.name || "Hafiz M."}</span>
              <span className="text-[10px] text-brand-400 font-semibold leading-none mt-0.5 block">Super Admin</span>
            </div>
            <button
              onClick={openDeviceSecurityModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors ml-1 cursor-pointer"
              title="Kelola Perangkat & Keamanan (Logout Semua Device)"
            >
              <Laptop className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm('Keluar dari sesi Administrator?')) {
                  logout();
                  setCurrentTab('home');
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1 cursor-pointer"
              title="Keluar Sesi Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          MOBILE / TABLET DRAWER OFF-CANVAS OVERLAY
          ======================================================== */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Slide-out Drawer */}
          <div className="relative w-80 max-w-[85vw] h-full bg-[#0a0c14] border-r border-white/10 p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar z-10 animate-slide-right">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-secondary-500 flex items-center justify-center shadow-md shadow-brand-500/30">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block leading-none">LiveEuy Studio</span>
                    <span className="text-[10px] text-brand-400 font-semibold leading-none mt-0.5 block">Admin Control Center</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Public Web Fast Jump */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block">
                  Navigasi Website Publik
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {publicWebNavItems.map(webItem => {
                    const WebIcon = webItem.icon;
                    return (
                      <button
                        key={webItem.id}
                        onClick={() => {
                          setIsMobileDrawerOpen(false);
                          setCurrentTab(webItem.id as any);
                        }}
                        className="flex items-center gap-2 p-2 rounded-xl text-left bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        <WebIcon className="w-3.5 h-3.5 text-brand-400" />
                        <span className="truncate">{webItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Admin Modules Navigation */}
              <div className="space-y-4">
                {sidebarNavGroups.map(group => (
                  <div key={group.group} className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block">
                      {group.group}
                    </span>
                    <div className="space-y-1">
                      {group.items.map(item => {
                        const Icon = item.icon;
                        const isActive = activeModule === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveModule(item.id);
                              setIsMobileDrawerOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                              isActive
                                ? 'bg-brand-600 text-white font-bold shadow-lg shadow-brand-600/30'
                                : 'text-slate-300 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon className="w-4 h-4" />
                              <div className="min-w-0">
                                <span className="text-xs font-semibold block truncate">{item.label}</span>
                                <span className="text-[10px] opacity-75 block truncate">{item.desc}</span>
                              </div>
                            </div>
                            {item.badge && (
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border font-mono ${item.badgeColor}`}>
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-white/10 space-y-2 mt-4">
              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  openCreateModal();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-secondary-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tayangan Baru</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          BODY: COLLAPSIBLE SIDEBAR + MAIN CONTENT AREA
          ======================================================== */}
      <div className="flex-1 flex min-w-0">

        {/* ========================================================
            DESKTOP COLLAPSIBLE SIDEBAR
            (Expanded: w-72 xl:w-80 | Collapsed: w-20 Icon-Only)
            ======================================================== */}
        <aside
          className={`hidden lg:flex flex-col justify-between shrink-0 sticky top-[53px] h-[calc(100vh-53px)] border-r border-white/10 bg-[#090b12]/95 backdrop-blur-xl p-3 transition-all duration-300 z-30 ${
            isSidebarCollapsed ? 'w-20' : 'w-72 xl:w-80'
          }`}
        >
          {/* Top Section */}
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
            
            {/* Header: Studio info (Expanded) or Expand Toggle (Collapsed) */}
            {!isSidebarCollapsed ? (
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-secondary-500 flex items-center justify-center shadow-md shadow-brand-500/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">CMS Engine v2.4</span>
                    <span className="text-[10px] text-slate-400 block">Super Administrator</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Perkecil Sidebar"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 pb-2 border-b border-white/10">
                <button
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 flex items-center justify-center transition-all cursor-pointer"
                  title="Perlebar Sidebar"
                >
                  <ChevronsRight className="w-4 h-4 text-brand-400" />
                </button>
              </div>
            )}

            {/* Quick Public Web Navigation */}
            {!isSidebarCollapsed ? (
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 block">
                  Navigasi Website Publik
                </span>
                <div className="space-y-1">
                  {publicWebNavItems.map(webItem => {
                    const WebIcon = webItem.icon;
                    return (
                      <button
                        key={webItem.id}
                        onClick={() => setCurrentTab(webItem.id as any)}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-white/5 transition-all group border border-transparent hover:border-white/5 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <WebIcon className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                          <span className="text-xs font-medium truncate">{webItem.label}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-2 flex flex-col items-center pb-2 border-b border-white/10">
                {publicWebNavItems.slice(0, 3).map(webItem => {
                  const WebIcon = webItem.icon;
                  return (
                    <div key={webItem.id} className="relative group">
                      <button
                        onClick={() => setCurrentTab(webItem.id as any)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <WebIcon className="w-4 h-4 text-brand-400" />
                      </button>
                      {/* Floating Tooltip */}
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-surface-900 border border-white/15 px-3 py-1.5 rounded-xl shadow-2xl whitespace-nowrap">
                        <span className="text-xs font-bold text-white block">{webItem.label}</span>
                        <span className="text-[10px] text-slate-400 block">{webItem.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sidebar Navigation Groups (Admin Modules) */}
            {!isSidebarCollapsed ? (
              <nav className="space-y-4 pt-1">
                {sidebarNavGroups.map(group => (
                  <div key={group.group} className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 block">
                      {group.group}
                    </span>
                    <div className="space-y-1">
                      {group.items.map(item => {
                        const Icon = item.icon;
                        const isActive = activeModule === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveModule(item.id)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all group cursor-pointer ${
                              isActive
                                ? 'bg-gradient-to-r from-brand-600/30 to-secondary-600/20 text-white font-bold border border-brand-500/50 shadow-lg shadow-brand-600/20'
                                : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                                isActive
                                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/40'
                                  : 'bg-surface-800 text-slate-400 group-hover:text-white group-hover:bg-surface-700'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-semibold block truncate leading-tight">
                                  {item.label}
                                </span>
                                <span className="text-[10px] text-slate-400 block truncate leading-tight mt-0.5">
                                  {item.desc}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                              {item.badge && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono ${item.badgeColor}`}>
                                  {item.pulse && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block mr-1 animate-pulse" />}
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                                isActive ? 'text-brand-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                              }`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            ) : (
              /* Collapsed Mini-Icons with Floating Tooltips */
              <nav className="space-y-2 flex flex-col items-center">
                {allNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  return (
                    <div key={item.id} className="relative group">
                      <button
                        onClick={() => setActiveModule(item.id)}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-tr from-brand-600 to-secondary-500 text-white shadow-lg shadow-brand-500/40 ring-2 ring-brand-400/50'
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>

                      {/* Floating Tooltip */}
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-surface-900 border border-white/15 px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap min-w-[140px]">
                        <span className="text-xs font-bold text-white block">{item.label}</span>
                        <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono mt-1 inline-block">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </nav>
            )}

          </div>

          {/* Bottom Section */}
          {!isSidebarCollapsed ? (
            <div className="pt-2 border-t border-white/10 space-y-2 mt-2">
              <button
                onClick={openCreateModal}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-secondary-500 hover:from-brand-500 hover:to-secondary-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tayangan Baru</span>
              </button>

              <div className="p-2.5 rounded-2xl bg-surface-950/70 border border-white/5 space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Spring Boot REST API</span>
                  <span className="text-emerald-400 font-bold">Online</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Pelacak Cookie</span>
                  <span className="text-cyan-400 font-bold font-mono">Aktif (365d)</span>
                </div>
              </div>

              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="w-full py-1.5 text-center text-[11px] text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
                <span>Sembunyikan Sidebar</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-white/10 flex flex-col items-center gap-2 mt-2">
              <button
                onClick={openCreateModal}
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-secondary-500 text-white flex items-center justify-center shadow-md shadow-brand-500/30 hover:scale-105 transition-all cursor-pointer"
                title="Tambah Tayangan Baru"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Munculkan Sidebar Lengkap"
              >
                <ChevronsRight className="w-4 h-4 text-brand-400" />
              </button>
            </div>
          )}
        </aside>

        {/* ========================================================
            RIGHT MAIN CONTENT AREA
            ======================================================== */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 2xl:p-10 space-y-6 cinema-layout-container overflow-y-auto">

          {/* Active Module Header Banner */}
          <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-surface-900 via-surface-800 to-indigo-950/40 border border-white/10 p-5 sm:p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-400">LiveEuy Studio</span>
                  <span className="text-slate-600">/</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Admin Console</span>
                  </span>
                  <span className="text-slate-600">/</span>
                  <span className="text-brand-400 font-bold capitalize">
                    {activeModule === 'media' && 'Katalog & CMS Media'}
                    {activeModule === 'banner' && 'Banner & Pengumuman'}
                    {activeModule === 'episodes' && 'Episode & Musim Serial'}
                    {activeModule === 'analytics' && 'Statistik & Rating Tayangan'}
                    {activeModule === 'users' && 'Pengguna & Langganan VIP'}
                    {activeModule === 'tracking' && 'Pelacakan Cookie, IP & Device'}
                    {activeModule === 'reviews' && 'Moderasi Komunitas & Ulasan'}
                    {activeModule === 'system' && 'Pengaturan Sistem & REST API'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  {activeModule === 'media' && 'Manajemen Katalog Film & Serial'}
                  {activeModule === 'banner' && 'Banner Pengumuman & Hero Carousel'}
                  {activeModule === 'episodes' && 'Episode & Musim Serial TV'}
                  {activeModule === 'analytics' && 'Statistik & Analisis Rating Tayangan'}
                  {activeModule === 'users' && 'Manajemen Akun & Langganan VIP'}
                  {activeModule === 'tracking' && 'Pelacakan Cookie, IP & Perangkat Pengunjung'}
                  {activeModule === 'reviews' && 'Moderasi Ulasan & Komunitas'}
                  {activeModule === 'system' && 'Pengaturan Server & Database Matrix'}
                </h1>
                <p className="text-xs text-slate-400">
                  Kelola konten, data penonton, serta konfigurasi server dengan tertata dan cepat melalui studio pusat kontrol.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setCurrentTab('home')}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Kunjungi Website</span>
                </button>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-secondary-500 hover:from-brand-500 hover:to-secondary-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Tayangan</span>
                </button>
              </div>
            </div>
          </section>

          {/* Mobile Module Selector Bar (Visible on mobile/tablet) */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {allNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                      : 'bg-surface-800/80 text-slate-300 hover:text-white border border-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 5 KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            <div className="bg-surface-900/80 p-3.5 rounded-2xl border border-white/10 space-y-1 shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Katalog Media</span>
              <span className="text-xl sm:text-2xl font-black text-brand-400">{allMedia.length} Judul</span>
            </div>

            <div className="bg-surface-900/80 p-3.5 rounded-2xl border border-white/10 space-y-1 shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Serial & Musim</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">{seriesList.length} Serial</span>
            </div>

            <div className="bg-surface-900/80 p-3.5 rounded-2xl border border-white/10 space-y-1 shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Akun Pengguna</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400">{usersList.length} Akun</span>
            </div>

            <div className="bg-surface-900/80 p-3.5 rounded-2xl border border-white/10 space-y-1 shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Sesi Cookie & IP</span>
              <span className="text-xl sm:text-2xl font-black text-cyan-400 flex items-center gap-1">
                <span>{visitorSessions.length}</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">Live</span>
              </span>
            </div>

            <div className="bg-surface-900/80 p-3.5 rounded-2xl border border-white/10 space-y-1 shadow-lg col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Status Server</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Spring Boot 8080</span>
              </span>
            </div>
          </div>

          {/* ========================================================
              MODULE 1: KATALOG & CMS MEDIA
              ======================================================== */}
          {activeModule === 'media' && (
            <section className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-800/60 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari judul tayangan atau sutradara..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-surface-900/90 p-1 rounded-xl border border-white/5 text-xs">
              {[
                { id: 'all', label: 'Semua Format' },
                { id: 'movie', label: 'Film Saja' },
                { id: 'tv', label: 'Serial TV' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilterType(opt.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                    filterType === opt.id ? 'bg-brand-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Media Table */}
          <div className="rounded-3xl bg-surface-800/40 border border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-surface-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Tayangan</th>
                  <th className="py-3.5 px-3">Tipe</th>
                  <th className="py-3.5 px-3">Rating</th>
                  <th className="py-3.5 px-3">Status Sorotan</th>
                  <th className="py-3.5 px-3">Kualitas</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAdminMedia.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Search className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="font-bold text-white text-sm">Tidak ada tayangan ditemukan</p>
                        <p className="text-xs">Coba ubah kata kunci pencarian atau ganti filter format.</p>
                        <button
                          type="button"
                          onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                          className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md mt-2"
                        >
                          Reset Pencarian
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAdminMedia.map(item => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    {/* Media item info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-10 h-14 object-cover rounded-lg flex-shrink-0 shadow"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-white truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">{item.title}</h4>
                          <span className="text-[11px] text-slate-400 block">
                            {item.releaseYear} • {item.country ? `${item.country} • ` : ''}{item.director}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.type === 'movie' ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {item.type === 'movie' ? 'Film' : 'Serial'}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-3">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {item.rating}
                      </span>
                    </td>

                    {/* Highlights Toggles */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Featured Toggle */}
                        <button
                          onClick={() => {
                            updateMedia(item.id, { isFeatured: !item.isFeatured });
                            showToast(`Status Featured untuk "${item.title}" diubah!`);
                          }}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            item.isFeatured
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-white/5 text-slate-500 border-white/5'
                          }`}
                          title="Tampilkan di Hero Banner"
                        >
                          Hero ⭐
                        </button>

                        {/* Trending Toggle */}
                        <button
                          onClick={() => {
                            updateMedia(item.id, { isTrending: !item.isTrending });
                            showToast(`Status Trending untuk "${item.title}" diubah!`);
                          }}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            item.isTrending
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-white/5 text-slate-500 border-white/5'
                          }`}
                          title="Tampilkan di Baris Trending"
                        >
                          Trending 🔥
                        </button>

                        {item.topRank && (
                          <span className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold text-[10px]">
                            #{item.topRank}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Quality */}
                    <td className="py-3 px-3">
                      <span className="text-xs text-slate-300 font-mono">{item.quality}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetail(item)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                          title="Pratinjau Detail"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white transition-colors"
                          title="Edit Tayangan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus "${item.title}" dari katalog?`)) {
                              deleteMedia(item.id);
                              showToast(`"${item.title}" telah dihapus.`);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                          title="Hapus Tayangan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================
          MODULE: BANNER & PENGUMUMAN (BROADCAST & HERO CAROUSEL)
          ======================================================== */}
      {activeModule === 'banner' && (
        <section className="space-y-6 animate-fade-in">
          
          {/* Header & Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-1">
                <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Pusat Siaran Pengumuman & Hero Carousel</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Manajemen Banner & Urutan Hero Carousel</h2>
              <p className="text-xs text-slate-400">
                Atur pengumuman promo/event siaran langsung yang tampil di atas website penonton serta urutan film di slider utama beranda.
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleBroadcastAnnouncement}
                className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
                  broadcastAnnouncement.isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-white/10 text-slate-300 border border-white/10 hover:bg-white/15'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${broadcastAnnouncement.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>Banner Siaran: {broadcastAnnouncement.isActive ? 'Sedang Tayang' : 'Dinonaktifkan'}</span>
              </button>
            </div>
          </div>

          {/* Grid Layout: 2 Columns on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUMN 1: Broadcast Announcement Editor (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-surface-800/60 p-5 sm:p-6 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Siaran Pengumuman / Running Text</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Tampil di bagian paling atas navbar penonton.
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                    broadcastAnnouncement.isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/10 text-slate-400'
                  }`}>
                    {broadcastAnnouncement.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                {/* Live Preview Card */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Pratinjau Nyata (Live Preview):
                  </span>
                  <div className={`p-2.5 rounded-2xl border border-white/15 text-xs text-white shadow-xl ${
                    announcementForm.type === 'promo'
                      ? 'bg-gradient-to-r from-amber-600 via-brand-600 to-indigo-700'
                      : announcementForm.type === 'event'
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700'
                      : announcementForm.type === 'info'
                      ? 'bg-gradient-to-r from-brand-600 via-indigo-600 to-blue-700'
                      : 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-700'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-white/20 text-white border border-white/30 truncate flex-shrink-0">
                          {announcementForm.badge || 'BADGE'}
                        </span>
                        <span className="font-bold text-xs truncate">
                          {announcementForm.title || 'Judul Pengumuman'}
                        </span>
                      </div>
                      {announcementForm.actionText && (
                        <span className="px-2 py-0.5 rounded-full bg-white text-slate-900 text-[10px] font-bold flex-shrink-0">
                          {announcementForm.actionText}
                        </span>
                      )}
                    </div>
                    {announcementForm.description && (
                      <p className="text-[10px] text-white/80 mt-1 line-clamp-1">
                        {announcementForm.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Editor Form */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Gaya & Tema Warna Banner
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'promo', label: 'Promo VIP (Gold)', bg: 'bg-gradient-to-r from-amber-600 to-brand-600' },
                        { id: 'event', label: 'Event Rilis (Hijau)', bg: 'bg-gradient-to-r from-emerald-600 to-teal-600' },
                        { id: 'info', label: 'Info Sistem (Biru)', bg: 'bg-gradient-to-r from-brand-600 to-blue-600' },
                        { id: 'alert', label: 'Pemberitahuan (Merah)', bg: 'bg-gradient-to-r from-rose-600 to-pink-600' },
                      ].map(theme => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setAnnouncementForm(prev => ({ ...prev, type: theme.id as any }))}
                          className={`p-2 rounded-xl text-left text-xs font-semibold text-white border transition-all ${
                            announcementForm.type === theme.id
                              ? 'border-white ring-2 ring-white/30 scale-[1.02] ' + theme.bg
                              : 'border-white/10 bg-surface-900/80 hover:border-white/20'
                          }`}
                        >
                          {theme.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Teks Badge
                    </label>
                    <input
                      type="text"
                      value={announcementForm.badge}
                      onChange={e => setAnnouncementForm(prev => ({ ...prev, badge: e.target.value }))}
                      placeholder="Contoh: PROMO SPESIAL, RILIS EKSKLUSIF"
                      className="w-full bg-surface-900 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Judul Pengumuman
                    </label>
                    <input
                      type="text"
                      value={announcementForm.title}
                      onChange={e => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Contoh: Diskon 50% Langganan VIP Ultra Akhir Pekan Ini"
                      className="w-full bg-surface-900 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Keterangan / Subtitle Lengkap
                    </label>
                    <textarea
                      rows={2}
                      value={announcementForm.description}
                      onChange={e => setAnnouncementForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Contoh: Buka tayangan 4K UHD, audio Dolby Atmos, dan tonton bebas iklan di 4 perangkat."
                      className="w-full bg-surface-900 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Teks Tombol Aksi
                      </label>
                      <input
                        type="text"
                        value={announcementForm.actionText}
                        onChange={e => setAnnouncementForm(prev => ({ ...prev, actionText: e.target.value }))}
                        placeholder="Contoh: Klaim Sekarang"
                        className="w-full bg-surface-900 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Halaman Tujuan
                      </label>
                      <select
                        value={announcementForm.targetTab}
                        onChange={e => setAnnouncementForm(prev => ({ ...prev, targetTab: e.target.value as any }))}
                        className="w-full bg-surface-900 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="home">Beranda</option>
                        <option value="movies">Katalog Film</option>
                        <option value="tv">Serial TV</option>
                        <option value="trending">Trending</option>
                        <option value="watchlist">Koleksi Saya</option>
                      </select>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleSaveAnnouncement}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                      {isAnnouncementSaved ? (
                        <>
                          <Check className="w-4 h-4 text-slate-950" />
                          <span>Berhasil Disimpan & Diterbitkan!</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-slate-950" />
                          <span>Simpan & Terapkan Banner</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: Hero Carousel Slider Manager (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-surface-800/60 p-5 sm:p-6 rounded-3xl border border-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                      <Film className="w-4 h-4 text-brand-400" />
                      <span>Urutan Film di Hero Banner Beranda</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Film pada posisi #1 akan otomatis tampil pertama saat penonton membuka website.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    {heroCarouselItems.length} Film Aktif
                  </span>
                </div>

                {/* Ordered List of Carousel Items */}
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
                  {heroCarouselItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-surface-900/90 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Position Badge */}
                        <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center flex-shrink-0 ${
                          index === 0
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                            : 'bg-surface-800 text-slate-300 border border-white/10'
                        }`}>
                          #{index + 1}
                        </div>

                        {/* Thumbnail */}
                        <img
                          src={item.backdropUrl || item.posterUrl}
                          alt={item.title}
                          className="w-16 h-10 object-cover rounded-lg flex-shrink-0 shadow border border-white/10"
                        />

                        {/* Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-xs sm:text-sm truncate group-hover:text-brand-400 transition-colors">
                              {item.title}
                            </h4>
                            {index === 0 && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                UTAMA
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span>{item.releaseYear}</span>
                            <span>•</span>
                            <span className="capitalize">{item.type === 'movie' ? 'Film' : 'Serial'}</span>
                            <span>•</span>
                            <span className="text-amber-400 font-semibold">★ {item.rating}</span>
                            <span>•</span>
                            <span className="truncate max-w-[120px]">{item.genres.slice(0, 2).join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Reorder and Remove Controls */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          disabled={index === 0}
                          onClick={() => moveFeaturedItem(item.id, 'up')}
                          className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 disabled:opacity-30 disabled:hover:bg-surface-800 text-slate-200 transition-colors"
                          title="Geser Naik"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={index === heroCarouselItems.length - 1}
                          onClick={() => moveFeaturedItem(item.id, 'down')}
                          className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 disabled:opacity-30 disabled:hover:bg-surface-800 text-slate-200 transition-colors"
                          title="Geser Turun"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleFeaturedItem(item.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors ml-1"
                          title="Keluarkan dari Hero Banner"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add More Media to Hero Banner Section */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-300">
                      Tambahkan Film Lain ke Hero Banner:
                    </span>
                    <div className="relative w-44">
                      <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={bannerSearchTerm}
                        onChange={e => setBannerSearchTerm(e.target.value)}
                        placeholder="Cari judul film..."
                        className="w-full bg-surface-900 border border-white/10 rounded-xl pl-7 pr-2.5 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {candidateForHero.slice(0, 6).map(cand => (
                      <div
                        key={cand.id}
                        className="p-2 rounded-xl bg-surface-900 border border-white/5 flex items-center justify-between gap-2 hover:border-white/15 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={cand.posterUrl}
                            alt={cand.title}
                            className="w-7 h-10 object-cover rounded flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{cand.title}</p>
                            <span className="text-[10px] text-slate-400">★ {cand.rating} • {cand.releaseYear}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleFeaturedItem(cand.id)}
                          className="px-2 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm flex-shrink-0"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Pin</span>
                        </button>
                      </div>
                    ))}
                    {candidateForHero.length === 0 && (
                      <div className="col-span-2 text-center py-4 text-xs text-slate-500">
                        Semua film sudah ada di carousel atau tidak cocok dengan pencarian.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Section 3: Audit Trail Log Aktivitas Admin */}
          <div className="bg-surface-800/60 p-5 sm:p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400" />
                  <span>Log Rekam Jejak Aktivitas Administrator (Audit Trail)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Mencatat seluruh aksi admin (tambah konten, ubah banner, ekspor data, reset cookie) secara transparan demi keamanan sistem.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter Category */}
                <div className="flex items-center gap-1 bg-surface-900 border border-white/10 p-1 rounded-xl text-xs">
                  {(['all', 'banner', 'media', 'system'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setAuditLogFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg capitalize text-[10px] font-bold transition-colors ${
                        auditLogFilter === cat ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat === 'all' ? 'Semua' : cat}
                    </button>
                  ))}
                </div>

                <button
                  onClick={clearAuditLogs}
                  className="px-3 py-1 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 text-[10px] font-bold transition-colors"
                >
                  Bersihkan Log
                </button>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Aktor Administrator</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Tindakan / Aksi</th>
                    <th className="py-2.5 px-3">Detail & Keterangan</th>
                    <th className="py-2.5 px-3 text-right">Alamat IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAuditLogs.slice(0, 10).map(log => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{log.actor}</div>
                        <div className="text-[10px] text-slate-400">{log.actorEmail}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.category === 'banner'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : log.category === 'media'
                            ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                            : log.category === 'tracking'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {log.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 text-[11px] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl truncate">
                        {log.detail}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400 text-[11px]">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  ))}
                  {filteredAuditLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                        Belum ada aktivitas admin yang tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </section>
      )}

      {/* ========================================================
          MODULE 2: EPISODE & MUSIM
          ======================================================== */}
      {activeModule === 'episodes' && (
        <section className="space-y-6">
          <div className="bg-surface-800/60 p-4 sm:p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Pilih Serial TV yang Dikelola
                </h3>
                <p className="text-xs text-slate-400">
                  Kelola struktur episode mingguan, thumbnail cuplikan, dan link video streaming.
                </p>
              </div>

              {/* Series Selector */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {seriesList.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSeriesId(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      (activeSeries?.id === s.id)
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-surface-900 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Series Seasons & Episodes */}
            {activeSeries && (
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Struktur Musim: {activeSeries.title}
                    </span>
                    <span className="text-xs text-brand-400 font-bold">
                      ({activeSeries.totalSeasons || 1} Musim)
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setEpSeasonNumber(1);
                      setEpNumber((activeSeries.seasons?.[0]?.episodes.length || 0) + 1);
                      setIsEpisodeModalOpen(true);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Episode Baru</span>
                  </button>
                </div>

                {/* Seasons Loop */}
                {activeSeries.seasons && activeSeries.seasons.length > 0 ? (
                  <div className="space-y-4">
                    {activeSeries.seasons.map(season => (
                      <div key={season.seasonNumber} className="bg-surface-900/80 rounded-2xl p-4 border border-white/5 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                          <span>{season.title} ({season.episodes.length} Episode)</span>
                          <span className="text-slate-500 font-mono">Musim #{season.seasonNumber}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                          {season.episodes.map(ep => (
                            <div key={ep.id} className="p-3 rounded-xl bg-surface-800/80 border border-white/5 flex gap-3 items-center group relative hover:border-white/20 transition-all">
                              <img src={ep.thumbnail} alt={ep.title} className="w-20 aspect-video rounded-lg object-cover flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-bold text-white group-hover:text-brand-400 truncate">
                                  Ep {ep.episodeNumber}: {ep.title}
                                </h5>
                                <span className="text-[10px] text-slate-400 block">{ep.duration}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Hapus episode "${ep.title}" dari musim ${season.seasonNumber}?`)) {
                                    handleDeleteEpisode(ep.id, season.seasonNumber);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                title="Hapus Episode"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 glass-panel rounded-2xl">
                    Belum ada episode terdaftar untuk serial ini. Klik tombol Tambah Episode di atas.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================
          MODULE: STATISTIK PENONTON & PERFORMA RATING
          ======================================================== */}
      {activeModule === 'analytics' && (
        <section className="space-y-6 animate-fade-in">
          
          {/* Section Header & Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold mb-1">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Statistik Penonton & Rating Analitik</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Statistik Penonton & Performa Rating</h2>
              <p className="text-xs text-slate-400">
                Pantau film & serial paling banyak ditonton, komparasi rating tertinggi vs terendah, serta kepuasan audiens.
              </p>
            </div>

            {/* Action & Summary Pills */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={exportAnalyticsCSV}
                className="px-3.5 py-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow hover:scale-105 active:scale-95"
                title="Unduh laporan lengkap analitik penonton ke CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor CSV</span>
              </button>

              <div className="flex items-center gap-2 bg-surface-800/80 border border-white/5 p-2 rounded-2xl flex-wrap">
                <div className="px-3 py-1.5 bg-surface-900 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Views</span>
                  <span className="text-sm font-black text-cyan-300">{(totalViewsAccumulated / 1000).toFixed(1)}K</span>
                </div>
                <div className="px-3 py-1.5 bg-surface-900 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Jam Tonton</span>
                  <span className="text-sm font-black text-brand-300">{(totalWatchHoursAccumulated / 1000).toFixed(1)}K jam</span>
                </div>
                <div className="px-3 py-1.5 bg-surface-900 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Rata-rata Rating</span>
                  <span className="text-sm font-black text-amber-400">★ {averageRatingAcrossCatalog}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 1: 3 Highlight Cards: Juara Rating, Rating Terendah, dan Paling Banyak Ditonton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. BEST RATED SHOWCASE */}
            {bestRatedMedia && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/40 via-surface-900 to-surface-900 border border-emerald-500/30 p-5 shadow-2xl flex flex-col justify-between group">
                <div className="absolute top-0 right-0 p-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1 shadow-sm">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Rating Tertinggi</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-black block">
                    🏆 JUARA RATING TERBAIK
                  </span>

                  <div className="flex items-center gap-3">
                    <img
                      src={bestRatedMedia.posterUrl}
                      alt={bestRatedMedia.title}
                      className="w-14 h-20 rounded-xl object-cover shadow-lg border border-white/10 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-base font-black text-white truncate leading-tight group-hover:text-emerald-300 transition-colors">
                        {bestRatedMedia.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                        {bestRatedMedia.director} • {bestRatedMedia.releaseYear}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 inline-flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                          <span>{bestRatedMedia.rating} / 10</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 font-mono">
                          {bestRatedMedia.matchScore}% Match
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Total Ditonton: <strong className="text-white font-mono">{bestRatedMedia.views.toLocaleString('id-ID')}x</strong>
                  </span>
                  <button
                    onClick={() => openDetail(bestRatedMedia)}
                    className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold inline-flex items-center gap-1"
                  >
                    <span>Buka Detail</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. LOWEST RATED SHOWCASE (Perlu Evaluasi) */}
            {lowestRatedMedia && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950/40 via-surface-900 to-surface-900 border border-rose-500/30 p-5 shadow-2xl flex flex-col justify-between group">
                <div className="absolute top-0 right-0 p-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1 shadow-sm">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Perlu Evaluasi</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] text-rose-400 uppercase tracking-widest font-black block">
                    ⚠️ RATING TERENDAH
                  </span>

                  <div className="flex items-center gap-3">
                    <img
                      src={lowestRatedMedia.posterUrl}
                      alt={lowestRatedMedia.title}
                      className="w-14 h-20 rounded-xl object-cover shadow-lg border border-white/10 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-base font-black text-white truncate leading-tight group-hover:text-rose-300 transition-colors">
                        {lowestRatedMedia.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                        {lowestRatedMedia.director} • {lowestRatedMedia.releaseYear}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-rose-500/30 text-rose-200 border border-rose-400/40 inline-flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                          <span>{lowestRatedMedia.rating} / 10</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">
                          {lowestRatedMedia.matchScore}% Match
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Total Ditonton: <strong className="text-white font-mono">{lowestRatedMedia.views.toLocaleString('id-ID')}x</strong>
                  </span>
                  <button
                    onClick={() => openEditModal(lowestRatedMedia)}
                    className="text-rose-400 hover:text-rose-300 text-[11px] font-bold inline-flex items-center gap-1"
                  >
                    <span>Evaluasi Konten</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* 3. MOST WATCHED SHOWCASE */}
            {mostWatchedMedia && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/40 via-surface-900 to-surface-900 border border-brand-500/30 p-5 shadow-2xl flex flex-col justify-between group">
                <div className="absolute top-0 right-0 p-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/30 inline-flex items-center gap-1 shadow-sm">
                    <Flame className="w-3.5 h-3.5 text-brand-400" />
                    <span>Paling Sering Ditonton</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] text-brand-400 uppercase tracking-widest font-black block">
                    🔥 PALING BANYAK DITONTON
                  </span>

                  <div className="flex items-center gap-3">
                    <img
                      src={mostWatchedMedia.posterUrl}
                      alt={mostWatchedMedia.title}
                      className="w-14 h-20 rounded-xl object-cover shadow-lg border border-white/10 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-base font-black text-white truncate leading-tight group-hover:text-brand-300 transition-colors">
                        {mostWatchedMedia.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                        {mostWatchedMedia.type === 'movie' ? 'Film Bioskop' : 'Serial TV'} • {mostWatchedMedia.releaseYear}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{mostWatchedMedia.views.toLocaleString('id-ID')} Penonton</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Total Durasi: <strong className="text-white font-mono">{mostWatchedMedia.watchHours.toLocaleString('id-ID')} Jam</strong>
                  </span>
                  <button
                    onClick={() => openPlayer(mostWatchedMedia)}
                    className="text-brand-400 hover:text-brand-300 text-[11px] font-bold inline-flex items-center gap-1"
                  >
                    <span>Tes Putar</span>
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Row 2: Visual Comparison: Top 5 Most Watched (Progress Bar) & Head-to-Head 3 Terbaik vs 3 Terendah */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT (7 cols): TOP 5 PALING BANYAK DITONTON DENGAN PROGRESS BAR */}
            <div className="lg:col-span-7 bg-surface-800/50 p-5 sm:p-6 rounded-3xl border border-white/5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-400" />
                    <span>Top 5 Tayangan Paling Banyak Ditonton</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Berdasarkan volume streaming kumulatif pengguna</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                  Realtime Views
                </span>
              </div>

              <div className="space-y-3.5">
                {top5MostWatched.map((item, index) => {
                  const maxViews = top5MostWatched[0]?.views || 1;
                  const percent = Math.round((item.views / maxViews) * 100);
                  return (
                    <div key={item.id} className="space-y-1.5 p-2 rounded-2xl hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                            index === 0 ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30' :
                            index === 1 ? 'bg-slate-300 text-black' :
                            index === 2 ? 'bg-amber-700 text-white' :
                            'bg-white/10 text-slate-400'
                          }`}>
                            {index + 1}
                          </span>
                          <img
                            src={item.posterUrl}
                            alt={item.title}
                            className="w-7 h-9 rounded object-cover flex-shrink-0"
                          />
                          <span className="font-bold text-white truncate max-w-[180px] sm:max-w-[260px] md:max-w-[320px] lg:max-w-[360px] xl:max-w-[480px]">
                            {item.title}
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/10 text-slate-400 font-mono hidden sm:inline">
                            {item.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-right flex-shrink-0">
                          <span className="font-mono font-bold text-cyan-300 text-xs">
                            {item.views.toLocaleString('id-ID')} views
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                            ({item.watchHours.toLocaleString('id-ID')} jam)
                          </span>
                        </div>
                      </div>

                      {/* Relative Visual Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-surface-900 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-600 via-secondary-500 to-cyan-400 transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT (5 cols): HEAD TO HEAD 3 TERBAIK VS 3 TERENDAH */}
            <div className="lg:col-span-5 bg-surface-800/50 p-5 sm:p-6 rounded-3xl border border-white/5 space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>Komparasi Rating: Terbaik vs Terendah</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Peringkat kepuasan penonton 1 - 10</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  
                  {/* 3 Terbaik */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>3 Terbaik (Top)</span>
                    </div>
                    <div className="space-y-2">
                      {top3HighestRated.map((m, idx) => (
                        <div key={m.id} className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-400">#{idx + 1}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-500/30 text-emerald-200">
                              ★ {m.rating}
                            </span>
                          </div>
                          <p className="text-white font-bold text-[11px] truncate">{m.title}</p>
                          <span className="text-[9px] text-slate-400 block">{m.matchScore}% Match</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3 Terendah */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-[11px] font-extrabold text-rose-400 uppercase tracking-wider">
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>3 Terendah (Lowest)</span>
                    </div>
                    <div className="space-y-2">
                      {top3LowestRated.map((m, idx) => (
                        <div key={m.id} className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-rose-400">#{idx + 1}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-rose-500/30 text-rose-200">
                              ★ {m.rating}
                            </span>
                          </div>
                          <p className="text-white font-bold text-[11px] truncate">{m.title}</p>
                          <span className="text-[9px] text-slate-400 block">{m.matchScore}% Match</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Rating Distribution Breakdown Bar */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">Distribusi Rating Katalog</span>
                  <span className="text-white font-mono text-[10px]">{allMedia.length} total tayangan</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                  <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                    <span className="block font-bold text-emerald-300">★ 9.0+</span>
                    <span className="font-mono text-white text-xs">{ratingDistribution.d9}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30">
                    <span className="block font-bold text-cyan-300">★ 8.0 - 8.9</span>
                    <span className="font-mono text-white text-xs">{ratingDistribution.d8}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30">
                    <span className="block font-bold text-amber-300">★ 7.0 - 7.9</span>
                    <span className="font-mono text-white text-xs">{ratingDistribution.d7}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30">
                    <span className="block font-bold text-rose-300">&lt; 7.0</span>
                    <span className="font-mono text-white text-xs">{ratingDistribution.dLow}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Row 3: Filter Bar & Detailed Data Table */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-800/60 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={analyticsSearch}
                onChange={e => setAnalyticsSearch(e.target.value)}
                placeholder="Cari tayangan untuk melihat analitik..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              {/* Type Filter */}
              <div className="flex items-center gap-1 bg-surface-900 p-1 rounded-xl border border-white/5">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'movie', label: 'Film' },
                  { id: 'tv', label: 'Serial TV' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setAnalyticsFilterType(opt.id as any)}
                    className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                      analyticsFilterType === opt.id ? 'bg-brand-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-surface-900 px-3 py-1.5 rounded-xl border border-white/5 text-slate-300">
                <span className="text-[11px] text-slate-400">Urutkan:</span>
                <select
                  value={analyticsSortBy}
                  onChange={e => setAnalyticsSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="views" className="bg-surface-900 text-white">🔥 Paling Banyak Ditonton (Views)</option>
                  <option value="watchHours" className="bg-surface-900 text-white">⏱️ Jam Tonton Terbanyak</option>
                  <option value="ratingDesc" className="bg-surface-900 text-white">🌟 Rating Tertinggi (Terbaik)</option>
                  <option value="ratingAsc" className="bg-surface-900 text-white">⚠️ Rating Terendah (Terjelek)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Analytics Data Table */}
          <div className="rounded-3xl bg-surface-800/40 border border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-surface-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Peringkat & Tayangan</th>
                  <th className="py-3.5 px-3">Tipe</th>
                  <th className="py-3.5 px-3">Total Penonton (Views)</th>
                  <th className="py-3.5 px-3">Total Jam Tonton</th>
                  <th className="py-3.5 px-3">Rating Audiens</th>
                  <th className="py-3.5 px-3">Match Score</th>
                  <th className="py-3.5 px-3">Status Sentimen</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAnalyticsMedia.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <BarChart3 className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="font-bold text-white text-sm">Tidak ada data tayangan</p>
                        <p className="text-xs">Coba ubah kata kunci pencarian atau ganti filter format.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAnalyticsMedia.map((item, index) => {
                    const isTopRating = item.rating >= 9.0;
                    const isLowRating = item.rating < 7.0;
                    return (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        {/* Peringkat & Poster + Judul */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-center font-mono font-bold text-slate-500 text-xs">
                              #{index + 1}
                            </span>
                            <img
                              src={item.posterUrl}
                              alt={item.title}
                              className="w-10 h-14 rounded-lg object-cover shadow border border-white/10 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-white text-xs sm:text-sm block truncate hover:text-brand-400 transition-colors">
                                {item.title}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {item.genres.slice(0, 2).join(', ')} • {item.releaseYear}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Tipe */}
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300 uppercase">
                            {item.type === 'movie' ? 'Film' : 'Serial'}
                          </span>
                        </td>

                        {/* Total Penonton (Views) */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <span className="font-mono text-xs font-black text-cyan-300 block">
                              {item.views.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] text-slate-400 block">penonton</span>
                          </div>
                        </td>

                        {/* Total Jam Tonton */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <span className="font-mono text-xs font-bold text-slate-200 block">
                              {item.watchHours.toLocaleString('id-ID')} jam
                            </span>
                            <span className="text-[10px] text-emerald-400 font-semibold block">
                              {item.completionRate}% completion
                            </span>
                          </div>
                        </td>

                        {/* Rating Audiens */}
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-black inline-flex items-center gap-1 border ${
                            isTopRating ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            isLowRating ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                            'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            <Star className={`w-3 h-3 ${isTopRating ? 'fill-emerald-400 text-emerald-400' : isLowRating ? 'fill-rose-400 text-rose-400' : 'fill-amber-400 text-amber-400'}`} />
                            <span>{item.rating}</span>
                          </span>
                        </td>

                        {/* Match Score */}
                        <td className="py-3 px-3">
                          <span className="font-mono text-xs font-bold text-slate-300">
                            {item.matchScore}%
                          </span>
                        </td>

                        {/* Status Sentimen */}
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.sentimentColor}`}>
                            {item.sentiment}
                          </span>
                        </td>

                        {/* Aksi */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openPlayer(item)}
                              className="p-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white transition-colors"
                              title="Putar Video Preview"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                            <button
                              onClick={() => openDetail(item)}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                              title="Lihat Detail Tayangan"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                              title="Edit Tayangan"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </section>
      )}

      {/* ========================================================
          MODULE 3: PENGGUNA & LANGGANAN VIP
          ======================================================== */}
      {activeModule === 'users' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Daftar Pengguna & Status Langganan</h3>
              <p className="text-xs text-slate-400">Atur tier keanggotaan dan hak akses streaming pengguna.</p>
            </div>
          </div>

          <div className="rounded-3xl bg-surface-800/40 border border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-surface-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Pengguna</th>
                  <th className="py-3.5 px-3">Role</th>
                  <th className="py-3.5 px-3">Tier Paket</th>
                  <th className="py-3.5 px-3">Maks Perangkat</th>
                  <th className="py-3.5 px-3">Total Jam Tonton</th>
                  <th className="py-3.5 px-4 text-right">Ubah Paket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersList.map(usr => (
                  <tr key={usr.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={usr.avatar} alt={usr.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <span className="font-bold text-white block">{usr.name}</span>
                          <span className="text-[11px] text-slate-400">{usr.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        usr.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-slate-300'
                      }`}>
                        {usr.role === 'admin' ? 'Admin' : 'Member'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        {usr.tier}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      {usr.devices} Perangkat
                    </td>

                    <td className="py-3 px-3 font-mono text-emerald-400 font-bold">
                      {usr.watchHours} Jam
                    </td>

                    <td className="py-3 px-4 text-right">
                      <select
                        value={usr.tier}
                        onChange={(e) => {
                          const newTier = e.target.value as any;
                          setUsersList(prev => prev.map(u => u.id === usr.id ? { ...u, tier: newTier } : u));
                          showToast(`Paket pengguna ${usr.name} diubah menjadi ${newTier}!`);
                        }}
                        className="bg-surface-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-brand-500"
                      >
                        <option value="Free Guest">Free Guest</option>
                        <option value="VIP Standard">VIP Standard</option>
                        <option value="VIP Cinema Ultra">VIP Cinema Ultra</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================
          MODULE 4: PELACAKAN COOKIE, ALAMAT IP & DEVICE PENGUNJUNG
          ======================================================== */}
      {activeModule === 'tracking' && (
        <section className="space-y-6">
          {/* Header & Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-500/20 text-secondary-300 border border-secondary-500/30 text-xs font-bold mb-1">
                <Cookie className="w-3.5 h-3.5" />
                <span>Pelacak Cookie Sesi & Perangkat Real-Time</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Pelacakan Cookie, Alamat IP & Perangkat Pengunjung
              </h3>
              <p className="text-xs text-slate-400">
                Memantau cookie sesi pengunjung (365 hari), alamat IP publik, jenis perangkat (Desktop/HP/Tablet), dan sistem operasi (OS).
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={exportTrackingCSV}
                className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-2 transition-all shadow hover:scale-105 active:scale-95"
                title="Ekspor seluruh daftar sesi cookie dan alamat IP pengunjung ke file CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Log CSV</span>
              </button>

              <button
                onClick={() => {
                  refreshTracking();
                  showToast('Data pelacakan perangkat dan IP berhasil diperbarui!');
                }}
                className="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-white text-xs font-bold flex items-center gap-2 border border-white/10 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Perbarui Data (Refresh)</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Yakin ingin mereset cookie pelacak perangkat ini? Token cookie baru akan dibuat secara otomatis.')) {
                    resetTracking();
                    showToast('Cookie pelacak berhasil direset dan dibuat ulang!');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-2 border border-rose-500/30 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Cookie Saya</span>
              </button>
            </div>
          </div>

          {/* Current Device Live Card */}
          {currentSession && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-brand-950 via-surface-900 to-secondary-950/40 border border-brand-500/30 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Perangkat Anda Saat Ini (Live Sesi Terlacak)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400 flex-shrink-0">
                      {currentSession.deviceType === 'Mobile' ? (
                        <Smartphone className="w-6 h-6" />
                      ) : currentSession.deviceType === 'Tablet' ? (
                        <TabletIcon className="w-6 h-6" />
                      ) : (
                        <Monitor className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-black text-white">
                        {currentSession.os} • {currentSession.browser}
                      </h4>
                      <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                        <span>Tipe: <strong className="text-white">{currentSession.deviceType}</strong></span>
                        <span>•</span>
                        <span>Resolusi: <strong className="text-white font-mono">{currentSession.screenResolution}</strong></span>
                        <span>•</span>
                        <span>Bahasa: <strong className="text-white font-mono">{currentSession.language}</strong></span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side live details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:w-1/2">
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Alamat IP Terlacak</span>
                    <span className="text-sm font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      {currentSession.ipAddress}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{currentSession.city}, {currentSession.country}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Cookie Token Sesi</span>
                      <button
                        onClick={() => copyCookieToken(currentSession.cookieToken)}
                        className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-1 font-bold"
                        title="Salin Cookie Token"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Salin</span>
                      </button>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300 block truncate" title={currentSession.cookieToken}>
                      {currentSession.cookieToken}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Masa Aktif: 365 Hari (SameSite=Lax)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-800/60 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={trackingSearch}
                onChange={e => setTrackingSearch(e.target.value)}
                placeholder="Cari IP, Cookie Token, OS, atau Browser..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-surface-900/90 p-1 rounded-xl border border-white/5 text-xs">
              {[
                { id: 'all', label: 'Semua OS' },
                { id: 'macOS', label: 'macOS' },
                { id: 'Windows', label: 'Windows' },
                { id: 'iOS', label: 'iOS' },
                { id: 'Android', label: 'Android' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setTrackingFilterOS(opt.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                    trackingFilterOS === opt.id ? 'bg-brand-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visitor Sessions Table */}
          <div className="rounded-3xl bg-surface-800/40 border border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-surface-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Pengunjung / Sesi Cookie</th>
                  <th className="py-3.5 px-3">Alamat IP & Lokasi</th>
                  <th className="py-3.5 px-3">Sistem Operasi (OS)</th>
                  <th className="py-3.5 px-3">Tipe Device</th>
                  <th className="py-3.5 px-3">Browser & Resolusi</th>
                  <th className="py-3.5 px-3">Halaman Terakhir</th>
                  <th className="py-3.5 px-4 text-right">Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTracking.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Monitor className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="font-bold text-white text-sm">Tidak ada sesi ditemukan</p>
                        <p className="text-xs">Coba ubah filter OS atau kata kunci pencarian.</p>
                        <button
                          type="button"
                          onClick={() => { setTrackingSearch(''); setTrackingFilterOS('all'); }}
                          className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md mt-2"
                        >
                          Reset Filter
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTracking.map(sess => {
                    const osBadge = getOSBadge(sess.os);
                    return (
                      <tr
                        key={sess.sessionId}
                        className={`transition-colors ${
                          sess.isCurrentDevice ? 'bg-brand-600/10 hover:bg-brand-600/15' : 'hover:bg-white/5'
                        }`}
                      >
                        {/* Cookie & User */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] font-bold text-white truncate max-w-[150px] sm:max-w-[200px] md:max-w-[260px] lg:max-w-[320px] xl:max-w-[400px] block" title={sess.cookieToken}>
                                {sess.cookieToken}
                              </span>
                              <button
                                onClick={() => copyCookieToken(sess.cookieToken)}
                                className="text-slate-500 hover:text-white transition-colors"
                                title="Salin Cookie Token"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {sess.isCurrentDevice && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  Perangkat Ini
                                </span>
                              )}
                              {sess.userEmail ? (
                                <span className="text-[10px] text-brand-400 font-semibold">{sess.userEmail}</span>
                              ) : (
                                <span className="text-[10px] text-slate-500">Tamu (Guest)</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* IP Address */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <span className="font-mono text-xs font-bold text-cyan-300 block">{sess.ipAddress}</span>
                            <span className="text-[10px] text-slate-400 block">{sess.city || 'Indonesia'}</span>
                          </div>
                        </td>

                        {/* OS */}
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border inline-flex items-center gap-1.5 ${osBadge.bg}`}>
                            {sess.os}
                          </span>
                        </td>

                        {/* Device Type */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-200">
                            {sess.deviceType === 'Mobile' ? (
                              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                            ) : sess.deviceType === 'Tablet' ? (
                              <TabletIcon className="w-3.5 h-3.5 text-cyan-400" />
                            ) : (
                              <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                            )}
                            <span>{sess.deviceType}</span>
                          </span>
                        </td>

                        {/* Browser & Resolution */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <span className="text-xs text-white block">{sess.browser}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{sess.screenResolution}</span>
                          </div>
                        </td>

                        {/* Active Page */}
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300 uppercase">
                            {sess.currentPage}
                          </span>
                        </td>

                        {/* Last Active */}
                        <td className="py-3 px-4 text-right">
                          <span className="text-xs text-slate-400 block">{sess.lastActive}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================
          MODULE 5: MODERASI KOMUNITAS & ULASAN
          ======================================================== */}
      {activeModule === 'reviews' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Ulasan Komunitas & Rating Masuk</h3>
              <p className="text-xs text-slate-400">Pantau dan moderasi komentar pengguna di setiap film.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {allMedia.flatMap(m => (m.reviews || []).map(r => ({ ...r, mediaTitle: m.title, mediaId: m.id }))).map((rev, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-surface-800/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={rev.avatar} alt={rev.author} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <h5 className="text-xs font-bold text-white">{rev.author}</h5>
                      <span className="text-[10px] text-brand-400">Pada: {rev.mediaTitle}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    ★ {rev.rating}/10
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                  <span>{rev.date}</span>
                  <button
                    onClick={() => showToast(`Ulasan oleh "${rev.author}" diverifikasi aman!`)}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    Verifikasi Aman
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================
          MODULE 5: PENGATURAN SISTEM & API
          ======================================================== */}
      {activeModule === 'system' && (
        <section className="space-y-6">
          <div className="bg-surface-800/60 p-6 rounded-3xl border border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-brand-400" />
                  <span>Konfigurasi Engine & Integrasi REST API Database</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Status konektivitas live Spring Boot, Golang Auth Service, dan basis data PostgreSQL.
                </p>
              </div>

              <button
                onClick={runBackendDiagnostic}
                disabled={isPingingBackend}
                className="px-4 py-2 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/30 text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPingingBackend ? 'animate-spin' : ''}`} />
                <span>{isPingingBackend ? 'Sedang Memeriksa...' : 'Uji Koneksi Backend Sekarang'}</span>
              </button>
            </div>

            {/* Server Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Spring Boot Catalog Card */}
              <div className="p-4 rounded-2xl bg-surface-900 border border-white/5 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <Database className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-white block">Spring Boot Catalog Service</span>
                      <span className="text-[10px] text-slate-400">Katalog Film, Serial, Episode & Rating</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${
                    backendPingResult.catalogOnline 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${backendPingResult.catalogOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    {backendPingResult.catalogOnline ? 'Tersambung (Online)' : 'Offline (Fallback Aktif)'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-white font-mono text-xs bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                    <span>{backendPingResult.catalogUrl}</span>
                    {backendPingResult.catalogLatency !== null && (
                      <span className="text-emerald-400 text-[10px] font-bold">{backendPingResult.catalogLatency} ms</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    {backendPingResult.catalogOnline 
                      ? 'CRUD Katalog terhubung langsung ke database PostgreSQL/H2.' 
                      : 'Layanan offline — perubahan admin tetap aman disimpan di browser (LocalStorage) tanpa error.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <a
                    href="http://localhost:8081/swagger-ui.html"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-bold"
                  >
                    <span>Buka Swagger UI Docs</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  {backendPingResult.testedAt && (
                    <span className="text-[10px] text-slate-500">Diuji: {backendPingResult.testedAt}</span>
                  )}
                </div>
              </div>

              {/* Golang Auth Service Card */}
              <div className="p-4 rounded-2xl bg-surface-900 border border-white/5 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-white block">Golang Auth Service</span>
                      <span className="text-[10px] text-slate-400">Otentikasi JWT, Registrasi & Login</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${
                    backendPingResult.authOnline 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${backendPingResult.authOnline ? 'bg-cyan-400 animate-pulse' : 'bg-rose-400'}`} />
                    {backendPingResult.authOnline ? 'Tersambung (Online)' : 'Offline (Fallback Aktif)'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-white font-mono text-xs bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                    <span>http://localhost:8080/api/health</span>
                    {backendPingResult.authLatency !== null && (
                      <span className="text-cyan-400 text-[10px] font-bold">{backendPingResult.authLatency} ms</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Layanan microservice Go Gin untuk otentikasi login, register, dan enkripsi password bcrypt.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">Port: 8080 (Gin Engine)</span>
                  {backendPingResult.testedAt && (
                    <span className="text-[10px] text-slate-500">Diuji: {backendPingResult.testedAt}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Database Sync Matrix Table */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-400" />
                <span>Matriks Status Sinkronisasi Fitur Admin ke Database</span>
              </h4>

              <div className="rounded-2xl bg-surface-900 border border-white/5 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-white/5">
                    <tr>
                      <th className="py-2.5 px-4">Fitur Admin</th>
                      <th className="py-2.5 px-3">Status Sinkronisasi</th>
                      <th className="py-2.5 px-4">Target Layanan & Database</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-4 font-semibold text-white">Katalog Media (Tambah, Edit, Hapus)</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Tersinkron Otomatis</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-400">Spring Boot REST API (`/api/v1/media`) + PostgreSQL</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-4 font-semibold text-white">Watchlist & Durasi Tontonan</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Tersinkron Otomatis</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-400">Backend API (`/api/v1/user/progress` & `/watchlist`)</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-4 font-semibold text-white">Ulasan Penonton (Reviews)</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Tersinkron Otomatis</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-400">Backend API (`/api/v1/media/{'{id}'}/reviews`)</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-4 font-semibold text-white">Daftar Pengguna & Hak Akses</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <AlertCircle className="w-3 h-3" />
                          <span>Otentikasi Go Aktif / CMS Lokal</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-400">Auth Service Go (`/login`, `/register`); API list user dari backend belum ada</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-4 font-semibold text-white">Banner Hero & Siaran Global</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          <Layers className="w-3 h-3" />
                          <span>Client CMS (LocalStorage)</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-400">Penyimpanan browser admin (belum ada tabel banner di backend)</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-4 font-semibold text-white">Pelacakan Cookie, IP & Device</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          <Cookie className="w-3 h-3" />
                          <span>Client Session Tracker</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-400">Modul cookie/session browser pengunjung (`cookieTracker.ts`)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reset Data Button Card */}
            <div className="p-4 rounded-2xl bg-surface-900 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Reset Data Demo Standar</span>
                <p className="text-slate-400 text-xs">
                  Mengembalikan seluruh katalog film, serial, dan data mock ke kondisi awal pabrik.
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Yakin ingin mereset seluruh data katalog ke default mock?')) {
                    resetMediaToDefault();
                    showToast('Seluruh data katalog berhasil direset ke default!');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold transition-colors flex items-center gap-2 whitespace-nowrap text-xs cursor-pointer self-start sm:self-auto border border-rose-500/30"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Katalog ke Default</span>
              </button>
            </div>
          </div>
        </section>
      )}

        </main>
      </div>

      {/* ========================================================
          MEDIA CREATE / EDIT MODAL
          ======================================================== */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl rounded-3xl bg-surface-900 border border-white/10 p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <button
              onClick={() => setIsMediaModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white mb-4">
              {editingItem ? `Edit Tayangan: ${editingItem.title}` : 'Tambah Tayangan Baru ke Katalog'}
            </h3>

            <form onSubmit={handleSaveMedia} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Judul Tayangan *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="Contoh: Cyberpunk: Neo Nusantara"
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Judul Asli/Internasional</label>
                  <input
                    type="text"
                    value={formOriginalTitle}
                    onChange={e => setFormOriginalTitle(e.target.value)}
                    placeholder="Contoh: Neo Nusantara 2099"
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Tipe Media</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="movie">Film Bioskop</option>
                    <option value="tv">Serial TV</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Negara Asal</label>
                  <select
                    value={formCountry}
                    onChange={e => setFormCountry(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {COUNTRIES.filter(c => c !== 'Semua Negara').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Tahun Rilis</label>
                  <input
                    type="number"
                    value={formReleaseYear}
                    onChange={e => setFormReleaseYear(Number(e.target.value))}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Rating (0 - 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formRating}
                    onChange={e => setFormRating(Number(e.target.value))}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Kategori Usia</label>
                  <select
                    value={formAgeRating}
                    onChange={e => setFormAgeRating(e.target.value as any)}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="SU">SU (Semua Umur)</option>
                    <option value="13+">13+</option>
                    <option value="16+">16+</option>
                    <option value="18+">18+</option>
                    <option value="21+">21+</option>
                  </select>
                </div>
              </div>

              {/* Durasi & Resolusi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formType === 'movie' ? (
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Durasi Film (misal: 2j 10m)</label>
                    <input
                      type="text"
                      value={formDuration}
                      onChange={e => setFormDuration(e.target.value)}
                      placeholder="Contoh: 2j 15m"
                      className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Jumlah Musim</label>
                    <input
                      type="number"
                      min="1"
                      value={formTotalSeasons}
                      onChange={e => setFormTotalSeasons(Number(e.target.value))}
                      className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Resolusi</label>
                    <select
                      value={formQuality}
                      onChange={e => setFormQuality(e.target.value as any)}
                      className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="4K UHD">4K UHD</option>
                      <option value="Dolby Vision">Dolby Vision</option>
                      <option value="HD">HD</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Format Audio</label>
                    <select
                      value={formAudio}
                      onChange={e => setFormAudio(e.target.value as any)}
                      className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="Dolby Atmos">Dolby Atmos</option>
                      <option value="5.1 Surround">5.1 Surround</option>
                      <option value="Stereo">Stereo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Genre Multi-Select Chips */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-surface-800/60 border border-white/5">
                <label className="font-semibold text-slate-300 block">Pilihan Genre (Klik untuk memilih multi-genre) *</label>
                <div className="flex flex-wrap gap-1.5">
                  {GENRES.filter(g => g !== 'Semua Genre').map(genre => {
                    const isSelected = formSelectedGenres.includes(genre);
                    return (
                      <button
                        type="button"
                        key={genre}
                        onClick={() => {
                          if (isSelected) {
                            if (formSelectedGenres.length > 1) {
                              setFormSelectedGenres(formSelectedGenres.filter(g => g !== genre));
                            }
                          } else {
                            setFormSelectedGenres([...formSelectedGenres, genre]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-brand-600 text-white shadow-md'
                            : 'bg-surface-900 text-slate-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {isSelected ? `✓ ${genre}` : genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Tagline / Slogan</label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={e => setFormTagline(e.target.value)}
                  placeholder="Slogan promosi tayangan..."
                  className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Sinopsis Alur Cerita *</label>
                <textarea
                  rows={3}
                  value={formOverview}
                  onChange={e => setFormOverview(e.target.value)}
                  placeholder="Ringkasan sinopsis..."
                  className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">URL Gambar Poster (2:3)</label>
                  <input
                    type="text"
                    value={formPosterUrl}
                    onChange={e => setFormPosterUrl(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">URL Backdrop Widescreen (16:9)</label>
                  <input
                    type="text"
                    value={formBackdropUrl}
                    onChange={e => setFormBackdropUrl(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Video Stream & Trailer URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">URL Stream Video (MP4 / HLS) *</label>
                  <input
                    type="text"
                    required
                    value={formVideoUrl}
                    onChange={e => setFormVideoUrl(e.target.value)}
                    placeholder="https://...mp4"
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">URL Trailer Cuplikan (Opsional)</label>
                  <input
                    type="text"
                    value={formTrailerUrl}
                    onChange={e => setFormTrailerUrl(e.target.value)}
                    placeholder="https://...mp4"
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Live Media & Backdrop Preview Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-surface-800/60 border border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-black/60 border border-white/10 flex-shrink-0">
                    <img
                      src={formPosterUrl}
                      alt="Poster Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Poster Preview (2:3)</span>
                    <span className="text-xs font-bold text-white truncate block">{formTitle || 'Judul Tayangan'}</span>
                    <span className="text-[10px] text-brand-400 font-mono truncate block">
                      {formReleaseYear} • {formQuality} • {formAgeRating}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-white/5 pt-2 sm:pt-0 sm:pl-3 min-w-0">
                  <div className="w-24 aspect-video rounded-lg overflow-hidden bg-black/60 border border-white/10 flex-shrink-0">
                    <img
                      src={formBackdropUrl || formPosterUrl}
                      alt="Backdrop Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Backdrop 16:9 Widescreen</span>
                    <span className="text-xs font-medium text-slate-300 truncate block">{formTagline || formTitle || 'Pratinjau Layar Lebar'}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">16:9 Aspect Ratio</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Sutradara</label>
                  <input
                    type="text"
                    value={formDirector}
                    onChange={e => setFormDirector(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Pemeran (Pisahkan koma)</label>
                  <input
                    type="text"
                    value={formCast}
                    onChange={e => setFormCast(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-surface-800/80 border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={e => setFormIsFeatured(e.target.checked)}
                    className="rounded bg-surface-900 border-white/10 text-brand-600 focus:ring-0"
                  />
                  <span className="font-semibold text-white">Tampil di Hero Carousel ⭐</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsTrending}
                    onChange={e => setFormIsTrending(e.target.checked)}
                    className="rounded bg-surface-900 border-white/10 text-rose-600 focus:ring-0"
                  />
                  <span className="font-semibold text-white">Trending 🔥</span>
                </label>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Peringkat:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="1-10"
                    value={formTopRank || ''}
                    onChange={e => setFormTopRank(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-16 bg-surface-900 border border-white/10 rounded-lg px-2 py-1 text-white text-center"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-600/30"
                >
                  Simpan Tayangan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          EPISODE CREATE MODAL
          ======================================================== */}
      {isEpisodeModalOpen && activeSeries && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg lg:max-w-2xl xl:max-w-3xl rounded-3xl bg-surface-900 border border-white/10 p-6 sm:p-8 shadow-2xl space-y-4">
            <button
              onClick={() => setIsEpisodeModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white">
              Tambah Episode Baru: {activeSeries.title}
            </h3>

            <form onSubmit={handleAddEpisode} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Nomor Musim</label>
                  <input
                    type="number"
                    min="1"
                    value={epSeasonNumber}
                    onChange={e => setEpSeasonNumber(Number(e.target.value))}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Nomor Episode</label>
                  <input
                    type="number"
                    min="1"
                    value={epNumber}
                    onChange={e => setEpNumber(Number(e.target.value))}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Judul Episode *</label>
                <input
                  type="text"
                  required
                  value={epTitle}
                  onChange={e => setEpTitle(e.target.value)}
                  placeholder="Contoh: Sinyal Hitam dari Batavia Hilir"
                  className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Durasi (misal: 48m)</label>
                <input
                  type="text"
                  value={epDuration}
                  onChange={e => setEpDuration(e.target.value)}
                  className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Sinopsis Episode</label>
                <textarea
                  rows={2}
                  value={epOverview}
                  onChange={e => setEpOverview(e.target.value)}
                  className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">URL Thumbnail Episode (16:9)</label>
                <input
                  type="text"
                  value={epThumbnail}
                  onChange={e => setEpThumbnail(e.target.value)}
                  className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Live 16:9 Thumbnail Preview */}
              {epThumbnail && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-800/60 border border-white/5">
                  <div className="w-24 aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 flex-shrink-0">
                    <img
                      src={epThumbnail}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'; }}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Preview Thumbnail 16:9</span>
                    <span className="text-xs font-bold text-white truncate block">{epTitle || 'Judul Episode'}</span>
                    <span className="text-[10px] text-brand-400 font-mono">Musim {epSeasonNumber} • Ep {epNumber} • {epDuration || '45m'}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEpisodeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  Simpan Episode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
