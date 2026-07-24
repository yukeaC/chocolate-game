console.log('🔒 [preload] preload.js 加载成功');

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, data) => {
        console.log('📤 [preload] send:', channel, data);
        const valid = ['check-for-updates', 'install-update', 'close-window', 'minimize-window', 'maximize-window'];
        if (valid.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    on: (channel, func) => {
        console.log('📥 [preload] on:', channel);
        const valid = ['update-available', 'download-progress', 'update-downloaded', 'update-error', 'update-status', 'update-not-available'];
        if (valid.includes(channel)) {
            ipcRenderer.removeAllListeners(channel);
            ipcRenderer.on(channel, (event, ...args) => {
                console.log('📨 [preload] 收到事件:', channel, args);
                func(...args);
            });
        }
    },
    isAvailable: true
});