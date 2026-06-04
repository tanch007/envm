import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { Hono } from "hono"
import envGroupRoute from "./routes/envGroupRoute";
import envItemRoute from "./routes/envItemRoute";
import systemRoute from "./routes/systemRoute";
import { serveStatic } from '@hono/node-server/serve-static'
import { serve } from '@hono/node-server'
import { wsService } from "./services/wsService";
import { initDb } from "./entities/index";
import path from "path";
import fs from "fs-extra";

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    autoHideMenuBar: true
  })

  const app = new Hono();
  //静态资源
  const publicPath = process.env.VSCODE_DEBUG ? path.join(process.cwd(), 'dist','ui') :path.join(process.resourcesPath, 'ui');
  app.get('/*', serveStatic({ root: publicPath }))

  app.route("/api/envm/groups", envGroupRoute);
  app.route("/api/envm/items", envItemRoute);
  app.route("/api/envm/system", systemRoute);

  // const port = Math.floor(Math.random() * (65535 - 1024)) + 1024;
  const port = 53829
  const server = serve({ fetch: app.fetch, port }, (info) => {
    console.log(`Server running at http://localhost:${info.port}`);
    // 初始化 WebSocket 服务，绑定到同一 HTTP 服务器，监听路径 /api/ws
    wsService.init(server as any, '/api/ws');
    mainWindow.loadURL(`http://localhost:${info.port}?t=${Date.now()}`)
  })

  process.argv.includes('--dev') && mainWindow.webContents.openDevTools()
}

//
async function initDataDir() {
  const appDataDir = app.getPath('appData')
  const configPath = path.join(appDataDir, 'envm', 'envmDataDir.txt')
  if (fs.existsSync(configPath)) {
    return
  }
  //创建初始目录
  let envmDataDir = path.join(process.cwd(), '../', "envm-data");
  if (fs.existsSync(envmDataDir)) {
    await fs.writeFile(configPath, envmDataDir, { encoding: 'utf-8' })
    return
  }
  try {
    await fs.mkdir(envmDataDir); // 比如当前用户无权在 /root 下创建目录
  } catch (err: any) {
    if (err.code === 'EACCES' || err.code === 'EPERM') {
      console.error('没有权限创建目录:', err.message);
      //使用数据目录
      envmDataDir = path.join(app.getPath('appData'), "envm-data")
      if (!fs.existsSync(envmDataDir)) {

        await fs.mkdir(envmDataDir)
      }
      await fs.writeFile(configPath, envmDataDir, { encoding: 'utf-8' })
    } else {
      dialog.showErrorBox(`错误`, '无法创建数据目录!请更换安装目录或者使用管理员权限启动。')
      app.quit()
      return;
    }
  }
}

app.whenReady().then( async () => {
  await initDataDir()
  await initDb()
  createWindow()
})

app.on('window-all-closed', () => app.quit())
