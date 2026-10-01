import React from 'react';
import { 
  ShieldCheck, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Menu, 
  ExternalLink, 
  Plus, 
  Laptop, 
  LogOut 
} from 'lucide-react';
import { AdminModuleId } from '../types';
import { MODULE_HEADER_INFO } from '../moduleRegistry';
import { User } from '../../../types';

interface AdminHeaderProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMobileDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeModule: AdminModuleId;
  setCurrentTab: (tab: any) => void;
  openCreateModal: () => void;
  user: User | null;
  logout: () => void;
  openDeviceSecurityModal: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  setIsMobileDrawerOpen,
  activeModule,
  setCurrentTab,
  openCreateModal,
  user,
  logout,
  openDeviceSecurityModal
}) => {
  const currentModuleTitle = MODULE_HEADER_INFO[activeModule]?.title || 'Admin Console';

  return (
    <header className="sticky top-0 z-40 bg-[#090b12]/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shadow-xl">
      {/* Left: Sidebar Toggle + Brand + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Sidebar Toggle Button (Desktop) */}
        <button
          onClick={() => setIsSidebarCollapsed(prev => !prev)}
          className="hidden lg:flex p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all items-center justify-center cursor-pointer"
          title={isSidebarCollapsed ? "Tampilkan Sidebar Lengkap" : "Sembunyikan / Perkecil Sidebar"}
        >
          {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4 text-brand-400" /> : <PanelLeftClose className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Mobile Drawer Toggle */}
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all cursor-pointer"
          title="Buka Navigasi Menu"
        >
          <Menu className="w-5 h-5 text-brand-400" />
        </button>

        {/* Brand Logo & Studio Title */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-secondary-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-white">LiveEuy</span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">Studio</span>
            </div>
          </div>
        </div>

        <span className="text-slate-600 hidden md:inline">/</span>

        {/* Breadcrumb Context */}
        <div className="hidden md:flex items-center gap-1.5 text-xs truncate">
          <span className="text-slate-400">Admin Console</span>
          <span className="text-slate-600">/</span>
          <span className="font-bold text-brand-400 truncate">
            {currentModuleTitle}
          </span>
        </div>
      </div>

      {/* Right: Quick Action Buttons, Server Indicators & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Server Status Pill (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Spring Boot :8080
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Go Auth :8081
          </span>
        </div>

        {/* Back to Public Web Button */}
        <button
          onClick={() => setCurrentTab('home')}
          className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/10 hover:border-white/20 active:scale-95 cursor-pointer"
          title="Keluar dari Admin dan kembali ke Beranda Website Publik"
        >
          <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
          <span className="hidden sm:inline">Kunjungi Website</span>
          <span className="sm:hidden">Web</span>
        </button>

        {/* Quick Create Media Button */}
        <button
          onClick={openCreateModal}
          className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-brand-600 to-secondary-500 hover:from-brand-500 hover:to-secondary-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Tambah judul tayangan baru ke katalog"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tambah Tayangan</span>
        </button>

        {/* Admin Profile Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120"}
            alt="Admin"
            className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-md"
          />
          <div className="hidden lg:block text-left">
            <span className="text-xs font-bold text-white block leading-none">{user?.name || "Hafiz M."}</span>
            <span className="text-[10px] text-brand-400 font-semibold leading-none mt-0.5 block">Super Admin</span>
          </div>
          <button
            onClick={openDeviceSecurityModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors ml-1 cursor-pointer"
            title="Kelola Perangkat & Keamanan (Logout Semua Device)"
          >
            <Laptop className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('Keluar dari sesi Administrator?')) {
                logout();
                setCurrentTab('home');
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1 cursor-pointer"
            title="Keluar Sesi Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
