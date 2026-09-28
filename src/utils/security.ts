import { MediaItem, MediaType } from '../types';

/**
 * Validates and sanitizes a URL against malicious protocols like javascript:, vbscript:, etc.
 * Only allows http:, https:, blob:, relative URLs (/), or safe data:image/ URIs.
 */
export function sanitizeUrl(url: unknown, fallback: string = ''): string {
  if (typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Check for dangerous protocols
  const dangerousProtocolRegex = /^\s*(javascript|vbscript|data(?!\s*:\s*image\/(png|jpe?g|webp|gif|svg\+xml)\b)):/i;
  if (dangerousProtocolRegex.test(trimmed)) {
    return fallback;
  }

  // Allowed patterns: relative paths starting with '/', or http/https/blob/data:image URLs
  const safeProtocolRegex = /^(\/|https?:\/\/|blob:|data:image\/(png|jpe?g|webp|gif|svg\+xml)[;,])/i;
  if (!safeProtocolRegex.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}

/**
 * Strips HTML tags and unescapes dangerous character sequences to prevent Stored XSS.
 */
export function sanitizeText(input: unknown, fallback: string = ''): string {
  if (typeof input !== 'string') return fallback;
  // Strip HTML tags and inline event handlers
  return input
    .replace(/<[^>]*>?/gm, '')
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Sanitizes and validates a single MediaItem from untrusted sources (e.g. JSON file import).
 * Returns null if essential fields are missing or corrupted.
 */
export function sanitizeMediaItem(raw: any): MediaItem | null {
  if (!raw || typeof raw !== 'object') return null;

  const title = sanitizeText(raw.title);
  if (!title) return null;

  const rawType = String(raw.type || '').toLowerCase();
  const type: MediaType = rawType === 'tv' ? 'tv' : 'movie';

  const videoUrl = sanitizeUrl(raw.videoUrl);
  if (!videoUrl) return null; // Reject media without a valid safe video stream URL

  const id = sanitizeText(raw.id) || `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const posterUrl = sanitizeUrl(raw.posterUrl, 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800');
  const backdropUrl = sanitizeUrl(raw.backdropUrl, posterUrl);
  const trailerUrl = raw.trailerUrl ? sanitizeUrl(raw.trailerUrl) : undefined;
  const logoUrl = raw.logoUrl ? sanitizeUrl(raw.logoUrl) : undefined;

  // Numbers validation
  const releaseYear = Number(raw.releaseYear) || new Date().getFullYear();
  const clampedYear = releaseYear >= 1900 && releaseYear <= 2100 ? releaseYear : new Date().getFullYear();

  const rawRating = Number(raw.rating);
  const rating = !isNaN(rawRating) ? Math.min(10, Math.max(0, Math.round(rawRating * 10) / 10)) : 7.5;

  const rawMatch = Number(raw.matchScore);
  const matchScore = !isNaN(rawMatch) ? Math.min(100, Math.max(0, Math.round(rawMatch))) : 90;

  // Enums validation
  const validAgeRatings = ['SU', '13+', '16+', '18+', '21+'];
  const ageRating = validAgeRatings.includes(raw.ageRating) ? raw.ageRating : '13+';

  const validQualities = ['4K UHD', 'HD', 'Dolby Vision'];
  const quality = validQualities.includes(raw.quality) ? raw.quality : 'HD';

  const validAudios = ['Dolby Atmos', '5.1 Surround', 'Stereo'];
  const audio = validAudios.includes(raw.audio) ? raw.audio : 'Stereo';

  // Arrays validation
  const genres = Array.isArray(raw.genres)
    ? raw.genres.map((g: any) => sanitizeText(g)).filter(Boolean)
    : ['Action'];

  const cast = Array.isArray(raw.cast)
    ? raw.cast.map((c: any) => sanitizeText(c)).filter(Boolean)
    : [];

  return {
    id,
    title,
    originalTitle: raw.originalTitle ? sanitizeText(raw.originalTitle) : undefined,
    type,
    tagline: sanitizeText(raw.tagline) || `${title} streaming di LiveEuy`,
    overview: sanitizeText(raw.overview) || 'Sinopsis belum tersedia.',
    posterUrl,
    backdropUrl,
    logoUrl,
    releaseYear: clampedYear,
    country: raw.country ? sanitizeText(raw.country) : 'Indonesia',
    rating,
    matchScore,
    ageRating,
    duration: raw.duration ? sanitizeText(raw.duration) : undefined,
    totalSeasons: Number(raw.totalSeasons) || undefined,
    genres: genres.length > 0 ? genres : ['Film'],
    cast,
    director: sanitizeText(raw.director) || 'Anonim',
    videoUrl,
    trailerUrl,
    isTrending: Boolean(raw.isTrending),
    isFeatured: Boolean(raw.isFeatured),
    topRank: Number(raw.topRank) || undefined,
    quality,
    audio,
    seasons: Array.isArray(raw.seasons) ? raw.seasons : undefined
  };
}

/**
 * Validates and sanitizes a complete catalog array.
 */
export function sanitizeMediaCatalog(rawList: unknown): { sanitized: MediaItem[]; rejectedCount: number } {
  if (!Array.isArray(rawList)) {
    return { sanitized: [], rejectedCount: 0 };
  }

  const sanitized: MediaItem[] = [];
  let rejectedCount = 0;

  for (const item of rawList) {
    const validItem = sanitizeMediaItem(item);
    if (validItem) {
      sanitized.push(validItem);
    } else {
      rejectedCount++;
    }
  }

  return { sanitized, rejectedCount };
}

// ==========================================
// CLIENT-SIDE BRUTE FORCE RATE LIMITER
// ==========================================

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_SECONDS = 60;

interface LockoutRecord {
  attempts: number;
  lockoutUntil: number | null; // epoch timestamp in ms
}

function getStorageKey(email: string): string {
  const normalized = email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '');
  return `liveeuy_auth_throttle_${normalized || 'default'}`;
}

function readRecord(email: string): LockoutRecord {
  if (typeof window === 'undefined') return { attempts: 0, lockoutUntil: null };
  try {
    const data = sessionStorage.getItem(getStorageKey(email));
    if (!data) return { attempts: 0, lockoutUntil: null };
    return JSON.parse(data);
  } catch {
    return { attempts: 0, lockoutUntil: null };
  }
}

function writeRecord(email: string, record: LockoutRecord): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(getStorageKey(email), JSON.stringify(record));
  } catch {
    // ignore storage write errors
  }
}

/**
 * Checks if the given account/email is currently locked out due to excessive failed attempts.
 */
export function getLoginLockoutStatus(email: string): { isLocked: boolean; remainingSeconds: number; attempts: number } {
  const record = readRecord(email);
  if (!record.lockoutUntil) {
    return { isLocked: false, remainingSeconds: 0, attempts: record.attempts };
  }

  const now = Date.now();
  if (now >= record.lockoutUntil) {
    // Lockout has expired, reset attempts
    writeRecord(email, { attempts: 0, lockoutUntil: null });
    return { isLocked: false, remainingSeconds: 0, attempts: 0 };
  }

  const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
  return { isLocked: true, remainingSeconds, attempts: record.attempts };
}

/**
 * Records a failed login attempt and triggers lockout if max attempts is reached.
 */
export function recordFailedLoginAttempt(email: string): { isLocked: boolean; remainingSeconds: number; attempts: number } {
  const record = readRecord(email);
  const newAttempts = record.attempts + 1;

  if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
    const lockoutUntil = Date.now() + LOCKOUT_DURATION_SECONDS * 1000;
    writeRecord(email, { attempts: newAttempts, lockoutUntil });
    return { isLocked: true, remainingSeconds: LOCKOUT_DURATION_SECONDS, attempts: newAttempts };
  }

  writeRecord(email, { attempts: newAttempts, lockoutUntil: null });
  return { isLocked: false, remainingSeconds: 0, attempts: newAttempts };
}

/**
 * Resets the login lockout and failure count upon successful login.
 */
export function clearLoginLockout(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(getStorageKey(email));
  } catch {
    // ignore
  }
}
