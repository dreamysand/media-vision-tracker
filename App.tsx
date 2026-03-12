import React, { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { ViewState, MediaItem, UserProfile } from './types';
import HomeView from './views/HomeView';
import DetailView from './views/DetailView';
import AddEntryView from './views/AddEntryView';
import SearchView from './views/SearchView';
import ProfileView from './views/ProfileView';
import EditProfileView from './views/EditProfileView';
import WatchedListView from './views/WatchedListView';
import BottomNav from './components/BottomNav';

const DEFAULT_USER: UserProfile = {
  name: 'Alex Rivera',
  bio: 'Movie Buff & Anime Enthusiast',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | undefined>(undefined);
  
  // State untuk melacak urutan halaman yang dibuka
  const [history, setHistory] = useState<ViewState[]>(['home']);

  // Reactive Dexie queries
  const watchlist = useLiveQuery(() => db.watchlist.toArray()) || [];
  const user = useLiveQuery(() => db.user.toCollection().last()) || DEFAULT_USER;

  // Initialize DB
  useEffect(() => {
    const seed = async () => {
      const count = await db.user.count();
      if (count === 0) {
        await db.user.add(DEFAULT_USER);
      }
    };
    seed();
  }, []);

  /**
   * Navigasi ke halaman baru
   * @param replace Jika true, tidak akan menambah tumpukan riwayat (misal setelah save)
   */
  const navigate = useCallback((newView: ViewState, id: string | null = null, filter?: string, replace: boolean = false) => {
    setView(newView);
    setSelectedId(id);
    setActiveFilter(filter);
    
    if (!replace) {
      setHistory(prev => [...prev, newView]);
    }
    
    window.scrollTo(0, 0);
  }, []);

  /**
   * Fungsi untuk kembali ke halaman sebelumnya
   */
  const goBack = useCallback(() => {
    if (history.length <= 1) {
      // Jika di home, tidak bisa back lagi
      return;
    }

    const newHistory = [...history];
    newHistory.pop(); // Hapus view saat ini dari stack
    const previousView = newHistory[newHistory.length - 1];

    setHistory(newHistory);
    setView(previousView);
    
    // Reset ID jika kembali ke halaman utama/list
    if (['home', 'search', 'profile', 'watched-list'].includes(previousView)) {
      setSelectedId(null);
    }
    
    window.scrollTo(0, 0);
  }, [history]);

  // Handle tombol Back Fisik (Android/Browser Back)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (history.length > 1) {
        goBack();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [goBack, history]);

  // Database Actions
  const addItem = async (item: MediaItem) => {
    await db.watchlist.add(item);
    navigate('home', null, undefined, true); // Replace agar tidak kembali ke form add
    setHistory(['home']); // Reset history setelah aksi besar
  };

  const updateItem = async (updatedItem: MediaItem) => {
    await db.watchlist.put(updatedItem);
    // Tetap di detail setelah update atau kembali sesuai logika DetailView
  };

  const deleteItem = async (id: string) => {
    await db.watchlist.delete(id);
    navigate('home', null, undefined, true);
    setHistory(['home']);
  };

  const updateUserProfile = async (updatedUser: UserProfile) => {
    await db.user.clear();
    await db.user.add(updatedUser);
    navigate('profile', null, undefined, true);
  };

  const currentItem = selectedId 
    ? watchlist.find(i => i.id === selectedId) 
    : null;

  const isFormView = view === 'add' || view === 'edit-profile';

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-[#0a140d] relative shadow-2xl overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {view === 'home' && (
          <HomeView 
            user={user}
            watchlist={watchlist} 
            onSelect={(id) => navigate('detail', id)} 
            onAdd={() => navigate('add')}
            onViewAll={(filter) => navigate('watched-list', null, filter)}
          />
        )}
        
        {view === 'detail' && currentItem && (
          <DetailView 
            item={currentItem} 
            onBack={goBack}
            onEdit={() => navigate('add', selectedId)}
            onUpdate={updateItem}
          />
        )}

        {view === 'add' && (
          <AddEntryView 
            onCancel={goBack} 
            onSave={addItem}
            onUpdate={updateItem}
            onDelete={deleteItem}
            initialData={currentItem || null}
          />
        )}

        {view === 'search' && (
          <SearchView 
            watchlist={watchlist}
            onSelect={(id) => navigate('detail', id)}
          />
        )}

        {view === 'profile' && (
          <ProfileView 
            user={user}
            watchlist={watchlist}
            onEditProfile={() => navigate('edit-profile')}
          />
        )}

        {view === 'edit-profile' && (
          <EditProfileView 
            user={user}
            onCancel={goBack}
            onSave={updateUserProfile}
          />
        )}

        {view === 'watched-list' && (
          <WatchedListView 
            watchlist={watchlist}
            onSelect={(id) => navigate('detail', id)}
            initialFilter={activeFilter}
          />
        )}
      </div>

      {!isFormView && (
        <BottomNav 
          activeView={view} 
          onNavigate={(v) => navigate(v, null, undefined, v === view)} 
        />
      )}
    </div>
  );
};

export default App;