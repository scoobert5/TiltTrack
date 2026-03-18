import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export function AppHeader({ title }: { title: string }) {
  const navigate = useNavigate();
  const { activeProfileId, profiles, setActiveProfile } = useStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const profile = profiles.find(p => p.id === activeProfileId);

  if (!profile) return (
    <header className="flex items-center justify-between mb-8 relative z-50">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">{title}</h1>
      </div>
    </header>
  );

  return (
    <header className="flex items-center justify-between mb-8 relative z-50">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">{title}</h1>
      </div>
      <div className="relative">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 text-sm font-medium text-zinc-200 hover:text-white bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full transition-colors"
        >
          <span>{profile.name}</span>
          <ChevronDown size={16} className={clsx("transition-transform", isDropdownOpen && "rotate-180")} />
        </button>
        
        {isDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
              <div className="py-1 max-h-60 overflow-y-auto">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProfile(p.id);
                      setIsDropdownOpen(false);
                    }}
                    className={clsx(
                      "w-full text-left px-4 py-3 text-sm transition-colors",
                      p.id === activeProfileId ? "bg-indigo-500/10 text-indigo-400 font-medium" : "text-zinc-300 hover:bg-zinc-800"
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <div className="border-t border-zinc-800 py-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/profiles');
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  Manage Profiles
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
