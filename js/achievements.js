// js/achievements.js

console.log('🏆 成就系统加载中...');

// ============================================
// 成就分类
// ============================================

var ACHIEVEMENT_CATEGORIES = {
    production: { name: '生产类', icon: '🏭' },
    sales: { name: '销售类', icon: '💰' },
    wealth: { name: '财富类', icon: '🪙' },
    level: { name: '等级类', icon: '⭐' },
    upgrade: { name: '升级类', icon: '🔧' },
    special: { name: '特殊类', icon: '🎁' },
    minigame: { name: '小游戏类', icon: '🎮' },
    explore: { name: '探险类', icon: '🗺️' }
};

// ============================================
// 成就定义（所有小游戏成就使用 window.minigameStats）
// ============================================

var ACHIEVEMENT_DEFS = {
    // ---------- 生产类 ----------
    produce_10: {
        id: 'produce_10', category: 'production', name: '初出茅庐', icon: '🍪',
        description: '制作 10 个产品',
        check: function() { return totalProduced >= 10; },
        reward: { gold: 20, beans: 10, exp: 10 }
    },
    produce_50: {
        id: 'produce_50', category: 'production', name: '小有成就', icon: '🧁',
        description: '制作 50 个产品',
        check: function() { return totalProduced >= 50; },
        reward: { gold: 50, beans: 30, exp: 25 }
    },
    produce_100: {
        id: 'produce_100', category: 'production', name: '甜点大师', icon: '🎂',
        description: '制作 100 个产品',
        check: function() { return totalProduced >= 100; },
        reward: { gold: 100, beans: 60, exp: 50, speed_up: 1 }
    },
    produce_500: {
        id: 'produce_500', category: 'production', name: '传奇甜点师', icon: '👨‍🍳',
        description: '制作 500 个产品',
        check: function() { return totalProduced >= 500; },
        reward: { gold: 300, beans: 150, exp: 100, speed_up: 3 }
    },

    // ---------- 销售类 ----------
    sell_10: {
        id: 'sell_10', category: 'sales', name: '第一桶金', icon: '💰',
        description: '出售 10 个产品',
        check: function() { return totalSold >= 10; },
        reward: { gold: 30, exp: 15 }
    },
    sell_50: {
        id: 'sell_50', category: 'sales', name: '销售精英', icon: '💵',
        description: '出售 50 个产品',
        check: function() { return totalSold >= 50; },
        reward: { gold: 80, beans: 40, exp: 30 }
    },
    sell_100: {
        id: 'sell_100', category: 'sales', name: '销售之王', icon: '💎',
        description: '出售 100 个产品',
        check: function() { return totalSold >= 100; },
        reward: { gold: 150, beans: 80, exp: 60, refresh: 1 }
    },
    sell_500: {
        id: 'sell_500', category: 'sales', name: '销售传奇', icon: '👑',
        description: '出售 500 个产品',
        check: function() { return totalSold >= 500; },
        reward: { gold: 300, beans: 150, exp: 100, speed_up: 2 }
    },
    sell_1000: {
        id: 'sell_1000', category: 'sales', name: '销售之神', icon: '🌟',
        description: '出售 1000 个产品',
        check: function() { return totalSold >= 1000; },
        reward: { gold: 500, beans: 300, exp: 150, energy_box: 1, refresh: 2 }
    },
    sell_5000: {
        id: 'sell_5000', category: 'sales', name: '商业巨鳄', icon: '💼',
        description: '出售 5000 个产品',
        check: function() { return totalSold >= 5000; },
        reward: { gold: 1000, beans: 600, exp: 300, energy_box: 2, speed_up: 5 }
    },

    // ---------- 财富类 ----------
    gold_100: {
        id: 'gold_100', category: 'wealth', name: '小有积蓄', icon: '🪙',
        description: '拥有 100 金币',
        check: function() { return gold >= 100; },
        reward: { gold: 20, exp: 15 }
    },
    gold_1000: {
        id: 'gold_1000', category: 'wealth', name: '富甲一方', icon: '🏆',
        description: '拥有 1000 金币',
        check: function() { return gold >= 1000; },
        reward: { gold: 80, exp: 40, lucky_box: 1 }
    },
    gold_10000: {
        id: 'gold_10000', category: 'wealth', name: '甜点大亨', icon: '👑',
        description: '拥有 10000 金币',
        check: function() { return gold >= 10000; },
        reward: { gold: 300, exp: 100, energy_box: 1, lucky_box: 2 }
    },
    gold_50000: {
        id: 'gold_50000', category: 'wealth', name: '甜点首富', icon: '💰',
        description: '拥有 50000 金币',
        check: function() { return gold >= 50000; },
        reward: { gold: 500, exp: 150, energy_box: 2, lucky_box: 3 }
    },
    gold_100000: {
        id: 'gold_100000', category: 'wealth', name: '可可帝国', icon: '🏰',
        description: '拥有 100000 金币',
        check: function() { return gold >= 100000; },
        reward: { gold: 1000, exp: 300, energy_box: 3, lucky_box: 5, speed_up: 3 }
    },

    // ---------- 等级类 ----------
    level_5: {
        id: 'level_5', category: 'level', name: '新手进阶', icon: '⭐',
        description: '达到 5 级',
        check: function() { return level >= 5; },
        reward: { gold: 30, beans: 20, exp: 20 }
    },
    level_10: {
        id: 'level_10', category: 'level', name: '甜点专家', icon: '🌟',
        description: '达到 10 级',
        check: function() { return level >= 10; },
        reward: { gold: 80, beans: 50, exp: 40, energy_box: 1 }
    },
    level_20: {
        id: 'level_20', category: 'level', name: '甜点传奇', icon: '✨',
        description: '达到 20 级',
        check: function() { return level >= 20; },
        reward: { gold: 200, beans: 120, exp: 80, energy_box: 2, speed_up: 2 }
    },

    // ---------- 升级类 ----------
    upgrade_miao_5: {
        id: 'upgrade_miao_5', category: 'upgrade', name: '议价初学者', icon: '🤝',
        description: '议价升级到 5 级',
        check: function() { return miaoBargainLevel >= 5; },
        reward: { gold: 40, exp: 20 }
    },
    upgrade_miao_10: {
        id: 'upgrade_miao_10', category: 'upgrade', name: '议价大师', icon: '💬',
        description: '议价升级到 10 级',
        check: function() { return miaoBargainLevel >= 10; },
        reward: { gold: 120, exp: 50, speed_up: 1 }
    },
    upgrade_speed_5: {
        id: 'upgrade_speed_5', category: 'upgrade', name: '效率提升者', icon: '⚡',
        description: '自动化升级到 5 级',
        check: function() { return productionSpeedLevel >= 5; },
        reward: { gold: 40, exp: 20 }
    },
    upgrade_speed_10: {
        id: 'upgrade_speed_10', category: 'upgrade', name: '自动化大师', icon: '🚀',
        description: '自动化升级到 10 级',
        check: function() { return productionSpeedLevel >= 10; },
        reward: { gold: 120, exp: 50, refresh: 1 }
    },
    upgrade_workaholic_5: {
        id: 'upgrade_workaholic_5', category: 'upgrade', name: '工作狂初级', icon: '💪',
        description: '工作狂升级到 5 级',
        check: function() { return workaholicLevel >= 5; },
        reward: { gold: 40, exp: 20 }
    },
    upgrade_workaholic_10: {
        id: 'upgrade_workaholic_10', category: 'upgrade', name: '工作狂大师', icon: '🔥',
        description: '工作狂升级到 10 级',
        check: function() { return workaholicLevel >= 10; },
        reward: { gold: 120, exp: 50, lucky_box: 2 }
    },

    // ---------- 特殊类 ----------
    hidden_1: {
        id: 'hidden_1', category: 'special', name: '探索者', icon: '🔍',
        description: '制作 1 个隐藏产品',
        check: function() {
            var count = 0;
            for (var id in hiddenInventory) count += hiddenInventory[id] || 0;
            return count >= 1;
        },
        reward: { gold: 50, beans: 30, exp: 25 }
    },
    hidden_10: {
        id: 'hidden_10', category: 'special', name: '美食猎人', icon: '🎯',
        description: '制作 10 个隐藏产品',
        check: function() {
            var count = 0;
            for (var id in hiddenInventory) count += hiddenInventory[id] || 0;
            return count >= 10;
        },
        reward: { gold: 150, beans: 80, exp: 60, energy_box: 1 }
    },
    order_5: {
        id: 'order_5', category: 'special', name: '订单达人', icon: '📦',
        description: '完成 5 个订单',
        check: function() { return (typeof totalOrdersCompleted !== 'undefined' && totalOrdersCompleted >= 5); },
        reward: { gold: 40, exp: 20 }
    },
    order_20: {
        id: 'order_20', category: 'special', name: '订单狂魔', icon: '🏅',
        description: '完成 20 个订单',
        check: function() { return (typeof totalOrdersCompleted !== 'undefined' && totalOrdersCompleted >= 20); },
        reward: { gold: 120, beans: 60, exp: 50, refresh: 1 }
    },
    farm_all: {
        id: 'farm_all', category: 'special', name: '农场主', icon: '🌾',
        description: '解锁全部 24 块土地',
        check: function() {
            if (typeof getUnlockedCount === 'function') return getUnlockedCount() >= 24;
            return false;
        },
        reward: { gold: 200, beans: 100, exp: 80, energy_box: 1 }
    },

    // ============================================================
    // 🎮 小游戏类成就
    // ============================================================
    minigame_memory: {
        id: 'minigame_memory', category: 'minigame', name: '记忆大师', icon: '🧠',
        description: '30秒内完成翻牌配对',
        check: function() {
            return window.minigameStats && window.minigameStats.bestTime > 0 && window.minigameStats.bestTime <= 30;
        },
        reward: { gold: 40, beans: 20, exp: 20 }
    },
    minigame_10: {
        id: 'minigame_10', category: 'minigame', name: '翻牌高手', icon: '🃏',
        description: '完成 10 次翻牌配对',
        check: function() {
            return window.minigameStats && window.minigameStats.totalPlays >= 10;
        },
        reward: { gold: 80, beans: 50, exp: 40, lucky_box: 1 }
    },
    minigame_50: {
        id: 'minigame_50', category: 'minigame', name: '翻牌王者', icon: '👑',
        description: '完成 50 次翻牌配对',
        check: function() {
            return window.minigameStats && window.minigameStats.totalPlays >= 50;
        },
        reward: { gold: 150, beans: 80, exp: 60, energy_box: 1 }
    },
    minigame_100: {
        id: 'minigame_100', category: 'minigame', name: '翻牌之神', icon: '🌟',
        description: '完成 100 次翻牌配对',
        check: function() {
            return window.minigameStats && window.minigameStats.totalPlays >= 100;
        },
        reward: { gold: 300, beans: 150, exp: 100, energy_box: 2, lucky_box: 2 }
    },
    minigame_lightning: {
        id: 'minigame_lightning', category: 'minigame', name: '闪电手', icon: '⚡',
        description: '20秒内完成翻牌配对',
        check: function() {
            return window.minigameStats && window.minigameStats.bestTime > 0 && window.minigameStats.bestTime <= 20;
        },
        reward: { gold: 60, beans: 30, exp: 25, speed_up: 1 }
    },

    // ---------- 隐藏成就 ----------
    hidden_one_night_rich: {
        id: 'hidden_one_night_rich', category: 'special', name: '一夜暴富', icon: '🌈',
        description: '单次幸运盒子开出 99 金币',
        isHidden: true,
        check: function() { return (typeof luckyBoxMaxGold !== 'undefined' && luckyBoxMaxGold >= 99); },
        reward: { gold: 100, exp: 30, lucky_box: 2 }
    },
    hidden_speed_demon: {
        id: 'hidden_speed_demon', category: 'minigame', name: '速度与激情', icon: '🏎️',
        description: '10秒内完成翻牌配对',
        isHidden: true,
        check: function() {
            return window.minigameStats && window.minigameStats.bestTime > 0 && window.minigameStats.bestTime <= 10;
        },
        reward: { gold: 80, exp: 50, speed_up: 3 }
    },
    hidden_bean_king: {
        id: 'hidden_bean_king', category: 'wealth', name: '豆子富翁', icon: '🫘',
        description: '累计获得 10000 颗豆子',
        isHidden: true,
        check: function() { return (typeof totalBeansHarvested !== 'undefined' && totalBeansHarvested >= 10000); },
        reward: { gold: 200, beans: 200, exp: 80, energy_box: 1 }
    },
    hidden_signin_king: {
        id: 'hidden_signin_king', category: 'special', name: '连续签到王', icon: '👑',
        description: '连续签到 30 天',
        isHidden: true,
        check: function() {
            return (typeof shopState !== 'undefined' && shopState.signIn && shopState.signIn.consecutiveDays >= 30);
        },
        reward: { gold: 300, exp: 100, energy_box: 2, lucky_box: 3 }
    },
    hidden_all_recipes: {
        id: 'hidden_all_recipes', category: 'special', name: '隐藏美食家', icon: '🍽️',
        description: '制作全部 8 种隐藏产品',
        isHidden: true,
        check: function() {
            var allIds = HIDDEN_RECIPES.map(function(r) { return r.id; });
            for (var i = 0; i < allIds.length; i++) {
                if ((hiddenInventory[allIds[i]] || 0) <= 0) return false;
            }
            return true;
        },
        reward: { gold: 500, beans: 300, exp: 150, energy_box: 3, speed_up: 5 }
    },
    hidden_all_slots: {
        id: 'hidden_all_slots', category: 'special', name: '工坊全开', icon: '🔓',
        description: '解锁全部 6 个工坊',
        isHidden: true,
        check: function() {
            if (typeof slots === 'undefined') return false;
            for (var i = 0; i < slots.length; i++) {
                if (!slots[i].unlocked) return false;
            }
            return true;
        },
        reward: { gold: 100, exp: 50, refresh: 2 }
    },
    hidden_exchange_master: {
        id: 'hidden_exchange_master', category: 'wealth', name: '金币回收机', icon: '🔄',
        description: '累计兑换 100 次豆子换金币',
        isHidden: true,
        check: function() { return (typeof totalExchanges !== 'undefined' && totalExchanges >= 100); },
        reward: { gold: 150, exp: 60, lucky_box: 2 }
    },
    hidden_grinder: {
        id: 'hidden_grinder', category: 'special', name: '肝帝', icon: '⏰',
        description: '在线游戏时间超过 24 小时',
        isHidden: true,
        check: function() { return (typeof totalGameTime !== 'undefined' && totalGameTime >= 86400); },
        reward: { gold: 200, exp: 100, energy_box: 2, speed_up: 3 }
    },

    // ---------- 藏宝图收藏家 ----------
    treasure_collector_all: {
        id: 'treasure_collector_all',
        category: 'special',
        name: '传奇收藏家',
        icon: '🏴‍☠️',
        description: '集齐全部 8 件藏宝图收藏品',
        isHidden: true,
        check: function() {
            if (typeof window.isAllCollectiblesCollected === 'function') {
                return window.isAllCollectiblesCollected();
            }
            return false;
        },
        reward: { gold: 200, beans: 100, exp: 80, energy_box: 1 }
    },

    // ============================================================
    // 🗺️ 探险类成就（29 个）
    // ============================================================

    // ---- 岛屿探索 ----
    explore_3: {
        id: 'explore_3',
        category: 'explore',
        name: '初航者',
        icon: '⛵',
        description: '解锁 3 个岛屿',
        check: function() {
            if (typeof window.getUnlockedCount === 'function') {
                return window.getUnlockedCount() >= 3;
            }
            return false;
        },
        reward: { gold: 30, beans: 10, exp: 15 }
    },
    explore_5: {
        id: 'explore_5',
        category: 'explore',
        name: '航海家',
        icon: '🧭',
        description: '解锁 5 个岛屿',
        check: function() {
            if (typeof window.getUnlockedCount === 'function') {
                return window.getUnlockedCount() >= 5;
            }
            return false;
        },
        reward: { gold: 60, beans: 30, exp: 30, lucky_box: 1 }
    },
    explore_8: {
        id: 'explore_8',
        category: 'explore',
        name: '深海探险者',
        icon: '🌊',
        description: '解锁 8 个岛屿',
        check: function() {
            if (typeof window.getUnlockedCount === 'function') {
                return window.getUnlockedCount() >= 8;
            }
            return false;
        },
        reward: { gold: 100, beans: 50, exp: 50, energy_box: 1 }
    },
    explore_10: {
        id: 'explore_10',
        category: 'explore',
        name: '可可世界征服者',
        icon: '🏴‍☠️',
        description: '解锁全部 10 个岛屿',
        check: function() {
            if (typeof window.getUnlockedCount === 'function') {
                return window.getUnlockedCount() >= 10;
            }
            return false;
        },
        reward: { gold: 200, beans: 100, exp: 100, energy_box: 2, lucky_box: 2 }
    },
    explore_story_all: {
        id: 'explore_story_all',
        category: 'explore',
        name: '故事收藏家',
        icon: '📖',
        description: '完成全部岛屿剧情',
        check: function() {
            if (typeof window.STORY_DATA === 'undefined') return false;
            var allCompleted = true;
            for (var key in window.STORY_DATA) {
                if (!window.STORY_DATA[key].completed) {
                    allCompleted = false;
                    break;
                }
            }
            return allCompleted;
        },
        reward: { gold: 150, beans: 80, exp: 80, lucky_box: 2 }
    },

    // ---- 钓鱼 ----
    fish_100: {
        id: 'fish_100',
        category: 'explore',
        name: '钓鱼新手',
        icon: '🎣',
        description: '累计钓到 100 条鱼',
        check: function() {
            return (typeof window.totalFishCaught !== 'undefined' && window.totalFishCaught >= 100);
        },
        reward: { gold: 30, beans: 15, exp: 15 }
    },
    fish_500: {
        id: 'fish_500',
        category: 'explore',
        name: '钓鱼达人',
        icon: '🐟',
        description: '累计钓到 500 条鱼',
        check: function() {
            return (typeof window.totalFishCaught !== 'undefined' && window.totalFishCaught >= 500);
        },
        reward: { gold: 80, beans: 40, exp: 40, speed_up: 1 }
    },
    fish_1000: {
        id: 'fish_1000',
        category: 'explore',
        name: '钓鱼大师',
        icon: '🏅',
        description: '累计钓到 1000 条鱼',
        check: function() {
            return (typeof window.totalFishCaught !== 'undefined' && window.totalFishCaught >= 1000);
        },
        reward: { gold: 150, beans: 80, exp: 80, energy_box: 1, lucky_box: 1 }
    },
    fish_legend_10: {
        id: 'fish_legend_10',
        category: 'explore',
        name: '传说捕手',
        icon: '🐉',
        description: '钓到 10 条传说鱼',
        check: function() {
            return (typeof window.totalLegendaryFish !== 'undefined' && window.totalLegendaryFish >= 10);
        },
        reward: { gold: 100, beans: 50, exp: 50, speed_up: 2 }
    },
    fish_legend_100: {
        id: 'fish_legend_100',
        category: 'explore',
        name: '传说猎手',
        icon: '👑',
        description: '钓到 100 条传说鱼',
        check: function() {
            return (typeof window.totalLegendaryFish !== 'undefined' && window.totalLegendaryFish >= 100);
        },
        reward: { gold: 300, beans: 150, exp: 150, energy_box: 2, lucky_box: 3, speed_up: 3 }
    },

    // ---- 挖矿 ----
    mine_iron_100: {
        id: 'mine_iron_100',
        category: 'explore',
        name: '矿工学徒',
        icon: '⛏️',
        description: '累计挖到 100 块铁矿',
        check: function() {
            return (typeof window.totalIronOre !== 'undefined' && window.totalIronOre >= 100);
        },
        reward: { gold: 30, beans: 15, exp: 15 }
    },
    mine_iron_1000: {
        id: 'mine_iron_1000',
        category: 'explore',
        name: '铁矿大亨',
        icon: '🪨',
        description: '累计挖到 1000 块铁矿',
        check: function() {
            return (typeof window.totalIronOre !== 'undefined' && window.totalIronOre >= 1000);
        },
        reward: { gold: 120, beans: 60, exp: 60, speed_up: 2 }
    },
    mine_diamond_10: {
        id: 'mine_diamond_10',
        category: 'explore',
        name: '钻石猎人',
        icon: '💎',
        description: '挖到 10 颗钻石',
        check: function() {
            return (typeof window.totalDiamond !== 'undefined' && window.totalDiamond >= 10);
        },
        reward: { gold: 80, beans: 40, exp: 40, lucky_box: 1 }
    },
    mine_diamond_100: {
        id: 'mine_diamond_100',
        category: 'explore',
        name: '钻石大亨',
        icon: '💠',
        description: '挖到 100 颗钻石',
        check: function() {
            return (typeof window.totalDiamond !== 'undefined' && window.totalDiamond >= 100);
        },
        reward: { gold: 200, beans: 100, exp: 100, energy_box: 2, lucky_box: 2 }
    },
    mine_depth_100: {
        id: 'mine_depth_100',
        category: 'explore',
        name: '深渊矿工',
        icon: '🕳️',
        description: '挖矿深度达到 100',
        check: function() {
            if (typeof window.miningState !== 'undefined' && window.miningState.depth !== undefined) {
                return window.miningState.depth >= 100;
            }
            return false;
        },
        reward: { gold: 100, beans: 50, exp: 50, speed_up: 2 }
    },

    // ---- 帕尼尼烹饪 ----
    cook_100: {
        id: 'cook_100',
        category: 'explore',
        name: '家庭厨师',
        icon: '🍳',
        description: '烹饪出 100 份食物',
        check: function() {
            return (typeof window.paniniState !== 'undefined' && paniniState.totalCooked >= 100);
        },
        reward: { gold: 30, beans: 15, exp: 15 }
    },
    cook_200: {
        id: 'cook_200',
        category: 'explore',
        name: '餐厅主厨',
        icon: '👨‍🍳',
        description: '烹饪出 200 份食物',
        check: function() {
            return (typeof window.paniniState !== 'undefined' && paniniState.totalCooked >= 200);
        },
        reward: { gold: 80, beans: 40, exp: 40, speed_up: 1 }
    },
    cook_500: {
        id: 'cook_500',
        category: 'explore',
        name: '传奇大厨',
        icon: '🏆',
        description: '烹饪出 500 份食物',
        check: function() {
            return (typeof window.paniniState !== 'undefined' && paniniState.totalCooked >= 500);
        },
        reward: { gold: 150, beans: 80, exp: 80, energy_box: 1, lucky_box: 1 }
    },
    cook_recipes_15: {
        id: 'cook_recipes_15',
        category: 'explore',
        name: '食谱收集者',
        icon: '📚',
        description: '解锁 15 个食谱',
        check: function() {
            if (typeof window.paniniState !== 'undefined' && paniniState.unlockedRecipes) {
                return paniniState.unlockedRecipes.length >= 15;
            }
            return false;
        },
        reward: { gold: 80, beans: 40, exp: 40, lucky_box: 1 }
    },
    cook_recipes_all: {
        id: 'cook_recipes_all',
        category: 'explore',
        name: '美食家',
        icon: '🌟',
        description: '解锁全部 29 个食谱',
        check: function() {
            if (typeof window.paniniState !== 'undefined' && paniniState.unlockedRecipes) {
                return paniniState.unlockedRecipes.length >= 29;
            }
            return false;
        },
        reward: { gold: 200, beans: 100, exp: 100, energy_box: 2, lucky_box: 2 }
    },
    cook_dark: {
        id: 'cook_dark',
        category: 'explore',
        name: '黑暗料理师',
        icon: '💀',
        description: '烹饪出 1 次黑暗料理',
        check: function() {
            if (typeof window.paniniState !== 'undefined' && paniniState.darkCooked !== undefined) {
                return paniniState.darkCooked >= 1;
            }
            return false;
        },
        reward: { gold: 20, beans: 10, exp: 10 }
    },

    // ---- 冒险者等级 ----
    adventurer_2: {
        id: 'adventurer_2',
        category: 'explore',
        name: '布浪人',
        icon: '⭐',
        description: '冒险者等级达到 2 级',
        check: function() {
            if (typeof window.adventurerState !== 'undefined') {
                return window.adventurerState.rank >= 2;
            }
            return false;
        },
        reward: { gold: 30, beans: 15, exp: 15 }
    },
    adventurer_4: {
        id: 'adventurer_4',
        category: 'explore',
        name: '深航者',
        icon: '🌟🌟',
        description: '冒险者等级达到 4 级',
        check: function() {
            if (typeof window.adventurerState !== 'undefined') {
                return window.adventurerState.rank >= 4;
            }
            return false;
        },
        reward: { gold: 70, beans: 35, exp: 35, lucky_box: 1 }
    },
    adventurer_7: {
        id: 'adventurer_7',
        category: 'explore',
        name: '蛾影者',
        icon: '🌟🌟🌟',
        description: '冒险者等级达到 7 级',
        check: function() {
            if (typeof window.adventurerState !== 'undefined') {
                return window.adventurerState.rank >= 7;
            }
            return false;
        },
        reward: { gold: 130, beans: 65, exp: 65, energy_box: 1 }
    },
    adventurer_9: {
        id: 'adventurer_9',
        category: 'explore',
        name: '可渡师',
        icon: '👑',
        description: '冒险者等级达到 9 级（满级）',
        check: function() {
            if (typeof window.adventurerState !== 'undefined') {
                return window.adventurerState.rank >= 9;
            }
            return false;
        },
        reward: { gold: 250, beans: 120, exp: 120, energy_box: 2, lucky_box: 2, speed_up: 3 }
    },

    // ---- 嫑界洋 · 赛博巨兽 ----
    nomo_feed_100: {
        id: 'nomo_feed_100',
        category: 'explore',
        name: '投喂者',
        icon: '🐙',
        description: '累计投喂章鱼 100 次',
        check: function() {
            if (typeof window.getTotalFedCount === 'function') {
                return window.getTotalFedCount() >= 100;
            }
            return false;
        },
        reward: { gold: 60, beans: 30, exp: 30 }
    },
    nomo_feed_500: {
        id: 'nomo_feed_500',
        category: 'explore',
        name: '深海投喂师',
        icon: '🐙✨',
        description: '累计投喂章鱼 500 次',
        check: function() {
            if (typeof window.getTotalFedCount === 'function') {
                return window.getTotalFedCount() >= 500;
            }
            return false;
        },
        reward: { gold: 150, beans: 75, exp: 75, energy_box: 1, lucky_box: 1 }
    },
    nomo_complete: {
        id: 'nomo_complete',
        category: 'explore',
        name: '星际信使',
        icon: '🌠',
        description: '唤醒赛博巨兽（92次+29种）',
        check: function() {
            if (typeof window.getNomoCompleted === 'function') {
                return window.getNomoCompleted();
            }
            return false;
        },
        reward: { gold: 300, beans: 150, exp: 150, energy_box: 2, lucky_box: 2, speed_up: 3 }
    },

    // ---- 大米洲 · 能量 ----
    energy_100: {
        id: 'energy_100',
        category: 'explore',
        name: '能量工程师',
        icon: '⚡',
        description: '生产 100 个能量',
        check: function() {
            if (typeof window.riceState !== 'undefined' && riceState.totalEnergyProduced !== undefined) {
                return riceState.totalEnergyProduced >= 100;
            }
            return false;
        },
        reward: { gold: 80, beans: 40, exp: 40, energy_box: 1 }
    },
    energy_500: {
        id: 'energy_500',
        category: 'explore',
        name: '能量大师',
        icon: '⚡✨',
        description: '生产 500 个能量',
        check: function() {
            if (typeof window.riceState !== 'undefined' && riceState.totalEnergyProduced !== undefined) {
                return riceState.totalEnergyProduced >= 500;
            }
            return false;
        },
        reward: { gold: 180, beans: 90, exp: 90, energy_box: 2, lucky_box: 2 }
    },

    // ---- 交易 ----
    trade_total_100: {
        id: 'trade_total_100',
        category: 'explore',
        name: '可颂常客',
        icon: '🏪',
        description: '交易次数（卖+买）累计 100 次',
        check: function() {
            return (typeof window.tradeTotalCount !== 'undefined' && window.tradeTotalCount >= 100);
        },
        reward: { gold: 60, beans: 30, exp: 30, lucky_box: 1 }
    },
    trade_total_500: {
        id: 'trade_total_500',
        category: 'explore',
        name: '可颂大亨',
        icon: '💰',
        description: '交易次数（卖+买）累计 500 次',
        check: function() {
            return (typeof window.tradeTotalCount !== 'undefined' && window.tradeTotalCount >= 500);
        },
        reward: { gold: 150, beans: 75, exp: 75, energy_box: 1, lucky_box: 1 }
    }
};

// ============================================
// 状态管理
// ============================================

var achievementState = {
    unlocked: [],
    claimed: [],
    hiddenUnlocked: []
};

// ===== 统一使用 window.minigameStats 作为唯一数据源 =====
if (typeof window.minigameStats === 'undefined') {
    window.minigameStats = { totalPlays: 0, bestTime: 0, totalReward: 0 };
}
// 局部引用（保持兼容）
var minigameStats = window.minigameStats;
// ======================================================

var luckyBoxStats = { maxGold: 0 };
var exchangeStats = { totalExchanges: 0 };
var gameTimeStats = { totalSeconds: 0 };

var currentCategory = 'production';
var notificationTimer = null;

// ============================================
// 数据持久化（双向同步）
// ============================================

function loadAchievementData() {
    try {
        // 1. 从 achievement_data 读取主数据
        var saved = localStorage.getItem('achievement_data');
        if (saved) {
            var data = JSON.parse(saved);
            achievementState.unlocked = data.unlocked || [];
            achievementState.claimed = data.claimed || [];
            achievementState.hiddenUnlocked = data.hiddenUnlocked || [];
            if (data.minigameStats) {
                window.minigameStats.totalPlays = data.minigameStats.totalPlays || 0;
                window.minigameStats.bestTime = data.minigameStats.bestTime || 0;
                window.minigameStats.totalReward = data.minigameStats.totalReward || 0;
            }
            luckyBoxStats = data.luckyBoxStats || { maxGold: 0 };
            exchangeStats = data.exchangeStats || { totalExchanges: 0 };
            gameTimeStats = data.gameTimeStats || { totalSeconds: 0 };
        }

        // 2. 从 minigame_stats 读取（覆盖更新，因为 cardmatch.html 保存到这里）
        var miniSaved = localStorage.getItem('minigame_stats');
        if (miniSaved) {
            var miniData = JSON.parse(miniSaved);
            if (miniData) {
                window.minigameStats.totalPlays = miniData.totalPlays || 0;
                window.minigameStats.bestTime = miniData.bestTime || 0;
                window.minigameStats.totalReward = miniData.totalReward || 0;
                console.log('📊 从 minigame_stats 加载数据:', window.minigameStats);
            }
        }
    } catch(e) {
        console.warn('加载成就数据失败:', e);
    }
}

function saveAchievementData() {
    try {
        // 1. 保存到 achievement_data（主数据）
        var data = {
            unlocked: achievementState.unlocked,
            claimed: achievementState.claimed,
            hiddenUnlocked: achievementState.hiddenUnlocked,
            minigameStats: {
                totalPlays: window.minigameStats.totalPlays || 0,
                bestTime: window.minigameStats.bestTime || 0,
                totalReward: window.minigameStats.totalReward || 0
            },
            luckyBoxStats: luckyBoxStats,
            exchangeStats: exchangeStats,
            gameTimeStats: gameTimeStats
        };
        localStorage.setItem('achievement_data', JSON.stringify(data));

        // 2. 同步保存到 minigame_stats（供 cardmatch.html 读取）
        var miniData = {
            totalPlays: window.minigameStats.totalPlays || 0,
            bestTime: window.minigameStats.bestTime || 0,
            totalReward: window.minigameStats.totalReward || 0
        };
        localStorage.setItem('minigame_stats', JSON.stringify(miniData));
        console.log('💾 数据已保存，minigameStats:', window.minigameStats);
    } catch(e) {
        console.warn('保存成就数据失败:', e);
    }
}

// ============================================
// 成就检查与解锁
// ============================================

function checkAchievements() {
    var newUnlocked = [];
    for (var id in ACHIEVEMENT_DEFS) {
        var def = ACHIEVEMENT_DEFS[id];
        if (achievementState.claimed.indexOf(id) !== -1) continue;
        if (achievementState.unlocked.indexOf(id) !== -1) continue;
        if (def.isHidden) {
            if (def.check()) {
                achievementState.hiddenUnlocked.push(id);
                achievementState.unlocked.push(id);
                newUnlocked.push(id);
                claimAchievementReward(id);
                saveAchievementData();
            }
            continue;
        }
        if (def.check()) {
            achievementState.unlocked.push(id);
            newUnlocked.push(id);
            saveAchievementData();
        }
    }
    if (newUnlocked.length > 0) {
        showAchievementNotification(newUnlocked);
        updateAchievementRedDot();
        if (typeof renderAchievementList === 'function') renderAchievementList(currentCategory);
        if (typeof updateAchievementStats === 'function') updateAchievementStats();
    }
    return newUnlocked;
}

// ============================================
// 领取奖励
// ============================================

function claimAchievementReward(achievementId) {
    var def = ACHIEVEMENT_DEFS[achievementId];
    if (!def) return false;
    if (achievementState.claimed.indexOf(achievementId) !== -1) return false;
    if (achievementState.unlocked.indexOf(achievementId) === -1) return false;

    var reward = def.reward;
    if (reward.gold) gold += reward.gold;
    if (reward.beans) cocoaBeans += reward.beans;
    if (reward.exp) addExp(reward.exp);
    if (reward.speed_up) {
        if (typeof playerBag !== 'undefined') {
            playerBag.speed_up = (playerBag.speed_up || 0) + reward.speed_up;
            if (typeof savePlayerBag === 'function') savePlayerBag();
        }
    }
    if (reward.refresh) {
        if (typeof playerBag !== 'undefined') {
            playerBag.refresh = (playerBag.refresh || 0) + reward.refresh;
            if (typeof savePlayerBag === 'function') savePlayerBag();
        }
    }
    if (reward.lucky_box) {
        if (typeof playerBag !== 'undefined') {
            playerBag.lucky_box = (playerBag.lucky_box || 0) + reward.lucky_box;
            if (typeof savePlayerBag === 'function') savePlayerBag();
        }
    }
    if (reward.energy_box) {
        if (typeof playerBag !== 'undefined') {
            playerBag.energy_box = (playerBag.energy_box || 0) + reward.energy_box;
            if (typeof savePlayerBag === 'function') savePlayerBag();
        }
    }

    achievementState.claimed.push(achievementId);
    var idx = achievementState.unlocked.indexOf(achievementId);
    if (idx !== -1) achievementState.unlocked.splice(idx, 1);

    saveAchievementData();
    updateAchievementRedDot();
    if (typeof renderAchievementList === 'function') renderAchievementList(currentCategory);
    if (typeof updateAchievementStats === 'function') updateAchievementStats();
    if (typeof refreshUI === 'function') refreshUI();
    if (typeof saveGame === 'function') saveGame();

    if (typeof showMessage === 'function') {
        var rewardText = '';
        if (reward.gold) rewardText += '🪙+' + reward.gold + ' ';
        if (reward.beans) rewardText += '🫘+' + reward.beans + ' ';
        if (reward.exp) rewardText += '⭐+' + reward.exp + ' ';
        showMessage('🎁 领取成就奖励: ' + def.name + ' ' + rewardText, false);
    }
    if (typeof soundItemGet === 'function') soundItemGet();
    return true;
}

// ============================================
// 分类标签渲染
// ============================================

function renderCategoryTabs() {
    var container = document.getElementById('categoryTabs');
    if (!container) return;
    container.innerHTML = '';

    var wrapper = document.createElement('div');
    wrapper.className = 'category-tabs-wrapper';

    var leftBtn = document.createElement('button');
    leftBtn.className = 'category-tab-btn';
    leftBtn.textContent = '◀';
    leftBtn.onclick = function() {
        var scrollContainer = document.querySelector('.category-tabs-scroll');
        if (scrollContainer) {
            scrollContainer.scrollBy({ left: -120, behavior: 'smooth' });
        }
    };

    var scrollContainer = document.createElement('div');
    scrollContainer.className = 'category-tabs-scroll';
    scrollContainer.id = 'categoryTabsScroll';

    var rightBtn = document.createElement('button');
    rightBtn.className = 'category-tab-btn';
    rightBtn.textContent = '▶';
    rightBtn.onclick = function() {
        var scrollContainer = document.querySelector('.category-tabs-scroll');
        if (scrollContainer) {
            scrollContainer.scrollBy({ left: 120, behavior: 'smooth' });
        }
    };

    var categories = ['production', 'sales', 'wealth', 'level', 'upgrade', 'special', 'minigame', 'explore'];
    var categoryNames = {
        production: '🏭 生产类',
        sales: '💰 销售类',
        wealth: '🪙 财富类',
        level: '⭐ 等级类',
        upgrade: '🔧 升级类',
        special: '🎁 特殊类',
        minigame: '🎮 小游戏类',
        explore: '🗺️ 探险类'
    };

    for (var i = 0; i < categories.length; i++) {
        var cat = categories[i];
        var tab = document.createElement('span');
        tab.className = 'category-tab';
        tab.dataset.category = cat;
        tab.textContent = categoryNames[cat] || cat;
        if (cat === currentCategory) {
            tab.classList.add('active');
        }
        tab.onclick = function() {
            switchAchievementCategory(this.dataset.category);
        };
        scrollContainer.appendChild(tab);
    }

    wrapper.appendChild(leftBtn);
    wrapper.appendChild(scrollContainer);
    wrapper.appendChild(rightBtn);
    container.appendChild(wrapper);

    function updateButtons() {
        if (!scrollContainer) return;
        var maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        leftBtn.disabled = (scrollContainer.scrollLeft <= 0);
        leftBtn.style.opacity = leftBtn.disabled ? '0.3' : '1';
        leftBtn.style.cursor = leftBtn.disabled ? 'not-allowed' : 'pointer';
        rightBtn.disabled = (scrollContainer.scrollLeft >= maxScroll - 1);
        rightBtn.style.opacity = rightBtn.disabled ? '0.3' : '1';
        rightBtn.style.cursor = rightBtn.disabled ? 'not-allowed' : 'pointer';
    }

    scrollContainer.addEventListener('scroll', updateButtons);
    setTimeout(updateButtons, 100);
    window.addEventListener('resize', updateButtons);
}

// ============================================
// 合并成就通知
// ============================================

function showAchievementNotification(achievementIds) {
    if (!achievementIds || achievementIds.length === 0) return;
    if (typeof soundAchievement === 'function') {
        setTimeout(function() { soundAchievement(); }, 200);
    }
    if (notificationTimer) {
        clearTimeout(notificationTimer);
        notificationTimer = null;
        var oldNotif = document.querySelector('.achievement-notification');
        if (oldNotif) oldNotif.remove();
    }

    var container = document.getElementById('achievementNotificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'achievementNotificationContainer';
        container.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:10px;';
        document.body.appendChild(container);
    }

    var count = achievementIds.length;
    var icons = achievementIds.map(function(id) {
        var def = ACHIEVEMENT_DEFS[id];
        return def ? def.icon : '🏆';
    }).join(' ');

    var names = achievementIds.map(function(id) {
        var def = ACHIEVEMENT_DEFS[id];
        return def ? def.name : '未知成就';
    }).join('、');

    var hiddenLabel = achievementIds.some(function(id) {
        var def = ACHIEVEMENT_DEFS[id];
        return def && def.isHidden;
    }) ? ' 🌟 包含隐藏成就' : '';

    var notif = document.createElement('div');
    notif.className = 'achievement-notification';
    notif.style.cssText = 'background:linear-gradient(145deg, #fffaf0, #f5ede4);border-radius:24px;padding:20px 32px;box-shadow:0 20px 60px rgba(0,0,0,0.3);border:2px solid #ffd700;text-align:center;animation:notifPopIn 0.4s ease;pointer-events:auto;cursor:pointer;min-width:280px;max-width:90vw;';
    notif.innerHTML =
        '<div style="font-size:0.8rem;color:#c98f5e;font-weight:bold;margin-bottom:4px;">🎉 解锁了 ' + count + ' 个新成就！' + hiddenLabel + '</div>' +
        '<div style="font-size:2.5rem;margin:4px 0;">' + icons + '</div>' +
        '<div style="font-size:0.9rem;font-weight:bold;color:#5a2e1c;margin:4px 0;">' + names + '</div>' +
        '<div style="font-size:0.7rem;color:#a56b3a;margin-top:6px;">点击前往领取奖励</div>';

    notif.onclick = function() {
        this.style.animation = 'notifPopOut 0.3s ease';
        setTimeout(function() { if (notif.parentNode) notif.remove(); }, 300);
        openAchievementModal();
    };

    container.appendChild(notif);

    if (!document.getElementById('notifAnimStyle')) {
        var style = document.createElement('style');
        style.id = 'notifAnimStyle';
        style.textContent =
            '@keyframes notifPopIn { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.05); } 100% { transform: scale(1); opacity: 1; } } ' +
            '@keyframes notifPopOut { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(0.5); opacity: 0; } }';
        document.head.appendChild(style);
    }

    notificationTimer = setTimeout(function() {
        if (notif.parentNode) {
            notif.style.animation = 'notifPopOut 0.3s ease';
            setTimeout(function() { if (notif.parentNode) notif.remove(); notificationTimer = null; }, 300);
        }
    }, 4000);
}

// ============================================
// 打开成就面板
// ============================================

function openAchievementModal() {
    // ===== 强制从 minigame_stats 加载最新数据 =====
    try {
        var miniSaved = localStorage.getItem('minigame_stats');
        if (miniSaved) {
            var miniData = JSON.parse(miniSaved);
            if (miniData) {
                window.minigameStats.totalPlays = miniData.totalPlays || 0;
                window.minigameStats.bestTime = miniData.bestTime || 0;
                window.minigameStats.totalReward = miniData.totalReward || 0;
                console.log('📊 成就面板加载最新数据:', window.minigameStats);
            }
        }
    } catch(e) {
        console.warn('加载 minigame_stats 失败:', e);
    }

    // 然后再执行原有的加载逻辑（会同步到 achievement_data）
    loadAchievementData();

    var modal = document.getElementById('achievementModal');
    if (modal) {
        // 重新渲染成就列表（会触发 checkAchievements）
        renderCategoryTabs();
        renderAchievementList(currentCategory);
        updateAchievementStats();
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    } else {
        console.error('❌ 成就模态框不存在');
    }
}

// ============================================
// 红点控制
// ============================================

function updateAchievementRedDot() {
    var hasUnclaimed = achievementState.unlocked.length > 0;
    var badge = document.getElementById('achievementBadge');
    if (badge) {
        if (hasUnclaimed) {
            badge.style.display = 'block';
            badge.textContent = achievementState.unlocked.length;
        } else {
            badge.style.display = 'none';
        }
    }
}

// ============================================
// 统计信息
// ============================================

function getAchievementStats() {
    var total = 0, unlocked = 0, claimed = 0;
    for (var id in ACHIEVEMENT_DEFS) {
        var def = ACHIEVEMENT_DEFS[id];
        if (def.isHidden) {
            if (achievementState.hiddenUnlocked.indexOf(id) !== -1) {
                total++;
                unlocked++;
                if (achievementState.claimed.indexOf(id) !== -1) claimed++;
            }
            continue;
        }
        total++;
        if (achievementState.claimed.indexOf(id) !== -1) {
            unlocked++;
            claimed++;
        } else if (achievementState.unlocked.indexOf(id) !== -1) {
            unlocked++;
        }
    }
    return {
        total: total,
        unlocked: unlocked,
        claimed: claimed,
        unclaimed: unlocked - claimed,
        progress: total > 0 ? Math.round((unlocked / total) * 100) : 0
    };
}

function updateAchievementStats() {
    var stats = getAchievementStats();
    var statsEl = document.getElementById('achievementStats');
    if (statsEl) {
        statsEl.innerHTML =
            '已解锁 <strong>' + stats.unlocked + '</strong> / ' + stats.total + ' 个成就 (' + stats.progress + '%)' +
            (stats.unclaimed > 0 ? ' <span style="color:#e7a05e;font-weight:bold;">🎁 ' + stats.unclaimed + ' 个可领取</span>' : '');
    }
}

// ============================================
// 切换分类
// ============================================

function switchAchievementCategory(category) {
    currentCategory = category;
    renderAchievementList(category);
    document.querySelectorAll('.category-tab').forEach(function(tab) {
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

// ============================================
// 渲染成就列表（含进度条修复）
// ============================================

function renderAchievementList(category) {
    var container = document.getElementById('achievementList');
    if (!container) {
        console.error('❌ achievementList 容器不存在！');
        return;
    }

    if (!category) category = currentCategory;
    else currentCategory = category;

    container.innerHTML = '';
    container.style.display = 'grid';

    var items = [];
    for (var id in ACHIEVEMENT_DEFS) {
        var def = ACHIEVEMENT_DEFS[id];
        if (def.isHidden && achievementState.hiddenUnlocked.indexOf(id) === -1) continue;
        if (def.category === category) {
            var isUnlocked = achievementState.unlocked.indexOf(id) !== -1;
            var isClaimed = achievementState.claimed.indexOf(id) !== -1;
            var progress = getAchievementProgress(id);
            items.push({
                id: id,
                def: def,
                isUnlocked: isUnlocked,
                isClaimed: isClaimed,
                progress: progress
            });
        }
    }

    items.sort(function(a, b) {
        var aUnclaimed = a.isUnlocked && !a.isClaimed;
        var bUnclaimed = b.isUnlocked && !b.isClaimed;
        if (aUnclaimed && !bUnclaimed) return -1;
        if (!aUnclaimed && bUnclaimed) return 1;
        if (a.isClaimed && !b.isClaimed) return 1;
        if (!a.isClaimed && b.isClaimed) return -1;
        return 0;
    });

    if (items.length === 0) {
        container.innerHTML = '<div class="achievement-empty">该分类下暂无成就</div>';
        return;
    }

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var def = item.def;
        var isUnlocked = item.isUnlocked;
        var isClaimed = item.isClaimed;
        var progress = item.progress;
        // 如果进度为 null，设为 0
        if (progress === null || progress === undefined) progress = 0;

        var card = document.createElement('div');
        card.className = 'achievement-card';

        var statusText = '';
        var statusClass = '';
        if (isClaimed) {
            statusText = '✅ 已领取';
            statusClass = 'status-claimed';
        } else if (isUnlocked) {
            statusText = '🎁 可领取';
            statusClass = 'status-unlocked';
        } else {
            statusText = '🔒 未解锁';
            statusClass = 'status-locked';
        }

        var rewardText = '';
        var r = def.reward;
        if (r.gold) rewardText += '🪙' + r.gold + ' ';
        if (r.beans) rewardText += '🫘' + r.beans + ' ';
        if (r.exp) rewardText += '⭐' + r.exp + ' ';
        if (r.speed_up) rewardText += '⏩×' + r.speed_up + ' ';
        if (r.refresh) rewardText += '🔄×' + r.refresh + ' ';
        if (r.lucky_box) rewardText += '🎰×' + r.lucky_box + ' ';
        if (r.energy_box) rewardText += '🎁×' + r.energy_box + ' ';

        var hiddenBadge = def.isHidden ? '<span class="hidden-badge">🌟</span>' : '';

        // 修复：只有未解锁（未完成）时才显示进度条，且进度值有效
        var showProgress = !isClaimed && !isUnlocked;
        var progressPercent = showProgress ? Math.min(100, Math.round(progress)) : 0;

        card.innerHTML = `
            <div class="card-icon">${def.icon}</div>
            <div class="card-name">${def.name} ${hiddenBadge}</div>
            <div class="card-desc">${def.description}</div>
            ${rewardText ? `<div class="card-reward">🎁 ${rewardText}</div>` : ''}
            ${showProgress ? `
                <div class="card-progress-track">
                    <div class="card-progress-fill" style="width:${progressPercent}%;"></div>
                </div>
                <div class="card-progress-text">${progressPercent}%</div>
            ` : ''}
            <div class="card-status ${statusClass}">${statusText}</div>
            ${isUnlocked && !isClaimed ? `
                <button class="claim-btn" data-id="${def.id}">领取奖励</button>
            ` : ''}
        `;

        var btn = card.querySelector('.claim-btn');
        if (btn) {
            btn.onclick = function() {
                var id = this.dataset.id;
                claimAchievementReward(id);
            };
        }

        container.appendChild(card);
    }

    console.log('✅ 成就列表渲染完成，共 ' + items.length + ' 张卡片');
}

// ============================================
// 进度计算（完整版 - 覆盖所有成就）
// ============================================

function getAchievementProgress(achievementId) {
    var def = ACHIEVEMENT_DEFS[achievementId];
    if (!def) return null;

    // 如果已经解锁或已领取，返回 100%
    if (achievementState.unlocked.indexOf(achievementId) !== -1 ||
        achievementState.claimed.indexOf(achievementId) !== -1) {
        return 100;
    }

    // ---- 生产类 ----
    if (achievementId === 'produce_10') {
        return Math.min(100, Math.round((totalProduced / 10) * 100));
    }
    if (achievementId === 'produce_50') {
        return Math.min(100, Math.round((totalProduced / 50) * 100));
    }
    if (achievementId === 'produce_100') {
        return Math.min(100, Math.round((totalProduced / 100) * 100));
    }
    if (achievementId === 'produce_500') {
        return Math.min(100, Math.round((totalProduced / 500) * 100));
    }

    // ---- 销售类 ----
    if (achievementId === 'sell_10') {
        return Math.min(100, Math.round((totalSold / 10) * 100));
    }
    if (achievementId === 'sell_50') {
        return Math.min(100, Math.round((totalSold / 50) * 100));
    }
    if (achievementId === 'sell_100') {
        return Math.min(100, Math.round((totalSold / 100) * 100));
    }
    if (achievementId === 'sell_500') {
        return Math.min(100, Math.round((totalSold / 500) * 100));
    }
    if (achievementId === 'sell_1000') {
        return Math.min(100, Math.round((totalSold / 1000) * 100));
    }
    if (achievementId === 'sell_5000') {
        return Math.min(100, Math.round((totalSold / 5000) * 100));
    }

    // ---- 财富类 ----
    if (achievementId === 'gold_100') {
        return Math.min(100, Math.round((gold / 100) * 100));
    }
    if (achievementId === 'gold_1000') {
        return Math.min(100, Math.round((gold / 1000) * 100));
    }
    if (achievementId === 'gold_10000') {
        return Math.min(100, Math.round((gold / 10000) * 100));
    }
    if (achievementId === 'gold_50000') {
        return Math.min(100, Math.round((gold / 50000) * 100));
    }
    if (achievementId === 'gold_100000') {
        return Math.min(100, Math.round((gold / 100000) * 100));
    }

    // ---- 等级类 ----
    if (achievementId === 'level_5') {
        return Math.min(100, Math.round((level / 5) * 100));
    }
    if (achievementId === 'level_10') {
        return Math.min(100, Math.round((level / 10) * 100));
    }
    if (achievementId === 'level_20') {
        return Math.min(100, Math.round((level / 20) * 100));
    }

    // ---- 升级类 ----
    if (achievementId === 'upgrade_miao_5') {
        return Math.min(100, Math.round((miaoBargainLevel / 5) * 100));
    }
    if (achievementId === 'upgrade_miao_10') {
        return Math.min(100, Math.round((miaoBargainLevel / 10) * 100));
    }
    if (achievementId === 'upgrade_speed_5') {
        return Math.min(100, Math.round((productionSpeedLevel / 5) * 100));
    }
    if (achievementId === 'upgrade_speed_10') {
        return Math.min(100, Math.round((productionSpeedLevel / 10) * 100));
    }
    if (achievementId === 'upgrade_workaholic_5') {
        return Math.min(100, Math.round((workaholicLevel / 5) * 100));
    }
    if (achievementId === 'upgrade_workaholic_10') {
        return Math.min(100, Math.round((workaholicLevel / 10) * 100));
    }

    // ---- 特殊类 ----
    if (achievementId === 'hidden_1') {
        var count1 = 0;
        for (var id in hiddenInventory) count1 += hiddenInventory[id] || 0;
        return Math.min(100, Math.round((count1 / 1) * 100));
    }
    if (achievementId === 'hidden_10') {
        var count10 = 0;
        for (var id in hiddenInventory) count10 += hiddenInventory[id] || 0;
        return Math.min(100, Math.round((count10 / 10) * 100));
    }
    if (achievementId === 'order_5') {
        var ordersCompleted = (typeof totalOrdersCompleted !== 'undefined') ? totalOrdersCompleted : 0;
        return Math.min(100, Math.round((ordersCompleted / 5) * 100));
    }
    if (achievementId === 'order_20') {
        var ordersCompleted20 = (typeof totalOrdersCompleted !== 'undefined') ? totalOrdersCompleted : 0;
        return Math.min(100, Math.round((ordersCompleted20 / 20) * 100));
    }
    if (achievementId === 'farm_all') {
        var unlockedCount = 0;
        if (typeof farmLands !== 'undefined' && farmLands) {
            for (var i = 0; i < farmLands.length; i++) {
                if (farmLands[i].unlocked) unlockedCount++;
            }
        }
        return Math.min(100, Math.round((unlockedCount / 24) * 100));
    }

    // ---- 小游戏类 ----
    if (achievementId === 'minigame_memory') {
        // 记忆大师：30秒内完成 -> 用 bestTime 反向计算进度
        var best = (window.minigameStats && window.minigameStats.bestTime) || 0;
        if (best <= 0) return 0;
        if (best <= 30) return 100;
        // 30秒以上，按比例计算，60秒为0%
        return Math.min(100, Math.max(0, Math.round(((60 - best) / 30) * 100)));
    }
    if (achievementId === 'minigame_10') {
        var plays10 = (window.minigameStats && window.minigameStats.totalPlays) || 0;
        return Math.min(100, Math.round((plays10 / 10) * 100));
    }
    if (achievementId === 'minigame_50') {
        var plays50 = (window.minigameStats && window.minigameStats.totalPlays) || 0;
        return Math.min(100, Math.round((plays50 / 50) * 100));
    }
    if (achievementId === 'minigame_100') {
        var plays100 = (window.minigameStats && window.minigameStats.totalPlays) || 0;
        return Math.min(100, Math.round((plays100 / 100) * 100));
    }
    if (achievementId === 'minigame_lightning') {
        // 闪电手：20秒内完成
        var bestL = (window.minigameStats && window.minigameStats.bestTime) || 0;
        if (bestL <= 0) return 0;
        if (bestL <= 20) return 100;
        return Math.min(100, Math.max(0, Math.round(((40 - bestL) / 20) * 100)));
    }

    // ---- 隐藏成就（无进度概念，未完成则0%） ----
    if (achievementId === 'hidden_one_night_rich' ||
        achievementId === 'hidden_speed_demon' ||
        achievementId === 'hidden_bean_king' ||
        achievementId === 'hidden_signin_king' ||
        achievementId === 'hidden_all_recipes' ||
        achievementId === 'hidden_all_slots' ||
        achievementId === 'hidden_exchange_master' ||
        achievementId === 'hidden_grinder' ||
        achievementId === 'treasure_collector_all') {
        return 0;
    }

    // ---- 探险类 ----
    if (achievementId === 'explore_3') {
        var un3 = 0;
        if (typeof window.getUnlockedCount === 'function') {
            un3 = window.getUnlockedCount();
        }
        return Math.min(100, Math.round((un3 / 3) * 100));
    }
    if (achievementId === 'explore_5') {
        var un5 = 0;
        if (typeof window.getUnlockedCount === 'function') {
            un5 = window.getUnlockedCount();
        }
        return Math.min(100, Math.round((un5 / 5) * 100));
    }
    if (achievementId === 'explore_8') {
        var un8 = 0;
        if (typeof window.getUnlockedCount === 'function') {
            un8 = window.getUnlockedCount();
        }
        return Math.min(100, Math.round((un8 / 8) * 100));
    }
    if (achievementId === 'explore_10') {
        var un10 = 0;
        if (typeof window.getUnlockedCount === 'function') {
            un10 = window.getUnlockedCount();
        }
        return Math.min(100, Math.round((un10 / 10) * 100));
    }
    if (achievementId === 'explore_story_all') {
        var totalStories = 0, completedStories = 0;
        if (typeof window.STORY_DATA !== 'undefined') {
            for (var key in window.STORY_DATA) {
                totalStories++;
                if (window.STORY_DATA[key].completed) completedStories++;
            }
        }
        if (totalStories === 0) return 0;
        return Math.min(100, Math.round((completedStories / totalStories) * 100));
    }

    // ---- 钓鱼 ----
    if (achievementId === 'fish_100') {
        var f100 = (typeof window.totalFishCaught !== 'undefined') ? window.totalFishCaught : 0;
        return Math.min(100, Math.round((f100 / 100) * 100));
    }
    if (achievementId === 'fish_500') {
        var f500 = (typeof window.totalFishCaught !== 'undefined') ? window.totalFishCaught : 0;
        return Math.min(100, Math.round((f500 / 500) * 100));
    }
    if (achievementId === 'fish_1000') {
        var f1000 = (typeof window.totalFishCaught !== 'undefined') ? window.totalFishCaught : 0;
        return Math.min(100, Math.round((f1000 / 1000) * 100));
    }
    if (achievementId === 'fish_legend_10') {
        var l10 = (typeof window.totalLegendaryFish !== 'undefined') ? window.totalLegendaryFish : 0;
        return Math.min(100, Math.round((l10 / 10) * 100));
    }
    if (achievementId === 'fish_legend_100') {
        var l100 = (typeof window.totalLegendaryFish !== 'undefined') ? window.totalLegendaryFish : 0;
        return Math.min(100, Math.round((l100 / 100) * 100));
    }

    // ---- 挖矿 ----
    if (achievementId === 'mine_iron_100') {
        var i100 = (typeof window.totalIronOre !== 'undefined') ? window.totalIronOre : 0;
        return Math.min(100, Math.round((i100 / 100) * 100));
    }
    if (achievementId === 'mine_iron_1000') {
        var i1000 = (typeof window.totalIronOre !== 'undefined') ? window.totalIronOre : 0;
        return Math.min(100, Math.round((i1000 / 1000) * 100));
    }
    if (achievementId === 'mine_diamond_10') {
        var d10 = (typeof window.totalDiamond !== 'undefined') ? window.totalDiamond : 0;
        return Math.min(100, Math.round((d10 / 10) * 100));
    }
    if (achievementId === 'mine_diamond_100') {
        var d100 = (typeof window.totalDiamond !== 'undefined') ? window.totalDiamond : 0;
        return Math.min(100, Math.round((d100 / 100) * 100));
    }
    if (achievementId === 'mine_depth_100') {
        var depth = 0;
        if (typeof window.miningState !== 'undefined' && window.miningState.depth !== undefined) {
            depth = window.miningState.depth;
        }
        return Math.min(100, Math.round((depth / 100) * 100));
    }

    // ---- 烹饪 ----
    if (achievementId === 'cook_100') {
        var c100 = (typeof window.paniniState !== 'undefined' && paniniState.totalCooked !== undefined) ? paniniState.totalCooked : 0;
        return Math.min(100, Math.round((c100 / 100) * 100));
    }
    if (achievementId === 'cook_200') {
        var c200 = (typeof window.paniniState !== 'undefined' && paniniState.totalCooked !== undefined) ? paniniState.totalCooked : 0;
        return Math.min(100, Math.round((c200 / 200) * 100));
    }
    if (achievementId === 'cook_500') {
        var c500 = (typeof window.paniniState !== 'undefined' && paniniState.totalCooked !== undefined) ? paniniState.totalCooked : 0;
        return Math.min(100, Math.round((c500 / 500) * 100));
    }
    if (achievementId === 'cook_recipes_15') {
        var r15 = 0;
        if (typeof window.paniniState !== 'undefined' && paniniState.unlockedRecipes) {
            r15 = paniniState.unlockedRecipes.length;
        }
        return Math.min(100, Math.round((r15 / 15) * 100));
    }
    if (achievementId === 'cook_recipes_all') {
        var rall = 0;
        if (typeof window.paniniState !== 'undefined' && paniniState.unlockedRecipes) {
            rall = paniniState.unlockedRecipes.length;
        }
        return Math.min(100, Math.round((rall / 29) * 100));
    }
    if (achievementId === 'cook_dark') {
        var dark = (typeof window.paniniState !== 'undefined' && paniniState.darkCooked !== undefined) ? paniniState.darkCooked : 0;
        return Math.min(100, Math.round((dark / 1) * 100));
    }

    // ---- 冒险者 ----
    if (achievementId === 'adventurer_2') {
        var rank2 = 0;
        if (typeof window.adventurerState !== 'undefined') {
            rank2 = window.adventurerState.rank;
        }
        return Math.min(100, Math.round((rank2 / 2) * 100));
    }
    if (achievementId === 'adventurer_4') {
        var rank4 = 0;
        if (typeof window.adventurerState !== 'undefined') {
            rank4 = window.adventurerState.rank;
        }
        return Math.min(100, Math.round((rank4 / 4) * 100));
    }
    if (achievementId === 'adventurer_7') {
        var rank7 = 0;
        if (typeof window.adventurerState !== 'undefined') {
            rank7 = window.adventurerState.rank;
        }
        return Math.min(100, Math.round((rank7 / 7) * 100));
    }
    if (achievementId === 'adventurer_9') {
        var rank9 = 0;
        if (typeof window.adventurerState !== 'undefined') {
            rank9 = window.adventurerState.rank;
        }
        return Math.min(100, Math.round((rank9 / 9) * 100));
    }

    // ---- 章鱼投喂 ----
    if (achievementId === 'nomo_feed_100') {
        var n100 = 0;
        if (typeof window.getTotalFedCount === 'function') {
            n100 = window.getTotalFedCount();
        }
        return Math.min(100, Math.round((n100 / 100) * 100));
    }
    if (achievementId === 'nomo_feed_500') {
        var n500 = 0;
        if (typeof window.getTotalFedCount === 'function') {
            n500 = window.getTotalFedCount();
        }
        return Math.min(100, Math.round((n500 / 500) * 100));
    }
    if (achievementId === 'nomo_complete') {
        return 0;
    }

    // ---- 能量 ----
    if (achievementId === 'energy_100') {
        var e100 = 0;
        if (typeof window.riceState !== 'undefined' && riceState.totalEnergyProduced !== undefined) {
            e100 = riceState.totalEnergyProduced;
        }
        return Math.min(100, Math.round((e100 / 100) * 100));
    }
    if (achievementId === 'energy_500') {
        var e500 = 0;
        if (typeof window.riceState !== 'undefined' && riceState.totalEnergyProduced !== undefined) {
            e500 = riceState.totalEnergyProduced;
        }
        return Math.min(100, Math.round((e500 / 500) * 100));
    }

    // ---- 交易 ----
    if (achievementId === 'trade_total_100') {
        var t100 = (typeof window.tradeTotalCount !== 'undefined') ? window.tradeTotalCount : 0;
        return Math.min(100, Math.round((t100 / 100) * 100));
    }
    if (achievementId === 'trade_total_500') {
        var t500 = (typeof window.tradeTotalCount !== 'undefined') ? window.tradeTotalCount : 0;
        return Math.min(100, Math.round((t500 / 500) * 100));
    }

    // 默认：未匹配的成就返回 0（不显示进度条）
    return 0;
}

// ============================================
// 外部调用
// ============================================

function updateAchievements() {
    loadAchievementData();
    checkAchievements();
    renderCategoryTabs();
    renderAchievementList(currentCategory);
    updateAchievementStats();
    updateAchievementRedDot();
}

function clearAchievementData() {
    achievementState.unlocked = [];
    achievementState.claimed = [];
    achievementState.hiddenUnlocked = [];
    window.minigameStats = { totalPlays: 0, bestTime: 0, totalReward: 0 };
    luckyBoxStats = { maxGold: 0 };
    exchangeStats = { totalExchanges: 0 };
    gameTimeStats = { totalSeconds: 0 };
    localStorage.removeItem('achievement_data');
    localStorage.removeItem('minigame_stats');
    updateAchievementRedDot();
    renderAchievementList(currentCategory);
    updateAchievementStats();
}

// ============================================
// 初始化
// ============================================

loadAchievementData();

if (!window._gameTimeInterval) {
    window._gameTimeInterval = setInterval(function() {
        gameTimeStats.totalSeconds += 1;
        if (gameTimeStats.totalSeconds % 60 === 0) saveAchievementData();
    }, 1000);
}

// 暴露全局接口
window.ACHIEVEMENT_DEFS = ACHIEVEMENT_DEFS;
window.ACHIEVEMENT_CATEGORIES = ACHIEVEMENT_CATEGORIES;
window.achievementState = achievementState;
window.minigameStats = window.minigameStats;
window.luckyBoxStats = luckyBoxStats;
window.exchangeStats = exchangeStats;
window.gameTimeStats = gameTimeStats;
window.checkAchievements = checkAchievements;
window.claimAchievementReward = claimAchievementReward;
window.renderAchievementList = renderAchievementList;
window.updateAchievementStats = updateAchievementStats;
window.updateAchievementRedDot = updateAchievementRedDot;
window.switchAchievementCategory = switchAchievementCategory;
window.getAchievementStats = getAchievementStats;
window.getAchievementProgress = getAchievementProgress;
window.showAchievementNotification = showAchievementNotification;
window.clearAchievementData = clearAchievementData;
window.updateAchievements = updateAchievements;
window.renderCategoryTabs = renderCategoryTabs;
window.openAchievementModal = openAchievementModal;

console.log('🏆 成就系统加载完成，共 ' + Object.keys(ACHIEVEMENT_DEFS).length + ' 个成就');