import { useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Type, Calendar, PenLine, CheckSquare, Trash2, GripVertical, Settings, Save } from 'lucide-react';
import type { FieldMetadata, FieldType } from '../../types';
import './BlueprintBuilder.css';

interface BlueprintBuilderProps {
  fields: FieldMetadata[];
  onFieldsChange: (fields: FieldMetadata[]) => void;
}

const fieldTypeConfig = {
  text: { icon: Type, label: 'Text Field', color: '#3b82f6' },
  date: { icon: Calendar, label: 'Date Field', color: '#8b5cf6' },
  signature: { icon: PenLine, label: 'Signature', color: '#10b981' },
  checkbox: { icon: CheckSquare, label: 'Checkbox', color: '#f59e0b' },
};

export function BlueprintBuilder({ fields, onFieldsChange }: BlueprintBuilderProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const handleAddField = (type: FieldType) => {
    const newField: FieldMetadata = {
      id: uuidv4(),
      type,
      label: `${fieldTypeConfig[type].label} ${fields.filter(f => f.type === type).length + 1}`,
      position: { x: 50, y: 50 + fields.length * 60 },
    };
    onFieldsChange([...fields, newField]);
    setSelectedFieldId(newField.id);
    setEditingLabel(newField.label);
  };

  const handleDeleteField = (id: string) => {
    onFieldsChange(fields.filter(f => f.id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
      setEditingLabel('');
    }
  };

  const handleFieldMouseDown = (e: React.MouseEvent, field: FieldMetadata) => {
    e.preventDefault();
    setSelectedFieldId(field.id);
    setEditingLabel(field.label);
    setDraggedField(field.id);

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedField || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - canvasRect.left - dragOffset.x, canvasRect.width - 200));
    const y = Math.max(0, Math.min(e.clientY - canvasRect.top - dragOffset.y, canvasRect.height - 50));

    onFieldsChange(fields.map(f => f.id === draggedField ? { ...f, position: { x, y } } : f));
  }, [draggedField, dragOffset, fields, onFieldsChange]);

  const handleLabelChange = (newLabel: string) => {
    setEditingLabel(newLabel);
    if (selectedFieldId) {
      onFieldsChange(fields.map(f => f.id === selectedFieldId ? { ...f, label: newLabel } : f));
    }
  };

  return (
    <div className="blueprint-builder">
      <div
        ref={canvasRef}
        className={`blueprint-canvas ${draggedField ? 'dragging' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setDraggedField(null)}
        onMouseLeave={() => setDraggedField(null)}
      >
        {fields.length === 0 ? (
          <div className="canvas-placeholder">
            <Save size={48} strokeWidth={1} />
            <h3>Drop fields here</h3>
            <p>Click a field type on the right to add it to your blueprint</p>
          </div>
        ) : (
          fields.map((field) => {
            const config = fieldTypeConfig[field.type];
            const Icon = config.icon;
            const isSelected = field.id === selectedFieldId;
            return (
              <div
                key={field.id}
                className={`field-placeholder ${isSelected ? 'selected' : ''}`}
                style={{
                  left: field.position.x,
                  top: field.position.y,
                  borderColor: isSelected ? config.color : undefined,
                }}
                onMouseDown={(e) => handleFieldMouseDown(e, field)}
              >
                <div className="field-drag-handle">
                  <GripVertical size={14} />
                </div>
                <div className="field-type-indicator" style={{ background: config.color }}>
                  <Icon size={14} />
                </div>
                <span className="field-label">{field.label}</span>
                <button
                  type="button"
                  className="field-delete-btn"
                  onClick={(e) => { e.stopPropagation(); handleDeleteField(field.id); }}
                  aria-label={`Delete ${field.label}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="field-sidebar">
        <div className="sidebar-section">
          <h3 className="sidebar-title">Field Types</h3>
          <p className="sidebar-description">Click to add a field to the canvas</p>
          <div className="field-types">
            {(Object.keys(fieldTypeConfig) as FieldType[]).map((type) => {
              const config = fieldTypeConfig[type];
              const Icon = config.icon;
              return (
                <button type="button" key={type} className="field-type-btn" onClick={() => handleAddField(type)}>
                  <div className="field-type-icon-wrapper" style={{ background: `${config.color}20`, color: config.color }}>
                    <Icon size={18} />
                  </div>
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedField && (
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <Settings size={16} />
              Field Settings
            </h3>
            <div className="field-settings">
              <div className="input-group">
                <label className="input-label" htmlFor="field-label">Field Label</label>
                <input
                  id="field-label"
                  type="text"
                  className="input"
                  value={editingLabel}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  placeholder="Enter field label"
                />
              </div>
              <div className="field-info">
                <span className="field-info-label">Type</span>
                <span className="field-info-value">{fieldTypeConfig[selectedField.type].label}</span>
              </div>
              <div className="field-info">
                <span className="field-info-label">Position</span>
                <span className="field-info-value">
                  X: {Math.round(selectedField.position.x)}, Y: {Math.round(selectedField.position.y)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
