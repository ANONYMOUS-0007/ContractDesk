import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useBlueprintStore } from '../../stores/blueprintStore';
import { BlueprintBuilder } from '../../components/BlueprintBuilder';
import type { FieldMetadata } from '../../types';
import './BlueprintCreate.css';

export function BlueprintCreate() {
  const navigate = useNavigate();
  const addBlueprint = useBlueprintStore(state => state.addBlueprint);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FieldMetadata[]>([]);
  const [errors, setErrors] = useState<{ name?: string; fields?: string }>({});

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

    const fieldsWithoutId = fields.map(({ id, ...rest }) => rest);
    addBlueprint(name, description, fieldsWithoutId);
    navigate('/blueprints');
  };

  return (
    <div className="blueprint-create-page">
      <div className="page-header">
        <div className="header-with-back">
          <button className="btn btn-icon btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">Create Blueprint</h1>
            <p className="page-description">Design a reusable contract template with custom fields</p>
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
            Click a field type to add it, then drag to position it.
          </p>
          {errors.fields && <div className="error-banner">{errors.fields}</div>}
          <BlueprintBuilder fields={fields} onFieldsChange={setFields} />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            <Save size={18} />
            Save Blueprint
          </button>
        </div>
      </form>
    </div>
  );
}
