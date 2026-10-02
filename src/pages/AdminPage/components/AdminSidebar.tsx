import React from 'react';
import { 
  ShieldCheck, 
  X, 
  ExternalLink, 
  Plus, 
  ChevronsLeft, 
  ChevronsRight, 
  ChevronRight 
} from 'lucide-react';
import { AdminModuleId, SidebarNavGroup, SidebarNavItem, PublicWebNavItem } from '../types';

interface AdminSidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeModule: AdminModuleId;
  setActiveModule: (mod: AdminModuleId) => void;
  sidebarNavGroups: SidebarNavGroup[];
  allNavItems: SidebarNavItem[];
  publicWebNavItems: PublicWebNavItem[];
  setCurrentTab: (tab: any) => void;
  openCreateModal: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileDrawerOpen,
  setIsMobileDrawerOpen,
  activeModule,
  setActiveModule,
  sidebarNavGroups,
  allNavItems,
  publicWebNavItems,
  setCurrentTab,
  openCreateModal
}) => {
  return (
    <>
      {/* ========================================================
          MOBILE / TABLET DRAWER OFF-CANVAS OVERLAY
          ======================================================== */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Slide-out Drawer */}
          <div className="relative w-80 max-w-[85vw] h-full bg-[#0a0c14] border-r border-white/10 p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar z-10 animate-slide-right">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-secondary-500 flex items-center justify-center shadow-md shadow-brand-500/30">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block leading-none">LiveEuy Studio</span>
                    <span className="text-[10px] text-brand-400 font-semibold leading-none mt-0.5 block">Admin Control Center</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Public Web Fast Jump */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block">
                  Navigasi Website Publik
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {publicWebNavItems.map(webItem => {
                    const WebIcon = webItem.icon;
                    return (
                      <button
                        key={webItem.id}
                        onClick={() => {
                          setIsMobileDrawerOpen(false);
                          setCurrentTab(webItem.id as any);
                        }}
                        className="flex items-center gap-2 p-2 rounded-xl text-left bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        <WebIcon className="w-3.5 h-3.5 text-brand-400" />
                        <span className="truncate">{webItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Admin Modules Navigation */}
              <div className="space-y-4">
                {sidebarNavGroups.map(group => (
                  <div key={group.group} className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block">
                      {group.group}
                    </span>
                    <div className="space-y-1">
                      {group.items.map(item => {
                        const Icon = item.icon;
                        const isActive = activeModule === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveModule(item.id);
                              setIsMobileDrawerOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                              isActive
                                ? 'bg-brand-600 text-white font-bold shadow-lg shadow-brand-600/30'
                                : 'text-slate-300 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon className="w-4 h-4" />
                              <div className="min-w-0">
                                <span className="text-xs font-semibold block truncate">{item.label}</span>
                                <span className="text-[10px] opacity-75 block truncate">{item.desc}</span>
                              </div>
                            </div>
                            {item.badge && (
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border font-mono ${item.badgeColor}`}>
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-white/10 space-y-2 mt-4">
              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  openCreateModal();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-secondary-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tayangan Baru</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DESKTOP COLLAPSIBLE SIDEBAR
          (Expanded: w-72 xl:w-80 | Collapsed: w-20 Icon-Only)
          ======================================================== */}
      <aside
        className={`hidden lg:flex flex-col justify-between shrink-0 sticky top-[53px] h-[calc(100vh-53px)] border-r border-white/10 bg-[#090b12]/95 backdrop-blur-xl p-3 transition-all duration-300 z-30 ${
          isSidebarCollapsed ? 'w-20' : 'w-72 xl:w-80'
        }`}
      >
        {/* Top Section */}
        <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
          
          {/* Header: Studio info (Expanded) or Expand Toggle (Collapsed) */}
          {!isSidebarCollapsed ? (
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-secondary-500 flex items-center justify-center shadow-md shadow-brand-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">CMS Engine v2.4</span>
                  <span className="text-[10px] text-slate-400 block">Super Administrator</span>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Perkecil Sidebar"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 pb-2 border-b border-white/10">
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 flex items-center justify-center transition-all cursor-pointer"
                title="Perlebar Sidebar"
              >
                <ChevronsRight className="w-4 h-4 text-brand-400" />
              </button>
            </div>
          )}

          {/* Quick Public Web Navigation */}
          {!isSidebarCollapsed ? (
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 block">
                Navigasi Website Publik
              </span>
              <div className="space-y-1">
                {publicWebNavItems.map(webItem => {
                  const WebIcon = webItem.icon;
                  return (
                    <button
                      key={webItem.id}
                      onClick={() => setCurrentTab(webItem.id as any)}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-white/5 transition-all group border border-transparent hover:border-white/5 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <WebIcon className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                        <span className="text-xs font-medium truncate">{webItem.label}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2 flex flex-col items-center pb-2 border-b border-white/10">
              {publicWebNavItems.slice(0, 3).map(webItem => {
                const WebIcon = webItem.icon;
                return (
                  <div key={webItem.id} className="relative group">
                    <button
                      onClick={() => setCurrentTab(webItem.id as any)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <WebIcon className="w-4 h-4 text-brand-400" />
                    </button>
                    {/* Floating Tooltip */}
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-surface-900 border border-white/15 px-3 py-1.5 rounded-xl shadow-2xl whitespace-nowrap">
                      <span className="text-xs font-bold text-white block">{webItem.label}</span>
                      <span className="text-[10px] text-slate-400 block">{webItem.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sidebar Navigation Groups (Admin Modules) */}
          {!isSidebarCollapsed ? (
            <nav className="space-y-4 pt-1">
              {sidebarNavGroups.map(group => (
                <div key={group.group} className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 block">
                    {group.group}
                  </span>
                  <div className="space-y-1">
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const isActive = activeModule === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveModule(item.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all group cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-brand-600/30 to-secondary-600/20 text-white font-bold border border-brand-500/50 shadow-lg shadow-brand-600/20'
                              : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                              isActive
                                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/40'
                                : 'bg-surface-800 text-slate-400 group-hover:text-white group-hover:bg-surface-700'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-semibold block truncate leading-tight">
                                {item.label}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate leading-tight mt-0.5">
                                {item.desc}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                            {item.badge && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono ${item.badgeColor}`}>
                                {item.pulse && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block mr-1 animate-pulse" />}
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                              isActive ? 'text-brand-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                            }`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          ) : (
            /* Collapsed Mini-Icons with Floating Tooltips */
            <nav className="space-y-2 flex flex-col items-center">
              {allNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => setActiveModule(item.id)}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-tr from-brand-600 to-secondary-500 text-white shadow-lg shadow-brand-500/40 ring-2 ring-brand-400/50'
                          : 'text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>

                    {/* Floating Tooltip */}
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-surface-900 border border-white/15 px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap min-w-[140px]">
                      <span className="text-xs font-bold text-white block">{item.label}</span>
                      <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono mt-1 inline-block">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </nav>
          )}

        </div>

        {/* Bottom Section */}
        {!isSidebarCollapsed ? (
          <div className="pt-2 border-t border-white/10 space-y-2 mt-2">
            <button
              onClick={openCreateModal}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-secondary-500 hover:from-brand-500 hover:to-secondary-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tayangan Baru</span>
            </button>

            <div className="p-2.5 rounded-2xl bg-surface-950/70 border border-white/5 space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span>Spring Boot REST API</span>
                <span className="text-emerald-400 font-bold">Online</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Pelacak Cookie</span>
                <span className="text-cyan-400 font-bold font-mono">Aktif (365d)</span>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="w-full py-1.5 text-center text-[11px] text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
              <span>Sembunyikan Sidebar</span>
            </button>
          </div>
        ) : (
          <div className="pt-2 border-t border-white/10 flex flex-col items-center gap-2 mt-2">
            <button
              onClick={openCreateModal}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-secondary-500 text-white flex items-center justify-center shadow-md shadow-brand-500/30 hover:scale-105 transition-all cursor-pointer"
              title="Tambah Tayangan Baru"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Munculkan Sidebar Lengkap"
            >
              <ChevronsRight className="w-4 h-4 text-brand-400" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
