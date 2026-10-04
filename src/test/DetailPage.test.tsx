import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { WatchProvider } from '../context/WatchContext';
import { DetailPage } from '../pages/DetailPage';

describe('DetailPage Component', () => {
  it('renders detail page for existing series with title, episodes, and Cast section', () => {
    const { getByText, getAllByText } = render(
      <MemoryRouter initialEntries={['/series/the-mentalist']}>
        <WatchProvider>
          <Routes>
            <Route path="/series/:id" element={<DetailPage />} />
          </Routes>
        </WatchProvider>
      </MemoryRouter>
    );

    // Title & Badges
    expect(getAllByText('The Mentalist').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Serial TV').length).toBeGreaterThanOrEqual(1);
    expect(getByText('Episode & Musim')).toBeInTheDocument();
    expect(getByText(/White Orchids/)).toBeInTheDocument();

    // Cast Section
    expect(getByText('Cast')).toBeInTheDocument();
    expect(getByText('Simon Baker')).toBeInTheDocument();
    expect(getByText('Patrick Jane')).toBeInTheDocument();
    expect(getByText('Robin Tunney')).toBeInTheDocument();
    expect(getByText('Teresa Lisbon')).toBeInTheDocument();
  });

  it('renders not found screen when ID does not match any media', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/series/non-existent-show-123']}>
        <WatchProvider>
          <Routes>
            <Route path="/series/:id" element={<DetailPage />} />
          </Routes>
        </WatchProvider>
      </MemoryRouter>
    );

    expect(getByText('Tayangan Tidak Ditemukan')).toBeInTheDocument();
    expect(getByText('Kembali ke Beranda')).toBeInTheDocument();
  });
});
