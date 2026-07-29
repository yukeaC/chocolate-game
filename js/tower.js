// js/tower.js
// ============================================================
// tower.js · 挑战塔系统（92层 · 修复所有任务类型）
// ============================================================

console.log('🏛️ 挑战塔系统加载中...');

// ============================================================
// 配置
// ============================================================
var TOWER_CONFIG = {
    MAX_FLOOR: 92,
    REPEAT_REWARD_RATE: 0.5,
    RESET_HOUR: 4
};

// 产品时间映射（秒）
var PRODUCT_TIMES = {
    charlieChocolate: 10,
    cherryInfinity: 30,
    hawthornStack: 60,
    sunEggToast: 180,
    cheeseCocoa: 480,
    milkSkinDelight: 720,
    luckyPeanut: 1200,
    tiramisuCroissant: 3600
};
var HIDDEN_TIME = 929;

// 稀有鱼类型（用于挑战塔统计）
var RARE_FISH_TYPES = ['pearlfish', 'bluewhale', 'legendfish'];

// ============================================================
// 状态
// ============================================================
var towerState = {
    currentFloor: 1,
    highestFloor: 0,
    stars: {},
    claimedFirstReward: {},
    lastResetDate: '',
    totalStars: 0,
    history: [],
    challengeStatus: 'idle',
    challengeFloor: 0,
    challengeStartTime: 0,
    challengeTimeLimit: 0,
    challengeTarget: null,
    _snapshot: {},
    _ordersCompletedSinceStart: 0,
    _farmHarvestsSinceStart: 0,
    _fishCaughtSinceStart: 0,
    _rareFishCaughtSinceStart: 0,
    _ironMinedSinceStart: 0,      // 新增：铁矿计数
    _diamondMinedSinceStart: 0,   // 新增：钻石计数
    _cookCountSinceStart: 0,
    _tradeCountSinceStart: 0,
    _perfectCountSinceStart: 0,
    _historyView: 'list'
};

var towerData = [];
var _towerTimerInterval = null;
var _towerAnimationId = null;
var _towerLastUpdateTime = 0;

// ============================================================
// 数据持久化
// ============================================================
function loadTowerData() {
    try {
        var saved = localStorage.getItem('tower_data');
        if (saved) {
            var data = JSON.parse(saved);
            towerState.currentFloor = data.currentFloor || 1;
            towerState.highestFloor = data.highestFloor || 0;
            towerState.stars = data.stars || {};
            towerState.claimedFirstReward = data.claimedFirstReward || {};
            towerState.lastResetDate = data.lastResetDate || '';
            towerState.totalStars = data.totalStars || 0;
            towerState.history = data.history || [];
            towerState.challengeStatus = data.challengeStatus || 'idle';
            towerState.challengeFloor = data.challengeFloor || 0;
            towerState.challengeStartTime = data.challengeStartTime || 0;
            towerState.challengeTimeLimit = data.challengeTimeLimit || 0;
            towerState.challengeTarget = data.challengeTarget || null;
            towerState._snapshot = data._snapshot || {};
            towerState._ordersCompletedSinceStart = data._ordersCompletedSinceStart || 0;
            towerState._farmHarvestsSinceStart = data._farmHarvestsSinceStart || 0;
            towerState._fishCaughtSinceStart = data._fishCaughtSinceStart || 0;
            towerState._rareFishCaughtSinceStart = data._rareFishCaughtSinceStart || 0;
            towerState._ironMinedSinceStart = data._ironMinedSinceStart || 0;
            towerState._diamondMinedSinceStart = data._diamondMinedSinceStart || 0;
            towerState._cookCountSinceStart = data._cookCountSinceStart || 0;
            towerState._tradeCountSinceStart = data._tradeCountSinceStart || 0;
            towerState._perfectCountSinceStart = data._perfectCountSinceStart || 0;
        }
    } catch(e) { console.warn('加载挑战塔数据失败:', e); }
    checkDailyReset();
}

function saveTowerData() {
    try {
        var data = {
            currentFloor: towerState.currentFloor,
            highestFloor: towerState.highestFloor,
            stars: towerState.stars,
            claimedFirstReward: towerState.claimedFirstReward,
            lastResetDate: towerState.lastResetDate,
            totalStars: towerState.totalStars,
            history: towerState.history,
            challengeStatus: towerState.challengeStatus,
            challengeFloor: towerState.challengeFloor,
            challengeStartTime: towerState.challengeStartTime,
            challengeTimeLimit: towerState.challengeTimeLimit,
            challengeTarget: towerState.challengeTarget,
            _snapshot: towerState._snapshot,
            _ordersCompletedSinceStart: towerState._ordersCompletedSinceStart || 0,
            _farmHarvestsSinceStart: towerState._farmHarvestsSinceStart || 0,
            _fishCaughtSinceStart: towerState._fishCaughtSinceStart || 0,
            _rareFishCaughtSinceStart: towerState._rareFishCaughtSinceStart || 0,
            _ironMinedSinceStart: towerState._ironMinedSinceStart || 0,
            _diamondMinedSinceStart: towerState._diamondMinedSinceStart || 0,
            _cookCountSinceStart: towerState._cookCountSinceStart || 0,
            _tradeCountSinceStart: towerState._tradeCountSinceStart || 0,
            _perfectCountSinceStart: towerState._perfectCountSinceStart || 0
        };
        localStorage.setItem('tower_data', JSON.stringify(data));
    } catch(e) { console.warn('保存挑战塔数据失败:', e); }
}

function checkDailyReset() {
    var today = getTodayDateStr();
    if (towerState.lastResetDate !== today) {
        towerState.lastResetDate = today;
        saveTowerData();
    }
}

// 使用 utils.js 中的 getTodayDateStr，如果不存在则自己定义
if (typeof getTodayDateStr !== 'function') {
    function getTodayDateStr() {
        var d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }
}

// ============================================================
// 塔数据生成（修复所有任务描述）
// ============================================================
function generateTowerData() {
    var floors = [];
    var bossFloors = [10, 20, 30, 40, 50, 60, 70, 80, 90, 92];
    var productNames = {
        charlieChocolate: '查理的巧克力',
        cherryInfinity: '樱有尽有',
        hawthornStack: '好事楂堆',
        sunEggToast: '小太阳蛋元气吐司',
        cheeseCocoa: '芝士可可',
        milkSkinDelight: '万事米丽奶皮子',
        luckyPeanut: '好事花生',
        tiramisuCroissant: '提拉米苏可颂'
    };
    var productIds = ['charlieChocolate', 'cherryInfinity', 'hawthornStack', 'sunEggToast', 'cheeseCocoa', 'milkSkinDelight', 'luckyPeanut', 'tiramisuCroissant'];
    
    for (var i = 1; i <= TOWER_CONFIG.MAX_FLOOR; i++) {
        var isBoss = bossFloors.indexOf(i) !== -1;
        var level = i;
        var targetDesc = '';
        var targetType = '';
        var targetParams = {};
        var timeLimit = 60;
        var rewardBeans = 10 + level * 2;
        var rewardGold = 5 + level * 1;
        if (isBoss) {
            rewardBeans = rewardBeans * 2;
            rewardGold = rewardGold * 2;
        }
        var items = [];
        
        var stage = 0;
        if (level <= 15) stage = 0;
        else if (level <= 30) stage = 1;
        else if (level <= 45) stage = 2;
        else if (level <= 60) stage = 3;
        else if (level <= 75) stage = 4;
        else stage = 5;
        
        var typeIdx = (level - 1) % 10;
        var availableTypes = [];
        if (stage === 0) {
            availableTypes = ['produce', 'sell', 'farm', 'produce', 'sell', 'farm', 'produce', 'sell'];
        } else if (stage === 1) {
            availableTypes = ['produce', 'sell', 'order', 'farm', 'produce', 'sell', 'order', 'farm', 'produce', 'order'];
        } else if (stage === 2) {
            availableTypes = ['produce', 'sell', 'order', 'fish', 'produce', 'sell', 'order', 'fish', 'produce', 'fish'];
        } else if (stage === 3) {
            availableTypes = ['produce', 'sell', 'trade', 'mine', 'order', 'produce', 'sell', 'trade', 'mine', 'fish'];
        } else if (stage === 4) {
            availableTypes = ['produce', 'sell', 'cook', 'hidden', 'trade', 'mine', 'produce', 'sell', 'cook', 'hidden'];
        } else {
            availableTypes = ['produce', 'sell', 'hidden', 'cook', 'trade', 'mine', 'produce', 'sell', 'hidden', 'cook'];
        }
        
        var type = availableTypes[typeIdx % availableTypes.length];
        
        switch (type) {
            case 'produce':
                var idx = Math.min(Math.floor((level - 1) / 10), productIds.length - 1);
                var pid = productIds[idx];
                var count = 1 + Math.floor(level / 15);
                if (count > 4) count = 4;
                if (stage >= 4) count = 2 + Math.floor(level / 20);
                if (count > 5) count = 5;
                targetDesc = '制作 ' + count + ' 个' + productNames[pid];
                targetType = 'produce';
                targetParams = { productId: pid, count: count };
                var productTime = PRODUCT_TIMES[pid] || 10;
                timeLimit = Math.floor(productTime * count * 1.5) + 30;
                if (timeLimit < 60) timeLimit = 60;
                break;
                
            case 'sell':
                var goldTarget = 20 + level * 5;
                var goldCap = 300 + Math.floor(level / 10) * 100;
                var gold = Math.min(goldTarget, goldCap);
                if (gold < 20) gold = 20;
                targetDesc = '出售赚取 ' + gold + ' 金币';
                targetType = 'sell';
                targetParams = { gold: gold };
                timeLimit = 60 + Math.floor(gold / 3);
                if (timeLimit > 600) timeLimit = 600;
                break;
                
            case 'order':
                var count = 1 + Math.floor(level / 20);
                if (count > 5) count = 5;
                targetDesc = '完成 ' + count + ' 个订单';
                targetType = 'order';
                targetParams = { count: count };
                timeLimit = 120 + count * 60;
                break;
                
            case 'farm':
                var count = 1 + Math.floor(level / 15);
                if (count > 8) count = 8;
                targetDesc = '收获 ' + count + ' 块土地';
                targetType = 'farm';
                targetParams = { count: count };
                timeLimit = 60 + count * 20;
                break;
                
            case 'fish':
                var totalNeeded = 1 + Math.floor(level / 20);
                if (totalNeeded > 6) totalNeeded = 6;
                var rareNeeded = 0;
                if (level > 40) rareNeeded = 1;
                if (level > 60) rareNeeded = 1 + Math.floor((level - 60) / 20);
                if (rareNeeded > 2) rareNeeded = 2;
                if (rareNeeded > totalNeeded) rareNeeded = totalNeeded;
                targetDesc = '钓到 ' + totalNeeded + ' 条鱼';
                if (rareNeeded > 0) {
                    targetDesc += '（其中至少 ' + rareNeeded + ' 条为稀有/传说鱼）';
                }
                targetType = 'fish';
                targetParams = { count: totalNeeded, rare: rareNeeded };
                timeLimit = 60 + totalNeeded * 30 + rareNeeded * 30;
                break;
                
            case 'mine':
                var count = 1 + Math.floor(level / 25);
                if (count > 4) count = 4;
                var diamond = (level > 50 && level % 5 === 0);
                targetDesc = '挖到 ' + count + ' 块' + (diamond ? '钻石' : '铁矿');
                targetType = 'mine';
                targetParams = { count: count, diamond: diamond };
                timeLimit = 60 + count * 30 + (diamond ? 60 : 0);
                break;
                
            case 'trade':
                var count = 1 + Math.floor(level / 20);
                if (count > 6) count = 6;
                targetDesc = '完成 ' + count + ' 次交易';
                targetType = 'trade';
                targetParams = { count: count };
                timeLimit = 60 + count * 30;
                break;
                
            case 'cook':
                var count = 1 + Math.floor(level / 20);
                if (count > 6) count = 6;
                targetDesc = '烹饪出 ' + count + ' 份食物';
                targetType = 'cook';
                targetParams = { count: count };
                timeLimit = 60 + count * 30;
                break;
                
            case 'hidden':
                var count = 1 + Math.floor(level / 25);
                if (count > 5) count = 5;
                targetDesc = '制作 ' + count + ' 个隐藏产品';
                targetType = 'hidden';
                targetParams = { count: count };
                timeLimit = 60 + count * HIDDEN_TIME * 0.8;
                if (timeLimit > 3600) timeLimit = 3600;
                break;
                
            default:
                targetDesc = '制作 1 个查理的巧克力';
                targetType = 'produce';
                targetParams = { productId: 'charlieChocolate', count: 1 };
                timeLimit = 60;
        }
        
        if (isBoss) {
            timeLimit = Math.floor(timeLimit * 1.5);
            items.push({ id: 'speed_up', amount: 1 + Math.floor(level / 25) });
            if (level >= 50) items.push({ id: 'energy_box', amount: 1 });
            if (level >= 70) items.push({ id: 'lucky_box', amount: 1 });
            if (level === 92) {
                rewardBeans += 200;
                rewardGold += 100;
                items.push({ id: 'energy_box', amount: 2 });
                items.push({ id: 'lucky_box', amount: 2 });
                items.push({ id: 'speed_up', amount: 3 });
            }
        } else {
            if (level % 10 === 5) items.push({ id: 'refresh', amount: 1 });
            if (level % 10 === 0 && level > 0) items.push({ id: 'speed_up', amount: 1 });
        }
        
        if (timeLimit < 30) timeLimit = 30;
        if (timeLimit > 7200) timeLimit = 7200;
        
        floors.push({
            floor: i,
            isBoss: isBoss,
            timeLimit: Math.floor(timeLimit),
            targetDesc: targetDesc,
            targetType: targetType,
            targetParams: targetParams,
            rewards: {
                beans: Math.floor(rewardBeans),
                gold: Math.floor(rewardGold),
                items: items
            }
        });
    }
    return floors;
}

// ============================================================
// 核心功能
// ============================================================
function initTower() {
    console.log('🏛️ initTower 开始执行');
    towerData = generateTowerData();
    console.log('🏛️ 塔数据生成完成，共 ' + towerData.length + ' 层');
    loadTowerData();
    console.log('🏛️ 加载存档数据完成，最高层: ' + towerState.highestFloor);
    if (towerState.challengeStatus === 'in_progress') {
        resumeChallengeTimer();
    }
    updateTowerEntry();
    console.log('🏛️ 挑战塔已加载，共 ' + towerData.length + ' 层，最高层: ' + towerState.highestFloor);
}

function getFloorData(floor) {
    return towerData.find(function(f) { return f.floor === floor; });
}

function getNextUnlockedFloor() {
    return towerState.highestFloor + 1;
}

function canChallenge(floor) {
    var floorData = getFloorData(floor);
    if (!floorData) return false;
    if (floor > towerState.highestFloor + 1) return false;
    return true;
}

// ============================================================
// 创建模态框
// ============================================================
function createTowerModal() {
    console.log('🏛️ createTowerModal 被调用');
    var oldModal = document.getElementById('towerModal');
    if (oldModal) {
        console.log('🏛️ 发现已存在的模态框，先移除');
        oldModal.remove();
    }
    
    var modal = document.createElement('div');
    modal.id = 'towerModal';
    modal.className = 'modal hidden';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:none;align-items:center;justify-content:center;z-index:10000;';
    modal.innerHTML = `
        <div style="max-width:480px;width:95%;background:#faf0e0;border-radius:48px;padding:24px 28px;box-shadow:0 20px 60px rgba(60,40,20,0.25);border:1px solid #dcc8b0;position:relative;">
            <div id="towerModalContent"></div>
        </div>
    `;
    document.body.appendChild(modal);
    console.log('🏛️ 模态框已创建并添加到 DOM');
    return modal;
}

// ============================================================
// 打开挑战信息面板
// ============================================================
function openTowerInfo() {
    console.log('🏛️ openTowerInfo 被调用');
    
    var floor = getNextUnlockedFloor();
    console.log('🏛️ 下一层: ' + floor + ', 最大层: ' + TOWER_CONFIG.MAX_FLOOR);
    
    if (floor > TOWER_CONFIG.MAX_FLOOR) {
        var has92 = false;
        for (var i = 0; i < towerState.history.length; i++) {
            if (towerState.history[i].floor === TOWER_CONFIG.MAX_FLOOR) {
                has92 = true;
                break;
            }
        }
        if (has92) {
            showTowerToast('🎉 你已征服了所有92层！', false);
            console.log('🏛️ 已通关所有层，退出');
            return;
        } else {
            console.warn('🏛️ 数据异常：highestFloor=' + towerState.highestFloor + ' 但没有第92层通关记录，重置最高层');
            towerState.highestFloor = 0;
            towerState.currentFloor = 1;
            saveTowerData();
            floor = 1;
        }
    }
    
    if (floor > TOWER_CONFIG.MAX_FLOOR) {
        floor = TOWER_CONFIG.MAX_FLOOR;
    }
    
    var floorData = getFloorData(floor);
    if (!floorData) {
        showTowerToast('❌ 楼层数据加载失败', true);
        return;
    }
    
    var modal = document.getElementById('towerModal');
    if (!modal) {
        modal = createTowerModal();
    }
    if (!modal) {
        console.error('❌ 无法创建挑战塔模态框');
        showTowerToast('❌ 无法创建模态框', true);
        return;
    }
    
    var content = document.getElementById('towerModalContent');
    if (!content) {
        console.error('❌ 缺少 towerModalContent');
        showTowerToast('❌ 内容容器缺失', true);
        return;
    }
    
    var isBoss = floorData.isBoss;
    var canTake = canChallenge(floor);
    var status = towerState.challengeStatus;
    var isInProgress = (status === 'in_progress' && towerState.challengeFloor === floor);
    var isReady = (status === 'completed_ready' && towerState.challengeFloor === floor);
    
    var html = '';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-shrink:0;">';
    html += '  <h3 style="margin:0;color:#4a2a1a;font-size:1.1rem;">🏛️ 挑战塔 · 第 ' + floor + ' 层' + (isBoss ? ' 👑 BOSS' : '') + '</h3>';
    html += '  <button id="towerModalCloseBtn" style="background:#c98f5e;border:none;border-radius:30px;padding:4px 14px;cursor:pointer;font-size:0.8rem;color:white;font-weight:bold;">关闭</button>';
    html += '</div>';
    
    html += '<div style="flex:1;overflow-y:auto;scrollbar-width:thin;min-height:0;">';
    html += '  <div style="background:rgba(255,248,240,0.3);border-radius:16px;padding:16px;">';
    html += '    <div style="font-size:1rem;font-weight:bold;color:#4a2a1a;margin-bottom:4px;">🎯 ' + floorData.targetDesc + '</div>';
    html += '    <div style="font-size:0.85rem;color:#5a3a2a;">⏱️ 限时 ' + floorData.timeLimit + ' 秒</div>';
    html += '    <div style="font-size:0.85rem;color:#5a3a2a;">🏆 奖励：🫘' + floorData.rewards.beans + ' 豆，🪙' + floorData.rewards.gold + ' 金币';
    if (floorData.rewards.items.length > 0) {
        var itemNames = floorData.rewards.items.map(function(item) {
            var name = item.id;
            if (item.id === 'speed_up') name = '加速券';
            else if (item.id === 'refresh') name = '刷新券';
            else if (item.id === 'lucky_box') name = '幸运盒子';
            else if (item.id === 'energy_box') name = '能量宝箱';
            return name + '×' + item.amount;
        }).join('、');
        html += '，' + itemNames;
    }
    html += '    </div>';
    html += '  </div>';
    html += '</div>';
    
    html += '<div style="margin-top:auto;padding-top:12px;border-top:1px solid rgba(200,160,120,0.15);display:flex;gap:10px;justify-content:center;flex-wrap:wrap;flex-shrink:0;">';
    if (isReady) {
        html += '<button id="towerClaimBtn" style="background:#ffd700;border:none;border-radius:30px;padding:8px 28px;color:#1a1a2e;font-weight:bold;cursor:pointer;font-size:0.9rem;box-shadow:0 2px 8px rgba(255,215,0,0.2);">🎁 领取奖励</button>';
    } else if (isInProgress) {
        html += '<div style="font-size:0.9rem;color:#e67e22;padding:6px 0;">⏳ 挑战进行中...</div>';
    } else {
        if (canTake) {
            html += '<button id="towerAcceptBtn" style="background:#6f9e3f;border:none;border-radius:30px;padding:8px 28px;color:white;font-weight:bold;cursor:pointer;font-size:0.9rem;box-shadow:0 2px 8px rgba(111,158,63,0.2);">⚔️ 接取挑战</button>';
        } else {
            html += '<button disabled style="background:#aaa;border:none;border-radius:30px;padding:8px 28px;color:white;font-weight:bold;font-size:0.9rem;cursor:not-allowed;">🔒 未解锁</button>';
        }
    }
    if (towerState.history.length > 0) {
        html += '  <button id="towerHistoryBtn" style="background:#8e44ad;border:none;border-radius:30px;padding:8px 28px;color:white;font-weight:bold;cursor:pointer;font-size:0.9rem;box-shadow:0 2px 8px rgba(142,68,173,0.2);">📜 已通关(' + towerState.history.length + ')</button>';
    }
    html += '</div>';
    
    content.innerHTML = html;
    console.log('🏛️ HTML 已注入 content');
    
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    console.log('🏛️ 模态框已显示');
    
    document.getElementById('towerModalCloseBtn')?.addEventListener('click', function() {
        closeTowerModal();
    });
    document.getElementById('towerAcceptBtn')?.addEventListener('click', function() {
        acceptChallenge(floor);
    });
    document.getElementById('towerClaimBtn')?.addEventListener('click', function() {
        claimReward(floor);
    });
    document.getElementById('towerHistoryBtn')?.addEventListener('click', function() {
        showHistoryList();
    });
    
    console.log('🏛️ openTowerInfo 执行完成');
}

// ============================================================
// 历史记录
// ============================================================
function showHistoryList() {
    var history = towerState.history;
    if (!history || history.length === 0) {
        showTowerToast('📜 还没有挑战记录', false);
        return;
    }
    
    var content = document.getElementById('towerModalContent');
    if (!content) return;
    
    var sorted = history.slice().sort(function(a, b) { return b.floor - a.floor; });
    
    var html = '';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-shrink:0;">';
    html += '  <h3 style="margin:0;color:#4a2a1a;font-size:1.1rem;">📜 已通关关卡</h3>';
    html += '  <button id="towerHistoryBackBtn" style="background:#c98f5e;border:none;border-radius:30px;padding:4px 14px;cursor:pointer;font-size:0.8rem;color:white;font-weight:bold;">← 返回</button>';
    html += '</div>';
    
    html += '<div style="flex:1;overflow-y:auto;scrollbar-width:thin;min-height:0;max-height:300px;">';
    for (var i = 0; i < sorted.length; i++) {
        var rec = sorted[i];
        var starStr = '';
        for (var s = 0; s < rec.stars; s++) starStr += '⭐';
        html += '<div class="tower-history-item" data-floor="' + rec.floor + '" style="';
        html += 'display:flex;justify-content:space-between;align-items:center;padding:6px 12px;margin-bottom:4px;';
        html += 'background:rgba(255,248,240,0.3);border-radius:8px;border:1px solid rgba(200,160,120,0.1);';
        html += 'cursor:pointer;transition:0.15s;';
        html += '" onclick="showHistoryDetail(' + rec.floor + ')">';
        html += '  <span style="font-weight:bold;color:#4a2a1a;">第' + rec.floor + '层</span>';
        html += '  <span style="color:#5a3a2a;font-size:0.8rem;">' + starStr + '</span>';
        html += '  <span style="color:#8b7a6a;font-size:0.65rem;">' + rec.date + '</span>';
        html += '  <span style="color:#6f9e3f;font-size:0.65rem;">' + rec.time + 's</span>';
        html += '  <span style="color:#6f9e3f;font-size:0.65rem;">▶</span>';
        html += '</div>';
    }
    html += '</div>';
    html += '<div style="flex-shrink:0;height:4px;"></div>';
    
    content.innerHTML = html;
    
    document.getElementById('towerHistoryBackBtn')?.addEventListener('click', function() {
        openTowerInfo();
    });
}

function showHistoryDetail(floor) {
    var rec = getHistoryRecord(floor);
    if (!rec) {
        showTowerToast('❌ 未找到该关卡记录', true);
        return;
    }
    
    var content = document.getElementById('towerModalContent');
    if (!content) return;
    
    var starStr = '';
    for (var s = 0; s < rec.stars; s++) starStr += '⭐';
    
    var html = '';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-shrink:0;">';
    html += '  <h3 style="margin:0;color:#4a2a1a;font-size:1.1rem;">📋 第 ' + rec.floor + ' 层 详情</h3>';
    html += '  <button id="towerHistoryBackBtn2" style="background:#c98f5e;border:none;border-radius:30px;padding:4px 14px;cursor:pointer;font-size:0.8rem;color:white;font-weight:bold;">← 返回列表</button>';
    html += '</div>';
    
    html += '<div style="flex:1;overflow-y:auto;scrollbar-width:thin;min-height:0;">';
    html += '  <div style="background:rgba(255,248,240,0.3);border-radius:16px;padding:16px;margin-bottom:12px;">';
    html += '    <div style="font-size:1rem;font-weight:bold;color:#4a2a1a;margin-bottom:6px;">🎯 ' + rec.targetDesc + '</div>';
    html += '    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;font-size:0.85rem;color:#5a3a2a;">';
    html += '      <div>⭐ 评价：' + starStr + '</div>';
    html += '      <div>⏱️ 用时：' + rec.time + ' 秒</div>';
    html += '      <div>📅 完成时间：' + rec.date + '</div>';
    html += '    </div>';
    html += '  </div>';
    
    var floorData = getFloorData(rec.floor);
    if (floorData) {
        html += '  <div style="background:rgba(255,248,240,0.2);border-radius:12px;padding:12px;">';
        html += '    <div style="font-weight:bold;color:#4a2a1a;">🏆 奖励</div>';
        html += '    <div style="font-size:0.85rem;color:#5a3a2a;">🫘 ' + floorData.rewards.beans + ' 豆，🪙 ' + floorData.rewards.gold + ' 金币';
        if (floorData.rewards.items.length > 0) {
            var itemNames = floorData.rewards.items.map(function(item) {
                var name = item.id;
                if (item.id === 'speed_up') name = '加速券';
                else if (item.id === 'refresh') name = '刷新券';
                else if (item.id === 'lucky_box') name = '幸运盒子';
                else if (item.id === 'energy_box') name = '能量宝箱';
                return name + '×' + item.amount;
            }).join('、');
            html += '，' + itemNames;
        }
        html += '    </div>';
        html += '  </div>';
    }
    html += '</div>';
    
    content.innerHTML = html;
    
    document.getElementById('towerHistoryBackBtn2')?.addEventListener('click', function() {
        showHistoryList();
    });
}

function getHistoryRecord(floor) {
    for (var i = 0; i < towerState.history.length; i++) {
        if (towerState.history[i].floor === floor) {
            return towerState.history[i];
        }
    }
    return null;
}

// ============================================================
// 挑战核心
// ============================================================
function acceptChallenge(floor) {
    console.log('🏛️ acceptChallenge 被调用, floor=' + floor);
    if (!canChallenge(floor)) {
        showTowerToast('❌ 该层尚未解锁', true);
        return;
    }
    if (towerState.challengeStatus === 'in_progress') {
        showTowerToast('⏳ 已有进行中的挑战，请先完成', true);
        return;
    }
    var floorData = getFloorData(floor);
    if (!floorData) return;
    
    towerState._ordersCompletedSinceStart = 0;
    towerState._farmHarvestsSinceStart = 0;
    towerState._fishCaughtSinceStart = 0;
    towerState._rareFishCaughtSinceStart = 0;
    towerState._ironMinedSinceStart = 0;
    towerState._diamondMinedSinceStart = 0;
    towerState._cookCountSinceStart = 0;
    towerState._tradeCountSinceStart = 0;
    towerState._perfectCountSinceStart = 0;
    
    towerState.challengeStatus = 'in_progress';
    towerState.challengeFloor = floor;
    towerState.challengeStartTime = Date.now();
    towerState.challengeTimeLimit = floorData.timeLimit;
    towerState.challengeTarget = floorData.targetType;
    towerState._snapshot = {};
    towerState._snapshot.initialGold = typeof gold !== 'undefined' ? gold : 0;
    towerState._snapshot.inventory = {};
    for (var id in inventory) {
        towerState._snapshot.inventory[id] = inventory[id] || 0;
    }
    towerState._snapshot.hiddenInventory = {};
    for (var hid in hiddenInventory) {
        towerState._snapshot.hiddenInventory[hid] = hiddenInventory[hid] || 0;
    }
    
    saveTowerData();
    closeTowerModal();
    
    showTowerFloatingTimer(floor);
    showTowerToast('⚔️ 挑战已开始！请在限时内完成任务', false);
    if (typeof soundClick === 'function') soundClick();
    
    startSmoothTowerTimer(floorData.timeLimit, floor);
}

function claimReward(floor) {
    console.log('🏛️ claimReward 被调用, floor=' + floor);
    if (towerState.challengeStatus !== 'completed_ready' || towerState.challengeFloor !== floor) {
        showTowerToast('❌ 没有可领取的奖励', true);
        return;
    }
    var floorData = getFloorData(floor);
    if (!floorData) return;
    
    var rewards = floorData.rewards;
    var isFirst = floor > towerState.highestFloor;
    var multiplier = isFirst ? 1 : TOWER_CONFIG.REPEAT_REWARD_RATE;
    
    var beansGain = Math.floor(rewards.beans * multiplier);
    var goldGain = Math.floor(rewards.gold * multiplier);
    
    if (typeof cocoaBeans !== 'undefined') cocoaBeans += beansGain;
    if (typeof gold !== 'undefined') gold += goldGain;
    
    rewards.items.forEach(function(item) {
    if (typeof playerBag !== 'undefined') {
        var addAmount = Math.floor(item.amount * multiplier);
        // 如果原奖励不为0，但取整后为0，至少给1个（保留体验）
        if (addAmount === 0 && item.amount > 0) addAmount = 1;
        playerBag[item.id] = (playerBag[item.id] || 0) + addAmount;
        if (typeof savePlayerBag === 'function') savePlayerBag();
    }
});
    
    var usedTime = (Date.now() - towerState.challengeStartTime) / 1000;
    var timeLimit = floorData.timeLimit;
    var remaining = Math.max(0, timeLimit - usedTime);
    var stars = 1;
    if (remaining > timeLimit * 0.5) stars = 3;
    else if (remaining > timeLimit * 0.2) stars = 2;
    
    var now = new Date();
    var dateStr = now.getMonth()+1 + '/' + now.getDate() + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
    towerState.history.push({
        floor: floor,
        stars: stars,
        time: Math.floor(usedTime),
        date: dateStr,
        targetDesc: floorData.targetDesc,
        targetType: floorData.targetType,
        targetParams: floorData.targetParams
    });
    
    if (floor > towerState.highestFloor) {
        towerState.highestFloor = floor;
    }
    towerState.currentFloor = floor + 1;
    if (towerState.currentFloor > TOWER_CONFIG.MAX_FLOOR) {
        towerState.currentFloor = TOWER_CONFIG.MAX_FLOOR;
    }
    towerState.stars[floor] = Math.max(towerState.stars[floor] || 0, stars);
    towerState.totalStars = Object.values(towerState.stars).reduce(function(a,b) { return a + b; }, 0);
    
    towerState.challengeStatus = 'idle';
    towerState.challengeFloor = 0;
    towerState.challengeStartTime = 0;
    towerState.challengeTimeLimit = 0;
    towerState.challengeTarget = null;
    towerState._snapshot = {};
    clearTowerTimers();
    removeTowerFloatingTimer();
    
    saveTowerData();
    refreshUI();
    updateTowerEntry();
    
    if (typeof soundVictory === 'function') soundVictory();
    showTowerToast('🎉 领取成功！获得 🫘' + beansGain + ' 豆，🪙' + goldGain + ' 金币 ⭐' + stars + '星', false);
    
    var next = getNextUnlockedFloor();
    if (next <= TOWER_CONFIG.MAX_FLOOR) {
        openTowerInfo();
    } else {
        showTowerToast('🎉 恭喜你通关所有92层！', false);
        closeTowerModal();
    }
}

function abandonChallenge() {
    if (towerState.challengeStatus !== 'in_progress') return;
    clearTowerTimers();
    removeTowerFloatingTimer();
    towerState.challengeStatus = 'idle';
    towerState.challengeFloor = 0;
    towerState._snapshot = {};
    saveTowerData();
    updateTowerEntry();
    showTowerToast('🗑️ 已放弃挑战', false);
}

// ============================================================
// 计时器
// ============================================================
function startSmoothTowerTimer(limit, floor) {
    var remaining = limit;
    var timerEl = document.querySelector('.tower-floating-timer');
    var progressEl = document.querySelector('.tower-floating-progress');
    
    if (!timerEl || !progressEl) {
        setTimeout(function() {
            startSmoothTowerTimer(limit, floor);
        }, 200);
        return;
    }
    
    clearTowerTimers();
    _towerLastUpdateTime = Date.now();
    
    function updateTimer() {
        if (towerState.challengeStatus !== 'in_progress') {
            return;
        }
        
        var now = Date.now();
        var delta = (now - _towerLastUpdateTime) / 1000;
        _towerLastUpdateTime = now;
        
        remaining -= delta;
        
        var displayRemaining = Math.max(0, Math.ceil(remaining));
        var minutes = Math.floor(displayRemaining / 60);
        var seconds = displayRemaining % 60;
        timerEl.textContent = String(minutes).padStart(2,'0') + ':' + String(seconds).padStart(2,'0');
        
        var floorData = getFloorData(floor);
        if (floorData) {
            var progress = calculateProgress(floorData);
            var pct = Math.min(100, Math.round(progress * 100));
            var progressText = getProgressText(floorData);
            progressEl.textContent = progressText + ' (' + pct + '%)';
            
            if (progress >= 1) {
                clearTowerTimers();
                challengeCompleted(floor);
                return;
            }
        }
        
        if (remaining <= 0) {
            clearTowerTimers();
            challengeFailed();
            return;
        }
        
        _towerAnimationId = requestAnimationFrame(updateTimer);
    }
    
    _towerAnimationId = requestAnimationFrame(updateTimer);
}

function resumeChallengeTimer() {
    var elapsed = (Date.now() - towerState.challengeStartTime) / 1000;
    var remaining = Math.max(0, towerState.challengeTimeLimit - elapsed);
    if (remaining <= 0) {
        challengeFailed();
        return;
    }
    showTowerFloatingTimer(towerState.challengeFloor);
    startSmoothTowerTimer(remaining, towerState.challengeFloor);
}

// ============================================================
// 进度计算（修复所有任务类型）
// ============================================================
function getProgressText(floorData) {
    var targetType = floorData.targetType;
    var params = floorData.targetParams;
    var current = 0;
    var target = 0;
    
    switch (targetType) {
        case 'produce': {
            var pid = params.productId;
            target = params.count;
            var initial = towerState._snapshot.inventory[pid] || 0;
            var currentInv = inventory[pid] || 0;
            var made = Math.max(0, currentInv - initial);
            current = Math.min(made, target);
            return current + '/' + target + ' ' + (PRODUCTS[pid] ? PRODUCTS[pid].name : pid);
        }
        case 'sell':
            target = params.gold;
            var currentGold = typeof gold !== 'undefined' ? gold : 0;
            var initialGold = towerState._snapshot.initialGold || 0;
            var earned = Math.max(0, currentGold - initialGold);
            current = Math.min(earned, target);
            return current + '/' + target + ' 金币';
        case 'order':
            target = params.count;
            current = Math.min(towerState._ordersCompletedSinceStart || 0, target);
            return current + '/' + target + ' 订单';
        case 'farm':
            target = params.count;
            current = Math.min(towerState._farmHarvestsSinceStart || 0, target);
            return current + '/' + target + ' 收获';
        case 'fish': {
            var totalNeeded = params.count || 0;
            var rareNeeded = params.rare || 0;
            var totalCaught = towerState._fishCaughtSinceStart || 0;
            var rareCaught = towerState._rareFishCaughtSinceStart || 0;
            var totalCurrent = Math.min(totalCaught, totalNeeded);
            if (rareNeeded > 0) {
                var rareCurrent = Math.min(rareCaught, rareNeeded);
                return '🐟 ' + totalCurrent + '/' + totalNeeded + ' 条' + ' | ⭐ ' + rareCurrent + '/' + rareNeeded + ' 稀有';
            }
            return totalCurrent + '/' + totalNeeded + ' 条鱼';
        }
        case 'mine': {
            target = params.count;
            var isDiamond = params.diamond || false;
            var mined = isDiamond ? (towerState._diamondMinedSinceStart || 0) : (towerState._ironMinedSinceStart || 0);
            current = Math.min(mined, target);
            var name = isDiamond ? '钻石' : '铁矿';
            return current + '/' + target + ' ' + name;
        }
        case 'cook':
            target = params.count;
            current = Math.min(towerState._cookCountSinceStart || 0, target);
            return current + '/' + target + ' 份食物';
        case 'trade':
            target = params.count;
            current = Math.min(towerState._tradeCountSinceStart || 0, target);
            return current + '/' + target + ' 次交易';
        case 'hidden': {
            target = params.count;
            var hiddenMade = 0;
            for (var hid in towerState._snapshot.hiddenInventory) {
                var currentH = hiddenInventory[hid] || 0;
                var initial = towerState._snapshot.hiddenInventory[hid] || 0;
                hiddenMade += Math.max(0, currentH - initial);
            }
            current = Math.min(hiddenMade, target);
            return current + '/' + target + ' 隐藏产品';
        }
        default:
            return '进行中...';
    }
}

function calculateProgress(floorData) {
    var targetType = floorData.targetType;
    var params = floorData.targetParams;
    var progress = 0;
    
    switch (targetType) {
        case 'produce': {
            var pid = params.productId;
            var count = params.count;
            var initial = towerState._snapshot.inventory[pid] || 0;
            var currentInv = inventory[pid] || 0;
            var made = Math.max(0, currentInv - initial);
            progress = Math.min(1, made / count);
            break;
        }
        case 'sell':
            var goldTarget = params.gold;
            var currentGold = typeof gold !== 'undefined' ? gold : 0;
            var initialGold = towerState._snapshot.initialGold || 0;
            var earned = Math.max(0, currentGold - initialGold);
            progress = Math.min(1, earned / goldTarget);
            break;
        case 'order':
            var count = params.count;
            var completed = towerState._ordersCompletedSinceStart || 0;
            progress = Math.min(1, completed / count);
            break;
        case 'farm':
            var count = params.count;
            var harvested = towerState._farmHarvestsSinceStart || 0;
            progress = Math.min(1, harvested / count);
            break;
        case 'fish': {
            var totalNeeded = params.count || 0;
            var rareNeeded = params.rare || 0;
            var totalCaught = towerState._fishCaughtSinceStart || 0;
            var rareCaught = towerState._rareFishCaughtSinceStart || 0;
            var totalProgress = Math.min(1, totalCaught / totalNeeded);
            var rareProgress = rareNeeded > 0 ? Math.min(1, rareCaught / rareNeeded) : 1;
            progress = Math.min(totalProgress, rareProgress);
            break;
        }
        case 'mine': {
            var count = params.count;
            var isDiamond = params.diamond || false;
            var mined = isDiamond ? (towerState._diamondMinedSinceStart || 0) : (towerState._ironMinedSinceStart || 0);
            progress = Math.min(1, mined / count);
            break;
        }
        case 'cook':
            var count = params.count;
            var cooked = towerState._cookCountSinceStart || 0;
            progress = Math.min(1, cooked / count);
            break;
        case 'trade':
            var count = params.count;
            var traded = towerState._tradeCountSinceStart || 0;
            progress = Math.min(1, traded / count);
            break;
        case 'hidden': {
            var count = params.count;
            var hiddenMade = 0;
            for (var hid in towerState._snapshot.hiddenInventory) {
                var current = hiddenInventory[hid] || 0;
                var initial = towerState._snapshot.hiddenInventory[hid] || 0;
                hiddenMade += Math.max(0, current - initial);
            }
            progress = Math.min(1, hiddenMade / count);
            break;
        }
        default:
            progress = 0;
    }
    return progress;
}

function challengeCompleted(floor) {
    if (towerState.challengeStatus !== 'in_progress') return;
    towerState.challengeStatus = 'completed_ready';
    var floating = document.getElementById('towerFloatingContainer');
    if (floating) {
        var text = floating.querySelector('.tower-floating-text');
        if (text) {
            text.textContent = '✅ 第' + floor + '关任务已完成，请返回领取奖励！';
            text.style.color = '#28a745';
        }
        var timer = floating.querySelector('.tower-floating-timer');
        if (timer) timer.textContent = '🎁';
        var progress = floating.querySelector('.tower-floating-progress');
        if (progress) progress.textContent = '100%';
        floating.style.borderColor = '#28a745';
        floating.style.background = 'rgba(40,167,69,0.15)';
        var abandonBtn = document.getElementById('towerAbandonBtn');
        if (abandonBtn) {
            abandonBtn.textContent = '✕';
            abandonBtn.style.background = 'rgba(255,50,50,0.2)';
            abandonBtn.style.borderColor = 'rgba(255,50,50,0.2)';
            abandonBtn.style.color = 'rgba(255,100,100,0.6)';
            abandonBtn.onclick = function(e) {
                e.stopPropagation();
                abandonChallenge();
            };
        }
        floating.onclick = function(e) {
            if (e.target.closest('#towerAbandonBtn')) return;
            openTowerInfo();
        };
    }
    clearTowerTimers();
    saveTowerData();
    updateTowerEntry();
    if (typeof soundSuccess === 'function') soundSuccess();
    showTowerToast('✅ 任务完成！点击挑战塔领取奖励', false);
}

function challengeFailed() {
    if (towerState.challengeStatus !== 'in_progress') return;
    clearTowerTimers();

    var floor = towerState.challengeFloor;
    var floorData = floor > 0 ? getFloorData(floor) : null;
    var progressText = floorData ? getProgressText(floorData) : '0%';

    var floating = document.getElementById('towerFloatingContainer');
    if (floating) {
        var text = floating.querySelector('.tower-floating-text');
        var timer = floating.querySelector('.tower-floating-timer');
        var progress = floating.querySelector('.tower-floating-progress');
        if (text) {
            text.textContent = '⏰ 挑战超时！';
            text.style.color = '#ff6b6b';
        }
        if (timer) timer.textContent = '❌';
        if (progress) progress.textContent = '失败 · ' + progressText;
        floating.style.borderColor = '#ff6b6b';
        floating.style.background = 'rgba(255,50,50,0.15)';
        floating.onclick = function(e) {
            removeTowerFloatingTimer();
        };
        var abandonBtn = document.getElementById('towerAbandonBtn');
        if (abandonBtn) {
            abandonBtn.onclick = function(e) {
                e.stopPropagation();
                removeTowerFloatingTimer();
            };
        }
    }

    towerState.challengeStatus = 'idle';
    towerState.challengeFloor = 0;
    towerState._snapshot = {};
    saveTowerData();
    updateTowerEntry();
    if (typeof soundError === 'function') soundError();
    showTowerToast('⏰ 挑战超时，请重新接取', true);

    setTimeout(function() {
        removeTowerFloatingTimer();
    }, 3000);
}

function clearTowerTimers() {
    if (_towerTimerInterval) {
        clearInterval(_towerTimerInterval);
        _towerTimerInterval = null;
    }
    if (_towerAnimationId) {
        cancelAnimationFrame(_towerAnimationId);
        _towerAnimationId = null;
    }
}

// ============================================================
// 浮窗UI
// ============================================================
function showTowerFloatingTimer(floor) {
    var existing = document.getElementById('towerFloatingContainer');
    if (existing) existing.remove();
    
    var container = document.createElement('div');
    container.id = 'towerFloatingContainer';
    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        background: rgba(30,20,15,0.92);
        backdrop-filter: blur(8px);
        border: 2px solid #c98f5e;
        border-radius: 16px;
        padding: 12px 18px;
        min-width: 220px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        color: #ffefcf;
        font-family: 'Segoe UI', system-ui, sans-serif;
        cursor: pointer;
        transition: all 0.3s;
    `;
    container.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:1.2rem;">🏛️</span>
            <div style="flex:1;min-width:0;">
                <div style="font-size:0.7rem;color:rgba(255,255,255,0.4);">挑战塔 · 第${floor}层</div>
                <div class="tower-floating-text" style="font-size:0.8rem;color:#ffd700;">⏳ 剩余时间：</div>
                <div class="tower-floating-timer" style="font-size:1.1rem;font-weight:bold;color:#ffd700;margin-top:2px;"></div>
                <div class="tower-floating-progress" style="font-size:0.7rem;color:rgba(255,255,255,0.5);margin-top:2px;"></div>
            </div>
            <button id="towerAbandonBtn" style="background:rgba(255,50,50,0.2);border:1px solid rgba(255,50,50,0.2);border-radius:50%;width:24px;height:24px;cursor:pointer;color:rgba(255,100,100,0.6);font-size:0.7rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✕</button>
        </div>
    `;
    document.body.appendChild(container);
    
    container.onclick = function(e) {
        if (e.target.closest('#towerAbandonBtn')) return;
        openTowerInfo();
    };
    
    document.getElementById('towerAbandonBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        abandonChallenge();
    });
}

function removeTowerFloatingTimer() {
    var el = document.getElementById('towerFloatingContainer');
    if (el) el.remove();
}

// ============================================================
// 模态框关闭
// ============================================================
function closeTowerModal() {
    var modal = document.getElementById('towerModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

function showTowerToast(msg, isError) {
    if (typeof showMessage === 'function') {
        showMessage(msg, isError);
    } else {
        console.log('[Tower] ' + msg);
    }
}

// ============================================================
// UI入口更新
// ============================================================
function updateTowerEntry() {
    var entry = document.getElementById('towerEntry');
    if (!entry) return;
    var next = getNextUnlockedFloor();
    var statusText = '';
    if (next > TOWER_CONFIG.MAX_FLOOR) {
        statusText = '🎉 已通关！';
    } else if (towerState.challengeStatus === 'in_progress') {
        statusText = '⏳ 挑战中...';
    } else if (towerState.challengeStatus === 'completed_ready') {
        statusText = '✅ 可领取！';
    } else {
        statusText = '第' + next + '层';
    }
    var statusEl = document.getElementById('towerStatusText');
    if (statusEl) statusEl.textContent = statusText;
}

// ============================================================
// 事件触发（修复所有任务）
// ============================================================
function onTowerOrderCompleted() {
    if (towerState.challengeStatus !== 'in_progress') return;
    towerState._ordersCompletedSinceStart = (towerState._ordersCompletedSinceStart || 0) + 1;
}

function onTowerFarmHarvested() {
    if (towerState.challengeStatus !== 'in_progress') return;
    towerState._farmHarvestsSinceStart = (towerState._farmHarvestsSinceStart || 0) + 1;
}

function onTowerFishCaught(fishType) {
    if (towerState.challengeStatus !== 'in_progress') return;
    towerState._fishCaughtSinceStart = (towerState._fishCaughtSinceStart || 0) + 1;
    if (fishType && RARE_FISH_TYPES.indexOf(fishType) !== -1) {
        towerState._rareFishCaughtSinceStart = (towerState._rareFishCaughtSinceStart || 0) + 1;
    }
}

function onTowerMined(oreType) {
    if (towerState.challengeStatus !== 'in_progress') return;
    if (oreType === 'iron') {
        towerState._ironMinedSinceStart = (towerState._ironMinedSinceStart || 0) + 1;
    } else if (oreType === 'diamond') {
        towerState._diamondMinedSinceStart = (towerState._diamondMinedSinceStart || 0) + 1;
    }
}

function onTowerCooked() {
    if (towerState.challengeStatus !== 'in_progress') return;
    towerState._cookCountSinceStart = (towerState._cookCountSinceStart || 0) + 1;
}

function onTowerTraded() {
    if (towerState.challengeStatus !== 'in_progress') return;
    towerState._tradeCountSinceStart = (towerState._tradeCountSinceStart || 0) + 1;
}

function onTowerPerfectProduce() {
    if (towerState.challengeStatus !== 'in_progress') return;
    towerState._perfectCountSinceStart = (towerState._perfectCountSinceStart || 0) + 1;
}

// ============================================================
// 暴露全局接口
// ============================================================
window.initTower = initTower;
window.openTowerInfo = openTowerInfo;
window.acceptChallenge = acceptChallenge;
window.claimReward = claimReward;
window.abandonChallenge = abandonChallenge;
window.updateTowerEntry = updateTowerEntry;
window.onTowerOrderCompleted = onTowerOrderCompleted;
window.onTowerFarmHarvested = onTowerFarmHarvested;
window.onTowerFishCaught = onTowerFishCaught;
window.onTowerMined = onTowerMined;
window.onTowerCooked = onTowerCooked;
window.onTowerTraded = onTowerTraded;
window.onTowerPerfectProduce = onTowerPerfectProduce;
window.towerState = towerState;
window.getFloorData = getFloorData;
window.canChallenge = canChallenge;
window.getNextUnlockedFloor = getNextUnlockedFloor;
window.showHistoryList = showHistoryList;
window.showHistoryDetail = showHistoryDetail;
window.closeTowerModal = closeTowerModal;
window.RARE_FISH_TYPES = RARE_FISH_TYPES;

console.log('🏛️ 挑战塔系统加载完成（修复所有任务类型）');