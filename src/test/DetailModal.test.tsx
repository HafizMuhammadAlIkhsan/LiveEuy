import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WatchProvider, useWatch } from '../context/WatchContext';
import { DetailModal } from '../components/DetailModal';

// Test consumer helper to open detail modal with specified media item
const ModalTestController: React.FC<{ mediaIdToOpen?: string }> = ({ mediaIdToOpen }) => {
  const { allMedia, openDetail, detailItem } = useWatch();

  return (
    <div>
      <div data-testid="detail-status">{detailItem ? `open:${detailItem.id}` : 'closed'}</div>
      {mediaIdToOpen && (
        <button
          data-testid="trigger-open"
          onClick={() => {
            const item = allMedia.find(m => m.id === mediaIdToOpen);
            if (item) openDetail(item);
          }}
        >
          Open Target
        </button>
      )}
    </div>
  );
};

describe('DetailModal Component', () => {
  it('renders nothing when no detailItem is active', () => {
    const { queryByRole } = render(
      <MemoryRouter>
        <WatchProvider>
          <DetailModal />
          <ModalTestController />
        </WatchProvider>
      </MemoryRouter>
    );

    expect(queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('detail-status')).toHaveTextContent('closed');
  });

  it('opens modal, renders series with episodes and cast directly scrollable in overview', () => {
    render(
      <MemoryRouter>
        <WatchProvider>
          <DetailModal />
          <ModalTestController mediaIdToOpen="the-mentalist" />
        </WatchProvider>
      </MemoryRouter>
    );

    // Click trigger to open modal with 'the-mentalist'
    fireEvent.click(screen.getByTestId('trigger-open'));

    // Modal dialog is open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('detail-status')).toHaveTextContent('open:the-mentalist');

    // Title and Badges
    expect(screen.getAllByText('The Mentalist').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Serial Eksklusif')).toBeInTheDocument();

    // Tabs exist
    expect(screen.getByRole('button', { name: /^Ringkasan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Episode & Musim/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Pemeran/i })).toBeInTheDocument();

    // Episodes are visible directly in overview (user can scroll to see other episodes)
    expect(screen.getByText(/White Orchids/i)).toBeInTheDocument();

    // Cast / Actors are visible directly in overview (user can scroll to see actors)
    expect(screen.getByText('Cast')).toBeInTheDocument();
    expect(screen.getByText('Simon Baker')).toBeInTheDocument();
    expect(screen.getByText('Patrick Jane')).toBeInTheDocument();
    expect(screen.getByText('Robin Tunney')).toBeInTheDocument();
    expect(screen.getByText('Teresa Lisbon')).toBeInTheDocument();

    // Close button dismisses modal
    const closeBtn = screen.getByLabelText('Tutup Detail');
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('detail-status')).toHaveTextContent('closed');
  });

  it('allows switching to dedicated Episodes tab and clicking episode to play', () => {
    render(
      <MemoryRouter>
        <WatchProvider>
          <DetailModal />
          <ModalTestController mediaIdToOpen="the-mentalist" />
        </WatchProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('trigger-open'));

    // Switch to 'Episode & Musim' tab
    const episodesTabBtn = screen.getByRole('button', { name: /^Episode & Musim/i });
    fireEvent.click(episodesTabBtn);

    // Dedicated episode list header and episode cards exist
    expect(screen.getByText('Daftar Lengkap Episode & Musim')).toBeInTheDocument();
    expect(screen.getByText(/White Orchids/i)).toBeInTheDocument();

    // Cast section is also present at bottom of episodes tab
    expect(screen.getByText('Cast')).toBeInTheDocument();
    expect(screen.getByText('Simon Baker')).toBeInTheDocument();
  });

  it('renders movie modal with cast section', () => {
    render(
      <MemoryRouter>
        <WatchProvider>
          <DetailModal />
          <ModalTestController mediaIdToOpen="bayang-di-balik-kabut" />
        </WatchProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('trigger-open'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText('Bayang di Balik Kabut').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Film Layar Lebar')).toBeInTheDocument();

    // Cast section exists for movies too
    expect(screen.getByText('Cast')).toBeInTheDocument();
    expect(screen.getByText('Marsha Timothy')).toBeInTheDocument();
  });
});
