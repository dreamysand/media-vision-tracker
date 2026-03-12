import React, { useEffect } from 'react';
import { MediaItem, UserProfile } from '../types';

interface HomeViewProps {
  user: UserProfile;
  watchlist: MediaItem[];
  onSelect: (id: string) => void;
  onAdd: () => void;
  onViewAll: (filter?: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ user, watchlist, onSelect, onAdd, onViewAll }) => {
  // Logic Filters
  const ongoing = watchlist.filter(i => i.status === 'Watching');
  const recentlyAdded = [...watchlist]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 5);
  const topRated = watchlist.filter(i => i.rating >= 4.5);

  // Sync Dark Mode Detection
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#f8faf9] dark:bg-[#0a140d] overflow-y-auto no-scrollbar pb-32 transition-colors duration-300">
      
      {/* Header Profile Section */}
      <header className="flex items-center justify-between px-6 pt-10 pb-6 sticky top-0 bg-[#f8faf9]/80 dark:bg-[#0a140d]/80 backdrop-blur-xl z-30 transition-colors">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/30 shadow-inner">
            <img 
              alt={user.name} 
              className="w-full h-full object-cover" 
              src={user.avatar} 
            />
          </div>
          <div>
            <p className="text-[10px] text-[#64876f] dark:text-[#a3c0ae] font-black uppercase tracking-[0.2em]">Welcome Back</p>
            <h1 className="text-xl font-black leading-tight text-[#112117] dark:text-white">
              Hi, {user.name.split(' ')[0]}
            </h1>
          </div>
        </div>
        <button 
          onClick={onAdd}
          className="relative p-3 rounded-2xl bg-white dark:bg-[#1b3123] shadow-lg shadow-primary/5 border border-[#e2ede6] dark:border-[#2a4535] text-primary active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            add_circle
          </span>
        </button>
      </header>

      <main className="flex-1 space-y-12 mt-2">
        
        {/* Ongoing Section - Large Cards */}
        {ongoing.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between px-6 mb-5">
              <h2 className="text-xl font-black tracking-tight text-[#112117] dark:text-white">Ongoing</h2>
              <button onClick={() => onViewAll('Watching')} className="text-xs font-black uppercase tracking-widest text-primary hover:opacity-70">View All</button>
            </div>
            <div className="flex overflow-x-auto no-scrollbar gap-5 px-6">
              {ongoing.map(item => (
                <div key={item.id} onClick={() => onSelect(item.id)} className="shrink-0 w-48 group cursor-pointer">
                  <div className="relative aspect-[2/3] rounded-[24px] overflow-hidden shadow-2xl border border-[#e2ede6] dark:border-[#2a4535] transition-transform duration-500 group-hover:scale-[1.02]">
                    <img className="w-full h-full object-cover" src={item.image} alt={item.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a140d] via-transparent to-transparent opacity-90"></div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      {item.progress && (
                        <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden backdrop-blur-md">
                          <div 
                            className="bg-primary h-full transition-all duration-1000" 
                            style={{ width: `${(item.progress.current / item.progress.total) * 100}%` }}
                          ></div>
                        </div>
                      )}
                      <p className="text-[10px] text-white font-black uppercase tracking-widest mt-3 flex justify-between">
                        <span>{item.type}</span>
                        <span>{item.type === 'Movie' ? 'In Progress' : `${item.progress?.current}/${item.progress?.total}`}</span>
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 font-bold text-sm truncate text-[#112117] dark:text-white px-1">{item.title}</p>
                  <p className="text-[11px] font-medium text-[#64876f] dark:text-[#a3c0ae] px-1">{item.genres[0]}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recently Added Section - Small Circle/Square Cards */}
        <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          <div className="flex items-center justify-between px-6 mb-5">
            <h2 className="text-xl font-black tracking-tight text-[#112117] dark:text-white">Recently Added</h2>
            <button onClick={() => onViewAll()} className="text-xs font-black uppercase tracking-widest text-primary">History</button>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-5 px-6">
            {recentlyAdded.map(item => (
              <div key={item.id} onClick={() => onSelect(item.id)} className="shrink-0 w-32 group cursor-pointer text-center">
                <div className="relative aspect-square rounded-[32px] overflow-hidden shadow-md border border-[#e2ede6] dark:border-[#2a4535] group-active:scale-95 transition-transform duration-300">
                  <img className="w-full h-full object-cover" src={item.image} alt={item.title} />
                </div>
                <p className="mt-3 font-bold text-[11px] truncate text-[#112117] dark:text-white">{item.title}</p>
                <p className="text-[9px] font-black uppercase text-[#64876f] tracking-tighter opacity-60">{item.year} • {item.type}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Top Rated Section - Wide Landscape Cards */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="flex items-center justify-between px-6 mb-5">
            <div className="flex flex-col">
              <h2 className="text-xl font-black tracking-tight text-[#112117] dark:text-white">Top Rated</h2>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Masterpiece Collection</p>
            </div>
            <button onClick={() => onViewAll('top-rated')} className="p-2 rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-lg">trending_up</span>
            </button>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-5 px-6">
            {topRated.map(item => (
              <div key={item.id} onClick={() => onSelect(item.id)} className="shrink-0 w-72 group cursor-pointer">
                <div className="relative aspect-[16/9] rounded-[28px] overflow-hidden shadow-xl border border-[#e2ede6] dark:border-[#2a4535]">
                  <img className="w-full h-full object-cover" src={item.image} alt={item.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  <div className="absolute top-4 left-4">
                     <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                        <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-white text-xs font-black">{item.rating.toFixed(1)}</span>
                     </div>
                  </div>

                  <div className="absolute bottom-4 left-5 right-5">
                    <p className="font-black text-lg text-white truncate drop-shadow-md">{item.title}</p>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest">{item.genres.slice(0, 2).join(' • ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomeView;