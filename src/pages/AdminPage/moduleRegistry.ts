import { 
  Film, 
  Tv, 
  Users, 
  MessageSquare, 
  Settings, 
  Megaphone, 
  Layers, 
  BarChart3, 
  Monitor 
} from 'lucide-react';
import { SidebarNavGroup, AdminModuleId } from './types';
import { MediaItem, AdCampaign, User, VisitorSession } from '../../types';

interface NavBadgeCounts {
  allMediaCount: number;
  seriesCount: number;
  visitorCount: number;
  usersCount: number;
  activeBillboardCount: number;
  isAnnouncementActive: boolean;
}

export const getSidebarNavGroups = (counts: NavBadgeCounts): SidebarNavGroup[] => [
  {
    group: 'KONTEN & KATALOG',
    items: [
      {
        id: 'media',
        label: 'Katalog Media',
        desc: 'Kelola film & serial',
        icon: Film,
        badge: `${counts.allMediaCount}`,
        badgeColor: 'bg-brand-500/20 text-brand-300 border-brand-500/30'
      },
      {
        id: 'banner',
        label: 'Banner & Pengumuman',
        desc: 'Hero carousel & broadcast promo',
        icon: Megaphone,
        badge: counts.isAnnouncementActive ? 'Live' : 'Off',
        badgeColor: counts.isAnnouncementActive
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          : 'bg-white/10 text-slate-400 border-white/10',
        pulse: counts.isAnnouncementActive
      },
      {
        id: 'ads',
        label: 'Iklan & Billboard',
        desc: 'Sponsor IDLIX & feed banner',
        icon: Layers,
        badge: `${counts.activeBillboardCount} Aktif`,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      },
      {
        id: 'episodes',
        label: 'Episode & Musim',
        desc: 'Manajemen serial TV',
        icon: Tv,
        badge: `${counts.seriesCount}`,
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      },
    ]
  },
  {
    group: 'AUDIENCE & MONITORING',
    items: [
      {
        id: 'analytics',
        label: 'Statistik & Rating Tayangan',
        desc: 'Views terbanyak & rating terbaik/jelek',
        icon: BarChart3,
        badge: 'Tren',
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
      },
      {
        id: 'tracking',
        label: 'Pelacakan Cookie & IP',
        desc: 'Device, OS & sesi visitor',
        icon: Monitor,
        badge: `${counts.visitorCount}`,
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        pulse: true
      },
      {
        id: 'users',
        label: 'Pengguna & VIP',
        desc: 'Akun & status langganan',
        icon: Users,
        badge: `${counts.usersCount}`,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      },
      {
        id: 'reviews',
        label: 'Moderasi Ulasan',
        desc: 'Komentar komunitas',
        icon: MessageSquare,
        badge: '5 Baru',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      },
    ]
  },
  {
    group: 'KONFIGURASI',
    items: [
      {
        id: 'system',
        label: 'Sistem & REST API',
        desc: 'Spring Boot & cache',
        icon: Settings,
        badge: 'Online',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      },
    ]
  }
];

export const MODULE_HEADER_INFO: Record<AdminModuleId, { title: string; subtitle: string }> = {
  media: {
    title: 'Katalog & CMS Media',
    subtitle: 'Manajemen Katalog Film & Serial'
  },
  banner: {
    title: 'Banner & Pengumuman',
    subtitle: 'Banner Pengumuman & Hero Carousel'
  },
  ads: {
    title: 'Iklan & Billboard Sponsor',
    subtitle: 'Manajemen Iklan & Billboard Sponsor'
  },
  episodes: {
    title: 'Episode & Musim Serial',
    subtitle: 'Episode & Musim Serial TV'
  },
  analytics: {
    title: 'Statistik & Rating Tayangan',
    subtitle: 'Statistik & Analisis Rating Tayangan'
  },
  users: {
    title: 'Pengguna & Langganan VIP',
    subtitle: 'Manajemen Akun & Langganan VIP'
  },
  tracking: {
    title: 'Pelacakan Cookie, IP & Device',
    subtitle: 'Pelacakan Cookie, IP & Perangkat Pengunjung'
  },
  reviews: {
    title: 'Moderasi Komunitas & Ulasan',
    subtitle: 'Moderasi Ulasan & Komunitas'
  },
  system: {
    title: 'Pengaturan Sistem & REST API',
    subtitle: 'Pengaturan Server & Database Matrix'
  }
};
