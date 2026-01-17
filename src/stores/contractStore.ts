import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Contract, ContractStatus, FieldValue, Blueprint, StatusCategory, StatusTransition } from '../types';
import { validTransitions, statusToCategory } from '../types';

interface ContractStore {
  contracts: Contract[];
  createContract: (name: string, blueprint: Blueprint) => Contract;
  updateFieldValues: (contractId: string, fieldValues: FieldValue[]) => void;
  transitionStatus: (contractId: string, newStatus: ContractStatus) => boolean;
  getContractById: (id: string) => Contract | undefined;
  getContractsByCategory: (category: StatusCategory) => Contract[];
  getContractsByStatus: (status: ContractStatus) => Contract[];
  canTransitionTo: (contractId: string, newStatus: ContractStatus) => boolean;
  deleteContract: (id: string) => void;
}

export const useContractStore = create<ContractStore>()(
  persist(
    (set, get) => ({
      contracts: [],

      createContract: (name, blueprint) => {
        const newContract: Contract = {
          id: uuidv4(),
          name,
          blueprintId: blueprint.id,
          blueprintName: blueprint.name,
          status: 'created',
          fields: JSON.parse(JSON.stringify(blueprint.fields)),
          fieldValues: blueprint.fields.map(field => ({
            fieldId: field.id,
            value: field.type === 'checkbox' ? false : '',
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          statusHistory: [{ from: null, to: 'created', timestamp: new Date().toISOString() }],
        };
        set(state => ({ contracts: [...state.contracts, newContract] }));
        return newContract;
      },

      updateFieldValues: (contractId, fieldValues) => {
        set(state => ({
          contracts: state.contracts.map(contract => {
            if (contract.id !== contractId) return contract;
            if (contract.status === 'locked' || contract.status === 'revoked') return contract;
            return { ...contract, fieldValues, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      transitionStatus: (contractId, newStatus) => {
        const contract = get().getContractById(contractId);
        if (!contract || !get().canTransitionTo(contractId, newStatus)) return false;

        const transition: StatusTransition = {
          from: contract.status,
          to: newStatus,
          timestamp: new Date().toISOString(),
        };

        set(state => ({
          contracts: state.contracts.map(c =>
            c.id === contractId
              ? { ...c, status: newStatus, updatedAt: new Date().toISOString(), statusHistory: [...c.statusHistory, transition] }
              : c
          ),
        }));
        return true;
      },

      getContractById: (id) => get().contracts.find(c => c.id === id),

      getContractsByCategory: (category) => 
        get().contracts.filter(c => statusToCategory[c.status] === category),

      getContractsByStatus: (status) => 
        get().contracts.filter(c => c.status === status),

      canTransitionTo: (contractId, newStatus) => {
        const contract = get().getContractById(contractId);
        return contract ? validTransitions[contract.status].includes(newStatus) : false;
      },

      deleteContract: (id) => {
        set(state => ({ contracts: state.contracts.filter(c => c.id !== id) }));
      },
    }),
    { name: 'contract-storage' }
  )
);
