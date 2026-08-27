import { LL } from "@src/i18n/i18n";
import { App, Modal, Setting } from "obsidian";
import type { IBookmark } from "./IPluginSettings";
import { FileSuggest } from "./suggest";

/**
 * 书签编辑对话框。
 *
 * 为什么用 Modal 而不是「列表行 → 可导航子页面」：
 * `type: "list"` 的删除按钮与拖拽把手是挂在列表行上的，而声明式设置页没有公开
 * 「返回上一层」的 API。若把每条记录做成子页面，用户在子页面里删掉自己所在的
 * 记录后就会停在一个已不存在的页面上。改用 Modal 后编辑始终发生在列表页之上，
 * 删除天然回到列表，不需要任何导航技巧。（这也是 meta-bind 等插件的做法。）
 *
 * 编辑在草稿副本上进行，只有点「保存」才回调；取消 = 丢弃。
 */
export class BookmarkEditModal extends Modal {
	#draft: IBookmark;
	#onSubmit: (value: IBookmark) => void;
	#pathSuggest?: FileSuggest;

	constructor(
		app: App,
		bookmark: IBookmark,
		onSubmit: (value: IBookmark) => void,
	) {
		super(app);
		this.#draft = { ...bookmark };
		this.#onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;
		const T = LL.settings.advanced.bookmarks;
		this.setTitle(T.editTitle());

		new Setting(contentEl).setName(T.namePlaceholder()).addText((text) =>
			text
				.setPlaceholder(T.namePlaceholder())
				.setValue(this.#draft.name)
				.onChange((value) => {
					this.#draft.name = value;
				}),
		);

		new Setting(contentEl).setName(T.pathPlaceholder()).addText((text) => {
			text.setPlaceholder(T.pathPlaceholder())
				.setValue(this.#draft.path)
				.onChange((value) => {
					this.#draft.path = value;
				});
			// Modal 里没有声明式 file 控件可用，改用 suggest.ts 里的联想器
			// 手动挂到输入框上（这也是自定义 UI 里获得路径联想的通用做法）
			this.#pathSuggest = new FileSuggest(
				this.app,
				text.inputEl,
				(path) => {
					this.#draft.path = path;
					text.setValue(path);
				},
			);
		});

		new Setting(contentEl)
			.addButton((button) =>
				button
					.setButtonText(LL.common.cancel())
					.onClick(() => this.close()),
			)
			.addButton((button) =>
				button
					.setButtonText(LL.common.save())
					.setCta()
					.onClick(() => {
						this.close();
						this.#onSubmit({ ...this.#draft });
					}),
			);
	}

	onClose(): void {
		this.#pathSuggest?.close();
		this.#pathSuggest = undefined;
		this.contentEl.empty();
	}
}
