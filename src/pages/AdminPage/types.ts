import React from 'react';
import { MediaItem, AdCampaign, User } from '../../types';

export type AdminModuleId = 
  | 'media' 
  | 'banner' 
  | 'ads' 
  | 'episodes' 
  | 'users' 
  | 'tracking' 
  | 'analytics' 
  | 'reviews' 
  | 'system';

export interface SidebarNavItem {
  id: AdminModuleId;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  pulse?: boolean;
}

export interface SidebarNavGroup {
  group: string;
  items: SidebarNavItem[];
}

export interface PublicWebNavItem {
  id: 'home' | 'movies' | 'tv' | 'trending' | 'watchlist';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}

export interface StreamHealthResult {
  status: 'healthy' | 'cors_warning' | 'error';
  latency: number;
  details: string;
}

export interface PendingRestoreData {
  fileName: string;
  items: MediaItem[];
  rejectedCount?: number;
}

export interface BackendDiagnosticResult {
  catalogOnline: boolean;
  catalogLatency: number | null;
  catalogUrl: string;
  authOnline: boolean;
  authLatency: number | null;
  testedAt: string | null;
}

export interface MediaAnalyticsItem extends MediaItem {
  views: number;
  watchHours: number;
  completionRate: number;
  likesCount: number;
  dislikesCount: number;
  sentiment: 'Masterpiece' | 'Sangat Bagus' | 'Bagus' | 'Cukup' | 'Perlu Evaluasi';
  sentimentColor: string;
}

export interface MediaFormDraft {
  formTitle: string;
  formOriginalTitle?: string;
  formType?: 'movie' | 'tv';
  formTagline?: string;
  formOverview?: string;
  formPosterUrl?: string;
  formBackdropUrl?: string;
  formReleaseYear?: number;
  formCountry?: string;
  formRating?: number;
  formMatchScore?: number;
  formAgeRating?: 'SU' | '13+' | '16+' | '18+' | '21+';
  formDuration?: string;
  formTotalSeasons?: number;
  formQuality?: '4K UHD' | 'HD' | 'Dolby Vision';
  formAudio?: 'Dolby Atmos' | '5.1 Surround' | 'Stereo';
  formDirector?: string;
  formCast?: string;
  formActors?: { name: string; character: string; profileUrl?: string }[];
  formSelectedGenres?: string[];
  formVideoUrl?: string;
  formTrailerUrl?: string;
  formIsFeatured?: boolean;
  formIsTrending?: boolean;
  formTopRank?: number;
  savedAt: string;
}
