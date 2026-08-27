import type { BaseTranslation } from '../i18n-types'

const zh = {
	common: {
		add: "添加",
		delete: "删除",
		reset: "重置",
		save: "保存",
		cancel: "取消",
		confirm: "确定",
		moveUp: "上移",
		moveDown: "下移",
	},
	settings: {
		general: {
			name: "通用",
			desc: "开关、文本与下拉等基础控件示例",
			enableFeature: {
				name: "启用功能",
				desc: "总开关；关闭后下方「详细日志」会隐藏",
			},
			greeting: {
				name: "问候语",
				desc: "单行文本，演示 validate（非空且不超过 20 字）",
				invalid: "问候语不能为空且不超过 20 个字符",
			},
			mode: {
				name: "模式",
				desc: "下拉选择，取值受 options 约束",
				simple: "简单",
				advanced: "高级",
			},
			verboseLog: {
				name: "详细日志",
				desc: "仅当「启用功能」开启时可见，演示 visible 联动",
			},
		},
		appearance: {
			name: "外观",
			desc: "颜色、滑块与数字控件示例",
			accentColor: {
				name: "强调色",
				desc: "颜色控件，存储为十六进制色值",
			},
			fontScale: {
				name: "字号缩放",
				desc: "滑块，通过 displayFormat 以百分比显示",
			},
			maxItems: {
				name: "最大条目数",
				desc: "数字控件，限定 min / max / step",
			},
		},
		paths: {
			name: "路径",
			desc: "文件、文件夹与多行文本控件示例",
			templateFile: {
				name: "模板文件",
				desc: "文件路径，带联想选择器（仅联想 Markdown 文件）",
			},
			outputFolder: {
				name: "输出文件夹",
				desc: "文件夹路径，带联想选择器",
			},
			header: {
				name: "页首文本",
				desc: "多行文本框",
			},
		},
		advanced: {
			name: "进阶",
			desc: "原生列表、动作按钮与 React 孤岛示例",
			bookmarks: {
				name: "书签",
				desc: "原生 list：可增删、拖拽排序，编辑走对话框",
				add: "添加书签",
				empty: "暂无书签，点击右上角「+」添加",
				defaultName: "新书签 {index}",
				noPath: "未设置路径",
				edit: "编辑",
				editTitle: "编辑书签",
				namePlaceholder: "名称",
				pathPlaceholder: "路径",
			},
			reset: {
				name: "重置全部设置",
				desc: "把所有设置恢复为默认值",
				button: "重置",
			},
			tags: {
				name: "标签",
				desc: "React 孤岛：组件自行订阅 SettingsStore 并异步落盘",
				placeholder: "输入标签后回车添加",
				empty: "暂无标签",
				count: "共 {count} 个",
			},
		},
	},
} satisfies BaseTranslation;

export default zh;
