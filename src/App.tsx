import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { WatchProvider, useWatch } from './context/WatchContext';
import { Navbar } from './components/Navbar';
import { TopMarqueeAd } from './components/TopMarqueeAd';
import { FloatingStickyAd } from './components/FloatingStickyAd';
import { PopunderInterceptor } from './components/PopunderInterceptor';
import { DetailModal } from './components/DetailModal';
import { AuthModal } from './components/AuthModal';
import { MobileSyncModal } from './components/MobileSyncModal';
import { PartnershipModal } from './components/PartnershipModal';
import { FamilyProfilesModal } from './components/FamilyProfilesModal';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NetworkStatusToast } from './components/NetworkStatusToast';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { CatalogGridSkeleton } from './components/SkeletonLoader';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import { AdminRouteGuard } from './components/AdminRouteGuard';

// Lazy-loaded pages for code splitting & optimal bundle size
const MoviesPage = React.lazy(() => import('./pages/MoviesPage').then(m => ({ default: m.MoviesPage })));
const SeriesPage = React.lazy(() => import('./pages/SeriesPage').then(m => ({ default: m.SeriesPage })));
const TrendingPage = React.lazy(() => import('./pages/TrendingPage').then(m => ({ default: m.TrendingPage })));
const WatchlistPage = React.lazy(() => import('./pages/WatchlistPage').then(m => ({ default: m.WatchlistPage })));
const SearchPage = React.lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const NotFoundPage = React.lazy(() => import('./pages/ErrorPages').then(m => ({ default: m.NotFoundPage })));
const ForbiddenPage = React.lazy(() => import('./pages/ErrorPages').then(m => ({ default: m.ForbiddenPage })));
const ServerErrorPage = React.lazy(() => import('./pages/ErrorPages').then(m => ({ default: m.ServerErrorPage })));

// Lazy-loaded heavy modals
const VideoPlayerModal = React.lazy(() => import('./components/VideoPlayerModal').then(m => ({ default: m.VideoPlayerModal })));
const DeviceSecurityModal = React.lazy(() => import('./components/DeviceSecurityModal').then(m => ({ default: m.DeviceSecurityModal })));

const PageLoader: React.FC<{ isCatalog?: boolean }> = ({ isCatalog }) => {
  if (isCatalog) {
    return <CatalogGridSkeleton count={12} />;
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase animate-pulse">
        Memuat Sinema...
      </p>
    </div>
  );
};

const DetailModalRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/?detail=${encodeURIComponent(id || '')}`} replace />;
};

const MainContent: React.FC = () => {
  useDocumentTitle();
  const { currentTab } = useWatch();
  const location = useLocation();
  const isAdminView = location.pathname.startsWith('/admin') || currentTab === 'admin';
  const isCatalogRoute = ['/movies', '/tv', '/series', '/trending', '/watchlist', '/search'].includes(location.pathname);

  return (
    <div className={`min-h-screen bg-[#08090d] flex flex-col justify-between ${isAdminView ? 'pb-0' : 'pb-16 md:pb-0'}`}>
      <div>
        {!isAdminView && (
          <>
            <TopMarqueeAd />
            <Navbar />
          </>
        )}

        {/* Route-level Error Boundary with Suspense & Shimmer Skeletons */}
        <ErrorBoundary 
          isRouteBoundary 
          fallbackTitle="Halaman Sementara Tidak Dapat Dimuat"
          fallbackDescription="Terjadi kendala saat memuat konten pada halaman ini. Anda tetap dapat menggunakan menu navigasi atau kembali ke Beranda."
        >
          <Suspense fallback={<PageLoader isCatalog={isCatalogRoute} />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/tv" element={<SeriesPage />} />
              <Route path="/series" element={<Navigate to="/tv" replace />} />
              <Route path="/movie/:id" element={<DetailModalRedirect />} />
              <Route path="/movies/:id" element={<DetailModalRedirect />} />
              <Route path="/series/:id" element={<DetailModalRedirect />} />
              <Route path="/tv/:id" element={<DetailModalRedirect />} />
              <Route path="/detail/:id" element={<DetailModalRedirect />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route 
                path="/admin" 
                element={
                  <AdminRouteGuard>
                    <AdminPage />
                  </AdminRouteGuard>
                } 
              />
              <Route path="/403" element={<ForbiddenPage />} />
              <Route path="/500" element={<ServerErrorPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>

      {!isAdminView && <Footer />}

      {/* Floating Sticky Bottom Banner & Popunder Interstitial */}
      {!isAdminView && (
        <>
          <FloatingStickyAd />
          <PopunderInterceptor />
        </>
      )}

      {/* Global Modals */}
      <DetailModal />
      <AuthModal />
      <MobileSyncModal />
      <PartnershipModal />
      <FamilyProfilesModal />

      {/* Heavy Modals (Isolated in their own Error Boundary) */}
      <ErrorBoundary fallbackTitle="Pemutar Video Mengalami Kendala">
        <Suspense fallback={null}>
          <VideoPlayerModal />
          <DeviceSecurityModal />
        </Suspense>
      </ErrorBoundary>

      {/* PWA Installation Prompt & Connectivity Notification Toast */}
      <PwaInstallPrompt />
      <NetworkStatusToast />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="LiveEuy Mengalami Kendala Sistem">
      <WatchProvider>
        <MainContent />
      </WatchProvider>
    </ErrorBoundary>
  );
};

export default App;
