/**
 * 插件设置的数据形状。
 *
 * 约定：每个可配置项的存储路径（点分 key）与此结构一一对应，例如
 * `general.greeting`、`appearance.fontScale`。声明式设置页的每个 `control`
 * 都以这个点分路径作为 `key`，由 {@link PluginSettingTab.getControlValue} /
 * {@link PluginSettingTab.setControlValue} 读写。
 *
 * 分组只是「就近归类」——顶层的 general / appearance / paths / advanced 四组恰好
 * 对应设置页的四个页面（tab），但结构与页面并非强绑定，你可以自由重排。
 */

/** advanced 页「原生 list」演示用的一条书签。 */
export interface IBookmark {
	/** 展示名（list 每行的 text 控件绑定 `bookmarks.<i>.name`）。 */
	name: string;
	/** 目标路径（list 每行的 text 控件绑定 `bookmarks.<i>.path`）。 */
	path: string;
}

export interface IPluginSettings {
	/** 通用：toggle / text(+validate) / dropdown，以及依赖前者的 visible 联动项。 */
	general: {
		/** 总开关；关闭后 verboseLog 行通过 `visible` 谓词隐藏。 */
		enableFeature: boolean;
		/** 单行文本，带 `validate`（非空且 ≤ 20 字）。 */
		greeting: string;
		/** 下拉，取值受 dropdown 的 options 约束。 */
		mode: "simple" | "advanced";
		/** 仅在 enableFeature 为真时可见，演示 `visible` 联动。 */
		verboseLog: boolean;
	};
	/** 外观：color / slider(+displayFormat) / number(min/max/step)。 */
	appearance: {
		/** 颜色（HexString）。 */
		accentColor: string;
		/** 字号缩放，slider + displayFormat 显示百分比。 */
		fontScale: number;
		/** 最大条目数，number 控件（min/max/step）。 */
		maxItems: number;
	};
	/** 路径：file / folder(+includeRoot) / textarea(rows)。 */
	paths: {
		/** 模板文件路径（file 控件，带扩展名筛选）。 */
		templateFile: string;
		/** 输出文件夹路径（folder 控件）。 */
		outputFolder: string;
		/** 多行文本（textarea）。 */
		header: string;
	};
	/** 进阶：原生 list（书签）+ React 孤岛（标签）。 */
	advanced: {
		/** 原生 `type: "list"` 演示：可增删、拖拽排序，每行内嵌 text 控件。 */
		bookmarks: IBookmark[];
		/** React 孤岛演示：由 TagListEditor 通过 SettingsStore 自行读写。 */
		tags: string[];
	};
}

export const DEFAULT_SETTINGS: IPluginSettings = {
	general: {
		enableFeature: true,
		greeting: "Hello, Obsidian",
		mode: "simple",
		verboseLog: false,
	},
	appearance: {
		accentColor: "#7c3aed",
		fontScale: 1,
		maxItems: 20,
	},
	paths: {
		templateFile: "",
		outputFolder: "",
		header: "",
	},
	advanced: {
		bookmarks: [],
		tags: [],
	},
};
