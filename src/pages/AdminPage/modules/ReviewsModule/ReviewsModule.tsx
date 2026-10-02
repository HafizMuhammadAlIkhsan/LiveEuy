import React from 'react';
import { MediaItem } from '../../../../types';

interface ReviewsModuleProps {
  allMedia: MediaItem[];
  showToast: (msg: string) => void;
}

export const ReviewsModule: React.FC<ReviewsModuleProps> = ({
  allMedia,
  showToast
}) => {
  const allReviews = allMedia.flatMap(m => 
    (m.reviews || []).map(r => ({ ...r, mediaTitle: m.title, mediaId: m.id }))
  );

  return (
    <section className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Ulasan Komunitas & Rating Masuk</h3>
          <p className="text-xs text-slate-400">Pantau dan moderasi komentar pengguna di setiap film.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {allReviews.map((rev, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-surface-800/60 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={rev.avatar} alt={rev.author} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <h5 className="text-xs font-bold text-white">{rev.author}</h5>
                  <span className="text-[10px] text-brand-400">Pada: {rev.mediaTitle}</span>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                ★ {rev.rating}/10
              </span>
            </div>
            <p className="text-xs text-slate-300 italic">&ldquo;{rev.comment}&rdquo;</p>
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
              <span>{rev.date}</span>
              <button
                onClick={() => showToast(`Ulasan oleh "${rev.author}" diverifikasi aman!`)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
              >
                Verifikasi Aman
              </button>
            </div>
          </div>
        ))}

        {allReviews.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 bg-surface-800/20 rounded-2xl border border-dashed border-white/10">
            Belum ada ulasan komunitas yang masuk.
          </div>
        )}
      </div>
    </section>
  );
};
