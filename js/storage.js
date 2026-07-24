// js/storage.js

function getTodayDateStr() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

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
        cocoaBeans, gold, miaoBargainLevel, productionSpeedLevel, workaholicLevel, expBoostLevel,
        totalProduced, totalSold, totalEarned, totalBeansHarvested,
        inventory, energies, hiddenInventory,
        slots: slots.map(slot => ({
            unlocked: slot.unlocked,
            productId: slot.productId,
            remainingSec: slot.remainingSec,
            totalProductionTime: slot.totalProductionTime,
            productionStartTime: slot.productionStartTime,
            status: slot.status
        })),
        autoSaveEnabled, exp, level, userProfile,
        currentOrders, orderDate: getTodayDateStr(),
        lastSyncTime: Date.now()
    };
    const key = 'chocolate_save';
    localStorage.setItem(key, JSON.stringify(saveData));
    console.log('📀 本地存档已保存');
}

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

function loadGameFromLocal() {
    const key = 'chocolate_save';
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    try {
        const data = JSON.parse(raw);
        return loadGameFromData(data);
    } catch(e) {
        console.warn(e);
        return false;
    }
}

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
                console.log(`📦 槽位 ${i+1} 离线期间已完成生产`);
            } else {
                console.log(`📦 槽位 ${i+1} 剩余 ${remaining} 秒`);
            }
        }
    }
    if (needSave && autoSaveEnabled) saveGame();
}

// ============================================================
// clearAllGameDataLocal - 完整清除所有游戏数据（含探险地图）
// ============================================================
function clearAllGameDataLocal() {
    // ===== 主游戏数据 =====
    localStorage.removeItem('chocolate_save');
    localStorage.removeItem('order_date');
    localStorage.removeItem('savedOrders');
    localStorage.removeItem('farm_data');
    localStorage.removeItem('cardmatch_reward_beans');
    localStorage.removeItem('cardmatch_reward_amount');
    localStorage.removeItem('cardmatch_reward_time');
    localStorage.removeItem('double_gold_active');
    localStorage.removeItem('shop_data');
    localStorage.removeItem('player_bag');
    localStorage.removeItem('achievement_data');

    // ===== 探险地图数据 =====
    localStorage.removeItem('adventurer_data');
    localStorage.removeItem('explore_region_status');
    localStorage.removeItem('explore_visited');
    localStorage.removeItem('explore_coins');
    localStorage.removeItem('explore_backpack');
    localStorage.removeItem('treasure_data');
    localStorage.removeItem('prince_dialogue_state');
    localStorage.removeItem('croissant_state');
    localStorage.removeItem('story_progress');
    localStorage.removeItem('fishing_daily');
    localStorage.removeItem('sudoku_rewards');
    localStorage.removeItem('last_refresh_date');

    // ===== 重置游戏变量 =====
    if (typeof cocoaBeans !== 'undefined') cocoaBeans = 0;
    if (typeof gold !== 'undefined') gold = 0;
    if (typeof miaoBargainLevel !== 'undefined') miaoBargainLevel = 0;
    if (typeof productionSpeedLevel !== 'undefined') productionSpeedLevel = 0;
    if (typeof workaholicLevel !== 'undefined') workaholicLevel = 0;
    if (typeof expBoostLevel !== 'undefined') expBoostLevel = 0;
    if (typeof totalProduced !== 'undefined') totalProduced = 0;
    if (typeof totalSold !== 'undefined') totalSold = 0;
    if (typeof totalEarned !== 'undefined') totalEarned = 0;
    if (typeof totalBeansHarvested !== 'undefined') totalBeansHarvested = 0;
    if (typeof exp !== 'undefined') exp = 0;
    if (typeof level !== 'undefined') level = 1;

    // ===== 重置库存 =====
    if (typeof inventory !== 'undefined') {
        for (var id in PRODUCTS) inventory[id] = 0;
    }
    if (typeof hiddenInventory !== 'undefined') {
        for (var r of HIDDEN_RECIPES) hiddenInventory[r.id] = 0;
    }
    if (typeof energies !== 'undefined') {
        for (var e of ENERGY_TYPES) energies[e.id] = 0;
    }

    // ===== 重置工坊槽位 =====
    if (typeof slots !== 'undefined') {
        for (var i = 0; i < TOTAL_SLOTS; i++) {
            slots[i] = { unlocked: (i === 0), productId: null, remainingSec: 0, status: 'idle' };
            if (slotTimers[i]) clearTimeout(slotTimers[i]);
            if (slotIntervals[i]) clearInterval(slotIntervals[i]);
            slotTimers[i] = null;
            slotIntervals[i] = null;
        }
    }

    // ===== 重置用户昵称 =====
    if (typeof userProfile !== 'undefined') {
        userProfile = { nickname: generateRandomNickname(), nicknameChanged: false, nicknameChangeCount: 0 };
    }

    // ===== 重置订单 =====
    if (typeof currentOrders !== 'undefined') {
        currentOrders = generateFreshOrders();
    }
    localStorage.setItem('order_date', getTodayDateStr());
    if (typeof updateOrderStatusDisplay === 'function') updateOrderStatusDisplay();

    // ===== 重置农场 =====
    if (typeof resetFarmLands === 'function') resetFarmLands();

    // ===== 重置成就 =====
    if (typeof clearAchievementData === 'function') clearAchievementData();

    // ===== 重置商城背包 =====
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

    // ===== 重置探险地图变量 =====
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
    if (typeof visitedRegions !== 'undefined') {
        visitedRegions = [];
    }
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

    // ===== 刷新 UI =====
    if (typeof refreshUI === 'function') refreshUI();
    if (typeof renderSlots === 'function') renderSlots();
    if (typeof renderQuickSell === 'function') renderQuickSell();
    if (typeof renderShopUI === 'function') renderShopUI();

    console.log('🗑️ 所有游戏数据已清除（含探险地图、冒险者等级）');
}

async function saveGame() {
    saveGameToLocal();
}

async function loadGame() {
    let loaded = loadGameFromLocal();
    if (!loaded) {
        clearAllGameDataLocal();
        await saveGame();
        if (typeof showMessage === 'function') showMessage("✨ 欢迎！开始你的甜点工坊之旅", false);
    }
    recalcAllProducingSlots();
    if (typeof refreshUI === 'function') refreshUI();
    return loaded;
}

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
    slotIntervals[slotIndex] = setInterval(() => {
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

function initGame() {
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

window.clearAllGameDataLocal = clearAllGameDataLocal;
window.recalcAllProducingSlots = recalcAllProducingSlots;
window.restartSlotTimer = restartSlotTimer;
window.saveGame = saveGame;
window.loadGame = loadGame;
window.initGame = initGame;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}