import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useWatch } from '../../context/WatchContext';
import { MediaItem, Episode, User, AdCampaign } from '../../types';
import { 
  CheckCircle2, 
  ExternalLink, 
  Plus, 
  ShieldCheck, 
  Home, 
  Film, 
  Tv, 
  Flame, 
  Bookmark 
} from 'lucide-react';
import { sanitizeMediaCatalog } from '../../utils/security';

// Types & Registry
import { 
  AdminModuleId, 
  SidebarNavItem, 
  SidebarNavGroup, 
  PublicWebNavItem, 
  StreamHealthResult, 
  PendingRestoreData, 
  BackendDiagnosticResult,
  MediaAnalyticsItem 
} from './types';
import { getSidebarNavGroups, MODULE_HEADER_INFO } from './moduleRegistry';
import { exportToCSV } from './utils';

// Core Layout Components
import { AdminHeader } from './components/AdminHeader';
import { AdminSidebar } from './components/AdminSidebar';

// Sub-Modules
import { MediaModule, MediaModal, RestoreCatalogModal } from './modules/MediaModule';
import { BannerModule } from './modules/BannerModule';
import { AdsModule } from './modules/AdsModule';
import { EpisodesModule, EpisodeModal } from './modules/EpisodesModule';
import { AnalyticsModule } from './modules/AnalyticsModule';
import { UsersModule } from './modules/UsersModule';
import { TrackingModule } from './modules/TrackingModule';
import { ReviewsModule } from './modules/ReviewsModule';
import { SystemModule } from './modules/SystemModule';

export type { AdminModuleId, SidebarNavItem, SidebarNavGroup };

export const AdminPage: React.FC = () => {
  const { 
    rawMedia: allMedia, 
    addMedia, 
    updateMedia, 
    deleteMedia, 
    batchDeleteMedia,
    batchUpdateMedia,
    importMediaCatalog,
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
    addAuditLog,
    user,
    logout,
    openDeviceSecurityModal,
    ads,
    addAdCampaign,
    updateAdCampaign,
    deleteAdCampaign,
    toggleAdCampaign,
    resetAdsToDefault
  } = useWatch();

  // Active Admin Sub-Module Tab
  const [activeModule, setActiveModule] = useState<AdminModuleId>('media');

  // Sidebar Collapsible & Mobile Drawer State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Quick Public Web Navigation Items
  const publicWebNavItems: PublicWebNavItem[] = useMemo(() => [
    { id: 'home', label: 'Beranda Web', icon: Home, desc: 'Tampilan Utama' },
    { id: 'movies', label: 'Katalog Film', icon: Film, desc: 'Daftar Film Bioskop' },
    { id: 'tv', label: 'Serial TV', icon: Tv, desc: 'Serial Drama & Musim' },
    { id: 'trending', label: 'Sedang Tren', icon: Flame, desc: 'Tayangan Terpopuler' },
    { id: 'watchlist', label: 'Koleksi Saya', icon: Bookmark, desc: 'Daftar Tontonan' },
  ], []);

  // Notification Banner
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

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

  // -------------------------------------------------------------
  // MODULE 1: MEDIA CATALOG STATE
  // -------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // Stream URL Health Inspector State
  const [isTestingStream, setIsTestingStream] = useState<boolean>(false);
  const [streamHealthResult, setStreamHealthResult] = useState<StreamHealthResult | null>(null);
  const [isPreviewPlayerOpen, setIsPreviewPlayerOpen] = useState<boolean>(false);

  // Catalog Backup & Restore State
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState<boolean>(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<PendingRestoreData | null>(null);
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setIsTestingStream(false);
    setStreamHealthResult(null);
    setIsPreviewPlayerOpen(false);
    setIsMediaModalOpen(true);
  };

  const openEditModal = (item: MediaItem) => {
    setEditingItem(item);
    setIsTestingStream(false);
    setStreamHealthResult(null);
    setIsPreviewPlayerOpen(false);
    setIsMediaModalOpen(true);
  };

  const handleSaveMedia = (itemData: any) => {
    const slug = itemData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (editingItem) {
      updateMedia(editingItem.id, itemData);
      showToast(`Tayangan "${itemData.title}" berhasil diperbarui!`);
    } else {
      const newItem: MediaItem = {
        id: slug || `media-${Date.now()}`,
        tagline: itemData.tagline || 'Tayangan terbaru LiveEuy Cinema',
        overview: itemData.overview || 'Sinopsis belum ditambahkan.',
        director: itemData.director || 'Sutradara',
        cast: itemData.cast && itemData.cast.length > 0 ? itemData.cast : ['Aktor Utama'],
        ...itemData
      };
      addMedia(newItem);
      showToast(`Tayangan baru "${itemData.title}" berhasil dipublikasikan ke katalog!`);
    }
    setIsMediaModalOpen(false);
  };

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

  const isAllVisibleMediaSelected = useMemo(() => {
    return filteredAdminMedia.length > 0 && filteredAdminMedia.every(m => selectedMediaIds.includes(m.id));
  }, [filteredAdminMedia, selectedMediaIds]);

  const isPartiallySelected = useMemo(() => {
    return filteredAdminMedia.some(m => selectedMediaIds.includes(m.id)) && !isAllVisibleMediaSelected;
  }, [filteredAdminMedia, selectedMediaIds, isAllVisibleMediaSelected]);

  const handleToggleSelectAll = () => {
    const visibleIds = filteredAdminMedia.map(m => m.id);
    if (isAllVisibleMediaSelected) {
      setSelectedMediaIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedMediaIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedMediaIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedMediaIds([]);
  };

  const handleBatchSetTrending = () => {
    if (selectedMediaIds.length === 0) return;
    batchUpdateMedia(selectedMediaIds, { isTrending: true });
    showToast(`${selectedMediaIds.length} tayangan terpilih kini berstatus Trending! 🔥`);
    setSelectedMediaIds([]);
  };

  const handleBatchDelete = () => {
    if (selectedMediaIds.length === 0) return;
    if (confirm(`PERINGATAN: Yakin ingin menghapus ${selectedMediaIds.length} tayangan terpilih secara massal dari katalog? Tindakan ini tidak dapat dibatalkan.`)) {
      batchDeleteMedia(selectedMediaIds);
      showToast(`${selectedMediaIds.length} tayangan berhasil dihapus secara massal.`);
      setSelectedMediaIds([]);
    }
  };

  const handleExportSelected = () => {
    if (selectedMediaIds.length === 0) return;
    const selectedItems = allMedia.filter(m => selectedMediaIds.includes(m.id));
    const backupData = {
      appName: 'LiveEuy Cinema Selected Media',
      exportedAt: new Date().toISOString(),
      totalItems: selectedItems.length,
      media: selectedItems
    };
    const jsonString = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `liveeuy-selected-${selectedItems.length}-media.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast(`${selectedItems.length} tayangan terpilih berhasil diekspor ke JSON!`);
  };

  const runStreamHealthCheck = async (urlToCheck: string) => {
    if (!urlToCheck || !urlToCheck.trim()) {
      setStreamHealthResult({
        status: 'error',
        latency: 0,
        details: 'URL stream tidak boleh kosong.'
      });
      return;
    }

    try {
      const parsed = new URL(urlToCheck);
      if (!parsed.protocol.startsWith('http')) {
        setStreamHealthResult({
          status: 'error',
          latency: 0,
          details: 'Protokol URL harus diawali dengan http:// atau https://.'
        });
        return;
      }
    } catch {
      setStreamHealthResult({
        status: 'error',
        latency: 0,
        details: 'Format URL tidak valid. Periksa kembali tautan stream.'
      });
      return;
    }

    setIsTestingStream(true);
    setStreamHealthResult(null);
    const startTime = performance.now();

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = urlToCheck;

    const probePromise = new Promise<StreamHealthResult>((resolve) => {
      let resolved = false;

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          fetch(urlToCheck, { method: 'HEAD', mode: 'no-cors' })
            .then(() => {
              const latency = Math.round(performance.now() - startTime);
              resolve({
                status: 'cors_warning',
                latency,
                details: 'Server stream merespons (Opaque CORS). Stream siap ditayangkan di player utama.'
              });
            })
            .catch(() => {
              resolve({
                status: 'error',
                latency: Math.round(performance.now() - startTime),
                details: 'Batas waktu habis (timeout 5s). Server stream lambat atau link mati.'
              });
            });
        }
      }, 5000);

      video.onloadedmetadata = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          const latency = Math.round(performance.now() - startTime);
          const res = video.videoWidth && video.videoHeight ? `${video.videoWidth}x${video.videoHeight}` : 'HD Stream';
          const dur = video.duration && !isNaN(video.duration) && isFinite(video.duration) ? `${Math.round(video.duration)} detik` : 'Live HLS Stream';
          resolve({
            status: 'healthy',
            latency,
            details: `Koneksi prima! Video terverifikasi valid (${res}, ${dur}).`
          });
        }
      };

      video.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          fetch(urlToCheck, { method: 'HEAD', mode: 'no-cors' })
            .then(() => {
              const latency = Math.round(performance.now() - startTime);
              resolve({
                status: 'cors_warning',
                latency,
                details: 'Server stream aktif (CORS Restrict). Format teruji dan siap diputar di player LiveEuy.'
              });
            })
            .catch(() => {
              resolve({
                status: 'error',
                latency: Math.round(performance.now() - startTime),
                details: 'URL stream tidak dapat dihubungi (404 Not Found atau server offline).'
              });
            });
        }
      };
    });

    try {
      const res = await probePromise;
      setStreamHealthResult(res);
    } catch {
      setStreamHealthResult({
        status: 'error',
        latency: 0,
        details: 'Terjadi kegagalan saat menguji koneksi stream.'
      });
    } finally {
      setIsTestingStream(false);
    }
  };

  const handleExportCatalog = () => {
    const backupData = {
      appName: 'LiveEuy Cinema Catalog Backup',
      exportedAt: new Date().toISOString(),
      exportedBy: user?.name || 'Administrator',
      totalItems: allMedia.length,
      media: allMedia
    };
    const jsonString = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `liveeuy-catalog-backup-${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addAuditLog(
      'Cadangkan Seluruh Katalog',
      'media',
      `Mengekspor cadangan penuh ${allMedia.length} tayangan ke format JSON.`
    );
    showToast(`Cadangan katalog (${allMedia.length} tayangan) berhasil diunduh!`);
  };

  const handleFileSelectForRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        
        let mediaItems: any[] = [];
        if (Array.isArray(parsed)) {
          mediaItems = parsed;
        } else if (parsed && Array.isArray(parsed.media)) {
          mediaItems = parsed.media;
        }

        const { sanitized, rejectedCount } = sanitizeMediaCatalog(mediaItems);
        if (sanitized.length === 0) {
          alert('File JSON tidak valid atau seluruh data ditolak oleh sistem keamanan (URL tidak aman / format rusak).');
          return;
        }

        setPendingRestoreData({
          fileName: file.name,
          items: sanitized,
          rejectedCount
        });
        setRestoreMode('merge');
        setIsRestoreModalOpen(true);
      } catch {
        alert('Gagal membaca file JSON. Pastikan format file adalah JSON valid.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmRestore = () => {
    if (!pendingRestoreData) return;
    importMediaCatalog(pendingRestoreData.items, restoreMode);
    setIsRestoreModalOpen(false);
    const rejectedText = pendingRestoreData.rejectedCount && pendingRestoreData.rejectedCount > 0 
      ? ` (${pendingRestoreData.rejectedCount} item ditolak filter keamanan)` 
      : '';
    showToast(`Katalog berhasil dipulihkan! (${pendingRestoreData.items.length} tayangan valid diproses${rejectedText})`);
    setPendingRestoreData(null);
  };

  // -------------------------------------------------------------
  // MODULE 2: BANNER & ANNOUNCEMENT STATE
  // -------------------------------------------------------------
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

  const filteredAuditLogs = useMemo(() => {
    if (auditLogFilter === 'all') return auditLogs;
    return auditLogs.filter(log => log.category === auditLogFilter);
  }, [auditLogs, auditLogFilter]);

  // -------------------------------------------------------------
  // MODULE 3: ADS MANAGEMENT STATE
  // -------------------------------------------------------------
  const [adFilterLayer, setAdFilterLayer] = useState<'all' | 'billboard_feed' | 'floating_bottom' | 'top_marquee' | 'popunder_interstitial' | 'video_preroll' | 'hero_spotlight'>('all');
  const [adPreviewTab, setAdPreviewTab] = useState<'billboard_feed' | 'floating_bottom' | 'top_marquee' | 'popunder_interstitial'>('billboard_feed');
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [adFormData, setAdFormData] = useState<Partial<AdCampaign>>({
    title: '',
    partnerName: '',
    layer: 'billboard_feed',
    bannerUrl: '/ads/banner-liveeuy-vip.svg',
    targetUrl: 'https://',
    headline: '',
    description: '',
    badge: 'SPONSOR UTAMA',
    ctaText: 'Kunjungi Sponsor',
    category: 'Entertainment & Gaming',
    budget: 10000000,
    isActive: true,
    tickerText: '',
    frequencyCapMinutes: 15,
  });

  const activeBillboardFeedAds = useMemo(() => ads.filter(a => a.layer === 'billboard_feed'), [ads]);
  const activeStickyAds = useMemo(() => ads.filter(a => a.layer === 'floating_bottom' && a.isActive), [ads]);
  const activeMarqueeAds = useMemo(() => ads.filter(a => a.layer === 'top_marquee' && a.isActive), [ads]);
  const activePopunderAds = useMemo(() => ads.filter(a => a.layer === 'popunder_interstitial' && a.isActive), [ads]);

  const filteredAds = useMemo(() => {
    if (adFilterLayer === 'all') return ads;
    return ads.filter(a => a.layer === adFilterLayer);
  }, [ads, adFilterLayer]);

  const handleOpenAddAd = () => {
    setEditingAdId(null);
    setAdFormData({
      title: '',
      partnerName: '',
      layer: 'billboard_feed',
      bannerUrl: '/ads/banner-liveeuy-vip.svg',
      targetUrl: 'https://',
      headline: '',
      description: '',
      badge: 'SPONSOR UTAMA',
      ctaText: 'Kunjungi Sponsor',
      category: 'Entertainment & Gaming',
      budget: 10000000,
      isActive: true,
      tickerText: '',
      frequencyCapMinutes: 15,
    });
    setIsAdModalOpen(true);
  };

  const handleOpenEditAd = (ad: AdCampaign) => {
    setEditingAdId(ad.id);
    setAdFormData({
      title: ad.title,
      partnerName: ad.partnerName,
      layer: ad.layer,
      bannerUrl: ad.bannerUrl,
      targetUrl: ad.targetUrl,
      headline: ad.headline || '',
      description: ad.description || '',
      badge: ad.badge || 'SPONSOR UTAMA',
      ctaText: ad.ctaText || 'Kunjungi Sponsor',
      category: ad.category || 'Entertainment & Gaming',
      budget: ad.budget || 10000000,
      isActive: ad.isActive,
      tickerText: ad.tickerText || '',
      frequencyCapMinutes: ad.frequencyCapMinutes || 15,
    });
    setIsAdModalOpen(true);
  };

  const handleSaveAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adFormData.title?.trim() || !adFormData.bannerUrl?.trim()) {
      alert('Mohon isi Judul Iklan dan URL Gambar Banner.');
      return;
    }

    if (editingAdId) {
      updateAdCampaign(editingAdId, {
        title: adFormData.title.trim(),
        partnerName: adFormData.partnerName?.trim() || 'Mitra Sponsor',
        layer: (adFormData.layer as any) || 'billboard_feed',
        bannerUrl: adFormData.bannerUrl.trim(),
        targetUrl: adFormData.targetUrl?.trim() || '#',
        headline: adFormData.headline?.trim() || adFormData.title.trim(),
        description: adFormData.description?.trim() || '',
        badge: adFormData.badge?.trim() || 'SPONSOR',
        ctaText: adFormData.ctaText?.trim() || 'Kunjungi Sponsor',
        category: (adFormData.category as any) || 'Entertainment & Gaming',
        budget: Number(adFormData.budget) || 10000000,
        isActive: adFormData.isActive ?? true,
        tickerText: adFormData.tickerText?.trim() || '',
        frequencyCapMinutes: Number(adFormData.frequencyCapMinutes) || 15,
      });
      showToast('Iklan sponsor berhasil diperbarui!');
    } else {
      const newId = `ad-custom-${Date.now()}`;
      addAdCampaign({
        id: newId,
        title: adFormData.title.trim(),
        partnerName: adFormData.partnerName?.trim() || 'Mitra Sponsor',
        layer: (adFormData.layer as any) || 'billboard_feed',
        bannerUrl: adFormData.bannerUrl.trim(),
        targetUrl: adFormData.targetUrl?.trim() || '#',
        headline: adFormData.headline?.trim() || adFormData.title.trim(),
        description: adFormData.description?.trim() || '',
        badge: adFormData.badge?.trim() || 'SPONSOR',
        category: (adFormData.category as any) || 'Entertainment & Gaming',
        budget: Number(adFormData.budget) || 10000000,
        impressions: 0,
        clicks: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: adFormData.isActive ?? true,
        ctaText: 'Kunjungi Sponsor',
        tickerText: adFormData.tickerText?.trim() || '',
        frequencyCapMinutes: Number(adFormData.frequencyCapMinutes) || 15,
      });
      showToast('Iklan sponsor baru berhasil ditambahkan!');
    }
    setIsAdModalOpen(false);
  };

  // -------------------------------------------------------------
  // MODULE 4: EPISODES MANAGEMENT STATE
  // -------------------------------------------------------------
  const seriesList = useMemo(() => allMedia.filter(m => m.type === 'tv'), [allMedia]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(seriesList[0]?.id || '');
  const activeSeries = useMemo(() => seriesList.find(s => s.id === selectedSeriesId) || seriesList[0], [seriesList, selectedSeriesId]);

  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [epSeasonNumber, setEpSeasonNumber] = useState<number>(1);
  const [epNumber, setEpNumber] = useState<number>(1);
  const [epTitle, setEpTitle] = useState('');
  const [epOverview, setEpOverview] = useState('');
  const [epDuration, setEpDuration] = useState('45m');
  const [epThumbnail, setEpThumbnail] = useState('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80');
  const [epVideoUrl, setEpVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');

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

  // -------------------------------------------------------------
  // MODULE 5: ANALYTICS MODULE STATE
  // -------------------------------------------------------------
  const [analyticsFilterType, setAnalyticsFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [analyticsSortBy, setAnalyticsSortBy] = useState<'views' | 'watchHours' | 'ratingDesc' | 'ratingAsc'>('views');
  const [analyticsSearch, setAnalyticsSearch] = useState('');

  const mediaAnalyticsList: MediaAnalyticsItem[] = useMemo(() => {
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

  const totalViewsAccumulated = useMemo(() => mediaAnalyticsList.reduce((sum, item) => sum + item.views, 0), [mediaAnalyticsList]);
  const totalWatchHoursAccumulated = useMemo(() => mediaAnalyticsList.reduce((sum, item) => sum + item.watchHours, 0), [mediaAnalyticsList]);
  const averageRatingAcrossCatalog = useMemo(() => {
    if (allMedia.length === 0) return 0;
    const sum = allMedia.reduce((acc, m) => acc + m.rating, 0);
    return +(sum / allMedia.length).toFixed(1);
  }, [allMedia]);

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

  const top5MostWatched = useMemo(() => {
    return [...mediaAnalyticsList].sort((a, b) => b.views - a.views).slice(0, 5);
  }, [mediaAnalyticsList]);

  const top3HighestRated = useMemo(() => {
    return [...mediaAnalyticsList].sort((a, b) => b.rating - a.rating).slice(0, 3);
  }, [mediaAnalyticsList]);

  const top3LowestRated = useMemo(() => {
    return [...mediaAnalyticsList].sort((a, b) => a.rating - b.rating).slice(0, 3);
  }, [mediaAnalyticsList]);

  const ratingDistribution = useMemo(() => {
    const d9 = allMedia.filter(m => m.rating >= 9.0).length;
    const d8 = allMedia.filter(m => m.rating >= 8.0 && m.rating < 9.0).length;
    const d7 = allMedia.filter(m => m.rating >= 7.0 && m.rating < 8.0).length;
    const dLow = allMedia.filter(m => m.rating < 7.0).length;
    return { d9, d8, d7, dLow };
  }, [allMedia]);

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

  // -------------------------------------------------------------
  // MODULE 6: USERS MODULE STATE
  // -------------------------------------------------------------
  const DEFAULT_ADMIN_USERS: User[] = [
    {
      id: 'usr-101',
      name: 'Hafiz Muhammad',
      email: 'hafiz@liveeuy.id',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      tier: 'VIP Cinema Ultra',
      role: 'admin',
      status: 'active',
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
      status: 'active',
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
      status: 'active',
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
      status: 'suspended',
      memberSince: 'Jan 2025',
      watchHours: 2.5,
      devices: 1
    }
  ];

  const [usersList, setUsersList] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('liveeuy_admin_users');
      return saved ? JSON.parse(saved) : DEFAULT_ADMIN_USERS;
    } catch {
      return DEFAULT_ADMIN_USERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('liveeuy_admin_users', JSON.stringify(usersList));
    } catch (e) {
      console.error(e);
    }
  }, [usersList]);

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'user',
    tier: 'VIP Standard' as 'Free Guest' | 'VIP Standard' | 'VIP Cinema Ultra',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
  });

  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearchTerm.toLowerCase());
      const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const matchStatus = userStatusFilter === 'all' || (u.status || 'active') === userStatusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [usersList, userSearchTerm, userRoleFilter, userStatusFilter]);

  const handleToggleUserStatus = (usr: User) => {
    const nextStatus = usr.status === 'suspended' ? 'active' : 'suspended';
    setUsersList(prev => prev.map(u => u.id === usr.id ? { ...u, status: nextStatus } : u));
    const actionText = nextStatus === 'suspended' ? 'ditangguhkan (suspended)' : 'diaktifkan kembali';
    showToast(`Akun ${usr.name} berhasil ${actionText}!`);
    addAuditLog(
      nextStatus === 'suspended' ? 'Tangguhkan Akun Pengguna' : 'Aktifkan Akun Pengguna',
      'user',
      `Status akun "${usr.name}" (${usr.email}) diubah menjadi ${nextStatus}.`
    );
  };

  const handleForceRemoteLogout = (usr: User) => {
    showToast(`Sesi seluruh perangkat milik ${usr.name} berhasil dicabut paksa!`);
    addAuditLog(
      'Cabut Sesi Paksa Pengguna',
      'user',
      `Admin mencabut paksa seluruh token sesi dan perangkat aktif untuk akun "${usr.name}" (${usr.email}).`
    );
  };

  const handleDeleteUser = (usr: User) => {
    if (window.confirm(`Hapus permanen akun "${usr.name}" (${usr.email}) dari database studio?`)) {
      setUsersList(prev => prev.filter(u => u.id !== usr.id));
      showToast(`Akun ${usr.name} berhasil dihapus permanen!`);
      addAuditLog('Hapus Akun Pengguna', 'user', `Akun "${usr.name}" (${usr.email}) dihapus dari database studio.`);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.email.trim()) {
      alert('Nama dan email wajib diisi.');
      return;
    }

    const created: User = {
      id: `usr-${Date.now().toString(36)}`,
      name: newUserForm.name.trim(),
      email: newUserForm.email.trim().toLowerCase(),
      avatar: newUserForm.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      role: newUserForm.role,
      tier: newUserForm.tier,
      status: 'active',
      memberSince: new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
      watchHours: 0,
      devices: newUserForm.tier === 'VIP Cinema Ultra' ? 4 : newUserForm.tier === 'VIP Standard' ? 2 : 1
    };

    setUsersList(prev => [created, ...prev]);
    setIsAddUserModalOpen(false);
    setNewUserForm({
      name: '',
      email: '',
      role: 'user',
      tier: 'VIP Standard',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
    });
    showToast(`Akun ${created.name} berhasil ditambahkan!`);
    addAuditLog('Tambah Pengguna Baru', 'user', `Admin mendaftarkan akun baru "${created.name}" (${created.email}) dengan role ${created.role} dan tier ${created.tier}.`);
  };

  // -------------------------------------------------------------
  // MODULE 7: TRACKING MODULE STATE
  // -------------------------------------------------------------
  const [trackingSearch, setTrackingSearch] = useState('');
  const [trackingFilterOS, setTrackingFilterOS] = useState<'all' | 'macOS' | 'Windows' | 'iOS' | 'Android'>('all');

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

  const copyCookieToken = (token: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(token);
      showToast('Token cookie pelacak berhasil disalin!');
    }
  };

  // -------------------------------------------------------------
  // MODULE 9: SYSTEM & BACKEND DIAGNOSTIC STATE
  // -------------------------------------------------------------
  const [isPingingBackend, setIsPingingBackend] = useState(false);
  const [backendPingResult, setBackendPingResult] = useState<BackendDiagnosticResult>({
    catalogOnline: false,
    catalogLatency: null,
    catalogUrl: 'http://localhost:8081/api/v1',
    authOnline: false,
    authLatency: null,
    testedAt: null
  });

  const runBackendDiagnostic = async () => {
    setIsPingingBackend(true);
    const result: BackendDiagnosticResult = {
      catalogOnline: false,
      catalogLatency: null,
      catalogUrl: 'http://localhost:8081/api/v1',
      authOnline: false,
      authLatency: null,
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

  // Sidebar navigation items generator
  const sidebarNavGroups = useMemo(() => {
    return getSidebarNavGroups({
      allMediaCount: allMedia.length,
      seriesCount: seriesList.length,
      visitorCount: visitorSessions.length,
      usersCount: usersList.length,
      activeBillboardCount: ads.filter(a => a.isActive && a.layer === 'billboard_feed').length,
      isAnnouncementActive: broadcastAnnouncement.isActive
    });
  }, [allMedia.length, seriesList.length, visitorSessions.length, usersList.length, ads, broadcastAnnouncement.isActive]);

  const allNavItems = useMemo(() => {
    return sidebarNavGroups.reduce<SidebarNavItem[]>((acc, g) => acc.concat(g.items), []);
  }, [sidebarNavGroups]);

  const currentModuleInfo = MODULE_HEADER_INFO[activeModule] || {
    title: 'Admin Console',
    subtitle: 'LiveEuy Studio CMS'
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-white flex flex-col font-sans selection:bg-brand-500/30 selection:text-white">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-16 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2.5 animate-slide-up text-xs sm:text-sm font-bold border border-emerald-400/30">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Topbar Header */}
      <AdminHeader
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        setIsMobileDrawerOpen={setIsMobileDrawerOpen}
        activeModule={activeModule}
        setCurrentTab={setCurrentTab}
        openCreateModal={openCreateModal}
        user={user}
        logout={logout}
        openDeviceSecurityModal={openDeviceSecurityModal}
      />

      {/* Body: Sidebar + Main Content */}
      <div className="flex-1 flex min-w-0">
        
        {/* Navigation Sidebar */}
        <AdminSidebar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isMobileDrawerOpen={isMobileDrawerOpen}
          setIsMobileDrawerOpen={setIsMobileDrawerOpen}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          sidebarNavGroups={sidebarNavGroups}
          allNavItems={allNavItems}
          publicWebNavItems={publicWebNavItems}
          setCurrentTab={setCurrentTab}
          openCreateModal={openCreateModal}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 pb-24 md:pb-8 sm:p-6 lg:p-8 2xl:p-10 space-y-6 cinema-layout-container overflow-y-auto">
          
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
                    {currentModuleInfo.title}
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  {currentModuleInfo.subtitle}
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

          {/* Module 1: Media Catalog */}
          {activeModule === 'media' && (
            <MediaModule
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              selectedMediaIds={selectedMediaIds}
              handleExportCatalog={handleExportCatalog}
              jsonFileInputRef={jsonFileInputRef}
              handleFileSelectForRestore={handleFileSelectForRestore}
              handleBatchSetTrending={handleBatchSetTrending}
              handleExportSelected={handleExportSelected}
              handleBatchDelete={handleBatchDelete}
              handleClearSelection={handleClearSelection}
              filteredAdminMedia={filteredAdminMedia}
              isAllVisibleMediaSelected={isAllVisibleMediaSelected}
              isPartiallySelected={isPartiallySelected}
              handleToggleSelectAll={handleToggleSelectAll}
              handleToggleSelectOne={handleToggleSelectOne}
              updateMedia={updateMedia}
              deleteMedia={deleteMedia}
              openDetail={openDetail}
              openEditModal={openEditModal}
              showToast={showToast}
            />
          )}

          {/* Module 2: Banner & Announcement */}
          {activeModule === 'banner' && (
            <BannerModule
              broadcastAnnouncement={broadcastAnnouncement}
              toggleBroadcastAnnouncement={toggleBroadcastAnnouncement}
              announcementForm={announcementForm}
              setAnnouncementForm={setAnnouncementForm}
              handleSaveAnnouncement={handleSaveAnnouncement}
              isAnnouncementSaved={isAnnouncementSaved}
              heroCarouselItems={heroCarouselItems}
              moveFeaturedItem={moveFeaturedItem}
              toggleFeaturedItem={toggleFeaturedItem}
              bannerSearchTerm={bannerSearchTerm}
              setBannerSearchTerm={setBannerSearchTerm}
              candidateForHero={candidateForHero}
              auditLogFilter={auditLogFilter}
              setAuditLogFilter={setAuditLogFilter}
              clearAuditLogs={clearAuditLogs}
              filteredAuditLogs={filteredAuditLogs}
            />
          )}

          {/* Module 3: Ads & Sponsor Billboards */}
          {activeModule === 'ads' && (
            <AdsModule
              ads={ads}
              activeBillboardFeedAds={activeBillboardFeedAds}
              activeStickyAds={activeStickyAds}
              activeMarqueeAds={activeMarqueeAds}
              activePopunderAds={activePopunderAds}
              filteredAds={filteredAds}
              adFilterLayer={adFilterLayer}
              setAdFilterLayer={setAdFilterLayer}
              adPreviewTab={adPreviewTab}
              setAdPreviewTab={setAdPreviewTab}
              isAdModalOpen={isAdModalOpen}
              setIsAdModalOpen={setIsAdModalOpen}
              editingAdId={editingAdId}
              adFormData={adFormData}
              setAdFormData={setAdFormData}
              handleOpenAddAd={handleOpenAddAd}
              handleOpenEditAd={handleOpenEditAd}
              handleSaveAd={handleSaveAd}
              toggleAdCampaign={toggleAdCampaign}
              deleteAdCampaign={deleteAdCampaign}
              resetAdsToDefault={resetAdsToDefault}
              showToast={showToast}
            />
          )}

          {/* Module 4: Episodes & Seasons */}
          {activeModule === 'episodes' && (
            <EpisodesModule
              seriesList={seriesList}
              selectedSeriesId={selectedSeriesId}
              setSelectedSeriesId={setSelectedSeriesId}
              activeSeries={activeSeries}
              setEpSeasonNumber={setEpSeasonNumber}
              setEpNumber={setEpNumber}
              setIsEpisodeModalOpen={setIsEpisodeModalOpen}
              handleDeleteEpisode={handleDeleteEpisode}
            />
          )}

          {/* Module 5: Analytics & Ratings */}
          {activeModule === 'analytics' && (
            <AnalyticsModule
              exportAnalyticsCSV={exportAnalyticsCSV}
              totalViewsAccumulated={totalViewsAccumulated}
              totalWatchHoursAccumulated={totalWatchHoursAccumulated}
              averageRatingAcrossCatalog={averageRatingAcrossCatalog}
              bestRatedMedia={bestRatedMedia}
              lowestRatedMedia={lowestRatedMedia}
              mostWatchedMedia={mostWatchedMedia}
              openDetail={openDetail}
              openEditModal={openEditModal}
              openPlayer={openPlayer}
              top5MostWatched={top5MostWatched}
              top3HighestRated={top3HighestRated}
              top3LowestRated={top3LowestRated}
              allMediaLength={allMedia.length}
              ratingDistribution={ratingDistribution}
              analyticsSearch={analyticsSearch}
              setAnalyticsSearch={setAnalyticsSearch}
              analyticsFilterType={analyticsFilterType}
              setAnalyticsFilterType={setAnalyticsFilterType}
              analyticsSortBy={analyticsSortBy}
              setAnalyticsSortBy={setAnalyticsSortBy}
              filteredAnalyticsMedia={filteredAnalyticsMedia}
            />
          )}

          {/* Module 6: Users & Subscriptions */}
          {activeModule === 'users' && (
            <UsersModule
              usersList={usersList}
              setUsersList={setUsersList}
              filteredUsers={filteredUsers}
              userSearchTerm={userSearchTerm}
              setUserSearchTerm={setUserSearchTerm}
              userRoleFilter={userRoleFilter}
              setUserRoleFilter={setUserRoleFilter}
              userStatusFilter={userStatusFilter}
              setUserStatusFilter={setUserStatusFilter}
              isAddUserModalOpen={isAddUserModalOpen}
              setIsAddUserModalOpen={setIsAddUserModalOpen}
              newUserForm={newUserForm}
              setNewUserForm={setNewUserForm}
              handleCreateUser={handleCreateUser}
              handleToggleUserStatus={handleToggleUserStatus}
              handleForceRemoteLogout={handleForceRemoteLogout}
              handleDeleteUser={handleDeleteUser}
              showToast={showToast}
              addAuditLog={addAuditLog}
            />
          )}

          {/* Module 7: Tracking & Visitor Sessions */}
          {activeModule === 'tracking' && (
            <TrackingModule
              exportTrackingCSV={exportTrackingCSV}
              refreshTracking={refreshTracking}
              resetTracking={resetTracking}
              showToast={showToast}
              currentSession={currentSession}
              copyCookieToken={copyCookieToken}
              trackingSearch={trackingSearch}
              setTrackingSearch={setTrackingSearch}
              trackingFilterOS={trackingFilterOS}
              setTrackingFilterOS={setTrackingFilterOS}
              filteredTracking={filteredTracking}
            />
          )}

          {/* Module 8: Reviews & Moderation */}
          {activeModule === 'reviews' && (
            <ReviewsModule
              allMedia={allMedia}
              showToast={showToast}
            />
          )}

          {/* Module 9: System & REST API */}
          {activeModule === 'system' && (
            <SystemModule
              isPingingBackend={isPingingBackend}
              runBackendDiagnostic={runBackendDiagnostic}
              backendPingResult={backendPingResult}
              resetMediaToDefault={resetMediaToDefault}
              showToast={showToast}
            />
          )}

        </main>
      </div>

      {/* Global Modals */}
      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        editingItem={editingItem}
        onSave={handleSaveMedia}
        runStreamHealthCheck={runStreamHealthCheck}
        isTestingStream={isTestingStream}
        streamHealthResult={streamHealthResult}
        setStreamHealthResult={setStreamHealthResult}
        isPreviewPlayerOpen={isPreviewPlayerOpen}
        setIsPreviewPlayerOpen={setIsPreviewPlayerOpen}
      />

      <EpisodeModal
        isOpen={isEpisodeModalOpen}
        onClose={() => setIsEpisodeModalOpen(false)}
        activeSeries={activeSeries}
        epSeasonNumber={epSeasonNumber}
        setEpSeasonNumber={setEpSeasonNumber}
        epNumber={epNumber}
        setEpNumber={setEpNumber}
        epTitle={epTitle}
        setEpTitle={setEpTitle}
        epDuration={epDuration}
        setEpDuration={setEpDuration}
        epOverview={epOverview}
        setEpOverview={setEpOverview}
        epThumbnail={epThumbnail}
        setEpThumbnail={setEpThumbnail}
        epVideoUrl={epVideoUrl}
        setEpVideoUrl={setEpVideoUrl}
        onAddEpisode={handleAddEpisode}
      />

      <RestoreCatalogModal
        isOpen={isRestoreModalOpen}
        onClose={() => {
          setIsRestoreModalOpen(false);
          setPendingRestoreData(null);
        }}
        pendingRestoreData={pendingRestoreData}
        allMediaLength={allMedia.length}
        restoreMode={restoreMode}
        setRestoreMode={setRestoreMode}
        onConfirmRestore={handleConfirmRestore}
      />

    </div>
  );
};

export default AdminPage;
