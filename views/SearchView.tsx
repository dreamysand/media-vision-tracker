import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';

interface SearchViewProps {
  watchlist: MediaItem[];
  onSelect: (id: string) => void;
}

const SearchView: React.FC<SearchViewProps> = ({ watchlist, onSelect }) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Sync Dark Mode Detection
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const filters = ['All', 'Anime', 'Movie', 'Series'];

  const filtered = watchlist.filter(item => {
    const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase()) ||
                         item.genres.some(g => g.toLowerCase().includes(query.toLowerCase()));
    const matchesType = activeFilter === 'All' || item.type === activeFilter;
    
    return matchesQuery && matchesType;
  }).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a140d] overflow-y-auto no-scrollbar pb-32 transition-colors duration-300">
      
      {/* Header & Search Bar */}
      <header className="p-6 sticky top-0 bg-white/80 dark:bg-[#0a140d]/80 backdrop-blur-xl z-30 border-b border-[#f0f4f2] dark:border-white/5">
        <h1 className="text-3xl font-black tracking-tight mb-6 dark:text-white">Discover</h1>
        
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#64876f] group-focus-within:text-primary transition-colors">
            search
          </span>
          <input 
            type="text"
            placeholder="Search titles or genres..."
            className="w-full h-14 pl-12 pr-12 bg-[#f8faf9] dark:bg-white/5 border border-[#e2ede6] dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/40 focus:bg-white dark:focus:bg-white/10 outline-none transition-all dark:text-white font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center rounded-full bg-[#64876f]/10 text-[#64876f]"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Quick Filter Chips */}
        <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeFilter === f 
                ? 'bg-primary text-[#0a140d] shadow-lg shadow-primary/20' 
                : 'bg-[#f0f4f2] dark:bg-white/5 text-[#64876f] dark:text-white/40 border border-transparent dark:border-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Results List */}
      <div className="px-6 mt-6 space-y-4">
        {filtered.length > 0 ? (
          filtered.map((item, index) => (
            <div 
              key={item.id} 
              onClick={() => onSelect(item.id)}
              className="flex gap-4 p-4 rounded-[28px] bg-white dark:bg-white/5 border border-[#f0f4f2] dark:border-white/5 active:scale-[0.97] hover:border-primary/30 transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative shrink-0">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-20 h-28 object-cover rounded-2xl shadow-md" 
                />
                <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[8px] font-black text-white uppercase">
                  {item.year}
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-[9px] font-black text-primary uppercase tracking-tighter">
                    {item.type}
                  </span>
                  <span className="text-[10px] font-bold text-[#64876f] uppercase tracking-widest">
                    {item.status}
                  </span>
                </div>
                
                <h3 className="font-black text-lg dark:text-white leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-xs font-medium text-[#64876f] dark:text-gray-400 truncate">
                  {item.genres.join(' • ')}
                </p>
                
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  <span className="text-sm font-black dark:text-white">{item.rating.toFixed(1)}</span>
                  <span className="text-[10px] font-bold text-[#64876f]/50">/ 5.0</span>
                </div>
              </div>

              <div className="flex items-center pr-2">
                <div className="size-10 rounded-full flex items-center justify-center bg-[#f8faf9] dark:bg-white/5 text-[#64876f] group-hover:bg-primary group-hover:text-[#0a140d] transition-all">
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 flex flex-col items-center text-center">
            <div className="size-24 rounded-full bg-[#f8faf9] dark:bg-white/5 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-5xl text-[#64876f]/20">
                manage_search
              </span>
            </div>
            <h3 className="text-lg font-black dark:text-white">No Results Found</h3>
            <p className="text-sm text-[#64876f] mt-2 max-w-[200px]">
              We couldn't find anything matching "{query}" in your {activeFilter !== 'All' ? activeFilter : 'watchlist'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;