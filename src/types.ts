export type MediaType = 'movie' | 'tv';

export interface Episode {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  overview: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
}

export interface Season {
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface MediaItem {
  id: string;
  title: string;
  originalTitle?: string;
  type: MediaType;
  tagline: string;
  overview: string;
  posterUrl: string;
  backdropUrl: string;
  logoUrl?: string;
  releaseYear: number;
  rating: number; // 0 - 10
  matchScore: number; // e.g. 98%
  ageRating: 'SU' | '13+' | '16+' | '18+' | '21+';
  duration?: string; // e.g. "2j 14m" for movies
  totalSeasons?: number; // for tv
  genres: string[];
  cast: string[];
  director: string;
  videoUrl: string; // Preview or full stream
  trailerUrl?: string;
  isTrending?: boolean;
  isFeatured?: boolean;
  topRank?: number; // 1-10
  quality: '4K UHD' | 'HD' | 'Dolby Vision';
  audio: 'Dolby Atmos' | '5.1 Surround' | 'Stereo';
  seasons?: Season[];
  reviews?: Review[];
}

export interface WatchProgress {
  mediaId: string;
  currentTime: number;
  duration: number;
  percentage: number;
  lastWatched: number;
  episodeId?: string;
}

export type ViewTab = 'home' | 'movies' | 'tv' | 'trending' | 'watchlist' | 'search' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tier: 'Free Guest' | 'VIP Standard' | 'VIP Cinema Ultra';
  role?: 'admin' | 'user';
  memberSince?: string;
  watchHours?: number;
  devices?: number;
}

export interface VisitorSession {
  sessionId: string;
  cookieToken: string;
  ipAddress: string;
  city?: string;
  country?: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  os: string;
  browser: string;
  screenResolution: string;
  language: string;
  timeZone: string;
  userAgent: string;
  firstSeen: string;
  lastActive: string;
  currentPage: string;
  visitedPages: string[];
  userEmail?: string;
  isCurrentDevice?: boolean;
}
