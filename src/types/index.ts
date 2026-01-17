export type FieldType = 'text' | 'date' | 'signature' | 'checkbox';

export interface FieldMetadata {
  id: string;
  type: FieldType;
  label: string;
  position: { x: number; y: number };
  required?: boolean;
}

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  fields: FieldMetadata[];
  createdAt: string;
  updatedAt: string;
}

export type ContractStatus = 'created' | 'approved' | 'sent' | 'signed' | 'locked' | 'revoked';

export type StatusCategory = 'active' | 'pending' | 'signed';

export interface FieldValue {
  fieldId: string;
  value: string | boolean;
}

export interface Contract {
  id: string;
  name: string;
  blueprintId: string;
  blueprintName: string;
  status: ContractStatus;
  fields: FieldMetadata[];
  fieldValues: FieldValue[];
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusTransition[];
}

export interface StatusTransition {
  from: ContractStatus | null;
  to: ContractStatus;
  timestamp: string;
}

// Lifecycle: Created → Approved → Sent → Signed → Locked (Revoked is a terminal state from any pre-signed status)
export const validTransitions: Record<ContractStatus, ContractStatus[]> = {
  created: ['approved', 'revoked'],
  approved: ['sent', 'revoked'],
  sent: ['signed', 'revoked'],
  signed: ['locked'],
  locked: [],
  revoked: [],
};

export const statusToCategory: Record<ContractStatus, StatusCategory> = {
  created: 'active',
  approved: 'active',
  sent: 'pending',
  signed: 'signed',
  locked: 'signed',
  revoked: 'active',
};

export const statusDisplayInfo: Record<ContractStatus, { label: string; color: string; bgColor: string }> = {
  created: { label: 'Created', color: '#3b82f6', bgColor: '#dbeafe' },
  approved: { label: 'Approved', color: '#10b981', bgColor: '#d1fae5' },
  sent: { label: 'Sent', color: '#f59e0b', bgColor: '#fef3c7' },
  signed: { label: 'Signed', color: '#8b5cf6', bgColor: '#ede9fe' },
  locked: { label: 'Locked', color: '#6b7280', bgColor: '#f3f4f6' },
  revoked: { label: 'Revoked', color: '#ef4444', bgColor: '#fee2e2' },
};
