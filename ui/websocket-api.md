# WebSocket 下载进度推送 API

## 概述

服务端通过 WebSocket 向前端实时推送下载进度。WebSocket 与 HTTP API 共用同一端口（随机分配），前端在页面加载后即可建立连接。

## 连接地址

```
ws://localhost:{port}
```

> `port` 为 HTTP 服务启动时分配的随机端口，可通过页面初始加载时的 HTTP 响应或页面配置获取。

## 消息格式

所有消息均为 JSON 格式的文本帧，包含统一的 `type` 字段区分消息类型。

---

### 1. 下载进度推送 (`download-progress`)

当 `DownloadManager` 触发 `progress` 事件时发送。

```json
{
  "type": "download-progress",
  "itemId": "abc123",
  "percentage": 45.5,
  "received": 47185920,
  "total": 104857600,
  "speed": 2097152
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | `string` | 固定为 `"download-progress"` |
| `itemId` | `string` | 当前正在下载的环境项 ID |
| `percentage` | `number` | 下载百分比，范围 `0` ~ `100` |
| `received` | `number` | 已下载字节数 |
| `total` | `number` | 文件总字节数 |
| `speed` | `number` | 下载速度（字节/秒） |

---

### 2. 下载完成 (`download-complete`)

文件下载完成后发送。

```json
{
  "type": "download-complete",
  "itemId": "abc123"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | `string` | 固定为 `"download-complete"` |
| `itemId` | `string` | 下载完成的环境项 ID |

> **注意**：下载完成后服务端还会继续执行解压、创建软连接、设置环境变量等操作。前端可等待后续 HTTP API 轮询或状态刷新来确认完全就绪。

---

### 3. 下载错误 (`download-error`)

下载过程中发生错误时发送。

```json
{
  "type": "download-error",
  "itemId": "abc123",
  "error": "Network timeout"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | `string` | 固定为 `"download-error"` |
| `itemId` | `string` | 下载失败的环境项 ID |
| `error` | `string` | 错误描述信息 |

---

## 前端接入示例

### 建立连接

```javascript
let ws = null;

function connectWebSocket(port) {
  ws = new WebSocket(`ws://localhost:${port}`);

  ws.onopen = () => {
    console.log('WebSocket 已连接');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleWsMessage(data);
  };

  ws.onclose = () => {
    console.log('WebSocket 连接已关闭');
    // 可选：自动重连
    // setTimeout(() => connectWebSocket(port), 3000);
  };

  ws.onerror = (error) => {
    console.error('WebSocket 连接错误:', error);
  };
}

function handleWsMessage(data) {
  switch (data.type) {
    case 'download-progress':
      updateProgressBar(data.itemId, data.percentage, data.speed);
      break;
    case 'download-complete':
      onDownloadComplete(data.itemId);
      break;
    case 'download-error':
      onDownloadError(data.itemId, data.error);
      break;
  }
}
```

### 进度条更新示例

```javascript
// progressMap: Map<itemId, { percentage, speed, received, total }>
const progressMap = new Map();

function updateProgressBar(itemId, percentage, speed) {
  progressMap.set(itemId, { percentage, speed });

  // 更新 DOM
  const bar = document.querySelector(`[data-item-id="${itemId}"] .progress-bar`);
  const text = document.querySelector(`[data-item-id="${itemId}"] .progress-text`);

  if (bar) bar.style.width = `${percentage}%`;
  if (text) {
    const speedKB = (speed / 1024).toFixed(1);
    text.textContent = `${percentage.toFixed(1)}% (${speedKB} KB/s)`;
  }
}

function onDownloadComplete(itemId) {
  progressMap.delete(itemId);

  const el = document.querySelector(`[data-item-id="${itemId}"]`);
  if (el) {
    el.querySelector('.progress-bar').style.width = '100%';
    el.querySelector('.progress-text').textContent = '下载完成，正在处理...';
  }
}

function onDownloadError(itemId, error) {
  progressMap.delete(itemId);

  const el = document.querySelector(`[data-item-id="${itemId}"]`);
  if (el) {
    el.querySelector('.progress-text').textContent = `下载失败: ${error}`;
    el.querySelector('.progress-bar').style.width = '0%';
  }
}
```

### 与现有 API 配合

下载进度 WebSocket 仅在 `changeStatus` 接口触发实际下载时推送。前端调用流程建议：

1. 调 `POST /api/envm/items/changeStatus` 启用某个环境项
2. WebSocket 实时接收该 `itemId` 的下载进度
3. 下载完成后继续等待解压/配置完成
4. 调 `GET /api/envm/items/group/:groupId` 刷新列表确认最终状态

## 连接生命周期

| 阶段 | 说明 |
|------|------|
| 页面加载 | 获取端口号，建立 WebSocket 连接 |
| 下载期间 | 服务端持续推送 `download-progress` |
| 下载结束 | 推送 `download-complete` 或 `download-error` |
| 页面关闭 | 浏览器自动断开 WebSocket |
| 异常断开 | 可按需实现自动重连机制 |
