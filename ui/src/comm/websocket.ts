/**
 * WebSocket 下载进度推送
 * 参见 docs/websocket-api.md
 *
 * 服务端与 HTTP API 共用同一端口，端口号从 URL hash 参数 `port` 获取，
 * 若未提供则使用开发环境默认端口 28190。
 */

/* ── 类型定义 ── */

export interface DownloadProgress {
  itemId: string
  percentage: number
  received: number
  total: number
  speed: number
}

export interface DownloadComplete {
  itemId: string
}

export interface DownloadError {
  itemId: string
  error: string
}

type WsMessage =
  | ({ type: 'download-progress' } & DownloadProgress)
  | ({ type: 'download-complete' } & DownloadComplete)
  | ({ type: 'download-error' } & DownloadError)

type ProgressHandler = (data: DownloadProgress) => void
type CompleteHandler = (data: DownloadComplete) => void
type ErrorHandler = (data: DownloadError) => void

/* ── 端口获取 ── */

function getWsPort(): number {
  // 优先从 hash query 中取 port 参数 (#/config?port=28190)
  const hashQuery = window.location.hash.replace(/^.*\?/, '')
  if (hashQuery) {
    const hashParams = new URLSearchParams(hashQuery)
    const port = hashParams.get('port')
    if (port) return parseInt(port, 10)
  }
  // 开发环境默认值
  return 28190
}

/* ── WebSocket 管理器（单例） ── */

class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private destroyed = false

  private onProgress: ProgressHandler | null = null
  private onComplete: CompleteHandler | null = null
  private onError: ErrorHandler | null = null

  /** 建立连接（若已连接则跳过） */
  connect() {
    console.log('[WS] 尝试连接...')
    if (this.destroyed) return
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${window.location.host}/api/ws`

    this.ws = new WebSocket(url)
    this.ws.onopen = () => console.log('[WS] 已连接', url)
    this.ws.onmessage = (event) => this.handleMessage(event)
    this.ws.onclose = () => {
      console.log('[WS] 连接已关闭')
      this.scheduleReconnect()
    }
    this.ws.onerror = () => console.error('[WS] 连接错误')
  }

  /** 断开连接 */
  disconnect() {
    this.destroyed = true
    this.clearReconnect()
    if (this.ws) {
      this.ws.onclose = null
      this.ws.close()
      this.ws = null
    }
  }

  /* ── 事件绑定 ── */

  on(event: 'progress', handler: ProgressHandler): void
  on(event: 'complete', handler: CompleteHandler): void
  on(event: 'error', handler: ErrorHandler): void
  on(event: string, handler: unknown) {
    switch (event) {
      case 'progress': this.onProgress = handler as ProgressHandler; break
      case 'complete': this.onComplete = handler as CompleteHandler; break
      case 'error': this.onError = handler as ErrorHandler; break
    }
  }

  off(event: 'progress' | 'complete' | 'error') {
    switch (event) {
      case 'progress': this.onProgress = null; break
      case 'complete': this.onComplete = null; break
      case 'error': this.onError = null; break
    }
  }

  /* ── 内部 ── */

  private handleMessage(event: MessageEvent) {
    try {
      const data: WsMessage = JSON.parse(event.data)
      switch (data.type) {
        case 'download-progress':
          this.onProgress?.(data)
          break
        case 'download-complete':
          this.onComplete?.(data)
          break
        case 'download-error':
          this.onError?.(data)
          break
      }
    } catch (e) {
      console.error('[WS] 消息解析失败:', e)
    }
  }

  private scheduleReconnect() {
    if (this.destroyed || this.reconnectTimer) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, 3000)
  }

  private clearReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

/* ── 导出单例工厂 ── */

let instance: WebSocketManager | null = null

export function getWsManager(): WebSocketManager {
  if (!instance) {
    instance = new WebSocketManager()
  }
  return instance
}
