import { setIcon } from "obsidian";
import { useEffect, useRef } from "react";

/**
 * 用 Obsidian 内置 setIcon 渲染一个 Lucide 图标。
 *
 * 走内置图标集而非引入 lucide-react，能与用户主题保持一致，也避免把整个图标库
 * 打进产物。`name` 变化时重新渲染。
 */
export function Icon({ name }: { name: string }) {
	const ref = useRef<HTMLSpanElement>(null);
	useEffect(() => {
		if (ref.current) {
			setIcon(ref.current, name);
		}
	}, [name]);
	return <span className="ops-icon" ref={ref} />;
}
