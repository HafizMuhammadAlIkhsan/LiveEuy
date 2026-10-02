import React from 'react';

export const FALLBACK_POSTER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="50%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#08090d" />
        </linearGradient>
      </defs>
      <rect width="300" height="450" fill="url(#bg)"/>
      <rect x="15" y="15" width="270" height="420" rx="16" stroke="rgba(255,255,255,0.08)" stroke-width="2" fill="none"/>
      <circle cx="150" cy="200" r="44" fill="rgba(67,63,254,0.2)"/>
      <path d="M140 180 L170 200 L140 220 Z" fill="#6366f1"/>
      <text x="150" y="275" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="16" font-weight="700" text-anchor="middle">LiveEuy Sinema</text>
      <text x="150" y="298" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="500" text-anchor="middle">Pratinjau Sinema</text>
    </svg>
  `.trim());

export const FALLBACK_BACKDROP =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0b0f19" />
          <stop offset="100%" stop-color="#18182e" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bg)"/>
      <circle cx="800" cy="420" r="100" fill="rgba(67,63,254,0.2)"/>
      <path d="M780 370 L840 420 L780 470 Z" fill="#6366f1"/>
      <text x="800" y="580" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="32" font-weight="700" text-anchor="middle">LiveEuy Sinema 4K</text>
    </svg>
  `.trim());

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget;
  if (target.src !== FALLBACK_POSTER) {
    target.onerror = null;
    target.src = FALLBACK_POSTER;
  }
};

export const handleBackdropError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget;
  if (target.src !== FALLBACK_BACKDROP) {
    target.onerror = null;
    target.src = FALLBACK_BACKDROP;
  }
};
