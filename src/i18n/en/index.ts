import type { BaseTranslation } from '../i18n-types'

const en = {
	common: {
		add: "Add",
		delete: "Delete",
		reset: "Reset",
		save: "Save",
		cancel: "Cancel",
		confirm: "Confirm",
		moveUp: "Move up",
		moveDown: "Move down",
	},
	settings: {
		general: {
			name: "General",
			desc: "Toggle, text and dropdown control examples",
			enableFeature: {
				name: "Enable feature",
				desc: "Master switch; turning it off hides \"Verbose log\" below",
			},
			greeting: {
				name: "Greeting",
				desc: "Single-line text, demonstrates validate (non-empty, at most 20 chars)",
				invalid: "Greeting must be non-empty and at most 20 characters",
			},
			mode: {
				name: "Mode",
				desc: "Dropdown selection, values constrained by options",
				simple: "Simple",
				advanced: "Advanced",
			},
			verboseLog: {
				name: "Verbose log",
				desc: "Visible only when \"Enable feature\" is on, demonstrates the visible predicate",
			},
		},
		appearance: {
			name: "Appearance",
			desc: "Color, slider and number control examples",
			accentColor: {
				name: "Accent color",
				desc: "Color control, stored as a hex value",
			},
			fontScale: {
				name: "Font scale",
				desc: "Slider, shown as a percentage via displayFormat",
			},
			maxItems: {
				name: "Max items",
				desc: "Number control with min / max / step",
			},
		},
		paths: {
			name: "Paths",
			desc: "File, folder and multi-line text control examples",
			templateFile: {
				name: "Template file",
				desc: "File path with a suggester (only Markdown files are suggested)",
			},
			outputFolder: {
				name: "Output folder",
				desc: "Folder path with a suggester",
			},
			header: {
				name: "Header text",
				desc: "Multi-line text area",
			},
		},
		advanced: {
			name: "Advanced",
			desc: "Native list, action button and React island examples",
			bookmarks: {
				name: "Bookmarks",
				desc: "Native list: add, delete and drag to reorder, edited through a dialog",
				add: "Add bookmark",
				empty: "No bookmarks yet, click the \"+\" in the top-right to add one",
				defaultName: "New bookmark {index}",
				noPath: "No path set",
				edit: "Edit",
				editTitle: "Edit bookmark",
				namePlaceholder: "Name",
				pathPlaceholder: "Path",
			},
			reset: {
				name: "Reset all settings",
				desc: "Restore all settings to their defaults",
				button: "Reset",
			},
			tags: {
				name: "Tags",
				desc: "React island: the component subscribes to SettingsStore and persists asynchronously",
				placeholder: "Type a tag and press Enter to add",
				empty: "No tags yet",
				count: "{count} total",
			},
		},
	},
} satisfies BaseTranslation;

export default en;
