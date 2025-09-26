// Instead of importing JSON directly, we'll define the data structure here
export const DYNAMIC_CASCADE_DATA = {
  "fields": [
    {
      "id": "category",
      "label": "Category",
      "type": "dropdown",
      "required": true,
      "options": [
        {
          "value": "hardware",
          "label": "Hardware",
          "children": "subcategory"
        },
        {
          "value": "software",
          "label": "Software",
          "children": "subcategory"
        },
        {
          "value": "network",
          "label": "Network",
          "children": "subcategory"
        }
      ]
    },
    {
      "id": "subcategory",
      "label": "Subcategory",
      "type": "dropdown",
      "required": true,
      "options": [],
      "dependsOn": "category"
    },
    {
      "id": "item",
      "label": "Item",
      "type": "dropdown",
      "required": false,
      "options": [],
      "dependsOn": "subcategory"
    }
  ],
  "optionData": {
    "hardware": [
      {
        "value": "laptop",
        "label": "Laptop",
        "children": "item"
      },
      {
        "value": "desktop",
        "label": "Desktop",
        "children": "item"
      },
      {
        "value": "server",
        "label": "Server",
        "children": "item"
      }
    ],
    "software": [
      {
        "value": "os",
        "label": "Operating System",
        "children": "item"
      },
      {
        "value": "application",
        "label": "Application",
        "children": "item"
      }
    ],
    "network": [
      {
        "value": "router",
        "label": "Router",
        "children": "item"
      },
      {
        "value": "switch",
        "label": "Switch",
        "children": "item"
      }
    ],
    "laptop": [
      {
        "value": "dell",
        "label": "Dell"
      },
      {
        "value": "hp",
        "label": "HP"
      },
      {
        "value": "lenovo",
        "label": "Lenovo"
      }
    ],
    "desktop": [
      {
        "value": "dell",
        "label": "Dell"
      },
      {
        "value": "hp",
        "label": "HP"
      },
      {
        "value": "lenovo",
        "label": "Lenovo"
      }
    ],
    "server": [
      {
        "value": "dell",
        "label": "Dell"
      },
      {
        "value": "hp",
        "label": "HP"
      },
      {
        "value": "ibm",
        "label": "IBM"
      }
    ],
    "os": [
      {
        "value": "windows",
        "label": "Windows"
      },
      {
        "value": "linux",
        "label": "Linux"
      },
      {
        "value": "macos",
        "label": "macOS"
      },
	  {
		"value": "android",
        "label": "Android"
	  }
    ],
    "application": [
      {
        "value": "office",
        "label": "Microsoft Office"
      },
      {
        "value": "adobe",
        "label": "Adobe Creative Suite"
      }
    ],
    "router": [
      {
        "value": "cisco",
        "label": "Cisco"
      },
      {
        "value": "juniper",
        "label": "Juniper"
      }
    ],
    "switch": [
      {
        "value": "cisco",
        "label": "Cisco"
      },
      {
        "value": "hp",
        "label": "HP"
      }
    ]
  }
};