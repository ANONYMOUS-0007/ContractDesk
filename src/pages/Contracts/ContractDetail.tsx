import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft, FileText, LayoutTemplate, ChevronRight,
  CheckCircle, XCircle, Send, Lock, PenLine, AlertTriangle, Save
} from 'lucide-react';
import { useContractStore } from '../../stores/contractStore';
import { StatusBadge } from '../../components/StatusBadge';
import { StatusTimeline } from '../../components/StatusTimeline';
import { ContractForm } from '../../components/ContractForm';
import { Modal } from '../../components/Modal';
import type { ContractStatus, FieldValue } from '../../types';
import { validTransitions, statusDisplayInfo } from '../../types';
import './ContractDetail.css';

const statusActions: Partial<Record<ContractStatus, { icon: typeof CheckCircle; label: string; className: string }>> = {
  approved: { icon: CheckCircle, label: 'Approve', className: 'btn-success' },
  sent: { icon: Send, label: 'Send', className: 'btn-primary' },
  signed: { icon: PenLine, label: 'Sign', className: 'btn-primary' },
  locked: { icon: Lock, label: 'Lock', className: 'btn-secondary' },
  revoked: { icon: XCircle, label: 'Revoke', className: 'btn-danger' },
};

const statusMessages: Record<string, string> = {
  approved: 'This will mark the contract as approved and ready to send.',
  sent: 'This will mark the contract as sent to the recipient.',
  signed: 'This will mark the contract as signed by all parties.',
  locked: 'This will lock the contract. Locked contracts cannot be edited.',
  revoked: 'This will revoke the contract. Revoked contracts cannot be edited or proceed further.',
};

export function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const getContractById = useContractStore(state => state.getContractById);
  const transitionStatus = useContractStore(state => state.transitionStatus);
  const updateFieldValues = useContractStore(state => state.updateFieldValues);

  const contract = getContractById(id!);

  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; status: ContractStatus | null }>({ isOpen: false, status: null });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localFieldValues, setLocalFieldValues] = useState<FieldValue[]>([]);

  if (!contract) {
    return (
      <div className="not-found">
        <FileText size={64} strokeWidth={1} />
        <h2>Contract not found</h2>
        <p>The contract you're looking for doesn't exist.</p>
        <Link to="/contracts" className="btn btn-primary">Back to Contracts</Link>
      </div>
    );
  }

  const isLocked = contract.status === 'locked' || contract.status === 'revoked';
  const availableTransitions = validTransitions[contract.status];

  const handleFieldValuesChange = (values: FieldValue[]) => {
    setLocalFieldValues(values);
    setHasUnsavedChanges(true);
  };

  const handleSaveValues = () => {
    updateFieldValues(contract.id, localFieldValues);
    setHasUnsavedChanges(false);
  };

  const confirmStatusTransition = () => {
    if (confirmModal.status && transitionStatus(contract.id, confirmModal.status)) {
      setConfirmModal({ isOpen: false, status: null });
    }
  };

  const closeModal = () => setConfirmModal({ isOpen: false, status: null });

  return (
    <div className="contract-detail-page">
      <div className="page-header">
        <div className="header-with-back">
          <button className="btn btn-icon btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{contract.name}</h1>
            <div className="page-meta">
              <Link to={`/blueprints/${contract.blueprintId}`} className="blueprint-link">
                <LayoutTemplate size={14} />
                {contract.blueprintName}
              </Link>
              <span className="meta-divider">•</span>
              <span>Created {format(new Date(contract.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
        <div className="header-status">
          <StatusBadge status={contract.status} />
        </div>
      </div>

      <div className="contract-content">
        <div className="contract-main">
          {availableTransitions.length > 0 && (
            <div className="status-actions-card">
              <h3 className="card-title">Available Actions</h3>
              <div className="status-actions">
                {availableTransitions.map((status) => {
                  const action = statusActions[status];
                  if (!action) return null;
                  const Icon = action.icon;
                  return (
                    <button key={status} className={`btn ${action.className}`} onClick={() => setConfirmModal({ isOpen: true, status })}>
                      <Icon size={18} />
                      {action.label}
                    </button>
                  );
                })}
              </div>

              <div className="lifecycle-indicator">
                <span className="lifecycle-label">Lifecycle:</span>
                <div className="lifecycle-steps">
                  {(['created', 'approved', 'sent', 'signed', 'locked'] as ContractStatus[]).map((status, index) => {
                    const info = statusDisplayInfo[status];
                    const isActive = contract.status === status;
                    const isPast = contract.statusHistory.some(h => h.to === status);
                    const isRevoked = contract.status === 'revoked';

                    return (
                      <div key={status} className="lifecycle-step-wrapper">
                        <div
                          className={`lifecycle-step ${isActive ? 'active' : ''} ${isPast ? 'completed' : ''} ${isRevoked ? 'disabled' : ''}`}
                          style={{ '--step-color': isPast || isActive ? info.color : undefined } as React.CSSProperties}
                        >
                          <span className="step-number">{index + 1}</span>
                          <span className="step-label">{info.label}</span>
                        </div>
                        {index < 4 && <ChevronRight size={16} className="step-arrow" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="form-card">
            <div className="form-card-header">
              <h3 className="card-title">Contract Fields</h3>
              {hasUnsavedChanges && !isLocked && (
                <button className="btn btn-primary btn-sm" onClick={handleSaveValues}>
                  <Save size={14} />
                  Save Changes
                </button>
              )}
            </div>
            <ContractForm
              fields={contract.fields}
              fieldValues={hasUnsavedChanges ? localFieldValues : contract.fieldValues}
              onFieldValuesChange={handleFieldValuesChange}
              isLocked={isLocked}
            />
          </div>
        </div>

        <div className="contract-sidebar">
          <div className="info-card">
            <h3 className="card-title">Contract Info</h3>
            <div className="info-rows">
              <div className="info-row">
                <span className="info-label">Status</span>
                <StatusBadge status={contract.status} />
              </div>
              <div className="info-row">
                <span className="info-label">Fields</span>
                <span className="info-value">{contract.fields.length}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Created</span>
                <span className="info-value">{format(new Date(contract.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Updated</span>
                <span className="info-value">{format(new Date(contract.updatedAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          <div className="history-card">
            <h3 className="card-title">Status History</h3>
            <StatusTimeline history={contract.statusHistory} />
          </div>
        </div>
      </div>

      <Modal
        isOpen={confirmModal.isOpen}
        onClose={closeModal}
        title={`Confirm ${confirmModal.status ? statusDisplayInfo[confirmModal.status].label : ''}`}
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button className={`btn ${confirmModal.status === 'revoked' ? 'btn-danger' : 'btn-primary'}`} onClick={confirmStatusTransition}>
              Confirm
            </button>
          </>
        }
      >
        <div className="confirm-content">
          {confirmModal.status === 'revoked' && (
            <div className="warning-icon"><AlertTriangle size={48} /></div>
          )}
          <p>{confirmModal.status && statusMessages[confirmModal.status]}</p>
        </div>
      </Modal>
    </div>
  );
}
