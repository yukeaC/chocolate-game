// ============================================================
// saveManager.js · 存档导入/导出（复制粘贴版）
// 完整打包所有数据，导入后强制刷新
// ============================================================

console.log('💾 存档管理器加载中（复制粘贴版）...');

// 所有需要保存的 localStorage key
var SAVE_KEYS = [
    // 主游戏
    'chocolate_save',
    'order_date',
    'savedOrders',
    'last_refresh_date',
    // 农场
    'farm_data',
    // 商城
    'shop_data',
    'player_bag',
    // 成就
    'achievement_data',
    // 探险地图
    'explore_coins',
    'explore_backpack',
    'explore_region_status',
    'explore_visited',
    'adventurer_data',
    'treasure_data',
    'story_progress',
    'fishing_daily',
    'fishing_stats',
    'mining_data',
    'panini_data',
    'rice_data',
    'trade_total_count',
    'bounty_data',
    'explore_travel_state',
    'prince_dialogue_state',
    'croissant_state',
    'sudoku_rewards',
    'rose_plant_data',
    'rose_seed_dialogue_played',
    'rose_pot_unlocked',
    'nomo_feed_data',
    'nomo_completed'
];

// ===== 导出：打包 → 压缩 → Base64 =====
function exportSaveToClipboard() {
    try {
        var bundle = {};
        var totalSize = 0;
        for (var i = 0; i < SAVE_KEYS.length; i++) {
            var key = SAVE_KEYS[i];
            var value = localStorage.getItem(key);
            if (value !== null) {
                bundle[key] = value;
                totalSize += value.length;
            }
        }
        // 添加元数据
        bundle._meta = {
            version: 2,
            timestamp: Date.now(),
            count: Object.keys(bundle).length - 1
        };
        
        var json = JSON.stringify(bundle);
        // 压缩（去除多余空格）
        var compressed = json.replace(/\s+/g, '');
        // Base64 编码（支持中文）
        var base64 = btoa(encodeURIComponent(compressed));
        
        // 复制到剪贴板
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(base64).then(function() {
                if (typeof showMessage === 'function') {
                    showMessage('✅ 存档码已复制！长度: ' + base64.length + ' 字符', false);
                } else {
                    alert('✅ 存档码已复制到剪贴板！');
                }
            }).catch(function() {
                fallbackCopy(base64);
            });
        } else {
            fallbackCopy(base64);
        }
        console.log('📦 打包数据项: ' + (Object.keys(bundle).length - 1) + '，总大小: ' + totalSize + ' 字符');
        return base64;
    } catch(e) {
        console.error('导出失败:', e);
        if (typeof showMessage === 'function') {
            showMessage('❌ 导出失败: ' + e.message, true);
        } else {
            alert('导出失败: ' + e.message);
        }
        return null;
    }
}

function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        if (typeof showMessage === 'function') {
            showMessage('✅ 存档码已复制！长度: ' + text.length + ' 字符', false);
        } else {
            alert('✅ 存档码已复制到剪贴板！');
        }
    } catch(e) {
        if (typeof showMessage === 'function') {
            showMessage('❌ 复制失败，请手动复制下方文本', true);
        }
        prompt('请手动复制以下存档码：', text);
    }
    document.body.removeChild(textarea);
}

// ===== 导入：粘贴解码 → 写入 localStorage → 刷新 =====
function importSaveFromClipboard() {
    // 尝试从剪贴板读取
    if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(function(text) {
            if (text && text.length > 10) {
                doImport(text.trim());
            } else {
                promptImport();
            }
        }).catch(function() {
            promptImport();
        });
    } else {
        promptImport();
    }
}

function promptImport() {
    var input = prompt('📋 请粘贴存档码：');
    if (input && input.trim().length > 10) {
        doImport(input.trim());
    } else {
        if (typeof showMessage === 'function') {
            showMessage('❌ 未输入有效的存档码', true);
        }
    }
}

function doImport(base64) {
    try {
        // 解码
        var compressed = decodeURIComponent(atob(base64));
        var bundle = JSON.parse(compressed);
        
        // 验证元数据
        if (!bundle._meta || bundle._meta.version !== 2) {
            if (typeof showMessage === 'function') {
                showMessage('❌ 存档码格式不兼容', true);
            }
            return;
        }
        
        // 二次确认
        if (!confirm('⚠️ 导入将覆盖当前所有进度，确定继续吗？')) {
            return;
        }
        
        // 写入 localStorage
        var count = 0;
        for (var key in bundle) {
            if (key === '_meta') continue;
            if (SAVE_KEYS.indexOf(key) !== -1) {
                localStorage.setItem(key, bundle[key]);
                count++;
            }
        }
        
        if (typeof showMessage === 'function') {
            showMessage('✅ 导入成功！已恢复 ' + count + ' 项数据，页面将刷新', false);
        } else {
            alert('✅ 导入成功！已恢复 ' + count + ' 项数据，页面将刷新');
        }
        
        // 强制刷新页面，让所有模块重新加载
        setTimeout(function() {
            location.reload();
        }, 1000);
        
    } catch(e) {
        console.error('导入失败:', e);
        if (typeof showMessage === 'function') {
            showMessage('❌ 导入失败: ' + e.message, true);
        } else {
            alert('导入失败: ' + e.message);
        }
    }
}

// ===== 暴露全局 =====
window.exportSaveToClipboard = exportSaveToClipboard;
window.importSaveFromClipboard = importSaveFromClipboard;

console.log('💾 存档管理器加载完成（复制粘贴版）');