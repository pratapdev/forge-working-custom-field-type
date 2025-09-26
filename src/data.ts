export const CASCADE_DATA = {
	categories: [
		{
			name: 'Hardware',
			subcategories: [
				{ name: 'Laptop', items: ['Keyboard', 'Screen', 'Battery'] },
				{ name: 'Desktop', items: ['CPU', 'GPU', 'RAM'] },
			],
		},
		{
			name: 'Software',
			subcategories: [
				{ name: 'Operating System', items: ['Windows', 'macOS', 'Linux'] },
				{ name: 'Productivity', items: ['Word Processor', 'Spreadsheet', 'Presentation'] },
			],
		},
		{
			name: 'Networking',
			subcategories: [
				{ name: 'WiFi', items: ['Router', 'Access Point', 'Mesh Node'] },
				{ name: 'Wired', items: ['Switch', 'Patch Panel', 'Cable'] },
			],
		},
	],
} as const;
