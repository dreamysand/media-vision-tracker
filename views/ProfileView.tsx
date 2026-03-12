import React, { useRef, useEffect, useState } from 'react';
import { MediaItem, UserProfile } from '../types';
import { db } from '../db'; 
import { exportDB, importDB } from "dexie-export-import";

interface ProfileViewProps {
  user: UserProfile;
  watchlist: MediaItem[];
  onEditProfile: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, watchlist, onEditProfile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDark, setIsDark] = useState(false);

  // --- LOGIKA DARK MODE ---
  useEffect(() => {
    // 1. Cek localStorage
    const savedTheme = localStorage.getItem('theme');
    // 2. Cek preferensi sistem perangkat
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }

    // Listener jika user mengubah tema perangkat saat aplikasi terbuka
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) { // Hanya berubah otomatis jika user belum set manual
        if (e.matches) {
          document.documentElement.classList.add('dark');
          setIsDark(true);
        } else {
          document.documentElement.classList.remove('dark');
          setIsDark(false);
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  // --- LOGIKA STATISTIK ---
  const stats = {
    total: watchlist.length,
    completed: watchlist.filter(i => i.status === 'Completed').length,
    avgRating: watchlist.length > 0 
      ? (watchlist.reduce((acc, i) => acc + (Number(i.rating) || 0), 0) / watchlist.length).toFixed(1) 
      : '0.0',
  };

  // --- LOGIKA DATA MANAGEMENT ---
  const handleExport = async () => {
    try {
      const blob = await exportDB(db);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-watchlist-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Gagal mengekspor data.");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmImport = confirm("Perhatian: Seluruh data saat ini akan dihapus dan diganti dengan data dari file. Lanjutkan?");
    if (!confirmImport) {
        if (e.target) e.target.value = '';
        return;
    }

    try {
      await importDB(file, { 
        clearExistingData: true,    
        overwriteValues: true,      
        acceptChangedSchema: true,  
        acceptMissingTables: true,  
      });

      alert("Data berhasil diimport! Halaman akan dimuat ulang.");
      window.location.reload();
    } catch (error: any) {
      console.error("Import failed:", error);
      alert(`Gagal mengimport data: ${error.message || "Format file tidak dikenali"}`);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-[#0a140d] pb-32 overflow-y-auto transition-colors duration-300">
      
      {/* Profile Header */}
      <div className="p-8 flex flex-col items-center text-center">
        <div className="size-24 rounded-full bg-primary/20 border-4 border-primary/30 p-1 mb-4">
          <img 
            src={user.avatar} 
            className="w-full h-full object-cover rounded-full"
            alt={user.name}
          />
        </div>
        <h2 className="text-2xl font-bold dark:text-white transition-colors">{user.name}</h2>
        <p className="text-[#64876f] font-medium mb-6">{user.bio}</p>
        
        <button 
          onClick={onEditProfile}
          className="px-8 py-2.5 bg-primary text-[#0a140d] font-bold rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          Edit Profile
        </button>
      </div>

      {/* Stats Cards */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-white/5 p-4 rounded-2xl text-center border border-primary/10 transition-colors">
            <p className="text-[10px] font-bold text-[#64876f] uppercase tracking-wider">Total</p>
            <p className="text-xl font-black dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-white/5 p-4 rounded-2xl text-center border border-primary/10 transition-colors">
            <p className="text-[10px] font-bold text-[#64876f] uppercase tracking-wider">Selesai</p>
            <p className="text-xl font-black dark:text-white">{stats.completed}</p>
          </div>
          <div className="bg-white dark:bg-white/5 p-4 rounded-2xl text-center border border-primary/10 transition-colors">
            <p className="text-[10px] font-bold text-[#64876f] uppercase tracking-wider">Rating</p>
            <div className="flex items-center justify-center gap-1">
              <p className="text-xl font-black dark:text-white">{stats.avgRating}</p>
              <span className="material-symbols-outlined text-[14px] text-yellow-500 fill-current">star</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menus */}
      <div className="px-6 space-y-2">
        <h3 className="px-2 text-[11px] font-bold text-[#64876f] uppercase tracking-[0.1em] mb-2">Data Management</h3>
        
        <button 
          onClick={handleExport}
          className="w-full flex items-center gap-3 p-4 bg-white dark:bg-white/5 rounded-2xl active:scale-[0.98] transition-all border border-transparent dark:border-white/5"
        >
          <span className="material-symbols-outlined text-primary">download</span>
          <span className="font-bold dark:text-white">Backup Data (.json)</span>
        </button>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImport} 
          className="hidden" 
          accept=".json"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-3 p-4 bg-white dark:bg-white/5 rounded-2xl active:scale-[0.98] transition-all border border-transparent dark:border-white/5"
        >
          <span className="material-symbols-outlined text-primary">upload</span>
          <span className="font-bold dark:text-white">Import Data</span>
        </button>

        <h3 className="px-2 pt-6 text-[11px] font-bold text-[#64876f] uppercase tracking-[0.1em] mb-2">Preferences</h3>

        <button 
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl active:scale-[0.98] transition-all border border-transparent dark:border-white/5"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
            <span className="font-bold dark:text-white">Dark Mode</span>
          </div>
          
          {/* Switch Toggle */}
          <div className="w-12 h-6 bg-primary/20 rounded-full relative transition-colors">
            <div className={`absolute top-1 size-4 bg-primary rounded-full transition-all duration-300 ease-in-out ${isDark ? 'translate-x-7' : 'translate-x-1'}`}></div>
          </div>
        </button>
      </div>

    </div>
  );
};

export default ProfileView;