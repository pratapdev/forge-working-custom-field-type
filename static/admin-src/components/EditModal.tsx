import React, { useState, useEffect } from 'react';

interface EditModalProps {
  show: boolean;
  path: any[];
  value: string;
  type: string;
  nodeType: string;
  onSave: (path: any[], value: string, nodeType: string) => void;
  onCancel: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ show, path, value, type, nodeType, onSave, onCancel }) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setInputValue(value);
  }, [value, show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSave(path, inputValue.trim(), nodeType);
    }
  };

  if (!show) return null;

  const title = type === 'add' ? `Add ${nodeType}` : `Edit ${nodeType}`;
  const pathString = path.length > 0 ? path.join(' → ') : 'Root';

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body">
          <p><strong>Location:</strong> {pathString}</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="value-input">
                {nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Name:
              </label>
              <input
                id="value-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Enter ${nodeType} name`}
                required
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button type="submit" className="save-button">
                {type === 'add' ? 'Add' : 'Save'}
              </button>
              <button type="button" className="cancel-button" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditModal;