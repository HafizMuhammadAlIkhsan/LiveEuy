import React from 'react';
import { Sparkles, X, Check, Film, Tv } from 'lucide-react';
import { StreamingPlatformFilter, STREAMING_PLATFORMS } from '../data/mockData';
import { StreamingPlatform } from '../types';

export interface StreamingHubsProps {
  selectedPlatform: StreamingPlatformFilter;
  onSelectPlatform: (platform: StreamingPlatformFilter) => void;
  counts?: Record<string, number>;
  variant?: 'full' | 'compact';
  showAllButton?: boolean;
  className?: string;
}

// -------------------------------------------------------------
// HIGH QUALITY SVG VECTOR LOGOS FOR STREAMING PLATFORMS
// -------------------------------------------------------------

export const NetflixLogo: React.FC<{ className?: string }> = ({ className = 'h-6 sm:h-7' }) => (
  <svg 
    viewBox="0 0 111 30" 
    aria-hidden="true" 
    className={`${className} fill-current text-[#E50914] drop-shadow-[0_2px_8px_rgba(229,9,20,0.5)]`}
  >
    <path d="M105.062 14.28L111 30c-1.75-.48-3.5-.88-5.28-1.21l-3.32-8.5-3.33 8.1c-1.63-.23-3.26-.41-4.89-.54l5.63-13.57-5.32-12.82c1.7.13 3.39.31 5.08.54l3.05 7.73 3.06-7.39c1.78.33 3.55.73 5.29 1.2l-5.91 14.67zM90.472 5.01v22.42c-1.67-.18-3.35-.31-5.04-.39v-22c1.69.08 3.37.21 5.04.39v-.42zm-8.88-1.04v21.57c-1.67-.12-3.34-.19-5.02-.23V3.74c1.68.04 3.35.11 5.02.23zm-13.88 4.2v4.88h7.94v4.35h-7.94v8.03c-1.67-.04-3.33-.06-5-.06V3.34c4.32.08 8.64.21 12.94.39v4.44H67.712zm-12.63 9.42l6.21 13.06c-1.78.02-3.56.07-5.33.15l-3.57-7.85-3.56 7.72c-1.69-.11-3.37-.19-5.06-.24l6.09-12.84-5.74-12.21c1.74.19 3.47.41 5.2.66l3.35 7.42 3.35-7.07c1.71.25 3.41.53 5.11.83l-6.05 12.37zm-22.18-8.24h-4.99v19.46c-1.66-.1-3.33-.17-5-.21V3.03c4.99.23 9.98.54 14.97.94v4.4h-4.98v16.14c-1.66-.08-3.33-.14-5-.18V9.35zm-15.03-6.6l6.83 23.95c-1.63-.07-3.26-.11-4.9-.13L26.37 8.94l-4.52 17.5c-1.62-.05-3.23-.08-4.85-.08L10.16 2.37c1.73.1 3.45.23 5.17.39l4.5 16.94 4.54-17.15c1.71.18 3.41.38 5.1.59l-4.5 17.15 4.5-16.94c1.7-.16 3.42-.29 5.15-.39zM0 2.22c5.44.25 10.87.59 16.27 1.02V7.7H5.21v5.18h9.84v4.41H5.21v6.98H0V2.22z" />
  </svg>
);

export const DisneyPlusLogo: React.FC<{ className?: string }> = ({ className = 'h-7 sm:h-8' }) => (
  <div className={`flex items-center justify-center gap-1 font-black tracking-tight text-white ${className}`}>
    <span className="font-serif italic text-lg sm:text-xl text-white tracking-wide drop-shadow-[0_2px_10px_rgba(0,99,229,0.8)]">
      Disney
    </span>
    <span className="text-xl sm:text-2xl font-black text-[#0063E5] drop-shadow-[0_0_12px_rgba(0,168,255,0.9)] -ml-0.5">
      +
    </span>
  </div>
);

export const PrimeVideoLogo: React.FC<{ className?: string }> = ({ className = 'h-6 sm:h-7' }) => (
  <div className={`flex flex-col items-center justify-center font-bold leading-none ${className}`}>
    <div className="flex items-baseline gap-1 text-white tracking-tight">
      <span className="text-base sm:text-lg font-black text-white">prime</span>
      <span className="text-xs sm:text-sm font-medium text-slate-300">video</span>
    </div>
    {/* Iconic curved smile underline in electric cyan */}
    <svg viewBox="0 0 60 10" className="w-12 h-2 text-[#00A8E1] fill-current">
      <path d="M2 3c15 6 38 6 56 0-3 3-18 6-36 6S5 6 2 3z" />
      <polygon points="56,3 52,1 55,6" />
    </svg>
  </div>
);

export const HboLogo: React.FC<{ className?: string }> = ({ className = 'h-6 sm:h-7' }) => (
  <div className={`flex items-center justify-center gap-1.5 ${className}`}>
    <span className="text-lg sm:text-xl font-black tracking-wider text-white drop-shadow-[0_2px_10px_rgba(153,0,255,0.8)]">
      HBO
    </span>
    <span className="text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-[#9900FF] to-[#6C2BD9] text-white tracking-widest uppercase shadow-md shadow-purple-600/40">
      MAX
    </span>
  </div>
);

// -------------------------------------------------------------
// BRAND PLATFORM CONFIGURATIONS
// -------------------------------------------------------------

export type StreamingHubPlatform = 'Netflix' | 'Disney+' | 'Prime Video' | 'HBO';

interface PlatformConfig {
  id: StreamingHubPlatform;
  label: string;
  badge: string;
  tagline: string;
  themeColor: string;
  bgGradient: string;
  hoverGlow: string;
  activeBorder: string;
  activeRing: string;
  activeShadow: string;
  LogoComponent: React.FC<{ className?: string }>;
}

export const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: 'Netflix',
    label: 'Netflix',
    badge: 'Netflix Originals',
    tagline: 'Serial & Film Pemenang Penghargaan',
    themeColor: '#E50914',
    bgGradient: 'from-[#E50914]/20 via-[#1c0406]/70 to-[#0c0506]',
    hoverGlow: 'hover:border-[#E50914]/80 hover:shadow-red-600/30',
    activeBorder: 'border-[#E50914]',
    activeRing: 'ring-2 ring-[#E50914]/60',
    activeShadow: 'shadow-xl shadow-red-600/25',
    LogoComponent: NetflixLogo,
  },
  {
    id: 'Disney+',
    label: 'Disney+',
    badge: 'Disney+ Exclusive',
    tagline: 'Marvel, Star Wars & Petualangan Keluarga',
    themeColor: '#0063E5',
    bgGradient: 'from-[#0063E5]/25 via-[#03153b]/70 to-[#030919]',
    hoverGlow: 'hover:border-[#0063E5]/80 hover:shadow-blue-600/30',
    activeBorder: 'border-[#0063E5]',
    activeRing: 'ring-2 ring-[#0063E5]/60',
    activeShadow: 'shadow-xl shadow-blue-600/25',
    LogoComponent: DisneyPlusLogo,
  },
  {
    id: 'Prime Video',
    label: 'Prime Video',
    badge: 'Prime Originals',
    tagline: 'Amazon Originals & Sinema Blockbuster',
    themeColor: '#00A8E1',
    bgGradient: 'from-[#00A8E1]/20 via-[#032033]/70 to-[#020e17]',
    hoverGlow: 'hover:border-[#00A8E1]/80 hover:shadow-sky-500/30',
    activeBorder: 'border-[#00A8E1]',
    activeRing: 'ring-2 ring-[#00A8E1]/60',
    activeShadow: 'shadow-xl shadow-sky-500/25',
    LogoComponent: PrimeVideoLogo,
  },
  {
    id: 'HBO',
    label: 'HBO',
    badge: 'HBO Original',
    tagline: 'Serial Drama Bergengsi & Layar Lebar',
    themeColor: '#9900FF',
    bgGradient: 'from-[#9900FF]/25 via-[#210438]/70 to-[#0c0215]',
    hoverGlow: 'hover:border-[#9900FF]/80 hover:shadow-purple-600/30',
    activeBorder: 'border-[#9900FF]',
    activeRing: 'ring-2 ring-[#9900FF]/60',
    activeShadow: 'shadow-xl shadow-purple-600/25',
    LogoComponent: HboLogo,
  },
];

// -------------------------------------------------------------
// MAIN COMPONENT: STREAMING PLATFORM BRAND HUBS
// -------------------------------------------------------------

export const StreamingHubs: React.FC<StreamingHubsProps> = ({
  selectedPlatform,
  onSelectPlatform,
  counts = {},
  variant = 'full',
  showAllButton = true,
  className = '',
}) => {
  const isAllSelected = selectedPlatform === 'Semua Platform';
  const totalCount = counts['Semua Platform'] ?? Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header Label and Subtitle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
            Jelajahi Koleksi Eksklusif Berdasarkan Studio & Platform
          </h3>
        </div>

        {selectedPlatform !== 'Semua Platform' && (
          <button
            onClick={() => onSelectPlatform('Semua Platform')}
            className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors"
          >
            <span>Tampilkan Semua Studio</span>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Brand Hub Cards Grid / Scrollable on mobile */}
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Hub Option 0: Semua Platform (All Hubs) */}
        {showAllButton && (
          <button
            type="button"
            role="tab"
            aria-selected={isAllSelected}
            aria-label="Tampilkan Semua Platform"
            onClick={() => onSelectPlatform('Semua Platform')}
            className={`group relative overflow-hidden rounded-2xl p-3.5 sm:p-4 text-left transition-all duration-300 backdrop-blur-xl flex flex-col justify-between min-h-[96px] sm:min-h-[110px] border cursor-pointer ${
              isAllSelected
                ? 'bg-gradient-to-br from-brand-600/30 via-surface-800 to-surface-900 border-brand-500 ring-2 ring-brand-500/50 shadow-xl shadow-brand-500/20 scale-[1.02]'
                : 'bg-surface-900/80 hover:bg-surface-800/90 border-white/10 hover:border-white/20 hover:scale-[1.02]'
            }`}
          >
            {/* Top Shine Flare */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl transition-colors ${
                  isAllSelected ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-300 group-hover:text-white'
                }`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-white">
                  Semua
                </span>
              </div>

              {isAllSelected && (
                <span className="w-2 h-2 rounded-full bg-brand-400 ring-4 ring-brand-400/20" />
              )}
            </div>

            <div className="mt-2 space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-300 block">
                Semua Eksklusif
              </span>
              <span className="text-[10px] text-slate-500 block">
                {totalCount > 0 ? `${totalCount} Film & Serial Tersedia` : 'Seluruh Katalog Film & Serial'}
              </span>
            </div>
          </button>
        )}

        {/* Brand Hub Cards: Netflix, Disney+, Prime Video, HBO */}
        {PLATFORM_CONFIGS.map((platform) => {
          const isSelected = selectedPlatform === platform.id;
          const count = counts[platform.id] || 0;
          const Logo = platform.LogoComponent;

          return (
            <button
              key={platform.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-label={`Pilih Koleksi Eksklusif ${platform.label}`}
              onClick={() => onSelectPlatform(platform.id)}
              className={`group relative overflow-hidden rounded-2xl p-3.5 sm:p-4 text-left transition-all duration-300 backdrop-blur-xl flex flex-col justify-between min-h-[96px] sm:min-h-[110px] border cursor-pointer ${
                isSelected
                  ? `bg-gradient-to-br ${platform.bgGradient} ${platform.activeBorder} ${platform.activeRing} ${platform.activeShadow} scale-[1.02]`
                  : `bg-surface-900/80 hover:bg-surface-800/90 border-white/10 ${platform.hoverGlow} hover:scale-[1.02]`
              }`}
            >
              {/* Glossy Reflection Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity" />

              {/* Top Row: Brand Logo & Active Indicator */}
              <div className="flex items-center justify-between w-full relative z-10">
                <div className="h-6 sm:h-7 flex items-center group-hover:scale-105 transition-transform origin-left">
                  <Logo />
                </div>

                {isSelected ? (
                  <span 
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: platform.themeColor }}
                  >
                    <Check className="w-2.5 h-2.5" />
                    <span>Aktif</span>
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white/50 transition-colors" />
                )}
              </div>

              {/* Bottom Row: Platform Badge & Count */}
              <div className="mt-2.5 space-y-0.5 relative z-10">
                <span className="text-[11px] sm:text-xs font-bold text-white group-hover:text-slate-100 transition-colors block truncate">
                  {platform.badge}
                </span>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors block">
                  {count > 0 ? `${count} Film & Serial` : platform.tagline}
                </span>
              </div>
            </button>
          );
        })}

      </div>
    </div>
  );
};

// -------------------------------------------------------------
// SPOTLIGHT EXCLUSIVE BANNER COMPONENT
// Shown above the catalog when a streaming platform is selected
// -------------------------------------------------------------

export interface StreamingPlatformBannerProps {
  platform: StreamingPlatformFilter;
  onClear: () => void;
  count: number;
  onViewAllCatalog?: () => void;
  viewAllLabel?: string;
}

export const StreamingPlatformBanner: React.FC<StreamingPlatformBannerProps> = ({
  platform,
  onClear,
  count,
  onViewAllCatalog,
  viewAllLabel = 'Lihat Semua (Film & Serial)',
}) => {
  if (platform === 'Semua Platform') return null;

  const config = PLATFORM_CONFIGS.find(p => p.id === platform);
  if (!config) return null;

  const Logo = config.LogoComponent;

  return (
    <div 
      className={`relative overflow-hidden rounded-3xl border ${config.activeBorder} bg-gradient-to-r ${config.bgGradient} p-4 sm:p-6 shadow-2xl transition-all animate-fade-in`}
    >
      {/* Background ambient glow */}
      <div 
        className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ backgroundColor: config.themeColor }}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Brand Identity & Message */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg flex-shrink-0 flex items-center justify-center">
            <Logo className="h-7 sm:h-9" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span 
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm"
                style={{ backgroundColor: config.themeColor }}
              >
                Koleksi Eksklusif
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Menampilkan <strong className="text-white font-bold">{count}</strong> film & serial eksklusif
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              {config.badge}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-1">
              {config.tagline}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto flex-shrink-0">
          {onViewAllCatalog && (
            <button
              type="button"
              onClick={onViewAllCatalog}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              style={{ backgroundColor: config.themeColor }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{viewAllLabel}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Lihat Semua Studio</span>
          </button>
        </div>

      </div>
    </div>
  );
};
