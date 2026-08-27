import { LL } from "@src/i18n/i18n";
import usePluginSettings from "@src/hook/usePluginSettings";
import useSettingsStore from "@src/hook/useSettingsStore";
import { useState } from "react";
import { Icon } from "./Icon";

/**
 * 标签编辑器（React 孤岛）。
 *
 * 演示两个 hook 的用途：
 * - `useSettingsStore()` 从 Context 取到唯一的 SettingsStore；
 * - `usePluginSettings(store)` 用 `useSyncExternalStore` 订阅设置快照，
 *   store 每次写入都会产生新对象引用并通知订阅者，于是本组件重渲染。
 *
 * ⚠ 与响应式读取有关的一处刻意取舍：
 * 有的插件（如 RHT）让孤岛只吃一次 `initialX` props、不订阅 store，是为了防止
 * 整页重渲染把用户从当前子页面弹出。但整页重渲染的真正元凶是设置页的
 * `settingTab.update()`——孤岛用 `useSyncExternalStore` 订阅时，只有孤岛自身
 * 重渲染，设置页 DOM 不受影响。因此这里用响应式写法：读取始终反映最新落盘值，
 * 落盘后无需手动同步本地状态。唯一要守住的红线是 **绝不在孤岛里调用
 * `settingTab.update()`**（那才会弹出子页面）。
 */
export function TagListEditor() {
	const store = useSettingsStore();
	const settings = usePluginSettings(store);
	const tags = settings.advanced.tags;
	const [draft, setDraft] = useState("");
	const T = LL.settings.advanced.tags;

	// 统一落盘入口：按点分路径写回 store（内部 saveData + 通知订阅者，
	// 但不触碰 settingTab，故不会整页重渲染）。
	const commit = (next: string[]) => {
		void store.updateSettingByPath("advanced.tags", next);
	};

	const addDraft = () => {
		const value = draft.trim();
		if (!value || tags.includes(value)) {
			setDraft("");
			return;
		}
		commit([...tags, value]);
		setDraft("");
	};

	return (
		<div className="ops-tags">
			<div className="ops-tags-head">
				{/* 标题由外层原生 group 的 heading 提供，这里只补说明与计数 */}
				<span className="ops-tags-desc">{T.desc()}</span>
				<span className="ops-tags-count">
					{T.count({ count: tags.length })}
				</span>
			</div>

			<input
				type="text"
				className="ops-tags-input"
				spellCheck={false}
				placeholder={T.placeholder()}
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						addDraft();
					}
				}}
			/>

			{tags.length === 0 ? (
				<div className="ops-tags-empty">{T.empty()}</div>
			) : (
				<div className="ops-tags-list">
					{tags.map((tag, i) => (
						<span className="ops-tag" key={tag}>
							{tag}
							<button
								className="ops-tag-remove clickable-icon"
								type="button"
								aria-label={LL.common.delete()}
								onClick={() =>
									commit(tags.filter((_, j) => j !== i))
								}
							>
								<Icon name="x" />
							</button>
						</span>
					))}
				</div>
			)}
		</div>
	);
}
