const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const pkg = require('../package.json');

const UI_DIR = path.resolve(__dirname, '../../ui');
const APP_PUBLIC_DIR = path.resolve(__dirname, '../dist/ui');

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`  ✓ 已清理: ${dir}`);
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

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

function main() {
  console.log('=== 开始构建 UI ===\n');

  // 1. 构建 UI 项目
  console.log('[1/2] 编译 UI 项目...');
  try {
    execSync('npm i && npm run build', {
      cwd: UI_DIR,
      stdio: 'inherit',
    });
    console.log('  ✓ UI 编译成功\n');
  } catch (err) {
    console.error('  ✗ UI 编译失败:', err.message);
    process.exit(1);
  }

  //更新版本
  const htmlPath = path.resolve(UI_DIR, 'dist/index.html');
  let html = fs.readFileSync(htmlPath, 'utf-8');

  const title = `Envm ${pkg.version}`;
  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`✅ HTML title updated to: ${title}`);


  // 2. 复制 dist → app/public
  const uiDistDir = path.join(UI_DIR, 'dist');
  if (!fs.existsSync(uiDistDir)) {
    console.error('  ✗ 未找到 UI 构建输出目录 (dist)');
    process.exit(1);
  }

  console.log(`[2/2] 复制 dist 到 ${APP_PUBLIC_DIR}...`);
  cleanDir(APP_PUBLIC_DIR);
  copyDir(uiDistDir, APP_PUBLIC_DIR);
  console.log('  ✓ 复制完成\n');

  console.log('=== UI 构建完成 ===');
}

main();
