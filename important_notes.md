# Custom Field Multi-Cascade App - Development Notes

## Overview
This document contains important notes about the development of the Custom Field Multi-Cascade App for Jira, including requirements, issues faced, and solutions implemented.

## Mandatory Configurations

### 1. Manifest Configuration
- **Custom Field Type Module**: Must define a resolver for `jira:customFieldType` modules
- **Storage Permissions**: Required scopes `storage:app` to persist configurations
- **Jira Permissions**: Required scopes `read:jira-work`, `write:jira-work`, `manage:jira-configuration`
- **Content Security**: Must allow inline styles and scripts in permissions

### 2. Storage Keys
- **Configuration Storage**: `cascading-config` - Stores the cascading dropdown configuration
- **Field Value Storage**: `field-value:${fieldKey}:issue:${issueId}` - Stores field values per issue

### 3. Resolver Functions
Custom field types require specific resolver functions:
- `edit` - Called when editing the field
- `view` - Called when viewing the field
- `save` - Called when saving the field
- `validate` - Called to validate field values
- `getConfig` - Custom function to fetch configuration from storage

## Issues Faced and Solutions

### 1. Resolver Error: "Entry point "resolver" for extension could not be invoked"
**Issue**: Jira platform tried to invoke a resolver that wasn't defined in the manifest
**Solution**: 
- Added resolver configuration to `jira:customFieldType` module in manifest.yml
- Ensured fieldHandler resolver had all required methods

```yaml
jira:customFieldType:
  - key: multi-cascade-type
    # ... other properties
    resolver:
      function: field-resolver
```

### 2. Configuration Not Reflecting in Custom Field UI
**Issue**: Custom field UI was using default configuration instead of fetching from storage
**Solution**: 
- Updated UI to call `invoke('getConfig')` to fetch configuration from storage
- Added proper error handling to fall back to default configuration

```typescript
// Try to get config from storage via resolver
try {
  const configResult: any = await invoke('getConfig');
  if (configResult && configResult.success && configResult.data) {
    setDynamicData(configResult.data);
  } else {
    setDynamicData(defaultConfig);
  }
} catch (configError: any) {
  setDynamicData(defaultConfig);
}
```

### 3. Auto-submit Behavior
**Issue**: Form was auto-submitting and closing immediately after selection
**Solution**: 
- Removed auto-submit behavior
- Kept explicit save button for all contexts (issue-view, issue-create, issue-transition, issue-panel)

### 4. Context Handling Differences
**Issue**: Different contexts (issue-view vs issue-create) provided context data in different structures
**Solution**: 
- Implemented robust context parsing to handle multiple data structures
- Used fallback chains to get issueId and fieldKey

```typescript
const issueId = context?.extension?.issue?.id || 
               context?.issue?.id || 
               context?.issueId ||
               context?.extension?.issueId;
```

### 5. Data Format Mismatch
**Issue**: Admin panel and custom field UI used different data formats
**Solution**: 
- Implemented conversion functions between flat editing structure and nested UI structure
- `convertFromCustomFieldFormat()` and `convertToCustomFieldFormat()` functions

### 6. Save Button Visibility
**Issue**: Save button disappeared in certain contexts
**Solution**: 
- Ensured save button visibility across all contexts
- Added proper context detection for issue-view vs other contexts

## Key Implementation Details

### 1. Dynamic Dropdown Generation
- Dropdowns are generated dynamically based on JSON configuration
- Supports 3-level cascading (Category → Subcategory → Item)
- Options for dependent fields are updated based on parent selections

### 2. Admin Panel Functionality
- Provides UI to configure cascading dropdown structure
- Converts between flat editing format and nested storage format
- Saves configuration to Forge storage API

### 3. Field Value Persistence
- Field values are stored per issue using fieldKey and issueId
- Values are retrieved when editing existing issues
- Proper cleanup when field values are cleared

### 4. Error Handling
- Comprehensive error handling for API calls
- Fallback to default configuration when storage access fails
- User-friendly error messages

## Best Practices Implemented

### 1. Robust Context Handling
- Multiple fallbacks for accessing context data
- Logging of context structure for debugging
- Consistent handling across different Jira contexts

### 2. Storage Management
- Proper key naming conventions
- Error handling for storage operations
- Initialization with default values

### 3. UI/UX Considerations
- Loading states for async operations
- Success/error feedback for user actions
- Disabled states for dependent dropdowns
- Responsive form layout

### 4. Code Organization
- Separation of concerns between admin and field functionality
- Reusable conversion functions
- Consistent error handling patterns

## Testing Considerations

### 1. Context Testing
- Test in issue-view, issue-create, issue-transition, and issue-panel contexts
- Verify behavior differences between contexts (auto-close vs save button)

### 2. Data Flow Testing
- Verify configuration saving in admin panel
- Verify configuration loading in custom field UI
- Test field value persistence across issue operations

### 3. Edge Cases
- Empty configuration handling
- Missing context data scenarios
- Network error handling for storage operations

## Deployment Notes

### 1. Build Process
- Both admin and field UIs must be built
- Static assets must be properly copied to dist directories

### 2. Installation
- App must be installed on Jira site after deployment
- Custom field type must be added to screens where it should appear

### 3. Troubleshooting
- Check browser console for resolver errors
- Verify storage key consistency between admin and field UI
- Hard refresh Jira pages to clear cache after deployments

## Future Enhancements

### 1. Additional Features
- Clear button for individual dropdowns
- Form reset functionality
- Support for more than 3 cascade levels

### 2. Configuration Improvements
- Validation of admin panel configuration
- Sample configuration templates
- Import/export functionality

### 3. UI/UX Enhancements
- Improved admin panel interface
- Better error visualization
- Loading indicators for async operations