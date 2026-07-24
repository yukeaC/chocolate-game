const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');  // 新增

let startWindow = null;
let gameWindow = null;
let mainWindow = null;  // 新增：保存主窗口引用，用于更新事件

// ============================================
// 自动更新配置
// ============================================
autoUpdater.logger = console;
autoUpdater.autoDownload = false;  // 只检查，不自动下载

// 检查更新
ipcMain.on('check-for-updates', () => {
  autoUpdater.checkForUpdatesAndNotify();
});

// 立即安装更新
ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall();
});

// ===== 更新事件（通知渲染进程） =====
autoUpdater.on('update-available', (info) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded');
  }
});

autoUpdater.on('error', (err) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-error', err.message);
  }
});

// ============================================
// 创建窗口
// ============================================

function createStartWindow() {
  startWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    resizable: true,
    backgroundColor: '#f9e7c2',
    title: '可可巧克力工坊',
    show: true,
  });
  startWindow.loadFile('start.html');
  startWindow.setMenu(null);
  startWindow.on('closed', () => { startWindow = null; });
}

function createGameWindow(mode = 'new') {
  if (gameWindow) {
    gameWindow.close();
  }
  gameWindow = new BrowserWindow({
    width: 700,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    resizable: true,
    backgroundColor: '#fffaf0',
    title: '可可巧克力工坊',
    show: false,
  });
  // 保存主窗口引用
  mainWindow = gameWindow;
  gameWindow.loadFile('index.html', { query: { mode: mode } });
  gameWindow.once('ready-to-show', () => {
    gameWindow.show();
    if (startWindow) startWindow.hide();
  });
  gameWindow.on('closed', () => {
    gameWindow = null;
    mainWindow = null;
    if (startWindow) startWindow.show();
  });
}

// ============================================
// IPC 事件监听
// ============================================
ipcMain.on('start-new-game', () => createGameWindow('new'));
ipcMain.on('continue-game', () => createGameWindow('continue'));
ipcMain.on('guest-mode', () => createGameWindow('guest'));
ipcMain.on('exit-game', () => app.quit());

// ============================================
// 应用生命周期
// ============================================
app.whenReady().then(() => {
  createStartWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (startWindow === null && gameWindow === null) {
    createStartWindow();
  }
});