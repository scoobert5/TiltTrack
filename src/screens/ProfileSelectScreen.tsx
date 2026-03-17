import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Profile } from '../types';
import { Gamepad2, Plus, Trash2, RotateCcw, Edit2, X } from 'lucide-react';

export default function ProfileSelectScreen() {
  const { profiles, createProfile, setActiveProfile, deleteProfile, resetProfileLogs, renameProfile } = useStore();
  const [newProfileName, setNewProfileName] = useState('');
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [modalState, setModalState] = useState<{ type: 'delete' | 'reset' | null; profileId: string | null; profileName: string }>({ type: null, profileId: null, profileName: '' });
  const navigate = useNavigate();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfileName.trim()) {
      createProfile(newProfileName.trim());
      setNewProfileName('');
    }
  };

  const handleSelect = (id: string) => {
    setActiveProfile(id);
    navigate('/dashboard');
  };

  const startEdit = (e: React.MouseEvent, profile: Profile) => {
    e.stopPropagation();
    setEditingProfileId(profile.id);
    setEditName(profile.name);
  };

  const saveEdit = (e: React.FormEvent | React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editingProfileId && editName.trim()) {
      renameProfile(editingProfileId, editName.trim());
      setEditingProfileId(null);
    }
  };

  const confirmAction = () => {
    if (modalState.type === 'delete' && modalState.profileId) {
      deleteProfile(modalState.profileId);
    } else if (modalState.type === 'reset' && modalState.profileId) {
      resetProfileLogs(modalState.profileId);
    }
    setModalState({ type: null, profileId: null, profileName: '' });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 relative">
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
                <div className="flex-1">
                  {editingProfileId === profile.id ? (
                    <form onSubmit={saveEdit} className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />
                      <button type="submit" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">Save</button>
                      <button type="button" onClick={() => setEditingProfileId(null)} className="text-zinc-500 hover:text-zinc-300 text-sm">Cancel</button>
                    </form>
                  ) : (
                    <>
                      <h3 className="font-medium text-zinc-100">{profile.name}</h3>
                      <p className="text-xs text-zinc-500">
                        Created {new Date(profile.createdAt).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => startEdit(e, profile)}
                  className="p-2 text-zinc-500 hover:text-indigo-400 transition-colors"
                  title="Rename Profile"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalState({ type: 'reset', profileId: profile.id, profileName: profile.name });
                  }}
                  className="p-2 text-zinc-500 hover:text-amber-400 transition-colors"
                  title="Reset Logs"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalState({ type: 'delete', profileId: profile.id, profileName: profile.name });
                  }}
                  className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Delete Profile"
                >
                  <Trash2 size={18} />
                </button>
              </div>
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

      {/* Confirmation Modal */}
      {modalState.type && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-zinc-100">
                {modalState.type === 'delete' ? 'Delete Profile' : 'Reset Profile'}
              </h2>
              <button onClick={() => setModalState({ type: null, profileId: null, profileName: '' })} className="text-zinc-500 hover:text-zinc-300">
                <X size={20} />
              </button>
            </div>
            <p className="text-zinc-400 mb-6">
              {modalState.type === 'delete' 
                ? `Are you sure you want to delete "${modalState.profileName}" and all its data?`
                : `Are you sure you want to reset "${modalState.profileName}"? This will clear all logs.`}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setModalState({ type: null, profileId: null, profileName: '' })}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 py-2.5 rounded-xl font-medium transition-colors text-white ${
                  modalState.type === 'delete' ? 'bg-red-600 hover:bg-red-500' : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                {modalState.type === 'delete' ? 'Delete' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
