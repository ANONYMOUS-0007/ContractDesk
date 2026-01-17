import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, LayoutTemplate, Eye, Trash2, Edit, FileText } from 'lucide-react';
import { useBlueprintStore } from '../../stores/blueprintStore';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import './BlueprintList.css';

export function BlueprintList() {
  const navigate = useNavigate();
  const blueprints = useBlueprintStore(state => state.blueprints);
  const deleteBlueprint = useBlueprintStore(state => state.deleteBlueprint);

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const confirmDelete = () => {
    if (deleteModal.id) {
      deleteBlueprint(deleteModal.id);
      setDeleteModal({ open: false, id: null });
    }
  };

  return (
    <div className="blueprint-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Blueprints</h1>
          <p className="page-description">Create and manage reusable contract templates</p>
        </div>
        <Link to="/blueprints/new" className="btn btn-primary">
          <Plus size={18} />
          Create Blueprint
        </Link>
      </div>

      {blueprints.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="No blueprints yet"
          description="Blueprints are reusable templates for creating contracts. Create your first one to get started."
          action={
            <Link to="/blueprints/new" className="btn btn-primary">
              <Plus size={18} />
              Create Blueprint
            </Link>
          }
        />
      ) : (
        <div className="blueprints-grid">
          {blueprints.map((blueprint) => (
            <div key={blueprint.id} className="blueprint-card-large">
              <div className="blueprint-card-header">
                <div className="blueprint-icon"><LayoutTemplate size={28} /></div>
                <div className="blueprint-actions-menu">
                  <button className="btn btn-icon btn-ghost" onClick={() => navigate(`/blueprints/${blueprint.id}/edit`)} title="Edit blueprint">
                    <Edit size={16} />
                  </button>
                  <button className="btn btn-icon btn-ghost" onClick={() => setDeleteModal({ open: true, id: blueprint.id })} title="Delete blueprint">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="blueprint-card-body">
                <h3 className="blueprint-title">{blueprint.name}</h3>
                <p className="blueprint-description">{blueprint.description || 'No description provided'}</p>
                <div className="blueprint-meta">
                  <div className="meta-item">
                    <FileText size={14} />
                    <span>{blueprint.fields.length} fields</span>
                  </div>
                  <div className="meta-item">
                    <span>Created {format(new Date(blueprint.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>

              <div className="blueprint-card-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/blueprints/${blueprint.id}`)}>
                  <Eye size={14} />
                  View
                </button>
                <Link to={`/contracts/new?blueprintId=${blueprint.id}`} className="btn btn-primary btn-sm">
                  <Plus size={14} />
                  Use Template
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        title="Delete Blueprint"
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteModal({ open: false, id: null })}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
          </>
        }
      >
        <p>Are you sure you want to delete this blueprint? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
