import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Plus, Type, Calendar, PenLine, CheckSquare, LayoutTemplate } from 'lucide-react';
import { useBlueprintStore } from '../../stores/blueprintStore';
import type { FieldType } from '../../types';
import './BlueprintDetail.css';

const fieldTypeIcons: Record<FieldType, typeof Type> = {
  text: Type,
  date: Calendar,
  signature: PenLine,
  checkbox: CheckSquare,
};

const fieldTypeLabels: Record<FieldType, string> = {
  text: 'Text Field',
  date: 'Date Field',
  signature: 'Signature',
  checkbox: 'Checkbox',
};

export function BlueprintDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getBlueprintById = useBlueprintStore(state => state.getBlueprintById);

  const blueprint = getBlueprintById(id!);

  if (!blueprint) {
    return (
      <div className="not-found">
        <LayoutTemplate size={64} strokeWidth={1} />
        <h2>Blueprint not found</h2>
        <p>The blueprint you're looking for doesn't exist.</p>
        <Link to="/blueprints" className="btn btn-primary">Back to Blueprints</Link>
      </div>
    );
  }

  return (
    <div className="blueprint-detail-page">
      <div className="page-header">
        <div className="header-with-back">
          <button className="btn btn-icon btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{blueprint.name}</h1>
            <p className="page-description">{blueprint.description || 'No description provided'}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate(`/blueprints/${id}/edit`)}>
            <Edit size={18} />
            Edit
          </button>
          <Link to={`/contracts/new?blueprintId=${id}`} className="btn btn-primary">
            <Plus size={18} />
            Use Template
          </Link>
        </div>
      </div>

      <div className="blueprint-info-grid">
        <div className="info-card">
          <h3 className="info-card-title">Blueprint Details</h3>
          <div className="info-rows">
            <div className="info-row">
              <span className="info-label">Created</span>
              <span className="info-value">{format(new Date(blueprint.createdAt), 'MMM d, yyyy · h:mm a')}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Updated</span>
              <span className="info-value">{format(new Date(blueprint.updatedAt), 'MMM d, yyyy · h:mm a')}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Total Fields</span>
              <span className="info-value">{blueprint.fields.length}</span>
            </div>
          </div>
        </div>

        <div className="fields-card">
          <h3 className="info-card-title">Field Configuration</h3>
          {blueprint.fields.length === 0 ? (
            <p className="no-fields">No fields configured</p>
          ) : (
            <div className="fields-list">
              {blueprint.fields.map((field, index) => {
                const Icon = fieldTypeIcons[field.type];
                return (
                  <div key={field.id} className="field-item">
                    <span className="field-index">{index + 1}</span>
                    <div className={`field-type-badge ${field.type}`}><Icon size={14} /></div>
                    <div className="field-info">
                      <span className="field-name">{field.label}</span>
                      <span className="field-type-label">{fieldTypeLabels[field.type]}</span>
                    </div>
                    <span className="field-position">({Math.round(field.position.x)}, {Math.round(field.position.y)})</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="preview-section">
        <h3 className="preview-title">Field Preview</h3>
        <div className="preview-canvas">
          {blueprint.fields.map((field) => {
            const Icon = fieldTypeIcons[field.type];
            return (
              <div key={field.id} className={`preview-field ${field.type}`} style={{ left: field.position.x, top: field.position.y }}>
                <Icon size={14} />
                <span>{field.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
