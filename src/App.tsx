import React from 'react';
import { WatchProvider, useWatch } from './context/WatchContext';
import { Navbar } from './components/Navbar';
import { DetailModal } from './components/DetailModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { AuthModal } from './components/AuthModal';
import { MobileSyncModal } from './components/MobileSyncModal';
import { DeviceSecurityModal } from './components/DeviceSecurityModal';
import { PartnershipModal } from './components/PartnershipModal';
import { Footer } from './components/Footer';
import {
  HomePage,
  MoviesPage,
  SeriesPage,
  TrendingPage,
  WatchlistPage,
  SearchPage,
  AdminPage
} from './pages';

const MainContent: React.FC = () => {
  const { currentTab, searchQuery } = useWatch();
  const isAdminView = currentTab === 'admin' && !searchQuery.trim();

  return (
    <div className={`min-h-screen bg-[#08090d] flex flex-col justify-between ${isAdminView ? 'pb-0' : 'pb-16 md:pb-0'}`}>
      <div>
        {!isAdminView && <Navbar />}

        {/* Clean Modular Page Routing with Distinct Architectural Structures */}
        {currentTab === 'search' || searchQuery.trim() ? (
          <SearchPage />
        ) : currentTab === 'admin' ? (
          <AdminPage />
        ) : currentTab === 'movies' ? (
          <MoviesPage />
        ) : currentTab === 'tv' ? (
          <SeriesPage />
        ) : currentTab === 'trending' ? (
          <TrendingPage />
        ) : currentTab === 'watchlist' ? (
          <WatchlistPage />
        ) : (
          <HomePage />
        )}
      </div>

      {!isAdminView && <Footer />}

      {/* Global Modals */}
      <DetailModal />
      <VideoPlayerModal />
      <AuthModal />
      <MobileSyncModal />
      <DeviceSecurityModal />
      <PartnershipModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <WatchProvider>
      <MainContent />
    </WatchProvider>
  );
};

export default App;
