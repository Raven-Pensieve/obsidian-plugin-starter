// scripts/copy.mjs
// 将 dist 目录的构建产物等文件复制到 Obsidian 插件目录
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// ==================== 路径常量 ====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
const distDir = path.join(__dirname, '../dist');
const manifestPath = path.join(distDir, 'manifest.json');

// ==================== 工具函数 ====================
// 递归复制目录
function copyDir(src, dest) {
	fs.mkdirSync(dest, { recursive: true });
	
	const entries = fs.readdirSync(src, { withFileTypes: true });
	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);
		
		if (entry.isDirectory()) {
			copyDir(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

// ==================== 主逻辑 ====================
// 检查 .env 文件
if (!fs.existsSync(envPath)) {
	process.exit(0);
}
dotenv.config({ path: envPath });

// 检查 VAULT_PATH
const VAULT_PATH = process.env.VAULT_PATH;
if (!VAULT_PATH) {
	console.error('❌ 未设置 VAULT_PATH，无法复制文件。');
	console.error('请在 .env 文件中设置 VAULT_PATH=你的vault路径');
	process.exit(1);
}
const absVaultPath = path.resolve(VAULT_PATH);

// 检查 dist 目录
if (!fs.existsSync(distDir)) {
	console.error(`❌ dist 目录未找到，请先运行构建命令: ${distDir}`);
	process.exit(1);
}

// 确保 .hotreload 文件存在
const hotreloadPath = path.join(distDir, '.hotreload');
if (!fs.existsSync(hotreloadPath)) {
	fs.writeFileSync(hotreloadPath, '');
}

// 读取插件ID
if (!fs.existsSync(manifestPath)) {
	console.error(`❌ manifest.json 文件未找到，无法获取插件ID。请先运行构建命令: ${manifestPath}`);
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

// 准备目标目录
const pluginDir = path.join(absVaultPath, '.obsidian', 'plugins', pluginId);

// 检查目标目录是否就是 dist 目录（避免递归复制）
if (path.resolve(pluginDir) === path.resolve(distDir)) {
	process.exit(0);
}

if (fs.existsSync(pluginDir)) {
	try {
		// 如果目标路径是一个已存在的目录，优先把其中的 data.json 复制回 dist
		const stats = fs.lstatSync(pluginDir);
		if (stats.isDirectory()) {
			const dataJsonPath = path.join(pluginDir, 'data.json');
			if (fs.existsSync(dataJsonPath)) {
				const distDataJsonPath = path.join(distDir, 'data.json');
				try {
					fs.copyFileSync(dataJsonPath, distDataJsonPath);
				} catch (err) {
					console.error(`⚠ 备份 data.json 到 dist 失败: ${err.message}`);
				}
			}
		}

		fs.rmSync(pluginDir, { recursive: true, force: true });
	} catch (err) {
		console.error(`❌ 处理目标路径时出错: ${err.message}`);
		process.exit(1);
	}
}
try {
	fs.mkdirSync(pluginDir, { recursive: true });
} catch (err) {
	console.error(`❌ 创建插件目录失败: ${err.message}`);
	process.exit(1);
}

// 复制文件
const distFiles = fs.readdirSync(distDir).sort();
try {
	copyDir(distDir, pluginDir);
	const fileList = distFiles.join('、');
	console.log(`✅ 复制成功！（${fileList}）`);
} catch (err) {
	console.error(`❌ 复制失败: ${err.message}`);
	process.exit(1);
}
