import { LL } from "@src/i18n/i18n";
import { App, Modal, Setting } from "obsidian";

interface ConfirmModalOptions {
	title: string;
	message: string;
	/** 确认按钮文案；缺省用 common.confirm。 */
	confirmText?: string;
	/** 破坏性操作（删数据、难撤销）时把确认按钮渲染成 destructive 样式。 */
	destructive?: boolean;
	onConfirm: () => void | Promise<void>;
}

/**
 * 通用确认对话框。
 *
 * Obsidian 没有内置的确认框，破坏性操作（重置、删除）都需要自己弹一个，
 * 避免一次误点就丢数据。取消 = 直接关闭，不回调。
 */
export class ConfirmModal extends Modal {
	#options: ConfirmModalOptions;

	constructor(app: App, options: ConfirmModalOptions) {
		super(app);
		this.#options = options;
	}

	onOpen(): void {
		const { contentEl } = this;
		this.setTitle(this.#options.title);
		contentEl.createEl("p", { text: this.#options.message });

		new Setting(contentEl)
			.addButton((button) =>
				button
					.setButtonText(LL.common.cancel())
					.onClick(() => this.close()),
			)
			.addButton((button) => {
				button
					.setButtonText(
						this.#options.confirmText ?? LL.common.confirm(),
					)
					.onClick(() => {
						this.close();
						void this.#options.onConfirm();
					});
				// destructive + cta = 破坏性主操作（1.13 起取代已废弃的 setWarning）
				if (this.#options.destructive) {
					button.setDestructive();
				}
				button.setCta();
			});
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
