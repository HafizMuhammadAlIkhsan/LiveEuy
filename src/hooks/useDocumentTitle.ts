import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useWatch } from '../context/WatchContext';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'LiveEuy - Sinema 4K & Serial Pilihan',
  '/movies': 'Film Bioskop 4K UHD - LiveEuy',
  '/tv': 'Serial TV & Drama Orisinal - LiveEuy',
  '/series': 'Serial TV & Drama Orisinal - LiveEuy',
  '/trending': 'Paling Populer & Trending - LiveEuy',
  '/watchlist': 'Daftar Tontonan Saya - LiveEuy',
  '/admin': 'Studio Admin Console - LiveEuy',
  '/404': '404 - Halaman Tidak Ditemukan - LiveEuy',
  '/403': '403 - Akses Terlarang - LiveEuy',
  '/500': '500 - Gangguan Server - LiveEuy'
};

export const getPageTitle = (
  pathname: string, 
  searchQuery?: string, 
  activePlayerTitle?: string,
  activeDetailTitle?: string,
  activeDetailYear?: number
): string => {
  if (activePlayerTitle) {
    return `Nonton: ${activePlayerTitle} - LiveEuy 4K`;
  }
  if (activeDetailTitle) {
    return activeDetailYear 
      ? `${activeDetailTitle} (${activeDetailYear}) - LiveEuy` 
      : `${activeDetailTitle} - LiveEuy`;
  }
  if (pathname === '/search') {
    return searchQuery && searchQuery.trim() 
      ? `Pencarian "${searchQuery.trim()}" - LiveEuy` 
      : 'Pencarian Film & Serial - LiveEuy';
  }
  const cleanPath = pathname.toLowerCase().replace(/\/$/, '') || '/';
  return ROUTE_TITLES[cleanPath] || 'LiveEuy - Sinema 4K & Serial Pilihan';
};

/**
 * Custom hook to dynamically manage document title and Open Graph metadata
 */
export const useDocumentTitle = (): void => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { playerState, detailItem } = useWatch();

  const query = searchParams.get('q') || '';
  const playerTitle = playerState.isOpen && playerState.item ? playerState.item.title : undefined;
  const detailTitle = !playerState.isOpen && detailItem ? detailItem.title : undefined;
  const detailYear = !playerState.isOpen && detailItem ? detailItem.releaseYear : undefined;

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const computedTitle = getPageTitle(
      location.pathname, 
      query, 
      playerTitle, 
      detailTitle, 
      detailYear
    );

    document.title = computedTitle;

    // Update og:title meta tag dynamically
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (ogTitleMeta) {
      ogTitleMeta.setAttribute('content', computedTitle);
    }

    const twitterTitleMeta = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitleMeta) {
      twitterTitleMeta.setAttribute('content', computedTitle);
    }
  }, [location.pathname, query, playerTitle, detailTitle, detailYear]);
};
