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
    console.log('🔧 开发模式：已强制启用更新检查 (forceDevUpdateConfig=true)');
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

    // ===== 自动打开开发者工具（调试用） =====
    mainWindow.webContents.openDevTools();

    // ===== 快捷键打开开发者工具（Ctrl+Shift+I） =====
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.control && input.shift && input.key === 'I') {
            mainWindow.webContents.openDevTools();
        }
        // Ctrl+R 刷新（方便调试）
        if (input.control && input.key === 'r') {
            mainWindow.reload();
        }
    });

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
// 更新相关 IPC（带完整日志）
// ============================================

ipcMain.on('check-for-updates', () => {
    console.log('🔍 [IPC] 收到 check-for-updates 消息');
    if (!mainWindow) {
        console.warn('⚠️ 主窗口不存在，无法检查更新');
        return;
    }

    // 清除之前的超时定时器
    if (updateCheckTimer) {
        clearTimeout(updateCheckTimer);
        updateCheckTimer = null;
    }

    // 发送"检查中"状态
    mainWindow.webContents.send('update-status', 'checking');
    console.log('🔍 开始检查更新...');

    // ===== 超时保护：15秒后如果没有任何响应，发送超时错误 =====
    let isUpdateCheckCompleted = false;

    updateCheckTimer = setTimeout(() => {
        if (!isUpdateCheckCompleted) {
            console.warn('⏰ 更新检查超时（15秒），可能网络问题');
            if (mainWindow) {
                mainWindow.webContents.send('update-error', {
                    message: '检查更新超时，请检查网络连接后重试'
                });
                mainWindow.webContents.send('update-status', 'error');
            }
            isUpdateCheckCompleted = true;
        }
    }, 15000);

    // 执行检查更新
    autoUpdater.checkForUpdatesAndNotify();
});

ipcMain.on('install-update', () => {
    console.log('📦 用户确认安装更新，应用将重启...');
    autoUpdater.quitAndInstall();
});

// ============================================
// 自动更新事件（完整日志）
// ============================================

autoUpdater.on('checking-for-update', () => {
    console.log('🔍 [autoUpdater] 正在检查更新...');
    if (mainWindow) {
        mainWindow.webContents.send('update-status', 'checking');
    }
});

autoUpdater.on('update-available', (info) => {
    console.log('🎉 [autoUpdater] 发现新版本:', info.version);
    console.log('   📝 更新内容:', info.releaseNotes || '无');
    if (mainWindow) {
        mainWindow.webContents.send('update-available', {
            version: info.version,
            releaseDate: info.releaseDate,
            releaseNotes: info.releaseNotes
        });
    }
    // 标记完成
    if (updateCheckTimer) {
        clearTimeout(updateCheckTimer);
        updateCheckTimer = null;
    }
});

autoUpdater.on('update-not-available', (info) => {
    console.log('✅ [autoUpdater] 已是最新版本，当前版本:', info.version);
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
    console.log(`⬇️ [autoUpdater] 下载进度: ${percent}%`);
    if (mainWindow) {
        mainWindow.webContents.send('download-progress', {
            percent: progress.percent,
            bytesPerSecond: progress.bytesPerSecond,
            transferred: progress.transferred,
            total: progress.total
        });
    }
});

autoUpdater.on('update-downloaded', (info) => {
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
            message: err.message || '更新检查失败，请检查网络连接'
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