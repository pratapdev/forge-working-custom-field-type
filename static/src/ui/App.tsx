import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { view, invoke } from '@forge/bridge';

// Default configuration
const defaultConfig = {
  fields: [
    { id: 'category', label: 'Category', required: true },
    { id: 'subcategory', label: 'Subcategory', required: true, dependsOn: 'category' },
    { id: 'item', label: 'Item', required: true, dependsOn: 'subcategory' }
  ],
  optionData: {
    category: [
      { value: 'Hardware', label: 'Hardware' },
      { value: 'Software', label: 'Software' },
      { value: 'Network', label: 'Network' }
    ],
    Hardware: [
      { value: 'Laptop', label: 'Laptop' },
      { value: 'Desktop', label: 'Desktop' },
      { value: 'Server', label: 'Server' }
    ],
    Software: [
      { value: 'OS', label: 'OS' },
      { value: 'Application', label: 'Application' }
    ],
    Network: [
      { value: 'Router', label: 'Router' },
      { value: 'Switch', label: 'Switch' }
    ],
    'Hardware > Laptop': [
      { value: 'Dell', label: 'Dell' },
      { value: 'HP', label: 'HP' },
      { value: 'Lenovo', label: 'Lenovo' }
    ],
    'Hardware > Desktop': [
      { value: 'Custom Build', label: 'Custom Build' },
      { value: 'Prebuilt', label: 'Prebuilt' }
    ],
    'Hardware > Server': [
      { value: 'Dell', label: 'Dell' },
      { value: 'HP', label: 'HP' },
      { value: 'IBM', label: 'IBM' }
    ],
    'Software > OS': [
      { value: 'Windows', label: 'Windows' },
      { value: 'Linux', label: 'Linux' },
      { value: 'MacOS', label: 'MacOS' }
    ],
    'Software > Application': [
      { value: 'Office Suite', label: 'Office Suite' },
      { value: 'Browser', label: 'Browser' },
      { value: 'Editor', label: 'Editor' }
    ],
    'Network > Router': [
      { value: 'Cisco', label: 'Cisco' },
      { value: 'Juniper', label: 'Juniper' }
    ],
    'Network > Switch': [
      { value: 'Cisco', label: 'Cisco' },
      { value: 'HP', label: 'HP' }
    ]
  }
};

function App() {
  const [extensionData, setExtensionData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dynamicData, setDynamicData] = useState(defaultConfig);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Starting to load data...');
        // Get context first
        const context = await view.getContext();
        console.log('Context received:', JSON.stringify(context, null, 2));
        setExtensionData(context);
        
        // Try to get config from storage via resolver
        try {
          console.log('Attempting to get config from field resolver...');
          const configResult: any = await invoke('getConfig');
          console.log('Config result:', configResult);
          if (configResult && configResult.success && configResult.data) {
            setDynamicData(configResult.data);
            console.log('Using config from storage');
          } else {
            // Use the default configuration if we can't get it from storage
            setDynamicData(defaultConfig);
            console.log('Using default config');
          }
        } catch (configError: any) {
          console.log('Could not invoke getConfig, using default config:', configError.message);
          // Use the default configuration if we can't get it from storage
          setDynamicData(defaultConfig);
          console.log('Using default config');
        }
      } catch (err: any) {
        console.error('Failed to load data:', err);
        setError("Couldn't load field data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
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
    } catch (e: any) {
      setError("Couldn't save the custom field");
      setSaveSuccess(false);
      console.error('Submit error:', e);
    }
  }, []);

  // Parse the initial field value
  const initialFieldValue = useMemo(() => {
    if (!extensionData) return null;
    
    const fieldValue = (extensionData as any).extension?.value || (extensionData as any).value || (extensionData as any).extension?.fieldValue || (extensionData as any).fieldValue;
    console.log('Processing fieldValue:', fieldValue);
    if (typeof fieldValue === 'string' && fieldValue.trim()) {
      try {
        const parsed = JSON.parse(fieldValue);
        console.log('Parsed fieldValue:', parsed);
        return parsed;
      } catch (e) {
        console.error('Failed to parse field value:', e);
        return null;
      }
    }
    console.log('Returning fieldValue as is:', fieldValue);
    return fieldValue || null;
  }, [extensionData]);

  // Initialize state for all dynamic fields
  const [fieldValues, setFieldValues] = useState(() => {
    const initialValues: Record<string, string | null> = {};
    if (dynamicData?.fields) {
      (dynamicData as any).fields.forEach((field: any) => {
        initialValues[field.id] = (initialFieldValue as Record<string, any>)?.[field.id] || null;
      });
    }
    console.log('Initialized fieldValues:', initialValues);
    return initialValues;
  });

  // Update state when initial value changes
  useEffect(() => {
    if (initialFieldValue && dynamicData?.fields) {
      const newValues: Record<string, string | null> = {};
      (dynamicData as any).fields.forEach((field: any) => {
        newValues[field.id] = (initialFieldValue as Record<string, any>)?.[field.id] || null;
      });
      console.log('Updating fieldValues with initial value:', newValues);
      setFieldValues(newValues);
    }
  }, [initialFieldValue, dynamicData]);

  // Get options for a specific field based on dependencies
  const getFieldOptions = useCallback((fieldId: string) => {
    if (!dynamicData) return [];
    
    const field = (dynamicData as any).fields.find((f: any) => f.id === fieldId);
    if (!field) return [];
    
    // If this field doesn't depend on another field, return its direct options
    if (!field.dependsOn) {
      return (dynamicData as any).optionData[field.id] || [];
    }
    
    // If this field depends on another field, get options based on the parent field's value
    const parentValue = (fieldValues as Record<string, string | null>)[field.dependsOn];
    if (!parentValue) return [];
    
    // For fields that depend on a field which itself depends on another field,
    // we need to construct the key using all parent values
    let lookupKey = parentValue;
    
    // Check if the parent field also has a dependency
    const parentField = (dynamicData as any).fields.find((f: any) => f.id === field.dependsOn);
    if (parentField && parentField.dependsOn) {
      // This is a third-level field, so we need to construct the key with all parent values
      const grandParentValue = (fieldValues as Record<string, string | null>)[parentField.dependsOn];
      if (grandParentValue) {
        lookupKey = `${grandParentValue} > ${parentValue}`;
      }
    }
    
    // Look up options in the optionData based on the constructed key
    const dynamicDataAny = dynamicData as any;
    return dynamicDataAny.optionData[lookupKey] || [];
  }, [fieldValues, dynamicData]);

  // Handle field value changes
  const handleFieldChange = useCallback((fieldId: string, value: string | null) => {
    setFieldValues(prev => {
      const newValues = { ...(prev as Record<string, string | null>), [fieldId]: value };
      
      // Reset dependent fields
      if (dynamicData?.fields) {
        const fieldIndex = (dynamicData as any).fields.findIndex((f: any) => f.id === fieldId);
        if (fieldIndex !== -1) {
          // Reset all fields that come after this one
          for (let i = fieldIndex + 1; i < (dynamicData as any).fields.length; i++) {
            const dependentField = (dynamicData as any).fields[i];
            if (dependentField.dependsOn === fieldId) {
              newValues[dependentField.id] = null;
            }
          }
        }
      }
      
      return newValues;
    });
    
    // Auto-submit in issue view (if desired)
    const isIssueView = (extensionData as any)?.extension?.renderContext && (extensionData as any).extension.renderContext === 'issue-view';
    if (isIssueView) {
      // For now, we'll keep the explicit save button approach
    }
  }, [extensionData, dynamicData]);

  const handleSubmit = useCallback(async (e: any) => {
    e.preventDefault();
    // Create a clean object with all field values
    const submitValue = { ...(fieldValues as Record<string, string | null>) };
    
    // Show a temporary success message
    setError(null); // Clear any previous errors
    const result = await formValueSubmit(submitValue);
    
    // In non-issue-view contexts, we might want to close the form after successful save
    const isIssueView = (extensionData as any)?.extension?.renderContext && (extensionData as any).extension.renderContext === 'issue-view';
    if (!isIssueView && result) {
      try {
        await view.close();
      } catch (error) {
        console.log('Could not close view after save');
      }
    }
  }, [fieldValues, formValueSubmit, extensionData]);

  const isIssueView = (extensionData as any)?.extension?.renderContext && (extensionData as any).extension.renderContext === 'issue-view';

  if (loading) {
    return <div style={{ padding: '12px' }}>Loading...</div>;
  }

  if (!extensionData) {
    return <div style={{ padding: '12px' }}>Loading field data...</div>;
  }

  // Show loading message if we have extension data but not config yet
  if (!dynamicData) {
    return <div style={{ padding: '12px' }}>Loading configuration...</div>;
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
        {(dynamicData as any).fields.map((field: any, index: number) => {
          const options = getFieldOptions(field.id);
          const isDisabled = field.dependsOn ? !(fieldValues as Record<string, string | null>)[field.dependsOn] : false;
          
          return (
            <div key={field.id} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                {field.label}
                {field.required && <span style={{ color: 'red' }}> *</span>}
              </label>
              <select
                value={(fieldValues as Record<string, string | null>)[field.id] || ''}
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
                  if (dynamicData?.fields) {
                    (dynamicData as any).fields.forEach((field: any) => {
                      resetValues[field.id] = null;
                    });
                  }
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