import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { FieldConfig } from '../types';
import { Plus, ToggleLeft, ToggleRight, Edit2, X, Save } from 'lucide-react';

export default function SettingsScreen() {
  const { activeProfileId, profiles, updateProfileSettings } = useStore();
  
  const profile = profiles.find(p => p.id === activeProfileId);
  const [fields, setFields] = useState<FieldConfig[]>(profile?.settings.fields || []);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<FieldConfig | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      setFields(profile.settings.fields);
    }
  }, [profile]);

  if (!profile) return null;

  const toggleField = (id: string) => {
    const updated = fields.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f);
    setFields(updated);
    updateProfileSettings(profile.id, { fields: updated });
  };

  const startEdit = (field: FieldConfig) => {
    setEditingFieldId(field.id);
    setEditDraft({ ...field });
  };

  const cancelEdit = () => {
    setEditingFieldId(null);
    setEditDraft(null);
  };

  const saveEdit = () => {
    if (!editDraft) return;
    
    // Enforce slider rules
    if (editDraft.type === 'slider') {
      editDraft.min = 1;
      if (editDraft.max === undefined || editDraft.max < 10) {
        editDraft.max = 10;
      }
    }

    const updated = fields.map(f => f.id === editDraft.id ? editDraft : f);
    setFields(updated);
    updateProfileSettings(profile.id, { fields: updated });
    setEditingFieldId(null);
    setEditDraft(null);
  };

  const addField = (category: 'pre-game' | 'post-game') => {
    const newField: FieldConfig = {
      id: `custom_${Date.now()}`,
      label: 'New Custom Field',
      type: 'slider',
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 1,
      required: false,
      enabled: true,
      category,
      affectsCoreLogic: false
    };
    
    const updated = [...fields, newField];
    setFields(updated);
    updateProfileSettings(profile.id, { fields: updated });
    startEdit(newField);
    
    setTimeout(() => {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const renderFieldCard = (field: FieldConfig) => {
    if (editingFieldId === field.id && editDraft) {
      return (
        <div key={field.id} className="bg-zinc-900 border border-indigo-500/50 p-4 rounded-xl space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-indigo-400">Edit Field</h4>
            <button onClick={cancelEdit} className="text-zinc-500 hover:text-zinc-300">
              <X size={18} />
            </button>
          </div>
          
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Label</label>
            <input 
              type="text" 
              value={editDraft.label} 
              onChange={(e) => setEditDraft({ ...editDraft, label: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          {editDraft.type === 'slider' && (
            <div className="flex space-x-3">
              <div className="flex-1 opacity-50">
                <label className="text-xs text-zinc-500 mb-1 block">Min (Locked)</label>
                <input 
                  type="number" 
                  value={1} 
                  disabled
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-500 cursor-not-allowed"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-zinc-500 mb-1 block">Max (≥ 10)</label>
                <input 
                  type="number" 
                  value={editDraft.max || 10} 
                  onChange={(e) => setEditDraft({ ...editDraft, max: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button 
              onClick={saveEdit}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={field.id} className={`flex items-center justify-between bg-zinc-900 border ${field.enabled ? 'border-zinc-800' : 'border-zinc-800/50 opacity-60'} p-4 rounded-xl transition-all`}>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-zinc-200">{field.label}</h3>
            {field.affectsCoreLogic && (
              <span className="text-[10px] uppercase tracking-wider font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">Core</span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-1 capitalize">
            {field.type} {field.type === 'slider' && `(1 - ${field.max || 10})`}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => startEdit(field)} 
            className="p-2 text-zinc-500 hover:text-indigo-400 transition-colors bg-zinc-950 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => toggleField(field.id)} 
            className="text-zinc-400 hover:text-indigo-400 transition-colors"
          >
            {field.enabled ? <ToggleRight size={32} className="text-indigo-500" /> : <ToggleLeft size={32} />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 pb-24 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-500">Configure your tracking fields</p>
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
            {fields.filter(f => f.category === 'pre-game').map(renderFieldCard)}
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
            {fields.filter(f => f.category === 'post-game').map(renderFieldCard)}
          </div>
        </section>
        
        <div ref={listEndRef} />
      </div>
    </div>
  );
}
