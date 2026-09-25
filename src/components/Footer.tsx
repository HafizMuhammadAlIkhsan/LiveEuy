import React from 'react';
import { Play, Heart, Globe, Shield, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#06070a] text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Branding & Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-secondary-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Play className="w-4 h-4 text-white fill-white translate-x-0.5" />
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">
              Live<span className="text-brand-500">Euy</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <button className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Globe className="w-3.5 h-3.5" />
              <span>Bahasa Indonesia</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Shield className="w-3.5 h-3.5" />
              <span>Kebijakan Privasi</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-white transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Pusat Bantuan</span>
            </button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-white/5">
          <div className="space-y-2">
            <p className="font-semibold text-slate-300">Navigasi</p>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Film Terbaru</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Serial TV Populer</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Top 10 Hari Ini</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Segera Hadir</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-slate-300">Genre Favorit</p>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Aksi & Petualangan</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Fiksi Ilmiah & Fantasi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Horor & Misteri</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Anime & Animasi</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-slate-300">Fitur Sinematik</p>
            <ul className="space-y-1.5 text-slate-400">
              <li><span className="text-slate-400">Audio 5.1 & Dolby Atmos</span></li>
              <li><span className="text-slate-400">Kualitas 4K Ultra HD</span></li>
              <li><span className="text-slate-400">Mode Bioskop Ambient Glow</span></li>
              <li><span className="text-slate-400">Teks Terjemahan Multibahasa</span></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-slate-300">LiveEuy Studio</p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Platform hiburan streaming online modern dengan kurasi film dan serial berkualitas terbaik di Indonesia.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© 2026 LiveEuy Cinema Inc. Seluruh hak cipta dilindungi undang-undang.</p>
          <p className="flex items-center gap-1">
            Dibuat dengan <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> untuk pengalaman menonton sinematik terbaik.
          </p>
        </div>

      </div>
    </footer>
  );
};
