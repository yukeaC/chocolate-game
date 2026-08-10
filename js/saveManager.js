// ============================================================
// saveManager.js · 存档导入/导出（完美修复版）
// 修复：确保主游戏数据（chocolate_save）完整迁移
// ============================================================

console.log('💾 存档管理器加载中（完美修复版）...');

// ============================================================
// 所有需要保存的 localStorage key（完整列表）
// ============================================================
var SAVE_KEYS = [
    // ----- 主游戏（核心） -----
    'chocolate_save',          // 等级、升级、资源、库存、槽位等
    'order_date',
    'savedOrders',
    'last_refresh_date',
    
    // ----- 农场 -----
    'farm_data',
    
    // ----- 商城 -----
    'shop_data',
    'player_bag',
    
    // ----- 成就 -----
    'achievement_data',
    
    // ----- 探险地图 -----
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
    'nomo_completed',
    
    // ----- 挑战塔 -----
    'tower_data',
    
    // ----- 其他（兼容旧版本） -----
    'double_gold_active',
    'cardmatch_reward_beans',
    'cardmatch_reward_amount',
    'cardmatch_reward_time',
    'minigame_stats'
];

// ============================================================
// 导出：打包 → 压缩 → Base64
// ============================================================
function exportSaveToClipboard() {
    try {
        var bundle = {};
        var totalSize = 0;
        var missingKeys = [];

        for (var i = 0; i < SAVE_KEYS.length; i++) {
            var key = SAVE_KEYS[i];
            var value = localStorage.getItem(key);
            if (value !== null) {
                bundle[key] = value;
                totalSize += value.length;
            } else {
                missingKeys.push(key);
            }
        }
        
        // 添加元数据
        bundle._meta = {
            version: 3,                    // 版本升级
            timestamp: Date.now(),
            count: Object.keys(bundle).length - 1,
            missing: missingKeys
        };

        var json = JSON.stringify(bundle);
        // 压缩（去除多余空格）
        var compressed = json.replace(/\s+/g, '');
        // Base64 编码（支持中文）
        var base64 = btoa(encodeURIComponent(compressed));

        console.log('📦 存档码长度: ' + base64.length + ' 字符');
        console.log('📦 数据项数: ' + (Object.keys(bundle).length - 1));
        if (missingKeys.length > 0) {
            console.warn('⚠️ 以下键不存在，已跳过:', missingKeys.join(', '));
        }

        // 复制到剪贴板
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(base64).then(function() {
                showSaveMessage('✅ 存档码已复制！长度: ' + base64.length + ' 字符', false);
            }).catch(function() {
                fallbackCopy(base64);
            });
        } else {
            fallbackCopy(base64);
        }
        return base64;
    } catch(e) {
        console.error('导出失败:', e);
        showSaveMessage('❌ 导出失败: ' + e.message, true);
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
        showSaveMessage('✅ 存档码已复制！长度: ' + text.length + ' 字符', false);
    } catch(e) {
        showSaveMessage('❌ 复制失败，请手动复制', true);
        prompt('请手动复制以下存档码：', text);
    }
    document.body.removeChild(textarea);
}

// ============================================================
// 导入：文本域方式（支持超长存档码）
// ============================================================
function importSaveFromClipboard() {
    // 尝试从剪贴板读取
    if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(function(text) {
            if (text && text.length > 10) {
                doImport(text.trim());
            } else {
                showLargeTextImportDialog();
            }
        }).catch(function() {
            showLargeTextImportDialog();
        });
    } else {
        showLargeTextImportDialog();
    }
}

function showLargeTextImportDialog() {
    var existing = document.getElementById('importDialogOverlay');
    if (existing) {
        existing.remove();
    }

    var overlay = document.createElement('div');
    overlay.id = 'importDialogOverlay';
    overlay.style.cssText = [
        'position:fixed;top:0;left:0;width:100%;height:100%;',
        'background:rgba(0,0,0,0.7);z-index:99999;',
        'display:flex;align-items:center;justify-content:center;',
        'animation:fadeIn 0.2s ease;'
    ].join('');

    var dialog = document.createElement('div');
    dialog.style.cssText = [
        'max-width:600px;width:92%;',
        'background:#faf0e0;border-radius:24px;padding:24px;',
        'box-shadow:0 20px 60px rgba(0,0,0,0.5);',
        'border:1px solid #dcc8b0;',
        'max-height:80vh;display:flex;flex-direction:column;'
    ].join('');

    dialog.innerHTML = [
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">',
        '  <h3 style="margin:0;color:#4a2a1a;">📥 导入存档</h3>',
        '  <button id="importDialogClose" style="background:#c98f5e;border:none;border-radius:30px;padding:4px 14px;cursor:pointer;font-size:0.8rem;color:white;">取消</button>',
        '</div>',
        '<p style="font-size:0.85rem;color:#5a3a2a;margin:0 0 8px 0;">请完整粘贴存档码（支持超长文本）：</p>',
        '<textarea id="importTextArea" style="',
        '  width:100%;min-height:150px;max-height:300px;',
        '  background:rgba(255,255,255,0.5);border:1px solid #dcc8b0;border-radius:12px;',
        '  padding:12px;font-size:0.8rem;font-family:monospace;',
        '  resize:vertical;color:#3d2b1a;outline:none;',
        '  flex:1;',
        '"></textarea>',
        '<div style="display:flex;gap:12px;justify-content:flex-end;margin-top:12px;">',
        '  <button id="importConfirmBtn" style="',
        '    padding:8px 32px;background:linear-gradient(135deg,#6f9e3f,#4c7a2a);',
        '    border:none;border-radius:30px;color:white;font-weight:bold;',
        '    cursor:pointer;font-size:0.9rem;',
        '  ">✅ 导入</button>',
        '</div>',
        '<div style="font-size:0.55rem;color:#8b6b4a;margin-top:8px;text-align:center;">',
        '💡 存档码通常很长（数千字符），请确保完整粘贴',
        '</div>'
    ].join('');

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    var closeBtn = document.getElementById('importDialogClose');
    var confirmBtn = document.getElementById('importConfirmBtn');
    var textArea = document.getElementById('importTextArea');

    function closeDialog() {
        if (overlay.parentNode) overlay.remove();
    }

    closeBtn.addEventListener('click', closeDialog);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeDialog();
    });

    confirmBtn.addEventListener('click', function() {
        var text = textArea.value.trim();
        if (!text || text.length < 10) {
            alert('❌ 请输入有效的存档码');
            return;
        }
        closeDialog();
        setTimeout(function() {
            doImport(text);
        }, 100);
    });

    textArea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            confirmBtn.click();
        }
        if (e.key === 'Escape') {
            closeDialog();
        }
    });

    setTimeout(function() {
        textArea.focus();
    }, 100);
}

// ============================================================
// ★★★ 核心导入函数（完美修复版）★★★
// ============================================================
function doImport(base64) {
    try {
        console.log('📥 开始导入存档...');

        // 1. 解码 Base64
        var compressed;
        try {
            compressed = decodeURIComponent(atob(base64));
        } catch(e) {
            try {
                compressed = atob(base64);
                console.log('📥 使用旧格式解码成功');
            } catch(e2) {
                console.error('解码失败:', e2);
                showSaveMessage('❌ 存档码格式错误，请检查是否完整复制', true);
                return;
            }
        }

        // 2. 解析 JSON
        var bundle;
        try {
            bundle = JSON.parse(compressed);
        } catch(e) {
            console.error('解析失败:', e);
            showSaveMessage('❌ 存档数据损坏，无法解析', true);
            return;
        }

        // 3. 验证元数据
        if (!bundle._meta) {
            showSaveMessage('❌ 存档码格式不兼容（缺少元数据）', true);
            return;
        }

        // 兼容旧版本（version 2 和 3 都支持）
        if (bundle._meta.version < 2 || bundle._meta.version > 3) {
            showSaveMessage('❌ 存档码版本不兼容（当前支持 v2~v3，存档版本: ' + bundle._meta.version + '）', true);
            return;
        }

        var itemCount = bundle._meta.count || 0;
        var timestamp = bundle._meta.timestamp || 0;
        var dateStr = timestamp ? new Date(timestamp).toLocaleString() : '未知';
        console.log('📥 存档信息: ' + itemCount + ' 项数据，创建于 ' + dateStr);

        // 4. 二次确认
        var confirmMsg = '⚠️ 导入将覆盖当前所有进度！\n\n';
        confirmMsg += '📦 包含 ' + itemCount + ' 项数据\n';
        confirmMsg += '📅 存档时间: ' + dateStr + '\n\n';
        confirmMsg += '确定继续吗？';
        if (!confirm(confirmMsg)) {
            console.log('📥 用户取消导入');
            return;
        }

        // 5. 清除所有现有数据（避免残留）
        console.log('📥 正在清除现有数据...');
        for (var i = 0; i < SAVE_KEYS.length; i++) {
            try {
                localStorage.removeItem(SAVE_KEYS[i]);
            } catch(e) {}
        }

        // 6. 写入新数据
        var count = 0;
        var errors = [];
        var hasChocolateSave = false;
        for (var key in bundle) {
            if (key === '_meta') continue;
            if (SAVE_KEYS.indexOf(key) !== -1) {
                try {
                    localStorage.setItem(key, bundle[key]);
                    count++;
                    console.log('📥 写入: ' + key + ' (' + (bundle[key] ? bundle[key].length : 0) + ' 字符)');
                    if (key === 'chocolate_save') {
                        hasChocolateSave = true;
                    }
                } catch(e) {
                    errors.push(key + ': ' + e.message);
                }
            } else {
                console.warn('📥 未知键名，跳过: ' + key);
            }
        }

        if (errors.length > 0) {
            console.warn('⚠️ 部分数据写入失败:', errors);
        }

        console.log('📥 导入成功！已恢复 ' + count + ' 项数据');

        // ★★★ 7. 强制重新加载主游戏数据（关键修复） ★★★
        if (hasChocolateSave) {
            try {
                // 从 localStorage 重新读取主游戏数据
                var raw = localStorage.getItem('chocolate_save');
                if (raw) {
                    var data = JSON.parse(raw);
                    // 调用 storage.js 中的加载函数（如果存在）
                    if (typeof loadGameFromData === 'function') {
                        var loaded = loadGameFromData(data);
                        console.log('📥 主游戏数据重新加载: ' + (loaded ? '成功' : '失败'));
                    } else {
                        // 降级：手动刷新变量（但 loadGameFromData 更安全）
                        console.warn('⚠️ loadGameFromData 未定义，将尝试通过刷新页面加载');
                    }
                }
            } catch(e) {
                console.warn('⚠️ 重新加载主游戏数据失败:', e);
            }
        }

        // ★★★ 8. 刷新所有 UI（即使没有主游戏数据，也要刷新其他部分） ★★★
        if (typeof refreshUI === 'function') {
            refreshUI();
            console.log('📥 UI 已刷新');
        }
        if (typeof renderSlots === 'function') {
            renderSlots();
        }
        if (typeof renderQuickSell === 'function') {
            renderQuickSell();
        }
        if (typeof renderShopUI === 'function') {
            renderShopUI();
        }
        if (typeof renderWarehouseModal === 'function') {
            renderWarehouseModal();
        }
        if (typeof updateAchievements === 'function') {
            updateAchievements();
        }
        if (typeof updateAdventurerUI === 'function') {
            updateAdventurerUI();
        }
        if (typeof initTower === 'function') {
            initTower();
        }
        if (typeof updateTowerEntry === 'function') {
            updateTowerEntry();
        }

        // 强制更新订单显示
        if (typeof updateOrderStatusDisplay === 'function') {
            updateOrderStatusDisplay();
        }

        // ★★★ 9. 强制重新计算正在生产的槽位 ★★★
        if (typeof recalcAllProducingSlots === 'function') {
            recalcAllProducingSlots();
        }

        // ★★★ 10. 保存导入时间戳，防止自动保存立即覆盖 ★★★
        localStorage.setItem('_imported_at', String(Date.now()));

        // 11. 显示成功消息
        var msg = '✅ 导入成功！已恢复 ' + count + ' 项数据';
        if (hasChocolateSave) {
            msg += '，主游戏数据已恢复';
        } else {
            msg += '，但未找到主游戏数据（可能存档不完整）';
        }
        showSaveMessage(msg, false);

        // 12. 提示刷新（虽然数据已恢复，但为保险起见建议刷新）
        if (!confirm('数据已恢复！是否立即刷新页面以确保完全生效？')) {
            return;
        }
        // 硬刷新
        localStorage.setItem('_import_complete', 'true');
        location.reload(true);

    } catch(e) {
        console.error('导入失败:', e);
        var errorMsg = e.message || '未知错误';
        if (errorMsg.includes('InvalidCharacterError') || errorMsg.includes('atob')) {
            errorMsg = '存档码格式无效，请检查是否完整复制（可能包含非法字符）';
        } else if (errorMsg.includes('SyntaxError') || errorMsg.includes('JSON')) {
            errorMsg = '存档数据损坏，请重新导出';
        }
        showSaveMessage('❌ 导入失败: ' + errorMsg, true);
    }
}

// ============================================================
// 辅助函数：显示消息（兼容主游戏）
// ============================================================
function showSaveMessage(msg, isError) {
    if (typeof showMessage === 'function') {
        showMessage(msg, isError);
    } else if (typeof showLightToast === 'function') {
        showLightToast(msg);
    } else {
        alert(msg);
    }
}

// ============================================================
// 暴露全局接口
// ============================================================
window.exportSaveToClipboard = exportSaveToClipboard;
window.importSaveFromClipboard = importSaveFromClipboard;
window.doImport = doImport;
window.showLargeTextImportDialog = showLargeTextImportDialog;

console.log('💾 存档管理器加载完成（完美修复版）');