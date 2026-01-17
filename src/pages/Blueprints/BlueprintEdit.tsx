import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, LayoutTemplate } from 'lucide-react';
import { useBlueprintStore } from '../../stores/blueprintStore';
import { BlueprintBuilder } from '../../components/BlueprintBuilder';
import type { FieldMetadata } from '../../types';
import './BlueprintCreate.css';

export function BlueprintEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getBlueprintById = useBlueprintStore(state => state.getBlueprintById);
  const updateBlueprint = useBlueprintStore(state => state.updateBlueprint);

  const blueprint = getBlueprintById(id!);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FieldMetadata[]>([]);
  const [errors, setErrors] = useState<{ name?: string; fields?: string }>({});

  useEffect(() => {
    if (blueprint) {
      setName(blueprint.name);
      setDescription(blueprint.description);
      setFields(blueprint.fields);
    }
  }, [blueprint]);

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

  const validate = () => {
    const newErrors: { name?: string; fields?: string } = {};
    if (!name.trim()) newErrors.name = 'Blueprint name is required';
    if (fields.length === 0) newErrors.fields = 'Add at least one field to your blueprint';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    updateBlueprint(id!, { name, description, fields });
    navigate(`/blueprints/${id}`);
  };

  return (
    <div className="blueprint-create-page">
      <div className="page-header">
        <div className="header-with-back">
          <button className="btn btn-icon btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">Edit Blueprint</h1>
            <p className="page-description">Modify your blueprint configuration</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="blueprint-form">
        <div className="form-section">
          <h2 className="form-section-title">Basic Information</h2>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label required" htmlFor="blueprint-name">Blueprint Name</label>
              <input
                id="blueprint-name"
                type="text"
                className={`input ${errors.name ? 'input-error' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Employment Agreement"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="blueprint-description">Description</label>
              <textarea
                id="blueprint-description"
                className="input textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this blueprint is used for..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="form-section-title">Field Configuration</h2>
          <p className="form-section-description">
            Add and arrange the fields that will appear in contracts created from this blueprint.
          </p>
          {errors.fields && <div className="error-banner">{errors.fields}</div>}
          <BlueprintBuilder fields={fields} onFieldsChange={setFields} />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
