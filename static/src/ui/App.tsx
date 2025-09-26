import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { view } from '@forge/bridge';
import { CASCADE_DATA } from '../../../src/data';

function App() {
  const [extensionData, setExtensionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    view.getContext().then((context) => {
      console.log('Context received:', JSON.stringify(context, null, 2));
      setExtensionData(context);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to get context:', err);
      setError("Couldn't load field context");
      setLoading(false);
    });
  }, []);

  const formValueSubmit = useCallback(async (value: any) => {
    try {
      const payload = value ? JSON.stringify(value) : null;
      return await view.submit(payload);
    } catch (e) {
      setError("Couldn't save the custom field");
      console.error('Submit error:', e);
    }
  }, [view]);

  // Parse the initial field value
  const initialFieldValue = useMemo(() => {
    if (!extensionData) return null;
    
    const fieldValue = extensionData.extension?.fieldValue || extensionData.fieldValue;
    if (typeof fieldValue === 'string' && fieldValue.trim()) {
      try {
        return JSON.parse(fieldValue);
      } catch (e) {
        console.error('Failed to parse field value:', e);
        return null;
      }
    }
    return fieldValue || null;
  }, [extensionData]);

  const [categoryValue, setCategoryValue] = useState<string | null>(initialFieldValue?.category || null);
  const [subcategoryValue, setSubcategoryValue] = useState<string | null>(initialFieldValue?.subcategory || null);
  const [itemValue, setItemValue] = useState<string | null>(initialFieldValue?.item || null);

  // Update state when initial value changes
  useEffect(() => {
    if (initialFieldValue) {
      setCategoryValue(initialFieldValue.category || null);
      setSubcategoryValue(initialFieldValue.subcategory || null);
      setItemValue(initialFieldValue.item || null);
    }
  }, [initialFieldValue]);

  // Get subcategories based on selected category
  const subcategories = useMemo(() => {
    if (!categoryValue) return [];
    const category = CASCADE_DATA.categories.find(c => c.name === categoryValue);
    return category ? category.subcategories : [];
  }, [categoryValue]);

  // Get items based on selected subcategory
  const items = useMemo(() => {
    if (!subcategoryValue) return [];
    const subcategory = subcategories.find(s => s.name === subcategoryValue);
    return subcategory ? subcategory.items : [];
  }, [subcategoryValue, subcategories]);

  // Format category options
  const categoryOptions = useMemo(() => {
    return CASCADE_DATA.categories.map(category => ({
      label: category.name,
      value: category.name
    }));
  }, []);

  // Format subcategory options
  const subcategoryOptions = useMemo(() => {
    return subcategories.map(subcategory => ({
      label: subcategory.name,
      value: subcategory.name
    }));
  }, [subcategories]);

  // Format item options
  const itemOptions = useMemo(() => {
    return items.map(item => ({
      label: item,
      value: item
    }));
  }, [items]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await formValueSubmit({
      category: categoryValue,
      subcategory: subcategoryValue,
      item: itemValue
    });
  }, [categoryValue, subcategoryValue, itemValue, formValueSubmit]);

  const isIssueView = extensionData?.extension?.renderContext && extensionData.extension.renderContext === 'issue-view';

  if (loading) {
    return <div style={{ padding: '12px' }}>Loading...</div>;
  }

  if (!extensionData) {
    return <div style={{ padding: '12px' }}>Loading field data...</div>;
  }

  return (
    <div style={{ padding: isIssueView ? '24px' : '12px', fontFamily: 'Arial, sans-serif' }}>
      {error && (
        <div style={{ color: 'red', marginBottom: '12px', padding: '8px', backgroundColor: '#ffebee' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Category
          </label>
          <select
            value={categoryValue || ''}
            onChange={(e) => {
              const value = e.target.value || null;
              setCategoryValue(value);
              setSubcategoryValue(null);
              setItemValue(null);
              // Removed auto-submit in issue view to prevent form closing
            }}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc', 
              borderRadius: '3px' 
            }}
          >
            <option value="">Select a category</option>
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Subcategory
          </label>
          <select
            value={subcategoryValue || ''}
            onChange={(e) => {
              const value = e.target.value || null;
              setSubcategoryValue(value);
              setItemValue(null);
              // Removed auto-submit in issue view to prevent form closing
            }}
            disabled={!categoryValue}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc', 
              borderRadius: '3px',
              backgroundColor: categoryValue ? 'white' : '#f5f5f7'
            }}
          >
            <option value="">Select a subcategory</option>
            {subcategoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Item
          </label>
          <select
            value={itemValue || ''}
            onChange={(e) => {
              const value = e.target.value || null;
              setItemValue(value);
              // Removed auto-submit in issue view to prevent form closing
            }}
            disabled={!subcategoryValue}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc', 
              borderRadius: '3px',
              backgroundColor: subcategoryValue ? 'white' : '#f5f5f7'
            }}
          >
            <option value="">Select an item</option>
            {itemOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {!isIssueView && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="submit" 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#0052cc', 
                color: 'white', 
                border: 'none', 
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
            <button 
              type="button"
              onClick={view.close}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#f4f5f7', 
                color: '#42526e', 
                border: 'none', 
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default App;