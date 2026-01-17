import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, FileText, Eye, Filter, CheckCircle, Send, PenLine, Lock, XCircle, ChevronDown } from 'lucide-react';
import { useContractStore } from '../../stores/contractStore';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import type { StatusCategory, ContractStatus } from '../../types';
import { validTransitions, statusDisplayInfo } from '../../types';
import './ContractList.css';

type FilterOption = 'all' | StatusCategory | ContractStatus;

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All Contracts' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'signed', label: 'Signed' },
  { value: 'created', label: 'Created' },
  { value: 'approved', label: 'Approved' },
  { value: 'sent', label: 'Sent' },
  { value: 'locked', label: 'Locked' },
  { value: 'revoked', label: 'Revoked' },
];

const statusActionIcons: Record<ContractStatus, typeof CheckCircle> = {
  created: CheckCircle,
  approved: CheckCircle,
  sent: Send,
  signed: PenLine,
  locked: Lock,
  revoked: XCircle,
};

export function ContractList() {
  const navigate = useNavigate();
  const contracts = useContractStore(state => state.contracts);
  const getContractsByCategory = useContractStore(state => state.getContractsByCategory);
  const getContractsByStatus = useContractStore(state => state.getContractsByStatus);
  const transitionStatus = useContractStore(state => state.transitionStatus);

  const [filter, setFilter] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    contractId: string | null;
    contractName: string;
    status: ContractStatus | null;
  }>({ isOpen: false, contractId: null, contractName: '', status: null });

  const getFilteredContracts = () => {
    let filtered = contracts;

    if (filter !== 'all') {
      filtered = ['active', 'pending', 'signed'].includes(filter)
        ? getContractsByCategory(filter as StatusCategory)
        : getContractsByStatus(filter as ContractStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) || c.blueprintName.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredContracts = getFilteredContracts();

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
    <div className="contract-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contracts</h1>
          <p className="page-description">Manage all your contracts and their lifecycle</p>
        </div>
        <Link to="/contracts/new" className="btn btn-primary">
          <Plus size={18} />
          Create Contract
        </Link>
      </div>

      <div className="list-controls">
        <div className="search-wrapper">
          <input
            type="text"
            className="input search-input"
            placeholder="Search contracts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-wrapper">
          <Filter size={16} />
          <select className="input select filter-select" value={filter} onChange={(e) => setFilter(e.target.value as FilterOption)}>
            {filterOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredContracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={searchQuery || filter !== 'all' ? 'No contracts found' : 'No contracts yet'}
          description={searchQuery || filter !== 'all' ? 'Try adjusting your search or filter criteria' : 'Create your first contract from a blueprint to get started'}
          action={!searchQuery && filter === 'all' && (
            <Link to="/contracts/new" className="btn btn-primary">
              <Plus size={18} />
              Create Contract
            </Link>
          )}
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
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract) => (
                <tr key={contract.id}>
                  <td>
                    <div className="contract-name-cell">
                      <FileText size={16} className="contract-icon" />
                      <span className="contract-name">{contract.name}</span>
                    </div>
                  </td>
                  <td><span className="blueprint-tag">{contract.blueprintName}</span></td>
                  <td><StatusBadge status={contract.status} /></td>
                  <td><span className="date">{format(new Date(contract.createdAt), 'MMM d, yyyy')}</span></td>
                  <td><span className="date">{format(new Date(contract.updatedAt), 'MMM d, yyyy')}</span></td>
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

      <div className="list-summary">
        <span>Showing {filteredContracts.length} of {contracts.length} contracts</span>
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
