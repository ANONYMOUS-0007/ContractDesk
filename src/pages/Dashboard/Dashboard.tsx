import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Plus, Eye, FileText, LayoutTemplate, Clock, CheckCircle,
  ArrowRight, TrendingUp, Send, PenLine, Lock, XCircle, ChevronDown
} from 'lucide-react';
import { useContractStore } from '../../stores/contractStore';
import { useBlueprintStore } from '../../stores/blueprintStore';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import type { StatusCategory, ContractStatus } from '../../types';
import { validTransitions, statusDisplayInfo } from '../../types';
import './Dashboard.css';

const categoryConfig: Record<StatusCategory, { label: string; icon: typeof Clock; color: string }> = {
  active: { label: 'Active', icon: TrendingUp, color: '#3b82f6' },
  pending: { label: 'Pending', icon: Clock, color: '#f59e0b' },
  signed: { label: 'Signed', icon: CheckCircle, color: '#10b981' },
};

const statusActionIcons: Record<ContractStatus, typeof CheckCircle> = {
  created: CheckCircle,
  approved: CheckCircle,
  sent: Send,
  signed: PenLine,
  locked: Lock,
  revoked: XCircle,
};

export function Dashboard() {
  const navigate = useNavigate();
  const contracts = useContractStore(state => state.contracts);
  const blueprints = useBlueprintStore(state => state.blueprints);
  const getContractsByCategory = useContractStore(state => state.getContractsByCategory);
  const transitionStatus = useContractStore(state => state.transitionStatus);

  const [activeFilter, setActiveFilter] = useState<StatusCategory | 'all'>('all');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    contractId: string | null;
    contractName: string;
    status: ContractStatus | null;
  }>({ isOpen: false, contractId: null, contractName: '', status: null });

  const filteredContracts = activeFilter === 'all' ? contracts : getContractsByCategory(activeFilter);

  const stats = {
    total: contracts.length,
    active: getContractsByCategory('active').length,
    pending: getContractsByCategory('pending').length,
    signed: getContractsByCategory('signed').length,
  };

  useEffect(() => {
    if (!openDropdown) return;
    const close = () => setOpenDropdown(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openDropdown]);

  const handleStatusChange = (contractId: string, contractName: string, newStatus: ContractStatus) => {
    setOpenDropdown(null);
    setConfirmModal({ isOpen: true, contractId, contractName, status: newStatus });
  };

  const confirmStatusTransition = () => {
    if (confirmModal.contractId && confirmModal.status) {
      transitionStatus(confirmModal.contractId, confirmModal.status);
      setConfirmModal({ isOpen: false, contractId: null, contractName: '', status: null });
    }
  };

  const getAvailableActions = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    return contract ? validTransitions[contract.status] : [];
  };

  const closeModal = () => setConfirmModal({ isOpen: false, contractId: null, contractName: '', status: null });

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Manage your blueprints and contracts in one place</p>
        </div>
        <div className="header-actions">
          <Link to="/blueprints/new" className="btn btn-secondary">
            <LayoutTemplate size={18} />
            New Blueprint
          </Link>
          <Link to="/contracts/new" className="btn btn-primary">
            <Plus size={18} />
            New Contract
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Contracts</span>
          </div>
        </div>

        {(Object.keys(categoryConfig) as StatusCategory[]).map((category) => {
          const config = categoryConfig[category];
          const Icon = config.icon;
          return (
            <div key={category} className="stat-card clickable" onClick={() => setActiveFilter(category)}>
              <div className="stat-icon" style={{ background: `${config.color}20`, color: config.color }}>
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats[category]}</span>
                <span className="stat-label">{config.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="action-cards">
          <Link to="/blueprints/new" className="action-card">
            <div className="action-icon blueprint">
              <LayoutTemplate size={28} />
            </div>
            <div className="action-content">
              <h3>Create Blueprint</h3>
              <p>Design a reusable contract template</p>
            </div>
            <ArrowRight size={20} className="action-arrow" />
          </Link>

          <Link to="/contracts/new" className="action-card">
            <div className="action-icon contract">
              <FileText size={28} />
            </div>
            <div className="action-content">
              <h3>Create Contract</h3>
              <p>Generate a new contract from a blueprint</p>
            </div>
            <ArrowRight size={20} className="action-arrow" />
          </Link>
        </div>
      </div>

      <div className="contracts-section">
        <div className="section-header">
          <h2 className="section-title">Recent Contracts</h2>
          <div className="filter-tabs">
            <button className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
              All
            </button>
            {(Object.keys(categoryConfig) as StatusCategory[]).map((category) => (
              <button
                key={category}
                className={`filter-tab ${activeFilter === category ? 'active' : ''}`}
                onClick={() => setActiveFilter(category)}
              >
                {categoryConfig[category].label}
              </button>
            ))}
          </div>
        </div>

        {filteredContracts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No contracts yet"
            description="Create your first contract from a blueprint to get started"
            action={
              <Link to="/contracts/new" className="btn btn-primary">
                <Plus size={18} />
                Create Contract
              </Link>
            }
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Contract Name</th>
                  <th>Blueprint</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.slice(0, 10).map((contract) => (
                  <tr key={contract.id}>
                    <td><span className="contract-name">{contract.name}</span></td>
                    <td><span className="blueprint-name">{contract.blueprintName}</span></td>
                    <td><StatusBadge status={contract.status} /></td>
                    <td><span className="date">{format(new Date(contract.createdAt), 'MMM d, yyyy')}</span></td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/contracts/${contract.id}`)}>
                          <Eye size={14} />
                          View
                        </button>
                        
                        {getAvailableActions(contract.id).length > 0 && (
                          <div className="status-dropdown">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdown(openDropdown === contract.id ? null : contract.id);
                              }}
                            >
                              Change Status
                              <ChevronDown size={14} />
                            </button>
                            {openDropdown === contract.id && (
                              <div className="dropdown-menu">
                                {getAvailableActions(contract.id).map((status) => {
                                  const Icon = statusActionIcons[status];
                                  return (
                                    <button
                                      key={status}
                                      className="dropdown-item"
                                      onClick={() => handleStatusChange(contract.id, contract.name, status)}
                                    >
                                      <Icon size={14} />
                                      {statusDisplayInfo[status].label}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {contracts.length > 10 && (
          <div className="view-all">
            <Link to="/contracts" className="btn btn-ghost">
              View all contracts
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      <div className="blueprints-section">
        <div className="section-header">
          <h2 className="section-title">Your Blueprints</h2>
          <Link to="/blueprints" className="btn btn-ghost btn-sm">
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        {blueprints.length === 0 ? (
          <EmptyState
            icon={LayoutTemplate}
            title="No blueprints yet"
            description="Create a blueprint to design reusable contract templates"
            action={
              <Link to="/blueprints/new" className="btn btn-primary">
                <Plus size={18} />
                Create Blueprint
              </Link>
            }
          />
        ) : (
          <div className="blueprint-cards">
            {blueprints.slice(0, 4).map((blueprint) => (
              <Link key={blueprint.id} to={`/blueprints/${blueprint.id}`} className="blueprint-card">
                <div className="blueprint-card-icon">
                  <LayoutTemplate size={24} />
                </div>
                <div className="blueprint-card-content">
                  <h3>{blueprint.name}</h3>
                  <p>{blueprint.fields.length} fields</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={confirmModal.isOpen}
        onClose={closeModal}
        title={`Change Status: ${confirmModal.contractName}`}
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button
              className={`btn ${confirmModal.status === 'revoked' ? 'btn-danger' : 'btn-primary'}`}
              onClick={confirmStatusTransition}
            >
              Confirm
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to change the status to{' '}
          <strong>{confirmModal.status && statusDisplayInfo[confirmModal.status].label}</strong>?
        </p>
      </Modal>
    </div>
  );
}
