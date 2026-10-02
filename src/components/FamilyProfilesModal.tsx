import React, { useState } from 'react';
import { 
  Users, 
  User, 
  Baby, 
  Shield, 
  Lock, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Copy, 
  CheckCircle2, 
  Sparkles, 
  Smile, 
  Crown, 
  X, 
  ShieldAlert,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { UserProfile } from '../types';

const AVATAR_PRESETS = [
  { id: 'av-1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', label: 'Klasik' },
  { id: 'av-2', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80', label: 'Sinema' },
  { id: 'av-3', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80', label: 'Anak Ceria' },
  { id: 'av-4', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', label: 'Kreator' },
  { id: 'av-5', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', label: 'Petualang' },
  { id: 'av-6', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', label: 'Anime' },
  { id: 'av-7', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=120&auto=format&fit=crop&q=80', label: 'Kartun' },
  { id: 'av-8', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', label: 'Pemberani' }
];

const COLOR_PRESETS = [
  { id: 'emerald', border: 'border-emerald-500', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  { id: 'blue', border: 'border-blue-500', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  { id: 'amber', border: 'border-amber-500', bg: 'bg-amber-500/20', text: 'text-amber-400' },
  { id: 'purple', border: 'border-purple-500', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  { id: 'rose', border: 'border-rose-500', bg: 'bg-rose-500/20', text: 'text-rose-400' }
];

export const FamilyProfilesModal: React.FC = () => {
  const {
    isFamilyModalOpen,
    closeFamilyModal,
    profiles,
    activeProfile,
    switchProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    familyShareCode,
    user,
    logout,
    setCurrentTab
  } = useWatch();

  const [modalMode, setModalMode] = useState<'select' | 'manage' | 'edit' | 'create'>('select');
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    name: string;
    avatar: string;
    isKids: boolean;
    pin: string;
    color: string;
  }>({
    name: '',
    avatar: AVATAR_PRESETS[0].url,
    isKids: false,
    pin: '1234',
    color: 'emerald'
  });

  // PIN Unlock Modal State
  const [pinPromptTarget, setPinPromptTarget] = useState<string | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isFamilyModalOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectProfile = (targetProfile: UserProfile) => {
    if (targetProfile.id === activeProfile.id) {
      closeFamilyModal();
      return;
    }

    // If currently in Kids profile and switching to adult profile, require PIN
    if (activeProfile.isKids && !targetProfile.isKids) {
      setPinPromptTarget(targetProfile.id);
      setEnteredPin('');
      setPinError('');
      return;
    }

    const res = switchProfile(targetProfile.id);
    if (res.success) {
      showToast(`Beralih ke profil "${targetProfile.name}"!`);
      setTimeout(() => closeFamilyModal(), 500);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinPromptTarget) return;

    const res = switchProfile(pinPromptTarget, enteredPin);
    if (res.success) {
      setPinPromptTarget(null);
      showToast('PIN Terverifikasi! Berhasil keluar dari Mode Anak.');
      setTimeout(() => closeFamilyModal(), 600);
    } else {
      setPinError(res.message || 'PIN Pengawasan Orang Tua tidak sesuai.');
    }
  };

  const startEditProfile = (profile: UserProfile) => {
    setEditingProfileId(profile.id);
    setFormData({
      name: profile.name,
      avatar: profile.avatar,
      isKids: profile.isKids,
      pin: profile.pin || '1234',
      color: profile.color || 'emerald'
    });
    setModalMode('edit');
  };

  const startCreateProfile = () => {
    if (profiles.length >= 5) {
      showToast('Batas maksimum 5 profil keluarga telah tercapai.');
      return;
    }
    setFormData({
      name: `Profil ${profiles.length + 1}`,
      avatar: AVATAR_PRESETS[profiles.length % AVATAR_PRESETS.length].url,
      isKids: false,
      pin: '1234',
      color: COLOR_PRESETS[profiles.length % COLOR_PRESETS.length].id
    });
    setModalMode('create');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (modalMode === 'create') {
      const res = addProfile({
        name: formData.name.trim(),
        avatar: formData.avatar,
        isKids: formData.isKids,
        pin: formData.pin.trim() || undefined,
        color: formData.color
      });
      if (res.success) {
        showToast(res.message);
        setModalMode('select');
      } else {
        showToast(res.message);
      }
    } else if (modalMode === 'edit' && editingProfileId) {
      updateProfile(editingProfileId, {
        name: formData.name.trim(),
        avatar: formData.avatar,
        isKids: formData.isKids,
        pin: formData.pin.trim() || undefined,
        color: formData.color
      });
      showToast('Perubahan profil berhasil disimpan!');
      setModalMode('select');
    }
  };

  const handleDelete = (profileId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus profil ini beserta riwayat tontonannya?')) {
      const res = deleteProfile(profileId);
      showToast(res.message);
      setModalMode('select');
    }
  };

  const copyShareCode = () => {
    navigator.clipboard.writeText(familyShareCode).then(() => {
      showToast(`Kode Akun Keluarga (${familyShareCode}) berhasil disalin!`);
    }).catch(() => {});
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/?familyCode=${encodeURIComponent(familyShareCode)}`;
    navigator.clipboard.writeText(link).then(() => {
      showToast('Tautan undangan Akun Keluarga berhasil disalin!');
    }).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative w-full max-w-2xl bg-[#0f111a] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/20 border border-brand-500/30 text-brand-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {modalMode === 'create' ? 'Tambah Profil Keluarga Baru' : 
                   modalMode === 'edit' ? 'Edit Profil Anggota Keluarga' : 
                   modalMode === 'manage' ? 'Kelola Profil & Hak Akses' : 
                   'Siapa yang Sedang Menonton?'}
                </h3>
                {user?.tier?.includes('VIP') && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>Family VIP</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {activeProfile.isKids ? 'Saat ini aktif: Mode Anak (Kids Mode)' : 'Personalisasi riwayat tontonan & pengawasan orang tua'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                closeFamilyModal();
                logout();
                setCurrentTab('home');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              title="Keluar dari akun Liveeuy"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Keluar</span>
            </button>
            <button
              type="button"
              onClick={closeFamilyModal}
              className="p-2 rounded-full glass-panel hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast Alert Notification */}
        {toastMessage && (
          <div className="mx-6 mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Body with Brand Harmonized Scrollbar */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar profile-scrollbar">
          
          {/* ========================================================
              VIEW 1: PROFILES SELECTION / WHO'S WATCHING
              ======================================================== */}
          {(modalMode === 'select' || modalMode === 'manage') && (
            <div className="space-y-6">
              
              {/* Profiles Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 justify-center">
                {profiles.map(p => {
                  const isActive = p.id === activeProfile.id;
                  const isManaged = modalMode === 'manage';

                  return (
                    <div 
                      key={p.id}
                      onClick={() => isManaged ? startEditProfile(p) : handleSelectProfile(p)}
                      className={`group relative flex flex-col items-center text-center p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                        isActive && !isManaged
                          ? 'bg-brand-500/15 border-2 border-brand-500 shadow-lg shadow-brand-500/20'
                          : 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/30'
                      }`}
                    >
                      {/* Avatar Wrapper */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden mb-3 border-2 group-hover:scale-105 transition-transform shadow-md">
                        <img 
                          src={p.avatar} 
                          alt={p.name} 
                          className="w-full h-full object-cover select-none"
                        />

                        {/* Active Checkmark Pill */}
                        {isActive && !isManaged && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg border border-white/40">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}

                        {/* Mode Anak Badge */}
                        {p.isKids && (
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-r from-amber-500 to-emerald-500 text-black font-black text-[9px] py-0.5 flex items-center justify-center gap-1 tracking-wider uppercase">
                            <Smile className="w-2.5 h-2.5" />
                            <span>KIDS</span>
                          </div>
                        )}

                        {/* Manage Overlay Pencil */}
                        {isManaged && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                            <Edit3 className="w-6 h-6 text-brand-300 animate-pulse" />
                          </div>
                        )}
                      </div>

                      {/* Profile Name & Badges */}
                      <span className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-300 transition-colors truncate max-w-full">
                        {p.name}
                      </span>

                      <div className="flex items-center gap-1 mt-1">
                        {p.isKids ? (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            Mode Anak
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-semibold bg-white/10 text-slate-300">
                            Semua Usia
                          </span>
                        )}

                        {p.pin && (
                          <span title="Dilindungi PIN Orang Tua" className="text-slate-400">
                            <Lock className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add Profile Card (if less than 5) */}
                {profiles.length < 5 && (
                  <button
                    type="button"
                    onClick={startCreateProfile}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-white/20 hover:border-brand-400 hover:bg-brand-500/10 transition-all text-slate-400 hover:text-brand-300 group cursor-pointer min-h-[140px]"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/5 group-hover:bg-brand-500/20 flex items-center justify-center mb-2 border border-white/10 group-hover:border-brand-500/40 transition-colors">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold">Tambah Profil</span>
                    <span className="text-[10px] text-slate-500">{5 - profiles.length} slot tersisa</span>
                  </button>
                )}
              </div>

              {/* Action Buttons: Manage vs Done vs Logout */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {modalMode === 'select' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setModalMode('manage')}
                      className="px-5 py-2.5 rounded-xl glass-panel hover:bg-white/15 text-slate-300 hover:text-white text-xs sm:text-sm font-bold flex items-center gap-2 border border-white/15 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-brand-400" />
                      <span>Kelola Profil Anggota</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        closeFamilyModal();
                        logout();
                        setCurrentTab('home');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/35 border border-rose-500/30 text-rose-300 hover:text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
                      title="Keluar dari akun Liveeuy"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Keluar Akun (Logout)</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setModalMode('select')}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-brand-600/30 cursor-pointer"
                  >
                    Selesai Mengelola
                  </button>
                )}
              </div>

              {/* ========================================================
                  FAMILY SHARING INVITATION LINK & CODE
                  ======================================================== */}
              <div className="pt-4 border-t border-white/10">
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-surface-900 via-surface-850 to-surface-900 border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Bagikan Akun Keluarga (Family Share)</h4>
                        <p className="text-xs text-slate-400">
                          Gunakan bersama anggota keluarga di HP, tablet, TV, atau laptop dengan profil mandiri.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-amber-300 font-mono text-xs font-bold tracking-wider">
                        {familyShareCode}
                      </div>
                      <button
                        type="button"
                        onClick={copyShareCode}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Salin Kode Keluarga"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      Semua profil keluarga otomatis mendapatkan akses Bebas Iklan (VIP).
                    </span>
                    <button
                      type="button"
                      onClick={copyShareLink}
                      className="text-brand-400 hover:text-brand-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Salin Tautan Akses Cepat</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 2: CREATE OR EDIT PROFILE FORM
              ======================================================== */}
          {(modalMode === 'create' || modalMode === 'edit') && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              
              {/* Profile Name & Current Avatar Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-brand-500 shadow-md flex-shrink-0">
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="w-full space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Nama Anggota Keluarga
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Ayah, Ibu, Adik Caca"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-brand-500 focus:outline-none text-white text-sm font-semibold transition-all"
                  />
                </div>
              </div>

              {/* Avatar Selector Gallery */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Pilih Avatar Karakter
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {AVATAR_PRESETS.map(av => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: av.url })}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        formData.avatar === av.url 
                          ? 'border-brand-400 scale-105 shadow-md shadow-brand-500/30' 
                          : 'border-white/10 hover:border-white/40 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                      {formData.avatar === av.url && (
                        <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Anak (Kids Mode) Toggle Switch */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border border-amber-500/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Baby className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Mode Anak (Kids Mode)</h4>
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-amber-400 text-black uppercase">
                        SU SAFE
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      Hanya menampilkan tayangan berkategori <strong>Semua Umur (SU)</strong> & Animasi ramah anak. Menyaring tontonan 16+ dan 18+.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.isKids}
                    onChange={(e) => setFormData({ ...formData, isKids: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Parental PIN Lock */}
              {formData.isKids && (
                <div className="space-y-1.5 animate-fade-in p-4 rounded-2xl bg-black/40 border border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>PIN Pengawasan Orang Tua (4 Digit)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Default: 1234</span>
                  </div>
                  <input
                    type="password"
                    maxLength={4}
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                    placeholder="1234"
                    className="w-32 px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 focus:outline-none text-white text-center font-mono text-sm tracking-widest"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Anak harus memasukkan PIN ini untuk beralih kembali ke profil dewasa.
                  </p>
                </div>
              )}

              {/* Modal Form Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                {modalMode === 'edit' && editingProfileId && profiles.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingProfileId)}
                    className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Profil</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalMode('select')}
                    className="px-4 py-2 rounded-xl glass-panel hover:bg-white/15 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30 cursor-pointer"
                  >
                    {modalMode === 'create' ? 'Buat Profil' : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* ========================================================
            PIN PROMPT DIALOG: WHEN SWITCHING OUT OF KIDS MODE
            ======================================================== */}
        {pinPromptTarget && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-sm bg-surface-900 border border-white/15 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white">Proteksi Orang Tua Aktif</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Masukkan PIN 4-digit untuk keluar dari Mode Anak dan mengakses profil dewasa.
                </p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-3">
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • •"
                  className="w-36 mx-auto px-4 py-3 rounded-2xl bg-black/70 border border-white/20 focus:border-amber-400 focus:outline-none text-white text-center font-mono text-lg tracking-widest"
                />

                {pinError && (
                  <p className="text-xs text-rose-400 font-semibold animate-shake">
                    {pinError}
                  </p>
                )}

                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPinPromptTarget(null);
                      setPinError('');
                    }}
                    className="px-4 py-2 rounded-xl glass-panel text-slate-300 text-xs font-semibold hover:bg-white/15"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/30"
                  >
                    Verifikasi PIN
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
