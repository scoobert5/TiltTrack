import { FieldConfig } from '../types';

export const defaultPreGameFields: FieldConfig[] = [
  { id: 'energy', label: 'Energy', type: 'slider', max: 10, step: 1, defaultValue: 1, required: true, enabled: true, category: 'pre-game', affectsCoreLogic: true },
  { id: 'mood', label: 'Mood', type: 'slider', max: 10, step: 1, defaultValue: 1, required: true, enabled: true, category: 'pre-game', affectsCoreLogic: true },
  { id: 'focus', label: 'Focus', type: 'slider', max: 10, step: 1, defaultValue: 1, required: true, enabled: true, category: 'pre-game', affectsCoreLogic: true },
  { id: 'confidence', label: 'Confidence', type: 'slider', max: 10, step: 1, defaultValue: 1, required: true, enabled: true, category: 'pre-game', affectsCoreLogic: true },
  { id: 'partySize', label: 'Party Size', type: 'segmented', max: 5, step: 1, defaultValue: 'Solo', required: true, enabled: true, category: 'pre-game', affectsCoreLogic: true, options: ['Solo', 'Duo', 'Trio', 'Quad', '5 Stack'] },
];

export const defaultPostGameFields: FieldConfig[] = [
  { id: 'outcome', label: 'Outcome', type: 'segmented', defaultValue: 'Win', required: true, enabled: true, category: 'post-game', affectsCoreLogic: true, options: ['Win', 'Loss', 'Draw'] },
  { id: 'energy', label: 'Energy', type: 'slider', max: 10, step: 1, defaultValue: 1, required: true, enabled: true, category: 'post-game', affectsCoreLogic: true },
  { id: 'mood', label: 'Mood', type: 'slider', max: 10, step: 1, defaultValue: 1, required: true, enabled: true, category: 'post-game', affectsCoreLogic: true },
  { id: 'frustration', label: 'Frustration', type: 'slider', max: 10, step: 1, defaultValue: 1, required: true, enabled: true, category: 'post-game', affectsCoreLogic: true },
  { id: 'note', label: 'Note', type: 'text', defaultValue: '', required: false, enabled: true, category: 'post-game', affectsCoreLogic: false },
];

export const defaultFields = [...defaultPreGameFields, ...defaultPostGameFields];
