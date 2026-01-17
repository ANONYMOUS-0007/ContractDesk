import { useState, useRef } from 'react';
import { Type, Calendar, PenLine, CheckSquare, Lock } from 'lucide-react';
import type { FieldMetadata, FieldValue, FieldType } from '../../types';
import './ContractForm.css';

interface ContractFormProps {
  fields: FieldMetadata[];
  fieldValues: FieldValue[];
  onFieldValuesChange: (values: FieldValue[]) => void;
  isLocked: boolean;
}

const fieldTypeIcons: Record<FieldType, typeof Type> = {
  text: Type,
  date: Calendar,
  signature: PenLine,
  checkbox: CheckSquare,
};

export function ContractForm({ fields, fieldValues, onFieldValuesChange, isLocked }: ContractFormProps) {
  const [activeSignatureId, setActiveSignatureId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const getValue = (fieldId: string) => fieldValues.find(fv => fv.fieldId === fieldId)?.value ?? '';

  const updateValue = (fieldId: string, value: string | boolean) => {
    onFieldValuesChange(fieldValues.map(fv => fv.fieldId === fieldId ? { ...fv, value } : fv));
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    isDrawing.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    ctx?.beginPath();
    ctx?.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2B8A7E';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.current || !canvasRef.current || !activeSignatureId) return;
    isDrawing.current = false;
    updateValue(activeSignatureId, canvasRef.current.toDataURL());
  };

  const clearSignature = (fieldId: string) => {
    if (canvasRef.current && activeSignatureId === fieldId) {
      canvasRef.current.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    updateValue(fieldId, '');
  };

  return (
    <div className="contract-form">
      {isLocked && (
        <div className="form-locked-banner">
          <Lock size={16} />
          <span>This contract is locked and cannot be edited</span>
        </div>
      )}

      <div className="form-fields">
        {fields.map((field) => {
          const Icon = fieldTypeIcons[field.type];
          const value = getValue(field.id);

          return (
            <div key={field.id} className="form-field">
              <label className="form-field-label">
                <Icon size={16} className="form-field-icon" />
                {field.label}
              </label>

              {field.type === 'text' && (
                <input
                  type="text"
                  className="input"
                  value={value as string}
                  onChange={(e) => updateValue(field.id, e.target.value)}
                  disabled={isLocked}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}

              {field.type === 'date' && (
                <input
                  type="date"
                  className="input"
                  value={value as string}
                  onChange={(e) => updateValue(field.id, e.target.value)}
                  disabled={isLocked}
                />
              )}

              {field.type === 'checkbox' && (
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={value as boolean}
                    onChange={(e) => updateValue(field.id, e.target.checked)}
                    disabled={isLocked}
                  />
                  <span className="checkbox-label">Check to confirm</span>
                </label>
              )}

              {field.type === 'signature' && (
                <div className="signature-field">
                  {activeSignatureId === field.id ? (
                    <div className="signature-canvas-wrapper">
                      <canvas
                        ref={canvasRef}
                        width={400}
                        height={150}
                        className="signature-canvas"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                      <div className="signature-actions">
                        <button type="button" className="btn btn-sm btn-ghost" onClick={() => clearSignature(field.id)}>
                          Clear
                        </button>
                        <button type="button" className="btn btn-sm btn-secondary" onClick={() => setActiveSignatureId(null)}>
                          Done
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="signature-preview">
                      {value ? (
                        <img src={value as string} alt="Signature" className="signature-image" />
                      ) : (
                        <div className="signature-placeholder">
                          <PenLine size={24} />
                          <span>No signature</span>
                        </div>
                      )}
                      {!isLocked && (
                        <button type="button" className="btn btn-sm btn-primary" onClick={() => setActiveSignatureId(field.id)}>
                          {value ? 'Edit Signature' : 'Add Signature'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
