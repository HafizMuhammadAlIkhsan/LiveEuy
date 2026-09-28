import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Home, Search, Flame, Tv, ArrowLeft, Sparkles, Compass } from 'lucide-react';
import { useWatch } from '../../context/WatchContext';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSearchQuery } = useWatch();
  const [quickSearchInput, setQuickSearchInput] = useState('');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchInput.trim()) {
      setSearchQuery(quickSearchInput.trim());
      navigate(`/search?q=${encodeURIComponent(quickSearchInput.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 my-auto animate-fade-in">
      <div className="relative max-w-xl w-full bg-[#0d0f17]/90 border border-white/10 rounded-3xl p-6 sm:p-10 text-center shadow-2xl overflow-hidden backdrop-blur-2xl">
        {/* Ambient Cinema Neon Glows */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-brand-500/15 text-brand-300 border border-brand-500/30 tracking-widest shadow-lg shadow-brand-950/40 mb-4">
          <Film className="w-3.5 h-3.5 text-brand-400" />
          <span>404 • Adegan Tidak Ditemukan</span>
        </div>

        {/* Big Cinematic 404 Headline */}
        <div className="relative my-2 select-none">
          <span className="text-7xl sm:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-600 drop-shadow-2xl">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <Compass className="w-32 h-32 sm:w-44 h-44 text-brand-400 animate-spin-slow" />
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 mb-3">
          Gulungan Film Terputus dari Proyektor
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
          Halaman atau tayangan yang Anda tuju mungkin telah dipindahkan, berganti judul, atau tautan yang dimasukkan keliru. Jangan biarkan layar bioskop Anda padam!
        </p>

        {/* Quick Search Form */}
        <form onSubmit={handleQuickSearch} className="max-w-md mx-auto mb-6">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={quickSearchInput}
              onChange={e => setQuickSearchInput(e.target.value)}
              placeholder="Cari judul film atau aktor idola..."
              className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-surface-800/80 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-bold transition-colors cursor-pointer"
            >
              Cari
            </button>
          </div>
        </form>

        {/* Primary & Secondary Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-secondary-500 hover:from-brand-500 hover:to-secondary-600 text-white text-xs font-bold shadow-lg shadow-brand-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link
            to="/movies"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Film className="w-4 h-4 text-brand-400" />
            <span>Jelajahi Film Bioskop</span>
          </Link>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="border-t border-white/5 pt-5 text-left">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2.5 text-center">
            Atau tonton pilihan populer hari ini:
          </span>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Link
              to="/trending"
              className="px-3 py-1.5 rounded-xl bg-surface-900/90 hover:bg-surface-800 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Sedang Tren</span>
            </Link>

            <Link
              to="/tv"
              className="px-3 py-1.5 rounded-xl bg-surface-900/90 hover:bg-surface-800 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Tv className="w-3.5 h-3.5 text-cyan-400" />
              <span>Serial TV</span>
            </Link>

            <Link
              to="/watchlist"
              className="px-3 py-1.5 rounded-xl bg-surface-900/90 hover:bg-surface-800 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Koleksi Saya</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
