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
  SlidersHorizontal
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
    openDetail
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
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
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
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#090a0f]/90 backdrop-blur-md border-b border-white/10 shadow-2xl py-3'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => {
                setCurrentTab('home');
                setSearchQuery('');
              }}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
                <Play className="w-5 h-5 text-white fill-white translate-x-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    Live<span className="text-brand-500">Euy</span>
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-widest block uppercase -mt-0.5">
                  Cinema Stream
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
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
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-white bg-white/10 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                    {item.tab === 'watchlist' && watchlist.length > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-500 text-white">
                        {watchlist.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Controls: Search, Notifications, Profile */}
          <div className="flex items-center gap-3">
            
            {/* Search Bar */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center bg-surface-800/90 border border-brand-500/50 rounded-full px-3 py-1.5 w-60 sm:w-80 shadow-lg shadow-brand-500/10 transition-all">
                  <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      if (e.target.value) setCurrentTab('search');
                    }}
                    placeholder="Cari judul, genre, atau aktor..."
                    className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 hover:text-white text-slate-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-1 p-1 hover:text-white text-slate-400"
                    title="Tutup Pencarian"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Cari Film"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Instant Search Results Dropdown */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-dropdown p-2 shadow-2xl z-50 animate-fade-in">
                  <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between">
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
                          className="w-12 h-16 object-cover rounded-lg flex-shrink-0 shadow"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors truncate">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span>{item.releaseYear}</span>
                            <span>•</span>
                            <span className="capitalize">{item.type === 'movie' ? 'Film' : 'Serial'}</span>
                            <span>•</span>
                            <span className="text-amber-400 font-medium">★ {item.rating}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-1">
                            {item.genres.join(', ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Center Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors relative"
                aria-label="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-[#090a0f]"></span>
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 rounded-2xl glass-dropdown p-3 shadow-2xl z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Notifikasi Terbaru
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
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-400 flex-shrink-0" />
                        <span className="text-xs font-semibold text-white">Episode Baru Rilis!</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Cyberpunk: Neo Nusantara Musim 2 Episode 1 sekarang sudah tayang dalam format 4K UHD.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">15 menit lalu</span>
                    </div>

                    <div 
                      onClick={() => {
                        const target = allMedia.find(m => m.id === 'bayang-di-balik-kabut');
                        if (target) openDetail(target);
                        setShowNotifications(false);
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="text-xs font-semibold text-white">Rekomendasi Minggu Ini</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Film horor terlaris "Bayang di Balik Kabut" menempati Top 3 di Indonesia.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">2 jam lalu</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Profil Pengguna"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-surface-900 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-2 w-56 rounded-2xl glass-dropdown p-2 shadow-2xl z-50 animate-fade-in text-sm">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="font-semibold text-white">Hafiz Muhammad</p>
                    <p className="text-xs text-brand-400 font-medium">Paket VIP Cinema Ultra</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setCurrentTab('watchlist');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-brand-400" />
                      Daftar Tontonan
                    </button>
                    <button
                      onClick={() => {
                        alert('Fitur Pengaturan Profil & Kualitas Audio/Video Streaming.');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                      Preferensi Streaming
                    </button>
                  </div>
                  <div className="pt-1 border-t border-white/10">
                    <button
                      onClick={() => {
                        alert('Akun telah logout simulasi.');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Subnavigation */}
        <div className="flex md:hidden items-center justify-around pt-3 pb-1 border-t border-white/5 mt-2 overflow-x-auto scrollbar-none">
          {navItems.map(item => {
            const isActive = currentTab === item.tab && !searchQuery;
            return (
              <button
                key={item.tab}
                onClick={() => {
                  setCurrentTab(item.tab);
                  setSearchQuery('');
                }}
                className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'text-brand-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="mt-1 text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
