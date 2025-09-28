import React, { useState } from 'react';

interface TreeViewProps {
  data: any;
  path?: any[];
  onAdd: (path: any[], type: string) => void;
  onEdit: (path: any[], value: string, type: string) => void;
  onDelete: (path: any[]) => void;
}

const TreeView = ({ data, path = [], onAdd, onEdit, onDelete }: TreeViewProps) => {
  const [expanded, setExpanded] = useState({} as Record<string, boolean>);

  console.log('TreeView rendering with data:', data);

  const toggleExpand = (key: string) => {
    setExpanded(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderValue = (value: any, key: string, currentPath: any[]) => {
    const fullPath = [...currentPath, key];
    console.log('Rendering value:', { value, key, fullPath });

    if (Array.isArray(value)) {
      return (
        <div className="tree-node">
          <div className="tree-item array-item">
            <span
              className="tree-toggle"
              onClick={() => toggleExpand(fullPath.join('.'))}
            >
              {expanded[fullPath.join('.')] ? '▼' : '▶'}
            </span>
            <span className="tree-key">{key}</span>
            <div className="tree-actions">
              <button
                className="action-button add"
                onClick={() => onAdd(fullPath, 'subitem')}
                title="Add subitem"
              >
                +
              </button>
              <button
                className="action-button edit"
                onClick={() => onEdit(fullPath.slice(0, -1).concat(key), key, 'item')}
                title="Edit item name"
              >
                ✎
              </button>
              <button
                className="action-button delete"
                onClick={() => onDelete(fullPath.slice(0, -1).concat(key))}
                title="Delete item"
              >
                ×
              </button>
            </div>
          </div>
          {expanded[fullPath.join('.')] && (
            <div className="tree-children">
              {value.map((item: any, index: number) => (
                <div key={index} className="tree-item subitem">
                  <span className="tree-value">{item}</span>
                  <div className="tree-actions">
                    <button
                      className="action-button edit"
                      onClick={() => onEdit([...fullPath, index], item, 'subitem')}
                      title="Edit subitem"
                    >
                      ✎
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => onDelete([...fullPath, index])}
                      title="Delete subitem"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (typeof value === 'object' && value !== null) {
      const level = currentPath.length;
      const nodeType = level === 0 ? 'category' : level === 1 ? 'subcategory' : 'item';
      const childType = level === 0 ? 'subcategory' : level === 1 ? 'item' : 'subitem';

      return (
        <div className="tree-node">
          <div className={`tree-item ${nodeType}`}>
            <span
              className="tree-toggle"
              onClick={() => toggleExpand(fullPath.join('.'))}
            >
              {expanded[fullPath.join('.')] ? '▼' : '▶'}
            </span>
            <span className="tree-key">{key}</span>
            <div className="tree-actions">
              <button
                className="action-button add"
                onClick={() => onAdd(fullPath, childType)}
                title={`Add ${childType}`}
              >
                +
              </button>
              <button
                className="action-button edit"
                onClick={() => onEdit(fullPath.slice(0, -1).concat(key), key, nodeType)}
                title={`Edit ${nodeType} name`}
              >
                ✎
              </button>
              <button
                className="action-button delete"
                onClick={() => onDelete(fullPath.slice(0, -1).concat(key))}
                title={`Delete ${nodeType}`}
              >
                ×
              </button>
            </div>
          </div>
          {expanded[fullPath.join('.')] && (
            <div className="tree-children">
              <TreeView
                data={value}
                path={fullPath}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // Handle case where data is not an object
  if (typeof data !== 'object' || data === null) {
    console.log('Data is not an object or is null:', data);
    return <div className="tree-view">No valid data to display</div>;
  }

  return (
    <div className="tree-view">
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>
          {renderValue(value, key, path)}
        </div>
      ))}
    </div>
  );
};

export default TreeView;