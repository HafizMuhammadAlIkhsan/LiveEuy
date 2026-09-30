import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TopTenRow } from '../components/TopTenRow';
import { WatchProvider, useWatch } from '../context/WatchContext';
import { MOCK_MEDIA } from '../data/mockData';

const TopTenTestWrapper: React.FC = () => {
  const { allMedia, detailItem } = useWatch();
  return (
    <div>
      <div data-testid="detail-status">{detailItem ? detailItem.title : 'none'}</div>
      <TopTenRow items={allMedia} />
    </div>
  );
};

describe('TopTenRow Component', () => {
  it('renders top 10 items with Netflix-style vector numerals', () => {
    const { container } = render(
      <MemoryRouter>
        <WatchProvider>
          <TopTenTestWrapper />
        </WatchProvider>
      </MemoryRouter>
    );

    // Section title
    expect(screen.getByText('Top 10 Tontonan Terpopuler di Indonesia Hari Ini')).toBeInTheDocument();

    // Check SVG rank numerals
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(10);

    // Check numeral 1 has the dedicated Netflix vector path with broad base and beak
    const rankOnePath = container.querySelector('path[d*="M12 52"]');
    expect(rankOnePath).toBeInTheDocument();

    // Check numeral 10 text exists
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('opens detail modal when a top 10 card is clicked', () => {
    render(
      <MemoryRouter>
        <WatchProvider>
          <TopTenTestWrapper />
        </WatchProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('detail-status')).toHaveTextContent('none');

    // Click on the first card
    const firstTitle = screen.getByText('Cyberpunk: Neo Nusantara');
    const firstCard = firstTitle.closest('.cursor-pointer');
    expect(firstCard).toBeInTheDocument();

    if (firstCard) {
      fireEvent.click(firstCard);
      expect(screen.getByTestId('detail-status')).toHaveTextContent('Cyberpunk: Neo Nusantara');
    }
  });
});
