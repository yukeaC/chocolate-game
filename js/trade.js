// ============================================================
// trade.js · 可颂大陆 · 交易系统（含成就统计）
// ============================================================
console.log('🏪 交易系统加载中...');

// ============================================================
// 价格配置
// ============================================================
var TRADE_PRICES = {
    sell: {
        clownfish: 1,
        tuna: 1,
        pearlfish: 3,
        bluewhale: 3,
        legendfish: 5,
        egg: 5,
        golden_egg: 8,
        iron_ore: 3,
        diamond: 8,
        dark_cuisine: 6,
// common → 9 探险币
        golden_feather: 9,
        wood_carving: 9,
        // rare → 19 探险币
        log_page: 19,
        ancient_compass: 19,
        golden_pocket_watch: 19,
        // epic → 29 探险币
        pearl_shell: 29,
        ancient_pot: 29,
        // legendary → 39 探险币
        pearl_crown: 39
    },
    buy: {
        pearlfish: 6,
        legendfish: 10,
        egg: 12,
        golden_ear: 5,
        ore_fuel: 6,
        rose_seed: 48,
        pickaxe: 5,
        firecracker: 8,
        dynamite: 10
    }
};

var ITEM_SOURCE_REGIONS = {
    clownfish: 'nocean',
    tuna: 'nocean',
    pearlfish: 'nocean',
    bluewhale: 'nocean',
    legendfish: 'nocean',
    egg: 'friedegg',
    golden_egg: 'friedegg',
    iron_ore: 'dumbpan',
    diamond: 'dumbpan',
    golden_ear: 'rice',
    ore_fuel: 'baxian',
    dark_cuisine: null,
    rose_seed: null,
    pickaxe: 'dumbpan',
    firecracker: 'dumbpan',
    dynamite: 'dumbpan'
};

var TRADE_ITEMS = {
    clownfish: { icon: '🐟', name: '小丑鱼', category: '普通鱼' },
    tuna: { icon: '🐠', name: '金枪鱼', category: '普通鱼' },
    pearlfish: { icon: '🐡', name: '珍珠鱼', category: '稀有鱼' },
    bluewhale: { icon: '🐋', name: '蓝鲸鱼', category: '稀有鱼' },
    legendfish: { icon: '🐉', name: '传说鱼', category: '传说鱼' },
    egg: { icon: '🥚', name: '鸡蛋', category: '特殊' },
    golden_egg: { icon: '🥚', name: '金蛋', category: '特殊' },
    iron_ore: { icon: '🪨', name: '铁矿', category: '矿石' },
    diamond: { icon: '💎', name: '钻石', category: '矿石' },
    golden_ear: { icon: '🌾', name: '金色稻穗', category: '特殊' },
    ore_fuel: { icon: '⛽', name: '燃料', category: '材料' },
    dark_cuisine: { icon: '💀', name: '黑暗料理', category: '食物' },
    rose_seed: { icon: '🌱', name: '玫瑰种子', category: '种子' },
    pickaxe: { icon: '⛏️', name: '镐头', category: '工具' },
    firecracker: { icon: '🧨', name: '鞭炮', category: '工具' },
    dynamite: { icon: '💣', name: '炸药', category: '工具' },
golden_feather: { icon: '🪶', name: '金色羽毛', category: '收藏品' },
    wood_carving: { icon: '🪵', name: '沉船的木雕', category: '收藏品' },
    log_page: { icon: '📜', name: '航海日志残页', category: '收藏品' },
    ancient_compass: { icon: '🧭', name: '古老罗盘', category: '收藏品' },
    golden_pocket_watch: { icon: '⌚', name: '金制怀表', category: '收藏品' },
    pearl_shell: { icon: '🐚', name: '珍珠贝壳', category: '收藏品' },
    ancient_pot: { icon: '🏺', name: '古代陶罐', category: '收藏品' },
    pearl_crown: { icon: '👑', name: '珍珠王冠', category: '收藏品' }
};

// ===== 新增：交易总次数统计（成就用） =====
var tradeTotalCount = 0;
// 从 localStorage 恢复
try {
    var saved = localStorage.getItem('trade_total_count');
    if (saved) tradeTotalCount = parseInt(saved) || 0;
    window.tradeTotalCount = tradeTotalCount;
} catch(e) {}

function saveTradeTotalCount() {
    localStorage.setItem('trade_total_count', String(tradeTotalCount));
    window.tradeTotalCount = tradeTotalCount;
}

// ============================================================
// 区域解锁检查
// ============================================================
function isRegionUnlocked(regionId) {
    if (!regionId) return true;
    if (typeof window.getRegion === 'function') {
        var region = window.getRegion(regionId);
        return region && region.status !== 'locked';
    }
    try {
        var statusMap = JSON.parse(localStorage.getItem('explore_region_status') || '{}');
        return statusMap[regionId] && statusMap[regionId] !== 'locked';
    } catch(e) { return false; }
}

function isItemTradeable(itemKey, isBuy) {
    var region = ITEM_SOURCE_REGIONS[itemKey];
    if (!region) return true;
    return isRegionUnlocked(region);
}

function hasVisitedDumbpan() {
    try {
        var visited = JSON.parse(localStorage.getItem('explore_visited') || '[]');
        if (visited.indexOf('dumbpan') === -1) return false;
        var progress = JSON.parse(localStorage.getItem('story_progress') || '{}');
        if (progress.dumbpan !== true) return false;
        return true;
    } catch(e) { return false; }
}

// ============================================================
// 背包操作
// ============================================================
function getTradeBackpack() {
    try { var saved = localStorage.getItem('explore_backpack'); return saved ? JSON.parse(saved) : {}; } catch(e) { return {}; }
}
function saveTradeBackpack(backpack) { localStorage.setItem('explore_backpack', JSON.stringify(backpack)); }
function getTradeItemCount(itemKey) { var backpack = getTradeBackpack(); return backpack[itemKey] || 0; }
function addTradeItem(itemKey, amount) {
    var backpack = getTradeBackpack();
    backpack[itemKey] = (backpack[itemKey] || 0) + amount;
    saveTradeBackpack(backpack);
    return backpack[itemKey];
}
function removeTradeItem(itemKey, amount) {
    var backpack = getTradeBackpack();
    var current = backpack[itemKey] || 0;
    if (current < amount) return false;
    backpack[itemKey] = current - amount;
    if (backpack[itemKey] <= 0) delete backpack[itemKey];
    saveTradeBackpack(backpack);
    return true;
}

// ============================================================
// 探险币操作
// ============================================================
function getTradeCoins() {
    try { var saved = localStorage.getItem('explore_coins'); return saved ? parseInt(saved) || 0 : 0; } catch(e) { return 0; }
}
function saveTradeCoins(amount) {
    localStorage.setItem('explore_coins', String(amount));
    if (typeof window.updateExploreCoinsDisplay === 'function') {
        window.updateExploreCoinsDisplay();
    }
}
function addTradeCoins(amount) {
    var current = getTradeCoins();
    var newTotal = current + amount;
    saveTradeCoins(newTotal);
    return newTotal;
}
function spendTradeCoins(amount) {
    var current = getTradeCoins();
    if (current < amount) return false;
    saveTradeCoins(current - amount);
    return true;
}

// ============================================================
// 主游戏金币操作
// ============================================================
function getMainGold() {
    try {
        var saved = localStorage.getItem('chocolate_save');
        if (saved) { var data = JSON.parse(saved); return data.gold || 0; }
    } catch(e) {}
    return 0;
}
function saveMainGold(amount) {
    try {
        var saved = localStorage.getItem('chocolate_save');
        var data = saved ? JSON.parse(saved) : {};
        data.gold = amount;
        localStorage.setItem('chocolate_save', JSON.stringify(data));
    } catch(e) {}
}
function spendMainGold(amount) {
    var current = getMainGold();
    if (current < amount) return false;
    saveMainGold(current - amount);
    return true;
}

// ============================================================
// 获取挖矿工具数量
// ============================================================
function getMiningTools() {
    try {
        var saved = localStorage.getItem('mining_tools');
        return saved ? JSON.parse(saved) : { pickaxe: 0, firecracker: 0, dynamite: 0 };
    } catch(e) { return { pickaxe: 0, firecracker: 0, dynamite: 0 }; }
}
function addMiningTool(toolType, amount) {
    var tools = getMiningTools();
    tools[toolType] = (tools[toolType] || 0) + amount;
    localStorage.setItem('mining_tools', JSON.stringify(tools));
    if (typeof window.mining !== 'undefined' && window.mining.addTool) {
        window.mining.addTool(toolType, amount);
    }
}

// ============================================================
// 交易核心功能
// ============================================================
function sellItem(itemKey, amount) {
    var price = TRADE_PRICES.sell[itemKey];
    if (!price) return { success: false, msg: '该物品不支持出售' };

    // ★★★ 检查是否为收藏品 ★★★
    var isCollectible = false;
    var collectibleId = null;
    if (window.TREASURE_COLLECTIBLES) {
        for (var i = 0; i < window.TREASURE_COLLECTIBLES.length; i++) {
            if (window.TREASURE_COLLECTIBLES[i].id === itemKey) {
                isCollectible = true;
                collectibleId = itemKey;
                break;
            }
        }
    }

    // ============================================================
    // 收藏品出售逻辑
    // ============================================================
    if (isCollectible) {
        // 从 treasure_collected 中移除指定数量
        var collected = JSON.parse(localStorage.getItem('treasure_collected') || '[]');
        var removed = 0;
        for (var i = collected.length - 1; i >= 0 && removed < amount; i--) {
            if (collected[i] === collectibleId) {
                collected.splice(i, 1);
                removed++;
            }
        }
        if (removed === 0) {
            return { success: false, msg: '你没有这件收藏品' };
        }
        localStorage.setItem('treasure_collected', JSON.stringify(collected));

        var totalCoins = price * removed;
        addTradeCoins(totalCoins);
        tradeTotalCount += removed;
        saveTradeTotalCount();

        // 刷新背包（如果打开）
        if (typeof window.renderBackpack === 'function') {
            var modal = document.getElementById('backpackModal');
            if (modal && !modal.classList.contains('hidden')) {
                window.renderBackpack();
            }
        }

        if (typeof onTowerTraded === 'function') onTowerTraded();
        if (typeof soundTrade === 'function') soundTrade();
        if (typeof soundCoin === 'function') soundCoin();

        var itemName = TRADE_ITEMS[itemKey] ? TRADE_ITEMS[itemKey].name : itemKey;
        return {
            success: true,
            msg: '出售收藏品 ' + itemName + ' ×' + removed + '，获得 ' + totalCoins + ' 探险币',
            coins: totalCoins,
            item: itemKey,
            amount: removed
        };
    }

    // ============================================================
    // 普通物品出售逻辑
    // ============================================================
    if (!isItemTradeable(itemKey, false)) {
        var region = ITEM_SOURCE_REGIONS[itemKey];
        var regionName = getRegionName(region);
        return { success: false, msg: '🔒 需要先解锁「' + regionName + '」才能出售此物品' };
    }

    var current = getTradeItemCount(itemKey);
    if (current < amount) {
        return { success: false, msg: '背包中该物品不足，当前有 ' + current + ' 个' };
    }

    if (!removeTradeItem(itemKey, amount)) {
        return { success: false, msg: '移除物品失败' };
    }

    var totalCoins = price * amount;
    addTradeCoins(totalCoins);
    tradeTotalCount += amount;
    saveTradeTotalCount();

    if (typeof onTowerTraded === 'function') onTowerTraded();
    if (typeof soundTrade === 'function') soundTrade();
    if (typeof soundCoin === 'function') soundCoin();

    var itemName = TRADE_ITEMS[itemKey] ? TRADE_ITEMS[itemKey].name : itemKey;
    return {
        success: true,
        msg: '出售 ' + itemName + ' ×' + amount + '，获得 ' + totalCoins + ' 探险币',
        coins: totalCoins,
        item: itemKey,
        amount: amount
    };
}


function buyItem(itemKey, amount) {
    var price = TRADE_PRICES.buy[itemKey];
    if (!price) return { success: false, msg: '该物品不支持购买' };

    if (!isItemTradeable(itemKey, true)) {
        var region = ITEM_SOURCE_REGIONS[itemKey];
        var regionName = getRegionName(region);
        return { success: false, msg: '🔒 需要先解锁「' + regionName + '」才能购买此物品' };
    }

    if (itemKey === 'pickaxe' || itemKey === 'firecracker' || itemKey === 'dynamite') {
        if (!hasVisitedDumbpan()) {
            return { success: false, msg: '🔒 需要先解锁沙锅洲并完成对话，才能购买挖矿工具！' };
        }
    }

    var totalCost = price * amount;
    var currentCoins = getTradeCoins();
    if (currentCoins < totalCost) {
        return { success: false, msg: '探险币不足！需要 ' + totalCost + ' 探险币，当前有 ' + currentCoins + ' 探险币' };
    }

    if (!spendTradeCoins(totalCost)) {
        return { success: false, msg: '扣费失败' };
    }
    // ===== 添加音效 =====
    if (typeof soundTrade === 'function') soundTrade();
    if (typeof soundCoin === 'function') soundCoin();
    // ===== 音效添加结束 =====

    var itemName = TRADE_ITEMS[itemKey] ? TRADE_ITEMS[itemKey].name : itemKey;

    if (itemKey === 'pickaxe' || itemKey === 'firecracker' || itemKey === 'dynamite') {
        addMiningTool(itemKey, amount);
        // ===== 新增：交易次数累加 =====
        tradeTotalCount += amount;
        saveTradeTotalCount();
    // ===== 挑战塔：交易成功（购买） =====
    if (typeof onTowerTraded === 'function') onTowerTraded();
    // ===== 挑战塔结束 =====
        return {
            success: true,
            msg: '购买 ' + itemName + ' ×' + amount + '，消耗 ' + totalCost + ' 探险币（已存入挖矿工具）',
            coins: totalCost,
            item: itemKey,
            amount: amount
        };
    }

    addTradeItem(itemKey, amount);
    // ===== 新增：交易次数累加 =====
    tradeTotalCount += amount;
    saveTradeTotalCount();

    return {
        success: true,
        msg: '购买 ' + itemName + ' ×' + amount + '，消耗 ' + totalCost + ' 探险币',
        coins: totalCost,
        item: itemKey,
        amount: amount
    };
}

function exchangeGoldToCoins(amount) {
    var goldNeeded = amount * 50;
    var currentGold = getMainGold();

    if (currentGold < goldNeeded) {
        return { success: false, msg: '金币不足！需要 ' + goldNeeded + ' 金币，当前有 ' + currentGold + ' 金币' };
    }

    if (!spendMainGold(goldNeeded)) {
        return { success: false, msg: '扣除金币失败' };
    }

    addTradeCoins(amount);

    // ===== 新增：交易次数累加（兑换也算一次交易） =====
    tradeTotalCount += amount;
    saveTradeTotalCount();

    return {
        success: true,
        msg: '兑换成功！消耗 ' + goldNeeded + ' 金币，获得 ' + amount + ' 探险币',
        goldSpent: goldNeeded,
        coinsGained: amount
    };
}

function getRegionName(regionId) {
    var map = {
        'welcome': '欢迎米来湾',
        'nocean': '可以就这洋',
        'nomo_peninsula': '嫑锅半岛',
        'friedegg': '煎蛋海',
        'croissant': '可颂大陆',
        'dumbpan': '沙锅洲',
        'baxian': '八仙锅海',
        'rice': '大米洲',
        'panini': '帕尼尼大陆',
        'nomo_ocean': '嫑界洋'
    };
    return map[regionId] || regionId;
}

function getTradeInventory() {
    var backpack = getTradeBackpack();
    var collected = window.getCollectedCollectibles ? window.getCollectedCollectibles() : [];
    var result = [];
    var canBuyTools = hasVisitedDumbpan();

    // ★★★ 先添加收藏品（可出售） ★★★
    if (collected.length > 0 && typeof window.TREASURE_COLLECTIBLES !== 'undefined') {
        // 统计每种收藏品的数量
        var collectibleCounts = {};
        collected.forEach(function(id) {
            collectibleCounts[id] = (collectibleCounts[id] || 0) + 1;
        });

        window.TREASURE_COLLECTIBLES.forEach(function(c) {
            var count = collectibleCounts[c.id] || 0;
            if (count > 0) {
                var sellPrice = TRADE_PRICES.sell[c.id] || 0;
                if (sellPrice > 0) {
                    result.push({
                        key: c.id,
                        icon: c.icon,
                        name: c.name,
                        category: '收藏品',
                        count: count,  // ★★★ 显示实际库存 ★★★
                        sellPrice: sellPrice,
                        buyPrice: 0,
                        isSellable: true,
                        isBuyable: false,
                        isCollectible: true
                    });
                }
            }
        });
    }

    // ★★★ 原有物品逻辑 ★★★
    for (var key in TRADE_ITEMS) {
        // 跳过收藏品（已在上方处理）
        if (result.some(function(r) { return r.key === key; })) continue;
        
        var count = backpack[key] || 0;
        var buyPrice = TRADE_PRICES.buy[key] || 0;
        var sellPrice = TRADE_PRICES.sell[key] || 0;
        var isSellable = (sellPrice > 0);
        var isBuyable = buyPrice > 0;

        if (isSellable && !isItemTradeable(key, false)) {
            isSellable = false;
        }
        if (isBuyable && !isItemTradeable(key, true)) {
            isBuyable = false;
        }

        var isTool = (key === 'pickaxe' || key === 'firecracker' || key === 'dynamite');
        if (isTool && !canBuyTools) {
            isBuyable = false;
        }

        if ((count > 0 && isSellable) || isBuyable) {
            result.push({
                key: key,
                icon: TRADE_ITEMS[key].icon,
                name: TRADE_ITEMS[key].name,
                category: TRADE_ITEMS[key].category,
                count: count,
                sellPrice: sellPrice,
                buyPrice: buyPrice,
                isSellable: isSellable,
                isBuyable: isBuyable,
                isCollectible: false
            });
        }
    }
    return result;
}

// ============================================================
// 交易UI渲染（略，保持原样）
// ============================================================
var tradeState = {
    activeTab: 'sell',
    quantities: {},
    isOpen: false,
    exchangeAmount: 1,
    exchangeInput: '1'
};

function renderTradeUI() {
    var container = document.getElementById('tradeContainer');
    if (!container) return;

    var coins = getTradeCoins();
    var inventory = getTradeInventory();
    var mainGold = getMainGold();

    var sellItems = inventory.filter(function(item) { return item.count > 0 && item.isSellable; });
    var buyItems = inventory.filter(function(item) { return item.isBuyable; });

    var activeItems = tradeState.activeTab === 'sell' ? sellItems : buyItems;
    var priceLabel = tradeState.activeTab === 'sell' ? '出售价' : '购买价';
    var priceKey = tradeState.activeTab === 'sell' ? 'sellPrice' : 'buyPrice';
    var isSellTab = (tradeState.activeTab === 'sell');

    var itemsHTML = '';
    if (activeItems.length === 0) {
        var emptyMsg = isSellTab ? '背包中没有可出售的物品' : '暂无商品可购买';
        itemsHTML = '<div style="text-align:center;padding:30px 0;color:rgba(255,255,255,0.3);font-size:0.8rem;">' + emptyMsg + '</div>';
    } else {
        activeItems.forEach(function(item) {
            var qty = tradeState.quantities[item.key] || 0;
            var maxQty = isSellTab ? item.count : 99;
            var price = item[priceKey];

            itemsHTML += `
                <div class="trade-item" data-item="${item.key}">
                    <div class="trade-item-icon">${item.icon}</div>
                    <div class="trade-item-info">
                        <div class="trade-item-name">${item.name}</div>
                        <div class="trade-item-detail">${item.category} · ${priceLabel} ${price}⚓</div>
                        <div class="trade-item-stock">${isSellTab ? '库存 ' + item.count : ''}</div>
                    </div>
                    <div class="trade-item-controls">
                        <div class="trade-qty-control">
                            <button class="trade-qty-btn" data-item="${item.key}" data-delta="-1">−</button>
                            <span class="trade-qty-value" data-item="${item.key}">${qty}</span>
                            <button class="trade-qty-btn" data-item="${item.key}" data-delta="1">+</button>
                        </div>
                        <button class="trade-action-btn" data-item="${item.key}">
                            ${isSellTab ? '出售' : '购买'}
                        </button>
                    </div>
                </div>
            `;
        });
    }

    container.innerHTML = `
        <div class="trade-container">
            <div class="trade-header">
                <div class="trade-title">
                    <span class="trade-icon">🏪</span>
                    可颂商店
                </div>
                <div class="trade-coins">
                    ⚓ <span id="tradeCoinsDisplay">${coins}</span>
                </div>
                <button class="trade-close-btn" onclick="closeTrade()">✕ 关闭</button>
            </div>

            <div class="trade-exchange">
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:center;">
                    <span style="font-size:0.65rem;color:rgba(255,255,255,0.4);">🪙 金币 → ⚓</span>
                    <div style="display:flex;align-items:center;gap:3px;background:rgba(0,0,0,0.2);border-radius:30px;padding:2px 6px;">
                        <button class="trade-exchange-btn" onclick="tradeExchangeChange(-1)">−</button>
                        <input type="number" id="tradeExchangeInput" value="${tradeState.exchangeInput}" 
                               style="width:50px;background:transparent;border:none;color:#ffd700;text-align:center;font-weight:700;font-size:14px;outline:none;padding:2px 0;"
                               onchange="tradeExchangeInputChange(this.value)" onfocus="this.select()">
                        <button class="trade-exchange-btn" onclick="tradeExchangeChange(1)">+</button>
                    </div>
                    <span style="font-size:0.55rem;color:rgba(255,255,255,0.2);">(50金币/个)</span>
                    <button class="trade-exchange-exec" onclick="tradeExecuteExchange()">
                        ⚡ 兑换
                    </button>
                </div>
                <div style="font-size:0.5rem;color:rgba(255,255,255,0.15);text-align:center;" id="tradeMainGoldDisplay">
                    当前金币: ${mainGold}
                </div>
            </div>

            <div class="trade-tabs">
                <button class="trade-tab ${tradeState.activeTab === 'sell' ? 'active' : ''}" onclick="tradeSwitchTab('sell')">
                    📤 出售
                </button>
                <button class="trade-tab ${tradeState.activeTab === 'buy' ? 'active' : ''}" onclick="tradeSwitchTab('buy')">
                    📥 购买
                </button>
            </div>

            <div class="trade-list" id="tradeList">
                ${itemsHTML}
            </div>

            <div class="trade-message" id="tradeMessage">💡 选择物品进行交易</div>
        </div>
    `;

    var list = document.getElementById('tradeList');
    if (list) {
        list.querySelectorAll('.trade-qty-btn').forEach(function(btn) {
            btn.onclick = function(e) {
                e.stopPropagation();
                var itemKey = this.dataset.item;
                var delta = parseInt(this.dataset.delta);
                tradeChangeQty(itemKey, delta);
            };
        });
        list.querySelectorAll('.trade-action-btn').forEach(function(btn) {
            btn.onclick = function(e) {
                e.stopPropagation();
                var itemKey = this.dataset.item;
                tradeExecute(itemKey);
            };
        });
    }

    updateTradeStats();
}

function updateTradeStats() {
    var coins = getTradeCoins();
    var coinEl = document.getElementById('tradeCoinsDisplay');
    if (coinEl) coinEl.textContent = coins;

    var goldEl = document.getElementById('tradeMainGoldDisplay');
    if (goldEl) {
        var mainGold = getMainGold();
        goldEl.textContent = '当前金币: ' + mainGold;
    }
}

function tradeSwitchTab(tab) {
    tradeState.activeTab = tab;
    tradeState.quantities = {};
    renderTradeUI();
}

function tradeChangeQty(itemKey, delta) {
    if (!tradeState.quantities[itemKey]) tradeState.quantities[itemKey] = 0;
    var newQty = tradeState.quantities[itemKey] + delta;
    if (newQty < 0) newQty = 0;

    var inventory = getTradeInventory();
    var item = inventory.find(function(i) { return i.key === itemKey; });
    if (item) {
        var maxQty = tradeState.activeTab === 'sell' ? item.count : 99;
        if (newQty > maxQty) newQty = maxQty;
    }
    tradeState.quantities[itemKey] = newQty;

    var qtyEl = document.querySelector('.trade-qty-value[data-item="' + itemKey + '"]');
    if (qtyEl) {
        qtyEl.textContent = newQty;
    }
}

function tradeExecute(itemKey) {
    var qty = tradeState.quantities[itemKey] || 0;
    if (qty <= 0) {
        showTradeMessage('请选择数量', 'info');
        return;
    }

    var result = tradeState.activeTab === 'sell' ? sellItem(itemKey, qty) : buyItem(itemKey, qty);

    if (result.success) {
        showTradeMessage('✅ ' + result.msg, 'success');
        tradeState.quantities[itemKey] = 0;
        var qtyEl = document.querySelector('.trade-qty-value[data-item="' + itemKey + '"]');
        if (qtyEl) qtyEl.textContent = '0';
        updateTradeStats();
        renderTradeUI();
        if (typeof window.renderBackpack === 'function') {
            var modal = document.getElementById('backpackModal');
            if (modal && !modal.classList.contains('hidden')) {
                window.renderBackpack();
            }
        }
        if (typeof window.updateInfoPanel === 'function') {
            window.updateInfoPanel();
        }
    } else {
        showTradeMessage('❌ ' + result.msg, 'error');
    }
}

function tradeExchangeChange(delta) {
    var input = document.getElementById('tradeExchangeInput');
    if (!input) return;
    var val = parseInt(input.value) || 1;
    var newVal = val + delta;
    if (newVal < 1) newVal = 1;
    input.value = newVal;
    tradeState.exchangeInput = String(newVal);
    tradeState.exchangeAmount = newVal;
}

function tradeExchangeInputChange(value) {
    var val = parseInt(value) || 1;
    if (val < 1) val = 1;
    var input = document.getElementById('tradeExchangeInput');
    if (input) input.value = val;
    tradeState.exchangeInput = String(val);
    tradeState.exchangeAmount = val;
}

function tradeExecuteExchange() {
    var input = document.getElementById('tradeExchangeInput');
    if (!input) return;
    var amount = parseInt(input.value) || 1;
    if (amount < 1) amount = 1;

    var result = exchangeGoldToCoins(amount);
    if (result.success) {
        showTradeMessage('✅ ' + result.msg, 'success');
        input.value = '1';
        tradeState.exchangeInput = '1';
        tradeState.exchangeAmount = 1;
        updateTradeStats();
        if (typeof window.refreshUI === 'function') {
            window.refreshUI();
        }
        if (typeof window.updateExploreCoinsDisplay === 'function') {
            window.updateExploreCoinsDisplay();
        }
    } else {
        showTradeMessage('❌ ' + result.msg, 'error');
    }
}

function showTradeMessage(msg, type) {
    var el = document.getElementById('tradeMessage');
    if (!el) return;
    el.textContent = msg;
    el.className = 'trade-message';
    if (type === 'success') el.classList.add('trade-msg-success');
    else if (type === 'error') el.classList.add('trade-msg-error');
    else if (type === 'info') el.classList.add('trade-msg-info');
}

// ============================================================
// 打开/关闭交易
// ============================================================
function openTrade() {
    var container = document.getElementById('tradeContainer');
    if (!container) {
        var panel = document.getElementById('infoPanel');
        var mode = document.createElement('div');
        mode.id = 'tradeContainer';
        mode.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;background:linear-gradient(145deg,#1a2a3a,#0d1b2a);border-radius:16px;z-index:4;padding:12px 16px;overflow-y:auto;border:2px solid #c98f5e;box-shadow:inset 0 0 60px rgba(0,0,0,0.6);';
        panel.appendChild(mode);
        container = mode;
    }

    container.style.display = 'block';
    tradeState.isOpen = true;
    tradeState.quantities = {};
    tradeState.activeTab = 'sell';
    tradeState.exchangeAmount = 1;
    tradeState.exchangeInput = '1';

    var infoMode = document.getElementById('infoMode');
    if (infoMode) infoMode.style.display = 'none';

    renderTradeUI();
}

function closeTrade() {
    var container = document.getElementById('tradeContainer');
    if (container) container.style.display = 'none';
    tradeState.isOpen = false;
    var infoMode = document.getElementById('infoMode');
    if (infoMode) infoMode.style.display = 'flex';
    if (typeof window.updateInfoPanel === 'function') {
        window.updateInfoPanel();
    }
}

// ============================================================
// 暴露全局接口
// ============================================================
window.trade = {
    open: openTrade,
    close: closeTrade,
    sell: sellItem,
    buy: buyItem,
    exchange: exchangeGoldToCoins,
    getCoins: getTradeCoins,
    getInventory: getTradeInventory
};

window.openTrade = openTrade;
window.closeTrade = closeTrade;
window.tradeSwitchTab = tradeSwitchTab;
window.tradeChangeQty = tradeChangeQty;
window.tradeExecute = tradeExecute;
window.tradeExchangeChange = tradeExchangeChange;
window.tradeExchangeInputChange = tradeExchangeInputChange;
window.tradeExecuteExchange = tradeExecuteExchange;
window.renderTradeUI = renderTradeUI;

// ===== 新增：暴露交易次数统计 =====
window.tradeTotalCount = tradeTotalCount;

console.log('🏪 交易系统已重新配置（含成就统计）');