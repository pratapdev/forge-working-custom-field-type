import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';

interface AdminResult {
  isAdmin: boolean;
}

interface ConfigResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Function to convert from custom field format to flat structure for editing
const convertFromCustomFieldFormat = (customFieldConfig: any) => {
  if (!customFieldConfig || !customFieldConfig.optionData) {
    return {};
  }

  const flatConfig: Record<string, any> = {};
  const optionData = customFieldConfig.optionData;

  // Get categories from the category field options
  const categories = optionData.category || [];
  categories.forEach((cat: any) => {
    const categoryName = cat.value;
    flatConfig[categoryName] = {};

    // Get subcategories for this category
    const subcategories = optionData[categoryName] || [];
    subcategories.forEach((subcat: any) => {
      const subcategoryName = subcat.value;
      // Get items for this subcategory
      const items = optionData[`${categoryName} > ${subcategoryName}`] || [];
      flatConfig[categoryName][subcategoryName] = items.map((item: any) => item.value);
    });
  });

  return flatConfig;
};

// Function to convert flat structure to the format expected by the custom field UI
const convertToCustomFieldFormat = (flatConfig: any) => {
  const fields = [
    { id: 'category', label: 'Category', required: true },
    { id: 'subcategory', label: 'Subcategory', required: true, dependsOn: 'category' },
    { id: 'item', label: 'Item', required: true, dependsOn: 'subcategory' }
  ];

  const optionData: Record<string, any> = {};

  // Add category options
  optionData.category = Object.keys(flatConfig).map(cat => ({
    value: cat,
    label: cat
  }));

  // Convert the flat structure to the nested format expected by the UI
  Object.keys(flatConfig).forEach(category => {
    // Add subcategory options for each category
    optionData[category] = Object.keys(flatConfig[category]).map(subcat => ({
      value: subcat,
      label: subcat
    }));

    // Add item options for each subcategory
    Object.keys(flatConfig[category]).forEach(subcategory => {
      const items = flatConfig[category][subcategory];
      if (Array.isArray(items)) {
        optionData[`${category} > ${subcategory}`] = items.map(item => ({
          value: item,
          label: item
        }));
      }
    });
  });

  return { fields, optionData };
};

function App() {
  const [config, setConfig] = useState({} as any);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null as string | null);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      console.log('Loading config...');
      const result: ConfigResult = await invoke('getCascadingConfig');
      console.log('Config result:', result);
      if (result && result.success) {
        // Convert from custom field format to flat structure for editing
        const flatConfig = convertFromCustomFieldFormat(result.data);
        setConfig(flatConfig);
      } else {
        setError(result?.error || 'Failed to load configuration');
      }
    } catch (err: any) {
      console.error('Error loading config:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      // Convert flat structure to custom field format
      const customFieldFormat = convertToCustomFieldFormat(config);
      console.log('Saving config in custom field format:', customFieldFormat);
      
      const result: any = await invoke('saveCascadingConfig', { config: customFieldFormat });
      if (!result || !result.success) {
        setError(result?.error || 'Failed to save configuration');
      } else {
        setError(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    if (newCategory.trim()) {
      setConfig({
        ...config,
        [newCategory.trim()]: {}
      });
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    const newConfig = { ...config };
    delete newConfig[category];
    setConfig(newConfig);
  };

  const addSubcategory = (category: string, subcategory: string) => {
    if (subcategory.trim()) {
      setConfig({
        ...config,
        [category]: {
          ...config[category],
          [subcategory.trim()]: []
        }
      });
    }
  };

  const removeSubcategory = (category: string, subcategory: string) => {
    const newConfig = { ...config };
    delete newConfig[category][subcategory];
    setConfig(newConfig);
  };

  const addItem = (category: string, subcategory: string, item: string) => {
    if (item.trim()) {
      const newConfig = { ...config };
      if (!newConfig[category][subcategory]) {
        newConfig[category][subcategory] = [];
      }
      newConfig[category][subcategory].push(item.trim());
      setConfig(newConfig);
    }
  };

  const removeItem = (category: string, subcategory: string, itemIndex: number) => {
    const newConfig = { ...config };
    newConfig[category][subcategory].splice(itemIndex, 1);
    setConfig(newConfig);
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Forge Multi Level Cascading Configuration</h1>
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <p>Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Forge Multi Level Cascading Configuration</h1>
      
      {error && (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#ffcccc', borderRadius: '4px', color: '#cc0000' }}>
          <strong>Error:</strong> {error}
          <button 
            onClick={() => setError(null)} 
            style={{ marginLeft: '10px', background: '#cc0000', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button
            onClick={addCategory}
            disabled={!newCategory.trim()}
            style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Add Category
          </button>
          <button
            onClick={saveConfig}
            disabled={saving}
            style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
        
        <div>
          <h3>Current Configuration:</h3>
          {Object.keys(config).length === 0 ? (
            <div>
              <p>No configuration data found. Add a category to start.</p>
              <p><strong>Sample structure:</strong></p>
              <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
{`Hardware
  ├── Laptop
  │   ├── Dell
  │   ├── HP
  │   └── Lenovo
  ├── Desktop
  │   ├── Custom Build
  │   └── Prebuilt
  └── Server
      ├── Dell
      ├── HP
      └── IBM

Software
  ├── OS
  │   ├── Windows
  │   ├── Linux
  │   └── MacOS
  └── Application
      ├── Office Suite
      ├── Browser
      └── Editor`}
              </pre>
            </div>
          ) : (
            <div>
              {Object.keys(config).map((category) => (
                <div key={category} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <strong>{category}</strong>
                    <button 
                      onClick={() => removeCategory(category)}
                      style={{ marginLeft: '10px', background: '#ff5630', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div style={{ marginLeft: '20px' }}>
                    <h4>Subcategories:</h4>
                    {Object.keys(config[category]).length === 0 ? (
                      <p style={{ fontStyle: 'italic', color: '#666' }}>No subcategories yet</p>
                    ) : (
                      Object.keys(config[category]).map((subcategory) => (
                        <div key={subcategory} style={{ margin: '10px 0', padding: '10px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <strong>{subcategory}</strong>
                            <button 
                              onClick={() => removeSubcategory(category, subcategory)}
                              style={{ marginLeft: '10px', background: '#ff9900', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Remove
                            </button>
                          </div>
                          
                          <div style={{ marginLeft: '20px' }}>
                            <h5>Items:</h5>
                            {config[category][subcategory].length === 0 ? (
                              <p style={{ fontStyle: 'italic', color: '#666' }}>No items yet</p>
                            ) : (
                              <div>
                                {config[category][subcategory].map((item: string, index: number) => (
                                  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                    <span>{item}</span>
                                    <button 
                                      onClick={() => removeItem(category, subcategory, index)}
                                      style={{ marginLeft: '10px', background: '#999999', color: 'white', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                              <input
                                type="text"
                                placeholder="New item"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const target = e.target as HTMLInputElement;
                                    addItem(category, subcategory, target.value);
                                    target.value = '';
                                  }
                                }}
                                style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px' }}
                              />
                              <button
                                onClick={(e) => {
                                  const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                                  addItem(category, subcategory, input.value);
                                  input.value = '';
                                }}
                                style={{ padding: '4px 8px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                              >
                                Add Item
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <input
                        type="text"
                        placeholder="New subcategory"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            addSubcategory(category, target.value);
                            target.value = '';
                          }
                        }}
                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px' }}
                      />
                      <button
                        onClick={(e) => {
                          const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                          addSubcategory(category, input.value);
                          input.value = '';
                        }}
                        style={{ padding: '4px 8px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Add Subcategory
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;