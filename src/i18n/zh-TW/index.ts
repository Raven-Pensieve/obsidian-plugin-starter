import type { BaseTranslation } from '../i18n-types'

const zh_TW = {
	common: {
		add: "新增",
		delete: "刪除",
		reset: "重設",
		save: "儲存",
		cancel: "取消",
		confirm: "確定",
		moveUp: "上移",
		moveDown: "下移",
	},
	settings: {
		general: {
			name: "一般",
			desc: "開關、文字與下拉等基礎控制項範例",
			enableFeature: {
				name: "啟用功能",
				desc: "總開關；關閉後下方「詳細日誌」會隱藏",
			},
			greeting: {
				name: "問候語",
				desc: "單行文字，示範 validate（非空且不超過 20 字）",
				invalid: "問候語不能為空且不超過 20 個字元",
			},
			mode: {
				name: "模式",
				desc: "下拉選擇，取值受 options 約束",
				simple: "簡單",
				advanced: "進階",
			},
			verboseLog: {
				name: "詳細日誌",
				desc: "僅當「啟用功能」開啟時可見，示範 visible 連動",
			},
		},
		appearance: {
			name: "外觀",
			desc: "顏色、滑桿與數字控制項範例",
			accentColor: {
				name: "強調色",
				desc: "顏色控制項，儲存為十六進位色值",
			},
			fontScale: {
				name: "字級縮放",
				desc: "滑桿，透過 displayFormat 以百分比顯示",
			},
			maxItems: {
				name: "最大項目數",
				desc: "數字控制項，限定 min / max / step",
			},
		},
		paths: {
			name: "路徑",
			desc: "檔案、資料夾與多行文字控制項範例",
			templateFile: {
				name: "範本檔案",
				desc: "檔案路徑，帶聯想選擇器（僅聯想 Markdown 檔案）",
			},
			outputFolder: {
				name: "輸出資料夾",
				desc: "資料夾路徑，帶聯想選擇器",
			},
			header: {
				name: "頁首文字",
				desc: "多行文字框",
			},
		},
		advanced: {
			name: "進階",
			desc: "原生清單、動作按鈕與 React 孤島範例",
			bookmarks: {
				name: "書籤",
				desc: "原生 list：可新增刪除、拖曳排序，編輯走對話框",
				add: "新增書籤",
				empty: "尚無書籤，點擊右上角「+」新增",
				defaultName: "新書籤 {index}",
				noPath: "未設定路徑",
				edit: "編輯",
				editTitle: "編輯書籤",
				namePlaceholder: "名稱",
				pathPlaceholder: "路徑",
			},
			reset: {
				name: "重設全部設定",
				desc: "把所有設定恢復為預設值",
				button: "重設",
			},
			tags: {
				name: "標籤",
				desc: "React 孤島：元件自行訂閱 SettingsStore 並非同步落盤",
				placeholder: "輸入標籤後按 Enter 新增",
				empty: "尚無標籤",
				count: "共 {count} 個",
			},
		},
	},
} satisfies BaseTranslation;

export default zh_TW;
