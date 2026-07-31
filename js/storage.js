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
        // ★★★ 新增：成就系统变量持久化 ★★★
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
// 加载游戏数据
// ============================================
function loadGameFromData(data) {
    try {
        cocoaBeans = data.cocoaBeans ?? 0;
        gold = data.gold ?? 0;
        miaoBargainLevel = data.miaoBargainLevel ?? 0;
        productionSpeedLevel = data.productionSpeedLevel ?? 0;
        workaholicLevel = data.workaholicLevel ?? 0;
        expBoostLevel = data.expBoostLevel ?? 0;
        totalProduced = data.totalProduced ?? 0;
        totalSold = data.totalSold ?? 0;
        totalEarned = data.totalEarned ?? 0;
        totalBeansHarvested = data.totalBeansHarvested ?? 0;
        inventory = data.inventory ?? {};
        for (let id in PRODUCTS) if (inventory[id] === undefined) inventory[id] = 0;
        if (data.energies) Object.assign(energies, data.energies);
        if (data.hiddenInventory) Object.assign(hiddenInventory, data.hiddenInventory);
        autoSaveEnabled = data.autoSaveEnabled !== undefined ? data.autoSaveEnabled : true;
        exp = data.exp ?? 0;
        level = data.level ?? 1;

        // ★★★ 新增：加载成就系统变量 ★★★
        totalOrdersCompleted = data.totalOrdersCompleted || 0;
        totalExchanges = data.totalExchanges || 0;
        totalGameTime = data.totalGameTime || 0;
        luckyBoxMaxGold = data.luckyBoxMaxGold || 0;

        if (data.userProfile && data.userProfile.nickname) {
            userProfile = {
                nickname: data.userProfile.nickname,
                nicknameChanged: data.userProfile.nicknameChanged || false,
                nicknameChangeCount: data.userProfile.nicknameChangeCount || 0
            };
        } else {
            userProfile = { nickname: generateRandomNickname(), nicknameChanged: false, nicknameChangeCount: 0 };
        }

        if (data.slots) {
            for (let i = 0; i < TOTAL_SLOTS; i++) {
                if (data.slots[i]) slots[i] = data.slots[i];
                else slots[i] = { unlocked: (i === 0), productId: null, remainingSec: 0, status: 'idle' };
            }
        }
        recalcAllProducingSlots();

        currentOrders = data.currentOrders || generateFreshOrders();
        localStorage.setItem('order_date', data.orderDate || getTodayDateStr());
        if (typeof updateOrderStatusDisplay === 'function') updateOrderStatusDisplay();
        return true;
    } catch(e) {
        console.error('加载存档数据失败:', e);
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

    // ===== 1. 清除所有 localStorage 游戏数据 =====
    var keysToRemove = [
        // 主游戏
        'chocolate_save',
        'order_date',
        'savedOrders',
        'farm_data',
        'cardmatch_reward_beans',
        'cardmatch_reward_amount',
        'cardmatch_reward_time',
        'double_gold_active',
        'shop_data',
        'player_bag',
        'achievement_data',
        'last_refresh_date',
        // 探险地图 + 子系统
        'adventurer_data',
        'explore_region_status',
        'explore_visited',
        'explore_coins',
        'explore_backpack',
        'treasure_data',
        'prince_dialogue_state',
        'croissant_state',
        'story_progress',
        'fishing_daily',
        'fishing_stats',
        'mining_data',
        'panini_data',
        'rice_data',
        'bounty_data',
        'nomo_feed_data',
        'nomo_completed',
        'rose_plant_data',
        'rose_seed_dialogue_played',
        'rose_pot_unlocked',
        'trade_total_count',
        'explore_travel_state',
        'tower_data',
        'sudoku_rewards'
    ];

    for (var i = 0; i < keysToRemove.length; i++) {
        localStorage.removeItem(keysToRemove[i]);
    }
    console.log('🗑️ localStorage 数据已清除');

    // ===== 2. 重置所有全局变量 =====
    cocoaBeans = 0;
    gold = 0;
    miaoBargainLevel = 0;
    productionSpeedLevel = 0;
    workaholicLevel = 0;
    expBoostLevel = 0;
    totalProduced = 0;
    totalSold = 0;
    totalEarned = 0;
    totalBeansHarvested = 0;
    exp = 0;
    level = 1;
    
    // ★★★ 重置成就变量 ★★★
    totalOrdersCompleted = 0;
    totalExchanges = 0;
    totalGameTime = 0;
    luckyBoxMaxGold = 0;

    // 重置库存
    if (typeof inventory !== 'undefined') {
        for (var id in PRODUCTS) inventory[id] = 0;
    }
    if (typeof hiddenInventory !== 'undefined') {
        for (var r of HIDDEN_RECIPES) hiddenInventory[r.id] = 0;
    }
    if (typeof energies !== 'undefined') {
        for (var e of ENERGY_TYPES) energies[e.id] = 0;
    }

    // 重置工坊槽位
    if (typeof slots !== 'undefined') {
        for (var i = 0; i < TOTAL_SLOTS; i++) {
            slots[i] = { unlocked: (i === 0), productId: null, remainingSec: 0, status: 'idle' };
            if (slotTimers[i]) clearTimeout(slotTimers[i]);
            if (slotIntervals[i]) clearInterval(slotIntervals[i]);
            slotTimers[i] = null;
            slotIntervals[i] = null;
        }
    }

    // 重置昵称
    if (typeof userProfile !== 'undefined') {
        userProfile = { nickname: generateRandomNickname(), nicknameChanged: false, nicknameChangeCount: 0 };
    }

    // 重置订单
    if (typeof currentOrders !== 'undefined') {
        currentOrders = generateFreshOrders();
    }
    localStorage.setItem('order_date', getTodayDateStr());
    if (typeof updateOrderStatusDisplay === 'function') updateOrderStatusDisplay();

    // 重置农场
    if (typeof resetFarmLands === 'function') resetFarmLands();

    // 重置成就
    if (typeof clearAchievementData === 'function') clearAchievementData();

    // 重置商城背包
    if (typeof shopState !== 'undefined') {
        shopState = {
            signIn: { lastDate: null, consecutiveDays: 0, signedToday: false },
            inventory: {},
            resetDate: null
        };
        for (var id in SHOP_ITEMS) {
            shopState.inventory[id] = SHOP_ITEMS[id].maxStock;
        }
    }
    if (typeof playerBag !== 'undefined') {
        for (var id in playerBag) {
            playerBag[id] = 0;
        }
    }

    // 重置探险地图变量
    if (typeof adventurerState !== 'undefined') {
        adventurerState = {
            rank: 1,
            reputation: 0,
            totalEarnedRep: 0,
            claimedRankRewards: [],
            records: []
        };
    }
    if (typeof treasureState !== 'undefined') {
        treasureState = {
            hasCompleteMap: false,
            treasureRegionId: null,
            treasurePosX: 0,
            treasurePosY: 0,
            isCompleted: false,
            completedCount: 0,
            fishCounter: 0,
            lastKabuDate: null,
            kabuGivenToday: false
        };
    }
    if (typeof regions !== 'undefined') {
        for (var i = 0; i < regions.length; i++) {
            if (regions[i].id === 'welcome') {
                regions[i].status = 'current';
            } else {
                regions[i].status = 'locked';
            }
        }
    }
    if (typeof visitedRegions !== 'undefined') visitedRegions = [];
    if (typeof STORY_DATA !== 'undefined') {
        for (var key in STORY_DATA) {
            STORY_DATA[key].completed = false;
        }
    }
    if (typeof princeLocalState !== 'undefined') {
        princeLocalState = { currentIndex: 0, isCompleted: false, hasVisited: false, randomIndex: -1 };
    }
    if (typeof croissantState !== 'undefined') {
        croissantState = { currentIndex: 0, isCompleted: false, hasVisited: false, randomIndex: -1 };
    }
    if (typeof fishingState !== 'undefined') {
        fishingState.todayCount = 0;
        fishingState.todayCatch = 0;
        fishingState.basket = [];
    }

    // 重置挑战塔
    if (typeof towerState !== 'undefined') {
        towerState = {
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
            _mineCountSinceStart: 0,
            _cookCountSinceStart: 0,
            _tradeCountSinceStart: 0,
            _perfectCountSinceStart: 0,
            _historyView: 'list'
        };
    }

    console.log('🗑️ 所有游戏数据已清除（含探险、挖矿、挑战塔等）');

    // ===== 3. 刷新 UI =====
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
    let loaded = loadGameFromLocal();
    if (!loaded) {
        clearAllGameDataLocal();
        await saveGame();
        if (typeof showMessage === 'function') showMessage('✨ 欢迎！开始你的甜点工坊之旅', false);
    }
    recalcAllProducingSlots();
    if (typeof refreshUI === 'function') refreshUI();
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

    // 清理旧的计时器
    for (let i = 0; i < TOTAL_SLOTS; i++) {
        if (slotTimers[i]) clearTimeout(slotTimers[i]);
        if (slotIntervals[i]) clearInterval(slotIntervals[i]);
        slotTimers[i] = null;
        slotIntervals[i] = null;
    }

    // 加载存档
    loadGame();

    // 确保用户昵称存在
    if (!userProfile || !userProfile.nickname) {
        userProfile = { nickname: generateRandomNickname(), nicknameChanged: false, nicknameChangeCount: 0 };
    }

    // 重新计算离线生产
    recalcAllProducingSlots();

    // 重启正在生产的槽位
    for (let i = 0; i < TOTAL_SLOTS; i++) {
        if (slots[i] && slots[i].status === 'producing' && slots[i].remainingSec > 0) {
            restartSlotTimer(i);
        } else if (slots[i] && slots[i].status === 'producing' && slots[i].remainingSec === 0) {
            slots[i].status = 'completed';
            if (typeof renderSlots === 'function') renderSlots();
        }
    }

    // 启动全局生产计时器
    if (typeof startGlobalProductionTimer === 'function') {
        startGlobalProductionTimer();
        console.log('⏰ 全局生产计时器已启动');
    }

    // 初始化 UI
    if (typeof window.initGameUI === 'function') {
        window.initGameUI();
    }

    console.log('✅ 单机版游戏初始化完成');
}
window.initGame = initGame;

// ============================================
// 页面加载时自动初始化
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initGame, 100);
    });
} else {
    setTimeout(initGame, 100);
}
console.log('✅ storage.js 加载完成（防御性检查已添加）');