import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Blueprint, FieldMetadata } from '../types';

interface BlueprintStore {
  blueprints: Blueprint[];
  addBlueprint: (name: string, description: string, fields: Omit<FieldMetadata, 'id'>[]) => Blueprint;
  updateBlueprint: (id: string, updates: Partial<Omit<Blueprint, 'id' | 'createdAt'>>) => void;
  deleteBlueprint: (id: string) => void;
  getBlueprintById: (id: string) => Blueprint | undefined;
}

export const useBlueprintStore = create<BlueprintStore>()(
  persist(
    (set, get) => ({
      blueprints: [],

      addBlueprint: (name, description, fields) => {
        const newBlueprint: Blueprint = {
          id: uuidv4(),
          name,
          description,
          fields: fields.map(field => ({ ...field, id: uuidv4() })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set(state => ({ blueprints: [...state.blueprints, newBlueprint] }));
        return newBlueprint;
      },

      updateBlueprint: (id, updates) => {
        set(state => ({
          blueprints: state.blueprints.map(bp =>
            bp.id === id ? { ...bp, ...updates, updatedAt: new Date().toISOString() } : bp
          ),
        }));
      },

      deleteBlueprint: (id) => {
        set(state => ({ blueprints: state.blueprints.filter(bp => bp.id !== id) }));
      },

      getBlueprintById: (id) => get().blueprints.find(bp => bp.id === id),
    }),
    { name: 'blueprint-storage' }
  )
);
