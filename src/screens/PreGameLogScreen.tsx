import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { FieldConfig } from '../types';
import clsx from 'clsx';

export default function PreGameLogScreen() {
  const navigate = useNavigate();
  const { activeProfileId, profiles, addPreGameLog, logs } = useStore();
  const [formData, setFormData] = useState<Record<string, any>>({});

  const profile = profiles.find((p) => p.id === activeProfileId);
  const preGameFields = profile?.settings.fields.filter((f) => f.category === 'pre-game' && f.enabled) || [];

  useEffect(() => {
    if (!profile) return;

    const initialData: Record<string, any> = {};
    preGameFields.forEach((field) => {
      // Sliders default to 1, others to their defaultValue
      initialData[field.id] = field.type === 'slider' ? 1 : field.defaultValue;
    });

    setFormData(initialData);
  }, [profile]);

  const profileLogs = logs.filter((l) => l.profileId === profile?.id);
  const lastLog = profileLogs[profileLogs.length - 1];
  
  const renderReference = () => {
    if (!lastLog) return null;
    const { energy, mood, focus, confidence } = lastLog.preGameData;
    if (energy === undefined && mood === undefined) return null;
    
    return (
      <div className="mb-6 p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-400 flex flex-wrap gap-x-4 gap-y-2">
        <span className="font-semibold text-zinc-300 w-full mb-1">Last Match Pre-Game:</span>
        {energy !== undefined && <span>Energy: {energy}</span>}
        {mood !== undefined && <span>Mood: {mood}</span>}
        {focus !== undefined && <span>Focus: {focus}</span>}
        {confidence !== undefined && <span>Confidence: {confidence}</span>}
      </div>
    );
  };

  const handleChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfileId) return;

    const logId = addPreGameLog(activeProfileId, formData);
    // After pre-game log, we usually wait for the game to finish.
    // In a real app, we might go to an "In Game" screen or back to dashboard.
    // For this flow, let's go to dashboard, and they can click "Log Post-Game" from there.
    // Actually, let's navigate to the post-game log screen directly for testing, or dashboard.
    navigate('/dashboard');
  };

  if (!profile) return null;

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 pb-24 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Pre-Game Log</h1>
        <p className="text-sm text-zinc-500">How are you feeling before queuing?</p>
      </header>

      {renderReference()}

      <form onSubmit={handleSubmit} className="space-y-6">
        {preGameFields.map((field) => (
          <FieldRenderer key={field.id} field={field} value={formData[field.id]} onChange={handleChange} />
        ))}

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl py-4 transition-colors mt-8"
        >
          Start Match
        </button>
      </form>
    </div>
  );
}

// Reusable Field Renderer Component
export const FieldRenderer: React.FC<{ field: FieldConfig; value: any; onChange: (id: string, val: any) => void }> = ({ field, value, onChange }) => {
  if (field.type === 'slider') {
    return (
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-zinc-300">{field.label}</label>
          <span className="text-lg font-bold text-indigo-400">{value}</span>
        </div>
        <input
          type="range"
          min={1}
          max={field.max || 10}
          step={field.step || 1}
          value={value || 1}
          onChange={(e) => onChange(field.id, Number(e.target.value))}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-zinc-600 font-medium">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    );
  }

  if (field.type === 'segmented') {
    return (
      <div className="flex flex-col space-y-3">
        <label className="text-sm font-medium text-zinc-300">{field.label}</label>
        <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
          {field.options?.map((opt, idx) => {
            // If options are strings, value might be index or string depending on setup.
            // Let's assume value is the index if min/max are numbers, or string if outcome.
            const isSelected = typeof value === 'number' ? value === idx : value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(field.id, typeof field.defaultValue === 'number' ? idx : opt)}
                className={clsx(
                  'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
                  isSelected ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === 'text') {
    return (
      <div className="flex flex-col space-y-3">
        <label className="text-sm font-medium text-zinc-300">{field.label}</label>
        <textarea
          value={value || ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[100px]"
          placeholder="Add any notes here..."
        />
      </div>
    );
  }

  return null;
};
