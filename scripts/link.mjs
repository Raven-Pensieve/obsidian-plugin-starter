// scripts/link.mjs
// 创建软链接将 dist 目录链接到 Obsidian 插件目录（Windows 使用 junction，Linux/Mac 使用 dir）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// ==================== 路径常量 ====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
const projectRoot = path.resolve(__dirname, '../');
const distDir = path.join(projectRoot, 'dist');
const manifestPath = path.join(projectRoot, 'manifest.json');

// ==================== 主逻辑 ====================
// 检查 .env 文件
if (!fs.existsSync(envPath)) {
	console.error('❌ .env 文件未找到，请先创建 .env 文件并设置 VAULT_PATH。');
	process.exit(1);
}
dotenv.config({ path: envPath });

// 检查 VAULT_PATH
const VAULT_PATH = process.env.VAULT_PATH;
if (!VAULT_PATH) {
	console.error('❌ 未设置 VAULT_PATH，无法创建软链接。');
	console.error('请在 .env 文件中设置 VAULT_PATH=你的vault路径');
	process.exit(1);
}

const absVaultPath = path.resolve(VAULT_PATH);

// 确保 dist 目录存在
if (!fs.existsSync(distDir)) {
	fs.mkdirSync(distDir, { recursive: true });
}

// 确保 .hotreload 文件存在
const hotreloadPath = path.join(distDir, '.hotreload');
if (!fs.existsSync(hotreloadPath)) {
	fs.writeFileSync(hotreloadPath, '');
}

// 读取插件ID
if (!fs.existsSync(manifestPath)) {
	console.error('❌ manifest.json 文件未找到，无法获取插件ID。');
	process.exit(1);
}
let pluginId = '';
try {
	const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
	pluginId = manifest.id;
	if (!pluginId) throw new Error();
} catch {
	console.error('❌ 无法从 manifest.json 获取插件ID。');
	process.exit(1);
}

// 目标插件目录
const targetPluginDir = path.join(absVaultPath, '.obsidian', 'plugins', pluginId);

// 检查目标目录是否就是 dist 目录（避免循环链接）
if (path.resolve(targetPluginDir) === path.resolve(distDir)) {
	process.exit(0);
}

// 处理已存在的目标路径
if (fs.existsSync(targetPluginDir)) {
	try {
		const stats = fs.lstatSync(targetPluginDir);
		if (stats.isSymbolicLink()) {
			const linkTarget = fs.readlinkSync(targetPluginDir);
			const resolvedLinkTarget = path.resolve(path.dirname(targetPluginDir), linkTarget);
			if (resolvedLinkTarget === path.resolve(distDir)) {
				// 软链接已存在且正确，显示成功信息
				console.log(`✅ 链接成功！（dist → ${pluginId}）`);
				process.exit(0);
			}
		} else if (stats.isDirectory()) {
			// 如果是目录，检查是否有 data.json 文件
			const dataJsonPath = path.join(targetPluginDir, 'data.json');
			if (fs.existsSync(dataJsonPath)) {
				// 复制 data.json 到 dist 目录
				const distDataJsonPath = path.join(distDir, 'data.json');
				fs.copyFileSync(dataJsonPath, distDataJsonPath);
			}
		}
		// 删除已存在的路径（软链接、目录或文件）
		fs.rmSync(targetPluginDir, { recursive: true, force: true });
	} catch (err) {
		console.error(`❌ 处理目标路径时出错: ${err.message}`);
		process.exit(1);
	}
}

// 确保 .obsidian/plugins 目录存在
const pluginsDir = path.join(absVaultPath, '.obsidian', 'plugins');
if (!fs.existsSync(pluginsDir)) {
	fs.mkdirSync(pluginsDir, { recursive: true });
}

// 创建软链接
try {
	const linkType = process.platform === 'win32' ? 'junction' : 'dir';
	fs.symlinkSync(distDir, targetPluginDir, linkType);
	console.log(`✅ 链接成功！（dist → ${pluginId}）`);
} catch (err) {
	console.error(`❌ 创建软链接失败: ${err.message}`);
	process.exit(1);
}
