import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'node:http';

export type DownloadProgressMessage = {
  type: 'download-progress';
  itemId: string;
  percentage: number;
  received: number;
  total: number;
  speed: number;
};

export type DownloadCompleteMessage = {
  type: 'download-complete';
  itemId: string;
};

export type DownloadErrorMessage = {
  type: 'download-error';
  itemId: string;
  error: string;
};

export type WsMessage = DownloadProgressMessage | DownloadCompleteMessage | DownloadErrorMessage;

class WsService {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  /**
   * 初始化 WebSocket 服务器，绑定到已有的 HTTP 服务器
   * @param path 监听路径，默认为 '/'，传入 '/api/ws' 则只有该路径的请求才会升级为 WebSocket
   */
  init(server: Server, path: string = '/'): void {
    this.wss = new WebSocketServer({ server, path });

    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      console.log('WebSocket 客户端已连接，当前连接数:', this.clients.size);

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('WebSocket 客户端已断开，当前连接数:', this.clients.size);
      });

      ws.on('error', (err) => {
        console.error('WebSocket 客户端错误:', err);
        this.clients.delete(ws);
      });
    });

    console.log('WebSocket 服务器已初始化');
  }

  /**
   * 向所有已连接的客户端广播消息
   */
  broadcast(message: WsMessage): void {
    const data = JSON.stringify(message);
    let sentCount = 0;
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
        sentCount++;
      }
    }
    // if (sentCount > 0) {
    //   console.log(`[WS] 广播消息: ${message.type}, itemId: ${(message as any).itemId}, 已发送给 ${sentCount} 个客户端`);
    // }
  }

  /**
   * 获取当前连接数
   */
  get connectionCount(): number {
    return this.clients.size;
  }
}

export const wsService = new WsService();
