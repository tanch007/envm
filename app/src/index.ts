import { app, shell, BrowserWindow, ipcMain, Shell } from 'electron'
import { Hono } from "hono"
import envGroupRoute from "./routes/envGroupRoute";
import envItemRoute from "./routes/envItemRoute";
import systemRoute from "./routes/systemRoute";
import { serveStatic } from 'hono/bun'
import { serve } from '@hono/node-server'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    autoHideMenuBar: true
  })
  mainWindow.loadURL('https://www.baidu.com')

  const app = new Hono();
  //静态资源
  app.get('/*', serveStatic({ root: './public' }))

  app.route("/api/envm/groups", envGroupRoute);
  app.route("/api/envm/items", envItemRoute);
  app.route("/api/envm/system", systemRoute);

  serve(app)
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => app.quit())
