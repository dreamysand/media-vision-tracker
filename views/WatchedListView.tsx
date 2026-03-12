import React, { useState, useMemo, useEffect } from 'react';
import { MediaItem } from '../types';

interface WatchedListViewProps {
  watchlist: MediaItem[];
  onSelect: (id: string) => void;
  initialFilter?: string;
}

type SortKey = 'title' | 'rating' | 'episodes' | 'status';
type SortOrder = 'asc' | 'desc';

const WatchedListView: React.FC<WatchedListViewProps> = ({ watchlist, onSelect, initialFilter }) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Movie' | 'Series' | 'Anime' | 'Anime Movie'>('All');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter || 'All');
  
  // State untuk Sorting
  const [sortKey, setSortKey] = useState<SortKey>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const tabs: ('All' | 'Movie' | 'Series' | 'Anime' | 'Anime Movie')[] = ['All', 'Movie', 'Series', 'Anime', 'Anime Movie'];

  // Sync Dark Mode Detection
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    // 1. Filtering Logic
    let result = watchlist.filter(item => {
      const matchesTab = activeTab === 'All' || item.type === activeTab;
      let matchesStatus = true;
      if (statusFilter === 'Watching') matchesStatus = item.status === 'Watching';
      else if (statusFilter === 'Completed') matchesStatus = item.status === 'Completed';
      else if (statusFilter === 'top-rated') matchesStatus = item.rating >= 4.5;
      
      return matchesTab && matchesStatus;
    });

    // 2. Sorting Logic
    return result.sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortKey === 'rating') {
        comparison = a.rating - b.rating;
      } else if (sortKey === 'episodes') {
        const aEps = a.progress?.total || 0;
        const bEps = b.progress?.total || 0;
        comparison = aEps - bEps;
      } else if (sortKey === 'status') {
        comparison = a.status.localeCompare(b.status);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [watchlist, activeTab, statusFilter, sortKey, sortOrder]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a140d] overflow-y-auto no-scrollbar pb-32 transition-colors duration-300">
      
      {/* Header Sticky Section */}
      <header className="px-6 pt-8 pb-4 sticky top-0 bg-white/90 dark:bg-[#0a140d]/90 backdrop-blur-xl z-30 border-b border-[#f0f4f2] dark:border-white/5">
        <h1 className="text-3xl font-black dark:text-white mb-6 tracking-tight">My Watchlist</h1>
        
        {/* Type Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shrink-0 ${
                activeTab === tab 
                  ? 'bg-primary text-[#0a140d] shadow-lg shadow-primary/20' 
                  : 'bg-[#f0f4f2] dark:bg-white/5 text-[#64876f] border border-transparent dark:border-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Status & Sort Controls */}
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-[10px] font-black text-[#64876f] uppercase tracking-widest overflow-x-auto no-scrollbar">
              {['All', 'Watching', 'Completed'].map((s) => (
                <button 
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`pb-1 border-b-2 transition-all shrink-0 ${statusFilter === s ? 'border-primary text-primary' : 'border-transparent opacity-50'}`}
                >
                  {s === 'All' ? 'All Items' : s === 'Watching' ? 'Ongoing' : s}
                </button>
              ))}
            </div>

            {/* Sort Toggle Display */}
            <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
              <span className="material-symbols-outlined text-primary text-xs">sort</span>
              <span className="text-[9px] font-black text-primary uppercase">{sortKey} • {sortOrder}</span>
            </div>
          </div>

          {/* Sorting Action Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {(['title', 'rating', 'episodes', 'status'] as SortKey[]).map((key) => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${
                  sortKey === key 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-transparent border-[#e2ede6] dark:border-white/10 text-[#64876f]'
                }`}
              >
                <span className="capitalize">{key}</span>
                {sortKey === key && (
                  <span className="material-symbols-outlined text-sm">
                    {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Watchlist Grid/List */}
      <main className="px-6 mt-8 space-y-4">
        {filteredAndSortedItems.length > 0 ? (
          filteredAndSortedItems.map((item, index) => (
            <div 
              key={item.id} 
              onClick={() => onSelect(item.id)}
              className="group flex gap-4 p-4 bg-white dark:bg-white/5 rounded-[28px] border border-[#f0f4f2] dark:border-white/5 active:scale-[0.97] transition-all cursor-pointer shadow-sm hover:shadow-md animate-in fade-in slide-in-from-bottom-3 duration-500"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="relative w-24 h-32 shrink-0 rounded-2xl overflow-hidden shadow-md">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase">
                   {item.year}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-[9px] font-black text-primary uppercase tracking-tighter">
                      {item.type}
                    </span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
                      item.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                      item.status === 'Watching' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h3 className="font-black text-base dark:text-white leading-tight truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-medium text-[#64876f] mt-1 truncate">{item.genres.join(' • ')}</p>
                </div>

                <div className="space-y-3">
                  {item.progress && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black dark:text-white/40 uppercase tracking-widest">
                        <span>Progress</span>
                        <span className="text-[#112117] dark:text-white">{item.progress.current}/{item.progress.total} eps</span>
                      </div>
                      <div className="w-full bg-[#f0f4f2] dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-700" 
                          style={{ width: `${(item.progress.current / (item.progress.total || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-sm font-black dark:text-white">{item.rating.toFixed(1)}</span>
                    </div>
                    {item.type !== 'Movie' && item.progress && (
                       <div className="flex items-center gap-1 opacity-40">
                         <span className="material-symbols-outlined text-base">layers</span>
                         <span className="text-[10px] font-bold dark:text-white">{item.progress.total} total</span>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 flex flex-col items-center text-center">
            <div className="size-20 rounded-full bg-[#f8faf9] dark:bg-white/5 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-5xl text-[#64876f]/20">movie_off</span>
            </div>
            <h3 className="text-lg font-black dark:text-white">Empty Collection</h3>
            <p className="text-sm text-[#64876f] mt-2 max-w-[200px]">No matches found for your current filter settings.</p>
            <button 
              onClick={() => { setActiveTab('All'); setStatusFilter('All'); setSortKey('title'); }}
              className="mt-6 px-6 py-2 bg-primary/10 text-primary font-black text-[11px] uppercase tracking-widest rounded-xl"
            >
              Reset All
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default WatchedListView;