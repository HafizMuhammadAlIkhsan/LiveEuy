import React from 'react';
import { 
  BarChart3, 
  Download, 
  Award, 
  Star, 
  ArrowUpRight, 
  AlertCircle, 
  Flame, 
  Eye, 
  Play, 
  TrendingUp, 
  ThumbsUp, 
  ThumbsDown, 
  Search, 
  ExternalLink, 
  Edit3 
} from 'lucide-react';
import { MediaItem } from '../../../../types';
import { MediaAnalyticsItem } from '../../types';

interface AnalyticsModuleProps {
  exportAnalyticsCSV: () => void;
  totalViewsAccumulated: number;
  totalWatchHoursAccumulated: number;
  averageRatingAcrossCatalog: number;
  bestRatedMedia: MediaAnalyticsItem | null;
  lowestRatedMedia: MediaAnalyticsItem | null;
  mostWatchedMedia: MediaAnalyticsItem | null;
  openDetail: (item: MediaItem) => void;
  openEditModal: (item: MediaItem) => void;
  openPlayer: (item: MediaItem) => void;
  top5MostWatched: MediaAnalyticsItem[];
  top3HighestRated: MediaAnalyticsItem[];
  top3LowestRated: MediaAnalyticsItem[];
  allMediaLength: number;
  ratingDistribution: { d9: number; d8: number; d7: number; dLow: number };
  analyticsSearch: string;
  setAnalyticsSearch: (val: string) => void;
  analyticsFilterType: 'all' | 'movie' | 'tv';
  setAnalyticsFilterType: (val: 'all' | 'movie' | 'tv') => void;
  analyticsSortBy: 'views' | 'watchHours' | 'ratingDesc' | 'ratingAsc';
  setAnalyticsSortBy: (val: 'views' | 'watchHours' | 'ratingDesc' | 'ratingAsc') => void;
  filteredAnalyticsMedia: MediaAnalyticsItem[];
}

export const AnalyticsModule: React.FC<AnalyticsModuleProps> = ({
  exportAnalyticsCSV,
  totalViewsAccumulated,
  totalWatchHoursAccumulated,
  averageRatingAcrossCatalog,
  bestRatedMedia,
  lowestRatedMedia,
  mostWatchedMedia,
  openDetail,
  openEditModal,
  openPlayer,
  top5MostWatched,
  top3HighestRated,
  top3LowestRated,
  allMediaLength,
  ratingDistribution,
  analyticsSearch,
  setAnalyticsSearch,
  analyticsFilterType,
  setAnalyticsFilterType,
  analyticsSortBy,
  setAnalyticsSortBy,
  filteredAnalyticsMedia
}) => {
  return (
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
            className="px-3.5 py-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow hover:scale-105 active:scale-95 cursor-pointer"
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
                className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
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
                className="text-rose-400 hover:text-rose-300 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
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
                className="text-brand-400 hover:text-brand-300 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
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
              <span className="text-white font-mono text-[10px]">{allMediaLength} total tayangan</span>
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
                className={`px-3 py-1 rounded-lg transition-colors font-semibold cursor-pointer ${
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
                          className="p-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white transition-colors cursor-pointer"
                          title="Putar Video Preview"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => openDetail(item)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                          title="Lihat Detail Tayangan"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
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
  );
};
