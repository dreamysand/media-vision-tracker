
import React from 'react';
import { ViewState } from '../types';

interface BottomNavProps {
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate }) => {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'search', icon: 'search', label: 'Search' },
    { id: 'watched-list', icon: 'list_alt', label: 'List' },
    { id: 'profile', icon: 'person', label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 bg-white/90 dark:bg-[#0a140d]/95 backdrop-blur-xl border-t border-[#f0f4f2] dark:border-white/10 px-6 pb-8 pt-3 z-50">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          let isActive = false;
          if (tab.id === 'home') isActive = activeView === 'home';
          if (tab.id === 'search') isActive = activeView === 'search';
          if (tab.id === 'watched-list') isActive = activeView === 'watched-list' || activeView === 'detail' || activeView === 'add';
          if (tab.id === 'profile') isActive = activeView === 'profile' || activeView === 'edit-profile';

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id as ViewState)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-[#5c7a67] dark:text-[#a3c0ae]'
              }`}
            >
              <span className={`material-symbols-outlined text-[28px] ${isActive ? 'filled-icon' : ''}`}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
