// ============================================================
// treasure.js · 藏宝图系统（碎片显示像鱼 + 只选已解锁区域）
// ============================================================

console.log('🗺️ 藏宝图系统加载中...');

// ============================================================
// 配置
// ============================================================
var TREASURE_FRAGMENTS_NEEDED = 4;
var TREASURE_FISH_DROP_CHANCE = 0.10;
var TREASURE_FISH_INTERVAL = 10;
var TREASURE_ARRIVAL_CHANCE = 0.20;
var TREASURE_KABU_CHANCE = 0.20;

// ============================================================
// 收藏品定义（如果不存在则创建）
// ============================================================
if (typeof TREASURE_COLLECTIBLES === 'undefined') {
    window.TREASURE_COLLECTIBLES = [
        { id: 'golden_feather', name: '金色羽毛', icon: '🪶', rarity: 'common' },
        { id: 'wood_carving', name: '沉船的木雕', icon: '🪵', rarity: 'common' },
        { id: 'log_page', name: '航海日志残页', icon: '📜', rarity: 'rare' },
        { id: 'ancient_compass', name: '古老罗盘', icon: '🧭', rarity: 'rare' },
        { id: 'golden_pocket_watch', name: '金制怀表', icon: '⌚', rarity: 'rare' },
        { id: 'pearl_shell', name: '珍珠贝壳', icon: '🐚', rarity: 'epic' },
        { id: 'ancient_pot', name: '古代陶罐', icon: '🏺', rarity: 'epic' },
        { id: 'pearl_crown', name: '珍珠王冠', icon: '👑', rarity: 'legendary' }
    ];
}

// ============================================================
// 状态
// ============================================================
var treasureState = {
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

// ============================================================
// 数据持久化
// ============================================================
function loadTreasureData() {
    try {
        var saved = localStorage.getItem('treasure_data');
        if (saved) {
            var data = JSON.parse(saved);
            treasureState.hasCompleteMap = data.hasCompleteMap || false;
            treasureState.treasureRegionId = data.treasureRegionId || null;
            treasureState.treasurePosX = data.treasurePosX || 0;
            treasureState.treasurePosY = data.treasurePosY || 0;
            treasureState.isCompleted = data.isCompleted || false;
            treasureState.completedCount = data.completedCount || 0;
            treasureState.fishCounter = data.fishCounter || 0;
            treasureState.lastKabuDate = data.lastKabuDate || null;
            treasureState.kabuGivenToday = data.kabuGivenToday || false;
            
            checkKabuDailyReset();
            return true;
        }
    } catch(e) {
        console.warn('加载藏宝图数据失败:', e);
    }
    return false;
}

function saveTreasureData() {
    try {
        var data = {
            hasCompleteMap: treasureState.hasCompleteMap,
            treasureRegionId: treasureState.treasureRegionId,
            treasurePosX: treasureState.treasurePosX,
            treasurePosY: treasureState.treasurePosY,
            isCompleted: treasureState.isCompleted,
            completedCount: treasureState.completedCount,
            fishCounter: treasureState.fishCounter,
            lastKabuDate: treasureState.lastKabuDate,
            kabuGivenToday: treasureState.kabuGivenToday
        };
        localStorage.setItem('treasure_data', JSON.stringify(data));
    } catch(e) {
        console.warn('保存藏宝图数据失败:', e);
    }
}

// ============================================================
// 探险背包操作
// ============================================================
function getBackpack() {
    try {
        var data = localStorage.getItem('explore_backpack');
        return data ? JSON.parse(data) : {};
    } catch(e) { return {}; }
}

function saveBackpack(backpack) {
    localStorage.setItem('explore_backpack', JSON.stringify(backpack));
}

function addFragmentToBackpack(amount) {
    var backpack = getBackpack();
    var current = backpack['treasure_fragment'] || 0;
    backpack['treasure_fragment'] = current + amount;
    saveBackpack(backpack);
    return backpack['treasure_fragment'];
}

function getFragmentsFromBackpack() {
    var backpack = getBackpack();
    return backpack['treasure_fragment'] || 0;
}

function consumeFragmentsFromBackpack(amount) {
    var backpack = getBackpack();
    var current = backpack['treasure_fragment'] || 0;
    if (current < amount) return false;
    backpack['treasure_fragment'] = current - amount;
    saveBackpack(backpack);
    return true;
}

// ============================================================
// 日期工具
// ============================================================
function getTodayDateStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function checkKabuDailyReset() {
    var today = getTodayDateStr();
    if (treasureState.lastKabuDate !== today) {
        treasureState.kabuGivenToday = false;
        treasureState.lastKabuDate = today;
        saveTreasureData();
    }
}

// ============================================================
// 获取已解锁区域（用于藏宝图刷新）
// ============================================================
function getUnlockedRegions() {
    var unlocked = [];
    if (typeof window.regions !== 'undefined') {
        for (var i = 0; i < window.regions.length; i++) {
            var r = window.regions[i];
            if (r.id !== 'welcome' && r.status !== 'locked') {
                unlocked.push(r);
            }
        }
    }
    if (unlocked.length === 0) {
        unlocked = [{ id: 'nocean', name: '可以就这洋', px: 333, py: 83 }];
    }
    return unlocked;
}

// ============================================================
// 碎片管理
// ============================================================

function addFragment(source) {
    if (treasureState.hasCompleteMap) {
        if (typeof showMessage === 'function') {
            showMessage('🗺️ 已有完整藏宝图，先去寻宝吧！', true);
        }
        return false;
    }
    
    var backpackFragments = getFragmentsFromBackpack();
    if (backpackFragments >= TREASURE_FRAGMENTS_NEEDED) {
        if (typeof showMessage === 'function') {
            showMessage('🧩 碎片已集齐！点击合成', false);
        }
        return true;
    }
    
    var newTotal = addFragmentToBackpack(1);
    saveTreasureData();
    
    if (typeof showMessage === 'function') {
        showMessage('🎉 恭喜你获得隐藏碎片！(' + newTotal + '/' + TREASURE_FRAGMENTS_NEEDED + ')', false);
    }
    
    return true;
}

// ============================================================
// 合成藏宝图（只从已解锁区域选择）
// ============================================================
function assembleMap() {
    var backpackFragments = getFragmentsFromBackpack();
    if (backpackFragments < TREASURE_FRAGMENTS_NEEDED) {
        if (typeof showMessage === 'function') {
            showMessage('碎片不足！需要 ' + TREASURE_FRAGMENTS_NEEDED + ' 片', true);
        }
        return false;
    }
    
    if (treasureState.hasCompleteMap) {
        if (typeof showMessage === 'function') {
            showMessage('🗺️ 已有完整藏宝图！', true);
        }
        return false;
    }
    
    if (!consumeFragmentsFromBackpack(TREASURE_FRAGMENTS_NEEDED)) {
        return false;
    }
    
    treasureState.hasCompleteMap = true;
    treasureState.isCompleted = false;
    
    var unlockedRegions = getUnlockedRegions();
    console.log('🗺️ 已解锁区域:', unlockedRegions.map(function(r) { return r.name; }).join(', '));
    
    var randomIndex = Math.floor(Math.random() * unlockedRegions.length);
    var target = unlockedRegions[randomIndex];
    
    treasureState.treasureRegionId = target.id;
    var offsetX = (Math.random() - 0.5) * 100;
    var offsetY = (Math.random() - 0.5) * 100;
    treasureState.treasurePosX = target.px + offsetX;
    treasureState.treasurePosY = target.py + offsetY;
    
    saveTreasureData();
    
    if (typeof window.renderBackpack === 'function') {
        var modal = document.getElementById('backpackModal');
        if (modal && !modal.classList.contains('hidden')) {
            window.renderBackpack();
        }
    }
    if (typeof window.updateTreasureMarker === 'function') {
        window.updateTreasureMarker();
    }
    
    if (typeof showMessage === 'function') {
        var regionName = getRegionName(target.id);
        showMessage('🗺️ 藏宝图已合成！前往「' + regionName + '」寻找宝藏！', false);
    }
    if (typeof randomFireworks === 'function') {
        randomFireworks(2);
    }
    
    return true;
}

// ============================================================
// 触发藏宝图事件（完成后藏宝图消失，回到碎片收集模式）
// ============================================================
function triggerTreasureEvent() {
    if (!treasureState.hasCompleteMap) return false;
    
    if (typeof showMessage === 'function') {
        showMessage('🎁 隐藏事件开发中... 敬请期待！', false);
    }
    
    treasureState.hasCompleteMap = false;
    treasureState.treasureRegionId = null;
    treasureState.treasurePosX = 0;
    treasureState.treasurePosY = 0;
    treasureState.isCompleted = false;
    treasureState.completedCount++;
    
    if (typeof window.removeTreasureMarker === 'function') {
        window.removeTreasureMarker();
    }
    
    saveTreasureData();
    
    if (typeof window.renderBackpack === 'function') {
        var modal = document.getElementById('backpackModal');
        if (modal && !modal.classList.contains('hidden')) {
            window.renderBackpack();
        }
    }
    
    return true;
}

// ============================================================
// 碎片获取触发点
// ============================================================

function onFishCaught(fishType) {
    checkKabuDailyReset();
    
    treasureState.fishCounter++;
    
    if (treasureState.fishCounter >= TREASURE_FISH_INTERVAL) {
        treasureState.fishCounter = 0;
        if (!treasureState.hasCompleteMap) {
            var backpackFragments = getFragmentsFromBackpack();
            if (backpackFragments < TREASURE_FRAGMENTS_NEEDED) {
                if (Math.random() < TREASURE_FISH_DROP_CHANCE) {
                    addFragment('钓鱼');
                }
            }
        }
    }
    
    saveTreasureData();
}

function onFirstArrival(regionId) {
    if (Math.random() < TREASURE_ARRIVAL_CHANCE) {
        if (!treasureState.hasCompleteMap) {
            var backpackFragments = getFragmentsFromBackpack();
            if (backpackFragments < TREASURE_FRAGMENTS_NEEDED) {
                addFragment('探索新区域');
            }
        }
    }
}

function onVisitWelcomeBay() {
    checkKabuDailyReset();
    
    if (treasureState.kabuGivenToday) {
        return;
    }
    if (treasureState.hasCompleteMap) {
        if (typeof showMessage === 'function') {
            showMessage('🗺️ 已有完整藏宝图，先去寻宝吧！', true);
        }
        treasureState.kabuGivenToday = true;
        treasureState.lastKabuDate = getTodayDateStr();
        saveTreasureData();
        return;
    }
    
    var backpackFragments = getFragmentsFromBackpack();
    if (backpackFragments >= TREASURE_FRAGMENTS_NEEDED) {
        treasureState.kabuGivenToday = true;
        treasureState.lastKabuDate = getTodayDateStr();
        saveTreasureData();
        if (typeof showMessage === 'function') {
            showMessage('🧩 碎片已集齐！点击合成', false);
        }
        return;
    }
    
    treasureState.kabuGivenToday = true;
    treasureState.lastKabuDate = getTodayDateStr();
    saveTreasureData();
    
    if (Math.random() < TREASURE_KABU_CHANCE) {
        var newTotal = addFragmentToBackpack(1);
        saveTreasureData();
        
        if (typeof showMessage === 'function') {
            showMessage('🎉 恭喜你获得隐藏碎片！(' + newTotal + '/' + TREASURE_FRAGMENTS_NEEDED + ')', false);
        }
    } else {
        if (typeof showMessage === 'function') {
            showMessage('🐻‍🍫 喀哺今天没有藏宝图碎片...', false);
        }
    }
}

function isCurrentRegionTreasureTarget(regionId) {
    if (!treasureState.hasCompleteMap) return false;
    return treasureState.treasureRegionId === regionId;
}

function getTreasureTargetRegion() {
    if (!treasureState.hasCompleteMap) return null;
    return treasureState.treasureRegionId;
}

function getTreasurePos() {
    if (!treasureState.hasCompleteMap) return null;
    return { x: treasureState.treasurePosX, y: treasureState.treasurePosY };
}

function getRegionName(regionId) {
    var regionMap = {
        'welcome': '欢迎米来湾',
        'nocean': '可以就这洋',
        'nomo_peninsula': '嫑锅半岛',
        'friedegg': '煎蛋海',
        'croissant': '可颂大陆',
        'dumbpan': '沙锅洲',
        'rice': '大米洲',
        'baxian': '八仙锅海',
        'panini': '帕尼尼大陆',
        'nomo_ocean': '嫑界洋'
    };
    return regionMap[regionId] || regionId;
}

// ============================================================
// ★★★ 藏宝图奖励系统 ★★★
// ============================================================

function previewTreasureReward() {
    try {
        if (!treasureState.hasCompleteMap) {
            return null;
        }

        var rand = Math.random();
        var quality = 'common';
        var qualityIcon = '🟢';
        var qualityLabel = '普通';
        var qualityColor = '#8b8b8b';
        
        if (rand < 0.05) {
            quality = 'legendary';
            qualityIcon = '🌟';
            qualityLabel = '传说';
            qualityColor = '#ff6b00';
        } else if (rand < 0.15) {
            quality = 'epic';
            qualityIcon = '💜';
            qualityLabel = '史诗';
            qualityColor = '#9b59b6';
        } else if (rand < 0.35) {
            quality = 'rare';
            qualityIcon = '💙';
            qualityLabel = '稀有';
            qualityColor = '#2e86de';
        }

        var reward = {
            coins: 10 + Math.floor(Math.random() * 30),
            rep: 5 + Math.floor(Math.random() * 15),
            items: [],
            quality: quality,
            qualityIcon: qualityIcon,
            qualityLabel: qualityLabel,
            qualityColor: qualityColor
        };

        if (quality === 'legendary' || quality === 'epic') {
            reward.items.push({
                icon: '🎁',
                name: '能量宝箱',
                amount: quality === 'legendary' ? 2 : 1
            });
        }
        if (quality === 'rare' || quality === 'epic' || quality === 'legendary') {
            reward.items.push({
                icon: '🎰',
                name: '幸运盒子',
                amount: quality === 'legendary' ? 3 : quality === 'epic' ? 2 : 1
            });
        }

        if (Math.random() < 0.3 && window.TREASURE_COLLECTIBLES) {
            var available = window.TREASURE_COLLECTIBLES;
            var idx = Math.floor(Math.random() * available.length);
            reward.collectible = available[idx];
        }

        if (Math.random() < 0.2 && typeof ENERGY_TYPES !== 'undefined') {
            var energyTypes = ENERGY_TYPES || [
                { id: 'cheese_powder', name: '高塔芝士粉' },
                { id: 'inspiration_jelly', name: '灵感啫喱' },
                { id: 'mimi_seedling', name: '米米苗苗' },
                { id: 'time_pudding', name: '时光布丁' },
                { id: 'warm_butter', name: '温暖黄油' },
                { id: 'star_crystal', name: '星晶雪花' }
            ];
            var energyIdx = Math.floor(Math.random() * energyTypes.length);
            reward.energy = energyTypes[energyIdx].id;
        }

        return reward;
    } catch(e) {
        console.warn('预览藏宝图奖励失败:', e);
        return null;
    }
}

function claimTreasure(reward) {
    try {
        if (!reward) return null;
        if (!treasureState.hasCompleteMap) return null;

        if (reward.coins && typeof addExploreCoins === 'function') {
            addExploreCoins(reward.coins);
        }
        if (reward.rep && typeof addReputation === 'function') {
            addReputation(reward.rep, '藏宝图宝藏');
        }

        if (reward.items && reward.items.length > 0 && typeof playerBag !== 'undefined') {
            reward.items.forEach(function(item) {
                var itemId = item.name === '能量宝箱' ? 'energy_box' : 
                            (item.name === '幸运盒子' ? 'lucky_box' : 
                            (item.name === '加速券' ? 'speed_up' : 
                            (item.name === '刷新券' ? 'refresh' : null)));
                if (itemId && playerBag[itemId] !== undefined) {
                    playerBag[itemId] = (playerBag[itemId] || 0) + item.amount;
                }
            });
            if (typeof savePlayerBag === 'function') savePlayerBag();
        }

        if (reward.collectible) {
            var collected = JSON.parse(localStorage.getItem('treasure_collected') || '[]');
            if (collected.indexOf(reward.collectible.id) === -1) {
                collected.push(reward.collectible.id);
                localStorage.setItem('treasure_collected', JSON.stringify(collected));
            }
        }

        if (reward.energy && typeof energies !== 'undefined') {
            energies[reward.energy] = (energies[reward.energy] || 0) + 1;
        }

        treasureState.hasCompleteMap = false;
        treasureState.treasureRegionId = null;
        treasureState.treasurePosX = 0;
        treasureState.treasurePosY = 0;
        treasureState.isCompleted = false;
        treasureState.completedCount = (treasureState.completedCount || 0) + 1;
        saveTreasureData();

        if (typeof window.removeTreasureMarker === 'function') {
            window.removeTreasureMarker();
        }

        if (typeof window.checkAchievements === 'function') {
            setTimeout(function() {
                window.checkAchievements();
            }, 300);
        }

        return reward;
    } catch(e) {
        console.warn('领取藏宝图奖励失败:', e);
        return null;
    }
}

// ============================================================
// ★★★ 检查是否集齐全部收藏品（用于成就） ★★★
// ============================================================

function isAllCollectiblesCollected() {
    if (typeof TREASURE_COLLECTIBLES === 'undefined') return false;
    
    try {
        var collected = JSON.parse(localStorage.getItem('treasure_collected') || '[]');
        var total = TREASURE_COLLECTIBLES.length;
        if (total === 0) return false;
        
        var count = 0;
        for (var i = 0; i < TREASURE_COLLECTIBLES.length; i++) {
            if (collected.indexOf(TREASURE_COLLECTIBLES[i].id) !== -1) {
                count++;
            }
        }
        return count >= total;
    } catch(e) {
        return false;
    }
}

// ============================================================
// UI 更新（背包中的碎片由 renderBackpack 统一处理）
// ============================================================
function updateBackpackFragmentUI() {
    // 背包UI由 renderBackpack 统一更新，此处留空
}

// ============================================================
// 初始化
// ============================================================
function initTreasure() {
    loadTreasureData();
    checkKabuDailyReset();
    console.log('🗺️ 藏宝图系统已加载，背包碎片: ' + getFragmentsFromBackpack() + '/' + TREASURE_FRAGMENTS_NEEDED);
    
    if (treasureState.hasCompleteMap) {
        setTimeout(function() {
            if (typeof window.updateTreasureMarker === 'function') {
                window.updateTreasureMarker();
            }
        }, 800);
    }
}

// ============================================================
// 暴露全局接口
// ============================================================
window.treasureState = treasureState;
window.TREASURE_FRAGMENTS_NEEDED = TREASURE_FRAGMENTS_NEEDED;
window.addFragment = addFragment;
window.assembleMap = assembleMap;
window.triggerTreasureEvent = triggerTreasureEvent;
window.onFishCaught = onFishCaught;
window.onFirstArrival = onFirstArrival;
window.onVisitWelcomeBay = onVisitWelcomeBay;
window.isCurrentRegionTreasureTarget = isCurrentRegionTreasureTarget;
window.getTreasureTargetRegion = getTreasureTargetRegion;
window.getTreasurePos = getTreasurePos;
window.updateBackpackFragmentUI = updateBackpackFragmentUI;
window.initTreasure = initTreasure;
window.saveTreasureData = saveTreasureData;
window.loadTreasureData = loadTreasureData;
window.getFragmentsFromBackpack = getFragmentsFromBackpack;
window.addFragmentToBackpack = addFragmentToBackpack;
window.consumeFragmentsFromBackpack = consumeFragmentsFromBackpack;
window.getRegionName = getRegionName;
window.getUnlockedRegions = getUnlockedRegions;

// ★★★ 藏宝图奖励系统 ★★★
window.previewTreasureReward = previewTreasureReward;
window.claimTreasure = claimTreasure;

// ★★★ 收藏品成就检查 ★★★
window.isAllCollectiblesCollected = isAllCollectiblesCollected;
// ============================================================
// 获取已收集的收藏品列表（供背包显示）
// ============================================================
function getCollectedCollectibles() {
    try {
        var data = localStorage.getItem('treasure_collected');
        return data ? JSON.parse(data) : [];
    } catch(e) {
        return [];
    }
}

// ★★★ 暴露到全局 ★★★
window.getCollectedCollectibles = getCollectedCollectibles;

console.log('🗺️ getCollectedCollectibles 已暴露到全局');

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTreasure);
} else {
    setTimeout(initTreasure, 100);
}

console.log('🗺️ 藏宝图系统加载完成（碎片存入背包）');
console.log('🗺️ 收藏品: ' + TREASURE_COLLECTIBLES.map(function(c) { return c.icon + c.name; }).join(' '));
console.log('🗺️ isAllCollectiblesCollected 已暴露到全局');