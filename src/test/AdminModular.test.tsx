import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WatchProvider } from '../context/WatchContext';
import { AdminPage } from '../pages/AdminPage';
import { MediaModal } from '../pages/AdminPage/modules/MediaModule/MediaModal';
import { saveMediaDraft, loadMediaDraft, clearMediaDraft } from '../pages/AdminPage/utils';

describe('AdminModular - Tahap 1 Modular Architecture & Autosave', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Draft Autosave Storage Utilities', () => {
    it('saves, loads, and clears draft correctly with localStorage', () => {
      // 1. Initially no draft
      expect(loadMediaDraft()).toBeNull();

      // 2. Save draft
      saveMediaDraft({
        formTitle: 'Film Eksperimental',
        formOverview: 'Sinopsis film eksperimental yang sedang diketik.',
        formType: 'movie',
        formRating: 8.5
      });
      const loaded = loadMediaDraft();
      expect(loaded).not.toBeNull();
      expect(loaded?.formTitle).toBe('Film Eksperimental');
      expect(loaded?.formOverview).toBe('Sinopsis film eksperimental yang sedang diketik.');
      expect(typeof loaded?.savedAt).toBe('string');

      // 3. Clear draft
      clearMediaDraft();
      expect(loadMediaDraft()).toBeNull();
    });
  });

  describe('MediaModal Component with Autosave Draft Feature', () => {
    it('renders modal when open and displays input fields', () => {
      render(
        <MediaModal
          isOpen={true}
          onClose={vi.fn()}
          editingItem={null}
          onSave={vi.fn()}
          runStreamHealthCheck={vi.fn()}
          isTestingStream={false}
          streamHealthResult={null}
          setStreamHealthResult={vi.fn()}
          isPreviewPlayerOpen={false}
          setIsPreviewPlayerOpen={vi.fn()}
        />
      );

      expect(screen.getByText('Tambah Tayangan Baru ke Katalog')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Contoh: Cyberpunk: Neo Nusantara')).toBeInTheDocument();
    });

    it('prompts banner when existing draft is detected and restores draft upon confirmation', async () => {
      // Pre-populate a draft in localStorage
      saveMediaDraft({
        formTitle: 'Draft Tersimpan Otomatis',
        formOverview: 'Ringkasan yang tersimpan saat admin mengetik.'
      });

      render(
        <MediaModal
          isOpen={true}
          onClose={vi.fn()}
          editingItem={null}
          onSave={vi.fn()}
          runStreamHealthCheck={vi.fn()}
          isTestingStream={false}
          streamHealthResult={null}
          setStreamHealthResult={vi.fn()}
          isPreviewPlayerOpen={false}
          setIsPreviewPlayerOpen={vi.fn()}
        />
      );

      // Verify draft banner alert is rendered
      expect(screen.getByText('Ditemukan draft tersimpan otomatis')).toBeInTheDocument();
      expect(screen.getByText('Pulihkan Draft')).toBeInTheDocument();
      expect(screen.getByText('Hapus')).toBeInTheDocument();

      // Click "Pulihkan Draft"
      fireEvent.click(screen.getByText('Pulihkan Draft'));

      // Expect input field value to be restored
      const titleInput = screen.getByPlaceholderText('Contoh: Cyberpunk: Neo Nusantara') as HTMLInputElement;
      expect(titleInput.value).toBe('Draft Tersimpan Otomatis');
    });

    it('discards draft when user clicks Hapus', () => {
      saveMediaDraft({
        formTitle: 'Draft Dibuang',
        formOverview: 'Akan dihapus.'
      });

      render(
        <MediaModal
          isOpen={true}
          onClose={vi.fn()}
          editingItem={null}
          onSave={vi.fn()}
          runStreamHealthCheck={vi.fn()}
          isTestingStream={false}
          streamHealthResult={null}
          setStreamHealthResult={vi.fn()}
          isPreviewPlayerOpen={false}
          setIsPreviewPlayerOpen={vi.fn()}
        />
      );

      const discardBtn = screen.getByText('Hapus');
      fireEvent.click(discardBtn);

      // Verify draft in localStorage is removed
      expect(loadMediaDraft()).toBeNull();
      // Banner disappears
      expect(screen.queryByText('Ditemukan draft tersimpan otomatis')).not.toBeInTheDocument();
    });
  });

  describe('AdminPage Modular Shell Navigation', () => {
    it('renders AdminPage sidebar navigation and default Media Catalog module', async () => {
      render(
        <MemoryRouter>
          <WatchProvider>
            <AdminPage />
          </WatchProvider>
        </MemoryRouter>
      );

      // Check header and sidebar navigation
      expect(screen.getByText('KONTEN & KATALOG')).toBeInTheDocument();
      expect(screen.getByText('Katalog Media')).toBeInTheDocument();
      expect(screen.getByText('Banner & Pengumuman')).toBeInTheDocument();
      expect(screen.getByText('Iklan & Billboard')).toBeInTheDocument();
      expect(screen.getByText('Episode & Musim')).toBeInTheDocument();
    });

    it('can switch tabs to other modules without crashing', async () => {
      render(
        <MemoryRouter>
          <WatchProvider>
            <AdminPage />
          </WatchProvider>
        </MemoryRouter>
      );

      // Click on "Iklan & Billboard"
      const adsTab = screen.getByText('Iklan & Billboard');
      fireEvent.click(adsTab);

      // Ads module header should now be active
      expect(screen.getAllByText('Iklan & Billboard Sponsor').length).toBeGreaterThanOrEqual(1);

      // Click on "Episode & Musim"
      const epTab = screen.getByText('Episode & Musim');
      fireEvent.click(epTab);
      expect(screen.getAllByText('Episode & Musim Serial').length).toBeGreaterThanOrEqual(1);

      // Click on "Banner & Pengumuman"
      const bannerTab = screen.getByText('Banner & Pengumuman');
      fireEvent.click(bannerTab);
      expect(screen.getAllByText('Banner & Pengumuman').length).toBeGreaterThanOrEqual(1);
    });
  });
});
