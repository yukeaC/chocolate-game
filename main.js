// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// 配置日志
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

let mainWindow = null;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 850,
        height: 950,
        minWidth: 700,
        minHeight: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        resizable: true,
        backgroundColor: '#fffaf0',
        title: '可可与嫑嫑甜点工坊',
        show: false,
        icon: path.join(__dirname, 'icon.ico')
    });

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 开发时可取消注释以打开开发者工具
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createMainWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});

// ============================================
// 更新相关 IPC
// ============================================

ipcMain.on('check-for-updates', () => {
    if (!mainWindow) return;
    
    // 发送检查中状态
    mainWindow.webContents.send('update-status', 'checking');
    
    // 执行检查更新（会触发 autoUpdater 事件）
    autoUpdater.checkForUpdatesAndNotify();
});

ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall();
});

// ============================================
// 自动更新事件（所有事件都发送到渲染进程）
// ============================================

// 正在检查更新
autoUpdater.on('checking-for-update', () => {
    if (mainWindow) {
        mainWindow.webContents.send('update-status', 'checking');
    }
});

// 发现新版本
autoUpdater.on('update-available', (info) => {
    if (mainWindow) {
        mainWindow.webContents.send('update-available', {
            version: info.version,
            releaseDate: info.releaseDate,
            releaseNotes: info.releaseNotes
        });
    }
});

// 没有新版本（当前已是最新）
autoUpdater.on('update-not-available', () => {
    if (mainWindow) {
        mainWindow.webContents.send('update-not-available');
        mainWindow.webContents.send('update-status', 'not-available');
    }
});

// 下载进度
autoUpdater.on('download-progress', (progress) => {
    if (mainWindow) {
        mainWindow.webContents.send('download-progress', {
            percent: progress.percent,
            bytesPerSecond: progress.bytesPerSecond,
            transferred: progress.transferred,
            total: progress.total
        });
    }
});

// 更新下载完成
autoUpdater.on('update-downloaded', () => {
    if (mainWindow) {
        mainWindow.webContents.send('update-downloaded');
    }
});

// 更新出错
autoUpdater.on('error', (err) => {
    if (mainWindow) {
        mainWindow.webContents.send('update-error', {
            message: err.message || '更新检查失败，请检查网络连接'
        });
        mainWindow.webContents.send('update-status', 'error');
    }
});

// ============================================
// 其他 IPC
// ============================================

ipcMain.on('close-window', () => {
    if (mainWindow) mainWindow.close();
});

ipcMain.on('minimize-window', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});