import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Gamepad2, Plus, Trash2, Edit2, RotateCcw, Check, X } from 'lucide-react';

export default function ProfileSelectScreen() {
  const { profiles, createProfile, setActiveProfile, deleteProfile, resetProfile, renameProfile } = useStore();
  const [newProfileName, setNewProfileName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const navigate = useNavigate();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfileName.trim()) {
      createProfile(newProfileName.trim());
      setNewProfileName('');
    }
  };

  const handleSelect = (id: string) => {
    if (editingId) return;
    setActiveProfile(id);
    navigate('/dashboard');
  };

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveRename = (id: string) => {
    if (editName.trim()) {
      renameProfile(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6">
      <div className="flex flex-col items-center justify-center mt-12 mb-10">
        <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4">
          <Gamepad2 size={32} className="text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">TiltTrack</h1>
        <p className="text-zinc-400 mt-2 text-center">Select a game profile to start tracking your mental state.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {profiles.length === 0 ? (
          <div className="text-center text-zinc-500 py-10 border border-dashed border-zinc-800 rounded-xl">
            No profiles found. Create one below.
          </div>
        ) : (
          profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-indigo-500/50 transition-colors cursor-pointer group"
              onClick={() => handleSelect(profile.id)}
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-lg font-semibold text-zinc-300">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {editingId === profile.id ? (
                  <div className="flex items-center space-x-2 flex-1 mr-2" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-indigo-500/50 rounded-lg px-2 py-1 text-zinc-100 focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRename(profile.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                    <button onClick={() => saveRename(profile.id)} className="p-1 text-emerald-400 hover:text-emerald-300">
                      <Check size={18} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1 text-zinc-500 hover:text-zinc-300">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-medium text-zinc-100">{profile.name}</h3>
                    <p className="text-xs text-zinc-500">
                      Created {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              
              {!editingId && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startRename(profile.id, profile.name);
                    }}
                    className="p-2 text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to reset this profile? This will clear all logs.`)) {
                        resetProfile(profile.id);
                      }
                    }}
                    className="p-2 text-zinc-500 hover:text-amber-400 transition-colors"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete this profile and all its data?`)) {
                        deleteProfile(profile.id);
                      }
                    }}
                    className="p-2 text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-zinc-900">
        <form onSubmit={handleCreate} className="flex space-x-2">
          <input
            type="text"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            placeholder="New game name (e.g., CS2)"
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button
            type="submit"
            disabled={!newProfileName.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl px-4 py-3 flex items-center justify-center transition-colors"
          >
            <Plus size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
