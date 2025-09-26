// Shared validation logic for the cascading field
export interface FieldValue {
	category?: string;
	subcategory?: string;
	item?: string;
}

export interface ValidationError {
	field: string;
	message: string;
}

/**
 * Validates the cascading field value
 * @param value The field value to validate
 * @returns Array of validation errors
 */
export function validateCascadingField(value: FieldValue | null): ValidationError[] {
	const errors: ValidationError[] = [];
	
	if (!value) {
		return errors;
	}
	
	const { category, subcategory, item } = value;
	
	if (category && !subcategory) {
		errors.push({ 
			field: 'subcategory', 
			message: 'Subcategory is required once a Category is selected.' 
		});
	}
	
	if (subcategory && !item) {
		errors.push({ 
			field: 'item', 
			message: 'Item is required once a Subcategory is selected.' 
		});
	}
	
	return errors;
}