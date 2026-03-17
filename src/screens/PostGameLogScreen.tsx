import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { FieldRenderer } from './PreGameLogScreen';

export default function PostGameLogScreen() {
  const navigate = useNavigate();
  const { logId } = useParams();
  const { activeProfileId, profiles, addPostGameLog, logs, postGameDraft, setPostGameDraft } = useStore();
  const [formData, setFormData] = useState<Record<string, any>>({});

  const profile = profiles.find((p) => p.id === activeProfileId);
  const postGameFields = profile?.settings.fields.filter((f) => f.category === 'post-game' && f.enabled) || [];

  useEffect(() => {
    if (!profile) return;
    
    const initialData: Record<string, any> = {};
    postGameFields.forEach((field) => {
      initialData[field.id] = field.type === 'slider' ? 1 : field.defaultValue;
    });

    if (postGameDraft) {
      setFormData({ ...initialData, ...postGameDraft });
      return;
    }
    
    setFormData(initialData);
  }, [profile]); // Intentionally omitting postGameDraft from dependencies to only run on mount/profile change

  const handleChange = (id: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [id]: value };
      setPostGameDraft(next);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logId) return;

    addPostGameLog(logId, formData);
    setPostGameDraft(null);
    navigate('/dashboard');
  };

  if (!profile) return null;

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 pb-24 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Post-Game Log</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {postGameFields.map((field) => (
          <FieldRenderer key={field.id} field={field} value={formData[field.id]} onChange={handleChange} />
        ))}

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl py-4 transition-colors mt-8"
        >
          Save Log
        </button>
      </form>
    </div>
  );
}
