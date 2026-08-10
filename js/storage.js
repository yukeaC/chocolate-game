// js/storage.js
// ============================================
// 防御性检查：确保全局变量已定义（不用 var 重新声明）
// ============================================
if (typeof workaholicLevel === 'undefined') {
    console.warn('⚠️ storage.js: workaholicLevel 未定义，初始化为 0');
    workaholicLevel = 0;
}
if (typeof expBoostLevel === 'undefined') {
    console.warn('⚠️ storage.js: expBoostLevel 未定义，初始化为 0');
    expBoostLevel = 0;
}

// ============================================
// 日期工具
// ============================================
function getTodayDateStr() {
    const today = new Date();
    return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
}
window.getTodayDateStr = getTodayDateStr;

// ============================================
// 保存游戏
// ============================================
function saveGameToLocal() {
    if (!autoSaveEnabled) return;
    const now = Date.now();
    for (let i = 0; i < TOTAL_SLOTS; i++) {
        const slot = slots[i];
        if (slot.status === 'producing' && slot.productionStartTime && slot.totalProductionTime) {
            const elapsed = Math.floor((now - slot.productionStartTime) / 1000);
            const remaining = Math.max(0, slot.totalProductionTime - elapsed);
            slot.remainingSec = remaining;
            if (remaining <= 0) slot.status = 'completed';
        }
    }
    const saveData = {
        cocoaBeans: cocoaBeans || 0,
        gold: gold || 0,
        miaoBargainLevel: miaoBargainLevel || 0,
        productionSpeedLevel: productionSpeedLevel || 0,
        workaholicLevel: workaholicLevel || 0,
        expBoostLevel: expBoostLevel || 0,
        totalProduced: totalProduced || 0,
        totalSold: totalSold || 0,
        totalEarned: totalEarned || 0,
        totalBeansHarvested: totalBeansHarvested || 0,
        inventory: inventory || {},
        energies: energies || {},
        hiddenInventory: hiddenInventory || {},
        slots: slots.map(function(slot) {
            return {
                unlocked: slot.unlocked,
                productId: slot.productId,
                remainingSec: slot.remainingSec,
                totalProductionTime: slot.totalProductionTime,
                productionStartTime: slot.productionStartTime,
                status: slot.status
            };
        }),
        autoSaveEnabled: autoSaveEnabled !== undefined ? autoSaveEnabled : true,
        exp: exp || 0,
        level: level || 1,
        userProfile: userProfile || { nickname: generateRandomNickname(), nicknameChanged: false, nicknameChangeCount: 0 },
        currentOrders: currentOrders || [],
        orderDate: getTodayDateStr(),
        lastSyncTime: Date.now(),
        totalOrdersCompleted: totalOrdersCompleted || 0,
        totalExchanges: totalExchanges || 0,
        totalGameTime: totalGameTime || 0,
        luckyBoxMaxGold: luckyBoxMaxGold || 0
    };
    const key = 'chocolate_save';
    localStorage.setItem(key, JSON.stringify(saveData));
    console.log('📀 本地存档已保存');
}
window.saveGameToLocal = saveGameToLocal;

// ============================================
// 加载游戏数据（增强版：自动修复缺失字段）
// ============================================
function loadGameFromData(data) {
    try {
        // 如果 data 是字符串，先解析
        if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch(e) { return false; }
        }
        if (!data || typeof data !== 'object') return false;

        // ===== 自动补全缺失字段 =====
        data.cocoaBeans = data.cocoaBeans ?? 0;
        data.gold = data.gold ?? 0;
        data.miaoBargainLevel = data.miaoBargainLevel ?? 0;
        data.productionSpeedLevel = data.productionSpeedLevel ?? 0;
        data.workaholicLevel = data.workaholicLevel ?? 0;
        data.expBoostLevel = data.expBoostLevel ?? 0;
        data.totalProduced = data.totalProduced ?? 0;
        data.totalSold = data.totalSold ?? 0;
        data.totalEarned = data.totalEarned ?? 0;
        data.totalBeansHarvested = data.totalBeansHarvested ?? 0;
        data.exp = data.exp ?? 0;
        data.level = data.level ?? 1;
        data.autoSaveEnabled = data.autoSaveEnabled !== undefined ? data.autoSaveEnabled : true;
        data.totalOrdersCompleted = data.totalOrdersCompleted || 0;
        data.totalExchanges = data.totalExchanges || 0;
        data.totalGameTime = data.totalGameTime || 0;
        data.luckyBoxMaxGold = data.luckyBoxMaxGold || 0;

        // 库存
        if (!data.inventory || typeof data.inventory !== 'object') data.inventory = {};
        for (let id in PRODUCTS) if (data.inventory[id] === undefined) data.inventory[id] = 0;

        // 能量
        if (!data.energies || typeof data.energies !== 'object') data.energies = {};
        for (let e of ENERGY_TYPES) if (data.energies[e.id] === undefined) data.energies[e.id] = 0;

        // 隐藏库存
        if (!data.hiddenInventory || typeof data.hiddenInventory !== 'object') data.hiddenInventory = {};
        for (let r of HIDDEN_RECIPES) if (data.hiddenInventory[r.id] === undefined) data.hiddenInventory[r.id] = 0;

        // 用户资料
        if (!data.userProfile || typeof data.userProfile !== 'object') {
            data.userProfile = { nickname: generateRandomNickname(), nicknameChanged: false, nicknameChangeCount: 0 };
        }
        if (!data.userProfile.nickname) data.userProfile.nickname = generateRandomNickname();

        // 槽位
        if (!data.slots || !Array.isArray(data.slots) || data.slots.length !== TOTAL_SLOTS) {
            data.slots = [];
            for (let i = 0; i < TOTAL_SLOTS; i++) {
                data.slots.push({ unlocked: (i === 0), productId: null, remainingSec: 0, status: 'idle' });
            }
        }
        // 确保每个槽位字段完整
        for (let i = 0; i < TOTAL_SLOTS; i++) {
            if (!data.slots[i]) data.slots[i] = { unlocked: (i === 0), productId: null, remainingSec: 0, status: 'idle' };
            if (data.slots[i].unlocked === undefined) data.slots[i].unlocked = (i === 0);
            if (data.slots[i].productId === undefined) data.slots[i].productId = null;
            if (data.slots[i].remainingSec === undefined) data.slots[i].remainingSec = 0;
            if (data.slots[i].status === undefined) data.slots[i].status = 'idle';
        }

        // 订单
        if (!data.currentOrders || !Array.isArray(data.currentOrders)) {
            data.currentOrders = generateFreshOrders();
        }
        if (data.orderDate) localStorage.setItem('order_date', data.orderDate);

        // 重新赋值给全局变量
        cocoaBeans = data.cocoaBeans;
        gold = data.gold;
        miaoBargainLevel = data.miaoBargainLevel;
        productionSpeedLevel = data.productionSpeedLevel;
        workaholicLevel = data.workaholicLevel;
        expBoostLevel = data.expBoostLevel;
        totalProduced = data.totalProduced;
        totalSold = data.totalSold;
        totalEarned = data.totalEarned;
        totalBeansHarvested = data.totalBeansHarvested;
        exp = data.exp;
        level = data.level;
        autoSaveEnabled = data.autoSaveEnabled;
        totalOrdersCompleted = data.totalOrdersCompleted;
        totalExchanges = data.totalExchanges;
        totalGameTime = data.totalGameTime;
        luckyBoxMaxGold = data.luckyBoxMaxGold;

        Object.assign(inventory, data.inventory);
        Object.assign(energies, data.energies);
        Object.assign(hiddenInventory, data.hiddenInventory);
        userProfile = data.userProfile;
        slots = data.slots;
        currentOrders = data.currentOrders;

        // 重新计算生产
        recalcAllProducingSlots();

        // 更新订单状态显示
        if (typeof updateOrderStatusDisplay === 'function') updateOrderStatusDisplay();

        console.log('✅ 存档加载成功，等级:', level);
        return true;
    } catch(e) {
        console.error('加载存档失败:', e.message);
        return false;
    }
}
window.loadGameFromData = loadGameFromData;

// ============================================
// 从 localStorage 加载
// ============================================
function loadGameFromLocal() {
    const key = 'chocolate_save';
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    try {
        const data = JSON.parse(raw);
        return loadGameFromData(data);
    } catch(e) {
        console.warn('解析存档失败:', e);
        return false;
    }
}
window.loadGameFromLocal = loadGameFromLocal;

// ============================================
// 重新计算所有生产中的槽位
// ============================================
function recalcAllProducingSlots() {
    const now = Date.now();
    let needSave = false;
    for (let i = 0; i < TOTAL_SLOTS; i++) {
        const slot = slots[i];
        if (slot.status === 'producing' && slot.productionStartTime && slot.totalProductionTime) {
            const elapsed = Math.floor((now - slot.productionStartTime) / 1000);
            const remaining = Math.max(0, slot.totalProductionTime - elapsed);
            slot.remainingSec = remaining;
            if (remaining === 0) {
                slot.status = 'completed';
                needSave = true;
                console.log('📦 槽位 ' + (i+1) + ' 离线期间已完成生产');
            } else {
                console.log('📦 槽位 ' + (i+1) + ' 剩余 ' + remaining + ' 秒');
            }
        }
    }
    if (needSave && autoSaveEnabled) saveGame();
}
window.recalcAllProducingSlots = recalcAllProducingSlots;

// ============================================
// 清除所有游戏数据（完整版）
// ============================================
function clearAllGameDataLocal() {
    console.log('🗑️ 开始清除所有游戏数据...');

    var keysToRemove = [
        'chocolate_save', 'order_date', 'savedOrders', 'farm_data', 'cardmatch_reward_beans',
        'cardmatch_reward_amount', 'cardmatch_reward_time', 'double_gold_active', 'shop_data',
        'player_bag', 'achievement_data', 'last_refresh_date', 'adventurer_data',
        'explore_region_status', 'explore_visited', 'explore_coins', 'explore_backpack',
        'treasure_data', 'prince_dialogue_state', 'croissant_state', 'story_progress',
        'fishing_daily', 'fishing_stats', 'mining_data', 'panini_data', 'rice_data',
        'bounty_data', 'nomo_feed_data', 'nomo_completed', 'rose_plant_data',
        'rose_seed_dialogue_played', 'rose_pot_unlocked', 'trade_total_count',
        'explore_travel_state', 'tower_data', 'sudoku_rewards'
    ];
    for (var i = 0; i < keysToRemove.length; i++) localStorage.removeItem(keysToRemove[i]);

    // 重置全局变量
    cocoaBeans = 0; gold = 0; miaoBargainLevel = 0; productionSpeedLevel = 0;
    workaholicLevel = 0; expBoostLevel = 0; totalProduced = 0; totalSold = 0;
    totalEarned = 0; totalBeansHarvested = 0; exp = 0; level = 1;
    totalOrdersCompleted = 0; totalExchanges = 0; totalGameTime = 0; luckyBoxMaxGold = 0;

    if (typeof inventory !== 'undefined') for (var id in PRODUCTS) inventory[id] = 0;
    if (typeof hiddenInventory !== 'undefined') for (var r of HIDDEN_RECIPES) hiddenInventory[r.id] = 0;
    if (typeof energies !== 'undefined') for (var e of ENERGY_TYPES) energies[e.id] = 0;

    if (typeof slots !== 'undefined') {
        for (var i = 0; i < TOTAL_SLOTS; i++) {
            slots[i] = { unlocked: (i === 0), productId: null, remainingSec: 0, status: 'idle' };
            if (slotTimers[i]) clearTimeout(slotTimers[i]);
            if (slotIntervals[i]) clearInterval(slotIntervals[i]);
            slotTimers[i] = null; slotIntervals[i] = null;
        }
    }

    if (typeof userProfile !== 'undefined') {
        userProfile = { nickname: generateRandomNickname(), nicknameChanged: false, nicknameChangeCount: 0 };
    }

    if (typeof currentOrders !== 'undefined') currentOrders = generateFreshOrders();
    localStorage.setItem('order_date', getTodayDateStr());
    if (typeof updateOrderStatusDisplay === 'function') updateOrderStatusDisplay();

    if (typeof resetFarmLands === 'function') resetFarmLands();
    if (typeof clearAchievementData === 'function') clearAchievementData();
    if (typeof shopState !== 'undefined') {
        shopState = { signIn: { lastDate: null, consecutiveDays: 0, signedToday: false }, inventory: {}, resetDate: null };
        for (var id in SHOP_ITEMS) shopState.inventory[id] = SHOP_ITEMS[id].maxStock;
    }
    if (typeof playerBag !== 'undefined') { for (var id in playerBag) playerBag[id] = 0; }

    // 重置探险地图变量
    if (typeof adventurerState !== 'undefined') {
        adventurerState = { rank: 1, reputation: 0, totalEarnedRep: 0, claimedRankRewards: [], records: [] };
    }
    if (typeof treasureState !== 'undefined') {
        treasureState = { hasCompleteMap: false, treasureRegionId: null, treasurePosX: 0, treasurePosY: 0, isCompleted: false, completedCount: 0, fishCounter: 0, lastKabuDate: null, kabuGivenToday: false };
    }
    if (typeof regions !== 'undefined') {
        for (var i = 0; i < regions.length; i++) {
            if (regions[i].id === 'welcome') regions[i].status = 'current';
            else regions[i].status = 'locked';
        }
    }
    if (typeof visitedRegions !== 'undefined') visitedRegions = [];
    if (typeof STORY_DATA !== 'undefined') { for (var key in STORY_DATA) STORY_DATA[key].completed = false; }
    if (typeof princeLocalState !== 'undefined') princeLocalState = { currentIndex: 0, isCompleted: false, hasVisited: false, randomIndex: -1 };
    if (typeof croissantState !== 'undefined') croissantState = { currentIndex: 0, isCompleted: false, hasVisited: false, randomIndex: -1 };
    if (typeof fishingState !== 'undefined') { fishingState.todayCount = 0; fishingState.todayCatch = 0; fishingState.basket = []; }

    if (typeof towerState !== 'undefined') {
        towerState = {
            currentFloor: 1, highestFloor: 0, stars: {}, claimedFirstReward: {}, lastResetDate: '',
            totalStars: 0, history: [], challengeStatus: 'idle', challengeFloor: 0,
            challengeStartTime: 0, challengeTimeLimit: 0, challengeTarget: null,
            _snapshot: {}, _ordersCompletedSinceStart: 0, _farmHarvestsSinceStart: 0,
            _fishCaughtSinceStart: 0, _mineCountSinceStart: 0, _cookCountSinceStart: 0,
            _tradeCountSinceStart: 0, _perfectCountSinceStart: 0, _historyView: 'list'
        };
    }

    if (typeof refreshUI === 'function') refreshUI();
    if (typeof renderSlots === 'function') renderSlots();
    if (typeof renderQuickSell === 'function') renderQuickSell();
    if (typeof renderShopUI === 'function') renderShopUI();
}
window.clearAllGameDataLocal = clearAllGameDataLocal;

// ============================================
// 保存/加载主函数
// ============================================
async function saveGame() {
    saveGameToLocal();
}
window.saveGame = saveGame;

async function loadGame() {
    // 直接尝试加载，不轻易重置
    var loaded = loadGameFromLocal();
    if (!loaded) {
        console.log('🆕 没有有效存档，初始化新游戏');
        clearAllGameDataLocal();
        await saveGame();
        if (typeof showMessage === 'function') {
            showMessage('✨ 欢迎！开始你的甜点工坊之旅', false);
        }
    } else {
        recalcAllProducingSlots();
        if (typeof refreshUI === 'function') refreshUI();
        console.log('✅ 游戏加载完成');
    }
    return loaded;
}
window.loadGame = loadGame;

// ============================================
// 重启槽位计时器
// ============================================
function restartSlotTimer(slotIndex) {
    const slot = slots[slotIndex];
    if (!slot || slot.status !== 'producing' || slot.remainingSec <= 0) {
        if (slot && slot.status === 'producing' && slot.remainingSec <= 0) {
            slot.status = 'completed';
            if (typeof renderSlots === 'function') renderSlots();
        }
        return;
    }
    if (slotIntervals[slotIndex]) {
        clearInterval(slotIntervals[slotIndex]);
        slotIntervals[slotIndex] = null;
    }
    const startTime = Date.now();
    const initialRemaining = slot.remainingSec;
    slotIntervals[slotIndex] = setInterval(function() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, initialRemaining - elapsed);
        slot.remainingSec = remaining;
        if (typeof renderSlots === 'function') renderSlots();
        if (remaining <= 0) {
            clearInterval(slotIntervals[slotIndex]);
            slot.status = 'completed';
            slot.remainingSec = 0;
            if (typeof renderSlots === 'function') renderSlots();
            if (autoSaveEnabled) saveGame();
        }
    }, 1000);
}
window.restartSlotTimer = restartSlotTimer;

// ============================================
// 初始化游戏
// ============================================
function initGame() {
    console.log('🎮 开始初始化游戏...');
    for (let i = 0; i < TOTAL_SLOTS; i++) {
        if (slotTimers[i]) clearTimeout(slotTimers[i]);
        if (slotIntervals[i]) clearInterval(slotIntervals[i]);
        slotTimers[i] = null;
        slotIntervals[i] = null;
    }
    loadGame();
    if (!userProfile || !userProfile.nickname) {
        userProfile = { nickname: generateRandomNickname(), nicknameChanged: false, nicknameChangeCount: 0 };
    }
    recalcAllProducingSlots();
    for (let i = 0; i < TOTAL_SLOTS; i++) {
        if (slots[i] && slots[i].status === 'producing' && slots[i].remainingSec > 0) {
            restartSlotTimer(i);
        } else if (slots[i] && slots[i].status === 'producing' && slots[i].remainingSec === 0) {
            slots[i].status = 'completed';
            if (typeof renderSlots === 'function') renderSlots();
        }
    }
    if (typeof startGlobalProductionTimer === 'function') {
        startGlobalProductionTimer();
        console.log('⏰ 全局生产计时器已启动');
    }
    if (typeof window.initGameUI === 'function') {
        window.initGameUI();
    }
    console.log('✅ 单机版游戏初始化完成');
}
window.initGame = initGame;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initGame, 100);
    });
} else {
    setTimeout(initGame, 100);
}
console.log('✅ storage.js 加载完成（增强版：自动修复缺失字段）');