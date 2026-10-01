import React from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Ban, 
  UserCheck, 
  PowerOff, 
  Trash2, 
  X 
} from 'lucide-react';
import { User } from '../../../../types';

interface UsersModuleProps {
  usersList: User[];
  setUsersList: React.Dispatch<React.SetStateAction<User[]>>;
  filteredUsers: User[];
  userSearchTerm: string;
  setUserSearchTerm: (term: string) => void;
  userRoleFilter: 'all' | 'admin' | 'user';
  setUserRoleFilter: (filter: 'all' | 'admin' | 'user') => void;
  userStatusFilter: 'all' | 'active' | 'suspended';
  setUserStatusFilter: (filter: 'all' | 'active' | 'suspended') => void;
  isAddUserModalOpen: boolean;
  setIsAddUserModalOpen: (open: boolean) => void;
  newUserForm: {
    name: string;
    email: string;
    role: 'admin' | 'user';
    tier: 'Free Guest' | 'VIP Standard' | 'VIP Cinema Ultra';
    avatar: string;
  };
  setNewUserForm: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    role: 'admin' | 'user';
    tier: 'Free Guest' | 'VIP Standard' | 'VIP Cinema Ultra';
    avatar: string;
  }>>;
  handleCreateUser: (e: React.FormEvent) => void;
  handleToggleUserStatus: (usr: User) => void;
  handleForceRemoteLogout: (usr: User) => void;
  handleDeleteUser: (usr: User) => void;
  showToast: (msg: string) => void;
  addAuditLog: (action: string, category: 'media' | 'banner' | 'user' | 'tracking' | 'system', detail: string) => void;
}

export const UsersModule: React.FC<UsersModuleProps> = ({
  usersList,
  setUsersList,
  filteredUsers,
  userSearchTerm,
  setUserSearchTerm,
  userRoleFilter,
  setUserRoleFilter,
  userStatusFilter,
  setUserStatusFilter,
  isAddUserModalOpen,
  setIsAddUserModalOpen,
  newUserForm,
  setNewUserForm,
  handleCreateUser,
  handleToggleUserStatus,
  handleForceRemoteLogout,
  handleDeleteUser,
  showToast,
  addAuditLog
}) => {
  return (
    <section className="space-y-6">
      {/* Header & Add User Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-1">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Manajemen Hak Akses & Status Keanggotaan</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Daftar Pengguna & Keamanan Akun
          </h3>
          <p className="text-xs text-slate-400">
            Kelola status akun, hak akses role administrator, tier paket VIP, hingga pencabutan sesi jarak jauh.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-900/30 cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pengguna Baru</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface-800/60 p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Pengguna</span>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">{usersList.length}</p>
        </div>
        <div className="bg-surface-800/60 p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Akun Aktif</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {usersList.filter(u => (u.status || 'active') === 'active').length}
          </p>
        </div>
        <div className="bg-surface-800/60 p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[10px] text-rose-400 uppercase tracking-wider font-semibold">Ditangguhkan</span>
          <p className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
            {usersList.filter(u => u.status === 'suspended').length}
          </p>
        </div>
        <div className="bg-surface-800/60 p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">Member VIP</span>
          <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            {usersList.filter(u => u.tier !== 'Free Guest').length}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-surface-800/40 border border-white/10">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={userSearchTerm}
            onChange={e => setUserSearchTerm(e.target.value)}
            placeholder="Cari nama atau email pengguna..."
            className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={userRoleFilter}
            onChange={e => setUserRoleFilter(e.target.value as any)}
            className="bg-surface-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="user">Member (User)</option>
          </select>

          <select
            value={userStatusFilter}
            onChange={e => setUserStatusFilter(e.target.value as any)}
            className="bg-surface-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="suspended">Ditangguhkan</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-surface-800/40 border border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-300">
          <thead className="bg-surface-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-white/10">
            <tr>
              <th className="py-3.5 px-4">Pengguna</th>
              <th className="py-3.5 px-3">Role</th>
              <th className="py-3.5 px-3">Tier Paket</th>
              <th className="py-3.5 px-3">Status Akun</th>
              <th className="py-3.5 px-3">Maks Perangkat</th>
              <th className="py-3.5 px-3">Jam Tonton</th>
              <th className="py-3.5 px-4 text-right">Tindakan Keamanan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                  Tidak ada pengguna yang cocok dengan kriteria pencarian/filter.
                </td>
              </tr>
            ) : (
              filteredUsers.map(usr => (
                <tr key={usr.id} className="hover:bg-white/5 transition-colors">
                  {/* Name & Email */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={usr.avatar} alt={usr.name} className="w-9 h-9 rounded-full object-cover border border-white/10 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-white block truncate">{usr.name}</span>
                        <span className="text-[11px] text-slate-400 block truncate">{usr.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      usr.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/10 text-slate-300'
                    }`}>
                      {usr.role === 'admin' ? 'Admin' : 'Member'}
                    </span>
                  </td>

                  {/* Tier Select */}
                  <td className="py-3 px-3">
                    <select
                      value={usr.tier}
                      onChange={(e) => {
                        const newTier = e.target.value as any;
                        setUsersList(prev => prev.map(u => u.id === usr.id ? { ...u, tier: newTier } : u));
                        showToast(`Paket pengguna ${usr.name} diubah menjadi ${newTier}!`);
                        addAuditLog('Ubah Tier Pengguna', 'user', `Paket "${usr.name}" diubah menjadi ${newTier}.`);
                      }}
                      className="bg-surface-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Free Guest">Free Guest</option>
                      <option value="VIP Standard">VIP Standard</option>
                      <option value="VIP Cinema Ultra">VIP Cinema Ultra</option>
                    </select>
                  </td>

                  {/* Account Status Badge */}
                  <td className="py-3 px-3">
                    {usr.status === 'suspended' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-max">
                        <Ban className="w-3 h-3 text-rose-400" />
                        <span>Ditangguhkan</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-max">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Aktif</span>
                      </span>
                    )}
                  </td>

                  {/* Max Devices */}
                  <td className="py-3 px-3 font-mono text-xs">
                    {usr.devices || 1} Perangkat
                  </td>

                  {/* Watch Hours */}
                  <td className="py-3 px-3 font-mono text-emerald-400 font-bold text-xs">
                    {usr.watchHours || 0} Jam
                  </td>

                  {/* Security Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Toggle Suspend / Activate */}
                      <button
                        type="button"
                        onClick={() => handleToggleUserStatus(usr)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          usr.status === 'suspended'
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400'
                        }`}
                        title={usr.status === 'suspended' ? 'Aktifkan Akun' : 'Tangguhkan (Suspend) Akun'}
                      >
                        {usr.status === 'suspended' ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>

                      {/* Force Remote Logout */}
                      <button
                        type="button"
                        onClick={() => handleForceRemoteLogout(usr)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                        title="Cabut Sesi Paksa (Force Remote Logout)"
                      >
                        <PowerOff className="w-4 h-4" />
                      </button>

                      {/* Delete User */}
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(usr)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                        title="Hapus Akun Pengguna"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Tambah Pengguna Baru */}
      {isAddUserModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Tambah Pengguna Baru"
        >
          <div 
            className="relative w-full max-w-md bg-surface-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-white text-base">Tambah Akun Pengguna Baru</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="Contoh: Ahmad Fauzi"
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="nama@email.com"
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">Role Akses</label>
                  <select
                    value={newUserForm.role}
                    onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                    className="w-full bg-surface-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="user">Member (User)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">Tier Paket VIP</label>
                  <select
                    value={newUserForm.tier}
                    onChange={e => setNewUserForm({ ...newUserForm, tier: e.target.value as any })}
                    className="w-full bg-surface-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Free Guest">Free Guest</option>
                    <option value="VIP Standard">VIP Standard</option>
                    <option value="VIP Cinema Ultra">VIP Cinema Ultra</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-xs font-bold text-white shadow-lg shadow-amber-900/30 cursor-pointer"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
