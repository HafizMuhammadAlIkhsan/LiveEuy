import React from 'react';
import { WatchProvider, useWatch } from './context/WatchContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MediaRow } from './components/MediaRow';
import { TopTenRow } from './components/TopTenRow';
import { CatalogView } from './components/CatalogView';
import { WatchlistView } from './components/WatchlistView';
import { DetailModal } from './components/DetailModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { Footer } from './components/Footer';

const MainContent: React.FC = () => {
  const { currentTab, setCurrentTab, allMedia, watchHistory, searchQuery } = useWatch();

  const featuredItems = allMedia.filter(item => item.isFeatured);
  const trendingItems = allMedia.filter(item => item.isTrending);
  const actionItems = allMedia.filter(item => item.genres.includes('Aksi') || item.genres.includes('Fiksi Ilmiah'));
  const dramaItems = allMedia.filter(item => item.genres.includes('Drama') || item.genres.includes('Thriller'));
  const animationItems = allMedia.filter(item => item.genres.includes('Animasi') || item.genres.includes('Komedi'));

  // Continue watching row
  const continueWatchingItems = allMedia.filter(item => {
    const prog = watchHistory[item.id];
    return prog && prog.percentage > 0 && prog.percentage < 98;
  });

  return (
    <div className="min-h-screen bg-[#08090d] flex flex-col justify-between pb-16 md:pb-0">
      <div>
        <Navbar />

        {/* Tab 1: SEARCH RESULTS */}
        {currentTab === 'search' || searchQuery.trim() ? (
          <CatalogView 
            pageTitle={`Hasil Pencarian: "${searchQuery}"`}
            pageSubtitle="Temukan film, serial, dan tayangan favorit Anda"
          />
        ) : currentTab === 'movies' ? (
          /* Tab 2: MOVIES ONLY */
          <CatalogView 
            forcedType="movie" 
            pageTitle="Film Layar Lebar & Blockbuster" 
            pageSubtitle="Jelajahi ratusan judul film bioskop terbaik dalam kualitas 4K UHD"
          />
        ) : currentTab === 'tv' ? (
          /* Tab 3: TV SERIES ONLY */
          <CatalogView 
            forcedType="tv" 
            pageTitle="Serial TV & Drama Eksklusif" 
            pageSubtitle="Serial original multi-episode dengan alur cerita mendalam"
          />
        ) : currentTab === 'trending' ? (
          /* Tab 4: TRENDING */
          <CatalogView 
            pageTitle="Tayangan Sedang Trending" 
            pageSubtitle="Paling banyak dibicarakan dan ditonton di LiveEuy pekan ini"
          />
        ) : currentTab === 'watchlist' ? (
          /* Tab 5: WATCHLIST */
          <WatchlistView />
        ) : (
          /* Tab 6: HOME DASHBOARD (BERANDA) */
          <main>
            {/* Cinematic Hero Banner Carousel */}
            <HeroBanner featuredItems={featuredItems} />

            <div className="relative z-20 -mt-10 sm:-mt-16 space-y-6 pb-20">
              
              {/* Continue Watching Row (if any) */}
              {continueWatchingItems.length > 0 && (
                <MediaRow
                  title="Lanjutkan Menonton"
                  subtitle="Tontonan yang belum Anda selesaikan"
                  items={continueWatchingItems}
                  onViewAll={() => setCurrentTab('watchlist')}
                />
              )}

              {/* Top 10 Ranked Row */}
              <TopTenRow items={allMedia} />

              {/* Trending in Indonesia */}
              <MediaRow
                title="Sedang Populer di Indonesia"
                subtitle="Judul film dan serial paling banyak ditonton saat ini"
                items={trendingItems}
                onViewAll={() => setCurrentTab('trending')}
              />

              {/* Action & Sci-Fi Row */}
              <MediaRow
                title="Aksi Spektakuler & Fiksi Ilmiah"
                subtitle="Petualangan beroktan tinggi dan teknologi masa depan"
                items={actionItems}
                onViewAll={() => setCurrentTab('movies')}
              />

              {/* Drama & Thriller Row */}
              <MediaRow
                title="Serial Drama & Cerita Penuh Misteri"
                subtitle="Plot twist tak terduga dan emosi yang menguras air mata"
                items={dramaItems}
                onViewAll={() => setCurrentTab('tv')}
              />

              {/* Animation & Comedy Row */}
              <MediaRow
                title="Animasi, Anime & Komedi Menghibur"
                subtitle="Tontonan seru penuh imajinasi untuk segala usia"
                items={animationItems}
                onViewAll={() => setCurrentTab('movies')}
              />

            </div>
          </main>
        )}
      </div>

      <Footer />

      {/* Global Modals */}
      <DetailModal />
      <VideoPlayerModal />
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
