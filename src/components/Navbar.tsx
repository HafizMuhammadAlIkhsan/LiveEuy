import React, { useState, useEffect, useRef } from 'react';
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
  Smartphone
} from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { ViewTab } from '../types';

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
    login,
    broadcastAnnouncement
  } = useWatch();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isAdminUser = Boolean(user && user.role === 'admin');
  const isInAdminPage = currentTab === 'admin';

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

  const searchResults = searchQuery.trim()
    ? allMedia.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.cast.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  const navItems: { tab: ViewTab; label: string; tabletLabel?: string; icon: React.ReactNode }[] = [
    { tab: 'home', label: 'Beranda', icon: <Play className="w-4 h-4" /> },
    { tab: 'movies', label: 'Film', icon: <Film className="w-4 h-4" /> },
    { tab: 'tv', label: 'Serial TV', tabletLabel: 'Serial', icon: <Tv className="w-4 h-4" /> },
    { tab: 'trending', label: 'Trending', icon: <Flame className="w-4 h-4" /> },
    { tab: 'watchlist', label: 'Koleksi Saya', tabletLabel: 'Koleksi', icon: <Bookmark className="w-4 h-4" /> },
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
              <button
                onClick={() => {
                  setCurrentTab('home');
                  setSearchQuery('');
                }}
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
              </button>

              {/* DESKTOP & TABLET CENTER NAVIGATION */}
              {isInAdminPage ? (
                /* Admin Topbar: Return to Website */
                <div className="hidden md:flex items-center gap-2 lg:gap-3">
                  <button
                    onClick={() => {
                      setCurrentTab('home');
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors text-xs font-medium min-h-[36px]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kembali ke Website</span>
                  </button>
                  <span className="hidden lg:inline text-xs text-slate-400 font-medium">Panel Kontrol CMS</span>
                </div>
              ) : (
                /* Regular User Consumer Tabs (Beranda, Film, Serial, Trending, Koleksi) */
                <nav className="hidden md:flex items-center gap-1 md:gap-1.5 lg:gap-5 xl:gap-7">
                  {navItems.map(item => {
                    const isActive = currentTab === item.tab && !searchQuery;
                    return (
                      <button
                        key={item.tab}
                        onClick={() => {
                          setCurrentTab(item.tab);
                          setSearchQuery('');
                        }}
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
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Right Controls: Search, Notifications, Profile / Login */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2 lg:gap-3.5 xl:gap-4 flex-shrink-0">
              
              {/* Search Bar (Expandable) */}
              <div className="relative">
                {isSearchOpen ? (
                  <div className="flex items-center bg-[#10121a] rounded-full px-2.5 sm:px-3 py-1.5 w-44 xs:w-56 sm:w-64 md:w-44 md:focus-within:w-56 lg:w-64 lg:focus-within:w-72 xl:w-80 shadow-xl border border-white/15 focus-within:border-brand-500/50 transition-all duration-200">
                    <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 mr-1.5 sm:mr-2 flex-shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => {
                        setSearchQuery(e.target.value);
                        if (e.target.value) setCurrentTab('search');
                      }}
                      placeholder="Cari judul film, serial..."
                      className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
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
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors"
                    aria-label="Cari Film"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}

                {/* Instant Search Results Dropdown */}
                {isSearchOpen && searchResults.length > 0 && (
                  <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 md:w-84 lg:w-96 max-w-[calc(100vw-2rem)] rounded-xl bg-[#10121a]/95 backdrop-blur-xl border border-white/10 p-2 shadow-2xl z-50 animate-fade-in max-h-80 overflow-y-auto custom-scrollbar">
                    <div className="px-3 py-1.5 text-[10px] sm:text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between border-b border-white/5 pb-2 mb-1">
                      <span>Hasil Pencarian</span>
                      <span className="text-brand-400 font-bold">{searchResults.length} ditemukan</span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {searchResults.map(item => (
                        <div
                          key={item.id}
                          onClick={() => {
                            openDetail(item);
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
                        >
                          <img
                            src={item.posterUrl}
                            alt={item.title}
                            className="w-10 h-14 object-cover rounded-md flex-shrink-0 shadow"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-brand-400 transition-colors truncate">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                              <span>{item.releaseYear}</span>
                              <span>•</span>
                              <span className="capitalize">{item.type === 'movie' ? 'Film' : 'Serial'}</span>
                              <span>•</span>
                              <span className="text-amber-400 font-medium">★ {item.rating}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CROSS-PLATFORM MOBILE & BACKEND SYNC BUTTON */}
              <button
                onClick={() => openMobileSync()}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-brand-500/40 transition-all min-h-[36px] shadow-sm cursor-pointer group"
                title="Buka Hub Koneksi Mobile (Flutter) & Backend (Spring Boot/Go)"
                aria-label="Koneksi Mobile dan Backend"
              >
                <div className="relative">
                  <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-400 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="hidden md:inline font-medium">Buka di HP</span>
              </button>

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
                  
                  {/* ADMIN ACTION BUTTON: Only rendered if user is Admin */}
                  {isAdminUser && (
                    isInAdminPage ? (
                      <button
                        onClick={() => {
                          setCurrentTab('home');
                          setSearchQuery('');
                        }}
                        className="md:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 text-white border border-white/15 min-h-[36px]"
                        title="Kembali ke Web"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Web</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setCurrentTab('admin');
                          setSearchQuery('');
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 min-h-[36px]"
                        title="Buka Panel Manajemen CMS Admin"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden xs:inline md:hidden lg:inline">CMS Admin</span>
                        <span className="hidden md:inline lg:hidden">CMS</span>
                      </button>
                    )
                  )}

                  {/* Profile Menu Popover */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-lg hover:bg-white/5 transition-colors min-h-[36px]"
                      aria-label="Profil Pengguna"
                    >
                      {/* Netflix-style clean square avatar */}
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md overflow-hidden bg-surface-800 border border-white/20 hover:border-white/40 transition-colors">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                    </button>

                    {showProfileMenu && (
                      <div className="absolute top-full right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl bg-[#10121a]/95 backdrop-blur-xl border border-white/10 p-2 shadow-2xl z-50 animate-fade-in text-xs sm:text-sm">
                        
                        {/* Profile Header */}
                        <div className="px-3 py-2.5 border-b border-white/10">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-white truncate">{user.name}</p>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                              {user.tier}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                        </div>

                        {/* Menu Options */}
                        <div className="py-1">
                          {isAdminUser && (
                            isInAdminPage ? (
                              <button
                                onClick={() => {
                                  setCurrentTab('home');
                                  setShowProfileMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors min-h-[40px]"
                              >
                                <ArrowLeft className="w-4 h-4 text-brand-400" />
                                <span>Kembali ke Website</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setCurrentTab('admin');
                                  setShowProfileMenu(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors font-medium min-h-[40px]"
                              >
                                <span className="flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                  <span>Panel CMS Admin</span>
                                </span>
                              </button>
                            )
                          )}

                          <button
                            onClick={() => {
                              setCurrentTab('watchlist');
                              setShowProfileMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors min-h-[40px]"
                          >
                            <Bookmark className="w-4 h-4 text-brand-400" />
                            <span>Koleksi & Riwayat Saya</span>
                          </button>

                          {/* Quick Role Switcher for Pair-Testing */}
                          {isAdminUser ? (
                            <button
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
                                setShowProfileMenu(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors border-t border-white/5 mt-1 min-h-[40px]"
                              title="Beralih ke akun penonton"
                            >
                              <span className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-slate-400" />
                                <span>Akun Penonton</span>
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 font-mono">Budi</span>
                            </button>
                          ) : (
                            <button
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
                              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors border-t border-white/5 mt-1 min-h-[40px]"
                              title="Beralih ke akun administrator"
                            >
                              <span className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span>Akun Admin CMS</span>
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 font-mono">Hafiz</span>
                            </button>
                          )}

                          {/* Logout */}
                          <button
                            onClick={() => {
                              logout();
                              setCurrentTab('home');
                              setShowProfileMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors min-h-[40px]"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Keluar</span>
                          </button>
                        </div>
                      </div>
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
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08090d]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-2 flex items-center justify-around shadow-2xl safe-area-bottom"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        >
          {navItems.map(item => {
            const isActive = currentTab === item.tab && !searchQuery;
            return (
              <button
                key={item.tab}
                onClick={() => {
                  setCurrentTab(item.tab);
                  setSearchQuery('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center justify-center py-0.5 px-3 transition-colors relative ${
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
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-brand-500 mt-0.5" />
                )}
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
};
