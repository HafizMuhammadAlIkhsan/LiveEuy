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
  SlidersHorizontal,
  LogOut,
  User,
  LogIn,
  Crown,
  ShieldCheck
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
    openAuthModal
  } = useWatch();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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

  // Handle outside click for popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? allMedia.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.cast.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  const navItems: { tab: ViewTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'home', label: 'Beranda', icon: <Play className="w-4 h-4" /> },
    { tab: 'movies', label: 'Film', icon: <Film className="w-4 h-4" /> },
    { tab: 'tv', label: 'Serial TV', icon: <Tv className="w-4 h-4" /> },
    { tab: 'trending', label: 'Trending', icon: <Flame className="w-4 h-4" /> },
    { tab: 'watchlist', label: 'Koleksi Saya', icon: <Bookmark className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* ========================================================
          TOP NAVBAR (Desktop, Tablet & Mobile Header)
          ======================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#090a0f]/95 backdrop-blur-md border-b border-white/10 shadow-2xl py-2.5 sm:py-3.5'
            : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-3 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Logo & Desktop Nav Links */}
            <div className="flex items-center gap-4 lg:gap-8 min-w-0">
              <button
                onClick={() => {
                  setCurrentTab('home');
                  setSearchQuery('');
                }}
                className="flex items-center gap-2 group cursor-pointer text-left flex-shrink-0"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-secondary-500 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white translate-x-0.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                      Live<span className="text-brand-500">Euy</span>
                    </span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                    </span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-widest block uppercase -mt-0.5 hidden xs:block">
                    Cinema Stream
                  </span>
                </div>
              </button>

              {/* Desktop / Large Tablet Navigation Links (Hidden on Mobile) */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map(item => {
                  const isActive = currentTab === item.tab && !searchQuery;
                  return (
                    <button
                      key={item.tab}
                      onClick={() => {
                        setCurrentTab(item.tab);
                        setSearchQuery('');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'text-white bg-white/10 shadow-sm font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.label}
                      {item.tab === 'watchlist' && watchlist.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-brand-500 text-white">
                          {watchlist.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right Controls: Search, Notifications, Profile */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              
              {/* Search Bar (Responsive expandable input) */}
              <div className="relative">
                {isSearchOpen ? (
                  <div className="flex items-center bg-surface-800/95 border border-brand-500/60 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 w-48 xs:w-60 sm:w-72 md:w-80 shadow-xl transition-all">
                    <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 mr-1.5 flex-shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => {
                        setSearchQuery(e.target.value);
                        if (e.target.value) setCurrentTab('search');
                      }}
                      placeholder="Cari film atau serial..."
                      className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="p-1 hover:text-white text-slate-400"
                      >
                        <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="ml-1 p-1 hover:text-white text-slate-400"
                      title="Tutup Pencarian"
                    >
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 sm:p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Cari Film"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}

                {/* Instant Search Results Dropdown */}
                {isSearchOpen && searchResults.length > 0 && (
                  <div className="absolute top-full right-0 mt-2 w-72 sm:w-96 rounded-2xl glass-dropdown p-2 shadow-2xl z-50 animate-fade-in max-h-80 overflow-y-auto custom-scrollbar">
                    <div className="px-3 py-1 text-[10px] sm:text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between">
                      <span>Hasil Pencarian</span>
                      <span>{searchResults.length} ditemukan</span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {searchResults.map(item => (
                        <div
                          key={item.id}
                          onClick={() => {
                            openDetail(item);
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors group"
                        >
                          <img
                            src={item.posterUrl}
                            alt={item.title}
                            className="w-10 h-14 sm:w-12 sm:h-16 object-cover rounded-lg flex-shrink-0 shadow"
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

              {/* Notification Popover */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 sm:p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors relative"
                  aria-label="Notifikasi"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-[#090a0f]"></span>
                </button>

                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 rounded-2xl glass-dropdown p-3 shadow-2xl z-50 animate-fade-in text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
                        Notifikasi
                      </span>
                      <span className="text-[10px] text-brand-400 hover:underline cursor-pointer">
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
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                          <span className="font-semibold text-white">Episode Baru Rilis!</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                          Cyberpunk: Neo Nusantara Musim 2 Episode 1 siap diputar dalam 4K UHD.
                        </p>
                        <span className="text-[9px] text-slate-400 mt-1 block">15 menit lalu</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Auth Controls: Logged In vs Guest */}
              {isLoggedIn && user ? (
                /* ================= LOGGED IN USER ================= */
                <div className="flex items-center gap-2">
                  {/* VIP Tier Badge */}
                  <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>{user.tier}</span>
                  </span>

                  {/* Admin Panel Quick Access Button */}
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        setCurrentTab(currentTab === 'admin' ? 'home' : 'admin');
                        setSearchQuery('');
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                        currentTab === 'admin'
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400'
                          : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                      }`}
                      title="Buka Panel Manajemen Admin"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Admin</span>
                    </button>
                  )}

                  {/* Profile Menu Popover */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-1.5 p-0.5 sm:p-1 rounded-full hover:bg-white/10 transition-colors"
                      aria-label="Profil Pengguna"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-500 via-brand-500 to-indigo-500 p-0.5 shadow-md">
                        <div className="w-full h-full rounded-full bg-surface-900 flex items-center justify-center overflow-hidden">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                    </button>

                    {showProfileMenu && (
                      <div className="absolute top-full right-0 mt-2 w-56 sm:w-64 rounded-2xl glass-dropdown p-2 shadow-2xl z-50 animate-fade-in text-xs sm:text-sm">
                        <div className="px-3 py-2.5 border-b border-white/10">
                          <p className="font-bold text-white truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                              {user.tier}
                            </span>
                            {user.role === 'admin' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Administrator
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="py-1">
                          {user.role === 'admin' && (
                            <button
                              onClick={() => {
                                setCurrentTab('admin');
                                setShowProfileMenu(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors font-medium"
                            >
                              <span className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span>Panel Admin</span>
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 font-bold uppercase tracking-wider">
                                CMS
                              </span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setCurrentTab('watchlist');
                              setShowProfileMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Bookmark className="w-4 h-4 text-brand-400" />
                            <span>Koleksi & Riwayat</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              logout();
                              setShowProfileMenu(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-colors border-t border-white/5 mt-1"
                          >
                            <span className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>Coba Mode Tamu</span>
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 font-mono">Demo</span>
                          </button>

                          <button
                            onClick={() => {
                              logout();
                              setShowProfileMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Keluar (Logout)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ================= GUEST USER ================= */
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 text-slate-400 border border-white/10">
                    Mode Tamu
                  </span>

                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk</span>
                  </button>

                  <button
                    onClick={() => openAuthModal('register')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-600 to-secondary-500 hover:from-brand-500 hover:to-secondary-600 text-white shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                  >
                    <span>Daftar VIP</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          BOTTOM MOBILE NAVIGATION BAR (App-Like Mobile Experience)
          ======================================================== */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090a0f]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom"
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
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive ? 'text-brand-500 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.tab === 'watchlist' && watchlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {watchlist.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
