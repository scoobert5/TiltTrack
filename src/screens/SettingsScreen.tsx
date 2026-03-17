import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { FieldConfig } from '../types';
import { Settings, Plus, ToggleLeft, ToggleRight, Edit2, X, Check } from 'lucide-react';

export default function SettingsScreen() {
  const { activeProfileId, profiles, updateProfileSettings } = useStore();
  
  const profile = profiles.find(p => p.id === activeProfileId);
  const [fields, setFields] = useState<FieldConfig[]>(profile?.settings.fields || []);
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const newFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingFieldKey && newFieldRef.current) {
      newFieldRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [editingFieldKey]);

  if (!profile) return null;

  const toggleField = (id: string, category: 'pre-game' | 'post-game') => {
    const newFields = fields.map(f => (f.id === id && f.category === category) ? { ...f, enabled: !f.enabled } : f);
    setFields(newFields);
    updateProfileSettings(profile.id, { fields: newFields });
  };

  const updateField = (id: string, category: 'pre-game' | 'post-game', updates: Partial<FieldConfig>) => {
    const newFields = fields.map(f => (f.id === id && f.category === category) ? { ...f, ...updates } : f);
    setFields(newFields);
    updateProfileSettings(profile.id, { fields: newFields });
  };

  const addField = (category: 'pre-game' | 'post-game') => {
    const newField: FieldConfig = {
      id: `custom_${Date.now()}`,
      label: 'New Custom Field',
      type: 'slider',
      max: 10,
      step: 1,
      defaultValue: 1,
      required: false,
      enabled: true,
      category,
      affectsCoreLogic: false
    };
    const newFields = [...fields, newField];
    setFields(newFields);
    updateProfileSettings(profile.id, { fields: newFields });
    setEditingFieldKey(`${newField.category}-${newField.id}`);
  };

  const handleMaxChange = (id: string, category: 'pre-game' | 'post-game', value: string) => {
    let max = parseInt(value, 10);
    if (isNaN(max)) max = 10;
    if (max < 10) max = 10;
    updateField(id, category, { max });
  };

  const renderFieldEditor = (field: FieldConfig) => {
    const fieldKey = `${field.category}-${field.id}`;
    const isEditing = editingFieldKey === fieldKey;

    if (!isEditing) {
      return (
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div>
            <h3 className="font-medium text-zinc-200 flex items-center space-x-2">
              <span>{field.label}</span>
              <button onClick={() => setEditingFieldKey(fieldKey)} className="text-zinc-500 hover:text-indigo-400">
                <Edit2 size={14} />
              </button>
            </h3>
            <p className="text-xs text-zinc-500 capitalize">{field.type} • {field.affectsCoreLogic ? 'Core' : 'Custom'}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${field.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
              {field.enabled ? 'Enabled' : 'Disabled'}
            </span>
            <button onClick={() => toggleField(field.id, field.category)} className="text-zinc-400 hover:text-indigo-400 transition-colors">
              {field.enabled ? <ToggleRight size={28} className="text-indigo-500" /> : <ToggleLeft size={28} />}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div ref={newFieldRef} className="bg-zinc-900 border border-indigo-500/50 p-4 rounded-xl space-y-3">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold text-indigo-400">Edit Field</h4>
          <button onClick={() => setEditingFieldKey(null)} className="text-zinc-500 hover:text-zinc-300 bg-zinc-800 p-1.5 rounded-md">
            <Check size={16} />
          </button>
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Label</label>
          <input 
            type="text" 
            value={field.label} 
            onChange={(e) => updateField(field.id, field.category, { label: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
        {field.type === 'slider' && (
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="text-xs text-zinc-500 mb-1 block">Max (Min 10)</label>
              <input 
                type="number" 
                value={field.max || 10} 
                onChange={(e) => updateField(field.id, field.category, { max: parseInt(e.target.value, 10) || 10 })}
                onBlur={(e) => handleMaxChange(field.id, field.category, e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 pb-24 overflow-y-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
          <p className="text-sm text-zinc-500">Configure your tracking fields</p>
        </div>
      </header>

      <div className="space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>Pre-Game Fields</span>
            </h2>
            <button 
              onClick={() => addField('pre-game')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-full flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>Add Field</span>
            </button>
          </div>
          <div className="space-y-3">
            {fields.filter(f => f.category === 'pre-game').map(field => (
              <React.Fragment key={`${field.category}-${field.id}`}>
                {renderFieldEditor(field)}
              </React.Fragment>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Post-Game Fields</span>
            </h2>
            <button 
              onClick={() => addField('post-game')}
              className="text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 px-3 py-1.5 rounded-full flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>Add Field</span>
            </button>
          </div>
          <div className="space-y-3">
            {fields.filter(f => f.category === 'post-game').map(field => (
              <React.Fragment key={`${field.category}-${field.id}`}>
                {renderFieldEditor(field)}
              </React.Fragment>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
