// ============================================================
// bounty.js · 悬赏板系统（完整版 · 任务类型多样化）
// ============================================================

console.log('📋 悬赏板系统加载中...');

// ============================================================
// 悬赏NPC配置（9位）
// ============================================================
var BOUNTY_NPCS = {
    kabu: {
        id: 'kabu',
        name: '喀哺',
        icon: '🧓',
        avatar: 'images/kabutou.png',
        region: 'welcome',
        regionName: '欢迎米来湾',
        unlockLevel: 1
    },
    ajiu: {
        id: 'ajiu',
        name: '阿就',
        icon: '🎣',
        avatar: 'images/fisherman.png',
        region: 'nocean',
        regionName: '可以就这洋',
        unlockLevel: 5
    },
    prince: {
        id: 'prince',
        name: '小王子',
        icon: '🐧',
        avatar: 'images/prince.png',
        region: 'nomo_peninsula',
        regionName: '嫑锅半岛',
        unlockLevel: 8
    },
    eggmaster: {
        id: 'eggmaster',
        name: '煎蛋大师',
        icon: '🍳',
        avatar: 'images/eggking.png',
        region: 'friedegg',
        regionName: '煎蛋海',
        unlockLevel: 10
    },
    laokesong: {
        id: 'laokesong',
        name: '老可颂',
        icon: '🥐',
        avatar: 'images/laokesong.png',
        region: 'croissant',
        regionName: '可颂大陆',
        unlockLevel: 13
    },
    guoshu: {
        id: 'guoshu',
        name: '锅叔',
        icon: '⛏️',
        avatar: 'images/guoshu.png',
        region: 'dumbpan',
        regionName: '沙锅洲',
        unlockLevel: 16
    },
    xiaolou: {
        id: 'xiaolou',
        name: '小楼',
        icon: '🧂',
        avatar: 'images/xiaolou.png',
        region: 'baxian',
        regionName: '八仙锅海',
        unlockLevel: 22
    },
    farmer: {
        id: 'farmer',
        name: '农民',
        icon: '🌾',
        avatar: 'images/farmer.png',
        region: 'rice',
        regionName: '大米洲',
        unlockLevel: 20
    },
    laopa: {
        id: 'laopa',
        name: '老帕',
        icon: '🍳',
        avatar: 'images/laopa.png',
        region: 'panini',
        regionName: '帕尼尼大陆',
        unlockLevel: 25
    }
};

// ============================================================
// 任务模板（只保留基础模板，不包含食物）
// ============================================================
var BOUNTY_TEMPLATES = {
    // ---- 鱼类（可以就这洋） ----
    fish_clownfish: {
        id: 'fish_clownfish',
        type: 'collect_fish',
        targetId: 'clownfish',
        targetName: '小丑鱼',
        icon: '🐟',
        sourceRegion: 'nocean',
        quantityMin: 3,
        quantityMax: 5,
        difficulty: 'easy'
    },
    fish_tuna: {
        id: 'fish_tuna',
        type: 'collect_fish',
        targetId: 'tuna',
        targetName: '金枪鱼',
        icon: '🐠',
        sourceRegion: 'nocean',
        quantityMin: 3,
        quantityMax: 5,
        difficulty: 'easy'
    },
    fish_pearlfish: {
        id: 'fish_pearlfish',
        type: 'collect_fish',
        targetId: 'pearlfish',
        targetName: '珍珠鱼',
        icon: '🐡',
        sourceRegion: 'nocean',
        quantityMin: 1,
        quantityMax: 2,
        difficulty: 'normal'
    },
    fish_bluewhale: {
        id: 'fish_bluewhale',
        type: 'collect_fish',
        targetId: 'bluewhale',
        targetName: '蓝鲸鱼',
        icon: '🐋',
        sourceRegion: 'nocean',
        quantityMin: 1,
        quantityMax: 2,
        difficulty: 'normal'
    },
    fish_legendfish: {
        id: 'fish_legendfish',
        type: 'collect_fish',
        targetId: 'legendfish',
        targetName: '传说鱼',
        icon: '🐉',
        sourceRegion: 'nocean',
        quantityMin: 1,
        quantityMax: 1,
        difficulty: 'hard'
    },

    // ---- 鸡蛋/金蛋（煎蛋海） ----
    egg: {
        id: 'egg',
        type: 'collect_egg',
        targetId: 'egg',
        targetName: '鸡蛋',
        icon: '🥚',
        sourceRegion: 'friedegg',
        quantityMin: 2,
        quantityMax: 3,
        difficulty: 'easy'
    },
    golden_egg: {
        id: 'golden_egg',
        type: 'collect_golden_egg',
        targetId: 'golden_egg',
        targetName: '金蛋',
        icon: '🥚✨',
        sourceRegion: 'friedegg',
        quantityMin: 1,
        quantityMax: 1,
        difficulty: 'hard'
    },

    // ---- 稻谷/金色稻穗（大米洲） ----
    rice_grain: {
        id: 'rice_grain',
        type: 'collect_rice',
        targetId: 'rice_grain',
        targetName: '稻谷',
        icon: '🌾',
        sourceRegion: 'rice',
        quantityMin: 10,
        quantityMax: 20,
        difficulty: 'easy'
    },
    golden_ear: {
        id: 'golden_ear',
        type: 'collect_golden_ear',
        targetId: 'golden_ear',
        targetName: '金色稻穗',
        icon: '🌾✨',
        sourceRegion: 'rice',
        quantityMin: 3,
        quantityMax: 5,
        difficulty: 'normal'
    },

    // ---- 矿石（沙锅洲） ----
    iron_ore: {
        id: 'iron_ore',
        type: 'collect_iron',
        targetId: 'iron_ore',
        targetName: '铁矿',
        icon: '🪨',
        sourceRegion: 'dumbpan',
        quantityMin: 5,
        quantityMax: 10,
        difficulty: 'easy'
    },
    diamond: {
        id: 'diamond',
        type: 'collect_diamond',
        targetId: 'diamond',
        targetName: '钻石',
        icon: '💎',
        sourceRegion: 'dumbpan',
        quantityMin: 1,
        quantityMax: 2,
        difficulty: 'hard'
    },

    // ---- 粉碎产物（八仙锅海） ----
    cocoa_powder: {
        id: 'cocoa_powder',
        type: 'collect_item',
        targetId: 'cocoa_powder',
        targetName: '可可粉',
        icon: '🍫',
        sourceRegion: 'baxian',
        quantityMin: 5,
        quantityMax: 10,
        difficulty: 'easy'
    },
    ore_fuel: {
        id: 'ore_fuel',
        type: 'collect_item',
        targetId: 'ore_fuel',
        targetName: '燃料',
        icon: '⛽',
        sourceRegion: 'baxian',
        quantityMin: 5,
        quantityMax: 10,
        difficulty: 'easy'
    }
};

// ============================================================
// 奖励配置
// ============================================================
var BOUNTY_REWARDS = {
    easy: { rep: 1, coins: 3 },
    normal: { rep: 3, coins: 5 },
    hard: { rep: 5, coins: 8 }
};

// ============================================================
// 状态
// ============================================================
var bountyState = {
    date: null,
    tasks: [],
    activeTaskId: null
};

// ============================================================
// 数据持久化
// ============================================================
function loadBountyData() {
    try {
        var saved = localStorage.getItem('bounty_data');
        if (saved) {
            var data = JSON.parse(saved);
            bountyState.date = data.date || null;
            bountyState.tasks = data.tasks || [];
            bountyState.activeTaskId = data.activeTaskId || null;
            return true;
        }
    } catch(e) {
        console.warn('加载悬赏数据失败:', e);
    }
    return false;
}

function saveBountyData() {
    try {
        var data = {
            date: bountyState.date,
            tasks: bountyState.tasks,
            activeTaskId: bountyState.activeTaskId
        };
        localStorage.setItem('bounty_data', JSON.stringify(data));
    } catch(e) {
        console.warn('保存悬赏数据失败:', e);
    }
}

function getBountyTodayDateStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// ============================================================
// 工具函数
// ============================================================
function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

function getBountyBackpack() {
    try {
        var data = localStorage.getItem('explore_backpack');
        return data ? JSON.parse(data) : {};
    } catch(e) { return {}; }
}

function saveBountyBackpack(bp) {
    localStorage.setItem('explore_backpack', JSON.stringify(bp));
}

function getBountyRegion(regionId) {
    if (typeof window.getRegion === 'function') {
        return window.getRegion(regionId);
    }
    return null;
}

function isRegionUnlocked(regionId) {
    var region = getBountyRegion(regionId);
    return region && region.status !== 'locked';
}

// ============================================================
// 获取已解锁的NPC
// ============================================================
function getUnlockedNpcIds() {
    var unlocked = [];
    for (var id in BOUNTY_NPCS) {
        var npc = BOUNTY_NPCS[id];
        if (isRegionUnlocked(npc.region)) {
            unlocked.push(id);
        }
    }
    return unlocked;
}

// ============================================================
// 获取可用模板（严格限制食物数量）
// ============================================================
function getAvailableTemplatesForUnlockedRegions() {
    var allTemplates = [];

    // 1. 钓鱼
    if (isRegionUnlocked('nocean')) {
        allTemplates.push(BOUNTY_TEMPLATES.fish_clownfish);
        allTemplates.push(BOUNTY_TEMPLATES.fish_tuna);
        allTemplates.push(BOUNTY_TEMPLATES.fish_pearlfish);
        allTemplates.push(BOUNTY_TEMPLATES.fish_bluewhale);
        allTemplates.push(BOUNTY_TEMPLATES.fish_legendfish);
    }

    // 2. 鸡蛋/金蛋
    if (isRegionUnlocked('friedegg')) {
        allTemplates.push(BOUNTY_TEMPLATES.egg);
        allTemplates.push(BOUNTY_TEMPLATES.golden_egg);
    }

    // 3. 稻谷/金色稻穗
    if (isRegionUnlocked('rice')) {
        allTemplates.push(BOUNTY_TEMPLATES.rice_grain);
        allTemplates.push(BOUNTY_TEMPLATES.golden_ear);
    }

    // 4. 矿石
    if (isRegionUnlocked('dumbpan')) {
        allTemplates.push(BOUNTY_TEMPLATES.iron_ore);
        allTemplates.push(BOUNTY_TEMPLATES.diamond);
    }

    // 5. 粉碎产物
    if (isRegionUnlocked('baxian')) {
        allTemplates.push(BOUNTY_TEMPLATES.cocoa_powder);
        allTemplates.push(BOUNTY_TEMPLATES.ore_fuel);
    }

    // 6. 帕尼尼食物（最多 2 个）
    if (isRegionUnlocked('panini')) {
        var foods = getAvailableFoodTemplates();
        shuffleArray(foods);
        var foodCount = Math.min(foods.length, 2);
        for (var i = 0; i < foodCount; i++) {
            allTemplates.push(foods[i]);
        }
    }

    // 7. 主游戏产品（最多 2 个）
    if (isRegionUnlocked('croissant')) {
        var products = getAvailableProductTemplates();
        shuffleArray(products);
        var prodCount = Math.min(products.length, 2);
        for (var i = 0; i < prodCount; i++) {
            allTemplates.push(products[i]);
        }
    }

    return allTemplates;
}

// ============================================================
// 获取食物模板（帕尼尼）
// ============================================================
function getAvailableFoodTemplates() {
    var foods = [];
    if (typeof window.PANINI_RECIPES !== 'undefined') {
        window.PANINI_RECIPES.forEach(function(r) {
            foods.push({
                id: 'food_' + r.id,
                type: 'collect_food',
                targetId: r.id,
                targetName: r.name,
                icon: r.icon,
                sourceRegion: 'panini',
                quantityMin: 2,
                quantityMax: 3,
                difficulty: 'normal',
                isDynamic: true
            });
            // 硬菜（传说级）单独作为困难任务
            if (r.id === 'legend_feast' || r.id === 'legend_croissant' || r.id === 'seafood_pot') {
                foods.push({
                    id: 'food_hard_' + r.id,
                    type: 'collect_food',
                    targetId: r.id,
                    targetName: r.name,
                    icon: r.icon,
                    sourceRegion: 'panini',
                    quantityMin: 1,
                    quantityMax: 2,
                    difficulty: 'hard',
                    isDynamic: true
                });
            }
        });
    }
    return foods;
}

// ============================================================
// 获取产品模板（主游戏）
// ============================================================
function getAvailableProductTemplates() {
    var products = [];
    if (typeof PRODUCTS !== 'undefined') {
        var normalOrder = [
            { id: 'charlieChocolate', name: '查理的巧克力', icon: '🍫' },
            { id: 'hawthornStack', name: '好事楂堆', icon: '🍡' },
            { id: 'cheeseCocoa', name: '芝士可可', icon: '🧀' },
            { id: 'luckyPeanut', name: '好事花生', icon: '🥜' },
            { id: 'cherryInfinity', name: '樱有尽有', icon: '🍒' },
            { id: 'sunEggToast', name: '小太阳蛋元气吐司', icon: '🍞' },
            { id: 'milkSkinDelight', name: '万事米丽奶皮子', icon: '🥛' },
            { id: 'tiramisuCroissant', name: '提拉米苏可颂', icon: '🥐' }
        ];
        normalOrder.forEach(function(p) {
            var prod = PRODUCTS[p.id];
            if (prod) {
                products.push({
                    id: 'craft_' + p.id,
                    type: 'craft_product',
                    targetId: p.id,
                    targetName: p.name,
                    icon: p.icon,
                    sourceRegion: 'main',
                    quantityMin: 3,
                    quantityMax: 5,
                    difficulty: 'normal',
                    isDynamic: true
                });
                // 部分产品增加困难版
                if (p.id === 'tiramisuCroissant' || p.id === 'milkSkinDelight' || p.id === 'luckyPeanut') {
                    products.push({
                        id: 'craft_hard_' + p.id,
                        type: 'craft_product',
                        targetId: p.id,
                        targetName: p.name,
                        icon: p.icon,
                        sourceRegion: 'main',
                        quantityMin: 1,
                        quantityMax: 2,
                        difficulty: 'hard',
                        isDynamic: true
                    });
                }
            }
        });
    }
    return products;
}

// ============================================================
// 生成每日悬赏（任务类型多样化）
// ============================================================
function generateDailyBounties() {
    var today = getBountyTodayDateStr();

    if (bountyState.date === today && bountyState.tasks.length > 0) {
        return;
    }

    // 获取所有可用模板（已经限制了食物数量）
    var allTemplates = getAvailableTemplatesForUnlockedRegions();
    if (allTemplates.length === 0) {
        bountyState.date = today;
        bountyState.tasks = [];
        bountyState.activeTaskId = null;
        saveBountyData();
        return;
    }

    // 按类型分组
    var grouped = {};
    for (var i = 0; i < allTemplates.length; i++) {
        var t = allTemplates[i];
        var type = t.type || 'unknown';
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push(t);
    }

    // 定义每种类型最多取几个
    var maxPerType = {
        'collect_fish': 2,
        'collect_egg': 1,
        'collect_golden_egg': 1,
        'collect_rice': 1,
        'collect_golden_ear': 1,
        'collect_iron': 1,
        'collect_diamond': 1,
        'collect_item': 2,
        'collect_food': 1,      // 食物最多 1 个
        'craft_product': 1       // 产品最多 1 个
    };

    var selectedTemplates = [];

    // 先取非食物类
    var typeOrder = ['collect_fish', 'collect_egg', 'collect_golden_egg', 'collect_rice', 'collect_golden_ear', 'collect_iron', 'collect_diamond', 'collect_item'];
    for (var ti = 0; ti < typeOrder.length; ti++) {
        var typeKey = typeOrder[ti];
        var pool = grouped[typeKey] || [];
        if (pool.length === 0) continue;
        shuffleArray(pool);
        var count = Math.min(pool.length, maxPerType[typeKey] || 1);
        for (var c = 0; c < count; c++) {
            selectedTemplates.push(pool[c]);
        }
    }

    // 再取食物类（collect_food + craft_product）合计最多 1 个
    var foodPool = [];
    if (grouped['collect_food']) {
        for (var f = 0; f < grouped['collect_food'].length; f++) {
            foodPool.push(grouped['collect_food'][f]);
        }
    }
    if (grouped['craft_product']) {
        for (var f = 0; f < grouped['craft_product'].length; f++) {
            foodPool.push(grouped['craft_product'][f]);
        }
    }
    if (foodPool.length > 0) {
        shuffleArray(foodPool);
        // 食物类最多 1 个
        var foodCount = Math.min(foodPool.length, 1);
        for (var c = 0; c < foodCount; c++) {
            selectedTemplates.push(foodPool[c]);
        }
    }

    // 如果选中的少于 5 个，从所有模板中补充（但避免重复）
    while (selectedTemplates.length < 5 && allTemplates.length > 0) {
        var extra = allTemplates[Math.floor(Math.random() * allTemplates.length)];
        var duplicate = false;
        for (var s = 0; s < selectedTemplates.length; s++) {
            if (selectedTemplates[s].id === extra.id) { duplicate = true; break; }
        }
        if (!duplicate) {
            selectedTemplates.push(extra);
        } else {
            // 尝试找不同的
            var found = false;
            for (var a = 0; a < allTemplates.length; a++) {
                var candidate = allTemplates[a];
                var dup2 = false;
                for (var s2 = 0; s2 < selectedTemplates.length; s2++) {
                    if (selectedTemplates[s2].id === candidate.id) { dup2 = true; break; }
                }
                if (!dup2) {
                    selectedTemplates.push(candidate);
                    found = true;
                    break;
                }
            }
            if (!found) break;
        }
    }

    // 如果仍然少于 5 个，用所有模板填充（但保证不重复）
    if (selectedTemplates.length < 5 && allTemplates.length > 0) {
        for (var a = 0; a < allTemplates.length && selectedTemplates.length < 5; a++) {
            var dup3 = false;
            for (var s3 = 0; s3 < selectedTemplates.length; s3++) {
                if (selectedTemplates[s3].id === allTemplates[a].id) { dup3 = true; break; }
            }
            if (!dup3) {
                selectedTemplates.push(allTemplates[a]);
            }
        }
    }

    // 获取已解锁 NPC
    var unlockedNpcs = getUnlockedNpcIds();
    if (unlockedNpcs.length === 0) {
        bountyState.date = today;
        bountyState.tasks = [];
        bountyState.activeTaskId = null;
        saveBountyData();
        return;
    }

    shuffleArray(unlockedNpcs);

    // 为每个选中的模板分配 NPC
    var tasks = [];
    var usedNpcs = [];
    for (var i = 0; i < selectedTemplates.length && i < unlockedNpcs.length; i++) {
        var template = selectedTemplates[i];
        var npcId = unlockedNpcs[i];
        var npc = BOUNTY_NPCS[npcId];
        if (!npc) continue;
        usedNpcs.push(npcId);

        var quantity = template.quantityMin + Math.floor(Math.random() * (template.quantityMax - template.quantityMin + 1));
        var reward = BOUNTY_REWARDS[template.difficulty] || BOUNTY_REWARDS.normal;

        tasks.push({
            id: 'bounty_' + Date.now() + '_' + i,
            npcId: npcId,
            npcName: npc.name,
            npcIcon: npc.icon,
            npcRegion: npc.regionName,
            templateId: template.id,
            type: template.type,
            targetId: template.targetId,
            targetName: template.targetName,
            icon: template.icon,
            quantity: quantity,
            currentProgress: 0,
            status: 'available',
            rewardRep: reward.rep,
            rewardCoins: reward.coins,
            difficulty: template.difficulty,
            sourceRegion: template.sourceRegion,
            isDynamic: template.isDynamic || false
        });
    }

    // 如果任务少于 5 个，用剩余 NPC 补充（但只选非食物模板）
    if (tasks.length < 5 && unlockedNpcs.length > usedNpcs.length) {
        var remainingNpcs = [];
        for (var i = 0; i < unlockedNpcs.length; i++) {
            if (usedNpcs.indexOf(unlockedNpcs[i]) === -1) {
                remainingNpcs.push(unlockedNpcs[i]);
            }
        }
        // 从 allTemplates 中找非食物模板
        var extraTemplates = [];
        for (var i = 0; i < allTemplates.length; i++) {
            var t = allTemplates[i];
            if (t.type !== 'collect_food' && t.type !== 'craft_product') {
                var dup4 = false;
                for (var s4 = 0; s4 < tasks.length; s4++) {
                    if (tasks[s4].templateId === t.id) { dup4 = true; break; }
                }
                if (!dup4) {
                    extraTemplates.push(t);
                }
            }
        }
        shuffleArray(extraTemplates);
        for (var i = 0; i < extraTemplates.length && tasks.length < 5 && i < remainingNpcs.length; i++) {
            var template = extraTemplates[i];
            var npcId = remainingNpcs[i];
            var npc = BOUNTY_NPCS[npcId];
            if (!npc) continue;
            var quantity = template.quantityMin + Math.floor(Math.random() * (template.quantityMax - template.quantityMin + 1));
            var reward = BOUNTY_REWARDS[template.difficulty] || BOUNTY_REWARDS.normal;
            tasks.push({
                id: 'bounty_' + Date.now() + '_extra_' + i,
                npcId: npcId,
                npcName: npc.name,
                npcIcon: npc.icon,
                npcRegion: npc.regionName,
                templateId: template.id,
                type: template.type,
                targetId: template.targetId,
                targetName: template.targetName,
                icon: template.icon,
                quantity: quantity,
                currentProgress: 0,
                status: 'available',
                rewardRep: reward.rep,
                rewardCoins: reward.coins,
                difficulty: template.difficulty,
                sourceRegion: template.sourceRegion,
                isDynamic: template.isDynamic || false
            });
        }
    }

    bountyState.date = today;
    bountyState.tasks = tasks;
    bountyState.activeTaskId = null;
    saveBountyData();
}

// ============================================================
// 玩家物品数量
// ============================================================
function getPlayerItemCount(itemId) {
    var backpack = getBountyBackpack();
    var count = backpack[itemId] || 0;

    if (typeof inventory !== 'undefined' && inventory[itemId] !== undefined) {
        count += inventory[itemId] || 0;
    }

    return count;
}

// ============================================================
// 扣除物品
// ============================================================
function deductPlayerItem(itemId, amount) {
    var needed = amount;
    var backpack = getBountyBackpack();

    var backpackAmount = backpack[itemId] || 0;
    var deductFromBackpack = Math.min(backpackAmount, needed);
    if (deductFromBackpack > 0) {
        backpack[itemId] = backpackAmount - deductFromBackpack;
        needed -= deductFromBackpack;
    }

    if (needed > 0 && typeof inventory !== 'undefined' && inventory[itemId] !== undefined) {
        var invAmount = inventory[itemId] || 0;
        var deductFromInv = Math.min(invAmount, needed);
        if (deductFromInv > 0) {
            inventory[itemId] = invAmount - deductFromInv;
            needed -= deductFromInv;
        }
    }

    saveBountyBackpack(backpack);
    return needed === 0;
}

function getPlayerItemDisplay(itemId) {
    var backpack = getBountyBackpack();
    var count = backpack[itemId] || 0;
    if (typeof inventory !== 'undefined' && inventory[itemId] !== undefined) {
        count += inventory[itemId] || 0;
    }
    return count;
}

function showBountyStatus(msg, isError) {
    var el = document.getElementById('bountyStatus');
    if (el) {
        el.textContent = msg;
        el.style.color = isError ? '#ff6b6b' : '#ffd700';
        clearTimeout(el._timer);
        el._timer = setTimeout(function() {
            el.textContent = '';
        }, 3000);
    } else {
        console.log('📋 [Bounty] ' + msg);
    }
}

// ============================================================
// 核心操作
// ============================================================
function acceptBounty(taskId) {
    if (bountyState.activeTaskId && bountyState.activeTaskId !== taskId) {
        showBountyStatus('⚠️ 你已经有进行中的悬赏了，请先提交或放弃', true);
        return;
    }

    var task = bountyState.tasks.find(function(t) { return t.id === taskId; });
    if (!task) {
        showBountyStatus('❌ 任务不存在', true);
        return;
    }

    if (task.status === 'completed') {
        showBountyStatus('✅ 这个任务已经完成了', true);
        return;
    }

    if (task.status === 'ongoing') {
        showBountyStatus('⏳ 这个任务已经在进行中', true);
        return;
    }

    task.status = 'ongoing';
    task.currentProgress = getPlayerItemCount(task.targetId);
    if (task.currentProgress > task.quantity) task.currentProgress = task.quantity;
    bountyState.activeTaskId = taskId;
    // ===== 添加音效 =====
    if (typeof soundAcceptQuest === 'function') soundAcceptQuest();
    // ===== 音效添加结束 =====
    saveBountyData();
    renderBountyBoard();

    showBountyStatus('📋 已接取任务：' + task.targetName + ' x ' + task.quantity, false);
}

function submitBounty(taskId) {
    var task = bountyState.tasks.find(function(t) { return t.id === taskId; });
    if (!task) {
        showBountyStatus('❌ 任务不存在', true);
        return;
    }

    if (task.status !== 'ongoing') {
        showBountyStatus('⚠️ 这个任务还没有接取或已完成', true);
        return;
    }

    task.currentProgress = getPlayerItemCount(task.targetId);
    if (task.currentProgress > task.quantity) task.currentProgress = task.quantity;

    if (task.currentProgress < task.quantity) {
        showBountyStatus('❌ 还需要 ' + (task.quantity - task.currentProgress) + ' 个 ' + task.targetName, true);
        renderBountyBoard();
        return;
    }

    if (!deductPlayerItem(task.targetId, task.quantity)) {
        showBountyStatus('❌ 扣除物品失败，请重试', true);
        return;
    }

    if (typeof window.addReputation === 'function') {
        window.addReputation(task.rewardRep, '完成悬赏：' + task.targetName);
    }

    if (typeof window.addExploreCoins === 'function') {
        window.addExploreCoins(task.rewardCoins);
    }

    var backpack = getBountyBackpack();
    backpack['star_dew'] = (backpack['star_dew'] || 0) + 1;
    saveBountyBackpack(backpack);

    task.status = 'completed';
    bountyState.activeTaskId = null;

    saveBountyData();
    renderBountyBoard();
    // ===== 添加音效 =====
    if (typeof soundSuccess === 'function') soundSuccess();
    if (typeof soundCoin === 'function') soundCoin();
    // ===== 音效添加结束 =====

    showBountyStatus('🎉 悬赏完成！获得 ' + task.rewardRep + ' 声望 + ' + task.rewardCoins + ' 探险币 + 💧1滴露珠！', false);

    if (typeof window.refreshUI === 'function') window.refreshUI();
    if (typeof window.updateExploreCoinsDisplay === 'function') window.updateExploreCoinsDisplay();
    if (typeof window.updateAdventurerUI === 'function') window.updateAdventurerUI();

    var current = typeof getCurrentRegion === 'function' ? getCurrentRegion() : null;
    if (current && current.id === 'nomo_peninsula' && typeof window.updateFlowerPot === 'function') {
        setTimeout(function() {
            window.updateFlowerPot();
        }, 300);
    }

    if (typeof window.checkAchievements === 'function') {
        setTimeout(function() {
            window.checkAchievements();
        }, 300);
    }
}

function abandonBounty(taskId) {
    var taskIndex = bountyState.tasks.findIndex(function(t) { return t.id === taskId; });
    if (taskIndex === -1) {
        showBountyStatus('❌ 任务不存在', true);
        return;
    }

    var task = bountyState.tasks[taskIndex];

    if (bountyState.activeTaskId === taskId) {
        bountyState.activeTaskId = null;
    }

    bountyState.tasks.splice(taskIndex, 1);

    saveBountyData();
    renderBountyBoard();

    showBountyStatus('🗑️ 已放弃悬赏：' + task.targetName, false);
}

function refreshBountyProgress(taskId) {
    var task = bountyState.tasks.find(function(t) { return t.id === taskId; });
    if (!task) return;
    if (task.status !== 'ongoing') return;

    var current = getPlayerItemCount(task.targetId);
    task.currentProgress = Math.min(current, task.quantity);

    saveBountyData();
    renderBountyBoard();

    showBountyStatus('🔄 已刷新进度：' + task.currentProgress + '/' + task.quantity, false);
}

// ============================================================
// 渲染悬赏板
// ============================================================
function renderBountyBoard() {
    var container = document.getElementById('bountyMode');
    if (!container) return;

    if (typeof window.loadRegionStatus === 'function') {
        window.loadRegionStatus();
    }

    var today = getBountyTodayDateStr();
    if (bountyState.date !== today || bountyState.tasks.length === 0) {
        generateDailyBounties();
    }

    var tasks = bountyState.tasks;
    var activeTaskId = bountyState.activeTaskId;
    var unlockedCount = getUnlockedNpcIds().length;

    var html = '';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-shrink:0;">';
    html += '  <div style="display:flex;align-items:center;gap:12px;">';
    html += '    <h3 style="color:#ffd700;margin:0;font-size:1.1rem;">📋 每日悬赏</h3>';
    html += '    <span style="font-size:0.6rem;color:rgba(255,255,255,0.2);">已解锁 ' + unlockedCount + ' 个岛屿</span>';
    html += '  </div>';
    html += '  <button id="closeBountyBtn" style="background:#c98f5e;border:none;border-radius:30px;padding:4px 14px;cursor:pointer;font-size:0.7rem;color:white;font-weight:bold;">关闭</button>';
    html += '</div>';

    if (tasks.length === 0) {
        html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.2);text-align:center;padding:40px 0;">';
        html += '  <div style="font-size:3rem;margin-bottom:12px;">📋</div>';
        html += '  <div style="font-size:1rem;color:rgba(255,255,255,0.15);">暂无悬赏</div>';
        html += '  <div style="font-size:0.65rem;color:rgba(255,255,255,0.08);margin-top:4px;">解锁更多岛屿来获取悬赏任务吧</div>';
        html += '</div>';
        html += '<div id="bountyStatus" style="font-size:0.7rem;color:rgba(255,255,255,0.3);text-align:center;min-height:20px;padding:4px 0;"></div>';
        container.innerHTML = html;

        var closeBtn2 = document.getElementById('closeBountyBtn');
        if (closeBtn2) {
            closeBtn2.onclick = function() {
                if (typeof window.closeBountyBoard === 'function') {
                    window.closeBountyBoard();
                }
            };
        }
        return;
    }

    html += '<div style="flex:1;overflow-y:auto;padding-right:4px;scrollbar-width:none;-ms-overflow-style:none;">';
    html += '<style>.bounty-list::-webkit-scrollbar{display:none!important;}</style>';
    html += '<div class="bounty-list" style="display:flex;flex-direction:column;gap:10px;padding-bottom:8px;">';

    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        var isActive = (task.status === 'ongoing');
        var isCompleted = (task.status === 'completed');
        var isAvailable = (task.status === 'available');

        var progressPercent = task.quantity > 0 ? Math.min(100, Math.round((task.currentProgress / task.quantity) * 100)) : 0;
        var isProgressFull = (task.currentProgress >= task.quantity);

        var difficultyLabel = task.difficulty === 'easy' ? '🟢 简单' : (task.difficulty === 'normal' ? '🟡 普通' : '🔴 困难');
        var statusLabel = isCompleted ? '✅ 已完成' : (isActive ? '⏳ 进行中' : '📋 可接取');

        var borderColor = isActive ? 'rgba(255,215,0,0.2)' : (isCompleted ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.04)');

        var npc = BOUNTY_NPCS[task.npcId];
        var avatarPath = npc && npc.avatar ? npc.avatar : 'images/default.png';

        html += '<div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:12px 16px;border:1px solid ' + borderColor + ';">';
        html += '  <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">';
        html += '    <div style="flex-shrink:0;width:40px;height:40px;border-radius:50%;overflow:hidden;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);">';
        html += '      <img src="' + avatarPath + '" alt="' + task.npcName + '" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display=\'none\'; this.parentElement.innerHTML=\'<span style=font-size:1.8rem;display:block;text-align:center;line-height:40px;>\' + task.npcIcon + \'</span>\';">';
        html += '    </div>';
        html += '    <div style="flex:1;min-width:100px;">';
        html += '      <div style="font-weight:bold;color:#ffefcf;font-size:0.85rem;">' + task.npcName + '</div>';
        html += '      <div style="font-size:0.55rem;color:rgba(255,255,255,0.2);">' + task.npcRegion + '</div>';
        html += '    </div>';
        html += '    <div style="flex:2;min-width:120px;">';
        html += '      <div style="display:flex;align-items:center;gap:6px;">';
        html += '        <span style="font-size:1.2rem;">' + task.icon + '</span>';
        html += '        <span style="font-size:0.8rem;color:rgba(255,255,255,0.7);">' + task.targetName + ' x ' + task.quantity + '</span>';
        html += '      </div>';
        html += '      <div style="display:flex;gap:8px;font-size:0.55rem;color:rgba(255,255,255,0.2);margin-top:2px;">';
        html += '        <span>' + difficultyLabel + '</span>';
        html += '        <span>|</span>';
        html += '        <span>⭐ +' + task.rewardRep + ' 声望</span>';
        html += '        <span>⚓ +' + task.rewardCoins + '</span>';
        html += '        <span>💧 +1 露珠</span>';
        html += '      </div>';
        html += '    </div>';
        html += '    <div style="flex:1;min-width:80px;">';
        html += '      <div style="display:flex;align-items:center;gap:6px;">';
        html += '        <div style="width:100%;height:4px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;">';
        html += '          <div style="width:' + progressPercent + '%;height:100%;background:' + (isCompleted ? '#2ecc71' : (isActive ? '#ffd700' : 'rgba(255,255,255,0.1)')) + ';border-radius:4px;transition:width 0.3s;"></div>';
        html += '        </div>';
        html += '        <span style="font-size:0.55rem;color:rgba(255,255,255,0.3);white-space:nowrap;min-width:32px;">' + (isCompleted ? '100%' : (isActive ? progressPercent + '%' : '0%')) + '</span>';
        html += '      </div>';
        html += '      <div style="font-size:0.5rem;color:rgba(255,255,255,0.15);margin-top:2px;">' + statusLabel + '</div>';
        html += '    </div>';
        html += '    <div style="display:flex;gap:4px;flex-shrink:0;flex-wrap:wrap;">';

        if (isAvailable) {
            var canAccept = (activeTaskId === null || activeTaskId === task.id);
            html += '      <button onclick="window.acceptBounty(\'' + task.id + '\')" style="background:#6f9e3f;border:none;border-radius:30px;padding:4px 14px;color:white;font-weight:bold;cursor:pointer;font-size:0.65rem;' + (canAccept ? '' : 'opacity:0.4;cursor:not-allowed;') + '">接取</button>';
        }

        if (isActive) {
            if (isProgressFull) {
                html += '      <button onclick="window.submitBounty(\'' + task.id + '\')" style="background:#ffd700;border:none;border-radius:30px;padding:4px 14px;color:#1a1a2e;font-weight:bold;cursor:pointer;font-size:0.65rem;">提交</button>';
            } else {
                html += '      <button onclick="window.refreshBountyProgress(\'' + task.id + '\')" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);border-radius:30px;padding:4px 14px;color:rgba(255,255,255,0.2);cursor:pointer;font-size:0.55rem;">🔄 ' + task.currentProgress + '/' + task.quantity + '</button>';
            }
            html += '      <button onclick="window.abandonBounty(\'' + task.id + '\')" style="background:rgba(255,50,50,0.1);border:1px solid rgba(255,50,50,0.1);border-radius:30px;padding:4px 14px;color:rgba(255,100,100,0.5);font-weight:bold;cursor:pointer;font-size:0.55rem;">放弃</button>';
        }

        if (isCompleted) {
            html += '      <button style="background:rgba(46,204,113,0.1);border:1px solid rgba(46,204,113,0.1);border-radius:30px;padding:4px 14px;color:rgba(46,204,113,0.3);font-size:0.55rem;cursor:default;">✅ 已领</button>';
        }

        html += '    </div>';
        html += '  </div>';
        html += '</div>';
    }

    html += '</div></div>';

    html += '<div id="bountyStatus" style="font-size:0.7rem;color:rgba(255,255,255,0.3);text-align:center;min-height:20px;padding:4px 0;border-top:1px solid rgba(255,255,255,0.02);margin-top:4px;"></div>';

    html += '<div style="font-size:0.5rem;color:rgba(255,255,255,0.06);text-align:center;border-top:1px solid rgba(255,255,255,0.02);padding-top:6px;letter-spacing:0.5px;flex-shrink:0;">';
    html += '💡 每天凌晨4点刷新 · 一次只能接取一个悬赏 · 提交后获得声望和探险币 · 💧额外获得1滴星光露珠';
    html += '</div>';

    container.innerHTML = html;

    var closeBtn = document.getElementById('closeBountyBtn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            if (typeof window.closeBountyBoard === 'function') {
                window.closeBountyBoard();
            }
        };
    }
}

// ============================================================
// 刷新/初始化
// ============================================================
function refreshBounties() {
    if (typeof window.loadRegionStatus === 'function') {
        window.loadRegionStatus();
    }
    generateDailyBounties();
    renderBountyBoard();
}

function initBountySystem() {
    if (typeof window.loadRegionStatus === 'function') {
        window.loadRegionStatus();
    }

    loadBountyData();
    var today = getBountyTodayDateStr();
    if (bountyState.date !== today || bountyState.tasks.length === 0) {
        generateDailyBounties();
    }
    console.log('📋 悬赏板系统已加载，今日任务: ' + bountyState.tasks.length + ' 个');
}

// ============================================================
// 暴露全局接口
// ============================================================
window.BOUNTY_NPCS = BOUNTY_NPCS;
window.BOUNTY_REWARDS = BOUNTY_REWARDS;
window.bountyState = bountyState;

window.loadBountyData = loadBountyData;
window.saveBountyData = saveBountyData;
window.getBountyTodayDateStr = getBountyTodayDateStr;
window.getUnlockedNpcIds = getUnlockedNpcIds;
window.getAvailableTemplatesForUnlockedRegions = getAvailableTemplatesForUnlockedRegions;
window.generateDailyBounties = generateDailyBounties;
window.getPlayerItemCount = getPlayerItemCount;
window.deductPlayerItem = deductPlayerItem;
window.getPlayerItemDisplay = getPlayerItemDisplay;

window.acceptBounty = acceptBounty;
window.submitBounty = submitBounty;
window.abandonBounty = abandonBounty;
window.refreshBountyProgress = refreshBountyProgress;
window.renderBountyBoard = renderBountyBoard;
window.refreshBounties = refreshBounties;
window.initBountySystem = initBountySystem;

console.log('📋 悬赏板系统加载完成（任务类型多样化）');