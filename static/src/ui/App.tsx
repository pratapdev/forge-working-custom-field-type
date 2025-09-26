import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { view } from '@forge/bridge';
import { DYNAMIC_CASCADE_DATA } from '../../../src/data';

function App() {
  const [extensionData, setExtensionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      // Create a completely clean object to avoid circular references
      const cleanValue = value ? {
        ...value
      } : null;
      
      const payload = cleanValue ? JSON.stringify(cleanValue) : null;
      const result = await view.submit(payload);
      
      // Provide user feedback that save was successful
      console.log('Field saved successfully:', cleanValue);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
      return result;
    } catch (e) {
      setError("Couldn't save the custom field");
      setSaveSuccess(false);
      console.error('Submit error:', e);
    }
  }, []);

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

  // Initialize state for all dynamic fields
  const [fieldValues, setFieldValues] = useState<Record<string, string | null>>(() => {
    const initialValues: Record<string, string | null> = {};
    DYNAMIC_CASCADE_DATA.fields.forEach(field => {
      initialValues[field.id] = (initialFieldValue as Record<string, any>)?.[field.id] || null;
    });
    return initialValues;
  });

  // Update state when initial value changes
  useEffect(() => {
    if (initialFieldValue) {
      const newValues: Record<string, string | null> = {};
      DYNAMIC_CASCADE_DATA.fields.forEach(field => {
        newValues[field.id] = (initialFieldValue as Record<string, any>)?.[field.id] || null;
      });
      setFieldValues(newValues);
    }
  }, [initialFieldValue]);

  // Get options for a specific field based on dependencies
  const getFieldOptions = useCallback((fieldId: string) => {
    const field = DYNAMIC_CASCADE_DATA.fields.find(f => f.id === fieldId);
    if (!field) return [];
    
    // If this field doesn't depend on another field, return its direct options
    if (!field.dependsOn) {
      return field.options || [];
    }
    
    // If this field depends on another field, get options based on the parent field's value
    const parentValue = fieldValues[field.dependsOn];
    if (!parentValue) return [];
    
    // Look up options in the optionData based on parent value
    return DYNAMIC_CASCADE_DATA.optionData[parentValue as keyof typeof DYNAMIC_CASCADE_DATA.optionData] || [];
  }, [fieldValues]);

  // Handle field value changes
  const handleFieldChange = useCallback((fieldId: string, value: string | null) => {
    setFieldValues(prev => {
      const newValues = { ...prev, [fieldId]: value };
      
      // Reset dependent fields
      const fieldIndex = DYNAMIC_CASCADE_DATA.fields.findIndex(f => f.id === fieldId);
      if (fieldIndex !== -1) {
        // Reset all fields that come after this one
        for (let i = fieldIndex + 1; i < DYNAMIC_CASCADE_DATA.fields.length; i++) {
          const dependentField = DYNAMIC_CASCADE_DATA.fields[i];
          if (dependentField.dependsOn === fieldId) {
            newValues[dependentField.id] = null;
          }
        }
      }
      
      return newValues;
    });
    
    // Auto-submit in issue view (if desired)
    const isIssueView = extensionData?.extension?.renderContext && extensionData.extension.renderContext === 'issue-view';
    if (isIssueView) {
      // For now, we'll keep the explicit save button approach
    }
  }, [extensionData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    // Create a clean object with all field values
    const submitValue = { ...fieldValues };
    
    // Show a temporary success message
    setError(null); // Clear any previous errors
    const result = await formValueSubmit(submitValue);
    
    // In non-issue-view contexts, we might want to close the form after successful save
    const isIssueView = extensionData?.extension?.renderContext && extensionData.extension.renderContext === 'issue-view';
    if (!isIssueView && result) {
      try {
        await view.close();
      } catch (error) {
        console.log('Could not close view after save');
      }
    }
  }, [fieldValues, formValueSubmit, extensionData]);

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
      {saveSuccess && (
        <div style={{ color: 'green', marginBottom: '12px', padding: '8px', backgroundColor: '#e8f5e9' }}>
          Field saved successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {DYNAMIC_CASCADE_DATA.fields.map((field, index) => {
          const options = getFieldOptions(field.id);
          const isDisabled = field.dependsOn ? !fieldValues[field.dependsOn] : false;
          
          return (
            <div key={field.id} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                {field.label}
                {field.required && <span style={{ color: 'red' }}> *</span>}
              </label>
              <select
                value={fieldValues[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value || null)}
                disabled={isDisabled}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ccc', 
                  borderRadius: '3px',
                  backgroundColor: isDisabled ? '#f5f5f7' : 'white'
                }}
              >
                <option value="">Select a {field.label.toLowerCase()}</option>
                {options.map((option: any) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
        
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
              onClick={async () => {
                try {
                  // Try to close the view, but catch any errors
                  await view.close();
                } catch (error) {
                  // If closing fails, just clear the form
                  console.log('View could not be closed, clearing form instead');
                  const resetValues: Record<string, string | null> = {};
                  DYNAMIC_CASCADE_DATA.fields.forEach(field => {
                    resetValues[field.id] = null;
                  });
                  setFieldValues(resetValues);
                }
              }}
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
        {isIssueView && (
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
          </div>
        )}
      </form>
    </div>
  );
}

export default App;