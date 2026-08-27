import { SettingsStoreContext } from "@src/context/SettingsStoreContext";
import { LL } from "@src/i18n/i18n";
import CPlugin from "@src/main";
import { Objects } from "@src/util/Objects";
import {
	PluginSettingTab as ObPluginSettingTab,
	type Setting,
	type SettingDefinitionItem,
	type SettingDefinitionList,
	type SettingDefinitionPage,
	type SettingDefinitionRender,
	type TFile,
} from "obsidian";
import type { ReactNode } from "react";
import { BookmarkEditModal } from "./BookmarkEditModal";
import { ConfirmModal } from "./ConfirmModal";
import { TagListEditor } from "./components/TagListEditor";
import { DEFAULT_SETTINGS, type IBookmark } from "./IPluginSettings";
import { reactSetting } from "./reactSetting";

/**
 * 让同级页面名互不重复。
 *
 * 声明式设置页把页面名当作同级行的 key（`page:<name>`）。重名时框架会在控制台报
 * `duplicate page name` / `duplicate setting key`，重渲染时行会互相覆盖，删除按钮
 * 与拖拽把手也可能一起失效。所以凡是由用户数据生成的页面名（列表条目、动态分组），
 * 都要先在这里去重：出现多次的名字补上序号。
 */
function uniqueSiblingNames(names: readonly string[]): string[] {
	const occurrences = new Map<string, number>();
	for (const name of names) {
		occurrences.set(name, (occurrences.get(name) ?? 0) + 1);
	}
	return names.map((name, index) =>
		(occurrences.get(name) ?? 0) > 1 ? `${name} (${index + 1})` : name,
	);
}

/**
 * 声明式设置页（Obsidian 1.13+）。
 *
 * 与 1.13 之前的写法（重写 `display()`，自己 createEl / new Setting(...) 或挂一个
 * 整页 React root）相比，声明式路线只需描述「有哪些设置项」，渲染、布局、搜索索引、
 * 移动端适配全部交给框架：
 *
 * - {@link getSettingDefinitions} 返回结构：本模板返回 4 个 `type: "page"`，
 *   即设置页里的 4 个「tab」。桌面端点进去是子页面并带返回按钮，移动端是下钻列表，
 *   设置搜索框能直接命中子页面里的项。加一个 tab = 加一个 `private xxxPage()`。
 * - {@link getControlValue} / {@link setControlValue} 负责「读/写」：控件只声明
 *   一个点分路径 `key`，值从哪来、写到哪去由这两个方法决定。
 *
 * 重渲染的三档成本（选错会让用户被弹出当前子页面）：
 * 1. 什么都不调 —— React 孤岛内部自行管状态与落盘，见 {@link island}；
 * 2. {@link refreshDomState} —— 只重算 `visible` / `disabled` 谓词并原地切 CSS 状态，
 *    廉价、不重建 DOM。{@link setControlValue} 每次写入后都调它；
 * 3. {@link update} —— 重新求值 `getSettingDefinitions()` 并整页重建，只在条目
 *    增删这类结构性变化时用（见 {@link bookmarkList} 与 {@link confirmReset}）。
 */
export class PluginSettingTab extends ObPluginSettingTab {
	plugin: CPlugin;
	icon: string = "settings";

	constructor(plugin: CPlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	// ==================== 框架入口 ====================

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			this.generalPage(),
			this.appearancePage(),
			this.pathsPage(),
			this.advancedPage(),
		];
	}

	/** 每次渲染 `control` 行时调用，把控件的点分 key 解析到 plugin.settings。 */
	getControlValue(key: string): unknown {
		return Objects.getByPath(this.plugin.settings, key);
	}

	/**
	 * 用户改动 `control` 行时调用。
	 *
	 * 统一走 SettingsStore：落盘之外还会通知订阅者，React 孤岛（useSyncExternalStore）
	 * 因此能感知设置页的修改。写完调 refreshDomState() 重算联动谓词。
	 */
	async setControlValue(key: string, value: unknown): Promise<void> {
		await this.plugin.settingsStore.updateSettingByPath(key, value);
		this.refreshDomState();
	}

	// ==================== 页面（tab） ====================

	/** 通用：toggle / text(+validate) / dropdown，以及 visible 联动。 */
	private generalPage(): SettingDefinitionPage {
		const T = LL.settings.general;
		const general = () => this.plugin.settings.general;

		return {
			type: "page",
			name: T.name(),
			desc: T.desc(),
			// 在入口行右侧顺带显示当前值，用户不必点进去看
			displayValue: () => T.mode[general().mode](),
			// 需要用户注意时给个警示徽标（此处以「功能被关掉」为例）
			status: () => (general().enableFeature ? null : "warning"),
			items: [
				{
					name: T.enableFeature.name(),
					desc: T.enableFeature.desc(),
					control: {
						type: "toggle" as const,
						key: "general.enableFeature",
						defaultValue: DEFAULT_SETTINGS.general.enableFeature,
					},
				},
				{
					name: T.greeting.name(),
					desc: T.greeting.desc(),
					control: {
						type: "text" as const,
						key: "general.greeting",
						defaultValue: DEFAULT_SETTINGS.general.greeting,
						// 返回非空字符串 = 拒绝这次改动，并在行下方显示内联错误。
						// 挂载时也会跑一次，能提示「已存的旧值不合法」但不会改它。
						validate: (value: string) =>
							value.trim() !== "" && value.length <= 20
								? undefined
								: T.greeting.invalid(),
					},
				},
				{
					name: T.mode.name(),
					desc: T.mode.desc(),
					control: {
						type: "dropdown" as const,
						key: "general.mode",
						defaultValue: DEFAULT_SETTINGS.general.mode,
						options: {
							simple: T.mode.simple(),
							advanced: T.mode.advanced(),
						},
					},
				},
				{
					name: T.verboseLog.name(),
					desc: T.verboseLog.desc(),
					// visible 每次渲染求值：总开关变化后由 setControlValue 里的
					// refreshDomState() 立刻重算，无需整页重建
					visible: () => general().enableFeature,
					control: {
						type: "toggle" as const,
						key: "general.verboseLog",
						defaultValue: DEFAULT_SETTINGS.general.verboseLog,
					},
				},
			],
		};
	}

	/** 外观：color / slider(+displayFormat) / number(min/max/step) + disabled 谓词。 */
	private appearancePage(): SettingDefinitionPage {
		const T = LL.settings.appearance;
		const appearance = () => this.plugin.settings.appearance;

		return {
			type: "page",
			name: T.name(),
			desc: T.desc(),
			displayValue: () => appearance().accentColor,
			items: [
				{
					name: T.accentColor.name(),
					desc: T.accentColor.desc(),
					control: {
						type: "color" as const,
						key: "appearance.accentColor",
						defaultValue: DEFAULT_SETTINGS.appearance.accentColor,
					},
				},
				{
					name: T.fontScale.name(),
					desc: T.fontScale.desc(),
					control: {
						type: "slider" as const,
						key: "appearance.fontScale",
						defaultValue: DEFAULT_SETTINGS.appearance.fontScale,
						min: 0.8,
						max: 1.6,
						step: 0.05,
						// 滑块旁的行内数值展示；返回空串可完全隐藏
						displayFormat: (value: number) =>
							`${Math.round(value * 100)}%`,
					},
				},
				{
					name: T.maxItems.name(),
					desc: T.maxItems.desc(),
					// disabled 与 visible 同样每次渲染求值：这里选择「禁用」而非
					// 「隐藏」，让用户知道有这个选项、只是当前不可用
					disabled: () => !this.plugin.settings.general.enableFeature,
					control: {
						type: "number" as const,
						key: "appearance.maxItems",
						defaultValue: DEFAULT_SETTINGS.appearance.maxItems,
						min: 1,
						max: 100,
						step: 1,
					},
				},
			],
		};
	}

	/** 路径：file / folder / textarea，两个带联想选择器的控件。 */
	private pathsPage(): SettingDefinitionPage {
		const T = LL.settings.paths;

		return {
			type: "page",
			name: T.name(),
			desc: T.desc(),
			items: [
				{
					name: T.templateFile.name(),
					desc: T.templateFile.desc(),
					control: {
						type: "file" as const,
						key: "paths.templateFile",
						defaultValue: DEFAULT_SETTINGS.paths.templateFile,
						// 存的是含扩展名的完整路径，读取时用 vault.getFileByPath() 还原
						filter: (file: TFile) => file.extension === "md",
					},
				},
				{
					name: T.outputFolder.name(),
					desc: T.outputFolder.desc(),
					control: {
						type: "folder" as const,
						key: "paths.outputFolder",
						defaultValue: DEFAULT_SETTINGS.paths.outputFolder,
						// 是否把库根目录也作为候选项（默认 false）
						includeRoot: true,
					},
				},
				{
					name: T.header.name(),
					desc: T.header.desc(),
					control: {
						type: "textarea" as const,
						key: "paths.header",
						defaultValue: DEFAULT_SETTINGS.paths.header,
						rows: 4,
					},
				},
			],
		};
	}

	/** 进阶：原生 list + action 行 + React 孤岛。 */
	private advancedPage(): SettingDefinitionPage {
		const T = LL.settings.advanced;

		return {
			type: "page",
			name: T.name(),
			desc: T.desc(),
			items: [
				this.bookmarkList(),
				{
					// group：一组设置共享一个小标题，纯展示分区，不带增删语义
					type: "group",
					heading: T.tags.name(),
					items: [
						// render 行（React 孤岛）：声明式控件搞不定的复杂交互交给 React
						this.island(T.tags.name(), () => <TagListEditor />),
					],
				},
				{
					// action 行：整行可点，适合「立即执行某个操作」
					name: T.reset.name(),
					desc: T.reset.desc(),
					action: () => this.confirmReset(),
				},
			],
		};
	}

	// ==================== 集合与辅助 ====================

	/**
	 * 原生 `type: "list"`：用户可增删、拖拽排序的集合。
	 *
	 * 一条数据有多个字段时，**不要**把每行做成可导航子页面：删除按钮与拖拽把手是挂
	 * 在列表行上的，而声明式设置页没有公开「返回上一层」的 API——用户在子页面里删掉
	 * 自己所在的那条记录后会停在一个已不存在的页面上。正确做法是列表行只做摘要
	 * （name + desc + 一个编辑按钮），多字段编辑交给 Modal（见 {@link BookmarkEditModal}），
	 * 于是删除天然发生在列表页上。
	 *
	 * 三种重渲染成本的对比：增删排序改的是数组结构 → 必须 `update()`；改单个值 →
	 * `setControlValue` 里的 `refreshDomState()` 就够；React 孤岛（{@link island}）
	 * 自己管状态 → 什么都不用调。
	 */
	private bookmarkList(): SettingDefinitionList {
		const T = LL.settings.advanced.bookmarks;
		const bookmarks = this.plugin.settings.advanced.bookmarks;
		// 行名同时是行的 key（框架内部记作 `setting:<name>` / `page:<name>`），同级
		// 重名会让行在重渲染时互相覆盖，并连带丢掉删除按钮与拖拽把手。凡是由用户
		// 数据生成的名字都要先过 uniqueSiblingNames 去重。
		const labels = uniqueSiblingNames(
			bookmarks.map((bookmark, index) =>
				bookmark.name.trim() === ""
					? T.defaultName({ index: index + 1 })
					: bookmark.name.trim(),
			),
		);

		return {
			type: "list",
			heading: T.name(),
			emptyState: T.empty(),
			items: bookmarks.map((bookmark, index) => ({
				name: labels[index],
				desc: bookmark.path.trim() || T.noPath(),
				// 路径也参与设置搜索，但不占用显示位置
				aliases: [bookmark.path],
				// render 行不止能挂 React（见 island）：直接用 Setting 的命令式 API
				// 往行尾加按钮，同样是 SettingDefinitionRender
				render: (setting: Setting) => {
					setting.addExtraButton((button) =>
						button
							.setIcon("pencil")
							.setTooltip(T.edit())
							.onClick(() => this.openBookmarkEditor(index)),
					);
				},
			})),
			// 桌面端渲染为列表头部的 “+” 按钮，移动端为列表下方的 “+ 名称” 行。
			// 新条目预填一个不重名的默认名，避免多条空名撞成同一个 key
			addItem: {
				name: T.add(),
				action: () =>
					void this.writeBookmarks([
						...bookmarks,
						{
							name: T.defaultName({
								index: bookmarks.length + 1,
							}),
							path: "",
						},
					]),
			},
			// 传了 onDelete 才会出现删除按钮（并支持 Delete/Backspace 快捷键）
			onDelete: (index: number) =>
				void this.writeBookmarks(
					bookmarks.filter((_, i) => i !== index),
				),
			// 传了 onReorder 才会出现拖拽手柄
			onReorder: (oldIndex: number, newIndex: number) => {
				const next = [...bookmarks];
				const [moved] = next.splice(oldIndex, 1);
				next.splice(newIndex, 0, moved);
				void this.writeBookmarks(next);
			},
		};
	}

	/** 结构性写入：条目增删/换序后必须 update() 重建定义。 */
	private async writeBookmarks(next: readonly IBookmark[]): Promise<void> {
		await this.plugin.settingsStore.updateSettingByPath(
			"advanced.bookmarks",
			[...next],
		);
		this.update();
	}

	/** 打开单条书签的编辑对话框；确认后整条替换并重建列表。 */
	private openBookmarkEditor(index: number): void {
		const bookmarks = this.plugin.settings.advanced.bookmarks;
		const current = bookmarks[index];
		if (!current) return;
		new BookmarkEditModal(this.plugin.app, current, (next) => {
			void this.writeBookmarks(
				bookmarks.map((item, i) => (i === index ? next : item)),
			);
		}).open();
	}

	/** 破坏性操作先确认，避免一次误点丢掉全部配置。 */
	private confirmReset(): void {
		const T = LL.settings.advanced.reset;
		new ConfirmModal(this.plugin.app, {
			title: T.name(),
			message: T.desc(),
			confirmText: T.button(),
			destructive: true,
			onConfirm: async () => {
				await this.plugin.settingsStore.updateSettings(
					structuredClone(DEFAULT_SETTINGS),
				);
				this.update();
			},
		}).open();
	}

	/**
	 * 把 React 组件挂成一行设置（React 孤岛）。
	 *
	 * 在挂载点包一层 SettingsStoreContext.Provider，孤岛内部即可用
	 * `useSettingsStore()` / `usePluginSettings()` 读写设置，无需层层传 props。
	 * 孤岛自行订阅 store 并异步落盘，**不要**在其中调用 `this.update()`。
	 */
	private island(
		name: string,
		node: () => ReactNode,
	): SettingDefinitionRender {
		return reactSetting(name, () => (
			<SettingsStoreContext.Provider value={this.plugin.settingsStore}>
				{node()}
			</SettingsStoreContext.Provider>
		));
	}
}
