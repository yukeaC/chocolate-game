// js/farm.js

// ============================================
// 农场配置
// ============================================
const FARM_CONFIG = {
    ROWS: 4,
    COLS: 6,
    TOTAL_LANDS: 24,
    LAND_UNLOCK: [
        { level: 1, cost: 10 }, { level: 2, cost: 50 }, { level: 3, cost: 100 },
        { level: 4, cost: 200 }, { level: 5, cost: 350 }, { level: 6, cost: 500 },
        { level: 7, cost: 700 }, { level: 8, cost: 900 }, { level: 9, cost: 1100 },
        { level: 10, cost: 1300 }, { level: 11, cost: 1600 }, { level: 12, cost: 1900 },
        { level: 13, cost: 2200 }, { level: 14, cost: 2600 }, { level: 15, cost: 3000 },
        { level: 16, cost: 3500 }, { level: 17, cost: 4000 }, { level: 18, cost: 4600 },
        { level: 19, cost: 5200 }, { level: 20, cost: 6000 }, { level: 21, cost: 6800 },
        { level: 22, cost: 8000 }, { level: 23, cost: 9500 }, { level: 24, cost: 12000 }
    ],
    getPlantConfig: function(landIndex) {
        if (landIndex < 6) {
            return { plantCost: 1, interval: 60, yield: 20, label: '1豆 → 20豆' };
        } else if (landIndex < 12) {
            return { plantCost: 5, interval: 300, yield: 80, label: '5豆 → 80豆' };
        } else if (landIndex < 18) {
            return { plantCost: 12, interval: 600, yield: 160, label: '12豆 → 160豆' };
        } else {
            return { plantCost: 20, interval: 1000, yield: 300, label: '20豆 → 300豆' };
        }
    },
    getZoneName: function(landIndex) {
        if (landIndex < 6) return '🌱 新手区';
        else if (landIndex < 12) return '🌿 成长区';
        else if (landIndex < 18) return '🌳 丰产区 ';
        else return '⭐ 大师区';
    }
};

let farmLands = [];
let farmTimer = null;

// ============================================
// 初始化
// ============================================
function initFarm() {
    console.log('🌱 初始化农场...');
    const saved = localStorage.getItem('farm_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            farmLands = data.lands || [];
            if (farmLands.length !== FARM_CONFIG.TOTAL_LANDS) {
                resetFarmLands();
            }
        } catch(e) {
            resetFarmLands();
        }
    } else {
        resetFarmLands();
    }
    startFarmLoop();
    console.log('✅ 农场初始化完成');
}

function resetFarmLands() {
    farmLands = [];
    for (let i = 0; i < FARM_CONFIG.TOTAL_LANDS; i++) {
        farmLands.push({
            level: 1,
            status: 'idle',
            unlocked: false,
            plantedAt: null,
            readyAt: null,
            plantConfig: null
        });
    }
    saveFarmData();
}

function saveFarmData() {
    const data = { lands: farmLands };
    localStorage.setItem('farm_data', JSON.stringify(data));
}

// ============================================
// 解锁
// ============================================
function getLandUnlockInfo(index) {
    if (index < 0 || index >= FARM_CONFIG.LAND_UNLOCK.length) {
        return { level: 99, cost: 99999 };
    }
    return FARM_CONFIG.LAND_UNLOCK[index];
}

function unlockLand(index) {
    if (index < 0 || index >= farmLands.length) return false;
    const land = farmLands[index];
    if (land.unlocked) return false;
    
    const info = getLandUnlockInfo(index);
    if (typeof level === 'undefined' || level < info.level) {
        if (typeof showMessage === 'function') {
            showMessage('需要达到 ' + info.level + ' 级才能解锁', true);
        }
        return false;
    }
    if (typeof gold === 'undefined' || gold < info.cost) {
        if (typeof showMessage === 'function') {
            showMessage('金币不足！需要 ' + info.cost + ' 金币', true);
        }
        return false;
    }
    
    gold -= info.cost;
    land.unlocked = true;
    saveFarmData();
    if (typeof refreshUI === 'function') refreshUI();
    if (typeof renderFarm === 'function') renderFarm();
    if (typeof showMessage === 'function') {
        showMessage('🔓 土地 ' + (index + 1) + ' 已解锁！', false);
    }
    
    if (typeof soundUnlock === 'function') soundUnlock();
    
    return true;
}

function getUnlockedCount() {
    let count = 0;
    for (let i = 0; i < farmLands.length; i++) {
        if (farmLands[i].unlocked) count++;
    }
    return count;
}

// ============================================
// 农场循环
// ============================================
function startFarmLoop() {
    if (farmTimer) clearInterval(farmTimer);
    farmTimer = setInterval(function() {
        updateFarm();
        if (typeof updateFarmUI === 'function') {
            updateFarmUI();
        }
    }, 1000);
}

function updateFarm() {
    const now = Date.now();
    let needSave = false;
    
    for (let i = 0; i < farmLands.length; i++) {
        const land = farmLands[i];
        if (!land.unlocked) continue;
        if (land.status === 'growing' && land.readyAt) {
            if (now >= land.readyAt) {
                land.status = 'ready';
                needSave = true;
            }
        }
    }
    
    if (needSave) {
        saveFarmData();
    }
}

// ============================================
// 核心操作
// ============================================
function plantLand(index) {
    if (index < 0 || index >= farmLands.length) return false;
    const land = farmLands[index];
    
    if (!land.unlocked) {
        if (typeof showMessage === 'function') showMessage('🔒 这块土地尚未解锁', true);
        return false;
    }
    if (land.status !== 'idle') {
        if (typeof showMessage === 'function') showMessage('这块土地已经有作物了', true);
        return false;
    }
    
    const config = FARM_CONFIG.getPlantConfig(index);
    
    if (typeof cocoaBeans === 'undefined' || cocoaBeans < config.plantCost) {
        if (typeof showMessage === 'function') {
            showMessage('豆子不足！种植需要 ' + config.plantCost + ' 颗豆子', true);
        }
        return false;
    }
    
    cocoaBeans -= config.plantCost;
    const now = Date.now();
    land.status = 'growing';
    land.plantedAt = now;
    land.readyAt = now + config.interval * 1000;
    land.plantConfig = { plantCost: config.plantCost, interval: config.interval, yield: config.yield };
    
    if (typeof refreshUI === 'function') refreshUI();
    saveFarmData();
    if (typeof autoSaveEnabled !== 'undefined' && autoSaveEnabled && typeof saveGame === 'function') saveGame();
    
    if (typeof updateFarmUI === 'function') {
        updateFarmUI();
    }
    requestAnimationFrame(function() {
        if (typeof updateFarmUI === 'function') {
            updateFarmUI();
        }
    });
    
    if (typeof showMessage === 'function') {
        showMessage('🌱 种植成功！消耗 ' + config.plantCost + ' 豆，' + config.interval + '秒后收获 ' + config.yield + ' 豆', false);
    }
    
    if (typeof soundPlant === 'function') soundPlant();
    
    return true;
}

function harvestLand(index) {
    if (index < 0 || index >= farmLands.length) return false;
    const land = farmLands[index];
    
    if (!land.unlocked) {
        if (typeof showMessage === 'function') showMessage('🔒 这块土地尚未解锁', true);
        return false;
    }
    if (land.status !== 'ready') {
        if (typeof showMessage === 'function') showMessage('还没有成熟', true);
        return false;
    }
    
    const config = land.plantConfig || FARM_CONFIG.getPlantConfig(index);
    const yieldAmount = config.yield || 20;
    
    cocoaBeans += yieldAmount;
    if (typeof totalBeansHarvested !== 'undefined') {
        totalBeansHarvested += yieldAmount;
    }
    
    land.status = 'idle';
    land.plantedAt = null;
    land.readyAt = null;
    land.plantConfig = null;
    
    if (typeof refreshUI === 'function') refreshUI();
    
    if (typeof updateFarmUI === 'function') {
        updateFarmUI();
    }
    requestAnimationFrame(function() {
        if (typeof updateFarmUI === 'function') {
            updateFarmUI();
        }
    });
    
    saveFarmData();
    if (typeof autoSaveEnabled !== 'undefined' && autoSaveEnabled && typeof saveGame === 'function') saveGame();
    
    if (typeof showMessage === 'function') {
        showMessage('🫘 收获 ' + yieldAmount + ' 颗豆子！', false);
    }
    
    if (typeof soundCollect === 'function') soundCollect();
    
    if (typeof onTowerFarmHarvested === 'function') onTowerFarmHarvested();
    
    return true;
}

function upgradeLand(index) {
    if (index < 0 || index >= farmLands.length) return false;
    const land = farmLands[index];
    
    if (!land.unlocked) {
        if (typeof showMessage === 'function') showMessage('🔒 这块土地尚未解锁', true);
        return false;
    }
    if (typeof showMessage === 'function') {
        showMessage('📌 土地等级由区域自动决定，无需升级', true);
    }
    return false;
}

// ============================================
// 一键功能
// ============================================
function harvestAllLands() {
    let harvested = 0;
    let totalYield = 0;
    
    for (let i = 0; i < farmLands.length; i++) {
        const land = farmLands[i];
        if (!land.unlocked) continue;
        if (land.status === 'ready') {
            const config = land.plantConfig || FARM_CONFIG.getPlantConfig(i);
            const yieldAmount = config.yield || 20;
            cocoaBeans += yieldAmount;
            if (typeof totalBeansHarvested !== 'undefined') {
                totalBeansHarvested += yieldAmount;
            }
            totalYield += yieldAmount;
            harvested++;
            land.status = 'idle';
            land.plantedAt = null;
            land.readyAt = null;
            land.plantConfig = null;
        }
    }
    
    if (harvested === 0) {
        if (typeof showMessage === 'function') {
            showMessage('🌾 没有可收获的土地', true);
        }
        return false;
    }
    
    if (typeof showMessage === 'function') {
        showMessage('🌾 收获 ' + harvested + ' 块土地，获得 ' + totalYield + ' 颗豆子！', false);
    }
    if (typeof refreshUI === 'function') refreshUI();
    if (typeof updateFarmUI === 'function') updateFarmUI();
    requestAnimationFrame(function() {
        if (typeof updateFarmUI === 'function') {
            updateFarmUI();
        }
    });
    saveFarmData();
    if (typeof autoSaveEnabled !== 'undefined' && autoSaveEnabled && typeof saveGame === 'function') saveGame();
    
    if (typeof soundCollect === 'function') soundCollect();
    
    if (typeof onTowerFarmHarvested === 'function') {
        for (var i = 0; i < harvested; i++) onTowerFarmHarvested();
    }
    
    return true;
}

function plantAllLands() {
    let planted = 0;
    let totalCost = 0;
    let canPlantAny = false;
    
    for (let i = 0; i < farmLands.length; i++) {
        const land = farmLands[i];
        if (!land.unlocked) continue;
        if (land.status === 'idle') {
            canPlantAny = true;
            break;
        }
    }
    
    if (!canPlantAny) {
        if (typeof showMessage === 'function') {
            showMessage('🌱 没有空闲土地可种植', true);
        }
        return false;
    }
    
    for (let i = 0; i < farmLands.length; i++) {
        const land = farmLands[i];
        if (!land.unlocked) continue;
        if (land.status === 'idle') {
            const config = FARM_CONFIG.getPlantConfig(i);
            if (typeof cocoaBeans !== 'undefined' && cocoaBeans >= config.plantCost) {
                cocoaBeans -= config.plantCost;
                totalCost += config.plantCost;
                const now = Date.now();
                land.status = 'growing';
                land.plantedAt = now;
                land.readyAt = now + config.interval * 1000;
                land.plantConfig = { plantCost: config.plantCost, interval: config.interval, yield: config.yield };
                planted++;
            }
        }
    }
    
    if (planted === 0) {
        if (typeof showMessage === 'function') {
            showMessage('豆子不足！无法种植任何土地', true);
        }
        return false;
    }
    
    if (typeof showMessage === 'function') {
        showMessage('🌱 种植了 ' + planted + ' 块土地，消耗 ' + totalCost + ' 颗豆子', false);
    }
    if (typeof refreshUI === 'function') refreshUI();
    if (typeof updateFarmUI === 'function') updateFarmUI();
    requestAnimationFrame(function() {
        if (typeof updateFarmUI === 'function') {
            updateFarmUI();
        }
    });
    saveFarmData();
    if (typeof autoSaveEnabled !== 'undefined' && autoSaveEnabled && typeof saveGame === 'function') saveGame();
    
    if (typeof soundPlant === 'function') soundPlant();
    
    return true;
}

// ============================================
// 获取土地状态
// ============================================
function getLandStatus(index) {
    if (index < 0 || index >= farmLands.length) return null;
    const land = farmLands[index];
    if (!land) return null;
    
    const config = FARM_CONFIG.getPlantConfig(index);
    const now = Date.now();
    let progress = 0;
    let remainingTime = 0;
    
    if (!land.unlocked) {
        const info = getLandUnlockInfo(index);
        return {
            isUnlocked: false,
            requiredLevel: info.level,
            unlockCost: info.cost,
            status: 'locked',
            statusIcon: '🔒',
            statusText: 'Lv.' + info.level,
            costText: '🪙' + info.cost,
            progress: 0,
            remainingTime: 0,
            canPlant: false,
            canHarvest: false,
            canUpgrade: false,
            displayText: '🔒 Lv.' + info.level,
            zoneName: FARM_CONFIG.getZoneName(index),
            plantCost: config.plantCost,
            yieldAmount: config.yield,
            interval: config.interval
        };
    }
    
    switch(land.status) {
        case 'idle':
            return {
                isUnlocked: true,
                status: 'idle',
                statusIcon: '',
                statusText: '待种植',
                progress: 0,
                remainingTime: 0,
                canPlant: true,
                canHarvest: false,
                canUpgrade: false,
                displayText: '待种植',
                zoneName: FARM_CONFIG.getZoneName(index),
                plantCost: config.plantCost,
                yieldAmount: config.yield,
                interval: config.interval,
                label: config.label
            };
        case 'growing':
            const plantedAt = land.plantedAt || 0;
            const readyAt = land.readyAt || 0;
            const totalTime = readyAt - plantedAt;
            const elapsed = now - plantedAt;
            progress = totalTime > 0 ? Math.max(0, Math.min(100, (elapsed / totalTime) * 100)) : 0;
            remainingTime = Math.max(0, Math.ceil((readyAt - now) / 1000));
            const plantConfig = land.plantConfig || config;
            return {
                isUnlocked: true,
                status: 'growing',
                statusIcon: '🌱',
                statusText: remainingTime + 's',
                progress: progress,
                remainingTime: remainingTime,
                canPlant: false,
                canHarvest: false,
                canUpgrade: false,
                displayText: remainingTime + 's',
                zoneName: FARM_CONFIG.getZoneName(index),
                plantCost: plantConfig.plantCost || config.plantCost,
                yieldAmount: plantConfig.yield || config.yield,
                interval: plantConfig.interval || config.interval,
                label: config.label
            };
        case 'ready':
            const readyConfig = land.plantConfig || config;
            return {
                isUnlocked: true,
                status: 'ready',
                statusIcon: '🫘',
                statusText: '收获!',
                progress: 100,
                remainingTime: 0,
                canPlant: false,
                canHarvest: true,
                canUpgrade: false,
                displayText: '收获!',
                zoneName: FARM_CONFIG.getZoneName(index),
                plantCost: readyConfig.plantCost || config.plantCost,
                yieldAmount: readyConfig.yield || config.yield,
                interval: readyConfig.interval || config.interval,
                label: config.label
            };
        default:
            return {
                isUnlocked: true,
                status: 'idle',
                statusIcon: '',
                statusText: '待种植',
                progress: 0,
                remainingTime: 0,
                canPlant: true,
                canHarvest: false,
                canUpgrade: false,
                displayText: '待种植',
                zoneName: FARM_CONFIG.getZoneName(index),
                plantCost: config.plantCost,
                yieldAmount: config.yield,
                interval: config.interval,
                label: config.label
            };
    }
}

// ============================================
// 获取农场统计
// ============================================
function getFarmStats() {
    let idle = 0, growing = 0, ready = 0, locked = 0;
    let unlockedCount = 0;
    
    for (let i = 0; i < farmLands.length; i++) {
        const land = farmLands[i];
        if (!land.unlocked) { locked++; continue; }
        unlockedCount++;
        if (land.status === 'idle') idle++;
        else if (land.status === 'growing') growing++;
        else if (land.status === 'ready') ready++;
    }
    
    return {
        total: farmLands.length,
        unlocked: unlockedCount,
        locked: locked,
        idle: idle,
        growing: growing,
        ready: ready
    };
}

// ============================================
// 渲染农场UI
// ============================================
function renderFarm() {
    const container = document.getElementById('farmLands');
    if (!container) return;
    container.innerHTML = '';
    
    const stats = getFarmStats();
    updateFarmStats(stats);
    
    for (let row = 0; row < FARM_CONFIG.ROWS; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.style.cssText = 'display:grid;grid-template-columns:repeat(6,1fr);gap:5px;margin-bottom:5px;';
        
        for (let col = 0; col < FARM_CONFIG.COLS; col++) {
            const index = row * FARM_CONFIG.COLS + col;
            const status = getLandStatus(index);
            if (!status) continue;
            
            const div = document.createElement('div');
            div.className = 'farm-land';
            div.dataset.index = index;
            
            if (!status.isUnlocked) {
                div.classList.add('farm-locked');
                div.innerHTML = `
                    <div class="farm-lock-level" style="font-size:0.85rem;">🔒 ${status.statusText}</div>
                    <div class="farm-lock-cost" style="font-size:0.7rem;">${status.costText}</div>
                    <div class="farm-zone-label" style="font-size:0.65rem;color:#a56b3a;margin-top:2px;">${status.zoneName}</div>
                `;
                div.addEventListener('click', function() {
                    const idx = parseInt(this.dataset.index);
                    unlockLand(idx);
                });
            } else {
                if (status.status === 'idle') {
                    div.classList.add('farm-idle');
                    div.innerHTML = `
                        <div class="farm-idle-text" style="font-size:0.75rem;font-weight:bold;">🟫 种植</div>
                        <div style="font-size:0.65rem;color:#7b4a2a;font-weight:bold;">${status.label}</div>
                        <div class="farm-zone-label" style="font-size:0.6rem;color:#5a3a1a;margin-top:2px;">${status.zoneName}</div>
                    `;
                } else if (status.status === 'growing') {
                    div.classList.add('farm-growing');
                    div.innerHTML = `
                        <div class="farm-icon" style="font-size:1.8rem;">🌱</div>
                        <div class="farm-progress">
                            <div class="farm-progress-bar" style="width:${status.progress}%"></div>
                        </div>
                        <div class="farm-time" style="font-size:0.7rem;font-weight:bold;">${status.remainingTime}s</div>
                        <div style="font-size:0.55rem;color:#5a7a3a;">${status.label}</div>
                    `;
                } else if (status.status === 'ready') {
                    div.classList.add('farm-ready');
                    div.innerHTML = `
                        <div class="farm-icon" style="font-size:2.2rem;">🫘</div>
                        <div class="farm-ready-text" style="font-size:0.75rem;font-weight:bold;">点击收获</div>
                        <div style="font-size:0.7rem;color:#e65100;font-weight:bold;">+${status.yieldAmount}豆</div>
                    `;
                }
                
                div.addEventListener('click', function() {
                    const idx = parseInt(this.dataset.index);
                    const st = getLandStatus(idx);
                    if (!st) return;
                    if (st.canHarvest) harvestLand(idx);
                    else if (st.canPlant) plantLand(idx);
                });
            }
            rowDiv.appendChild(div);
        }
        container.appendChild(rowDiv);
    }
}

function updateFarmStats(stats) {
    const statsEl = document.getElementById('farmStats');
    if (statsEl) {
        statsEl.innerHTML = `
            <span>🫘 库存: ${Math.floor(cocoaBeans || 0)}</span>
            <span>🌱 空闲: ${stats.idle}</span>
            <span>🌿 生长: ${stats.growing}</span>
            <span>🫘 成熟: ${stats.ready}</span>
            <span>🔓 ${stats.unlocked}/${stats.total}</span>
            <span style="color:#e65100;background:#fff3e0;padding:0 8px;border-radius:12px;font-size:0.6rem;">
                🌱新手1豆→20豆 | 🌿成长5豆→80豆 | 🌳丰收12豆→160豆 | ⭐大师20豆→300豆
            </span>
        `;
    }
}

function updateFarmUI() {
    const stats = getFarmStats();
    updateFarmStats(stats);
    
    const lands = document.querySelectorAll('.farm-land');
    lands.forEach(function(div, i) {
        if (i >= farmLands.length) return;
        const status = getLandStatus(i);
        if (!status) return;
        
        if (!status.isUnlocked) {
            div.className = 'farm-land farm-locked';
            div.innerHTML = `
                <div class="farm-lock-level" style="font-size:0.85rem;">🔒 ${status.statusText}</div>
                <div class="farm-lock-cost" style="font-size:0.7rem;">${status.costText}</div>
                <div class="farm-zone-label" style="font-size:0.65rem;color:#a56b3a;margin-top:2px;">${status.zoneName}</div>
            `;
            return;
        }
        
        div.className = 'farm-land';
        
        if (status.status === 'idle') {
            div.classList.add('farm-idle');
            div.innerHTML = `
                <div class="farm-idle-text" style="font-size:0.75rem;font-weight:bold;">🟫 种植</div>
                <div style="font-size:0.65rem;color:#7b4a2a;font-weight:bold;">${status.label}</div>
                <div class="farm-zone-label" style="font-size:0.6rem;color:#5a3a1a;margin-top:2px;">${status.zoneName}</div>
            `;
        } else if (status.status === 'growing') {
            div.classList.add('farm-growing');
            div.innerHTML = `
                <div class="farm-icon" style="font-size:1.8rem;">🌱</div>
                <div class="farm-progress">
                    <div class="farm-progress-bar" style="width:${status.progress}%"></div>
                </div>
                <div class="farm-time" style="font-size:0.7rem;font-weight:bold;">${status.remainingTime}s</div>
                <div style="font-size:0.55rem;color:#5a7a3a;">${status.label}</div>
            `;
        } else if (status.status === 'ready') {
            div.classList.add('farm-ready');
            div.innerHTML = `
                <div class="farm-icon" style="font-size:2.2rem;">🫘</div>
                <div class="farm-ready-text" style="font-size:0.75rem;font-weight:bold;">点击收获</div>
                <div style="font-size:0.7rem;color:#e65100;font-weight:bold;">+${status.yieldAmount}豆</div>
            `;
        }
    });
}

// ============================================
// 打开/关闭农场
// ============================================
function openFarm() {
    const modal = document.getElementById('farmModal');
    if (!modal) return;
    renderFarm();
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
}

function closeFarm() {
    const modal = document.getElementById('farmModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }
}

// ============================================
// 暴露全局接口
// ============================================
window.FARM_CONFIG = FARM_CONFIG;
window.initFarm = initFarm;
window.renderFarm = renderFarm;
window.updateFarmUI = updateFarmUI;
window.plantLand = plantLand;
window.harvestLand = harvestLand;
window.upgradeLand = upgradeLand;
window.harvestAllLands = harvestAllLands;
window.plantAllLands = plantAllLands;
window.unlockLand = unlockLand;
window.getFarmStats = getFarmStats;
window.openFarm = openFarm;
window.closeFarm = closeFarm;
window.saveFarmData = saveFarmData;
window.resetFarmLands = resetFarmLands;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initFarm();
    });
} else {
    initFarm();
}

console.log('🌱 农场系统已加载（修复版）');