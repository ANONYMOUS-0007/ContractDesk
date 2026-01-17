import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, LayoutTemplate, FileText } from 'lucide-react';
import { useBlueprintStore } from '../../stores/blueprintStore';
import { useContractStore } from '../../stores/contractStore';
import './ContractCreate.css';

export function ContractCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const blueprints = useBlueprintStore(state => state.blueprints);
  const getBlueprintById = useBlueprintStore(state => state.getBlueprintById);
  const createContract = useContractStore(state => state.createContract);

  const preselectedBlueprintId = searchParams.get('blueprintId');

  const [name, setName] = useState('');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState(preselectedBlueprintId || '');
  const [errors, setErrors] = useState<{ name?: string; blueprint?: string }>({});

  const selectedBlueprint = selectedBlueprintId ? getBlueprintById(selectedBlueprintId) : undefined;

  useEffect(() => {
    if (selectedBlueprint && !name) {
      setName(`${selectedBlueprint.name} - ${new Date().toLocaleDateString()}`);
    }
  }, [selectedBlueprint, name]);

  const validate = () => {
    const newErrors: { name?: string; blueprint?: string } = {};
    if (!name.trim()) newErrors.name = 'Contract name is required';
    if (!selectedBlueprintId) newErrors.blueprint = 'Select a blueprint to create a contract';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !selectedBlueprint) return;
    const contract = createContract(name, selectedBlueprint);
    navigate(`/contracts/${contract.id}`);
  };

  if (blueprints.length === 0) {
    return (
      <div className="contract-create-page">
        <div className="page-header">
          <div className="header-with-back">
            <button className="btn btn-icon btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">
              <ArrowLeft size={20} />
            </button>
            <div><h1 className="page-title">Create Contract</h1></div>
          </div>
        </div>
        <div className="no-blueprints-card">
          <LayoutTemplate size={64} strokeWidth={1} />
          <h2>No blueprints available</h2>
          <p>You need to create a blueprint first before you can create contracts.</p>
          <Link to="/blueprints/new" className="btn btn-primary">Create Blueprint</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="contract-create-page">
      <div className="page-header">
        <div className="header-with-back">
          <button className="btn btn-icon btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">Create Contract</h1>
            <p className="page-description">Generate a new contract from a blueprint template</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="contract-form">
        <div className="form-section">
          <h2 className="form-section-title">Contract Details</h2>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label required" htmlFor="contract-name">Contract Name</label>
              <input
                id="contract-name"
                type="text"
                className={`input ${errors.name ? 'input-error' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Doe Employment Agreement"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="form-section-title">Select Blueprint</h2>
          <p className="form-section-description">Choose a blueprint template for this contract</p>
          {errors.blueprint && <div className="error-banner">{errors.blueprint}</div>}

          <div className="blueprint-selection-grid">
            {blueprints.map((blueprint) => (
              <div
                key={blueprint.id}
                className={`blueprint-option ${selectedBlueprintId === blueprint.id ? 'selected' : ''}`}
                onClick={() => setSelectedBlueprintId(blueprint.id)}
              >
                <div className="blueprint-option-header">
                  <div className="blueprint-option-icon"><LayoutTemplate size={20} /></div>
                  <div className="blueprint-option-radio"><div className="radio-inner" /></div>
                </div>
                <h3 className="blueprint-option-name">{blueprint.name}</h3>
                <p className="blueprint-option-description">{blueprint.description || 'No description'}</p>
                <div className="blueprint-option-fields">
                  <FileText size={12} />
                  <span>{blueprint.fields.length} fields</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedBlueprint && (
          <div className="form-section">
            <h2 className="form-section-title">Blueprint Preview</h2>
            <div className="blueprint-preview">
              <div className="preview-header">
                <LayoutTemplate size={20} />
                <span>{selectedBlueprint.name}</span>
              </div>
              <div className="preview-fields">
                {selectedBlueprint.fields.map((field, index) => (
                  <div key={field.id} className="preview-field-item">
                    <span className="field-number">{index + 1}</span>
                    <span className="field-type-label">{field.type}</span>
                    <span className="field-label">{field.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            <Save size={18} />
            Create Contract
          </button>
        </div>
      </form>
    </div>
  );
}
