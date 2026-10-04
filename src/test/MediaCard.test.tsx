import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MediaCard } from '../components/MediaCard';
import { WatchProvider } from '../context/WatchContext';
import { MOCK_MEDIA } from '../data/mockData';

const movieItem = MOCK_MEDIA.find(m => m.type === 'movie' && m.quality === '4K UHD') || MOCK_MEDIA[0];
const tvItem = MOCK_MEDIA.find(m => m.type === 'tv' && (m.quality === 'Dolby Vision' || m.quality === '4K UHD')) || MOCK_MEDIA[1];

describe('MediaCard Thumbnail Badges', () => {
  it('renders "movie" badge and not 4K/Dolby quality badge on movie thumbnail in grid layout', () => {
    const { container } = render(
      <MemoryRouter>
        <WatchProvider>
          <MediaCard item={movieItem} layout="grid" />
        </WatchProvider>
      </MemoryRouter>
    );

    // Badge with text "movie" should be rendered
    const movieBadges = screen.getAllByText('movie');
    expect(movieBadges.length).toBeGreaterThanOrEqual(1);

    // The top thumbnail badge container should not contain the quality string (4K UHD)
    const topBadgesContainer = container.querySelector('.pointer-events-none');
    expect(topBadgesContainer).toBeInTheDocument();
    expect(topBadgesContainer?.textContent).toContain('movie');
    expect(topBadgesContainer?.textContent).not.toContain('4K UHD');
    expect(topBadgesContainer?.textContent).not.toContain('Dolby');
  });

  it('renders "tv" badge and not 4K/Dolby quality badge on tv series thumbnail in grid layout', () => {
    const { container } = render(
      <MemoryRouter>
        <WatchProvider>
          <MediaCard item={tvItem} layout="grid" />
        </WatchProvider>
      </MemoryRouter>
    );

    const tvBadges = screen.getAllByText('tv');
    expect(tvBadges.length).toBeGreaterThanOrEqual(1);

    const topBadgesContainer = container.querySelector('.pointer-events-none');
    expect(topBadgesContainer).toBeInTheDocument();
    expect(topBadgesContainer?.textContent).toContain('tv');
    expect(topBadgesContainer?.textContent).not.toContain(tvItem.quality);
  });

  it('renders "movie" badge on movie thumbnail in list layout', () => {
    const { container } = render(
      <MemoryRouter>
        <WatchProvider>
          <MediaCard item={movieItem} layout="list" />
        </WatchProvider>
      </MemoryRouter>
    );

    const topBadges = container.querySelector('.absolute.top-2.left-2');
    expect(topBadges).toBeInTheDocument();
    expect(topBadges?.textContent).toContain('movie');
    expect(topBadges?.textContent).not.toContain('4K UHD');
  });

  it('renders "tv" badge on tv series thumbnail in list layout', () => {
    const { container } = render(
      <MemoryRouter>
        <WatchProvider>
          <MediaCard item={tvItem} layout="list" />
        </WatchProvider>
      </MemoryRouter>
    );

    const topBadges = container.querySelector('.absolute.top-2.left-2');
    expect(topBadges).toBeInTheDocument();
    expect(topBadges?.textContent).toContain('tv');
    expect(topBadges?.textContent).not.toContain(tvItem.quality);
  });
});
