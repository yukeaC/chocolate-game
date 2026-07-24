// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 发送消息到主进程
    send: (channel, data) => {
        // 白名单通道
        const validSendChannels = [
            'check-for-updates',
            'install-update',
            'close-window',
            'minimize-window',
            'maximize-window'
        ];
        if (validSendChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    // 监听主进程消息
    on: (channel, func) => {
        const validReceiveChannels = [
            'update-available',
            'download-progress',
            'update-downloaded',
            'update-error',
            'update-status',
            'update-not-available'
        ];
        if (validReceiveChannels.includes(channel)) {
            // 移除之前的监听器避免重复
            ipcRenderer.removeAllListeners(channel);
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    // 移除监听器（可选）
    off: (channel, func) => {
        const validReceiveChannels = [
            'update-available',
            'download-progress',
            'update-downloaded',
            'update-error',
            'update-status',
            'update-not-available'
        ];
        if (validReceiveChannels.includes(channel)) {
            ipcRenderer.off(channel, func);
        }
    }
});

console.log('🔒 预加载脚本已加载，IPC 安全通道已建立');