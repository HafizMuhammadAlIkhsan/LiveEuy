import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Megaphone, 
  TrendingUp, 
  Tv, 
  Monitor, 
  Film, 
  Layers, 
  DollarSign, 
  Send, 
  ShieldCheck,
  Building,
  Mail,
  Phone,
  UserCheck
} from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { AdPlacementLayer } from '../types';

export const PartnershipModal: React.FC = () => {
  const { isPartnershipModalOpen, closePartnershipModal, submitAdInquiry } = useWatch();

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [budgetRange, setBudgetRange] = useState('Rp 10.000.000 - Rp 25.000.000');
  const [selectedLayers, setSelectedLayers] = useState<AdPlacementLayer[]>(['billboard_feed']);
  const [campaignObjective, setCampaignObjective] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isPartnershipModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactName || !email) return;

    submitAdInquiry({
      companyName,
      contactName,
      email,
      phone,
      budgetRange,
      interestedLayers: selectedLayers,
      campaignObjective: campaignObjective || 'Promosi brand dan peningkatan awareness di platform LiveEuy.'
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      closePartnershipModal();
    }, 2800);
  };

  const toggleLayer = (layer: AdPlacementLayer) => {
    if (selectedLayers.includes(layer)) {
      if (selectedLayers.length > 1) {
        setSelectedLayers(selectedLayers.filter(l => l !== layer));
      }
    } else {
      setSelectedLayers([...selectedLayers, layer]);
    }
  };

  const AD_LAYERS = [
    {
      id: 'billboard_feed' as AdPlacementLayer,
      title: 'In-Feed Cinema Billboard (16:9)',
      desc: 'Banner sinematik berdaya pikat tinggi di antara baris katalog film terpopuler.',
      icon: Layers,
      highlight: 'Paling Populer',
      badgeColor: 'bg-brand-500/20 text-brand-300 border-brand-500/30'
    },
    {
      id: 'video_preroll' as AdPlacementLayer,
      title: 'Video Player Pre-Roll & Mid-Roll',
      desc: 'Spot iklan video interaktif 5s - 15s tepat sebelum penonton memulai tayangan.',
      icon: Tv,
      highlight: 'Tingkat Konversi Tinggi',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'hero_spotlight' as AdPlacementLayer,
      title: 'Hero Spotlight Carousel Takeover',
      desc: 'Tayang langsung di carousel teratas beranda utama saat pengunjung membuka website.',
      icon: Film,
      highlight: 'Maksimal Exposure',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'top_marquee' as AdPlacementLayer,
      title: 'Top Broadcast Header Marquee',
      desc: 'Running text sponsor dan pengumuman promo di header paling atas seluruh halaman.',
      icon: Megaphone,
      highlight: 'Jangkauan Luas',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-surface-900 border border-white/10 p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={closePartnershipModal}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-12 text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white">
              Pengajuan Kemitraan Iklan Berhasil Dikirim!
            </h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Terima kasih atas minat brand <strong className="text-white">{companyName}</strong>. Tim Kemitraan Komersial LiveEuy akan segera menghubungi Anda dalam 1x24 jam kerja melalui email <strong className="text-brand-400">{email}</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Modal Title & Pitch */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Program Kemitraan & Sponsorship Komersial LiveEuy</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Pasang Iklan & Bermitra dengan LiveEuy Cinema
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Posisikan brand Anda di hadapan ratusan ribu audiens digital terfokus melalui format iklan layar lebar 16:9 yang elegan, non-intrusif, dan berdaya konversi tinggi.
              </p>
            </div>

            {/* Platform Metrics Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-surface-800/80 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Audiens Aktif</span>
                <span className="text-xl sm:text-2xl font-black text-brand-400">150.000+</span>
                <span className="text-[10px] text-slate-400 block">Penonton bulanan</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-800/80 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Viewability Rate</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400">98.4%</span>
                <span className="text-[10px] text-slate-400 block">Tingkat tayang nyata</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-800/80 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Rasio Layar</span>
                <span className="text-xl sm:text-2xl font-black text-cyan-400">16:9 UHD</span>
                <span className="text-[10px] text-slate-400 block">Sinematik bioskop</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-800/80 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Rata-rata CTR</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400">6.2%</span>
                <span className="text-[10px] text-slate-400 block">Tingkat klik mitra</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 pt-2 text-xs">
              
              {/* Layer Selection Chips */}
              <div className="space-y-2">
                <label className="font-bold text-white text-xs block">
                  Pilih Layer Penempatan Iklan yang Diminati *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AD_LAYERS.map(layer => {
                    const LayerIcon = layer.icon;
                    const isSelected = selectedLayers.includes(layer.id);
                    return (
                      <div
                        key={layer.id}
                        onClick={() => toggleLayer(layer.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-brand-600/20 border-brand-500 ring-2 ring-brand-500/30 shadow-lg shadow-brand-500/20'
                            : 'bg-surface-800/50 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className={`p-2 rounded-xl flex-shrink-0 ${
                          isSelected ? 'bg-brand-600 text-white' : 'bg-surface-700 text-slate-400'
                        }`}>
                          <LayerIcon className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-white text-xs block">{layer.title}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${layer.badgeColor}`}>
                              {layer.highlight}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">{layer.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Company & Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-brand-400" />
                    <span>Nama Perusahaan / Brand *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="Contoh: PT Telkomsel Indonesia"
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-brand-400" />
                    <span>Nama Kontak PIC *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="Contoh: Arga Pratama (Marketing Lead)"
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-400" />
                    <span>Email Bisnis *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="partner@brand.com"
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-brand-400" />
                    <span>WhatsApp / Telepon</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+62 812-xxxx-xxxx"
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Estimasi Anggaran</span>
                  </label>
                  <select
                    value={budgetRange}
                    onChange={e => setBudgetRange(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="< Rp 10.000.000">&lt; Rp 10.000.000 (Starter)</option>
                    <option value="Rp 10.000.000 - Rp 25.000.000">Rp 10.000.000 - Rp 25.000.000 (Growth)</option>
                    <option value="Rp 25.000.000 - Rp 50.000.000">Rp 25.000.000 - Rp 50.000.000 (Cinema Partner)</option>
                    <option value="> Rp 50.000.000">&gt; Rp 50.000.000 (Hero Takeover)</option>
                  </select>
                </div>
              </div>

              {/* Campaign Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  Objektif Kampanye & Pesan Khusus (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={campaignObjective}
                  onChange={e => setCampaignObjective(e.target.value)}
                  placeholder="Ceritakan target audiens, periode tayang yang diharapkan, atau produk yang ingin dipromosikan..."
                  className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-between border-t border-white/10 gap-3">
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Tim komersial kami akan merespon selambatnya 1x24 jam kerja.
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={closePartnershipModal}
                    className="px-4 py-2.5 rounded-xl bg-white/10 text-slate-300 hover:text-white font-bold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>Kirim Pengajuan Kemitraan</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        )}

      </div>
    </div>
  );
};
