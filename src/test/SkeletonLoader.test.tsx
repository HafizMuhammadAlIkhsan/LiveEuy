import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { 
  MediaCardSkeleton, 
  MediaRowSkeleton, 
  HeroBannerSkeleton, 
  CatalogGridSkeleton 
} from '../components/SkeletonLoader';

describe('SkeletonLoader Components', () => {
  it('renders MediaCardSkeleton in portrait and landscape modes without crashing', () => {
    const { container: portrait } = render(<MediaCardSkeleton aspectRatio="portrait" />);
    expect(portrait.firstChild).toHaveClass('animate-pulse');

    const { container: landscape } = render(<MediaCardSkeleton aspectRatio="landscape" />);
    expect(landscape.firstChild).toHaveClass('animate-pulse');
  });

  it('renders MediaRowSkeleton with correct item count and title', () => {
    const { getByText, container } = render(<MediaRowSkeleton count={4} title="Sedang Hangat" />);
    expect(getByText('Sedang Hangat')).toBeInTheDocument();
    const cards = container.querySelectorAll('.animate-pulse');
    // Header + cards
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  it('renders HeroBannerSkeleton without crashing', () => {
    const { container } = render(<HeroBannerSkeleton />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('renders CatalogGridSkeleton with specified count', () => {
    const { getByText, container } = render(<CatalogGridSkeleton count={6} title="Katalog Film" />);
    expect(getByText('Katalog Film')).toBeInTheDocument();
    const cards = container.querySelectorAll('.animate-pulse');
    expect(cards.length).toBeGreaterThanOrEqual(6);
  });
});
