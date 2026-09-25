import React from 'react';
import { Globe, Shield, HelpCircle, ShieldCheck } from 'lucide-react';
import { useWatch } from '../context/WatchContext';

export const Footer: React.FC = () => {
  const { setCurrentTab, currentTab } = useWatch();

  const handleNav = (tab: any) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/[0.08] bg-[#08090d] text-slate-400 text-xs pt-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Branding & Meta */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 text-left group cursor-pointer"
            title="LiveEuy Beranda"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white select-none">
              LIVE<span className="text-brand-500">EUY</span>
            </span>
          </button>

          <div className="flex items-center gap-4 sm:gap-6 text-xs flex-wrap">
            <button 
              onClick={() => handleNav('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                currentTab === 'admin'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                  : 'bg-white/5 text-slate-300 hover:text-white border-white/10 hover:border-white/20'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CMS Admin</span>
            </button>
            <div className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
              <Globe className="w-3.5 h-3.5" />
              <span>Indonesia (ID)</span>
            </div>
            <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors">
              <Shield className="w-3.5 h-3.5" />
              <span>Privasi</span>
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Bantuan</span>
            </a>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-4 border-t border-white/[0.06]">
          <div className="space-y-3">
            <p className="font-semibold text-white tracking-wide">Navigasi</p>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-white transition-colors">
                  Beranda
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('movies')} className="hover:text-white transition-colors">
                  Film Bioskop
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('tv')} className="hover:text-white transition-colors">
                  Serial TV & Drama
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('trending')} className="hover:text-white transition-colors">
                  Trending Populer
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('watchlist')} className="hover:text-white transition-colors">
                  Koleksi Saya
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-white tracking-wide">Kategori Sinema</p>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>
                <button onClick={() => handleNav('movies')} className="hover:text-white transition-colors">
                  Aksi & Laga
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('movies')} className="hover:text-white transition-colors">
                  Fiksi Ilmiah & Sci-Fi
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('movies')} className="hover:text-white transition-colors">
                  Horor & Misteri Nusantara
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('movies')} className="hover:text-white transition-colors">
                  Drama & Romansa
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('movies')} className="hover:text-white transition-colors">
                  Komedi Segar
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-white tracking-wide">Kualitas & Fitur</p>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li><span className="text-slate-400">Streaming 4K Ultra HD</span></li>
              <li><span className="text-slate-400">Audio Dolby Atmos 5.1</span></li>
              <li><span className="text-slate-400">Subtitle Bahasa Indonesia</span></li>
              <li><span className="text-slate-400">Floating Mini-Player</span></li>
              <li><span className="text-slate-400">Multi-Episode Auto Play</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-white tracking-wide">Tentang LiveEuy</p>
            <p className="text-slate-400 leading-relaxed text-xs">
              Layanan streaming sinematik modern dengan kurasi film dan serial berkualitas tinggi, dirancang untuk kenyamanan menonton tanpa batas di semua perangkat.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 LiveEuy Cinema Inc. Seluruh hak cipta dilindungi.</p>
          <p className="text-slate-400">
            Pengalaman Menonton Sinematik Definisi Tinggi
          </p>
        </div>

      </div>
    </footer>
  );
};
