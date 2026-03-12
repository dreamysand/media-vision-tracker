import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface EditProfileViewProps {
  user: UserProfile;
  onCancel: () => void;
  onSave: (user: UserProfile) => void;
}

const EditProfileView: React.FC<EditProfileViewProps> = ({ user, onCancel, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(user);

  // Sync Dark Mode Detection
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Name cannot be empty");
      return;
    }
    onSave(formData);
  };

  const changeAvatar = () => {
    const randomId = Math.floor(Math.random() * 1000);
    // Menggunakan API Pravatar untuk mendapatkan avatar acak
    setFormData({ ...formData, avatar: `https://i.pravatar.cc/300?u=${randomId}` });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a140d] overflow-y-auto no-scrollbar pb-32 transition-colors duration-300">
      
      {/* Header */}
      <header className="p-6 sticky top-0 bg-white/80 dark:bg-[#0a140d]/80 backdrop-blur-xl z-30 flex items-center gap-4 border-b border-[#f0f4f2] dark:border-white/5">
        <button 
          onClick={onCancel} 
          className="p-2 rounded-full hover:bg-[#f0f4f2] dark:hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined block dark:text-white">close</span>
        </button>
        <h1 className="text-xl font-black tracking-tight dark:text-white">Edit Profile</h1>
      </header>

      <main className="px-6 mt-8 space-y-10">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="size-36 rounded-full overflow-hidden border-4 border-primary/20 p-1 bg-white dark:bg-[#1b3123] shadow-2xl">
              <img 
                src={formData.avatar} 
                alt="Preview" 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>
            <button 
              onClick={changeAvatar}
              className="absolute bottom-1 right-1 size-11 bg-primary text-[#0a140d] rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform border-4 border-white dark:border-[#0a140d]"
            >
              <span className="material-symbols-outlined text-xl font-bold">cached</span>
            </button>
          </div>
          <p className="mt-4 text-[10px] font-black text-[#64876f] uppercase tracking-[0.2em]">
            Tap icon to randomize avatar
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Input Name */}
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase text-primary tracking-[0.15em] px-1">
              Display Name
            </label>
            <div className="relative">
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-16 bg-[#f8faf9] dark:bg-white/5 border border-[#e2ede6] dark:border-white/10 rounded-[24px] px-6 font-bold text-[#112117] dark:text-white focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-[#64876f]/40"
                placeholder="How should we call you?"
              />
              <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[#64876f]/30">
                person
              </span>
            </div>
          </div>

          {/* Input Bio */}
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase text-primary tracking-[0.15em] px-1">
              About You
            </label>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-[#f8faf9] dark:bg-white/5 border border-[#e2ede6] dark:border-white/10 rounded-[24px] px-6 py-5 font-medium text-[#112117] dark:text-gray-200 focus:ring-2 focus:ring-primary/40 outline-none transition-all resize-none leading-relaxed placeholder:text-[#64876f]/40"
              placeholder="Write a short bio..."
              rows={4}
            />
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <button 
              type="submit"
              className="w-full h-16 bg-primary text-[#0a140d] font-black text-lg uppercase tracking-wider rounded-[24px] shadow-2xl shadow-primary/30 active:scale-[0.97] transition-all hover:brightness-105"
            >
              Save Profile
            </button>
            <button 
              type="button"
              onClick={onCancel}
              className="w-full mt-4 h-16 bg-transparent text-[#64876f] font-bold text-sm uppercase tracking-widest rounded-[24px] active:scale-[0.97] transition-all"
            >
              Discard Changes
            </button>
          </div>
        </form>

      </main>
    </div>
  );
};

export default EditProfileView;