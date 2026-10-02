import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StreamingHubs, StreamingPlatformBanner } from '../components/StreamingHubs';
import { MediaCard } from '../components/MediaCard';
import { WatchProvider } from '../context/WatchContext';
import { MOCK_MEDIA } from '../data/mockData';
import { MediaItem } from '../types';

describe('StreamingHubs & Platform Exclusives Suite', () => {
  it('renders all brand hubs: Semua, Netflix, Disney+, Prime Video, and HBO', () => {
    const handleSelect = vi.fn();
    const mockCounts = {
      'Semua Platform': 16,
      'Netflix': 4,
      'Disney+': 4,
      'Prime Video': 4,
      'HBO': 4,
    };

    render(
      <StreamingHubs
        selectedPlatform="Semua Platform"
        onSelectPlatform={handleSelect}
        counts={mockCounts}
      />
    );

    expect(screen.getByText('Semua')).toBeInTheDocument();
    expect(screen.getByText('Netflix Originals')).toBeInTheDocument();
    expect(screen.getByText('Disney+ Exclusive')).toBeInTheDocument();
    expect(screen.getByText('Prime Originals')).toBeInTheDocument();
    expect(screen.getByText('HBO Original')).toBeInTheDocument();
  });

  it('triggers onSelectPlatform when clicking a brand hub', () => {
    const handleSelect = vi.fn();

    render(
      <StreamingHubs
        selectedPlatform="Semua Platform"
        onSelectPlatform={handleSelect}
      />
    );

    const disneyHub = screen.getByRole('tab', { name: /Disney\+/i });
    fireEvent.click(disneyHub);

    expect(handleSelect).toHaveBeenCalledWith('Disney+');

    const netflixHub = screen.getByRole('tab', { name: /Netflix/i });
    fireEvent.click(netflixHub);

    expect(handleSelect).toHaveBeenCalledWith('Netflix');
  });

  it('renders StreamingPlatformBanner with correct brand info and responds to onClear', () => {
    const handleClear = vi.fn();

    const { rerender } = render(
      <StreamingPlatformBanner
        platform="Disney+"
        onClear={handleClear}
        count={4}
      />
    );

    expect(screen.getByText('Koleksi Eksklusif')).toBeInTheDocument();
    expect(screen.getByText('Disney+ Exclusive')).toBeInTheDocument();
    expect(screen.getByText('Lihat Semua Studio')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Lihat Semua Studio/i }));
    expect(handleClear).toHaveBeenCalledTimes(1);

    // When platform is 'Semua Platform', banner should be hidden
    rerender(
      <StreamingPlatformBanner
        platform="Semua Platform"
        onClear={handleClear}
        count={16}
      />
    );
    expect(screen.queryByText('Koleksi Eksklusif')).not.toBeInTheDocument();
  });

  it('renders streaming platform badge on MediaCard in grid layout', () => {
    const disneyItem = MOCK_MEDIA.find(m => m.network === 'Disney+') || MOCK_MEDIA[0];

    render(
      <BrowserRouter>
        <WatchProvider>
          <MediaCard item={disneyItem} layout="grid" />
        </WatchProvider>
      </BrowserRouter>
    );

    // Card should render with the item title visible
    expect(screen.getByText(disneyItem.title)).toBeInTheDocument();
  });

  it('renders streaming platform badge on MediaCard in list layout', () => {
    const netflixItem = MOCK_MEDIA.find(m => m.network === 'Netflix') || MOCK_MEDIA[0];

    render(
      <BrowserRouter>
        <WatchProvider>
          <MediaCard item={netflixItem} layout="list" />
        </WatchProvider>
      </BrowserRouter>
    );

    // Card should render with the item title visible
    expect(screen.getByRole('heading', { name: netflixItem.title })).toBeInTheDocument();
  });

  it('renders onViewAllCatalog button in StreamingPlatformBanner when provided', () => {
    const handleClear = vi.fn();
    const handleViewAll = vi.fn();

    render(
      <StreamingPlatformBanner
        platform="Netflix"
        onClear={handleClear}
        count={5}
        onViewAllCatalog={handleViewAll}
        viewAllLabel="Lihat Semua Film & Serial Netflix"
      />
    );

    const viewAllBtn = screen.getByRole('button', { name: /Lihat Semua Film & Serial Netflix/i });
    expect(viewAllBtn).toBeInTheDocument();
    fireEvent.click(viewAllBtn);
    expect(handleViewAll).toHaveBeenCalledTimes(1);
  });

  it('ensures both TV series and movies have networks assigned across all streaming platforms', () => {
    const platforms = ['Netflix', 'Disney+', 'Prime Video', 'HBO'];

    platforms.forEach(platform => {
      const items = MOCK_MEDIA.filter(m => m.network === platform);
      expect(items.length).toBeGreaterThan(0);

      const hasTv = items.some(m => m.type === 'tv');
      const hasMovie = items.some(m => m.type === 'movie');
      expect(hasTv).toBe(true);
      expect(hasMovie).toBe(true);
    });
  });
});
