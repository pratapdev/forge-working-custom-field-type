import Resolver from '@forge/resolver';
import { storage } from '@forge/api';
import { CASCADE_DATA } from './data';
import { validateCascadingField, FieldValue } from './validation';

// Define proper interfaces for type safety
interface RequestContext {
	extension?: {
		issue?: {
			id?: string;
		};
		fieldKey?: string;
		field?: {
			key?: string;
			value?: any;
		};
		issueId?: string;
		renderContext?: string;
	};
	issueId?: string;
	fieldKey?: string;
	issue?: {
		id?: string;
	};
	renderContext?: string;
	fieldValue?: any;
	value?: any;
}

interface ResolverRequest {
	context?: RequestContext;
	payload?: FieldValue | null;
}

interface ValidationError {
	field: string;
	message: string;
}

interface ValidateResponse {
	errors: ValidationError[];
}

interface SaveResponse {
	success: boolean;
}

const resolver = new Resolver();

function makeStorageKey(issueId: string, fieldKey: string): string {
	return `field-value:${fieldKey}:issue:${issueId}`;
}

resolver.define('edit', async (req: ResolverRequest) => {
	const context = req.context;
	console.log('Edit resolver context:', JSON.stringify(context, null, 2));
	
	// Try multiple ways to get issueId and fieldKey for compatibility
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
		return { value: null };
	}
	
	const key = makeStorageKey(String(issueId), String(fieldKey));
	try {
		const value = await storage.get(key);
		console.log('Retrieved value from storage:', value);
		return { value: value || null };
	} catch (error) {
		console.error('Error retrieving value from storage:', error);
		return { value: null };
	}
});

resolver.define('view', async (req: ResolverRequest) => {
	const context = req.context;
	console.log('View resolver context:', JSON.stringify(context, null, 2));
	
	// Try multiple ways to get issueId and fieldKey for compatibility
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
		return { value: null };
	}
	
	const key = makeStorageKey(String(issueId), String(fieldKey));
	try {
		const value = await storage.get(key);
		console.log('Retrieved value from storage:', value);
		return { value: value || null };
	} catch (error) {
		console.error('Error retrieving value from storage:', error);
		return { value: null };
	}
});

resolver.define('validate', async (req: ResolverRequest): Promise<ValidateResponse> => {
	const payload = req.payload || null;
	const errors = validateCascadingField(payload);
	return { errors };
});

resolver.define('save', async (req: ResolverRequest): Promise<SaveResponse> => {
	const context = req.context;
	const payload = req.payload;
	console.log('Save resolver context:', JSON.stringify(context, null, 2));
	console.log('Save payload:', payload);
	
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
	
	const key = makeStorageKey(String(issueId), String(fieldKey));
	try {
		// Store the payload directly as the original code did
		await storage.set(key, payload as any);
		console.log('Saved value to storage:', payload);
		return { success: true };
	} catch (error) {
		console.error('Error saving value to storage:', error);
		return { success: false };
	}
});

resolver.define('clear', async (req: ResolverRequest): Promise<SaveResponse> => {
	const context = req.context;
	console.log('Clear resolver context:', JSON.stringify(context, null, 2));
	
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
	
	const key = makeStorageKey(String(issueId), String(fieldKey));
	try {
		await storage.delete(key);
		console.log('Cleared value from storage for key:', key);
		return { success: true };
	} catch (error) {
		console.error('Error clearing value from storage:', error);
		return { success: false };
	}
});

resolver.define('getData', async () => {
	return CASCADE_DATA;
});

export const run = resolver.getDefinitions();