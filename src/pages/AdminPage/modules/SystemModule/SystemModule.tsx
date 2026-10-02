import React from 'react';
import { 
  Server, 
  RefreshCw, 
  Database, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Cookie, 
  RotateCcw 
} from 'lucide-react';
import { BackendDiagnosticResult } from '../../types';

interface SystemModuleProps {
  isPingingBackend: boolean;
  runBackendDiagnostic: () => Promise<void>;
  backendPingResult: BackendDiagnosticResult;
  resetMediaToDefault: () => void;
  showToast: (msg: string) => void;
}

export const SystemModule: React.FC<SystemModuleProps> = ({
  isPingingBackend,
  runBackendDiagnostic,
  backendPingResult,
  resetMediaToDefault,
  showToast
}) => {
  return (
    <section className="space-y-6 animate-fade-in">
      <div className="bg-surface-800/60 p-6 rounded-3xl border border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-brand-400" />
              <span>Konfigurasi Engine & Integrasi REST API Database</span>
            </h3>
            <p className="text-xs text-slate-400">
              Status konektivitas live Spring Boot, Golang Auth Service, dan basis data PostgreSQL.
            </p>
          </div>

          <button
            onClick={runBackendDiagnostic}
            disabled={isPingingBackend}
            className="px-4 py-2 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/30 text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPingingBackend ? 'animate-spin' : ''}`} />
            <span>{isPingingBackend ? 'Sedang Memeriksa...' : 'Uji Koneksi Backend Sekarang'}</span>
          </button>
        </div>

        {/* Server Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Spring Boot Catalog Card */}
          <div className="p-4 rounded-2xl bg-surface-900 border border-white/5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Database className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-white block">Spring Boot Catalog Service</span>
                  <span className="text-[10px] text-slate-400">Katalog Film, Serial, Episode & Rating</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${
                backendPingResult.catalogOnline 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${backendPingResult.catalogOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                {backendPingResult.catalogOnline ? 'Tersambung (Online)' : 'Offline (Fallback Aktif)'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-white font-mono text-xs bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                <span>{backendPingResult.catalogUrl}</span>
                {backendPingResult.catalogLatency !== null && (
                  <span className="text-emerald-400 text-[10px] font-bold">{backendPingResult.catalogLatency} ms</span>
                )}
              </div>
              <p className="text-slate-400 text-[11px]">
                {backendPingResult.catalogOnline 
                  ? 'CRUD Katalog terhubung langsung ke database PostgreSQL/H2.' 
                  : 'Layanan offline — perubahan admin tetap aman disimpan di browser (LocalStorage) tanpa error.'}
              </p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <a
                href="http://localhost:8081/swagger-ui.html"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-bold"
              >
                <span>Buka Swagger UI Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              {backendPingResult.testedAt && (
                <span className="text-[10px] text-slate-500">Diuji: {backendPingResult.testedAt}</span>
              )}
            </div>
          </div>

          {/* Golang Auth Service Card */}
          <div className="p-4 rounded-2xl bg-surface-900 border border-white/5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-white block">Golang Auth Service</span>
                  <span className="text-[10px] text-slate-400">Otentikasi JWT, Registrasi & Login</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${
                backendPingResult.authOnline 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${backendPingResult.authOnline ? 'bg-cyan-400 animate-pulse' : 'bg-rose-400'}`} />
                {backendPingResult.authOnline ? 'Tersambung (Online)' : 'Offline (Fallback Aktif)'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-white font-mono text-xs bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                <span>http://localhost:8080/api/health</span>
                {backendPingResult.authLatency !== null && (
                  <span className="text-cyan-400 text-[10px] font-bold">{backendPingResult.authLatency} ms</span>
                )}
              </div>
              <p className="text-slate-400 text-[11px]">
                Layanan microservice Go Gin untuk otentikasi login, register, dan enkripsi password bcrypt.
              </p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">Port: 8080 (Gin Engine)</span>
              {backendPingResult.testedAt && (
                <span className="text-[10px] text-slate-500">Diuji: {backendPingResult.testedAt}</span>
              )}
            </div>
          </div>
        </div>

        {/* Database Sync Matrix Table */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            <span>Matriks Status Sinkronisasi Fitur Admin ke Database</span>
          </h4>

          <div className="rounded-2xl bg-surface-900 border border-white/5 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-2.5 px-4">Fitur Admin</th>
                  <th className="py-2.5 px-3">Status Sinkronisasi</th>
                  <th className="py-2.5 px-4">Target Layanan & Database</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4 font-semibold text-white">Katalog Media (Tambah, Edit, Hapus)</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Tersinkron Otomatis</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">Spring Boot REST API (`/api/v1/media`) + PostgreSQL</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4 font-semibold text-white">Watchlist & Durasi Tontonan</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Tersinkron Otomatis</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">Backend API (`/api/v1/user/progress` & `/watchlist`)</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4 font-semibold text-white">Ulasan Penonton (Reviews)</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Tersinkron Otomatis</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">Backend API (`/api/v1/media/{'{id}'}/reviews`)</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4 font-semibold text-white">Daftar Pengguna & Hak Akses</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <AlertCircle className="w-3 h-3" />
                      <span>Otentikasi Go Aktif / CMS Lokal</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">Auth Service Go (`/login`, `/register`); API list user dari backend belum ada</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4 font-semibold text-white">Banner Hero & Siaran Global</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <Layers className="w-3 h-3" />
                      <span>Client CMS (LocalStorage)</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">Penyimpanan browser admin (belum ada tabel banner di backend)</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4 font-semibold text-white">Pelacakan Cookie, IP & Device</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      <Cookie className="w-3 h-3" />
                      <span>Client Session Tracker</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">Modul cookie/session browser pengunjung (`cookieTracker.ts`)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Reset Data Button Card */}
        <div className="p-4 rounded-2xl bg-surface-900 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Reset Data Demo Standar</span>
            <p className="text-slate-400 text-xs">
              Mengembalikan seluruh katalog film, serial, dan data mock ke kondisi awal pabrik.
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm('Yakin ingin mereset seluruh data katalog ke default mock?')) {
                resetMediaToDefault();
                showToast('Seluruh data katalog berhasil direset ke default!');
              }
            }}
            className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold transition-colors flex items-center gap-2 whitespace-nowrap text-xs cursor-pointer self-start sm:self-auto border border-rose-500/30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Katalog ke Default</span>
          </button>
        </div>
      </div>
    </section>
  );
};
