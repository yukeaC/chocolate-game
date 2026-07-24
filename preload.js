// preload.js
const { contextBridge, ipcRenderer } = require('electron');

console.log('🔒 [preload] preload.js 加载成功');

// ===== 暴露安全的 API 给渲染进程 =====
contextBridge.exposeInMainWorld('electronAPI', {
    // 发送消息到主进程
    send: (channel, data) => {
        console.log('📤 [preload] send 调用: 通道=', channel, '数据=', data);
        const validSendChannels = [
            'check-for-updates',
            'install-update',
            'close-window',
            'minimize-window',
            'maximize-window'
        ];
        if (validSendChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
            console.log('✅ [preload] 已发送到主进程:', channel);
        } else {
            console.warn('⚠️ [preload] 非法通道，已拒绝:', channel);
        }
    },
    // 监听主进程消息
    on: (channel, func) => {
        console.log('📥 [preload] on 调用: 通道=', channel);
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
            ipcRenderer.on(channel, (event, ...args) => {
                console.log('📨 [preload] 收到事件:', channel, args);
                func(...args);
            });
            console.log('✅ [preload] 已注册监听:', channel);
        } else {
            console.warn('⚠️ [preload] 非法监听通道，已拒绝:', channel);
        }
    },
    // 移除监听器
    off: (channel, func) => {
        console.log('📤 [preload] off 调用: 通道=', channel);
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
            console.log('✅ [preload] 已移除监听:', channel);
        }
    },
    // 检查 API 是否可用（用于前端判断）
    isAvailable: true
});

console.log('✅ [preload] electronAPI 已暴露到渲染进程');