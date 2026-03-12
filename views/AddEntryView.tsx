import React, { useState, useEffect, useRef } from 'react';
import { MediaItem, MediaStatus } from '../types';
import { GENRE_OPTIONS } from '../constants';
import { db } from '../db';

interface AddEntryViewProps {
  onCancel: () => void;
  onSave: (item: MediaItem) => void;
  onUpdate: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  initialData: MediaItem | null;
}

const AddEntryView: React.FC<AddEntryViewProps> = ({ onCancel, onSave, onUpdate, onDelete, initialData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States
  const [formData, setFormData] = useState<Partial<MediaItem>>(
    initialData || {
      title: '',
      type: 'Movie',
      status: 'Watching',
      genres: [],
      rating: 0,
      synopsis: '',
      notes: '',
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop',
      globalScore: 0,
      year: new Date().getFullYear(),
      progress: { current: 0, total: 1 }
    }
  );

  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [isLocalImage, setIsLocalImage] = useState(formData.image?.startsWith('data:image') || false);
  const [suggestions, setSuggestions] = useState<MediaItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sync Dark Mode Class (Detection)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    setImagePreviewError(false);
    setIsLocalImage(formData.image?.startsWith('data:image') || false);
  }, [formData.image]);

  const handleTitleChange = async (value: string) => {
    setFormData({ ...formData, title: value });
    if (value.length > 1) {
      try {
        const matches = await (db as any).watchlist
          .where('title')
          .startsWithIgnoreCase(value)
          .limit(5)
          .toArray();
        setSuggestions(matches);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Search error:", err);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (item: MediaItem) => {
    setFormData({
      ...formData,
      title: item.title,
      type: item.type,
      genres: item.genres,
      image: item.image,
      synopsis: item.synopsis,
      year: item.year
    });
    setShowSuggestions(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large. Under 2MB please.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
        setIsLocalImage(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.title) {
      alert("Title is required");
      return;
    }
    
    const item: MediaItem = {
      ...(formData as MediaItem),
      id: initialData?.id || Date.now().toString(),
      lastUpdated: new Date().toISOString() 
    };

    initialData ? onUpdate(item) : onSave(item);
    onCancel();
  };

  const toggleGenre = (genre: string) => {
    const current = formData.genres || [];
    setFormData({
      ...formData,
      genres: current.includes(genre) ? current.filter(g => g !== genre) : [...current, genre]
    });
  };

  const handleRatingClick = (starIndex: number, isHalf: boolean) => {
    setFormData(prev => ({ ...prev, rating: starIndex - (isHalf ? 0.5 : 0) }));
  };

  const renderStars = () => {
    const rating = Number(formData.rating) || 0;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((index) => {
          const isFull = rating >= index;
          const isHalf = !isFull && rating >= (index - 0.5);
          const isFilled = isFull || isHalf;
          return (
            <div key={index} className="relative cursor-pointer select-none transition-transform active:scale-90">
              <div className="absolute left-0 top-0 w-1/2 h-full z-20" onClick={() => handleRatingClick(index, true)} />
              <div className="absolute right-0 top-0 w-1/2 h-full z-20" onClick={() => handleRatingClick(index, false)} />
              <span className={`material-symbols-outlined text-4xl ${isFilled ? 'text-primary' : 'text-[#64876f]/20'}`} style={{ fontVariationSettings: isFilled ? "'FILL' 1" : "none" }}>
                {isHalf ? 'star_half' : 'star'}
              </span>
            </div>
          );
        })}
        <span className="ml-3 text-2xl font-black text-[#112117] dark:text-white transition-colors">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#f8faf9] dark:bg-[#0a140d] overflow-hidden relative transition-colors duration-300">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#f8faf9]/90 dark:bg-[#0a140d]/90 backdrop-blur-xl flex items-center px-6 py-5 border-b border-[#e2ede6] dark:border-white/5">
        <button onClick={onCancel} className="p-1 hover:bg-[#e2ede6] dark:hover:bg-white/5 rounded-full transition-colors">
          <span className="material-symbols-outlined block text-2xl text-[#112117] dark:text-white">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold ml-3 text-[#112117] dark:text-white">
          {initialData ? 'Edit Entry' : 'Add Entry'}
        </h1>
        <div className="ml-auto">
          {initialData && (
            <button onClick={() => confirm('Delete item?') && onDelete(initialData.id)} className="p-2 text-red-500 active:scale-90 transition-transform">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
            </button>
          )}
        </div>
      </header>

      {/* SCROLLABLE MAIN */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-48">
        
        {/* Poster Artwork */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Poster Artwork</p>
            {isLocalImage && <span className="text-[9px] font-bold text-primary/60 uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">Local File</span>}
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <div 
              onClick={() => isLocalImage && fileInputRef.current?.click()} 
              className={`relative w-40 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-[#e2ede6] dark:border-white/10 shadow-2xl bg-[#e2ede6] dark:bg-[#1b3123] flex items-center justify-center transition-all ${isLocalImage ? 'cursor-pointer active:scale-95 group' : ''}`}
            >
              {formData.image && !imagePreviewError ? (
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={() => setImagePreviewError(true)} />
              ) : (
                <span className="material-symbols-outlined text-4xl text-[#112117]/20">image_not_supported</span>
              )}
              {isLocalImage && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                  <span className="material-symbols-outlined text-white">upload</span>
                </div>
              )}
            </div>

            <div className="w-full space-y-4">
              <div className="flex p-1 bg-[#e2ede6] dark:bg-white/5 rounded-xl border border-[#d1dfd6] dark:border-transparent transition-colors">
                <button type="button" onClick={() => setIsLocalImage(true)} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${isLocalImage ? 'bg-primary text-[#0a140d]' : 'text-[#64876f]'}`}>Upload File</button>
                <button type="button" onClick={() => setIsLocalImage(false)} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${!isLocalImage ? 'bg-primary text-[#0a140d]' : 'text-[#64876f]'}`}>Image URL</button>
              </div>

              {!isLocalImage ? (
                <input className="w-full h-12 bg-white dark:bg-white/5 border border-[#e2ede6] dark:border-white/5 rounded-xl px-4 text-sm font-medium dark:text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="https://..." value={formData.image?.startsWith('data:') ? '' : formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
              ) : (
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              )}
            </div>
          </div>
        </section>

        {/* Basic Info */}
        <section className="space-y-6">
          <div className="space-y-2 relative">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary px-1">Title</label>
            <input 
              className="w-full h-14 bg-white dark:bg-white/5 border border-[#e2ede6] dark:border-white/5 rounded-2xl px-5 text-base font-semibold text-[#112117] dark:text-white focus:ring-2 focus:ring-primary/40 outline-none transition-all" 
              value={formData.title} 
              onChange={(e) => handleTitleChange(e.target.value)} 
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Enter title..."
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-[#1b3123] border border-[#e2ede6] dark:border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden transition-all">
                {suggestions.map((item) => (
                  <div key={item.id} onClick={() => selectSuggestion(item)} className="flex items-center gap-3 px-4 py-3 hover:bg-primary/10 cursor-pointer border-b border-[#e2ede6]/50 dark:border-white/5 last:border-none">
                    <img src={item.image} className="w-8 h-11 object-cover rounded shadow-sm" alt="" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#112117] dark:text-white truncate">{item.title}</p>
                      <p className="text-[10px] text-[#64876f] font-bold uppercase">{item.year} • {item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary px-1">Release Year</label>
              <input type="number" className="w-full h-14 bg-white dark:bg-white/5 border border-[#e2ede6] dark:border-white/5 rounded-2xl px-5 font-semibold text-[#112117] dark:text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all" value={formData.year || ''} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary px-1">Content Type</label>
              <select className="w-full h-14 bg-white dark:bg-white/5 border border-[#e2ede6] dark:border-white/5 rounded-2xl px-4 font-semibold text-[#112117] dark:text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}>
                <option value="Movie">Movie</option>
                <option value="Series">Series</option>
                <option value="Anime">Anime</option>
                <option value="Anime Movie">Anime Movie</option>
              </select>
            </div>
          </div>
        </section>

        {/* Progress Tracker */}
        <section className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary px-1">Progress Tracker</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input type="number" className="w-full h-16 bg-white dark:bg-white/5 border border-[#e2ede6] dark:border-white/5 rounded-2xl px-5 pt-6 pb-2 font-black text-xl text-[#112117] dark:text-white outline-none transition-all" value={formData.progress?.current} onChange={(e) => setFormData({ ...formData, progress: { ...formData.progress!, current: parseInt(e.target.value) || 0 }})} />
              <span className="absolute left-5 top-2 text-[9px] font-black text-[#64876f] uppercase tracking-wider">Current Ep</span>
            </div>
            <div className="relative">
              <input type="number" className="w-full h-16 bg-white dark:bg-white/5 border border-[#e2ede6] dark:border-white/5 rounded-2xl px-5 pt-6 pb-2 font-black text-xl text-[#112117] dark:text-white outline-none transition-all" value={formData.progress?.total} onChange={(e) => setFormData({ ...formData, progress: { ...formData.progress!, total: parseInt(e.target.value) || 1 }})} />
              <span className="absolute left-5 top-2 text-[9px] font-black text-[#64876f] uppercase tracking-wider">Total Eps</span>
            </div>
          </div>
        </section>

        {/* Status Selection */}
        <section className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary px-1">Current Status</label>
          <div className="flex p-1.5 bg-[#e2ede6] dark:bg-white/5 rounded-2xl border border-[#d1dfd6] dark:border-transparent transition-colors">
            {(['Watching', 'Completed', 'Dropped'] as MediaStatus[]).map((status) => (
              <button 
                key={status} 
                type="button" 
                onClick={() => setFormData({ ...formData, status })} 
                className={`flex-1 py-3.5 text-[10px] font-black uppercase rounded-xl transition-all duration-300 ${formData.status === status ? 'bg-primary text-[#0a140d] shadow-lg scale-[1.02]' : 'text-[#64876f] dark:text-white/40'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </section>

        {/* Rating Section */}
        <section className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary px-1">Personal Rating</label>
          <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-[#e2ede6] dark:border-white/5 transition-colors">
             {renderStars()}
          </div>
        </section>

        {/* Genre Tags */}
        <section className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary px-1">Genres</label>
          <div className="flex flex-wrap gap-2.5">
            {GENRE_OPTIONS.map(genre => (
              <button 
                key={genre} 
                type="button" 
                onClick={() => toggleGenre(genre)} 
                className={`px-5 py-3 rounded-full font-bold text-[10px] uppercase transition-all border-2 ${formData.genres?.includes(genre) ? 'bg-primary border-primary text-[#0a140d]' : 'bg-transparent border-[#e2ede6] dark:border-white/10 dark:text-white/60'}`}
              >
                {genre}
              </button>
            ))}
          </div>
        </section>

        {/* Synopsis & Notes */}
        <section className="space-y-6">
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary px-1">Synopsis</label>
            <textarea className="w-full bg-white dark:bg-white/5 border border-[#e2ede6] dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-medium dark:text-white resize-none outline-none leading-relaxed transition-all focus:ring-1 focus:ring-primary/50" rows={4} value={formData.synopsis} onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })} />
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary px-1">Personal Notes</label>
            <textarea className="w-full bg-white dark:bg-white/5 border border-[#e2ede6] dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-medium dark:text-white resize-none outline-none leading-relaxed transition-all focus:ring-1 focus:ring-primary/50" rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
        </section>
      </main>

      {/* FOOTER ACTIONS */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-6 bg-[#f8faf9]/95 dark:bg-[#0a140d]/95 backdrop-blur-2xl border-t border-[#e2ede6] dark:border-white/5 z-[80] transition-colors">
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 h-16 rounded-2xl border-2 border-[#e2ede6] dark:border-white/10 font-bold dark:text-white active:scale-95 transition-all">Cancel</button>
          <button onClick={() => handleSubmit()} className="flex-[2] h-16 rounded-2xl bg-primary text-[#0a140d] font-black text-lg uppercase shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all">
            {initialData ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AddEntryView;