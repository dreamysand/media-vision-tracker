import React, { useEffect } from 'react';
import { MediaItem } from '../types';

interface DetailViewProps {
  item: MediaItem;
  onBack: () => void;
  onEdit: () => void;
  onUpdate: (item: MediaItem) => void;
}

const DetailView: React.FC<DetailViewProps> = ({ item, onBack, onEdit, onUpdate }) => {
  
  // Sync Dark Mode Detection
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Fungsi update progress yang mendukung slider dan tombol
  const handleProgressChange = (value: number) => {
    if (!item.progress) return;
    
    // Pastikan nilai tetap di antara 0 dan total
    const newCurrent = Math.min(Math.max(0, value), item.progress.total);
    
    // Logika penentuan status otomatis
    let newStatus = item.status;
    if (newCurrent === item.progress.total) {
      newStatus = 'Completed';
    } else if (newCurrent > 0) {
      newStatus = 'Watching';
    } else if (newCurrent === 0 && item.status === 'Completed') {
      newStatus = 'Watching'; // Jika direset ke 0, balik ke watching
    }

    onUpdate({
      ...item,
      progress: { ...item.progress, current: newCurrent },
      status: newStatus,
      lastUpdated: new Date().toISOString()
    });
  };

  const renderRatingStars = () => {
    const rating = Number(item.rating) || 0;
    return (
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4, 5].map((index) => {
          const isFull = rating >= index;
          const isHalf = !isFull && rating >= index - 0.5;
          const isFilled = isFull || isHalf;
          return (
            <span 
              key={index} 
              className={`material-symbols-outlined text-2xl ${isFilled ? 'text-primary' : 'text-[#64876f]/30'}`}
              style={{ fontVariationSettings: isFilled ? "'FILL' 1" : "none" }}
            >
              {isHalf ? 'star_half' : 'star'}
            </span>
          );
        })}
      </div>
    );
  };

  // Kalkulasi persentase untuk bar slider
  const progressPercent = item.progress 
    ? (item.progress.current / (item.progress.total || 1)) * 100 
    : 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a140d] overflow-y-auto no-scrollbar pb-32 transition-colors duration-300">
      
      {/* Hero Section */}
      <div className="relative w-full h-[450px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-110" 
          style={{ backgroundImage: `url('${item.image}')` }}
        />
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0a140d] via-transparent to-black/40"></div>
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
        
        {/* Navigation Buttons */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 z-10">
          <button 
            onClick={onBack} 
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-xl text-white hover:bg-white/40 active:scale-90 transition-all border border-white/20"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <button 
            onClick={onEdit} 
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-[#0a140d] shadow-2xl shadow-primary/40 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative -mt-16 flex flex-col rounded-t-[48px] bg-white dark:bg-[#0a140d] px-8 pt-12 shadow-[0_-20px_60px_rgba(0,0,0,0.15)] transition-colors duration-300">
        
        {/* Title & Badge */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center rounded-xl bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
              {item.status}
            </span>
            <span className="text-sm font-bold text-[#64876f]">
              {item.year} • {item.type}
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#111713] dark:text-white leading-[1.15]">
            {item.title}
          </h1>
        </div>

        {/* Progress Tracker (Only for episodic content) */}
        {(item.type === 'Series' || item.type === 'Anime') && item.progress && (
          <div className="mt-10 p-7 rounded-[32px] bg-[#f8faf9] dark:bg-white/5 border border-[#e2ede6] dark:border-white/5 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64876f]">Watching Progress</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-black text-[#112117] dark:text-white">{item.progress.current}</span>
                  <span className="text-sm font-bold text-[#64876f]">/ {item.progress.total} episodes</span>
                </div>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/10">
                <span className="text-[13px] font-black text-primary">{Math.round(progressPercent)}%</span>
              </div>
            </div>

            {/* Custom Interactive Slider */}
            <div className="relative w-full h-8 flex items-center mb-8">
              <div className="absolute w-full h-2.5 bg-[#e2ede6] dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max={item.progress.total}
                value={item.progress.current}
                onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer accent-primary z-10 opacity-0"
              />
            </div>

            {/* Manual Controls */}
            <div className="flex gap-4">
              <button 
                onClick={() => handleProgressChange(item.progress!.current - 1)}
                className="flex-1 h-16 rounded-2xl bg-white dark:bg-white/5 border border-[#e2ede6] dark:border-white/10 flex items-center justify-center text-[#112117] dark:text-white active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-2xl">remove</span>
              </button>
              <button 
                onClick={() => handleProgressChange(item.progress!.current + 1)}
                className="flex-[1.5] h-16 rounded-2xl bg-primary text-[#0a140d] font-black flex items-center justify-center active:scale-95 transition-all shadow-xl shadow-primary/30"
              >
                <span className="material-symbols-outlined text-2xl font-black">add</span>
              </button>
            </div>
          </div>
        )}

        {/* Score & Rating Bar */}
        <div className="mt-10 flex items-center justify-between py-8 border-y border-[#f0f4f2] dark:border-white/5 transition-colors">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#64876f]">Personal Score</span>
            {renderRatingStars()}
          </div>
          <div className="text-right">
            <span className="text-4xl font-black text-[#111713] dark:text-white">{(item.rating || 0).toFixed(1)}</span>
            <span className="text-sm font-bold text-[#64876f] ml-1.5">/ 5.0</span>
          </div>
        </div>

        {/* Genres Tags */}
        <div className="mt-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#64876f] block mb-4">Categories</span>
          <div className="flex flex-wrap gap-3">
            {item.genres.map(genre => (
              <span key={genre} className="px-5 py-2.5 rounded-2xl bg-[#f0f4f2] dark:bg-white/5 text-[11px] font-black uppercase tracking-wider text-[#111713] dark:text-white border border-transparent dark:border-white/5">
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Synopsis Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-black text-[#111713] dark:text-white tracking-tight">Synopsis</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#64876f] dark:text-gray-400 font-medium">
            {item.synopsis || "This title currently has no description available. You can add one by editing the entry."}
          </p>
        </div>

        {/* Personal Thoughts / Notes */}
        {item.notes && (
          <div className="mt-12 mb-12">
            <h2 className="text-2xl font-black text-[#111713] dark:text-white tracking-tight">Journal Entries</h2>
            <div className="mt-5 relative p-7 rounded-[40px] bg-primary/5 dark:bg-primary/10 border border-primary/20 overflow-hidden">
                {/* Decorative Quote Icon */}
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl opacity-10 text-primary rotate-12 select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                  format_quote
                </span>
                
                <p className="relative z-10 italic text-[16px] leading-8 text-[#111713] dark:text-gray-200">
                  "{item.notes}"
                </p>
                
                <div className="mt-8 flex items-center justify-between border-t border-primary/10 pt-5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#64876f]">Last Logged</span>
                      <span className="text-[11px] font-bold text-[#111713] dark:text-white/80">
                        {new Date(item.lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-primary text-xl">history_edu</span>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailView;