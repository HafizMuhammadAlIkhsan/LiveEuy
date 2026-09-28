import { describe, it, expect } from 'vitest';
import { getPageTitle } from '../hooks/useDocumentTitle';

describe('useDocumentTitle & getPageTitle Helper', () => {
  it('returns default title for home route "/"', () => {
    expect(getPageTitle('/')).toBe('LiveEuy - Sinema 4K & Serial Pilihan');
  });

  it('returns cinema title for movies route "/movies"', () => {
    expect(getPageTitle('/movies')).toBe('Film Bioskop 4K UHD - LiveEuy');
  });

  it('returns series title for tv route "/tv"', () => {
    expect(getPageTitle('/tv')).toBe('Serial TV & Drama Orisinal - LiveEuy');
  });

  it('returns trending title for trending route "/trending"', () => {
    expect(getPageTitle('/trending')).toBe('Paling Populer & Trending - LiveEuy');
  });

  it('returns watchlist title for watchlist route "/watchlist"', () => {
    expect(getPageTitle('/watchlist')).toBe('Daftar Tontonan Saya - LiveEuy');
  });

  it('returns admin title for admin route "/admin"', () => {
    expect(getPageTitle('/admin')).toBe('Studio Admin Console - LiveEuy');
  });

  it('returns dynamic query title for search route "/search"', () => {
    expect(getPageTitle('/search', 'Inception')).toBe('Pencarian "Inception" - LiveEuy');
    expect(getPageTitle('/search', '')).toBe('Pencarian Film & Serial - LiveEuy');
  });

  it('prioritizes active video player title over route', () => {
    expect(getPageTitle('/movies', undefined, 'Avatar: The Way of Water')).toBe(
      'Nonton: Avatar: The Way of Water - LiveEuy 4K'
    );
  });

  it('prioritizes active media detail over route', () => {
    expect(getPageTitle('/movies', undefined, undefined, 'Cyberpunk: Neo Nusantara', 2026)).toBe(
      'Cyberpunk: Neo Nusantara (2026) - LiveEuy'
    );
  });
});
