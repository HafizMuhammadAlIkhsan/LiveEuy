import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Play, 
  Search, 
  Bell, 
  Bookmark, 
  Film, 
  Tv, 
  Flame, 
  X, 
  ChevronDown, 
  Sparkles, 
  LogOut, 
  User as UserIcon, 
  LogIn, 
  Crown, 
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Globe,
  Radio,
  Smartphone,
  Laptop,
  ShieldAlert,
  Loader2,
  Users,
  Baby,
  Lock,
  Smile,
  Plus,
  Download
} from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { ViewTab } from '../types';
import { useAjaxSearch } from '../hooks/useAjaxSearch';
import { usePwaInstall } from '../hooks/usePwaInstall';

export const Navbar: React.FC = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    searchQuery, 
    setSearchQuery, 
    watchlist,
    allMedia,
    openDetail,
    user,
    isLoggedIn,
    logout,
    openAuthModal,
    openMobileSync,
    openDeviceSecurityModal,
    visitorSessions,
    login,
    broadcastAnnouncement,
    profiles,
    activeProfile,
    isKidsMode,
    openFamilyModal,
    switchProfile
  } = useWatch();

  const navigate = useNavigate();
  const location = useLocation();
  const { isStandalone, promptInstall } = usePwaInstall();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isAdminUser = Boolean(user && user.role === 'admin');
  const isInAdminPage = location.pathname.startsWith('/admin') || currentTab === 'admin';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle outside click & touch for popovers, plus Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-amber-400 font-extrabold underline decoration-amber-400/50">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const {
    results: ajaxSearchResults,
    total: ajaxTotalFound,
    isLoading: isAjaxSearching,
    hasSearched: hasAjaxSearched
  } = useAjaxSearch(searchQuery, {
    debounceMs: 200,
    limit: 6,
    enabled: isSearchOpen
  });

  const navItems: { tab: ViewTab; path: string; label: string; tabletLabel?: string; icon: React.ReactNode }[] = [
    { tab: 'home', path: '/', label: 'Beranda', icon: <Play className="w-4 h-4" /> },
    { tab: 'movies', path: '/movies', label: 'Film', icon: <Film className="w-4 h-4" /> },
    { tab: 'tv', path: '/tv', label: 'Serial TV', tabletLabel: 'Serial', icon: <Tv className="w-4 h-4" /> },
    { tab: 'trending', path: '/trending', label: 'Trending', icon: <Flame className="w-4 h-4" /> },
    { tab: 'watchlist', path: '/watchlist', label: 'Koleksi Saya', tabletLabel: 'Koleksi', icon: <Bookmark className="w-4 h-4" /> },
  ];

  const handleAdminModuleJump = (moduleId: string) => {
    window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: moduleId }));
  };

  return (
    <>
      {/* ========================================================
          TOP NAVBAR (Desktop, Tablet & Mobile Header)
          - Sleek, cinema-grade minimalist aesthetic
          - Optimized for iPad, Tablet, and Desktop screens
          ======================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#08090d]/95 backdrop-blur-md border-b border-white/[0.08] shadow-lg'
            : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'
        }`}
      >
        {/* Broadcast Announcement Bar (Controlled by Admin in CMS) */}
        {!isInAdminPage && broadcastAnnouncement.isActive && !isAnnouncementDismissed && (
          <div className={`w-full py-1.5 px-3 sm:px-6 transition-all text-xs font-medium border-b border-white/10 shadow-md ${
            broadcastAnnouncement.type === 'promo'
              ? 'bg-gradient-to-r from-amber-600 via-brand-600 to-indigo-700 text-white'
              : broadcastAnnouncement.type === 'event'
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white'
              : broadcastAnnouncement.type === 'info'
              ? 'bg-gradient-to-r from-brand-600 via-indigo-600 to-blue-700 text-white'
              : 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-700 text-white'
          }`}>
            <div className="cinema-layout-container flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30 flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                  {broadcastAnnouncement.badge}
                </span>
                <span className="font-bold truncate text-[11px] sm:text-xs">
                  {broadcastAnnouncement.title}
                </span>
                <span className="hidden lg:inline text-white/80 text-[11px] truncate">
                  — {broadcastAnnouncement.description}
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {broadcastAnnouncement.actionText && (
                  <button
                    onClick={() => {
                      if (broadcastAnnouncement.targetTab) {
                        setCurrentTab(broadcastAnnouncement.targetTab);
                      } else if (!isLoggedIn) {
                        openAuthModal('register');
                      }
                    }}
                    className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white text-slate-950 hover:bg-slate-100 text-[10px] sm:text-xs font-bold transition-all shadow hover:scale-105 active:scale-95 flex items-center gap-1"
                  >
                    <span>{broadcastAnnouncement.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => setIsAnnouncementDismissed(true)}
                  className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                  title="Tutup Pengumuman"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={`cinema-layout-container transition-all ${
          isScrolled ? 'py-2 sm:py-2.5 md:py-3' : 'py-3 sm:py-3.5 md:py-4'
        }`}>
          <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
            
            {/* Logo & Navigation */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-3.5 lg:gap-8 xl:gap-10 min-w-0">
              
              {/* Brand Logo - Bold Minimalist Cinema Typographic Wordmark */}
              <Link
                to="/"
                onClick={() => setSearchQuery('')}
                className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer text-left flex-shrink-0"
                title={isInAdminPage ? "Kembali ke Beranda LiveEuy" : "LiveEuy Beranda"}
              >
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white select-none whitespace-nowrap">
                  LIVE<span className="text-brand-500">EUY</span>
                </span>
                {isInAdminPage && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                    CMS
                  </span>
                )}
                {isKidsMode && !isInAdminPage && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-gradient-to-r from-amber-400 to-emerald-400 text-black shadow-sm flex items-center gap-1 uppercase select-none animate-pulse">
                    <Smile className="w-3 h-3" />
                    <span>KIDS</span>
                  </span>
                )}
              </Link>

              {/* DESKTOP & TABLET CENTER NAVIGATION */}
              {isInAdminPage ? (
                /* Admin Topbar: Return to Website */
                <div className="hidden md:flex items-center gap-2 lg:gap-3">
                  <Link
                    to="/"
                    onClick={() => setSearchQuery('')}
                    className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors text-xs font-medium min-h-[36px]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kembali ke Website</span>
                  </Link>
                  <span className="hidden lg:inline text-xs text-slate-400 font-medium">Panel Kontrol CMS</span>
                </div>
              ) : (
                /* Regular User Consumer Tabs (Beranda, Film, Serial, Trending, Koleksi) */
                <nav className="hidden md:flex items-center gap-1 md:gap-1.5 lg:gap-5 xl:gap-7">
                  {navItems.map(item => {
                    const isActive = (location.pathname === item.path || (item.path === '/' && location.pathname === '')) && !searchQuery;
                    return (
                      <Link
                        key={item.tab}
                        to={item.path}
                        onClick={() => setSearchQuery('')}
                        className={`text-xs lg:text-sm tracking-normal transition-all relative py-1.5 px-2 lg:px-2.5 rounded-lg flex items-center min-h-[38px] ${
                          isActive
                            ? 'text-white font-semibold after:absolute after:-bottom-2 lg:after:-bottom-2.5 after:left-1.5 after:right-1.5 after:h-0.5 after:bg-brand-500 after:rounded-full'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] font-normal'
                        }`}
                      >
                        <span className="hidden lg:inline">{item.label}</span>
                        <span className="md:inline lg:hidden">{item.tabletLabel || item.label}</span>
                        {item.tab === 'watchlist' && watchlist.length > 0 && (
                          <span className="ml-1.5 px-1.5 py-0.2 text-[9px] lg:text-[10px] font-bold rounded-full bg-brand-600 text-white leading-tight">
                            {watchlist.length}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Right Controls: Search, Notifications, Profile / Login */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2 lg:gap-3.5 xl:gap-4 flex-shrink-0">
              
              {/* Search Bar (Expandable) with AJAX Live Autocomplete */}
              <div className="relative">
                {isSearchOpen ? (
                  <div className="flex items-center bg-[#10121a] rounded-full px-2.5 sm:px-3 py-1.5 w-48 xs:w-56 sm:w-64 md:w-52 lg:w-72 xl:w-80 shadow-xl border border-white/15 focus-within:border-brand-500/60 transition-all duration-200">
                    {isAjaxSearching ? (
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-400 animate-spin mr-1.5 sm:mr-2 flex-shrink-0" />
                    ) : (
                      <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 mr-1.5 sm:mr-2 flex-shrink-0" />
                    )}
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => {
                        setSearchQuery(e.target.value);
                        if (location.pathname === '/search') {
                          navigate(`/search${e.target.value ? `?q=${encodeURIComponent(e.target.value)}` : ''}`, { replace: true });
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          if (searchQuery.trim()) {
                            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                          } else {
                            navigate('/search');
                          }
                          setIsSearchOpen(false);
                        }
                      }}
                      placeholder="Cari film, serial, aktor..."
                      className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          if (location.pathname === '/search') {
                            navigate('/search');
                          }
                        }}
                        className="p-1 hover:text-white text-slate-400 min-w-[22px] min-h-[22px] flex items-center justify-center rounded-full hover:bg-white/10"
                        title="Hapus teks"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="ml-0.5 sm:ml-1 p-1 hover:text-white text-slate-400 min-w-[22px] min-h-[22px] flex items-center justify-center rounded-full hover:bg-white/10"
                      title="Tutup Pencarian"
                    >
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Cari Film"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}

                {/* Instant AJAX Search Results Dropdown */}
                {isSearchOpen && searchQuery.trim().length > 0 && (
                  <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 md:w-[420px] max-w-[calc(100vw-2rem)] rounded-2xl bg-[#0c0d14]/95 backdrop-blur-2xl border border-white/10 p-3 shadow-2xl z-50 animate-fade-in max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <div className="px-2 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                        <span className="text-white font-bold">Live AJAX Search</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAjaxSearching ? (
                          <span className="text-[10px] text-brand-400 flex items-center gap-1 font-mono">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Mencari...
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {ajaxTotalFound} ditemukan
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SKELETON LOADING STATE */}
                    {isAjaxSearching && ajaxSearchResults.length === 0 && (
                      <div className="space-y-2 py-2">
                        {[1, 2, 3].map(n => (
                          <div key={n} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] animate-pulse">
                            <div className="w-11 h-16 bg-white/10 rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3.5 bg-white/10 rounded w-3/4" />
                              <div className="h-2.5 bg-white/5 rounded w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* RESULTS LIST */}
                    {ajaxSearchResults.length > 0 && (
                      <div className="divide-y divide-white/5 space-y-1">
                        {ajaxSearchResults.map(item => (
                          <div
                            key={item.id}
                            onClick={() => {
                              openDetail(item);
                              setIsSearchOpen(false);
                            }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all group"
                          >
                            <img
                              src={item.posterUrl}
                              alt={item.title}
                              className="w-11 h-16 object-cover rounded-lg flex-shrink-0 shadow border border-white/10 group-hover:border-brand-500/50 transition-colors"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-brand-400 transition-colors truncate">
                                  {highlightMatch(item.title, searchQuery)}
                                </h4>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-white/10 text-slate-300">
                                  {item.type === 'movie' ? 'Film' : 'Serial'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                                <span>{item.releaseYear}</span>
                                <span>•</span>
                                <span className="text-amber-400 font-medium">★ {item.rating}</span>
                                <span>•</span>
                                <span className="truncate max-w-[140px]">{item.genres.slice(0, 2).join(', ')}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* EMPTY STATE */}
                    {hasAjaxSearched && !isAjaxSearching && ajaxSearchResults.length === 0 && (
                      <div className="p-6 text-center space-y-2">
                        <p className="text-xs text-slate-400">
                          Tidak ada film atau serial untuk kata kunci <span className="text-white font-bold">"{searchQuery}"</span>.
                        </p>
                        <div className="pt-2 flex flex-wrap justify-center gap-1.5">
                          <span className="text-[10px] text-slate-500 block w-full mb-1">Coba kata kunci populer:</span>
                          {['Cyberpunk', 'Joko Anwar', 'Anime', '4K UHD', 'Horor'].map(kw => (
                            <button
                              key={kw}
                              type="button"
                              onClick={() => setSearchQuery(kw)}
                              className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-[10px] cursor-pointer"
                            >
                              {kw}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* BOTTOM ACTION: Go to full search page */}
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                          setIsSearchOpen(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-brand-600/30 hover:bg-brand-600 text-brand-300 hover:text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Lihat Semua Hasil ({ajaxTotalFound}) di Halaman Pencarian</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* FAMILY & KIDS MODE BUTTON */}
              {isKidsMode ? (
                <button
                  type="button"
                  onClick={() => openFamilyModal()}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-all min-h-[36px] shadow-sm cursor-pointer"
                  title="Mode Anak Aktif. Klik untuk beralih profil atau keluar."
                >
                  <Smile className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xs:inline">Mode Anak</span>
                  <Lock className="w-3 h-3 text-amber-400/80" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openFamilyModal()}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-brand-500/40 transition-all min-h-[36px] shadow-sm cursor-pointer group"
                  title="Buka Profil Akun Keluarga & Mode Anak"
                >
                  <Users className="w-3.5 h-3.5 text-brand-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden md:inline font-medium">Keluarga</span>
                </button>
              )}


              {/* Notification Popover */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors relative"
                  aria-label="Notifikasi"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-2 h-2 rounded-full bg-brand-500"></span>
                </button>

                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-[#10121a]/95 backdrop-blur-xl border border-white/10 p-3 shadow-2xl z-50 animate-fade-in text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="font-semibold text-slate-300 text-xs">
                        Notifikasi
                      </span>
                      <span className="text-[11px] text-brand-400 hover:underline cursor-pointer">
                        Tandai dibaca
                      </span>
                    </div>
                    <div className="space-y-2 mt-2">
                      <div 
                        onClick={() => {
                          const target = allMedia.find(m => m.id === 'cyberpunk-neo-nusantara');
                          if (target) openDetail(target);
                          setShowNotifications(false);
                        }}
                        className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                          <span className="font-semibold text-white">Episode Baru Rilis</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                          Cyberpunk: Neo Nusantara Musim 2 Episode 1 siap diputar dalam 4K UHD.
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">15 menit lalu</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* USER AUTH & ACCESS BUTTONS: ADMIN vs USER vs GUEST */}
              {isLoggedIn && user ? (
                /* ================= LOGGED IN USER ================= */
                <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3">
                  
                  {/* When on admin page in mobile, show Back to Web */}
                  {isInAdminPage && (
                    <button
                      onClick={() => {
                        setCurrentTab('home');
                        setSearchQuery('');
                        navigate('/');
                      }}
                      className="md:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 text-white border border-white/15 min-h-[36px]"
                      title="Kembali ke Web"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Web</span>
                    </button>
                  )}

                  {/* Profile Menu Popover */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-lg hover:bg-white/5 transition-colors min-h-[36px]"
                      aria-label="Profil Pengguna"
                    >
                      {/* Netflix-style clean square avatar */}
                      <div className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-md overflow-hidden bg-surface-800 border transition-all ${
                        isKidsMode 
                          ? 'border-amber-400 ring-2 ring-amber-400/30' 
                          : 'border-white/20 hover:border-white/40'
                      }`}>
                        <img
                          src={activeProfile?.avatar || user.avatar}
                          alt={activeProfile?.name || user.name}
                          className="w-full h-full object-cover"
                        />
                        {isKidsMode && (
                          <div className="absolute bottom-0 inset-x-0 bg-amber-500 text-black text-[7px] font-black text-center leading-none py-0.5">
                            KIDS
                          </div>
                        )}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                    </button>

                    {showProfileMenu && (
                      <>
                        {/* Mobile Backdrop Overlay - closes menu when clicking outside */}
                        <div 
                          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 sm:hidden transition-opacity animate-fade-in"
                          onClick={() => setShowProfileMenu(false)}
                          aria-hidden="true"
                        />

                        {/* Responsive Profile Modal / Popover */}
                        <div 
                          className="fixed sm:absolute inset-x-3 sm:inset-x-auto top-14 sm:top-full right-auto sm:right-0 mt-0 sm:mt-2 w-auto sm:w-80 max-w-full sm:max-w-xs rounded-2xl bg-[#0e1017] sm:bg-[#10121a]/98 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 animate-fade-in text-xs sm:text-sm flex flex-col max-h-[82vh] sm:max-h-[min(650px,calc(100vh-5rem))] overflow-hidden"
                          role="dialog"
                          aria-modal="true"
                        >
                          {/* 1. Profile Header (Fixed top) */}
                          <div className="px-3.5 py-3 border-b border-white/10 bg-white/[0.03] flex-shrink-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-surface-800 border border-white/20 flex-shrink-0 shadow-sm">
                                  <img
                                    src={activeProfile?.avatar || user.avatar}
                                    alt={activeProfile?.name || user.name}
                                    className="w-full h-full object-cover"
                                  />
                                  {isKidsMode && (
                                    <div className="absolute bottom-0 inset-x-0 bg-amber-500 text-black text-[7px] font-black text-center leading-none py-0.5">
                                      KIDS
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-white truncate text-xs sm:text-sm">{user.name}</p>
                                    <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0 ${
                                      user.tier?.includes('VIP')
                                        ? 'bg-gradient-to-r from-amber-500/20 to-brand-500/20 text-amber-300 border border-amber-500/30'
                                        : 'bg-white/10 text-slate-300'
                                    }`}>
                                      {user.tier?.includes('VIP') && <Crown className="w-2.5 h-2.5 text-amber-400" />}
                                      <span>{user.tier}</span>
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                                </div>
                              </div>

                              {/* Mobile Close Button */}
                              <button
                                type="button"
                                onClick={() => setShowProfileMenu(false)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors sm:hidden flex-shrink-0"
                                aria-label="Tutup Menu Profil"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {user.tier?.includes('VIP') && (
                              <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-semibold">
                                <Sparkles className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                <span className="truncate">Benefit Aktif: Bebas Iklan & Billboard</span>
                              </div>
                            )}
                          </div>

                          {/* 2. Scrollable Body with Brand Harmonized Scrollbar */}
                          <div className="flex-1 overflow-y-auto overscroll-contain p-2 sm:p-2.5 pr-1.5 sm:pr-2 space-y-1.5 divide-y divide-white/5 custom-scrollbar profile-scrollbar">
                            {/* Quick Family Profiles Switcher */}
                            <div className="px-1.5 py-1 pb-2">
                              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                <span>Profil Aktif:</span>
                                <span className={activeProfile.isKids ? 'text-amber-400 font-extrabold' : 'text-brand-400 font-extrabold'}>
                                  {activeProfile.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                {profiles.map(p => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                      if (activeProfile.isKids && !p.isKids) {
                                        openFamilyModal();
                                        setShowProfileMenu(false);
                                      } else {
                                        switchProfile(p.id);
                                        setShowProfileMenu(false);
                                      }
                                    }}
                                    className="relative flex flex-col items-center flex-shrink-0 group cursor-pointer"
                                    title={`${p.name}${p.isKids ? ' (Mode Anak)' : ''}`}
                                  >
                                    <div className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition-all ${
                                      p.id === activeProfile.id
                                        ? 'border-brand-400 scale-105 shadow-md shadow-brand-500/40 ring-2 ring-brand-500/30'
                                        : 'border-white/20 opacity-70 group-hover:opacity-100 group-hover:border-white/40'
                                    }`}>
                                      <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-[9px] text-slate-300 truncate max-w-[48px] mt-1 font-medium">
                                      {p.name.split(' ')[0]}
                                    </span>
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    openFamilyModal();
                                    setShowProfileMenu(false);
                                  }}
                                  className="w-8 h-8 rounded-lg border border-dashed border-white/30 hover:border-brand-400 hover:bg-brand-500/10 flex items-center justify-center text-slate-400 hover:text-brand-300 transition-colors flex-shrink-0 mb-3 cursor-pointer"
                                  title="Kelola Profil & Akun Keluarga"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Menu Options */}
                            <div className="pt-1.5 space-y-0.5">
                              {/* Kelola Profil & Family Sharing Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  openFamilyModal();
                                  setShowProfileMenu(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors font-medium min-h-[38px] cursor-pointer"
                              >
                                <span className="flex items-center gap-2.5">
                                  <Users className="w-4 h-4 text-brand-400" />
                                  <span>Profil & Family Sharing</span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                                  {profiles.length}/5
                                </span>
                              </button>

                              {/* Quick Toggle Kids Mode */}
                              <button
                                type="button"
                                onClick={() => {
                                  openFamilyModal();
                                  setShowProfileMenu(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 active:bg-amber-500/20 transition-colors font-medium min-h-[38px] cursor-pointer"
                              >
                                <span className="flex items-center gap-2.5">
                                  <Smile className="w-4 h-4 text-amber-400" />
                                  <span>{isKidsMode ? 'Keluar Mode Anak' : 'Beralih ke Mode Anak'}</span>
                                </span>
                                {isKidsMode && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                              </button>

                              {/* Admin CMS Button */}
                              {isAdminUser && (
                                isInAdminPage ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCurrentTab('home');
                                      navigate('/');
                                      setShowProfileMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors min-h-[38px] cursor-pointer"
                                  >
                                    <ArrowLeft className="w-4 h-4 text-brand-400" />
                                    <span>Kembali ke Website</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCurrentTab('admin');
                                      setShowProfileMenu(false);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 active:bg-emerald-500/20 transition-colors font-medium min-h-[38px] cursor-pointer"
                                  >
                                    <span className="flex items-center gap-2.5">
                                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                      <span>Panel CMS Admin</span>
                                    </span>
                                  </button>
                                )
                              )}

                              {/* Koleksi & Riwayat */}
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentTab('watchlist');
                                  navigate('/watchlist');
                                  setShowProfileMenu(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors min-h-[38px] cursor-pointer"
                              >
                                <Bookmark className="w-4 h-4 text-brand-400" />
                                <span>Koleksi & Riwayat Saya</span>
                              </button>

                              {/* Perangkat & Keamanan */}
                              <button
                                type="button"
                                onClick={() => {
                                  openDeviceSecurityModal();
                                  setShowProfileMenu(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors min-h-[38px] cursor-pointer"
                              >
                                <span className="flex items-center gap-2.5">
                                  <Laptop className="w-4 h-4 text-cyan-400" />
                                  <span>Perangkat & Keamanan</span>
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                                  {user.devices || visitorSessions.length || 1} Device
                                </span>
                              </button>

                              {/* Download & Hub Aplikasi Mobile */}
                              <button
                                type="button"
                                onClick={() => {
                                  openMobileSync();
                                  setShowProfileMenu(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors min-h-[38px] cursor-pointer group"
                              >
                                <span className="flex items-center gap-2.5">
                                  <Smartphone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                                  <span>Download Aplikasi Mobile</span>
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  APK / HP
                                </span>
                              </button>

                              {/* Pasang Aplikasi (PWA) */}
                              <button
                                type="button"
                                onClick={() => {
                                  setShowProfileMenu(false);
                                  if (!isStandalone) {
                                    promptInstall();
                                  }
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors min-h-[38px] cursor-pointer"
                              >
                                <span className="flex items-center gap-2.5">
                                  <Download className="w-4 h-4 text-brand-400" />
                                  <span>Pasang Aplikasi</span>
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-bold">
                                  {isStandalone ? 'Terpasang' : 'PWA'}
                                </span>
                              </button>

                              {/* Role Switcher for Pair Testing */}
                              {isAdminUser ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    login({
                                      name: 'Budi Santoso',
                                      email: 'budi@liveeuy.id',
                                      tier: 'VIP Standard',
                                      role: 'user',
                                      watchHours: 12.0,
                                      devices: 1
                                    });
                                    setCurrentTab('home');
                                    navigate('/');
                                    setShowProfileMenu(false);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors min-h-[38px] cursor-pointer"
                                  title="Beralih ke akun penonton"
                                >
                                  <span className="flex items-center gap-2.5">
                                    <UserIcon className="w-4 h-4 text-slate-400" />
                                    <span>Akun Penonton</span>
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 font-mono">Budi</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    login({
                                      name: 'Hafiz Muhammad',
                                      email: 'hafiz@liveeuy.id',
                                      tier: 'VIP Cinema Ultra',
                                      role: 'admin',
                                      watchHours: 48.5,
                                      devices: 3
                                    });
                                    setShowProfileMenu(false);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 active:bg-emerald-500/20 transition-colors min-h-[38px] cursor-pointer"
                                  title="Beralih ke akun administrator"
                                >
                                  <span className="flex items-center gap-2.5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span>Akun Admin CMS</span>
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 font-mono">Hafiz</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 3. Sticky Bottom Footer with High-Visibility Logout Button */}
                          <div className="flex-shrink-0 p-2.5 sm:p-3 border-t border-white/10 bg-[#090b10] space-y-1.5">
                            {/* Main Logout Button */}
                            <button
                              type="button"
                              onClick={() => {
                                logout();
                                setCurrentTab('home');
                                navigate('/');
                                setShowProfileMenu(false);
                              }}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/35 border border-rose-500/30 text-rose-300 hover:text-white font-bold text-xs sm:text-sm transition-all min-h-[42px] cursor-pointer shadow-sm shadow-rose-950/40"
                            >
                              <LogOut className="w-4 h-4 text-rose-400" />
                              <span>Keluar dari Sesi Ini (Logout)</span>
                            </button>

                            {/* Logout Semua Device */}
                            <button
                              type="button"
                              onClick={() => {
                                openDeviceSecurityModal();
                                setShowProfileMenu(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-[11px] font-semibold cursor-pointer"
                              title="Keluar dari semua perangkat"
                            >
                              <span className="flex items-center gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-400/80" />
                                <span>Logout Semua Device</span>
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold uppercase">
                                Semua
                              </span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* ================= GUEST USER ================= */
                <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-2.5 sm:px-3 lg:px-3.5 py-1.5 text-xs lg:text-sm font-medium text-slate-300 hover:text-white transition-colors min-h-[36px] flex items-center"
                  >
                    Masuk
                  </button>

                  <button
                    onClick={() => openAuthModal('register')}
                    className="px-3 sm:px-3.5 lg:px-4 py-1.5 rounded-lg text-xs lg:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[36px] flex items-center whitespace-nowrap"
                  >
                    Daftar VIP
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          BOTTOM MOBILE NAVIGATION BAR (Native App Experience)
          ======================================================== */}
      {isInAdminPage ? (
        /* Mobile Bottom Nav in Admin Mode */
        <nav 
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08090d]/95 backdrop-blur-xl border-t border-white/[0.08] px-3 py-2 flex items-center justify-around shadow-2xl safe-area-bottom"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={() => {
              setCurrentTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex flex-col items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] mt-1 font-medium">Ke Web</span>
          </button>

          <button
            onClick={() => handleAdminModuleJump('media')}
            className="flex flex-col items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <Film className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Katalog</span>
          </button>

          <button
            onClick={() => handleAdminModuleJump('analytics')}
            className="flex flex-col items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Statistik</span>
          </button>

          <button
            onClick={() => handleAdminModuleJump('tracking')}
            className="flex flex-col items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <Globe className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Aktivitas</span>
          </button>

          <button
            onClick={() => {
              logout();
              setCurrentTab('home');
            }}
            className="flex flex-col items-center justify-center text-rose-400 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Keluar</span>
          </button>
        </nav>
      ) : (
        /* Mobile Bottom Nav in Consumer/Viewer Mode */
        <nav 
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08090d]/95 backdrop-blur-xl border-t border-white/[0.08] px-1.5 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        >
          {navItems.filter(item => item.tab !== 'trending').map(item => {
            const isActive = (location.pathname === item.path || (item.path === '/' && location.pathname === '')) && !searchQuery && !showProfileMenu;
            return (
              <Link
                key={item.tab}
                to={item.path}
                onClick={() => {
                  setSearchQuery('');
                  setShowProfileMenu(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center justify-center py-0.5 px-2 transition-colors relative ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.tab === 'watchlist' && watchlist.length > 0 && (
                    <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center">
                      {watchlist.length}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-semibold text-white' : 'font-normal'}`}>
                  {item.tabletLabel || item.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-brand-500 mt-0.5" />
                )}
              </Link>
            );
          })}

          {/* Profile / Account Tab on Mobile Bottom Bar */}
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => setShowProfileMenu(prev => !prev)}
              className={`flex flex-col items-center justify-center py-0.5 px-2 transition-colors relative cursor-pointer ${
                showProfileMenu ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label="Profil Akun"
            >
              <div className={`relative w-4.5 h-4.5 rounded-full overflow-hidden border transition-all ${
                showProfileMenu ? 'border-brand-400 ring-2 ring-brand-500/40' : 'border-white/30'
              }`}>
                <img
                  src={activeProfile?.avatar || user?.avatar}
                  alt={user?.name || 'Profil'}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${showProfileMenu ? 'font-semibold text-white' : 'font-normal'}`}>
                Profil
              </span>
              {showProfileMenu && (
                <span className="w-1 h-1 rounded-full bg-brand-500 mt-0.5" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="flex flex-col items-center justify-center py-0.5 px-2 transition-colors relative text-slate-400 hover:text-slate-200 cursor-pointer"
              aria-label="Masuk Akun"
            >
              <LogIn className="w-4 h-4" />
              <span className="text-[10px] mt-1 tracking-tight">Masuk</span>
            </button>
          )}
        </nav>
      )}
    </>
  );
};
