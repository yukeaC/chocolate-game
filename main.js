// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// ===== 配置日志 =====
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// ===== 开发模式强制启用更新检查 =====
if (!app.isPackaged) {
    autoUpdater.forceDevUpdateConfig = true;
    console.log('🔧 开发模式：已强制启用更新检查');
}

let mainWindow = null;
let updateCheckTimer = null;

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
        title: '可可的巧克力工坊',
        show: false,
        icon: path.join(__dirname, 'icon.ico')
    });

    mainWindow.loadFile('index.html');

    // ===== 移除控制台（不再自动打开） =====
    // mainWindow.webContents.openDevTools();  // ← 已注释掉

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    console.log('✅ 主窗口已创建');
}

app.whenReady().then(() => {
    console.log('🚀 应用已就绪，创建主窗口...');
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
    console.log('🔍 [IPC] 收到 check-for-updates 消息');
    if (!mainWindow) {
        console.warn('⚠️ 主窗口不存在');
        return;
    }

    if (updateCheckTimer) {
        clearTimeout(updateCheckTimer);
        updateCheckTimer = null;
    }

    mainWindow.webContents.send('update-status', 'checking');
    console.log('🔍 开始检查更新...');

    let isUpdateCheckCompleted = false;

    updateCheckTimer = setTimeout(() => {
        if (!isUpdateCheckCompleted) {
            console.warn('⏰ 更新检查超时');
            if (mainWindow) {
                mainWindow.webContents.send('update-error', {
                    message: '检查更新超时，请检查网络连接后重试'
                });
                mainWindow.webContents.send('update-status', 'error');
            }
            isUpdateCheckCompleted = true;
        }
    }, 15000);

    autoUpdater.checkForUpdatesAndNotify();
});

ipcMain.on('install-update', () => {
    console.log('📦 用户确认安装更新，应用将退出并安装...');
    
    // ===== 关键：先发送消息让前端知道应用即将关闭 =====
    if (mainWindow) {
        mainWindow.webContents.send('update-status', 'installing');
    }
    
    // ===== 延迟一点让 UI 更新，然后退出安装 =====
    setTimeout(() => {
        autoUpdater.quitAndInstall();
    }, 1000);
});

// ============================================
// 自动更新事件
// ============================================

autoUpdater.on('checking-for-update', () => {
    console.log('🔍 [autoUpdater] 正在检查更新...');
    if (mainWindow) {
        mainWindow.webContents.send('update-status', 'checking');
    }
});

autoUpdater.on('update-available', (info) => {
    console.log('🎉 [autoUpdater] 发现新版本:', info.version);
    if (mainWindow) {
        mainWindow.webContents.send('update-available', {
            version: info.version,
            releaseDate: info.releaseDate,
            releaseNotes: info.releaseNotes
        });
    }
    if (updateCheckTimer) {
        clearTimeout(updateCheckTimer);
        updateCheckTimer = null;
    }
});

autoUpdater.on('update-not-available', (info) => {
    console.log('✅ [autoUpdater] 已是最新版本:', info.version);
    if (mainWindow) {
        mainWindow.webContents.send('update-not-available');
        mainWindow.webContents.send('update-status', 'not-available');
    }
    if (updateCheckTimer) {
        clearTimeout(updateCheckTimer);
        updateCheckTimer = null;
    }
});

autoUpdater.on('download-progress', (progress) => {
    const percent = Math.round(progress.percent);
    console.log(`⬇️ 下载进度: ${percent}%`);
    if (mainWindow) {
        mainWindow.webContents.send('download-progress', {
            percent: progress.percent,
            bytesPerSecond: progress.bytesPerSecond,
            transferred: progress.transferred,
            total: progress.total
        });
    }
});

autoUpdater.on('update-downloaded', () => {
    console.log('✅ [autoUpdater] 更新已下载完成');
    if (mainWindow) {
        mainWindow.webContents.send('update-downloaded');
    }
    if (updateCheckTimer) {
        clearTimeout(updateCheckTimer);
        updateCheckTimer = null;
    }
});

autoUpdater.on('error', (err) => {
    console.error('❌ [autoUpdater] 错误:', err.message);
    if (mainWindow) {
        mainWindow.webContents.send('update-error', {
            message: err.message || '更新检查失败'
        });
        mainWindow.webContents.send('update-status', 'error');
    }
    if (updateCheckTimer) {
        clearTimeout(updateCheckTimer);
        updateCheckTimer = null;
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

console.log('✅ main.js 加载完成');