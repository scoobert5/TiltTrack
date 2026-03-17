import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { FieldConfig } from '../types';
import { Settings, Plus, ToggleLeft, ToggleRight, Edit2, X, Check, GripVertical, ChevronRight, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { defaultPreGameFields, defaultPostGameFields } from '../config/defaultFields';

export default function SettingsScreen() {
  const { activeProfileId, profiles, updateProfileSettings } = useStore();
  
  const profile = profiles.find(p => p.id === activeProfileId);
  const [fields, setFields] = useState<FieldConfig[]>(profile?.settings.fields || []);
  
  const [activeView, setActiveView] = useState<'hub' | 'slider-editor'>('hub');
  const [sliderTab, setSliderTab] = useState<'pre-game' | 'post-game'>('pre-game');

  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const [editingMaxStr, setEditingMaxStr] = useState<string>('');
  const newFieldRef = useRef<HTMLDivElement>(null);

  const [draggedField, setDraggedField] = useState<{ id: string, category: string } | null>(null);
  const [dragOverField, setDragOverField] = useState<{ id: string, category: string } | null>(null);

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
      max: 5,
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
    setEditingMaxStr('5');
  };

  const handleDragStart = (e: React.DragEvent, field: FieldConfig) => {
    setDraggedField({ id: field.id, category: field.category });
    e.dataTransfer.effectAllowed = 'move';
    // Use a small timeout to allow the drag image to be captured before adding opacity
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.classList.add('opacity-50');
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedField(null);
    setDragOverField(null);
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove('opacity-50');
    }
  };

  const handleDragOver = (e: React.DragEvent, field: FieldConfig) => {
    e.preventDefault();
    if (!draggedField || draggedField.category !== field.category || draggedField.id === field.id) {
      return;
    }
    setDragOverField({ id: field.id, category: field.category });
  };

  const handleDrop = (e: React.DragEvent, targetField: FieldConfig) => {
    e.preventDefault();
    if (!draggedField || draggedField.category !== targetField.category || draggedField.id === targetField.id) {
      setDragOverField(null);
      return;
    }

    const categoryFields = fields.filter(f => f.category === targetField.category);
    const otherFields = fields.filter(f => f.category !== targetField.category);

    const draggedIndex = categoryFields.findIndex(f => f.id === draggedField.id);
    const targetIndex = categoryFields.findIndex(f => f.id === targetField.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newCategoryFields = [...categoryFields];
    const [removed] = newCategoryFields.splice(draggedIndex, 1);
    newCategoryFields.splice(targetIndex, 0, removed);

    const newFields = [...otherFields, ...newCategoryFields];
    setFields(newFields);
    updateProfileSettings(profile.id, { fields: newFields });
    
    setDraggedField(null);
    setDragOverField(null);
  };

  const handleResetLayout = () => {
    const defaultOrder = sliderTab === 'pre-game' ? defaultPreGameFields : defaultPostGameFields;
    const currentCategoryFields = fields.filter(f => f.category === sliderTab);
    const otherCategoryFields = fields.filter(f => f.category !== sliderTab);
    
    const sortedFields = [...currentCategoryFields].sort((a, b) => {
      const indexA = defaultOrder.findIndex(df => df.id === a.id);
      const indexB = defaultOrder.findIndex(df => df.id === b.id);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });
    
    const newFields = [...otherCategoryFields, ...sortedFields];
    setFields(newFields);
    updateProfileSettings(profile.id, { fields: newFields });
  };

  const handleResetAll = () => {
    const defaultOrder = sliderTab === 'pre-game' ? defaultPreGameFields : defaultPostGameFields;
    const otherCategoryFields = fields.filter(f => f.category !== sliderTab);
    
    const newFields = [...otherCategoryFields, ...defaultOrder];
    setFields(newFields);
    updateProfileSettings(profile.id, { fields: newFields });
  };

  const handleMaxChange = (id: string, category: 'pre-game' | 'post-game', value: string) => {
    setEditingMaxStr(value);
    if (value === '') return; // allow clearing
    const max = parseInt(value, 10);
    if (!isNaN(max) && max >= 5) {
      updateField(id, category, { max });
    }
  };

  const renderFieldEditor = (field: FieldConfig) => {
    const fieldKey = `${field.category}-${field.id}`;
    const isEditing = editingFieldKey === fieldKey;
    const isDragOver = dragOverField?.id === field.id && dragOverField?.category === field.category;

    if (!isEditing) {
      return (
        <div 
          draggable
          onDragStart={(e) => handleDragStart(e, field)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, field)}
          onDrop={(e) => handleDrop(e, field)}
          className={clsx(
            "flex items-center justify-between bg-zinc-900 border p-4 rounded-xl transition-all cursor-grab active:cursor-grabbing",
            isDragOver ? "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-[1.02]" : "border-zinc-800"
          )}
        >
          <div className="flex items-center space-x-3">
            <GripVertical className="text-zinc-600" size={18} />
            <div>
              <h3 className="font-medium text-zinc-200 flex items-center space-x-2">
                <span>{field.label}</span>
                <button 
                  onClick={() => {
                    setEditingFieldKey(fieldKey);
                    setEditingMaxStr(field.max?.toString() || '5');
                  }} 
                  className="text-zinc-500 hover:text-indigo-400"
                >
                  <Edit2 size={14} />
                </button>
              </h3>
              <p className="text-xs text-zinc-500 capitalize">{field.type} • {field.affectsCoreLogic ? 'Core' : 'Custom'}</p>
            </div>
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

    const isMaxInvalid = field.type === 'slider' && (editingMaxStr === '' || isNaN(parseInt(editingMaxStr, 10)) || parseInt(editingMaxStr, 10) < 5);

    return (
      <div ref={newFieldRef} className="bg-zinc-900 border border-indigo-500/50 p-4 rounded-xl space-y-3">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold text-indigo-400">Edit Field</h4>
          <button 
            onClick={() => {
              if (isMaxInvalid) return;
              setEditingFieldKey(null);
            }} 
            className={clsx(
              "p-1.5 rounded-md transition-colors",
              isMaxInvalid ? "text-rose-500 bg-rose-500/10 cursor-not-allowed" : "text-zinc-500 hover:text-zinc-300 bg-zinc-800"
            )}
          >
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
              <label className="text-xs text-zinc-500 mb-1 block">Max (Min 5)</label>
              <input 
                type="number" 
                value={editingMaxStr} 
                onChange={(e) => handleMaxChange(field.id, field.category, e.target.value)}
                className={clsx(
                  "w-full bg-zinc-950 border rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none transition-colors",
                  isMaxInvalid ? "border-rose-500 focus:border-rose-500" : "border-zinc-800 focus:border-indigo-500"
                )}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  if (activeView === 'slider-editor') {
    return (
      <div className="flex flex-col h-full bg-zinc-950 p-6 pb-24 overflow-y-auto">
        <header className="mb-8 flex items-center space-x-3">
          <button onClick={() => setActiveView('hub')} className="text-zinc-400 hover:text-zinc-200">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-zinc-100">Slider Editor</h1>
        </header>

        <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800 mb-6">
          <button
            onClick={() => setSliderTab('pre-game')}
            className={clsx(
              'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
              sliderTab === 'pre-game' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            Pre-Game
          </button>
          <button
            onClick={() => setSliderTab('post-game')}
            className={clsx(
              'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
              sliderTab === 'post-game' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            Post-Game
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => addField(sliderTab)}
              className="text-xs font-medium px-3 py-1.5 rounded-full flex items-center space-x-1 text-zinc-100 bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <Plus size={14} />
              <span>Add Field</span>
            </button>
          </div>
          {fields.filter(f => f.category === sliderTab).map(field => (
            <React.Fragment key={`${field.category}-${field.id}`}>
              {renderFieldEditor(field)}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800 space-y-3">
          <button
            onClick={handleResetLayout}
            className="w-full py-3 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
          >
            Reset Layout
          </button>
          <button
            onClick={handleResetAll}
            className="w-full py-3 rounded-xl text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
          >
            Reset All Fields
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 pb-24 overflow-y-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
        </div>
      </header>

      <div className="space-y-4">
        <button className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:bg-zinc-800/50 transition-colors opacity-50 pointer-events-none">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Settings size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-zinc-100">General Settings</h3>
              <p className="text-xs text-zinc-500">Coming soon</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-zinc-600" />
        </button>

        <button 
          onClick={() => setActiveView('slider-editor')}
          className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Edit2 size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-zinc-100">Slider Editor</h3>
              <p className="text-xs text-zinc-500">Manage pre and post-game fields</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-zinc-600" />
        </button>

        <button className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:bg-zinc-800/50 transition-colors opacity-50 pointer-events-none">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Settings size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-zinc-100">Appearance</h3>
              <p className="text-xs text-zinc-500">Coming soon</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-zinc-600" />
        </button>

        <button className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:bg-zinc-800/50 transition-colors opacity-50 pointer-events-none">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Settings size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-zinc-100">AI Settings</h3>
              <p className="text-xs text-zinc-500">Coming soon</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-zinc-600" />
        </button>
      </div>
    </div>
  );
}
