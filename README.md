# ENVM — Environment Manager

> 一款基于 Electron 的桌面端环境版本管理器，支持多运行时环境的版本浏览、下载、切换与 PATH 自动管理。

![Electron](https://img.shields.io/badge/Electron-41.x-47848F?logo=electron) ![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js) ![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 概述

**ENVM** 让你能像管理包版本一样管理本地开发环境的运行时版本。它可以：

- 管理多个**环境分组**（如 Node.js、Java、Python 等）
- 从镜像源自动获取**版本列表**
- 一键**下载 & 解压**目标版本
- 以**符号链接**方式切换当前激活版本
- 自动维护系统 **PATH 环境变量**
- 通过 **WebSocket** 实时推送下载进度

## 截图

![主界面](screenshot/1.png)
*主界面：左侧环境分组侧边栏 + 右侧版本列表面板*

![版本管理与下载](screenshot/2.png)
*版本管理：下载进度、版本切换与搜索过滤*

---

## 功能特性

### 📦 环境分组管理
- 创建/编辑/删除环境分组
- 每个分组可自定义**镜像仓库 URL** 和**版本获取脚本**
- 内置 Node.js、Java 等常用环境的默认配置

### ⬇️ 版本管理
- 自动从远程镜像源获取可用版本列表
- 下载过程实时展示进度、速度
- 下载后自动解压（支持 `.zip` / `.7z` 格式）
- 支持版本过滤（全部/已安装/未安装）和搜索

### 🔄 版本切换
- 激活某版本时自动创建符号链接到统一目录
- 自动将 `bin` 目录添加到用户 PATH
- 切换版本时自动取消旧版本的激活状态

### 🛠️ 可扩展脚本
- 每个环境分组支持自定义 **获取列表脚本**（JavaScript/TypeScript）
- 脚本可访问 `fetch`、`moment`、`radashi` 等工具
- 支持 Monaco Editor 在线编辑脚本

### 🌓 主题切换
- 明/暗主题切换，跟随系统偏好

---

## 技术栈

### 后端（Electron 主进程）

| 技术 | 用途 |
|------|------|
| **Electron** | 桌面应用框架 |
| **Hono** | 轻量级 HTTP API 框架 |
| **better-sqlite3** | SQLite 数据库 |
| **drizzle-orm** | 类型安全的 ORM |
| **ws** | WebSocket 服务，实时推送下载进度 |
| **7zip-bin / 7zip-min** | 解压压缩包 |
| **node-downloader-manager** | 文件下载管理器 |

### 前端（Electron 渲染进程）

| 技术 | 用途 |
|------|------|
| **Vue 3** | UI 框架 |
| **Vue Router** | 前端路由 |
| **Alova** | 声明式 HTTP 请求库 |
| **Element Plus** | UI 组件库 |
| **Monaco Editor** | 代码编辑器（脚本编辑） |
| **UnoCSS** | 即时原子化 CSS |
| **Vite** | 构建工具 |

### 构建与打包

- **electron-vite** — Electron + Vite 集成构建
- **electron-builder** — 跨平台打包（Windows NSIS / macOS DMG）

---

## 快速开始

### 前置要求

- Node.js >= 18
- Git

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/envm.git
cd envm

# 安装主进程依赖
cd app
npm install

# 安装 UI 依赖
cd ../ui
npm install
```

### 开发模式运行

```bash
# 在 app 目录下启动开发模式（同时启动 Electron + UI）
cd app
npm run dev
```

### 构建打包

```bash
# 1. 构建 UI
cd ui
npm run build

# 2. 构建主进程并打包
cd ../app
npm run build:win       # Windows 安装包
# 或
npm run build:dir       # 仅输出目录（调试用）
```

---

## 项目结构

```
envm/
├── app/                          # Electron 主进程
│   ├── src/
│   │   ├── index.ts              # 应用入口，窗口创建 & HTTP/WS 服务启动
│   │   ├── entities/             # 数据模型（drizzle-orm schema）
│   │   │   ├── EnvGroup.ts       # 环境分组表
│   │   │   ├── EnvItem.ts        # 环境版本项表
│   │   │   ├── index.ts          # 数据库初始化 & 表创建
│   │   │   └── init.ts           # 默认初始化数据
│   │   ├── routes/               # Hono HTTP 路由
│   │   │   ├── envGroupRoute.ts  # 分组 CRUD API
│   │   │   ├── envItemRoute.ts   # 版本项 API（切换状态、删除）
│   │   │   └── systemRoute.ts    # 系统 API（退出）
│   │   ├── services/             # 业务逻辑层
│   │   │   ├── envGroupService.ts # 分组服务：增删改查 + 远程版本获取
│   │   │   ├── envItemService.ts  # 版本服务：下载/解压/符号链接/PATH 管理
│   │   │   └── wsService.ts       # WebSocket 服务（单例，广播下载进度）
│   │   └── utils/
│   │       ├── comm.ts           # 工具函数：符号链接、解压、PATH 操作
│   │       └── 7z-min.ts         # 7zip 解压封装（兼容 asar 打包）
│   ├── build/
│   │   ├── build-ui.js           # 构建 UI 的脚本
│   │   └── entitlements.mac.plist # macOS 签名配置
│   ├── electron-builder.ts       # electron-builder 打包配置
│   └── package.json
│
├── ui/                           # Vue 3 前端
│   ├── src/
│   │   ├── main.ts               # 入口
│   │   ├── App.vue               # 根组件（Element Plus 国际化 + 主题）
│   │   ├── router.ts             # 路由配置
│   │   ├── style.css             # 全局样式（CSS 变量，明暗主题）
│   │   ├── apis/                 # API 调用层（基于 Alova）
│   │   │   ├── EnvGroup.ts       # 环境分组 API
│   │   │   ├── EnvItem.ts        # 版本项 API
│   │   │   └── System.ts         # 系统 API
│   │   ├── components/           # 组件
│   │   │   ├── EnvSidebar.vue    # 侧边栏：环境分组列表
│   │   │   ├── VersionList.vue   # 版本列表：展示/过滤/搜索版本
│   │   │   ├── VersionItem.vue   # 单个版本项：状态/下载进度/激活按钮
│   │   │   ├── TsEditorDialog.vue # 脚本编辑弹窗
│   │   │   └── MonacoEditor.vue  # Monaco 编辑器封装
│   │   ├── pages/config/         # 配置页面
│   │   │   ├── index.vue         # 主页面：侧边栏 + 版本列表
│   │   │   ├── save.vue          # 新增/编辑环境分组弹窗
│   │   │   └── scriptDefines.ts  # 脚本类型定义 & 默认模板
│   │   └── comm/                 # 公共模块
│   │       ├── alova.ts          # Alova 实例配置
│   │       ├── websocket.ts      # WebSocket 客户端管理器
│   │       ├── useTheme.ts       # 主题切换 composable
│   │       ├── comm.ts           # 通用工具函数
│   │       └── clipboard.ts      # 剪贴板工具
│   ├── vite.config.ts            # Vite 配置
│   ├── uno.config.ts             # UnoCSS 配置
│   └── package.json
│
└── docs/
    └── websocket-api.md          # WebSocket API 文档
```

---

## API 概览

### HTTP API（由 Hono 提供，端口：53829）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/envm/groups` | 获取所有环境分组 |
| POST | `/api/envm/groups` | 新增/更新环境分组 |
| DELETE | `/api/envm/groups/:id` | 删除环境分组 |
| GET | `/api/envm/groups/refresh/:id` | 刷新指定分组的版本列表 |
| GET | `/api/envm/items/group/:groupId` | 获取指定分组下的所有版本项 |
| POST | `/api/envm/items/changeStatus` | 切换版本激活状态（触发下载/解压/符号链接） |
| DELETE | `/api/envm/items/:id` | 删除版本项 |
| GET | `/api/envm/system/exit` | 退出应用 |

### WebSocket API

连接地址：`ws://localhost:53829/api/ws`

服务端推送消息类型：

- **`download-progress`** — 下载进度（百分比、速度、已下载/总大小）
- **`download-complete`** — 下载完成
- **`download-error`** — 下载失败

> 详见 [docs/websocket-api.md](docs/websocket-api.md)

---

## 自定义环境脚本

每个环境分组可以自定义一个 **获取列表脚本**，用于从远程源获取可用版本列表。

脚本签名：

```typescript
type ConfigType = {
  name: string;       // 组名称
  routeUrl: string;   // 路由地址（镜像源 URL）
}

type UtilsType = {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  log: (...data: any[]) => void;
  radashi: any;               // radashi 工具库
  moment: any;                // moment.js
  versionCompare: (a: string|number, b: string|number) => number;  // 版本号比较
}

type ResultType = {
  version: string;    // 版本号
  url: string;        // 下载地址
}

async (config: ConfigType, utils: UtilsType): Promise<ResultType[]>
```

你可以在保存环境分组时，通过 Monaco Editor 在线编辑此脚本。

---

## 数据存储

- **数据库文件**：`<envmDataDir>/envm.db`（SQLite）
- **数据目录**：默认在应用目录下的 `envm-data/`，如不可写则回退到系统 AppData 目录
- **下载文件**：`<envmDataDir>/downloads/`
- **解压目录**：`<envmDataDir>/data/<group-name>/<version>/`
- **符号链接目录**：`<envmDataDir>/env/<group-name>/`

---

## 路线图

- [ ] 更多的内置环境模板（Python、Go、Rust 等）
- [ ] 环境版本本地缓存管理（清理旧版本）
- [ ] 代理配置支持
- [ ] 批量操作（多版本同时下载）
- [ ] 环境配置导出/导入

---

## 许可证

[MIT](LICENSE)

Copyright © 2026 tanch
