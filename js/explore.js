// ============================================================
// explore.js · 可可世界探险地图核心逻辑（完整版）
// ============================================================

// 引用全局 FISH_TYPES（由 fishing.js 提供）
var FISH_TYPES = window.FISH_TYPES || {};

// 背包标签（用于分页）
var backpackTab = 'items';

var MAP_W = 2910;
var MAP_H = 1280;

function toPercent(px, py) {
    return { x: (px / MAP_W) * 100, y: (py / MAP_H) * 100 };
}

var regions = [
    { id: 'welcome', name: '欢迎米来湾', icon: '🌊', px: 1699, py: 930, status: 'current', desc: '初始区域', unlockLevel: 1 },
    { id: 'nocean', name: '可以就这洋', icon: '🌊', px: 333, py: 83, status: 'locked', desc: '🎣 钓鱼小游戏', unlockLevel: 5 },
    { id: 'nomo_peninsula', name: '嫑锅半岛', icon: '🐧', px: 1875, py: 517, status: 'locked', desc: '🏝️ 半岛探险 · 小王子', unlockLevel: 8 },
    { id: 'friedegg', name: '煎蛋海', icon: '🍳', px: 1776, py: 70, status: 'locked', desc: '🍳 煎蛋海域 · 数独挑战', unlockLevel: 10 },
    { id: 'croissant', name: '可颂大陆', icon: '🥐', px: 1143, py: 302, status: 'locked', desc: '🏪 商业中心 · 交易', unlockLevel: 13 },
    { id: 'dumbpan', name: '沙锅洲', icon: '🍲', px: 891, py: 1073, status: 'locked', desc: '⛏️ 挖矿区', unlockLevel: 16 },
    { id: 'baxian', name: '八仙锅海', icon: '🧂', px: 712, py: 695, status: 'locked', desc: '🧂 粉碎机', unlockLevel: 22 },
    { id: 'rice', name: '大米洲', icon: '🍚', px: 2145, py: 991, status: 'locked', desc: '🏭 能量生产', unlockLevel: 20 },
    { id: 'panini', name: '帕尼尼大陆', icon: '🥪', px: 2419, py: 237, status: 'locked', desc: '🍳 美食实验室 · 自由烹饪', unlockLevel: 25 },
    { id: 'nomo_ocean', name: '嫑界洋', icon: '🐧', px: 2558, py: 944, status: 'locked', desc: '🌊 终极海域 · 赛博巨兽', unlockLevel: 28 }
];

var visitedRegions = [];

function saveRegionStatus() {
    var statusMap = {};
    for (var i = 0; i < regions.length; i++) {
        statusMap[regions[i].id] = regions[i].status;
    }
    try {
        localStorage.setItem('explore_region_status', JSON.stringify(statusMap));
        localStorage.setItem('explore_visited', JSON.stringify(visitedRegions));
    } catch(e) {}
}

function loadRegionStatus() {
    try {
        var saved = localStorage.getItem('explore_region_status');
        if (saved) {
            var statusMap = JSON.parse(saved);
            for (var i = 0; i < regions.length; i++) {
                if (statusMap[regions[i].id]) {
                    regions[i].status = statusMap[regions[i].id];
                }
            }
        }
        var visited = localStorage.getItem('explore_visited');
        if (visited) {
            visitedRegions = JSON.parse(visited);
        }
    } catch(e) {}
}

var selectedRegionId = 'welcome';
var isTraveling = false;
var playerLevel = 1;

var mapOverlay = document.getElementById('mapOverlay');
var shipMarker = document.getElementById('shipMarker');
var infoText = document.getElementById('infoText');
var statusBadge = document.getElementById('statusBadge');
var actionButtons = document.getElementById('actionButtons');
var toastMsg = document.getElementById('toastMsg');
var travelProgress = document.getElementById('travelProgress');
var travelBar = document.getElementById('travelBar');
var travelText = document.getElementById('travelText');
var regionCountEl = document.getElementById('regionCount');
var playerLevelDisplay = document.getElementById('playerLevelDisplay');
var exploreCoinDisplay = document.getElementById('exploreCoinDisplay');

function getExploreCoins() {
    try {
        var saved = localStorage.getItem('explore_coins');
        return saved ? parseInt(saved) || 0 : 0;
    } catch(e) { return 0; }
}

function updateExploreCoinsDisplay() {
    if (exploreCoinDisplay) {
        var coins = getExploreCoins();
        exploreCoinDisplay.textContent = coins;
    }
}

function showToast(msg, duration) {
    duration = duration || 2000;
    toastMsg.textContent = msg;
    toastMsg.classList.add('show');
    clearTimeout(toastMsg._timer);
    toastMsg._timer = setTimeout(function() { toastMsg.classList.remove('show'); }, duration);
}

function getRegion(id) {
    for (var i = 0; i < regions.length; i++) {
        if (regions[i].id === id) return regions[i];
    }
    return null;
}

function getCurrentRegion() {
    for (var i = 0; i < regions.length; i++) {
        if (regions[i].status === 'current') return regions[i];
    }
    return regions[0];
}

function getUnlockedCount() {
    var count = 0;
    for (var i = 0; i < regions.length; i++) {
        if (regions[i].status !== 'locked') count++;
    }
    return count;
}

function canUnlockRegion(region) {
    if (!region) return false;
    if (region.status !== 'locked') return false;
    return playerLevel >= region.unlockLevel;
}

function tryUnlockRegion(region) {
    if (!region) return false;
    if (region.status !== 'locked') return false;
    if (!canUnlockRegion(region)) {
        showToast('🔒 需要达到 Lv.' + region.unlockLevel + ' 才能解锁 ' + region.name, 2500);
        return false;
    }
    region.status = 'unlocked';
    saveRegionStatus();
    showToast('🔓 解锁成功！' + region.icon + ' ' + region.name + ' 已开放！', 2000);
    renderMarkers();
    updateInfoPanel();
    return true;
}

function syncPlayerLevel() {
    try {
        var saveData = localStorage.getItem('chocolate_save');
        if (saveData) {
            var data = JSON.parse(saveData);
            if (data && data.level) {
                playerLevel = data.level;
                if (playerLevelDisplay) playerLevelDisplay.textContent = playerLevel;
                return;
            }
        }
        if (typeof level !== 'undefined') {
            playerLevel = level;
            if (playerLevelDisplay) playerLevelDisplay.textContent = playerLevel;
            return;
        }
        playerLevel = 1;
        if (playerLevelDisplay) playerLevelDisplay.textContent = '1';
    } catch(e) {
        console.warn('同步玩家等级失败:', e);
        playerLevel = 1;
    }
}

function updateShipPosition() {
    var current = getCurrentRegion();
    if (!current) return;
    var pos = toPercent(current.px, current.py);
    shipMarker.style.left = pos.x + '%';
    shipMarker.style.top = pos.y + '%';
}

function handleFirstArrival(regionId) {
    if (visitedRegions.indexOf(regionId) !== -1) return;
    visitedRegions.push(regionId);
    saveRegionStatus();
    if (typeof soundDiscover === 'function') soundDiscover();
    if (typeof onFirstArrival === 'function') {
        onFirstArrival(regionId);
    }
    if (regionId === 'welcome' && typeof onVisitWelcomeBay === 'function') {
        onVisitWelcomeBay();
    }
    var story = window.STORY_DATA && window.STORY_DATA[regionId];
    if (story && !story.completed) {
        setTimeout(function() {
            if (typeof checkAndPlayStory === 'function') {
                checkAndPlayStory(regionId);
            }
        }, 600);
    }
    showToast('🗺️ 首次到达 ' + getRegion(regionId).name + '！', 2500);
}

// ============================================================
// 藏宝图标记
// ============================================================
var treasureMarker = null;

function updateTreasureMarker() {
    removeTreasureMarker();
    if (typeof treasureState === 'undefined') return;
    if (!treasureState.hasCompleteMap) return;
    var pos = toPercent(treasureState.treasurePosX, treasureState.treasurePosY);
    var marker = document.createElement('div');
    marker.id = 'treasureMarker';
    marker.className = 'region-marker treasure-marker';
    marker.style.left = pos.x + '%';
    marker.style.top = pos.y + '%';
    marker.style.zIndex = '6';
    marker.style.cursor = 'pointer';
    marker.style.position = 'absolute';
    marker.style.transform = 'translate(-50%, -50%)';
    marker.innerHTML = `
        <div style="font-size:1.8rem;filter:drop-shadow(0 0 20px rgba(255,215,0,0.6));animation:treasurePulse 1.5s ease-in-out infinite;text-shadow:0 0 15px rgba(255,215,0,0.4);">
            💰
        </div>
        <div style="font-size:0.4rem;color:#ffd700;text-shadow:0 0 8px rgba(0,0,0,0.9);background:rgba(0,0,0,0.8);padding:1px 8px;border-radius:10px;margin-top:-2px;white-space:nowrap;border:1px solid rgba(255,215,0,0.15);">
            ${Math.round(treasureState.treasurePosX)},${Math.round(treasureState.treasurePosY)}
        </div>
    `;
    marker.addEventListener('click', function(e) {
        e.stopPropagation();
        if (window.travel && window.travel.isTraveling()) {
            showToast('⛵ 航行中，请等待', 1500);
            return;
        }
        navigateToTreasure();
    });
    mapOverlay.appendChild(marker);
    treasureMarker = marker;
}

function removeTreasureMarker() {
    if (treasureMarker && treasureMarker.parentNode) {
        treasureMarker.parentNode.removeChild(treasureMarker);
        treasureMarker = null;
    }
}

function navigateToTreasure() {
    if (window.travel && window.travel.navigateToTreasure) {
        window.travel.navigateToTreasure();
    } else {
        showToast('❌ 航行系统未加载', 1500);
    }
}

// ============================================================
// 渲染标记
// ============================================================
function renderMarkers() {
    syncPlayerLevel();
    var existing = mapOverlay.querySelectorAll('.region-marker:not(.treasure-marker)');
    for (var i = 0; i < existing.length; i++) existing[i].remove();
    for (var i = 0; i < regions.length; i++) {
        var r = regions[i];
        var pos = toPercent(r.px, r.py);
        var marker = document.createElement('div');
        marker.className = 'region-marker';
        marker.dataset.id = r.id;
        marker.style.left = pos.x + '%';
        marker.style.top = pos.y + '%';
        var dotClass = 'locked';
        if (r.status === 'current') dotClass = 'current';
        else if (r.status === 'completed') dotClass = 'completed';
        else if (r.status === 'unlocked') dotClass = 'unlocked';
        marker.innerHTML = '<div class="dot ' + dotClass + '"></div><div class="label">' + r.name + '</div>';
        marker.addEventListener('click', function(e) {
            e.stopPropagation();
            var id = this.dataset.id;
            selectedRegionId = id;
            updateInfoPanel();
            var markers = mapOverlay.querySelectorAll('.region-marker:not(.treasure-marker)');
            for (var i = 0; i < markers.length; i++) {
                if (markers[i].dataset.id === id) {
                    markers[i].style.transform = 'translate(-50%, -50%) scale(1.25)';
                    markers[i].style.zIndex = '10';
                } else {
                    markers[i].style.transform = 'translate(-50%, -50%) scale(1)';
                    markers[i].style.zIndex = '2';
                }
            }
            showToast('📍 ' + getRegion(id).icon + ' ' + getRegion(id).name, 1200);
        });
        mapOverlay.appendChild(marker);
    }
    updateShipPosition();
    updateTreasureMarker();
}

function selectRegion(id) {
    var region = getRegion(id);
    if (!region) return;
    selectedRegionId = id;
    updateInfoPanel();
    var markers = mapOverlay.querySelectorAll('.region-marker:not(.treasure-marker)');
    for (var i = 0; i < markers.length; i++) {
        if (markers[i].dataset.id === id) {
            markers[i].style.transform = 'translate(-50%, -50%) scale(1.25)';
            markers[i].style.zIndex = '10';
        } else {
            markers[i].style.transform = 'translate(-50%, -50%) scale(1)';
            markers[i].style.zIndex = '2';
        }
    }
    showToast('📍 ' + region.icon + ' ' + region.name, 1200);
}

// ============================================================
// 获取区域名称
// ============================================================
function getRegionName(regionId) {
    var regionMap = {
        'welcome': '欢迎米来湾', 'nocean': '可以就这洋', 'nomo_peninsula': '嫑锅半岛',
        'friedegg': '煎蛋海', 'croissant': '可颂大陆', 'dumbpan': '沙锅洲',
        'baxian': '八仙锅海', 'rice': '大米洲', 'panini': '帕尼尼大陆',
        'nomo_ocean': '嫑界洋', 'random': '藏宝地点'
    };
    return regionMap[regionId] || regionId;
}

// ============================================================
// 背包功能
// ============================================================
function getBackpack() {
    try { var data = localStorage.getItem('explore_backpack'); return data ? JSON.parse(data) : {}; } catch(e) { return {}; }
}
function saveBackpack(bp) { localStorage.setItem('explore_backpack', JSON.stringify(bp)); }

// ============================================================
// 投喂数据管理（嫑界洋 · 赛博章鱼）
// ============================================================
function getFeedData() {
    try { var data = localStorage.getItem('nomo_feed_data'); if (data) return JSON.parse(data); } catch(e) {}
    return { fedFoods: {}, totalCount: 0 };
}
function saveFeedData(data) { localStorage.setItem('nomo_feed_data', JSON.stringify(data)); }
function getFedFoodCount(foodId) { var data = getFeedData(); return data.fedFoods[foodId] || 0; }
function addFeedRecord(foodId) { var data = getFeedData(); data.fedFoods[foodId] = (data.fedFoods[foodId] || 0) + 1; data.totalCount = (data.totalCount || 0) + 1; saveFeedData(data); return data; }
function getTotalFedCount() { var data = getFeedData(); return data.totalCount || 0; }
function getUniqueFedCount() { var data = getFeedData(); var keys = Object.keys(data.fedFoods); var count = 0; for (var i = 0; i < keys.length; i++) { if (data.fedFoods[keys[i]] > 0) count++; } return count; }

// ============================================================
// 嫑界洋 · 完成状态管理
// ============================================================
function getNomoCompleted() { try { return localStorage.getItem('nomo_completed') === 'true'; } catch(e) { return false; } }
function setNomoCompleted() { localStorage.setItem('nomo_completed', 'true'); }
function resetNomoCompleted() { localStorage.removeItem('nomo_completed'); }

// ============================================================
// 嫑界洋 · 赛博章鱼对话系统
// ============================================================
var nomoDialogues = [
    '🐙 ... 检测到生命信号 ... 我需要 ... 能量 ...',
    '🐙 发现生物痕迹 ... 新鲜的食物气味 ...',
    '🐙 饥饿 ... 系统警告 ... 能量不足 ...',
    '🐙 请 ... 投喂 ... 任何 ... 食物 ...',
    '🐙 生物信号增强 ... 靠近中 ...',
    '🐙 食物 ... 食物 ... 我需要食物！',
    '🐙 警告 ... 系统将在 929 秒后进入休眠 ...',
    '🐙 你 ... 有食物吗？',
    '🐙 我 ... 饿了 ... 很久了 ...',
    '🐙 请 ... 给我 ... 食物 ...',
    '🐙 能量 ... 食物 ... 生存 ...'
];

var darkReactions = [
    '🐙 ... 呃 ... 这是什么味道 ... 好奇怪 ...',
    '🐙 黑暗料理 ... 我的传感器在颤抖 ...',
    '🐙 这 ... 这能吃吗？我感觉不太好 ...',
    '🐙 你确定这是食物吗？我觉得像燃料 ...',
    '🐙 哇 ... 好难吃 ... 但 ... 我好像有点喜欢？',
    '🐙 警告！检测到不明物质！... 好吧，还挺管饱的。',
    '🐙 黑暗料理 ... 这个名字取得很准确 ...',
    '🐙 我感觉我的电路都要被腐蚀了 ... 再来一份！',
    '🐙 难吃！但充满能量！... 人类真是奇怪的生物。',
    '🐙 这让我想起了 C929 星球的食堂 ... 好怀念 ...'
];

function getNomoDialogue() {
    if (window._lastFedFood === 'dark_cuisine') {
        return darkReactions[Math.floor(Math.random() * darkReactions.length)];
    }
    var total = getTotalFedCount();
    var unique = getUniqueFedCount();
    if (total >= 92 && unique >= 29) return '🐙✨ 能量充足！系统全面激活！感谢你，勇敢的冒险者！';
    if (total >= 70) return '🐙 能量正在恢复 ... 继续投喂 ... 我需要更多！';
    if (unique >= 20) return '🐙 多种食物 ... 很好 ... 继续 ...';
    if (total >= 40) return '🐙 能量水平提升 ... 继续投喂 ...';
    if (total >= 15) return '🐙 食物 ... 更多 ... 我需要更多！';
    if (total >= 5) return '🐙 嗯 ... 好吃 ... 还有吗？';
    if (total > 0) return '🐙 食物 ... 收到了 ... 谢谢 ...';
    var idx = Math.floor(Math.random() * nomoDialogues.length);
    return nomoDialogues[idx];
}

function updateNomoDialogue() {
    var textEl = document.getElementById('nomoDialogueText');
    if (textEl) textEl.textContent = getNomoDialogue();
    var interactEl = document.getElementById('interactCountDisplay');
    if (interactEl) { var total = getTotalFedCount(); interactEl.textContent = total + 1; }
}

function updateNomoStats() {
    var totalFed = getTotalFedCount();
    var uniqueFed = getUniqueFedCount();
    var progress = Math.min(100, Math.round((totalFed / 92) * 100));
    var totalEl = document.getElementById('totalFedDisplay');
    if (totalEl) totalEl.textContent = totalFed;
    var uniqueEl = document.getElementById('uniqueFedDisplay');
    if (uniqueEl) uniqueEl.textContent = uniqueFed;
    var progressEl = document.getElementById('progressDisplay');
    if (progressEl) progressEl.textContent = progress + '%';
}

// ============================================================
// 渲染背包（完整版：物品 + 食物 + 收藏品 三标签）
// ============================================================
function renderBackpack() {
    var grid = document.getElementById('backpackGrid');
    if (!grid) return;
    grid.innerHTML = '';

    // ---- 标签栏 ----
    var tabBar = document.createElement('div');
    tabBar.style.cssText = 'grid-column:1/-1;display:flex;gap:8px;margin-bottom:8px;border-bottom:1px solid #e7c29e;padding-bottom:6px;flex-wrap:wrap;';

    var tabs = [
        { id: 'items', label: '🎒 物品' },
        { id: 'food', label: '🍳 食物' },
        { id: 'collectibles', label: '💎 收藏品' }
    ];

    tabs.forEach(function(tab) {
        var btn = document.createElement('button');
        btn.textContent = tab.label;
        btn.style.cssText = [
            'padding:4px 16px;',
            'border-radius:30px;',
            'border:1px solid #e7c29e;',
            'background:' + (backpackTab === tab.id ? '#6f9e3f' : '#f5ede4') + ';',
            'color:' + (backpackTab === tab.id ? '#fff' : '#5a2e1c') + ';',
            'cursor:pointer;',
            'font-size:0.7rem;',
            'font-weight:bold;',
            'transition:0.15s;'
        ].join('');
        btn.onmouseover = function() {
            if (backpackTab !== tab.id) this.style.background = '#ede0d2';
        };
        btn.onmouseout = function() {
            if (backpackTab !== tab.id) this.style.background = '#f5ede4';
        };
        btn.onclick = function() {
            backpackTab = tab.id;
            renderBackpack();
        };
        tabBar.appendChild(btn);
    });

    grid.appendChild(tabBar);

    var backpack = getBackpack();
    var keys = Object.keys(backpack);
    var foodIds = [];
    if (typeof window.PANINI_RECIPES !== 'undefined' && window.PANINI_RECIPES.length > 0) {
        window.PANINI_RECIPES.forEach(function(r) { foodIds.push(r.id); });
    }
    foodIds.push('dark_cuisine');

    // ============================================================
    // ★★★ 收藏品标签页 ★★★
    // ============================================================
    if (backpackTab === 'collectibles') {
        var collected = window.getCollectedCollectibles ? window.getCollectedCollectibles() : [];
        if (collected.length === 0 || typeof window.TREASURE_COLLECTIBLES === 'undefined') {
            var emptyMsg = document.createElement('div');
            emptyMsg.style.cssText = 'grid-column:1/-1;text-align:center;padding:40px 0;color:#a56b3a;font-size:0.9rem;';
            emptyMsg.textContent = '💎 还没有收藏品，去探险寻宝吧！';
            grid.appendChild(emptyMsg);
            return;
        }

        var collectibleCounts = {};
        collected.forEach(function(id) {
            collectibleCounts[id] = (collectibleCounts[id] || 0) + 1;
        });

        window.TREASURE_COLLECTIBLES.forEach(function(c) {
            var count = collectibleCounts[c.id] || 0;
            if (count > 0) {
                var div = document.createElement('div');
                var rarityColor = c.rarity === 'common' ? '#8b8b8b' : 
                                  (c.rarity === 'rare' ? '#2e86de' : 
                                  (c.rarity === 'epic' ? '#9b59b6' : '#ff6b00'));
                var rarityLabel = c.rarity === 'common' ? '普通' : 
                                  (c.rarity === 'rare' ? '稀有' : 
                                  (c.rarity === 'epic' ? '史诗' : '传说'));
                div.style.cssText = [
                    'background:linear-gradient(135deg,#fef9e7,#fdebd0);',
                    'border-radius:16px;',
                    'padding:8px;',
                    'text-align:center;',
                    'border:2px solid ' + rarityColor + ';',
                    'position:relative;',
                    'cursor:default;'
                ].join('');
                div.innerHTML = [
                    '<div style="font-size:2rem;">' + c.icon + '</div>',
                    '<div style="font-size:0.7rem;font-weight:bold;color:#5a2e1c;">' + c.name + '</div>',
                    '<div style="font-size:0.5rem;color:' + rarityColor + ';font-weight:bold;">' + rarityLabel + '</div>',
                    '<div style="font-size:0.9rem;font-weight:bold;color:#c4651e;margin-top:2px;">×' + count + '</div>'
                ].join('');
                grid.appendChild(div);
            }
        });
        return;
    }

    // ============================================================
    // ★★★ 物品标签页 ★★★
    // ============================================================
    if (backpackTab === 'items') {
        var specialKeys = ['treasure_fragment', 'rice_grain', 'golden_ear', 'cocoa_powder', 'rice_flour', 'ore_fuel', 'egg', 'golden_egg', 'rose_seed', 'rose', 'iron_ore', 'diamond'];
        var filteredKeys = keys.filter(function(k) { 
            return foodIds.indexOf(k) === -1 && (backpack[k] || 0) > 0 && specialKeys.indexOf(k) !== -1;
        });

        var specialItems = [
            { key: 'rice_grain', icon: '🌾', name: '稻谷', color: '#d4a050' },
            { key: 'golden_ear', icon: '🌾', name: '金色稻穗', color: '#ffd700' },
            { key: 'cocoa_powder', icon: '🍫', name: '可可粉', color: '#6f3f1a', img: 'images/cocopowder.png' },
            { key: 'rice_flour', icon: '🌾', name: '面粉', color: '#d4a050', img: 'images/flour.png' },
            { key: 'ore_fuel', icon: '⛽', name: '燃料', color: '#e67e22', img: 'images/fuel.png' },
            { key: 'egg', icon: '🥚', name: '鸡蛋', color: '#f5d742' },
            { key: 'golden_egg', icon: '🥚', name: '金蛋', color: '#ffd700' },
            { key: 'rose_seed', icon: '🌱', name: '玫瑰种子', color: '#e91e63' },
            { key: 'rose', icon: '🌹', name: '玫瑰', color: '#ff6b6b' },
            { key: 'iron_ore', icon: '🪨', name: '铁矿', color: '#8d8d8d' },
            { key: 'diamond', icon: '💎', name: '钻石', color: '#4fc3f7' }
        ];

        var fragmentCount = backpack['treasure_fragment'] || 0;
        var hasCompleteMap = false;
        if (typeof treasureState !== 'undefined') hasCompleteMap = treasureState.hasCompleteMap;
        if (hasCompleteMap) {
            var regionName = '未知区域', coordX = 0, coordY = 0;
            if (typeof treasureState !== 'undefined' && treasureState.treasureRegionId) {
                regionName = getRegionName(treasureState.treasureRegionId);
                coordX = Math.round(treasureState.treasurePosX);
                coordY = Math.round(treasureState.treasurePosY);
            }
            var mapCard = document.createElement('div');
            mapCard.style.cssText = 'background:#f5ede4;border-radius:16px;padding:8px;text-align:center;border:2px solid #ffd700;';
            mapCard.innerHTML = '<div style="font-size:2rem;">🗺️</div><div style="font-size:0.65rem;font-weight:bold;color:#5a2e1c;">藏宝图</div><div style="font-size:0.55rem;color:#a56b3a;">' + regionName + '</div><div style="font-size:0.5rem;color:#c4651e;">X:' + coordX + ' Y:' + coordY + '</div><div style="font-size:0.5rem;color:#6f9e3f;margin-top:2px;">💰 关闭背包，在地图上点击宝箱标记前往</div>';
            grid.appendChild(mapCard);
        } else if (fragmentCount > 0) {
            var canSynthesize = fragmentCount >= 4;
            var fragCard = document.createElement('div');
            fragCard.style.cssText = 'background:#f5ede4;border-radius:16px;padding:8px;text-align:center;border:1px solid ' + (canSynthesize ? '#ffd700' : '#e7c29e') + ';' + (canSynthesize ? 'cursor:pointer;transition:0.15s;' : '');
            fragCard.innerHTML = '<div style="font-size:2rem;">🧩</div><div style="font-size:0.7rem;font-weight:bold;color:#5a2e1c;">碎片</div><div style="font-size:0.9rem;font-weight:bold;color:' + (canSynthesize ? '#ffd700' : '#c4651e') + ';">' + fragmentCount + '/4</div>' + (canSynthesize ? '<div style="font-size:0.5rem;color:#6f9e3f;margin-top:2px;">点击合成</div>' : '');
            if (canSynthesize) {
                fragCard.onmouseover = function() { this.style.transform = 'scale(1.05)'; this.style.borderColor = '#f5a623'; };
                fragCard.onmouseout = function() { this.style.transform = 'scale(1)'; this.style.borderColor = '#ffd700'; };
                fragCard.onclick = function() { if (typeof assembleMap === 'function') assembleMap(); else showToast('❌ 合成功能不可用', 1500); };
            }
            grid.appendChild(fragCard);
        }

        for (var si = 0; si < specialItems.length; si++) {
            var sp = specialItems[si];
            var count = backpack[sp.key] || 0;
            if (count > 0) {
                var item = document.createElement('div');
                item.style.cssText = 'background:#f5ede4;border-radius:16px;padding:8px;text-align:center;border:1px solid ' + sp.color + ';';
                var iconHtml = '';
                if (sp.img) {
                    iconHtml = '<img src="' + sp.img + '" style="width:36px;height:36px;object-fit:contain;border-radius:6px;display:block;margin:0 auto 2px;" onerror="this.style.display=\'none\'; this.parentElement.querySelector(\'.fallback-icon\').style.display=\'block\';">' +
                               '<span class="fallback-icon" style="display:none;font-size:2rem;">' + sp.icon + '</span>';
                } else {
                    iconHtml = '<div style="font-size:2rem;">' + sp.icon + '</div>';
                }
                item.innerHTML = iconHtml +
                    '<div style="font-size:0.7rem;font-weight:bold;color:#5a2e1c;">' + sp.name + '</div>' +
                    '<div style="font-size:0.9rem;font-weight:bold;color:#c4651e;">×' + count + '</div>';
                if (sp.key === 'golden_ear' || sp.key === 'golden_egg') {
                    item.style.border = '2px solid #ffd700';
                    item.style.boxShadow = '0 0 12px rgba(255,215,0,0.3), 0 0 24px rgba(255,215,0,0.1)';
                    item.style.background = 'linear-gradient(135deg, #fff8e1, #f5ede4)';
                }
                if (sp.key === 'rose') {
                    item.style.border = '2px solid #ff6b6b';
                    item.style.boxShadow = '0 0 12px rgba(255,107,107,0.2), 0 0 24px rgba(255,107,107,0.05)';
                    item.style.background = 'linear-gradient(135deg, #fff0f0, #f5ede4)';
                }
                if (sp.key === 'diamond') {
                    item.style.border = '2px solid #4fc3f7';
                    item.style.boxShadow = '0 0 12px rgba(79,195,247,0.2), 0 0 24px rgba(79,195,247,0.05)';
                    item.style.background = 'linear-gradient(135deg, #e8f4fd, #f5ede4)';
                }
                if (sp.key === 'iron_ore') {
                    item.style.border = '1px solid #8d8d8d';
                    item.style.background = 'linear-gradient(135deg, #f0ece8, #f5ede4)';
                }
                if (sp.key === 'rice_grain') {
                    item.style.border = '1px solid #d4a050';
                    item.style.background = 'linear-gradient(135deg, #fdf6ee, #f5ede4)';
                }
                grid.appendChild(item);
            }
        }

        var fishKeys = keys.filter(function(k) { 
            return specialKeys.indexOf(k) === -1 && foodIds.indexOf(k) === -1 && (backpack[k] || 0) > 0;
        });
        for (var i = 0; i < fishKeys.length; i++) {
            var id = fishKeys[i];
            var count = backpack[id];
            var fish = window.FISH_TYPES[id];
            if (!fish) continue;
            var item = document.createElement('div');
            item.style.cssText = 'background:#f5ede4;border-radius:16px;padding:8px;text-align:center;border:1px solid #e7c29e;';
            item.innerHTML = '<div style="font-size:2rem;">' + fish.icon + '</div><div style="font-size:0.7rem;font-weight:bold;color:#5a2e1c;">' + fish.name + '</div><div style="font-size:0.9rem;font-weight:bold;color:#c4651e;">×' + count + '</div>';
            grid.appendChild(item);
        }

        if (grid.children.length <= 1) {
            var emptyMsg = document.createElement('div');
            emptyMsg.style.cssText = 'grid-column:1/-1;text-align:center;padding:40px 0;color:#a56b3a;font-size:0.9rem;';
            emptyMsg.textContent = '🎒 背包空空如也，去探险收集物品吧！';
            grid.appendChild(emptyMsg);
        }
        return;
    }

    // ============================================================
    // ★★★ 食物标签页 ★★★
    // ============================================================
    if (backpackTab === 'food') {
        var foodKeys = keys.filter(function(k) { 
            return foodIds.indexOf(k) !== -1 && (backpack[k] || 0) > 0;
        });
        if (foodKeys.length === 0) {
            var emptyMsg = document.createElement('div');
            emptyMsg.style.cssText = 'grid-column:1/-1;text-align:center;padding:40px 0;color:#a56b3a;font-size:0.9rem;';
            emptyMsg.textContent = '🍳 还没有食物，去帕尼尼大陆烹饪吧！';
            grid.appendChild(emptyMsg);
            return;
        }
        for (var fi = 0; fi < foodKeys.length; fi++) {
            var key = foodKeys[fi];
            var count = backpack[key];
            var recipe = null;
            if (typeof window.PANINI_RECIPES !== 'undefined') {
                for (var ri = 0; ri < window.PANINI_RECIPES.length; ri++) {
                    if (window.PANINI_RECIPES[ri].id === key) { recipe = window.PANINI_RECIPES[ri]; break; }
                }
            }
            if (!recipe && key === 'dark_cuisine') {
                var div = document.createElement('div');
                div.style.cssText = 'background:linear-gradient(135deg,#2d1b0e,#4a2c1a);border-radius:16px;padding:8px;text-align:center;border:2px solid #6a4a2a;color:#f0e8d8;';
                div.innerHTML = '<div style="font-size:2rem;">💀</div><div style="font-size:0.7rem;font-weight:bold;">黑暗料理</div><div style="font-size:0.9rem;font-weight:bold;">×' + count + '</div>';
                grid.appendChild(div);
                continue;
            }
            if (!recipe) continue;
            var div = document.createElement('div');
            div.style.cssText = 'background:#f5ede4;border-radius:16px;padding:8px;text-align:center;border:1px solid #e7c29e;';
            div.innerHTML = '<div style="font-size:2rem;">' + recipe.icon + '</div><div style="font-size:0.7rem;font-weight:bold;color:#5a2e1c;">' + recipe.name + '</div><div style="font-size:0.9rem;font-weight:bold;color:#c4651e;">×' + count + '</div>';
            grid.appendChild(div);
        }
        return;
    }
}

// ============================================================
// 对话头像辅助函数
// ============================================================
function getAvatarHTML(avatarPath, size) {
    size = size || 40;
    if (!avatarPath) return '<span style="font-size:' + (size * 0.8) + 'px;display:inline-block;">👤</span>';
    return '<img src="' + avatarPath + '" style="width:' + size + 'px;height:' + size + 'px;object-fit:contain;border-radius:50%;background:rgba(0,0,0,0.1);display:inline-block;" onerror="this.style.display=\'none\'; this.parentElement.innerHTML=\'<span style=font-size:' + (size * 0.8) + 'px;display:inline-block;>👤</span>\';">';
}

// ============================================================
// 花盆特效
// ============================================================
(function injectWaterDropStyle() {
    if (document.getElementById('waterDropStyle')) return;
    var style = document.createElement('style');
    style.id = 'waterDropStyle';
    style.textContent = `
        .mist-particle { position: absolute; border-radius: 50%; background: rgba(100, 200, 255, 0.25); animation: mistFloat 0.9s ease-out forwards; pointer-events: none; z-index: 10; }
        @keyframes mistFloat { 0% { opacity: 0.6; transform: scale(0.3) translateY(0) translateX(0); } 50% { opacity: 0.9; transform: scale(1.8) translateY(-25px) translateX(10px); } 100% { opacity: 0; transform: scale(0.4) translateY(-60px) translateX(-5px); } }
        .rainbow-line { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); border-radius: 50%; border: 3px solid transparent; animation: rainbowExpand 0.9s ease-out forwards; pointer-events: none; z-index: 8; }
        @keyframes rainbowExpand { 0% { width: 10px; height: 10px; border-color: rgba(255, 50, 50, 0.3); } 20% { border-color: rgba(255, 165, 0, 0.3); } 40% { border-color: rgba(255, 255, 0, 0.3); } 60% { border-color: rgba(50, 255, 50, 0.3); } 80% { border-color: rgba(50, 150, 255, 0.3); } 100% { width: 200px; height: 200px; border-color: rgba(150, 50, 255, 0); opacity: 0; } }
        @keyframes roseGlow { 0%,100% { filter: drop-shadow(0 0 4px rgba(255,0,0,0.1)); } 50% { filter: drop-shadow(0 0 20px rgba(255,0,0,0.25)); } }
        #waterEffectContainer { position: fixed !important; top:0 !important; left:0 !important; width:100% !important; height:100% !important; pointer-events:none !important; z-index:99999 !important; overflow:visible !important; }
    `;
    document.head.appendChild(style);
})();

function playWaterEffect(targetElement) {
    console.log('🎨 开始生成特效元素');
    var target = targetElement || document.getElementById('potEffectTarget');
    if (!target) { console.warn('⚠️ 未找到 #potEffectTarget'); return; }
    target.querySelectorAll('.rainbow-line, .mist-particle').forEach(function(el) { el.remove(); });
    target.style.overflow = 'visible';
    target.style.position = 'relative';
    target.style.zIndex = '9999';
    var ring = document.createElement('div');
    ring.className = 'rainbow-line';
    ring.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;border:3px solid transparent;animation:rainbowExpand 0.9s ease-out forwards;pointer-events:none;z-index:9999;width:10px;height:10px;';
    target.appendChild(ring);
    setTimeout(function() { if (ring.parentNode) ring.remove(); }, 1000);
    for (var i = 0; i < 15; i++) {
        (function(index) {
            var p = document.createElement('div');
            p.className = 'mist-particle';
            var size = 4 + Math.random() * 10;
            var colors = ['rgba(100, 200, 255, 0.3)','rgba(150, 220, 255, 0.25)','rgba(200, 180, 255, 0.2)','rgba(255, 255, 255, 0.15)'];
            p.style.cssText = 'position:absolute;border-radius:50%;background:' + colors[Math.floor(Math.random() * colors.length)] + ';animation:mistFloat 0.9s ease-out forwards;pointer-events:none;z-index:9998;width:' + size + 'px;height:' + size + 'px;left:' + (20 + Math.random() * 60) + '%;top:' + (30 + Math.random() * 40) + '%;animation-delay:' + (Math.random() * 0.5) + 's;';
            target.appendChild(p);
            setTimeout(function() { if (p.parentNode) p.remove(); }, 1400);
        })(i);
    }
    console.log('✅ 精简特效已生成（彩虹环 + 水雾粒子）');
}

function playRoseSeedDialogue() {
    console.log('🌹 触发玫瑰种子对话');
    var nodes = [
        { speaker: '嫑嫑', avatar: 'nono', text: '小王子，你看！我们在可颂大陆买到了这个——玫瑰种子！' },
        { speaker: '小王子', avatar: 'prince', text: '哇！是一颗真正的玫瑰种子吗？它看起来……好小啊。它真的能开出玫瑰吗？' },
        { speaker: '可可', avatar: 'cocoa', text: '当然啦！在可颂商店买的，那家店的东西都很靠谱！我们把它种在这里吧。' },
        { speaker: '小王子', avatar: 'prince', text: '但是……我没有花盆。这里只有沙子，种不了玫瑰。' },
        { speaker: '可可', avatar: 'cocoa', text: '嘿嘿，这个你不用担心。我有一个花盆，是好朋友送给我的。' },
        { speaker: '小王子', avatar: 'prince', text: '好朋友？' },
        { speaker: '可可', avatar: 'cocoa', text: '嗯！它来自遥远的 C929 星球，是一个很特别的花盆。上面还有一个小小的编号，写的是 "C-929"。' },
        { speaker: '小王子', avatar: 'prince', text: 'C929 星球……我从来没有听说过这个星球。它在哪里？' },
        { speaker: '可可', avatar: 'cocoa', text: '我也不知道它在哪。那个朋友说，它离这里很远很远。' },
        { speaker: '小王子', avatar: 'prince', text: '很远才能到达……那一定是一个很美丽的地方。' },
        { speaker: '可可', avatar: 'cocoa', text: '是啊。他说 C929 星球上没有沙漠，到处都是会发光的花。他送我这个花盆的时候说："把它种在你想念的地方，花就会开。"' },
        { speaker: '小王子', avatar: 'prince', text: '（沉默片刻）那……我们就用它来种这朵玫瑰吧。' },
        { speaker: '嫑嫑', avatar: 'nono', text: '好！等它开花了，我们一起看。' }
    ];
    var rewards = { exp: 20, coins: 10 };
    if (typeof window.playCustomStory === 'function') {
        window.playCustomStory(nodes, function() {
            console.log('✅ 玫瑰种子对话完成');
            localStorage.setItem('rose_pot_unlocked', 'true');
            if (rewards.exp && typeof addExp === 'function') addExp(rewards.exp);
            if (rewards.coins && typeof addExploreCoins === 'function') addExploreCoins(rewards.coins);
            showToast('⭐ +' + rewards.exp + ' 经验 ⚓ +' + rewards.coins + ' 探险币', 2000);
            updateFlowerPot();
        });
    } else {
        console.warn('⚠️ playCustomStory 不可用，使用降级方案');
        showFallbackDialogue(nodes, function() {
            localStorage.setItem('rose_pot_unlocked', 'true');
            if (rewards.exp && typeof addExp === 'function') addExp(rewards.exp);
            if (rewards.coins && typeof addExploreCoins === 'function') addExploreCoins(rewards.coins);
            showToast('⭐ +' + rewards.exp + ' 经验 ⚓ +' + rewards.coins + ' 探险币', 2000);
            updateFlowerPot();
        });
    }
}

function showFallbackDialogue(nodes, onComplete) {
    var index = 0;
    var total = nodes.length;
    function showNext() {
        if (index >= total) { if (typeof onComplete === 'function') onComplete(); return; }
        var node = nodes[index];
        var msg = node.speaker + '：' + node.text;
        if (typeof showToast === 'function') showToast('💬 ' + msg, 3000);
        else console.log('💬 ' + msg);
        index++;
        setTimeout(showNext, 3200);
    }
    showNext();
}

// ============================================================
// 更新花盆UI（含形态显示）
// ============================================================
function updateFlowerPot() {
    var current = getCurrentRegion();
    if (!current || current.id !== 'nomo_peninsula') return;
    var infoMode = document.getElementById('infoMode');
    if (!infoMode) return;
    var oldPot = document.getElementById('rosePotContainer');
    if (oldPot) oldPot.remove();
    var defaultRoseData = { planted: false, plantDate: null, waterCount: 0, harvestCount: 0, stageTriggered: { seed: false, sprout: false, bud: false, bloom: false }, lastWaterDate: null, hasFirstRose: false, todayWaterCount: 0 };
    var rawData = localStorage.getItem('rose_plant_data');
    var roseData = defaultRoseData;
    if (rawData) {
        try {
            var parsed = JSON.parse(rawData);
            roseData.planted = parsed.planted !== undefined ? parsed.planted : defaultRoseData.planted;
            roseData.plantDate = parsed.plantDate || null;
            roseData.waterCount = parseInt(parsed.waterCount) || 0;
            roseData.harvestCount = parseInt(parsed.harvestCount) || 0;
            roseData.lastWaterDate = parsed.lastWaterDate || null;
            roseData.hasFirstRose = parsed.hasFirstRose || false;
            roseData.todayWaterCount = parseInt(parsed.todayWaterCount) || 0;
            if (parsed.stageTriggered && typeof parsed.stageTriggered === 'object') {
                roseData.stageTriggered = { seed: parsed.stageTriggered.seed || false, sprout: parsed.stageTriggered.sprout || false, bud: parsed.stageTriggered.bud || false, bloom: parsed.stageTriggered.bloom || false };
            } else {
                roseData.stageTriggered = { seed: false, sprout: false, bud: false, bloom: false };
            }
        } catch(e) { console.warn('解析玫瑰数据失败，使用默认值:', e); roseData = defaultRoseData; }
    }
    var backpack = getBackpack();
    var dewCount = backpack['star_dew'] || 0;
    var seedCount = backpack['rose_seed'] || 0;
    var waterCount = roseData.waterCount;
    var isBloomed = (waterCount >= 100);
    var isPlanted = roseData.planted || false;
    var progressPercent = Math.min(100, Math.round((waterCount / 100) * 100));
    var potContainer = document.createElement('div');
    potContainer.id = 'rosePotContainer';
    potContainer.style.cssText = 'position:absolute;left:65%;bottom:30px;transform:translateX(-50%);z-index:2;cursor:pointer;text-align:center;';
    var potHTML = '<img src="images/pot.png" alt="花盆" style="width:120px;height:auto;display:block;margin:0 auto;filter:drop-shadow(0 4px 16px rgba(0,0,0,0.4));" onerror="this.style.display=\'none\'; this.parentElement.innerHTML=\'<div style=font-size:3.5rem;>🪴</div>\';">';
    var overlayHTML = '', labelHTML = '', statusText = '';
    if (!isPlanted) {
        if (seedCount > 0) { overlayHTML = '<div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:2.4rem;line-height:1;text-shadow:0 0 12px rgba(0,0,0,0.5);">🌱</div>'; labelHTML = '<div style="font-size:0.7rem;color:#7ecfff;margin-top:6px;text-shadow:0 0 10px rgba(0,0,0,0.8);font-weight:500;">点击种植</div>'; statusText = '🌱 可种植'; }
        else { labelHTML = '<div style="font-size:0.65rem;color:#888;margin-top:6px;text-shadow:0 0 10px rgba(0,0,0,0.8);">无种子</div>'; statusText = '💤 无种子'; }
    } else if (isBloomed) {
        overlayHTML = '<div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:3rem;line-height:1;text-shadow:0 0 20px rgba(255,0,0,0.3);animation:roseGlow 2s ease-in-out infinite;">🌹</div>';
        labelHTML = '<div style="font-size:0.7rem;color:#ff6b6b;margin-top:6px;text-shadow:0 0 10px rgba(0,0,0,0.8);font-weight:500;">点击收获</div>';
        statusText = '🌹 可收获';
    } else {
        var emoji = waterCount < 30 ? '🌱' : (waterCount < 60 ? '🌿' : '🍀');
        overlayHTML = '<div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:2.6rem;line-height:1;text-shadow:0 0 12px rgba(0,0,0,0.5);">' + emoji + '</div>';
        labelHTML = '<div style="font-size:0.7rem;color:#7ecfff;margin-top:6px;text-shadow:0 0 10px rgba(0,0,0,0.8);font-weight:500;">💧 浇水 (' + waterCount + '/100)</div>';
        statusText = '🌱 生长中 ' + progressPercent + '%';
    }
    var progressHTML = (isPlanted && !isBloomed) ? '<div style="width:100px;height:4px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;margin:4px auto 0;"><div style="width:' + progressPercent + '%;height:100%;background:linear-gradient(90deg,#6f9e3f,#ffd700);border-radius:4px;transition:width 0.3s;"></div></div>' : '';
    var dewHTML = '<div style="font-size:0.6rem;color:rgba(255,255,255,0.2);margin-top:2px;">💧 ' + dewCount + ' 滴露珠</div>';
    potContainer.innerHTML = '<div id="potEffectTarget" style="position:relative;display:inline-block;">' + potHTML + overlayHTML + '</div>' + progressHTML + labelHTML + dewHTML + '<div style="font-size:0.5rem;color:rgba(255,255,255,0.08);margin-top:1px;">' + statusText + '</div>';
    potContainer.addEventListener('click', function(e) { e.stopPropagation(); handlePotClick(); });
    infoMode.appendChild(potContainer);
}

// ============================================================
// 花盆点击逻辑（包含浇水声望 +2）
// ============================================================
function handlePotClick() {
    var defaultRoseData = { planted: false, plantDate: null, waterCount: 0, harvestCount: 0, stageTriggered: { seed: false, sprout: false, bud: false, bloom: false }, lastWaterDate: null, hasFirstRose: false, todayWaterCount: 0 };
    var rawData = localStorage.getItem('rose_plant_data');
    var roseData = defaultRoseData;
    if (rawData) {
        try {
            var parsed = JSON.parse(rawData);
            roseData.planted = parsed.planted !== undefined ? parsed.planted : defaultRoseData.planted;
            roseData.plantDate = parsed.plantDate || null;
            roseData.waterCount = parseInt(parsed.waterCount) || 0;
            roseData.harvestCount = parseInt(parsed.harvestCount) || 0;
            roseData.lastWaterDate = parsed.lastWaterDate || null;
            roseData.hasFirstRose = parsed.hasFirstRose || false;
            roseData.todayWaterCount = parseInt(parsed.todayWaterCount) || 0;
            if (parsed.stageTriggered && typeof parsed.stageTriggered === 'object') {
                roseData.stageTriggered = { seed: parsed.stageTriggered.seed || false, sprout: parsed.stageTriggered.sprout || false, bud: parsed.stageTriggered.bud || false, bloom: parsed.stageTriggered.bloom || false };
            } else {
                roseData.stageTriggered = { seed: false, sprout: false, bud: false, bloom: false };
            }
        } catch(e) { console.warn('解析玫瑰数据失败，使用默认值:', e); roseData = defaultRoseData; }
    }
    var backpack = getBackpack();
    var today = getTodayDateStr();
    var waterCount = roseData.waterCount;
    var isBloomed = (waterCount >= 100);
    var isPlanted = roseData.planted || false;
    if (roseData.hasFirstRose) {
        if (isBloomed && isPlanted) {
            backpack['rose'] = (backpack['rose'] || 0) + 1;
            roseData.planted = false;
            roseData.waterCount = 0;
            roseData.todayWaterCount = 0;
            localStorage.setItem('rose_plant_data', JSON.stringify(roseData));
            saveBackpack(backpack);
            showToast('🌹 收获了一朵玫瑰！', 1500);
            updateFlowerPot();
            if (typeof renderBackpack === 'function') { var modal = document.getElementById('backpackModal'); if (modal && !modal.classList.contains('hidden')) renderBackpack(); }
        } else { showToast('🌹 小王子已经带着玫瑰离开了……但你还可以继续种植', 2000); }
        return;
    }
    if (isBloomed && isPlanted) {
        if (!roseData.stageTriggered.bloom) {
            roseData.stageTriggered.bloom = true;
            localStorage.setItem('rose_plant_data', JSON.stringify(roseData));
            playPrinceStory('bloom', function() {
                var data = JSON.parse(localStorage.getItem('rose_plant_data') || '{"planted":false,"plantDate":null,"waterCount":0,"harvestCount":0,"stageTriggered":{"seed":false,"sprout":false,"bud":false,"bloom":false},"lastWaterDate":null,"hasFirstRose":false,"todayWaterCount":0}');
                data.hasFirstRose = true;
                data.planted = false;
                data.waterCount = 0;
                data.todayWaterCount = 0;
                localStorage.setItem('rose_plant_data', JSON.stringify(data));
                var bp = getBackpack();
                bp['rose'] = (bp['rose'] || 0) + 1;
                saveBackpack(bp);
                showToast('🌹 小王子带着玫瑰离开了……留下了一片花瓣', 3000);
                updateFlowerPot();
                if (typeof renderBackpack === 'function') { var modal = document.getElementById('backpackModal'); if (modal && !modal.classList.contains('hidden')) renderBackpack(); }
                if (typeof randomFireworks === 'function') randomFireworks(4);
            });
            return;
        }
        backpack['rose'] = (backpack['rose'] || 0) + 1;
        roseData.planted = false;
        roseData.waterCount = 0;
        roseData.todayWaterCount = 0;
        localStorage.setItem('rose_plant_data', JSON.stringify(roseData));
        saveBackpack(backpack);
        showToast('🌹 收获了一朵玫瑰！', 1500);
        updateFlowerPot();
        if (typeof renderBackpack === 'function') { var modal = document.getElementById('backpackModal'); if (modal && !modal.classList.contains('hidden')) renderBackpack(); }
        return;
    }
    if (!isPlanted) {
        if ((backpack['rose_seed'] || 0) > 0) {
            backpack['rose_seed']--;
            saveBackpack(backpack);
            roseData.planted = true;
            roseData.plantDate = today;
            roseData.waterCount = 0;
            roseData.todayWaterCount = 0;
            localStorage.setItem('rose_plant_data', JSON.stringify(roseData));
            showToast('🌱 玫瑰种子已种植！', 1500);
            updateFlowerPot();
            setTimeout(function() {
                var data = JSON.parse(localStorage.getItem('rose_plant_data') || '{"planted":false,"plantDate":null,"waterCount":0,"harvestCount":0,"stageTriggered":{"seed":false,"sprout":false,"bud":false,"bloom":false},"lastWaterDate":null,"hasFirstRose":false,"todayWaterCount":0}');
                if (!data.stageTriggered.seed) { data.stageTriggered.seed = true; localStorage.setItem('rose_plant_data', JSON.stringify(data)); }
            }, 500);
            if (typeof renderBackpack === 'function') { var modal = document.getElementById('backpackModal'); if (modal && !modal.classList.contains('hidden')) renderBackpack(); }
        } else { showToast('💤 没有玫瑰种子，去可颂商店购买', 2000); }
        return;
    }
    if (isPlanted && !isBloomed) {
        var dewCount = backpack['star_dew'] || 0;
        if (dewCount <= 0) { showToast('💧 没有星光露珠！完成悬赏任务可以获得露珠', 2000); return; }
        backpack['star_dew'] = dewCount - 1;
        saveBackpack(backpack);
        var newWaterCount = waterCount + 1;
        roseData.waterCount = newWaterCount;
        roseData.todayWaterCount = (roseData.todayWaterCount || 0) + 1;
        roseData.lastWaterDate = today;
        localStorage.setItem('rose_plant_data', JSON.stringify(roseData));
        if (typeof window.addReputation === 'function') {
            window.addReputation(2, '玫瑰浇水');
        }
        showToast('💧 浇水成功！(' + newWaterCount + '/100) 剩余露珠: ' + (dewCount - 1), 1000);
        setTimeout(function() { var target = document.getElementById('potEffectTarget'); if (target) playWaterEffect(target); }, 100);
        updateFlowerPot();
        if (typeof renderBackpack === 'function') { var modal = document.getElementById('backpackModal'); if (modal && !modal.classList.contains('hidden')) renderBackpack(); }
        var data = JSON.parse(localStorage.getItem('rose_plant_data') || '{"planted":false,"plantDate":null,"waterCount":0,"harvestCount":0,"stageTriggered":{"seed":false,"sprout":false,"bud":false,"bloom":false},"lastWaterDate":null,"hasFirstRose":false,"todayWaterCount":0}');
        if (!data.stageTriggered) data.stageTriggered = { seed: false, sprout: false, bud: false, bloom: false };
        if (newWaterCount >= 30 && !data.stageTriggered.sprout) {
            data.stageTriggered.sprout = true;
            localStorage.setItem('rose_plant_data', JSON.stringify(data));
            setTimeout(function() { playPrinceStory('sprout'); }, 600);
        } else if (newWaterCount >= 60 && !data.stageTriggered.bud) {
            data.stageTriggered.bud = true;
            localStorage.setItem('rose_plant_data', JSON.stringify(data));
            setTimeout(function() { playPrinceStory('bud'); }, 600);
        }
    }
}

function checkRoseStoryTriggers(roseData) {
    var waterCount = parseInt(roseData.waterCount) || 0;
    if (waterCount >= 100 && roseData.planted && !roseData.stageTriggered.bloom && !roseData.hasFirstRose) {
        roseData.stageTriggered.bloom = true;
        localStorage.setItem('rose_plant_data', JSON.stringify(roseData));
        setTimeout(function() {
            playPrinceStory('bloom', function() {
                var data = JSON.parse(localStorage.getItem('rose_plant_data') || '{"planted":false,"plantDate":null,"waterCount":0,"harvestCount":0,"stageTriggered":{"seed":false,"sprout":false,"bud":false,"bloom":false},"lastWaterDate":null,"hasFirstRose":false,"todayWaterCount":0}');
                data.hasFirstRose = true;
                data.planted = false;
                data.waterCount = 0;
                data.todayWaterCount = 0;
                localStorage.setItem('rose_plant_data', JSON.stringify(data));
                var bp = getBackpack();
                bp['rose'] = (bp['rose'] || 0) + 1;
                saveBackpack(bp);
                showToast('🌹 小王子带着玫瑰离开了……留下了一片花瓣', 3000);
                updateFlowerPot();
                if (typeof randomFireworks === 'function') randomFireworks(4);
            });
        }, 500);
        return true;
    }
    return false;
}

// ============================================================
// 章鱼100%完成对话
// ============================================================
function playNomoCompletionStory(onComplete) {
    var nodes = [
        { speaker: '🐙 章鱼', emoji: '🐙', text: '能量核心完全激活！系统全面重启！感谢你们，勇敢的探险者。你们解救了被困千年的星际信使。' },
        { speaker: '嫑嫑', avatar: 'nono', text: '哇！它说话了！而且说得好大声！' },
        { speaker: '可可', avatar: 'cocoa', text: '你要走了吗？我们才刚刚认识你……' },
        { speaker: '🐙 章鱼', emoji: '🐙', text: '我必须返回星辰大海了，前方有人在等我。可可宇宙的深处……有一场更大的风暴正在酝酿。' },
        { speaker: '嫑嫑', avatar: 'nono', text: '等等！你说的风暴是什么？我们要怎么帮你？' },
        { speaker: '🐙 章鱼', emoji: '🐙', text: '当你仰望星空时，我会在某个星球上为你们点亮一盏灯。' },
        { speaker: '可可', avatar: 'cocoa', text: '那……我们会再见面吗？' },
        { speaker: '🐙 章鱼', emoji: '🐙', text: '好好成长吧，你们还有很长的路要走……' },
        { speaker: '🐙 章鱼', emoji: '🐙', text: '当九颗星辰连成一线，那扇门就会打开，到时候……我会在那里等你们。' },
        { speaker: '嫑嫑', avatar: 'nono', text: '可可，我怎么觉得有点想哭……' },
        { speaker: '可可', avatar: 'cocoa', text: '我也是……' },
        { speaker: '🐙✨ 章鱼', emoji: '🐙', text: '🌟 再见了，可可。再见了，嫑嫑。我们的故事……才刚刚开始。' }
    ];
    if (typeof window.playCustomStory === 'function') {
        window.playCustomStory(nodes, function() {
            var sysMsg = document.createElement('div');
            sysMsg.style.cssText = 'position:fixed;bottom:30%;left:50%;transform:translateX(-50%);z-index:9999;background:rgba(0,0,0,0.8);color:rgba(0,200,255,0.3);padding:12px 28px;border-radius:40px;font-size:1rem;font-weight:300;letter-spacing:2px;border:1px solid rgba(0,200,255,0.05);text-align:center;animation:fadeInUp 0.8s ease;pointer-events:none;';
            sysMsg.innerHTML = '🌠 章鱼缓缓升向天空，化作一道流光，消失在星海深处……<br><span style="font-size:1rem;color:rgba(0,200,255,0.15);">✨ 未完待续 ...</span>';
            document.body.appendChild(sysMsg);
            if (typeof randomFireworks === 'function') randomFireworks(6);
            setTimeout(function() {
                sysMsg.style.opacity = '0';
                sysMsg.style.transition = 'opacity 2s';
                setTimeout(function() { sysMsg.remove(); }, 2000);
                if (typeof onComplete === 'function') onComplete();
            }, 4000);
        });
    } else {
        showFallbackDialogue(nodes, onComplete);
    }
}

// ============================================================
// 投喂章鱼（包含100%完成检测 + 黑暗料理反应）
// ============================================================
function feedOctopus(foodId) {
    var backpack = getBackpack();
    var count = backpack[foodId] || 0;
    if (count <= 0) { showToast('❌ 背包中没有这种食物', 1500); return; }
    var newCount = count - 1;
    var bp = getBackpack();
    bp[foodId] = newCount;
    saveBackpack(bp);
    var data = addFeedRecord(foodId);
    var totalFed = data.totalCount;
    var uniqueFed = getUniqueFedCount();
    window._lastFedFood = foodId;
    var foodName = foodId;
    if (foodId === 'dark_cuisine') foodName = '黑暗料理';
    else if (typeof window.PANINI_RECIPES !== 'undefined') {
        for (var i = 0; i < window.PANINI_RECIPES.length; i++) {
            if (window.PANINI_RECIPES[i].id === foodId) { foodName = window.PANINI_RECIPES[i].name; break; }
        }
    }
    updateNomoDialogue();
    updateNomoStats();
    var dialogueEl = document.getElementById('nomoDialogueText');
    if (dialogueEl) dialogueEl.textContent = getNomoDialogue();
    var interactEl = document.getElementById('interactCountDisplay');
    if (interactEl) interactEl.textContent = totalFed + 1;
    var totalEl = document.getElementById('totalFedDisplay');
    if (totalEl) totalEl.textContent = totalFed;
    var uniqueEl = document.getElementById('uniqueFedDisplay');
    if (uniqueEl) uniqueEl.textContent = uniqueFed;
    var progressEl = document.getElementById('progressDisplay');
    if (progressEl) progressEl.textContent = Math.min(100, Math.round((totalFed / 92) * 100)) + '%';
    if (totalFed >= 92 && uniqueFed >= 29) {
        setNomoCompleted();
        showToast('🐙✨ 能量核心完全激活！开始唤醒星际信使...', 2000);
        setTimeout(function() {
            playNomoCompletionStory(function() {
                var current = getCurrentRegion();
                if (current && current.id === 'nomo_ocean') {
                    var selected = getRegion(selectedRegionId);
                    var targetRegion = (selected && selected.id !== 'nomo_ocean') ? selected : null;
                    renderNomoOceanPanel(document.getElementById('infoMode'), targetRegion);
                }
                if (typeof randomFireworks === 'function') randomFireworks(6);
                showToast('🌠 章鱼已回归星辰大海... 未完待续', 3000);
            });
        }, 800);
        renderFeedGrid();
        if (typeof checkAchievements === 'function') { setTimeout(function() { checkAchievements(); }, 300); }
        return;
    }
    if (totalFed % 5 === 0) showToast('🐙 投喂成功！(' + totalFed + '/92)', 2000);
    else showToast('🍽️ 投喂 ' + foodName + ' 成功！(' + totalFed + '/92)', 1500);
    renderFeedGrid();
    if (typeof checkAchievements === 'function') { setTimeout(function() { checkAchievements(); }, 300); }
}

// ============================================================
// 投喂网格渲染函数（带已投喂标记 + 黑暗料理）
// ============================================================
function renderFeedGrid() {
    var grid = document.getElementById('nomoFeedGrid');
    if (!grid) return;
    var foods = [];
    var backpack = getBackpack();
    if (typeof window.PANINI_RECIPES !== 'undefined' && window.PANINI_RECIPES.length > 0) {
        window.PANINI_RECIPES.forEach(function(r) {
            var count = backpack[r.id] || 0;
            var fedCount = getFedFoodCount(r.id);
            foods.push({ id: r.id, name: r.name, icon: r.icon, count: count, fedCount: fedCount, hasFood: count > 0, hasBeenFed: fedCount > 0 });
        });
    }
    var darkCuisineCount = backpack['dark_cuisine'] || 0;
    var darkFedCount = getFedFoodCount('dark_cuisine');
    foods.push({ id: 'dark_cuisine', name: '黑暗料理', icon: '💀', count: darkCuisineCount, fedCount: darkFedCount, hasFood: darkCuisineCount > 0, hasBeenFed: darkFedCount > 0 });
    foods.sort(function(a, b) {
        if (a.count > 0 && b.count === 0) return -1;
        if (a.count === 0 && b.count > 0) return 1;
        if (a.hasBeenFed && !b.hasBeenFed) return -1;
        if (!a.hasBeenFed && b.hasBeenFed) return 1;
        return a.name.localeCompare(b.name);
    });
    var hasAnyFood = false;
    for (var i = 0; i < foods.length; i++) { if (foods[i].count > 0) { hasAnyFood = true; break; } }
    if (foods.length === 0 || !hasAnyFood) {
        grid.innerHTML = '<div class="nomo-feed-empty">🍳 还没有食物，去帕尼尼大陆烹饪吧！</div>';
        return;
    }
    var html = '';
    for (var i = 0; i < foods.length; i++) {
        var f = foods[i];
        var disabled = f.count === 0 ? 'disabled' : '';
        var fedClass = f.hasBeenFed ? 'fed' : '';
        var checkMark = f.hasBeenFed ? '✅' : '';
        html += '<div class="nomo-feed-item ' + disabled + ' ' + fedClass + '" onclick="feedOctopus(\'' + f.id + '\')" title="' + f.name + ' (已投喂' + f.fedCount + '次)">';
        html += '  <span class="icon">' + f.icon + '</span>';
        html += '  <div class="name">' + f.name + '</div>';
        html += '  <div class="count">×' + f.count + ' | 已喂' + f.fedCount + '</div>';
        html += '  <div class="fed-badge">' + checkMark + '</div>';
        html += '</div>';
    }
    grid.innerHTML = html;
}

// ============================================================
// 打开/关闭投喂模态框（暴露全局）
// ============================================================
function openFeedModal() {
    var modal = document.getElementById('nomoFeedModal');
    if (!modal) return;
    renderFeedGrid();
    modal.style.display = 'flex';
}
function closeFeedModal() {
    var modal = document.getElementById('nomoFeedModal');
    if (modal) modal.style.display = 'none';
}

// ============================================================
// 嫑界洋 · 赛博机器章鱼怪物面板（包含完成状态 + 暖色投喂面板）
// ============================================================
function renderNomoOceanPanel(infoMode, targetRegion) {
    infoMode.innerHTML = '';
    infoMode.style.cssText = 'position:relative;padding:0;overflow:hidden;border:none;background:transparent;';

    if (getNomoCompleted()) {
        renderNomoCompletedPanel(infoMode, targetRegion);
        return;
    }

    if (!document.getElementById('nomoOceanStyle')) {
        var style = document.createElement('style');
        style.id = 'nomoOceanStyle';
        style.textContent = `
            .nomo-panel {
                position: relative;
                width: 100%;
                height: 100%;
                border-radius: 16px;
                overflow: hidden;
                background: linear-gradient(180deg, #0a1628 0%, #0d1f3a 30%, #0a2a4a 55%, #061a2e 80%, #020d1a 100%);
                border: 2px solid rgba(0, 180, 255, 0.15);
                box-shadow: 0 0 60px rgba(0, 180, 255, 0.05), inset 0 0 80px rgba(0, 0, 0, 0.4);
                display: flex;
                flex-direction: column;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }
            .nomo-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 18px 6px 18px;
                border-bottom: 1px solid rgba(0, 200, 255, 0.06);
                flex-shrink: 0;
                z-index: 20;
                position: relative;
            }
            .nomo-title {
                font-size: 1.05rem;
                font-weight: 700;
                color: #8ab8d0;
                text-shadow: 0 0 30px rgba(0, 180, 255, 0.05);
                letter-spacing: 1px;
            }
            .nomo-title span { color: #00ccff; }
            .nomo-travel-btn-header {
                background: #6f9e3f;
                border: none;
                border-radius: 30px;
                padding: 5px 16px;
                color: white;
                font-weight: bold;
                cursor: pointer;
                font-size: 0.7rem;
                transition: 0.15s;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                white-space: nowrap;
                flex-shrink: 0;
            }
            .nomo-travel-btn-header:hover { background: #5a8a2a; transform: scale(1.02); }
            .nomo-travel-btn-header:active { transform: scale(0.95); }
            .nomo-main-content {
                flex: 1;
                position: relative;
                overflow: hidden;
                min-height: 0;
                display: flex;
                flex-direction: column;
            }
            .nomo-ocean {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 45%;
                overflow: hidden;
                pointer-events: none;
                z-index: 1;
            }
            .nomo-wave {
                position: absolute;
                bottom: 0;
                left: -50%;
                width: 200%;
                height: 100%;
                background: repeating-linear-gradient(90deg, transparent 0px, rgba(0, 180, 255, 0.02) 40px, transparent 80px, rgba(0, 150, 255, 0.015) 120px, transparent 160px);
                border-radius: 50% 50% 0 0 / 30% 30% 0 0;
                animation: nomoWaveMove 6s ease-in-out infinite alternate;
            }
            .nomo-wave:nth-child(2) { animation-duration: 8s; animation-delay: -2s; background: repeating-linear-gradient(90deg, transparent 0px, rgba(0, 200, 255, 0.015) 50px, transparent 100px); }
            .nomo-wave:nth-child(3) { animation-duration: 10s; animation-delay: -4s; background: repeating-linear-gradient(90deg, transparent 0px, rgba(100, 200, 255, 0.01) 30px, transparent 70px); }
            @keyframes nomoWaveMove {
                0% { transform: translateX(0) scaleY(0.6); }
                50% { transform: translateX(15%) scaleY(1); }
                100% { transform: translateX(-10%) scaleY(0.8); }
            }
            .nomo-water-light {
                position: absolute;
                bottom: 20%;
                left: 10%;
                width: 300px;
                height: 50px;
                background: radial-gradient(ellipse at center, rgba(0, 200, 255, 0.04), transparent 70%);
                border-radius: 50%;
                animation: nomoLightPulse 4s ease-in-out infinite;
                pointer-events: none;
                z-index: 2;
            }
            .nomo-water-light:nth-child(5) { left: 60%; bottom: 30%; animation-delay: -1.5s; width: 200px; }
            @keyframes nomoLightPulse {
                0%, 100% { opacity: 0.4; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.3); }
            }
            .nomo-octopus-row {
                position: relative;
                z-index: 5;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                padding: 0 20px;
                flex: 1;
                min-height: 0;
            }
            .nomo-cyber-octopus {
                flex-shrink: 0;
                width: 220px;
                height: 220px;
                position: relative;
            }
            .nomo-feed-btn {
                position: absolute;
                left: 70%;
                top: 50%;
                transform: translateY(-50%);
                background: linear-gradient(135deg, rgba(0, 200, 255, 0.12), rgba(0, 80, 160, 0.05));
                border: 2px solid rgba(0, 200, 255, 0.15);
                border-radius: 30px;
                padding: 10px 28px;
                color: #66ccdd;
                font-weight: 700;
                cursor: pointer;
                font-size: 0.9rem;
                transition: 0.2s;
                text-shadow: 0 0 20px rgba(0, 200, 255, 0.02);
                letter-spacing: 0.5px;
                font-family: 'Courier New', monospace;
                pointer-events: auto;
                white-space: nowrap;
                z-index: 10;
            }
            .nomo-feed-btn:hover {
                background: linear-gradient(135deg, rgba(0, 200, 255, 0.2), rgba(0, 80, 160, 0.08));
                border-color: rgba(0, 200, 255, 0.25);
                transform: translateY(-50%) scale(1.05);
                box-shadow: 0 0 30px rgba(0, 200, 255, 0.06);
                color: #88ddff;
            }
            .nomo-feed-btn:active { transform: scale(0.95); }
            .nomo-feed-btn .btn-icon { font-size: 1.1rem; margin-right: 6px; }
            .nomo-neon-ring {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border-radius: 50%;
                border: 1px solid transparent;
                pointer-events: none;
                z-index: 8;
            }
            .nomo-neon-ring-1 { width: 160px; height: 160px; border-color: rgba(0, 200, 255, 0.06); animation: nomoRingRotate 12s linear infinite; }
            .nomo-neon-ring-2 { width: 180px; height: 180px; border-color: rgba(0, 200, 255, 0.03); animation: nomoRingRotate 15s linear infinite reverse; }
            .nomo-neon-ring-3 { width: 140px; height: 140px; border-color: rgba(0, 200, 255, 0.04); animation: nomoRingRotate 10s linear infinite; }
            @keyframes nomoRingRotate {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
            .nomo-tentacles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                pointer-events: none;
            }
            .nomo-tentacle {
                position: absolute;
                bottom: 0;
                width: 7px;
                transform-origin: bottom center;
                pointer-events: none;
            }
            .nomo-tentacle .seg {
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 100%;
                height: 12px;
                background: linear-gradient(180deg, #2a4a6a, #1a2a4a);
                border-radius: 4px 4px 2px 2px;
                border: 1px solid rgba(0, 200, 255, 0.08);
                box-shadow: inset 0 2px 4px rgba(0, 200, 255, 0.02);
            }
            .nomo-tentacle .seg::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                right: 2px;
                height: 3px;
                background: repeating-linear-gradient(90deg, rgba(0, 200, 255, 0.05) 0px, rgba(0, 200, 255, 0.05) 2px, transparent 2px, transparent 5px);
                border-radius: 2px;
            }
            .nomo-tentacle .tip {
                position: absolute;
                bottom: -4px;
                left: 50%;
                transform: translateX(-50%);
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: radial-gradient(circle at center, rgba(0, 200, 255, 0.15), transparent 70%);
                animation: nomoTipGlow 2s ease-in-out infinite;
            }
            @keyframes nomoTipGlow {
                0%, 100% { opacity: 0.3; transform: translateX(-50%) scale(0.8); }
                50% { opacity: 0.8; transform: translateX(-50%) scale(1.2); }
            }
            .nomo-tentacle-1 { left: 16%; height: 80px; animation: nomoTent1 3.5s ease-in-out infinite; }
            .nomo-tentacle-2 { left: 27%; height: 95px; animation: nomoTent2 4s ease-in-out infinite; }
            .nomo-tentacle-3 { left: 39%; height: 85px; animation: nomoTent3 3.8s ease-in-out infinite; }
            .nomo-tentacle-4 { right: 39%; height: 85px; animation: nomoTent4 3.8s ease-in-out infinite; }
            .nomo-tentacle-5 { right: 27%; height: 95px; animation: nomoTent5 4s ease-in-out infinite; }
            .nomo-tentacle-6 { right: 16%; height: 80px; animation: nomoTent6 3.5s ease-in-out infinite; }
            @keyframes nomoTent1 { 0%, 100% { transform: rotate(-15deg) scaleY(1); } 50% { transform: rotate(-25deg) scaleY(1.05); } }
            @keyframes nomoTent2 { 0%, 100% { transform: rotate(-5deg) scaleY(1); } 50% { transform: rotate(-12deg) scaleY(1.03); } }
            @keyframes nomoTent3 { 0%, 100% { transform: rotate(5deg) scaleY(1); } 50% { transform: rotate(12deg) scaleY(1.03); } }
            @keyframes nomoTent4 { 0%, 100% { transform: rotate(-5deg) scaleY(1); } 50% { transform: rotate(-12deg) scaleY(1.03); } }
            @keyframes nomoTent5 { 0%, 100% { transform: rotate(5deg) scaleY(1); } 50% { transform: rotate(12deg) scaleY(1.03); } }
            @keyframes nomoTent6 { 0%, 100% { transform: rotate(15deg) scaleY(1); } 50% { transform: rotate(25deg) scaleY(1.05); } }
            .nomo-body {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background: radial-gradient(ellipse at 45% 35%, #4a6a8a, #1a2a4a 60%, #0a1a2a 100%);
                border: 2px solid rgba(0, 200, 255, 0.2);
                box-shadow: 0 0 40px rgba(0, 180, 255, 0.1), inset 0 0 60px rgba(0, 200, 255, 0.05), inset 0 -30px 60px rgba(0, 0, 0, 0.3);
                z-index: 10;
            }
            .nomo-body::before {
                content: '';
                position: absolute;
                top: 10%;
                left: 15%;
                width: 60%;
                height: 40%;
                background: radial-gradient(ellipse at center, rgba(200, 220, 255, 0.06), transparent 70%);
                border-radius: 50%;
                pointer-events: none;
            }
            .nomo-body::after {
                content: '';
                position: absolute;
                bottom: 15%;
                left: 25%;
                width: 50%;
                height: 12px;
                background: repeating-linear-gradient(90deg, rgba(0, 200, 255, 0.1) 0px, rgba(0, 200, 255, 0.1) 3px, transparent 3px, transparent 8px);
                border-radius: 4px;
                pointer-events: none;
                opacity: 0.6;
            }
            .nomo-core {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: radial-gradient(circle at center, #00d4ff, #0066cc 60%, #003366 100%);
                box-shadow: 0 0 30px rgba(0, 200, 255, 0.3), 0 0 60px rgba(0, 200, 255, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.1);
                animation: nomoCorePulse 2s ease-in-out infinite;
                z-index: 12;
            }
            .nomo-core::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: radial-gradient(circle at center, #ffffff, #00ccff 40%, transparent 70%);
                animation: nomoCoreInner 1.5s ease-in-out infinite;
            }
            @keyframes nomoCorePulse {
                0%, 100% { box-shadow: 0 0 30px rgba(0, 200, 255, 0.2), 0 0 60px rgba(0, 200, 255, 0.05); }
                50% { box-shadow: 0 0 50px rgba(0, 200, 255, 0.5), 0 0 100px rgba(0, 200, 255, 0.15); }
            }
            @keyframes nomoCoreInner {
                0%, 100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.7; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            }
            .nomo-eye {
                position: absolute;
                width: 18px;
                height: 14px;
                border-radius: 50%;
                background: radial-gradient(ellipse at center, #0a1a2a, #000000);
                border: 2px solid rgba(0, 200, 255, 0.15);
                box-shadow: inset 0 0 20px rgba(0, 200, 255, 0.05);
                z-index: 15;
                overflow: hidden;
            }
            .nomo-eye::after {
                content: '';
                position: absolute;
                top: 20%;
                left: 15%;
                width: 40%;
                height: 40%;
                background: radial-gradient(ellipse at center, #00ccff, transparent);
                border-radius: 50%;
                animation: nomoEyeGlow 3s ease-in-out infinite;
            }
            .nomo-eye-left { top: 28%; left: 14%; transform: rotate(-5deg); }
            .nomo-eye-right { top: 28%; right: 14%; transform: rotate(5deg); }
            .nomo-pupil {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 5px;
                height: 5px;
                border-radius: 50%;
                background: radial-gradient(circle at center, #ff4444, #aa0000);
                box-shadow: 0 0 12px rgba(255, 0, 0, 0.3);
                animation: nomoPupilScan 4s ease-in-out infinite;
            }
            @keyframes nomoEyeGlow {
                0%, 100% { opacity: 0.3; transform: scale(0.8); }
                50% { opacity: 0.8; transform: scale(1.2); }
            }
            @keyframes nomoPupilScan {
                0%, 100% { transform: translate(-50%, -50%) translateX(-3px); }
                50% { transform: translate(-50%, -50%) translateX(3px); }
            }
            .nomo-dialogue-wrapper {
                position: relative;
                z-index: 20;
                width: 78%;
                max-width: 460px;
                margin: 2px auto 0 auto;
                pointer-events: none;
                flex-shrink: 0;
            }
            .nomo-dialogue-bubble {
                background: rgba(0, 16, 32, 0.85);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(0, 200, 255, 0.06);
                border-radius: 14px;
                padding: 10px 18px;
                text-align: center;
                color: rgba(200, 230, 255, 0.7);
                font-size: 0.82rem;
                line-height: 1.6;
                box-shadow: 0 0 40px rgba(0, 200, 255, 0.01);
                animation: nomoBubblePop 0.5s ease;
                pointer-events: auto;
            }
            .nomo-dialogue-bubble .speaker {
                color: rgba(0, 200, 255, 0.2);
                font-size: 0.55rem;
                letter-spacing: 2px;
                margin-bottom: 2px;
                text-transform: uppercase;
                font-weight: 600;
            }
            .nomo-dialogue-bubble .speaker .highlight { color: rgba(0, 200, 255, 0.4); font-size: 0.6rem; }
            .nomo-dialogue-bubble .dialogue-text { min-height: 1.6em; }
            .nomo-dialogue-bubble .dialogue-footer {
                font-size: 0.6rem;
                color: rgba(0, 200, 255, 0.15);
                margin-top: 2px;
                border-top: 1px solid rgba(0, 200, 255, 0.03);
                padding-top: 4px;
                letter-spacing: 0.5px;
            }
            .nomo-dialogue-bubble .dialogue-footer strong { color: rgba(0, 200, 255, 0.25); }
            @keyframes nomoBubblePop {
                0% { transform: scale(0.92); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
            .nomo-bottom-stats {
                position: relative;
                z-index: 20;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 24px;
                padding: 6px 0 6px 0;
                flex-shrink: 0;
                flex-wrap: wrap;
                border-top: 1px solid rgba(0, 200, 255, 0.03);
                margin-top: auto;
            }
            .nomo-stats {
                display: flex;
                gap: 24px;
                font-size: 0.85rem;
                color: rgba(255, 255, 255, 0.25);
                flex-wrap: wrap;
                font-family: 'Courier New', monospace;
                letter-spacing: 0.5px;
            }
            .nomo-stats strong { color: rgba(0, 200, 255, 0.5); font-weight: 700; font-size: 0.95rem; }

            /* ---- 投喂模态框（暖色木纹方案） ---- */
            .nomo-feed-modal {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 50;
                background: rgba(0, 0, 0, 0.5);
                display: none;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(4px);
                border-radius: 16px;
            }
            .nomo-feed-modal-content {
                max-width: 520px;
                width: 94%;
                max-height: 80%;
                background: linear-gradient(145deg, #f5ede4, #e8dccc);
                border: 2px solid #d4b898;
                border-radius: 20px;
                padding: 20px 22px;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                scrollbar-width: none;
                -ms-overflow-style: none;
            }
            .nomo-feed-modal-content::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
            }
            .nomo-feed-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(90, 46, 28, 0.08);
                margin-bottom: 12px;
                flex-shrink: 0;
            }
            .nomo-feed-modal-header h3 {
                margin: 0;
                color: #5a2e1c;
                font-size: 1.05rem;
                font-weight: 700;
                letter-spacing: 1px;
            }
            .nomo-feed-modal-close {
                background: rgba(90, 46, 28, 0.08);
                border: 1px solid rgba(90, 46, 28, 0.1);
                border-radius: 30px;
                padding: 2px 14px;
                color: #7b4a2a;
                cursor: pointer;
                font-size: 0.65rem;
                transition: 0.15s;
                line-height: 24px;
            }
            .nomo-feed-modal-close:hover {
                background: rgba(90, 46, 28, 0.15);
                color: #5a2e1c;
            }
            .nomo-feed-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
                padding-bottom: 2px;
            }
            .nomo-feed-item {
                background: rgba(255, 255, 255, 0.5);
                border: 1px solid rgba(90, 46, 28, 0.06);
                border-radius: 12px;
                padding: 10px 4px;
                text-align: center;
                cursor: pointer;
                transition: 0.15s;
                position: relative;
            }
            .nomo-feed-item:hover:not(.disabled) {
                background: rgba(255, 255, 255, 0.7);
                border-color: rgba(90, 46, 28, 0.15);
                transform: scale(1.05);
            }
            .nomo-feed-item.disabled { opacity: 0.25; cursor: not-allowed; }
            .nomo-feed-item .icon { font-size: 1.7rem; display: block; margin-bottom: 2px; }
            .nomo-feed-item .name { font-size: 0.55rem; font-weight: 600; color: #5a2e1c; }
            .nomo-feed-item .count { font-size: 0.5rem; color: #8b6b4a; }
            .nomo-feed-item .fed-badge {
                position: absolute;
                top: 2px;
                right: 4px;
                font-size: 0.65rem;
                color: #2ecc71;
                font-weight: 700;
            }
            .nomo-feed-item.fed {
                border-color: rgba(46, 204, 113, 0.3);
                background: rgba(46, 204, 113, 0.08);
            }
            .nomo-feed-item:not(.fed) .fed-badge { display: none; }
            .nomo-feed-empty {
                text-align: center;
                padding: 30px 0;
                color: #8b6b4a;
                font-size: 0.8rem;
                grid-column: 1 / -1;
                letter-spacing: 0.5px;
            }
            .feed-footer-hint {
                margin-top: 10px;
                font-size: 0.5rem;
                color: #8b6b4a;
                text-align: center;
                opacity: 0.4;
                border-top: 1px solid rgba(90, 46, 28, 0.06);
                padding-top: 8px;
                letter-spacing: 0.3px;
            }

            @media (max-width: 600px) {
                .nomo-panel { height: 500px; border-radius: 12px; }
                .nomo-cyber-octopus { width: 160px; height: 160px; }
                .nomo-body { width: 78px; height: 78px; }
                .nomo-core { width: 22px; height: 22px; }
                .nomo-core::after { width: 10px; height: 10px; }
                .nomo-eye { width: 14px; height: 11px; }
                .nomo-eye-left { top: 26%; left: 12%; }
                .nomo-eye-right { top: 26%; right: 12%; }
                .nomo-pupil { width: 4px; height: 4px; }
                .nomo-tentacle { width: 5px; }
                .nomo-tentacle .seg { height: 10px; }
                .nomo-tentacle-1 { height: 60px; left: 14%; }
                .nomo-tentacle-2 { height: 72px; left: 25%; }
                .nomo-tentacle-3 { height: 64px; left: 37%; }
                .nomo-tentacle-4 { height: 64px; right: 37%; }
                .nomo-tentacle-5 { height: 72px; right: 25%; }
                .nomo-tentacle-6 { height: 60px; right: 14%; }
                .nomo-neon-ring-1 { width: 120px; height: 120px; }
                .nomo-neon-ring-2 { width: 135px; height: 135px; }
                .nomo-neon-ring-3 { width: 105px; height: 105px; }
                .nomo-title { font-size: 0.9rem; }
                .nomo-header { padding: 8px 14px 6px 14px; }
                .nomo-dialogue-wrapper { width: 88%; }
                .nomo-dialogue-bubble { font-size: 0.7rem; padding: 6px 14px; }
                .nomo-dialogue-bubble .speaker { font-size: 0.5rem; }
                .nomo-dialogue-bubble .speaker .highlight { font-size: 0.55rem; }
                .nomo-dialogue-bubble .dialogue-footer { font-size: 0.5rem; }
                .nomo-feed-btn { font-size: 0.75rem; padding: 8px 20px; left: 68%; }
                .nomo-travel-btn-header { font-size: 0.6rem; padding: 4px 12px; }
                .nomo-stats { font-size: 0.7rem; gap: 14px; }
                .nomo-stats strong { font-size: 0.8rem; }
                .nomo-bottom-stats { padding: 4px 0 4px 0; gap: 12px; }
                .nomo-feed-modal-content { max-width: 95%; padding: 14px 16px; }
                .nomo-feed-grid { grid-template-columns: repeat(3, 1fr); }
                .nomo-feed-modal-header h3 { font-size: 0.9rem; }
                .nomo-water-light { width: 200px; height: 40px; }
                .nomo-water-light:nth-child(5) { width: 140px; }
            }
            @media (max-width: 400px) {
                .nomo-panel { height: 420px; border-radius: 10px; }
                .nomo-cyber-octopus { width: 130px; height: 130px; }
                .nomo-body { width: 62px; height: 62px; }
                .nomo-core { width: 18px; height: 18px; }
                .nomo-core::after { width: 8px; height: 8px; }
                .nomo-eye { width: 12px; height: 9px; }
                .nomo-eye-left { top: 24%; left: 10%; }
                .nomo-eye-right { top: 24%; right: 10%; }
                .nomo-pupil { width: 3px; height: 3px; }
                .nomo-tentacle { width: 4px; }
                .nomo-tentacle .seg { height: 8px; }
                .nomo-tentacle-1 { height: 48px; left: 12%; }
                .nomo-tentacle-2 { height: 58px; left: 23%; }
                .nomo-tentacle-3 { height: 52px; left: 35%; }
                .nomo-tentacle-4 { height: 52px; right: 35%; }
                .nomo-tentacle-5 { height: 58px; right: 23%; }
                .nomo-tentacle-6 { height: 48px; right: 12%; }
                .nomo-neon-ring-1 { width: 96px; height: 96px; }
                .nomo-neon-ring-2 { width: 110px; height: 110px; }
                .nomo-neon-ring-3 { width: 84px; height: 84px; }
                .nomo-title { font-size: 0.75rem; }
                .nomo-header { padding: 6px 10px 4px 10px; }
                .nomo-dialogue-wrapper { width: 94%; }
                .nomo-dialogue-bubble { font-size: 0.6rem; padding: 4px 12px; border-radius: 10px; }
                .nomo-dialogue-bubble .speaker { font-size: 0.4rem; }
                .nomo-dialogue-bubble .speaker .highlight { font-size: 0.45rem; }
                .nomo-dialogue-bubble .dialogue-footer { font-size: 0.4rem; }
                .nomo-feed-btn { font-size: 0.6rem; padding: 6px 14px; left: 65%; }
                .nomo-travel-btn-header { font-size: 0.5rem; padding: 3px 10px; }
                .nomo-stats { font-size: 0.55rem; gap: 10px; }
                .nomo-stats strong { font-size: 0.65rem; }
                .nomo-bottom-stats { padding: 3px 0 3px 0; gap: 8px; }
                .nomo-water-light { width: 120px; height: 25px; }
                .nomo-water-light:nth-child(5) { width: 80px; }
                .nomo-feed-grid { grid-template-columns: repeat(2, 1fr); }
                .nomo-feed-modal-content { padding: 10px 12px; }
                .nomo-feed-modal-header h3 { font-size: 0.75rem; }
                .nomo-feed-item .icon { font-size: 1.3rem; }
                .nomo-feed-item .name { font-size: 0.45rem; }
            }
        `;
        document.head.appendChild(style);
    }

    var totalFed = getTotalFedCount();
    var uniqueFed = getUniqueFedCount();
    var dialogue = getNomoDialogue();

    var showTravelBtn = false;
    var travelTargetId = '';
    if (targetRegion && targetRegion.id !== 'nomo_ocean' && targetRegion.status !== 'locked') {
        showTravelBtn = true;
        travelTargetId = targetRegion.id;
    }

    var html = '';
    html += '<div class="nomo-panel">';
    html += '  <div class="nomo-header">';
    html += '    <div class="nomo-title">🌊 嫑界洋 · <span>深海巨兽</span></div>';
    if (showTravelBtn) {
        html += '    <button class="nomo-travel-btn-header" onclick="startTravelFromNomo(\'' + travelTargetId + '\')">🚢 航行</button>';
    } else {
        html += '    <div style="width:80px;"></div>';
    }
    html += '  </div>';

    html += '  <div class="nomo-main-content">';
    html += '    <div class="nomo-ocean">';
    html += '      <div class="nomo-wave"></div><div class="nomo-wave"></div><div class="nomo-wave"></div>';
    html += '      <div class="nomo-water-light"></div><div class="nomo-water-light"></div>';
    html += '    </div>';

    html += '    <div class="nomo-dialogue-wrapper">';
    html += '      <div class="nomo-dialogue-bubble" id="nomoDialogueBubble">';
    html += '        <div class="speaker">🐙 <span class="highlight">塞壬·零式</span> · 第 <span class="highlight" id="interactCountDisplay">' + (totalFed + 1) + '</span> 次交互</div>';
    html += '        <div class="dialogue-text" id="nomoDialogueText">' + dialogue + '</div>';
    html += '        <div class="dialogue-footer">💡 <strong>警告</strong> · 检测到能量波动 · 投喂食物可安抚巨兽</div>';
    html += '      </div>';
    html += '    </div>';

    html += '    <div class="nomo-octopus-row">';
    html += '      <div class="nomo-cyber-octopus">';
    html += '        <div class="nomo-neon-ring nomo-neon-ring-1"></div>';
    html += '        <div class="nomo-neon-ring nomo-neon-ring-2"></div>';
    html += '        <div class="nomo-neon-ring nomo-neon-ring-3"></div>';
    html += '        <div class="nomo-tentacles">';
    for (var i = 1; i <= 6; i++) {
        var segCount = i <= 2 ? 9 : (i <= 4 ? 8 : 7);
        html += '          <div class="nomo-tentacle nomo-tentacle-' + i + '">';
        for (var j = 0; j < segCount; j++) {
            var h = 12 - j * 0.5;
            var btm = j * 12 + (j > 0 ? 2 : 0);
            html += '            <div class="seg" style="height:' + h + 'px;bottom:' + btm + 'px;"></div>';
        }
        html += '            <div class="tip"></div>';
        html += '          </div>';
    }
    html += '        </div>';
    html += '        <div class="nomo-body">';
    html += '          <div class="nomo-core"></div>';
    html += '          <div class="nomo-eye nomo-eye-left"><div class="nomo-pupil"></div></div>';
    html += '          <div class="nomo-eye nomo-eye-right"><div class="nomo-pupil"></div></div>';
    html += '        </div>';
    html += '      </div>';
    html += '      <button class="nomo-feed-btn" id="nomoFeedBtn" onclick="openFeedModal()">';
    html += '        <span class="btn-icon">🍽️</span> 投喂';
    html += '      </button>';
    html += '    </div>';

    var progress = Math.min(100, Math.round((totalFed / 92) * 100));
    html += '    <div class="nomo-bottom-stats">';
    html += '      <div class="nomo-stats" id="nomoStats">';
    html += '        <span>🍽️ 已投喂 <strong id="totalFedDisplay">' + totalFed + '</strong> 份</span>';
    html += '        <span>🧩 种类 <strong id="uniqueFedDisplay">' + uniqueFed + '</strong>/29</span>';
    html += '        <span>🎯 进度 <strong id="progressDisplay">' + progress + '%</strong></span>';
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';

    html += '  <div class="nomo-feed-modal" id="nomoFeedModal" onclick="if(event.target===this)closeFeedModal()">';
    html += '    <div class="nomo-feed-modal-content">';
    html += '      <div class="nomo-feed-modal-header">';
    html += '        <h3>🍽️ 选择食物投喂</h3>';
    html += '        <button class="nomo-feed-modal-close" onclick="closeFeedModal()">✕ 关闭</button>';
    html += '      </div>';
    html += '      <div id="nomoFeedGrid" class="nomo-feed-grid">';
    html += '        <div class="nomo-feed-empty">⚡ 加载中...</div>';
    html += '      </div>';
    html += '      <div class="feed-footer-hint">💡 点击食物投喂 · ✅ 已投喂过 · 灰色表示库存不足</div>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    infoMode.innerHTML = html;
    infoMode.style.display = 'flex';

    setTimeout(function() { renderFeedGrid(); }, 50);
}

// ============================================================
// 章鱼完成状态面板
// ============================================================
function renderNomoCompletedPanel(infoMode, targetRegion) {
    if (!document.getElementById('nomoCompletedStyle')) {
        var style = document.createElement('style');
        style.id = 'nomoCompletedStyle';
        style.textContent = `
            .nomo-completed-panel {
                position: relative;
                width: 100%;
                height: 100%;
                border-radius: 16px;
                overflow: hidden;
                background: linear-gradient(180deg, #0a1628 0%, #0d1f3a 30%, #0a2a4a 55%, #061a2e 80%, #020d1a 100%);
                border: 2px solid rgba(0, 180, 255, 0.15);
                box-shadow: 0 0 60px rgba(0, 180, 255, 0.05), inset 0 0 80px rgba(0, 0, 0, 0.4);
                display: flex;
                flex-direction: column;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }
            .nomo-completed-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 18px 6px 18px;
                border-bottom: 1px solid rgba(0, 200, 255, 0.06);
                flex-shrink: 0;
                z-index: 20;
                position: relative;
            }
            .nomo-completed-title {
                font-size: 1.05rem;
                font-weight: 700;
                color: #8ab8d0;
                text-shadow: 0 0 30px rgba(0, 180, 255, 0.05);
                letter-spacing: 1px;
            }
            .nomo-completed-title span { color: #00ccff; }
            .nomo-completed-travel-btn {
                background: #6f9e3f;
                border: none;
                border-radius: 30px;
                padding: 5px 16px;
                color: white;
                font-weight: bold;
                cursor: pointer;
                font-size: 0.7rem;
                transition: 0.15s;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                white-space: nowrap;
                flex-shrink: 0;
            }
            .nomo-completed-travel-btn:hover { background: #5a8a2a; transform: scale(1.02); }
            .nomo-completed-body {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 20px;
                position: relative;
                z-index: 2;
            }
            .nomo-completed-body .depart-icon {
                font-size: 4rem;
                opacity: 0.2;
                animation: nomoDepartFloat 3s ease-in-out infinite;
            }
            @keyframes nomoDepartFloat {
                0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
                50% { transform: translateY(-8px) scale(1.05); opacity: 0.3; }
            }
            .nomo-completed-body .depart-text {
                font-size: 1.2rem;
                color: rgba(0, 200, 255, 0.25);
                font-weight: 300;
                letter-spacing: 2px;
                text-align: center;
            }
            .nomo-completed-body .depart-sub {
                font-size: 0.7rem;
                color: rgba(255, 255, 255, 0.08);
                max-width: 80%;
                text-align: center;
                line-height: 1.8;
                letter-spacing: 0.5px;
            }
            .nomo-completed-body .depart-end {
                font-size: 0.9rem;
                color: rgba(255, 255, 255, 0.05);
                margin-top: 4px;
                letter-spacing: 3px;
            }
            .nomo-completed-footer {
                position: absolute;
                bottom: 8px;
                left: 20px;
                right: 20px;
                text-align: center;
                font-size: 0.5rem;
                color: rgba(0, 200, 255, 0.04);
                border-top: 1px solid rgba(0, 200, 255, 0.01);
                padding-top: 6px;
                letter-spacing: 0.5px;
                pointer-events: none;
                z-index: 2;
            }
            .nomo-completed-footer strong { color: rgba(0, 200, 255, 0.08); }
            .nomo-completed-ocean {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 45%;
                overflow: hidden;
                pointer-events: none;
                z-index: 1;
            }
            .nomo-completed-ocean .wave {
                position: absolute;
                bottom: 0;
                left: -50%;
                width: 200%;
                height: 100%;
                background: repeating-linear-gradient(90deg, transparent 0px, rgba(0, 180, 255, 0.015) 40px, transparent 80px, rgba(0, 150, 255, 0.01) 120px, transparent 160px);
                border-radius: 50% 50% 0 0 / 30% 30% 0 0;
                animation: nomoWaveMove 6s ease-in-out infinite alternate;
            }
            .nomo-completed-ocean .wave:nth-child(2) { animation-duration: 8s; animation-delay: -2s; background: repeating-linear-gradient(90deg, transparent 0px, rgba(0, 200, 255, 0.01) 50px, transparent 100px); }
            .nomo-completed-ocean .wave:nth-child(3) { animation-duration: 10s; animation-delay: -4s; background: repeating-linear-gradient(90deg, transparent 0px, rgba(100, 200, 255, 0.008) 30px, transparent 70px); }
            .nomo-completed-light {
                position: absolute;
                bottom: 20%;
                left: 10%;
                width: 300px;
                height: 50px;
                background: radial-gradient(ellipse at center, rgba(0, 200, 255, 0.03), transparent 70%);
                border-radius: 50%;
                animation: nomoLightPulse 4s ease-in-out infinite;
                pointer-events: none;
                z-index: 1;
            }
            .nomo-completed-light:nth-child(5) { left: 60%; bottom: 30%; animation-delay: -1.5s; width: 200px; }
            @media (max-width: 600px) {
                .nomo-completed-body .depart-icon { font-size: 3rem; }
                .nomo-completed-body .depart-text { font-size: 1rem; }
                .nomo-completed-body .depart-sub { font-size: 0.6rem; }
                .nomo-completed-body .depart-end { font-size: 0.8rem; }
                .nomo-completed-title { font-size: 0.9rem; }
            }
            @media (max-width: 400px) {
                .nomo-completed-body .depart-icon { font-size: 2.4rem; }
                .nomo-completed-body .depart-text { font-size: 0.8rem; }
                .nomo-completed-body .depart-sub { font-size: 0.5rem; max-width: 95%; }
                .nomo-completed-body .depart-end { font-size: 0.7rem; }
                .nomo-completed-title { font-size: 0.75rem; }
                .nomo-completed-travel-btn { font-size: 0.5rem; padding: 3px 10px; }
            }
        `;
        document.head.appendChild(style);
    }

    var showTravelBtn = false;
    var travelTargetId = '';
    if (targetRegion && targetRegion.id !== 'nomo_ocean' && targetRegion.status !== 'locked') {
        showTravelBtn = true;
        travelTargetId = targetRegion.id;
    }

    var html = '';
    html += '<div class="nomo-completed-panel">';
    html += '  <div class="nomo-completed-header">';
    html += '    <div class="nomo-completed-title">🌊 嫑界洋 · <span>深海巨兽</span></div>';
    if (showTravelBtn) {
        html += '    <button class="nomo-completed-travel-btn" onclick="startTravelFromNomo(\'' + travelTargetId + '\')">🚢 航行</button>';
    } else {
        html += '    <div style="width:80px;"></div>';
    }
    html += '  </div>';

    html += '  <div class="nomo-completed-ocean">';
    html += '    <div class="wave"></div><div class="wave"></div><div class="wave"></div>';
    html += '    <div class="nomo-completed-light"></div><div class="nomo-completed-light"></div>';
    html += '  </div>';

    html += '  <div class="nomo-completed-body">';
    html += '    <div class="depart-icon">🐙</div>';
    html += '    <div class="depart-text">✨ 星际信使已回归星辰大海 ✨</div>';
    html += '    <div class="depart-sub">感谢你，勇敢的冒险者。<br>当九颗星辰连成一线，那扇门就会打开……</div>';
    html += '    <div class="depart-end">🌠 未完待续 ...</div>';
    html += '  </div>';

    html += '  <div class="nomo-completed-footer">';
    html += '    💡 <strong>星际信使</strong> · 已踏上归途 · 等待星辰之门再次开启';
    html += '  </div>';
    html += '</div>';

    infoMode.innerHTML = html;
    infoMode.style.display = 'flex';
}

// ============================================================
// 从嫑界洋航行到目标区域（由 travel.js 处理）
// ============================================================
function startTravelFromNomo(targetId) {
    if (window.travel && window.travel.isTraveling()) {
        showToast('⛵ 航行中，请等待到达', 1500);
        return;
    }
    var target = getRegion(targetId);
    if (!target) { showToast('❌ 目标区域不存在', 1500); return; }
    if (target.status === 'locked') { showToast('🔒 ' + target.name + ' 尚未解锁！', 2000); return; }
    if (target.status === 'current') { showToast('📍 已经在 ' + target.name + ' 了', 1500); return; }
    if (window.travel && window.travel.start) {
        window.travel.start(targetId);
    } else {
        showToast('❌ 航行系统未加载', 1500);
    }
}

function closeNomoOceanPanel() { window.location.href = 'index.html'; }

// ============================================================
// 藏宝图领取面板
// ============================================================
function showTreasureClaimPanel() {
    if (typeof treasureState === 'undefined' || !treasureState.hasCompleteMap) {
        showToast('❌ 没有可领取的宝藏', 1500);
        return;
    }
    var reward = window.previewTreasureReward ? window.previewTreasureReward() : null;
    if (!reward) { showToast('❌ 奖励生成失败，请重试', 1500); return; }

    var oldPanel = document.getElementById('treasureClaimPanel');
    if (oldPanel) oldPanel.remove();

    var panel = document.createElement('div');
    panel.id = 'treasureClaimPanel';
    panel.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

    var qualityIcon = reward.qualityIcon || '🟢';
    var qualityLabel = reward.qualityLabel || '普通';
    var qualityColor = reward.qualityColor || '#8b8b8b';

    var rewardsHtml = '';
    rewardsHtml += '<div class="treasure-reward-item"><span>⚓</span> 探险币 <strong>+' + reward.coins + '</strong></div>';
    rewardsHtml += '<div class="treasure-reward-item"><span>⭐</span> 声望 <strong>+' + reward.rep + '</strong></div>';
    if (reward.items && reward.items.length > 0) {
        reward.items.forEach(function(item) {
            rewardsHtml += '<div class="treasure-reward-item"><span>' + item.icon + '</span> ' + item.name + ' <strong>×' + item.amount + '</strong></div>';
        });
    }
    if (reward.energy) {
        var energyMap = { 'cheese_powder': '高塔芝士粉', 'inspiration_jelly': '灵感啫喱', 'mimi_seedling': '米米苗苗', 'time_pudding': '时光布丁', 'warm_butter': '温暖黄油', 'star_crystal': '星晶雪花' };
        var displayName = energyMap[reward.energy] || reward.energy;
        rewardsHtml += '<div class="treasure-reward-item"><span>🔋</span> 能量 <strong>' + displayName + ' ×1</strong></div>';
    }
    if (reward.special) {
        var special = reward.special;
        var label = special.icon + ' ' + special.name;
        if (special.amount) label += ' ×' + special.amount;
        rewardsHtml += '<div class="treasure-reward-item"><span>🎁</span> 特殊奖励 <strong>' + label + '</strong></div>';
    }
    if (reward.collectible) {
        rewardsHtml += '<div class="treasure-reward-item"><span>💎</span> 收藏品 <strong>' + reward.collectible.icon + ' ' + reward.collectible.name + '</strong></div>';
    }

    panel.innerHTML = `
        <div style="
            max-width: 420px;
            width: 92%;
            background: linear-gradient(145deg, #f5ede4, #e8dccc);
            border-radius: 32px;
            padding: 28px 24px 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            border: 2px solid ${qualityColor};
            position: relative;
            animation: slideUp 0.4s ease;
        ">
            <div style="text-align:center;margin-bottom:16px;">
                <div style="font-size:3.2rem;line-height:1;">${qualityIcon}</div>
                <div style="font-size:0.7rem;color:#8b6b4a;margin-top:4px;">品质</div>
                <div style="font-size:1.3rem;font-weight:700;color:${qualityColor};">${qualityLabel}</div>
                <div style="font-size:0.6rem;color:#8b6b4a;margin-top:2px;">🗺️ 藏宝地点 · X:${Math.round(treasureState.treasurePosX)} Y:${Math.round(treasureState.treasurePosY)}</div>
            </div>
            <div style="background:rgba(255,255,255,0.4);border-radius:16px;padding:12px 16px;margin-bottom:16px;border:1px solid rgba(90,46,28,0.06);">
                <div style="font-size:0.65rem;color:#5a2e1c;font-weight:600;margin-bottom:8px;">🎁 宝藏内容</div>
                <div style="display:flex;flex-direction:column;gap:6px;font-size:0.85rem;color:#3d2b1f;">${rewardsHtml}</div>
            </div>
            <div style="display:flex;gap:12px;justify-content:center;margin-top:4px;">
                <button id="treasureClaimBtn" style="
                    padding: 10px 40px;
                    background: linear-gradient(135deg, #f7971e, #ffd200);
                    border: none;
                    border-radius: 30px;
                    font-weight: 700;
                    font-size: 1rem;
                    color: #1a1a2e;
                    cursor: pointer;
                    transition: 0.15s;
                    box-shadow: 0 4px 20px rgba(247,151,30,0.2);
                ">🎁 领取宝藏</button>
                <button id="treasureCloseBtn" style="
                    padding: 10px 20px;
                    background: rgba(90,46,28,0.08);
                    border: 1px solid rgba(90,46,28,0.1);
                    border-radius: 30px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    color: #7b4a2a;
                    cursor: pointer;
                    transition: 0.15s;
                ">关闭</button>
            </div>
            <div style="font-size:0.5rem;color:#8b6b4a;text-align:center;margin-top:12px;opacity:0.4;">💡 领取后藏宝图将消失</div>
        </div>
    `;

    document.body.appendChild(panel);

    if (!document.getElementById('treasurePanelStyle')) {
        var style = document.createElement('style');
        style.id = 'treasurePanelStyle';
        style.textContent = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
            .treasure-reward-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 4px 0;
                border-bottom: 1px solid rgba(90,46,28,0.04);
            }
            .treasure-reward-item:last-child { border-bottom: none; }
            .treasure-reward-item span:first-child { width: 24px; text-align: center; font-size: 1rem; }
            .treasure-reward-item strong { margin-left: auto; color: #c4651e; }
        `;
        document.head.appendChild(style);
    }

    document.getElementById('treasureClaimBtn').addEventListener('click', function() {
        this.disabled = true;
        this.textContent = '⏳ 领取中...';
        var result = window.claimTreasure ? window.claimTreasure(reward) : null;
        if (result) {
            var panel = document.getElementById('treasureClaimPanel');
            if (panel) {
                var content = panel.querySelector('div:first-child');
                content.innerHTML = `
                    <div style="text-align:center;padding:20px 0;">
                        <div style="font-size:4rem;">🎉</div>
                        <div style="font-size:1.2rem;font-weight:700;color:#2d7a1e;margin-top:8px;">宝藏已领取！</div>
                        <div style="font-size:0.7rem;color:#8b6b4a;margin-top:4px;">获得了 ${result.coins} 探险币 + ${result.rep} 声望</div>
                        <button id="treasureCloseAfter" style="
                            margin-top:16px;
                            padding: 8px 32px;
                            background: #6f9e3f;
                            border: none;
                            border-radius: 30px;
                            font-weight: 700;
                            color: white;
                            cursor: pointer;
                            font-size: 0.9rem;
                        ">好的</button>
                    </div>
                `;
                document.getElementById('treasureCloseAfter').addEventListener('click', function() {
                    var panel = document.getElementById('treasureClaimPanel');
                    if (panel) panel.remove();
                });
            }
            if (typeof window.updateInfoPanel === 'function') window.updateInfoPanel();
            if (typeof window.renderBackpack === 'function') {
                var modal = document.getElementById('backpackModal');
                if (modal && !modal.classList.contains('hidden')) window.renderBackpack();
            }
            if (typeof window.updateExploreCoinsDisplay === 'function') window.updateExploreCoinsDisplay();
            if (typeof window.updateAdventurerUI === 'function') window.updateAdventurerUI();
        } else {
            this.textContent = '❌ 领取失败，请重试';
            this.disabled = false;
        }
    });

    document.getElementById('treasureCloseBtn').addEventListener('click', function() {
        var panel = document.getElementById('treasureClaimPanel');
        if (panel) panel.remove();
    });

    panel.addEventListener('click', function(e) {
        if (e.target === this) { this.remove(); }
    });
}

// ============================================================
// 更新信息面板（包含嫑界洋特殊面板 + 小王子气泡）
// ============================================================
function updateInfoPanel() {
    if (window._princeBubbleTimer) {
        clearInterval(window._princeBubbleTimer);
        window._princeBubbleTimer = null;
    }
    updateExploreCoinsDisplay();
    var selected = getRegion(selectedRegionId);
    var current = getCurrentRegion();
    if (!selected || !current) return;
    syncPlayerLevel();
    var infoMode = document.getElementById('infoMode');
    if (!infoMode) return;

    if (current && current.id === 'nomo_ocean' && current.status !== 'locked') {
        var targetRegion = (selected && selected.id !== 'nomo_ocean') ? selected : null;
        renderNomoOceanPanel(infoMode, targetRegion);
        return;
    }

    var isLocked = (selected.status === 'locked');
    var isCurrent = (selected.id === current.id);
    var isUnlocked = (selected.status !== 'locked');

    var statusText = '';
    var badgeColor = '';
    if (isLocked) {
        var canUnlock = canUnlockRegion(selected);
        statusText = canUnlock ? '🔓 可解锁 (Lv.' + selected.unlockLevel + ')' : '🔒 未解锁 (需要 Lv.' + selected.unlockLevel + ')';
        badgeColor = canUnlock ? '#ffd700' : '#d9534f';
    } else if (isCurrent) {
        statusText = '📍 当前位置';
        badgeColor = '#ffd700';
    } else if (selected.status === 'completed') {
        statusText = '✅ 已探索';
        badgeColor = '#6f9e3f';
    } else {
        statusText = '🔓 已解锁';
        badgeColor = '#6f9e3f';
    }

    statusBadge.textContent = statusText;
    statusBadge.style.background = badgeColor + '33';
    statusBadge.style.color = badgeColor;

    var story = window.STORY_DATA && window.STORY_DATA[selected.id];
    if (story && !story.completed && isCurrent) {
        infoMode.innerHTML = '';
        infoMode.style.display = 'flex';
        infoMode.style.background = 'transparent';
        infoMode.style.border = '2px solid rgba(255,215,150,0.06)';
        infoMode.style.borderRadius = '16px';
        infoMode.style.overflow = 'hidden';
        infoMode.style.padding = '0';
        infoMode.style.position = 'relative';
        if (typeof checkAndPlayStory === 'function') {
            setTimeout(function() { checkAndPlayStory(selected.id); }, 300);
        }
        return;
    }

    infoMode.innerHTML = '';
    infoMode.style.display = 'flex';
    infoMode.style.flexDirection = 'row';
    infoMode.style.flexWrap = 'wrap';
    infoMode.style.alignItems = 'flex-start';
    infoMode.style.justifyContent = 'space-between';
    infoMode.style.gap = '8px';
    infoMode.style.padding = '16px 22px';
    infoMode.style.position = 'relative';
    infoMode.style.borderRadius = '16px';
    infoMode.style.border = '2px solid rgba(255,215,150,0.25)';
    infoMode.style.overflow = 'hidden';
    infoMode.style.minHeight = '120px';

    var isPrinceRegion = (current.id === 'nomo_peninsula');

    if (isPrinceRegion) {
        infoMode.style.background = 'transparent';
        infoMode.style.border = '2px solid rgba(255,215,150,0.06)';
    } else {
        infoMode.style.background = 'url(images/fishing_bg.jpg) center/contain no-repeat';
        infoMode.style.border = '2px solid rgba(255,215,150,0.25)';
    }

    if (isPrinceRegion) {
        var oldScene = document.getElementById('princeSceneBg');
        if (oldScene) oldScene.remove();
        var sceneDiv = document.createElement('div');
        sceneDiv.id = 'princeSceneBg';
        sceneDiv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(180deg,#0a0a2e 0%,#1a1a3e 20%,#2d1b0e 55%,#4a2c1a 80%,#5a3a2a 100%);z-index:0;border-radius:16px;overflow:hidden;pointer-events:none;';
        
        var starHtml = '';
        var starCount = 30 + Math.floor(Math.random() * 15);
        for (var s = 0; s < starCount; s++) {
            var topPercent = Math.random() * 75;
            var leftPercent = Math.random() * 100;
            var size = 1 + Math.floor(Math.random() * 2);
            var delay = Math.random() * 2;
            var opacity = 0.3 + Math.random() * 0.5;
            starHtml += '<div class="pd-star" style="position:absolute;top:' + topPercent + '%;left:' + leftPercent + '%;width:' + size + 'px;height:' + size + 'px;background:white;border-radius:50%;opacity:' + opacity + ';animation:pdTwinkle 2s ease-in-out infinite alternate;animation-delay:' + delay + 's;z-index:2;pointer-events:none;"></div>';
        }
        sceneDiv.innerHTML = starHtml;
        
        var dunesHtml = '';
        dunesHtml += '<div class="pd-dunes" style="position:absolute;bottom:0;left:0;width:100%;height:150px;z-index:1;pointer-events:none;overflow:hidden;">';
        dunesHtml += '  <div class="pd-dune" style="position:absolute;bottom:0;left:-10%;width:120%;height:120px;border-radius:50%;background:rgba(180,140,100,0.08);"></div>';
        dunesHtml += '  <div class="pd-dune" style="position:absolute;bottom:15px;left:-10%;width:120%;height:85px;border-radius:50%;background:rgba(160,120,80,0.06);transform:rotate(-3deg);"></div>';
        dunesHtml += '  <div class="pd-dune" style="position:absolute;bottom:30px;left:-10%;width:120%;height:55px;border-radius:50%;background:rgba(140,100,60,0.04);transform:rotate(2deg);"></div>';
        dunesHtml += '  <div class="pd-dune" style="position:absolute;bottom:45px;left:-10%;width:120%;height:30px;border-radius:50%;background:rgba(120,80,50,0.03);transform:rotate(-1deg);"></div>';
        dunesHtml += '</div>';
        sceneDiv.insertAdjacentHTML('beforeend', dunesHtml);
        
        infoMode.prepend(sceneDiv);

        var princeBackDiv = document.createElement('div');
        princeBackDiv.id = 'princeBackDiv';
        princeBackDiv.style.cssText = 'position:absolute;left:40%;bottom:50px;z-index:1;pointer-events:none;opacity:0.9;transform:translateX(-50%);';
        princeBackDiv.innerHTML = '<img src="images/backofprince.png" alt="小王子背影" style="width:auto;height:360px;max-height:360px;filter:drop-shadow(0 2px 30px rgba(0,0,0,0.3));" onerror="this.style.display=\'none\';">';
        infoMode.appendChild(princeBackDiv);

        var dialoguePlayed = localStorage.getItem('rose_seed_dialogue_played') === 'true';
        var backpack = getBackpack();
        var hasRoseSeed = (backpack['rose_seed'] || 0) > 0;
        var hasPotUnlocked = localStorage.getItem('rose_pot_unlocked') === 'true';
        if (!dialoguePlayed && hasRoseSeed && !hasPotUnlocked) {
            localStorage.setItem('rose_seed_dialogue_played', 'true');
            localStorage.setItem('rose_pot_unlocked', 'true');
            setTimeout(function() { playRoseSeedDialogue(); }, 500);
        }
        if (hasPotUnlocked) { updateFlowerPot(); }

        var princeBubbleContainer = document.createElement('div');
        princeBubbleContainer.id = 'princeBubbleTopLeft';
        princeBubbleContainer.style.cssText = 'position:absolute;top:260px;left:160px;z-index:5;pointer-events:none;';
        var bubble = document.createElement('div');
        bubble.id = 'princeBubbleTextTopLeft';
        bubble.style.cssText =
            'background:rgba(255,248,240,0.92);backdrop-filter:blur(6px);' +
            'border-radius:16px 16px 4px 16px;padding:6px 18px;' +
            'box-shadow:0 4px 20px rgba(0,0,0,0.15);border:1px solid rgba(255,215,150,0.06);' +
            'max-width:200px;font-size:0.7rem;color:#2d1a0e;text-align:center;line-height:1.4;' +
            'position:relative;display:inline-block;';
        var lines = window.PRINCE_RANDOM_LINES || [
            '🌹 你回来了……她还好吗？',
            '✨ 星星真美，因为有一朵看不见的花。',
            '🌙 沙漠之所以美丽，是因为在某个地方藏着一口井。',
            '💛 真正重要的东西，用眼睛是看不见的。',
            '🌟 我会永远记得你。'
        ];
        var textSpan = document.createElement('span');
        textSpan.textContent = lines[Math.floor(Math.random() * lines.length)];
        bubble.appendChild(textSpan);
        var tail = document.createElement('div');
        tail.style.cssText = 'position:absolute;right:-8px;top:50%;transform:translateY(-50%);width:0;height:0;border-top:8px solid transparent;border-bottom:8px solid transparent;border-left:10px solid rgba(255,248,240,0.92);';
        bubble.appendChild(tail);
        princeBubbleContainer.appendChild(bubble);
        infoMode.appendChild(princeBubbleContainer);
        if (window._princeBubbleTimer) clearInterval(window._princeBubbleTimer);
        window._princeBubbleTimer = setInterval(function() {
            var bubbleEl = document.getElementById('princeBubbleTextTopLeft');
            if (bubbleEl && bubbleEl.offsetParent !== null) {
                var span = bubbleEl.querySelector('span');
                if (span) { span.textContent = lines[Math.floor(Math.random() * lines.length)]; }
            } else {
                clearInterval(window._princeBubbleTimer);
                window._princeBubbleTimer = null;
            }
        }, 9000);
    }

    var infoTextDiv = document.createElement('div');
    infoTextDiv.className = 'info-text';
    infoTextDiv.style.position = 'relative';
    infoTextDiv.style.zIndex = '1';
    infoTextDiv.style.color = 'rgba(255,255,255,0.85)';
    infoTextDiv.style.fontSize = '0.75rem';
    infoTextDiv.style.textAlign = 'left';
    infoTextDiv.style.lineHeight = '1.5';
    infoTextDiv.style.flex = '0 1 auto';
    infoTextDiv.style.minWidth = '160px';
    infoTextDiv.style.textShadow = '0 1px 4px rgba(0,0,0,0.5)';
    infoTextDiv.style.margin = '0';

    var nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.style.color = '#ffd700';
    nameSpan.style.fontWeight = 'bold';
    nameSpan.style.fontSize = '0.9rem';
    nameSpan.textContent = selected.icon + ' ' + selected.name;

    var subSpan = document.createElement('span');
    subSpan.className = 'sub';
    subSpan.style.display = 'inline-block';
    subSpan.style.fontSize = '0.55rem';
    subSpan.style.padding = '1px 8px';
    subSpan.style.borderRadius = '30px';
    subSpan.style.background = 'rgba(255,215,0,0.15)';
    subSpan.style.color = '#ffd700';
    subSpan.style.marginLeft = '4px';
    subSpan.textContent = statusText;

    var descSpan = document.createElement('span');
    descSpan.style.display = 'block';
    descSpan.style.fontSize = '0.6rem';
    descSpan.style.color = 'rgba(255,255,255,0.5)';
    descSpan.textContent = selected.desc;

    var unlockSpan = document.createElement('span');
    unlockSpan.style.display = 'block';
    unlockSpan.style.fontSize = '0.5rem';
    unlockSpan.style.color = 'rgba(255,255,255,0.3)';
    unlockSpan.style.marginTop = '2px';
    unlockSpan.textContent = 'Lv.' + playerLevel + ' | ' + selected.desc + (isLocked ? ' · 需要 Lv.' + selected.unlockLevel + ' 解锁' : ' · 已解锁');

    infoTextDiv.appendChild(nameSpan);
    infoTextDiv.appendChild(subSpan);
    infoTextDiv.appendChild(descSpan);
    infoTextDiv.appendChild(unlockSpan);

    var actionsDiv = document.createElement('div');
    actionsDiv.className = 'actions';
    actionsDiv.style.position = 'relative';
    actionsDiv.style.zIndex = '1';
    actionsDiv.style.display = 'flex';
    actionsDiv.style.gap = '8px';
    actionsDiv.style.flexShrink = '0';
    actionsDiv.style.flexWrap = 'wrap';
    actionsDiv.style.justifyContent = 'flex-end';
    actionsDiv.style.alignSelf = 'flex-start';

    if (isLocked && canUnlockRegion(selected)) {
        var unlockBtn = document.createElement('button');
        unlockBtn.className = 'btn-unlock';
        unlockBtn.textContent = '🔓 解锁';
        unlockBtn.style.border = 'none';
        unlockBtn.style.borderRadius = '30px';
        unlockBtn.style.padding = '5px 16px';
        unlockBtn.style.fontWeight = 'bold';
        unlockBtn.style.cursor = 'pointer';
        unlockBtn.style.transition = '0.15s';
        unlockBtn.style.fontSize = '0.7rem';
        unlockBtn.style.whiteSpace = 'nowrap';
        unlockBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        unlockBtn.style.background = '#ffd700';
        unlockBtn.style.color = '#2d1a0e';
        unlockBtn.onclick = function() {
            var sel = getRegion(selectedRegionId);
            if (sel && sel.status === 'locked') { tryUnlockRegion(sel); }
        };
        actionsDiv.appendChild(unlockBtn);
    }

    if (isUnlocked && !isCurrent) {
        var travelBtn = document.createElement('button');
        travelBtn.className = 'btn-travel';
        travelBtn.textContent = '🚢 航行';
        travelBtn.style.border = 'none';
        travelBtn.style.borderRadius = '30px';
        travelBtn.style.padding = '5px 16px';
        travelBtn.style.fontWeight = 'bold';
        travelBtn.style.cursor = 'pointer';
        travelBtn.style.transition = '0.15s';
        travelBtn.style.fontSize = '0.7rem';
        travelBtn.style.whiteSpace = 'nowrap';
        travelBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        travelBtn.style.background = '#6f9e3f';
        travelBtn.style.color = 'white';
        travelBtn.onclick = function() {
            var target = getRegion(selectedRegionId);
            if (target && target.status !== 'locked' && target.status !== 'current') {
                if (window.travel && window.travel.start) {
                    window.travel.start(target.id);
                } else {
                    showToast('❌ 航行系统未加载', 1500);
                }
            }
        };
        actionsDiv.appendChild(travelBtn);
    }

    if (current.id === 'nocean' && selected.id === 'nocean' && isUnlocked) {
        var isFishingActive = false;
        if (typeof window.fishing !== 'undefined' && window.fishing.isActive) {
            isFishingActive = window.fishing.isActive();
        }
        if (!isFishingActive) {
            var fishCard = document.createElement('div');
            fishCard.style.cssText = 'width:100%;margin-top:6px;padding:10px 14px;background:rgba(0,0,0,0.25);border-radius:16px;border:1px solid rgba(255,215,0,0.08);text-align:center;';
            var title = document.createElement('div');
            title.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;';
            title.innerHTML = '<span style="font-size:1.4rem;">🎣</span><span style="font-weight:bold;color:#ffd700;font-size:0.85rem;">钓鱼挑战</span>';
            fishCard.appendChild(title);
            var content = document.createElement('div');
            content.style.cssText = 'font-size:0.7rem;color:rgba(255,255,255,0.6);line-height:1.6;';
            var descDiv = document.createElement('div');
            descDiv.style.cssText = 'margin-bottom:4px;';
            descDiv.textContent = '🌊 在"可以就这洋"钓到各种鱼类！';
            content.appendChild(descDiv);
            var subDiv = document.createElement('div');
            subDiv.style.cssText = 'font-size:0.6rem;color:rgba(255,255,255,0.3);margin-bottom:4px;';
            subDiv.textContent = '🎣 抛竿 · 收杆 · 捕获传说中的鱼';
            content.appendChild(subDiv);
            var fishBtn = document.createElement('button');
            fishBtn.textContent = '🎣 开始钓鱼';
            fishBtn.style.cssText = 'padding:4px 20px;background:linear-gradient(135deg,#f7971e,#ffd200);border:none;border-radius:20px;font-weight:bold;color:#1a1a2e;cursor:pointer;font-size:0.7rem;transition:0.15s;';
            fishBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (typeof initFishing === 'function') { initFishing(); }
                else if (typeof window.initFishing === 'function') { window.initFishing(); }
                else { console.error('❌ initFishing 未定义'); showToast('❌ 钓鱼模块未加载，请刷新页面重试', 2000); }
            });
            content.appendChild(fishBtn);
            fishCard.appendChild(content);
            actionsDiv.appendChild(fishCard);
        }
    }

    if (current.id === 'nomo_peninsula' && selected.id === 'nomo_peninsula' && isUnlocked) {
        var gameCard = document.createElement('div');
        gameCard.style.cssText = 'width:100%;margin-top:6px;padding:10px 14px;background:rgba(0,0,0,0.25);border-radius:16px;border:1px solid rgba(255,215,0,0.08);text-align:center;';
        var title = document.createElement('div');
        title.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;';
        title.innerHTML = '<span style="font-size:1.4rem;">🎮</span><span style="font-weight:bold;color:#ffd700;font-size:0.85rem;">三杯一球</span>';
        gameCard.appendChild(title);
        var content = document.createElement('div');
        content.style.cssText = 'font-size:0.7rem;color:rgba(255,255,255,0.6);line-height:1.6;';
        var hasCompleteMap = false;
        if (typeof treasureState !== 'undefined') { hasCompleteMap = treasureState.hasCompleteMap; }
        var statusHTML = hasCompleteMap ? '🗺️ 藏宝图已合成，快去寻宝！' : '🎯 猜中球的位置，赢取探险币！';
        content.innerHTML = `
            <div style="margin-bottom:4px;">${statusHTML}</div>
            <div style="font-size:0.6rem;color:rgba(255,255,255,0.3);margin-bottom:4px;">💡 下注探险币，猜中翻倍！</div>
            <button onclick="openPrinceGame()" style="padding:4px 20px;background:linear-gradient(135deg,#f7971e,#ffd200);border:none;border-radius:20px;font-weight:bold;color:#1a1a2e;cursor:pointer;font-size:0.7rem;transition:0.15s;">🎮 开始游戏</button>
        `;
        gameCard.appendChild(content);
        actionsDiv.appendChild(gameCard);
    }

    if (current.id === 'friedegg' && selected.id === 'friedegg' && isUnlocked) {
        var backpack = getBackpack();
        var eggCount = backpack['egg'] || 0;
        var goldenEggCount = backpack['golden_egg'] || 0;
        var eggDiv = document.createElement('div');
        eggDiv.style.cssText = 'width:100%;margin-top:6px;padding:10px 14px;background:rgba(0,0,0,0.25);border-radius:16px;border:1px solid rgba(255,215,0,0.08);text-align:center;';
        var title = document.createElement('div');
        title.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;';
        title.innerHTML = '<span style="font-size:1.4rem;">🧩</span><span style="font-weight:bold;color:#ffd700;font-size:0.85rem;">煎蛋数独</span>';
        eggDiv.appendChild(title);
        var content = document.createElement('div');
        content.style.cssText = 'font-size:0.7rem;color:rgba(255,255,255,0.6);line-height:1.6;';
        var statusHTML2 = '';
        if (eggCount > 0) statusHTML2 += '🥚 鸡蛋 ×' + eggCount + ' ';
        if (goldenEggCount > 0) statusHTML2 += '🥚✨ 金蛋 ×' + goldenEggCount + ' ';
        if (!statusHTML2) statusHTML2 = '🎯 完成挑战获得煎蛋！';
        content.innerHTML = `
            <div style="margin-bottom:4px;">🧩 完成数独挑战，获得煎蛋奖励！</div>
            <div style="font-size:0.6rem;color:rgba(255,255,255,0.3);margin-bottom:4px;">${statusHTML2}</div>
            <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
                <button onclick="openSudokuGame('medium')" style="padding:4px 14px;background:linear-gradient(135deg,#f7971e,#ffd200);border:none;border-radius:20px;font-weight:bold;color:#1a1a2e;cursor:pointer;font-size:0.65rem;transition:0.15s;">🥚 中等</button>
                <button onclick="openSudokuGame('hard')" style="padding:4px 14px;background:linear-gradient(135deg,#ffd700,#f5a623);border:none;border-radius:20px;font-weight:bold;color:#1a1a2e;cursor:pointer;font-size:0.65rem;transition:0.15s;">🥚✨ 困难</button>
            </div>
        `;
        eggDiv.appendChild(content);
        actionsDiv.appendChild(eggDiv);
    }

    if (current.id === 'croissant' && selected.id === 'croissant' && isUnlocked) {
        var tradeDiv = document.createElement('div');
        tradeDiv.style.cssText = 'width:100%;margin-top:6px;padding:10px 14px;background:rgba(0,0,0,0.25);border-radius:16px;border:1px solid rgba(255,215,0,0.08);text-align:center;';
        var title = document.createElement('div');
        title.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;';
        title.innerHTML = '<span style="font-size:1.4rem;">🏪</span><span style="font-weight:bold;color:#ffd700;font-size:0.85rem;">可颂商店</span>';
        tradeDiv.appendChild(title);
        var content = document.createElement('div');
        content.style.cssText = 'font-size:0.7rem;color:rgba(255,255,255,0.6);line-height:1.6;';
        content.innerHTML = `
            <div style="font-size:0.6rem;color:rgba(255,255,255,0.3);margin-bottom:4px;">🔄 出售 · 购买 · 金币兑换探险币</div>
            <button onclick="openTrade()" style="padding:4px 20px;background:linear-gradient(135deg,#f7971e,#ffd200);border:none;border-radius:20px;font-weight:bold;color:#1a1a2e;cursor:pointer;font-size:0.7rem;transition:0.15s;">
                🛒 进入商店
            </button>
        `;
        tradeDiv.appendChild(content);
        actionsDiv.appendChild(tradeDiv);
    }

    if (current.id === 'dumbpan' && selected.id === 'dumbpan' && isUnlocked) {
        var ironCount = typeof getIronOreCount === 'function' ? getIronOreCount() : 0;
        var diamondCount = typeof getDiamondCount === 'function' ? getDiamondCount() : 0;
        var miningCard = document.createElement('div');
        miningCard.style.cssText = 'width:100%;margin-top:6px;padding:10px 14px;background:rgba(0,0,0,0.25);border-radius:16px;border:1px solid rgba(255,215,0,0.08);text-align:center;';
        var title = document.createElement('div');
        title.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;';
        title.innerHTML = '<span style="font-size:1.4rem;">⛏️</span><span style="font-weight:bold;color:#ffd700;font-size:0.85rem;">矿井挖掘</span>';
        miningCard.appendChild(title);
        var content = document.createElement('div');
        content.style.cssText = 'font-size:0.7rem;color:rgba(255,255,255,0.6);line-height:1.6;';
        content.innerHTML = `
            <div style="margin-bottom:4px;">⛏️ 向下挖掘，寻找铁矿和钻石！</div>
            <div style="font-size:0.6rem;color:rgba(255,255,255,0.3);margin-bottom:4px;">
                🪨 铁矿 ×${ironCount}  |  💎 钻石 ×${diamondCount}
            </div>
            <button onclick="initMining()" style="padding:4px 20px;background:linear-gradient(135deg,#f7971e,#ffd200);border:none;border-radius:20px;font-weight:bold;color:#1a1a2e;cursor:pointer;font-size:0.7rem;transition:0.15s;">
                ⛏️ 进入矿井
            </button>
        `;
        miningCard.appendChild(content);
        actionsDiv.appendChild(miningCard);
    }

    if (current.id === 'baxian' && selected.id === 'baxian' && isUnlocked) {
        var grinderCard = document.createElement('div');
        grinderCard.style.cssText = 'width:100%;margin-top:6px;padding:10px 14px;background:rgba(0,0,0,0.25);border-radius:16px;border:1px solid rgba(255,215,0,0.08);text-align:center;';
        var title = document.createElement('div');
        title.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;';
        title.innerHTML = '<span style="font-size:1.4rem;">🧂</span><span style="font-weight:bold;color:#ffd700;font-size:0.85rem;">八仙锅海 · 粉碎机</span>';
        grinderCard.appendChild(title);
        var content = document.createElement('div');
        content.style.cssText = 'font-size:0.7rem;color:rgba(255,255,255,0.6);line-height:1.6;';
        content.innerHTML = `
            <div style="margin-bottom:4px;">⚙️ 将原材料粉碎成高级材料</div>
            <div style="font-size:0.6rem;color:rgba(255,255,255,0.3);margin-bottom:4px;">可可豆 → 可可粉 | 米米苗苗 → 面粉 | 铁矿 → 燃料</div>
            <button onclick="openGrinderPanel()" style="padding:4px 20px;background:linear-gradient(135deg,#f7971e,#ffd200);border:none;border-radius:20px;font-weight:bold;color:#1a1a2e;cursor:pointer;font-size:0.7rem;transition:0.15s;">
                ⚙️ 进入粉碎机
            </button>
        `;
        grinderCard.appendChild(content);
        actionsDiv.appendChild(grinderCard);
    }

    if (current.id === 'rice' && selected.id === 'rice' && isUnlocked) {
        var riceCard = document.createElement('div');
        riceCard.style.cssText = 'width:100%;margin-top:6px;padding:10px 14px;background:rgba(0,0,0,0.25);border-radius:16px;border:1px solid rgba(255,215,0,0.08);text-align:center;';
        var title = document.createElement('div');
        title.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;';
        title.innerHTML = '<span style="font-size:1.4rem;">🍚</span><span style="font-weight:bold;color:#ffd700;font-size:0.85rem;">大米洲</span>';
        riceCard.appendChild(title);
        var content = document.createElement('div');
        content.style.cssText = 'display:flex;gap:12px;justify-content:center;flex-wrap:wrap;';
        content.innerHTML = `
            <button onclick="openRicePanel('paddy')" style="padding:6px 20px;background:linear-gradient(135deg,#6f9e3f,#4c7a2a);border:none;border-radius:20px;font-weight:bold;color:#fff;cursor:pointer;font-size:0.75rem;transition:0.15s;flex:0 1 auto;">
                🌾 稻田种植
            </button>
            <button onclick="openRicePanel('workshop')" style="padding:6px 20px;background:linear-gradient(135deg,#c98f5e,#a05e3a);border:none;border-radius:20px;font-weight:bold;color:#fff;cursor:pointer;font-size:0.75rem;transition:0.15s;flex:0 1 auto;">
                ⚙️ 能量工坊
            </button>
        `;
        riceCard.appendChild(content);
        var stats = (typeof window.getRiceStats === 'function') ? window.getRiceStats() : { riceGrain: 0, goldenEars: 0 };
        var statsDiv = document.createElement('div');
        statsDiv.style.cssText = 'margin-top:6px;font-size:0.6rem;color:rgba(255,255,255,0.3);';
        statsDiv.innerHTML = '🌾 稻谷 ' + stats.riceGrain + '  🌾✨ 金色稻穗 ' + stats.goldenEars;
        riceCard.appendChild(statsDiv);
        actionsDiv.appendChild(riceCard);
    }

    if (current.id === 'panini' && selected.id === 'panini' && isUnlocked) {
        var paniniCard = document.createElement('div');
        paniniCard.style.cssText = 'width:100%;margin-top:6px;padding:10px 14px;background:rgba(0,0,0,0.25);border-radius:16px;border:1px solid rgba(255,215,0,0.08);text-align:center;';
        var title = document.createElement('div');
        title.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;';
        title.innerHTML = '<span style="font-size:1.4rem;">🍳</span><span style="font-weight:bold;color:#ffd700;font-size:0.85rem;">帕尼尼大陆 · 美食实验室</span>';
        paniniCard.appendChild(title);
        var content = document.createElement('div');
        content.style.cssText = 'font-size:0.7rem;color:rgba(255,255,255,0.6);line-height:1.6;';
        content.innerHTML = `
            <div style="margin-bottom:4px;">🧪 自由组合食材，探索美食配方</div>
            <div style="font-size:0.6rem;color:rgba(255,255,255,0.3);margin-bottom:4px;">6种食材一锅，每次消耗6燃料，5秒烹饪</div>
            <button onclick="openPaniniPanel()" style="padding:4px 20px;background:linear-gradient(135deg,#f7971e,#ffd200);border:none;border-radius:20px;font-weight:bold;color:#1a1a2e;cursor:pointer;font-size:0.7rem;transition:0.15s;">
                🍳 进入厨房
            </button>
        `;
        paniniCard.appendChild(content);
        actionsDiv.appendChild(paniniCard);
    }

    if (current.id === 'welcome' && selected.id === 'welcome' && isUnlocked) {
        var bountyBtn = document.createElement('button');
        bountyBtn.className = 'btn-bounty';
        bountyBtn.textContent = '📋 悬赏板';
        bountyBtn.style.border = 'none';
        bountyBtn.style.borderRadius = '30px';
        bountyBtn.style.padding = '5px 16px';
        bountyBtn.style.fontWeight = 'bold';
        bountyBtn.style.cursor = 'pointer';
        bountyBtn.style.transition = '0.15s';
        bountyBtn.style.fontSize = '0.7rem';
        bountyBtn.style.whiteSpace = 'nowrap';
        bountyBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        bountyBtn.style.background = 'rgba(255,215,0,0.15)';
        bountyBtn.style.border = '1px solid rgba(255,215,0,0.2)';
        bountyBtn.style.color = '#ffd700';
        bountyBtn.onclick = function() { openBountyBoard(); };
        actionsDiv.appendChild(bountyBtn);
    }

    infoMode.appendChild(infoTextDiv);
    infoMode.appendChild(actionsDiv);
    if (isPrinceRegion && !document.getElementById('rosePotContainer')) {
        var hasPotUnlocked = localStorage.getItem('rose_pot_unlocked') === 'true';
        if (hasPotUnlocked) { updateFlowerPot(); }
    }
    if (regionCountEl) regionCountEl.textContent = getUnlockedCount();
}

// ============================================================
// 悬赏板
// ============================================================
function openBountyBoard() {
    var infoMode = document.getElementById('infoMode');
    var bountyMode = document.getElementById('bountyMode');
    if (!bountyMode) {
        var panel = document.getElementById('infoPanel');
        var mode = document.createElement('div');
        mode.id = 'bountyMode';
        mode.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:none;background:rgba(10,22,32,0.98);border-radius:16px;z-index:3;padding:20px;flex-direction:column;';
        panel.appendChild(mode);
        bountyMode = mode;
    }
    if (typeof initBountySystem === 'function') { initBountySystem(); }
    if (typeof renderBountyBoard === 'function') { renderBountyBoard(); }
    if (infoMode) infoMode.style.display = 'none';
    bountyMode.style.display = 'flex';
}

function closeBountyBoard() {
    var infoMode = document.getElementById('infoMode');
    var bountyMode = document.getElementById('bountyMode');
    if (infoMode) infoMode.style.display = 'flex';
    if (bountyMode) bountyMode.style.display = 'none';
}
// ============================================================
// ★★★ 关闭地图按钮 ★★★
// ============================================================
var closeMapBtn = document.getElementById('closeMapBtn');
if (closeMapBtn) {
    closeMapBtn.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
}

// ============================================================
// ★★★ 背包按钮 ★★★
// ============================================================
var backpackBtn = document.getElementById('backpackBtn');
if (backpackBtn) {
    backpackBtn.addEventListener('click', function() {
        var modal = document.getElementById('backpackModal');
        if (modal) {
            renderBackpack();
            modal.classList.remove('hidden');
            document.body.classList.add('modal-open');
        }
    });
}

var closeBackpackBtn = document.getElementById('closeBackpackBtn');
if (closeBackpackBtn) {
    closeBackpackBtn.addEventListener('click', function() {
        var modal = document.getElementById('backpackModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }
    });
}

var backpackModal = document.getElementById('backpackModal');
if (backpackModal) {
    backpackModal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }
    });
}

// ============================================================
// ★★★ 地图初始化（仅在 explore.html 中执行）★★★
// ============================================================
function initMap() {
    // 检查关键元素是否存在
    if (!mapOverlay || !shipMarker) {
        console.warn('⚠️ 地图关键元素缺失，跳过地图初始化');
        return;
    }

    loadRegionStatus();
    syncPlayerLevel();

    if (window.travel && window.travel.resumeOnLoad) {
        var resumed = window.travel.resumeOnLoad();
        if (resumed) {
            return;
        }
    }

    var current = getCurrentRegion();
    if (current) {
        var pos = toPercent(current.px, current.py);
        shipMarker.style.left = pos.x + '%';
        shipMarker.style.top = pos.y + '%';
        selectedRegionId = current.id;
    } else {
        var start = getRegion('welcome') || regions[0];
        var pos = toPercent(start.px, start.py);
        shipMarker.style.left = pos.x + '%';
        shipMarker.style.top = pos.y + '%';
        selectedRegionId = start.id;
    }

    renderMarkers();
    updateInfoPanel();

    var selected = getRegion(selectedRegionId);
    if (selected) {
        var markers = mapOverlay.querySelectorAll('.region-marker:not(.treasure-marker)');
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].dataset.id === selected.id) {
                markers[i].style.transform = 'translate(-50%, -50%) scale(1.25)';
                markers[i].style.zIndex = '10';
            }
        }
    }

    if (current && current.id === 'welcome' && typeof onVisitWelcomeBay === 'function') {
        setTimeout(function() { onVisitWelcomeBay(); }, 500);
    }

    updateExploreCoinsDisplay();
    showToast('🗺️ 欢迎来到可可世界！当前等级 Lv.' + playerLevel, 2500);
    console.log('🗺️ 可可世界地图已加载');
    console.log('📊 玩家等级: Lv.' + playerLevel);
    console.log('📌 已解锁: ' + getUnlockedCount() + '/' + regions.length);
    console.log('📍 当前位置: ' + (current ? current.name : '未知'));

    if (current) {
        var story = window.STORY_DATA && window.STORY_DATA[current.id];
        if (story && !story.completed) {
            setTimeout(function() {
                if (typeof checkAndPlayStory === 'function') {
                    checkAndPlayStory(current.id);
                }
            }, 800);
        }
    }
}

// ★★★ 只有在探险页面才初始化地图 ★★★
var isExplorePage = document.getElementById('mapArea') !== null;

if (isExplorePage) {
    var mapImage = document.getElementById('mapImage');
    if (mapImage) {
        if (mapImage.complete && mapImage.naturalWidth > 0) {
            initMap();
        } else {
            mapImage.addEventListener('load', initMap);
            setTimeout(function() {
                if (!window._mapInitialized) {
                    initMap();
                    window._mapInitialized = true;
                }
            }, 2000);
        }
    } else {
        // 地图图片不存在，但仍然尝试初始化（使用纯色背景）
        console.warn('⚠️ mapImage 不存在，直接初始化地图（使用纯色背景）');
        initMap();
    }
} else {
    console.log('ℹ️ 当前页面不是探险地图（explore.html），跳过地图初始化');
}

// ============================================================
// 暴露全局接口（始终暴露，供主界面使用）
// ============================================================
window.FISH_TYPES = FISH_TYPES;
window.regions = regions;
window.updateTreasureMarker = updateTreasureMarker;
window.removeTreasureMarker = removeTreasureMarker;
window.navigateToTreasure = navigateToTreasure;
window.renderMarkers = renderMarkers;
window.updateInfoPanel = updateInfoPanel;
window.getCurrentRegion = getCurrentRegion;
window.getRegion = getRegion;
window.renderBackpack = renderBackpack;
window.getExploreCoins = getExploreCoins;
window.updateExploreCoinsDisplay = updateExploreCoinsDisplay;
window.openBountyBoard = openBountyBoard;
window.closeBountyBoard = closeBountyBoard;
window.getAvatarHTML = getAvatarHTML;
window.playWaterEffect = playWaterEffect;
window.updateFlowerPot = updateFlowerPot;
window.playRoseSeedDialogue = playRoseSeedDialogue;
window.showFallbackDialogue = showFallbackDialogue;
window.closeNomoOceanPanel = closeNomoOceanPanel;
window.openFeedModal = openFeedModal;
window.closeFeedModal = closeFeedModal;
window.feedOctopus = feedOctopus;
window.renderFeedGrid = renderFeedGrid;
window.updateNomoDialogue = updateNomoDialogue;
window.updateNomoStats = updateNomoStats;
window.showTreasureClaimPanel = showTreasureClaimPanel;
window.startTravelFromNomo = startTravelFromNomo;
window.handleFirstArrival = handleFirstArrival;

// 添加动画样式
(function() {
    var style = document.createElement('style');
    style.textContent = `
        @keyframes pdTwinkle { 0% { opacity: 0.2; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1.2); } }
        @keyframes pdMoonGlow { 0% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.06)); } 100% { filter: drop-shadow(0 0 40px rgba(255, 215, 0, 0.18)); } }
        @keyframes roseGlow { 0%,100% { filter: drop-shadow(0 0 4px rgba(255,0,0,0.1)); } 50% { filter: drop-shadow(0 0 20px rgba(255,0,0,0.25)); } }
    `;
    document.head.appendChild(style);
})();

console.log('✅ explore.js 加载完成（收藏品标签 + 页面检测兼容）');