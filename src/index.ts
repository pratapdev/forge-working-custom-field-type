import Resolver from '@forge/resolver';
import { storage } from '@forge/api';

// Sample default configuration in the format expected by the custom field UI
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

const STORAGE_KEY = 'cascading-config';
const FIELD_VALUE_PREFIX = 'field-value';

// Create resolver for admin operations
const adminResolver = new Resolver();

adminResolver.define('isUserAdmin', async () => {
  console.log('isUserAdmin called');
  return { isAdmin: true };
});

adminResolver.define('getCascadingConfig', async () => {
  try {
    console.log('getCascadingConfig called in admin resolver');
    let config = await storage.get(STORAGE_KEY);
    
    // Initialize with default config if not exists
    if (!config) {
      console.log('No config found, initializing with default');
      await storage.set(STORAGE_KEY, defaultConfig);
      config = defaultConfig;
    }
    
    return { success: true, data: config };
  } catch (error: any) {
    console.error('Error getting config:', error);
    return { success: false, error: error.message };
  }
});

adminResolver.define('saveCascadingConfig', async ({ payload }: { payload: any }) => {
  try {
    console.log('saveCascadingConfig called with:', payload);
    const { config } = payload;
    await storage.set(STORAGE_KEY, config);
    return { success: true };
  } catch (error: any) {
    console.error('Error saving config:', error);
    return { success: false, error: error.message };
  }
});

// Create resolver for field operations
const fieldResolver = new Resolver();

// Function to ensure config exists in storage
const ensureConfigExists = async () => {
  try {
    let config = await storage.get(STORAGE_KEY);
    if (!config) {
      console.log('No config found, initializing with default');
      await storage.set(STORAGE_KEY, defaultConfig);
      config = defaultConfig;
    }
    return config;
  } catch (error) {
    console.error('Error ensuring config exists:', error);
    // Return default config even if storage fails
    return defaultConfig;
  }
};

fieldResolver.define('getConfig', async () => {
  try {
    console.log('getConfig called in field resolver');
    const config = await ensureConfigExists();
    return { success: true, data: config };
  } catch (error: any) {
    console.error('Error getting config:', error);
    return { success: false, error: error.message };
  }
});

// Custom field type resolvers - these are required by Jira custom field types
fieldResolver.define('edit', async ({ context }: { context: any }) => {
  console.log('edit called with context:', context);
  
  // Try multiple ways to get issueId and fieldKey for compatibility
  const issueId = context?.extension?.issue?.id || 
                 context?.issue?.id || 
                 context?.issueId ||
                 context?.extension?.issueId;
                 
  const fieldKey = context?.extension?.fieldKey || 
                  context?.fieldKey ||
                  context?.extension?.field?.key;
  
  console.log(`Resolved issueId: ${issueId}, fieldKey: ${fieldKey}`);
  
  try {
    // Ensure the cascading configuration exists in storage
    const config = await ensureConfigExists();
    
    // Get the field value from storage
    let fieldValue = null;
    if (issueId && fieldKey) {
      const key = `${FIELD_VALUE_PREFIX}:${fieldKey}:issue:${issueId}`;
      fieldValue = await storage.get(key);
      console.log('Retrieved value from storage:', fieldValue);
    }
    
    return { 
      value: fieldValue || null,
      config: config
    };
  } catch (error) {
    console.error('Error retrieving data from storage:', error);
    return { 
      value: null,
      config: defaultConfig
    };
  }
});

fieldResolver.define('view', async ({ context }: { context: any }) => {
  console.log('view called with context:', context);
  
  // Try multiple ways to get issueId and fieldKey for compatibility
  const issueId = context?.extension?.issue?.id || 
                 context?.issue?.id || 
                 context?.issueId ||
                 context?.extension?.issueId;
                 
  const fieldKey = context?.extension?.fieldKey || 
                  context?.fieldKey ||
                  context?.extension?.field?.key;
  
  console.log(`Resolved issueId: ${issueId}, fieldKey: ${fieldKey}`);
  
  try {
    // Ensure the cascading configuration exists in storage
    const config = await ensureConfigExists();
    
    // Get the field value from storage
    let fieldValue = null;
    if (issueId && fieldKey) {
      const key = `${FIELD_VALUE_PREFIX}:${fieldKey}:issue:${issueId}`;
      fieldValue = await storage.get(key);
      console.log('Retrieved value from storage:', fieldValue);
    }
    
    return { 
      value: fieldValue || null,
      config: config
    };
  } catch (error) {
    console.error('Error retrieving data from storage:', error);
    return { 
      value: null,
      config: defaultConfig
    };
  }
});

fieldResolver.define('save', async ({ context, payload }: { context: any, payload: any }) => {
  console.log('save called with context:', context, 'payload:', payload);
  
  const issueId = context?.extension?.issue?.id || 
                 context?.issue?.id || 
                 context?.issueId ||
                 context?.extension?.issueId;
                 
  const fieldKey = context?.extension?.fieldKey || 
                  context?.fieldKey ||
                  context?.extension?.field?.key;
  
  console.log(`Resolved issueId: ${issueId}, fieldKey: ${fieldKey}`);
  
  if (!issueId || !fieldKey) {
    console.log('Missing issueId or fieldKey in context');
    return { success: false };
  }
  
  const key = `${FIELD_VALUE_PREFIX}:${fieldKey}:issue:${issueId}`;
  try {
    await storage.set(key, payload);
    console.log('Saved value to storage:', payload);
    return { success: true };
  } catch (error) {
    console.error('Error saving value to storage:', error);
    return { success: false };
  }
});

fieldResolver.define('validate', async ({ payload }: { payload: any }) => {
  console.log('validate called with payload:', payload);
  // Simple validation - just check that we have an object
  if (payload && typeof payload === 'object') {
    return { errors: [] };
  }
  return { errors: [{ field: 'cascade', message: 'Invalid cascade value' }] };
});

// Export the resolvers
export const adminHandler = adminResolver.getDefinitions();
export const fieldHandler = fieldResolver.getDefinitions();

// For custom field types, we also need to export a default resolver
export default fieldResolver.getDefinitions();