import { VisitorSession } from '../types';

export const TRACKER_COOKIE_NAME = 'liveeuy_visitor_token';
const SESSIONS_STORAGE_KEY = 'liveeuy_tracked_sessions';

/**
 * Cookie Helper: Get cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Cookie Helper: Set persistent cookie
 */
export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Cookie Helper: Delete cookie
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
}

/**
 * Detect Client OS from User-Agent
 */
export function detectOS(ua: string): string {
  if (/macintosh|mac os x/i.test(ua)) {
    if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
    return 'macOS';
  }
  if (/windows nt 10\.0/i.test(ua)) return 'Windows 11/10';
  if (/windows nt 6\.3/i.test(ua)) return 'Windows 8.1';
  if (/windows nt 6\.1/i.test(ua)) return 'Windows 7';
  if (/windows/i.test(ua)) return 'Windows';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/linux/i.test(ua)) return 'Linux';
  if (/cros/i.test(ua)) return 'ChromeOS';
  return 'Unknown OS';
}

/**
 * Detect Browser from User-Agent
 */
export function detectBrowser(ua: string): string {
  if (/edg/i.test(ua)) return 'Microsoft Edge';
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return 'Opera';
  if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) return 'Google Chrome';
  if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) return 'Apple Safari';
  if (/firefox|fxios/i.test(ua)) return 'Mozilla Firefox';
  return 'Web Browser';
}

/**
 * Detect Device Type
 */
export function detectDeviceType(ua: string): 'Desktop' | 'Mobile' | 'Tablet' {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (/(ipad|tablet|(android(?!.*mobile)))/i.test(ua) || (hasTouch && width >= 640 && width <= 1024)) {
      return 'Tablet';
    }
    if (/(android|iphone|ipod|mobile)/i.test(ua) || width < 640) {
      return 'Mobile';
    }
  }
  return 'Desktop';
}

/**
 * Fetch Public Client IP with graceful fallback
 */
export async function fetchClientIP(): Promise<{ ip: string; city: string; country: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return {
        ip: data.ip || '180.252.164.218',
        city: 'Jakarta',
        country: 'Indonesia'
      };
    }
  } catch {
    // Network blocked, offline, or adblocker active
  }

  return {
    ip: '180.252.164.218',
    city: 'Jakarta',
    country: 'Indonesia'
  };
}

/**
 * Pre-seeded mock visitor sessions for demo & realism
 */
const DEFAULT_SESSIONS: VisitorSession[] = [
  {
    sessionId: 'sess-jkt-01',
    cookieToken: 'lv_cookie_9f82a17b8c2d',
    ipAddress: '182.253.14.82',
    city: 'Jakarta Selatan',
    country: 'Indonesia',
    deviceType: 'Desktop',
    os: 'Windows 11/10',
    browser: 'Google Chrome',
    screenResolution: '1920x1080',
    language: 'id-ID',
    timeZone: 'Asia/Jakarta',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0',
    firstSeen: '24 Sep 2026 10:14',
    lastActive: '5 menit yang lalu',
    currentPage: 'Beranda (Home)',
    visitedPages: ['home', 'movies', 'trending'],
    userEmail: 'hafiz@liveeuy.id'
  },
  {
    sessionId: 'sess-sby-02',
    cookieToken: 'lv_cookie_4b31e8c991a0',
    ipAddress: '114.124.201.45',
    city: 'Surabaya',
    country: 'Indonesia',
    deviceType: 'Mobile',
    os: 'iOS',
    browser: 'Apple Safari',
    screenResolution: '390x844',
    language: 'id-ID',
    timeZone: 'Asia/Jakarta',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    firstSeen: '24 Sep 2026 11:30',
    lastActive: '12 menit yang lalu',
    currentPage: 'Film Bioskop (Movies)',
    visitedPages: ['home', 'movies'],
    userEmail: 'budi@liveeuy.id'
  },
  {
    sessionId: 'sess-bdg-03',
    cookieToken: 'lv_cookie_e19c4d23f77b',
    ipAddress: '36.85.92.110',
    city: 'Bandung',
    country: 'Indonesia',
    deviceType: 'Desktop',
    os: 'macOS',
    browser: 'Apple Safari',
    screenResolution: '2560x1440',
    language: 'en-US',
    timeZone: 'Asia/Jakarta',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.5 Safari/605.1.15',
    firstSeen: '24 Sep 2026 12:05',
    lastActive: '18 menit yang lalu',
    currentPage: 'Serial TV (Series)',
    visitedPages: ['home', 'tv'],
    userEmail: 'siti@liveeuy.id'
  },
  {
    sessionId: 'sess-dps-04',
    cookieToken: 'lv_cookie_aa2715cc60de',
    ipAddress: '103.111.80.19',
    city: 'Denpasar, Bali',
    country: 'Indonesia',
    deviceType: 'Tablet',
    os: 'Android',
    browser: 'Google Chrome',
    screenResolution: '800x1280',
    language: 'id-ID',
    timeZone: 'Asia/Makassar',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-X210) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36',
    firstSeen: '24 Sep 2026 13:20',
    lastActive: '25 menit yang lalu',
    currentPage: 'Pencarian (Search)',
    visitedPages: ['home', 'search']
  }
];

/**
 * Retrieve all tracked sessions
 */
export function getStoredSessions(): VisitorSession[] {
  if (typeof localStorage === 'undefined') return DEFAULT_SESSIONS;
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_SESSIONS;
  } catch {
    return DEFAULT_SESSIONS;
  }
}

/**
 * Save sessions list to LocalStorage
 */
export function saveStoredSessions(sessions: VisitorSession[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions:', e);
  }
}

/**
 * Initialize or update the current visitor's cookie & session
 */
export async function trackCurrentVisitor(
  currentPage = 'home',
  userEmail?: string
): Promise<VisitorSession> {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  let cookieToken = getCookie(TRACKER_COOKIE_NAME);

  if (!cookieToken) {
    // Generate new unique cookie token for this client
    cookieToken = `lv_cookie_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    setCookie(TRACKER_COOKIE_NAME, cookieToken, 365);
  }

  const os = detectOS(ua);
  const browser = detectBrowser(ua);
  const deviceType = detectDeviceType(ua);
  const screenResolution = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '1920x1080';
  const language = typeof navigator !== 'undefined' ? navigator.language : 'id-ID';
  const timeZone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Jakarta';

  // Fetch real IP
  const ipInfo = await fetchClientIP();

  const sessions = getStoredSessions();
  const existingIdx = sessions.findIndex(s => s.cookieToken === cookieToken);

  const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  let currentSession: VisitorSession;

  if (existingIdx >= 0) {
    const prev = sessions[existingIdx];
    currentSession = {
      ...prev,
      cookieToken,
      ipAddress: ipInfo.ip || prev.ipAddress,
      city: ipInfo.city || prev.city,
      country: ipInfo.country || prev.country,
      os,
      browser,
      deviceType,
      screenResolution,
      lastActive: `Baru saja (${nowStr})`,
      currentPage,
      visitedPages: Array.from(new Set([...prev.visitedPages, currentPage])),
      userEmail: userEmail || prev.userEmail,
      isCurrentDevice: true
    };
    sessions[existingIdx] = currentSession;
  } else {
    currentSession = {
      sessionId: `sess-${Date.now().toString(36)}`,
      cookieToken,
      ipAddress: ipInfo.ip,
      city: ipInfo.city,
      country: ipInfo.country,
      deviceType,
      os,
      browser,
      screenResolution,
      language,
      timeZone,
      userAgent: ua,
      firstSeen: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      lastActive: `Aktif sekarang (${nowStr})`,
      currentPage,
      visitedPages: [currentPage],
      userEmail,
      isCurrentDevice: true
    };
    sessions.unshift(currentSession);
  }

  // Ensure all other sessions are marked as not current device
  const normalized = sessions.map(s => ({
    ...s,
    isCurrentDevice: s.cookieToken === cookieToken
  }));

  saveStoredSessions(normalized);
  return currentSession;
}

/**
 * Clear all tracked session logs and reset cookie
 */
export function resetVisitorTracking(): void {
  deleteCookie(TRACKER_COOKIE_NAME);
  saveStoredSessions(DEFAULT_SESSIONS);
}
