// ============================================================
// panini.js · 帕尼尼大陆 · 美食实验室（完整版 + 成就统计）
// ============================================================
console.log('🥪 帕尼尼大陆模块加载中...');

// ============================================================
// 食材配置（8种）
// ============================================================
var PANINI_INGREDIENTS = [
    { key: 'tuna', emoji: '🐠', name: '金枪鱼', img: null, source: 'backpack' },
    { key: 'legendfish', emoji: '🐉', name: '传说鱼', img: null, source: 'backpack' },
    { key: 'egg', emoji: '🥚', name: '鸡蛋', img: null, source: 'backpack' },
    { key: 'cocoa_powder', emoji: '🍫', name: '可可粉', img: 'images/cocopowder.png', source: 'backpack' },
    { key: 'rice_flour', emoji: '🌾', name: '面粉', img: 'images/flour.png', source: 'backpack' },
    { key: 'warm_butter', emoji: '🧊', name: '温暖黄油', img: 'images/energy/温暖黄油.png', source: 'energy' },
    { key: 'cheese_powder', emoji: '🧀', name: '高塔芝士粉', img: 'images/energy/高塔芝士粉.png', source: 'energy' },
    { key: 'time_pudding', emoji: '⌛', name: '时光布丁', img: 'images/energy/时光布丁.png', source: 'energy' }
];

// ============================================================
// 食物配置（29种）
// ============================================================
var PANINI_RECIPES = [
    { id: 'sushi', name: '金枪鱼寿司', icon: '🍣',
      ingredients: [{ key: 'tuna', amount: 3 }, { key: 'rice_flour', amount: 3 }],
      alternatives: [{ key: 'tuna', amount: 3 }, { key: 'cocoa_powder', amount: 3 }] },
    { id: 'croissant', name: '可颂面包', icon: '🥐',
      ingredients: [{ key: 'rice_flour', amount: 3 }, { key: 'warm_butter', amount: 3 }],
      alternatives: [{ key: 'cocoa_powder', amount: 3 }, { key: 'warm_butter', amount: 3 }] },
    { id: 'chocolate_cake', name: '巧克力蛋糕', icon: '🍰',
      ingredients: [{ key: 'cocoa_powder', amount: 3 }, { key: 'egg', amount: 3 }],
      alternatives: [{ key: 'cocoa_powder', amount: 3 }, { key: 'cheese_powder', amount: 3 }] },
    { id: 'pudding', name: '焦糖布丁', icon: '🍮',
      ingredients: [{ key: 'time_pudding', amount: 3 }, { key: 'egg', amount: 3 }],
      alternatives: [{ key: 'time_pudding', amount: 3 }, { key: 'warm_butter', amount: 3 }] },
    { id: 'cheese_fondue', name: '芝士火锅', icon: '🫕',
      ingredients: [{ key: 'cheese_powder', amount: 3 }, { key: 'cocoa_powder', amount: 3 }],
      alternatives: [{ key: 'cheese_powder', amount: 3 }, { key: 'tuna', amount: 3 }] },
    { id: 'seafood_ramen', name: '海鲜拉面', icon: '🍜',
      ingredients: [{ key: 'rice_flour', amount: 3 }, { key: 'tuna', amount: 3 }],
      alternatives: [{ key: 'rice_flour', amount: 3 }, { key: 'time_pudding', amount: 3 }] },
    { id: 'fruit_pie', name: '水果派', icon: '🥧',
      ingredients: [{ key: 'rice_flour', amount: 3 }, { key: 'cocoa_powder', amount: 3 }],
      alternatives: [{ key: 'rice_flour', amount: 3 }, { key: 'cheese_powder', amount: 3 }] },
    { id: 'butter_cookie', name: '黄油曲奇', icon: '🍪',
      ingredients: [{ key: 'cocoa_powder', amount: 3 }, { key: 'warm_butter', amount: 3 }],
      alternatives: [{ key: 'rice_flour', amount: 3 }, { key: 'warm_butter', amount: 3 }] },
    { id: 'legend_croissant', name: '传说可颂', icon: '🥮',
      ingredients: [{ key: 'legendfish', amount: 3 }, { key: 'warm_butter', amount: 3 }],
      alternatives: [{ key: 'legendfish', amount: 3 }, { key: 'cocoa_powder', amount: 3 }] },
    { id: 'time_cheese_tart', name: '时光芝士塔', icon: '🧇',
      ingredients: [{ key: 'time_pudding', amount: 3 }, { key: 'cheese_powder', amount: 3 }],
      alternatives: [{ key: 'time_pudding', amount: 3 }, { key: 'cocoa_powder', amount: 3 }] },
    { id: 'tuna_fried_egg', name: '金枪鱼煎蛋', icon: '🍳',
      ingredients: [{ key: 'tuna', amount: 2 }, { key: 'egg', amount: 2 }, { key: 'warm_butter', amount: 2 }],
      alternatives: [{ key: 'tuna', amount: 2 }, { key: 'egg', amount: 2 }, { key: 'cocoa_powder', amount: 2 }] },
    { id: 'tuna_salad', name: '金枪鱼沙拉', icon: '🥗',
      ingredients: [{ key: 'tuna', amount: 2 }, { key: 'rice_flour', amount: 2 }, { key: 'egg', amount: 2 }],
      alternatives: [{ key: 'tuna', amount: 2 }, { key: 'rice_flour', amount: 2 }, { key: 'warm_butter', amount: 2 }] },
    { id: 'seafood_rice_cake', name: '海鲜米饼', icon: '🍘',
      ingredients: [{ key: 'rice_flour', amount: 2 }, { key: 'tuna', amount: 2 }, { key: 'egg', amount: 2 }],
      alternatives: [{ key: 'rice_flour', amount: 2 }, { key: 'legendfish', amount: 2 }, { key: 'warm_butter', amount: 2 }] },
    { id: 'chocolate_ring', name: '巧克力圈', icon: '🍩',
      ingredients: [{ key: 'cocoa_powder', amount: 2 }, { key: 'rice_flour', amount: 2 }, { key: 'warm_butter', amount: 2 }],
      alternatives: [{ key: 'cocoa_powder', amount: 2 }, { key: 'egg', amount: 2 }, { key: 'warm_butter', amount: 2 }] },
    { id: 'cheese_cookie', name: '芝士饼干', icon: '🥨',
      ingredients: [{ key: 'cheese_powder', amount: 2 }, { key: 'rice_flour', amount: 2 }, { key: 'warm_butter', amount: 2 }],
      alternatives: [{ key: 'cheese_powder', amount: 2 }, { key: 'cocoa_powder', amount: 2 }, { key: 'warm_butter', amount: 2 }] },
    { id: 'cocoa_rice_cake', name: '可可米糕', icon: '🍥',
      ingredients: [{ key: 'cocoa_powder', amount: 2 }, { key: 'rice_flour', amount: 2 }, { key: 'egg', amount: 2 }],
      alternatives: [{ key: 'cocoa_powder', amount: 2 }, { key: 'rice_flour', amount: 2 }, { key: 'time_pudding', amount: 2 }] },
    { id: 'tuna_roll', name: '金枪鱼卷', icon: '🫔',
      ingredients: [{ key: 'tuna', amount: 2 }, { key: 'rice_flour', amount: 2 }, { key: 'cheese_powder', amount: 2 }],
      alternatives: [{ key: 'tuna', amount: 2 }, { key: 'rice_flour', amount: 2 }, { key: 'warm_butter', amount: 2 }] },
    { id: 'butter_pancake', name: '黄油煎饼', icon: '🥯',
      ingredients: [{ key: 'warm_butter', amount: 2 }, { key: 'rice_flour', amount: 2 }, { key: 'egg', amount: 2 }],
      alternatives: [{ key: 'warm_butter', amount: 2 }, { key: 'rice_flour', amount: 2 }, { key: 'cocoa_powder', amount: 2 }] },
    { id: 'egg_fried_rice', name: '蛋炒饭', icon: '🍚',
      ingredients: [{ key: 'egg', amount: 2 }, { key: 'rice_flour', amount: 2 }, { key: 'warm_butter', amount: 2 }],
      alternatives: [{ key: 'egg', amount: 2 }, { key: 'rice_flour', amount: 2 }, { key: 'cocoa_powder', amount: 2 }] },
    { id: 'time_dumpling', name: '时光团子', icon: '🧆',
      ingredients: [{ key: 'time_pudding', amount: 2 }, { key: 'rice_flour', amount: 2 }, { key: 'egg', amount: 2 }],
      alternatives: [{ key: 'time_pudding', amount: 2 }, { key: 'cocoa_powder', amount: 2 }, { key: 'warm_butter', amount: 2 }] },
    { id: 'seafood_rice_ball', name: '海鲜饭团', icon: '🍙',
      ingredients: [{ key: 'tuna', amount: 2 }, { key: 'rice_flour', amount: 2 }, { key: 'time_pudding', amount: 2 }],
      alternatives: [{ key: 'tuna', amount: 2 }, { key: 'rice_flour', amount: 2 }, { key: 'warm_butter', amount: 2 }] },
    { id: 'seafood_pot', name: '海鲜锅', icon: '🥘',
      ingredients: [{ key: 'tuna', amount: 2 }, { key: 'legendfish', amount: 1 }, { key: 'time_pudding', amount: 1 }, { key: 'cocoa_powder', amount: 2 }],
      alternatives: [{ key: 'tuna', amount: 2 }, { key: 'legendfish', amount: 1 }, { key: 'time_pudding', amount: 1 }, { key: 'warm_butter', amount: 2 }] },
    { id: 'legend_feast', name: '传说鱼宴', icon: '🍱',
      ingredients: [{ key: 'legendfish', amount: 2 }, { key: 'cocoa_powder', amount: 2 }, { key: 'time_pudding', amount: 2 }],
      alternatives: [{ key: 'legendfish', amount: 2 }, { key: 'cheese_powder', amount: 2 }, { key: 'warm_butter', amount: 2 }] },
    { id: 'cheese_omelette', name: '芝士蛋卷', icon: '🥞',
      ingredients: [{ key: 'egg', amount: 3 }, { key: 'cheese_powder', amount: 3 }],
      alternatives: [{ key: 'egg', amount: 3 }, { key: 'warm_butter', amount: 3 }] },
    { id: 'tuna_egg_burger', name: '金枪鱼蛋堡', icon: '🍔',
      ingredients: [{ key: 'tuna', amount: 3 }, { key: 'egg', amount: 3 }],
      alternatives: [{ key: 'tuna', amount: 3 }, { key: 'warm_butter', amount: 3 }] },
    { id: 'cocoa_pudding_cup', name: '可可布丁杯', icon: '🧁',
      ingredients: [{ key: 'cocoa_powder', amount: 3 }, { key: 'time_pudding', amount: 3 }],
      alternatives: [{ key: 'cocoa_powder', amount: 3 }, { key: 'egg', amount: 3 }] },
    { id: 'cheese_baked_rice', name: '芝士焗饭', icon: '🍛',
      ingredients: [{ key: 'cheese_powder', amount: 3 }, { key: 'rice_flour', amount: 3 }],
      alternatives: [{ key: 'cheese_powder', amount: 3 }, { key: 'tuna', amount: 3 }] },
    { id: 'butter_bread_roll', name: '黄油面包卷', icon: '🥖',
      ingredients: [{ key: 'rice_flour', amount: 3 }, { key: 'warm_butter', amount: 3 }],
      alternatives: [{ key: 'cocoa_powder', amount: 3 }, { key: 'warm_butter', amount: 3 }] },
    { id: 'cocoa_bean_cake', name: '可可豆糕', icon: '🧈',
      ingredients: [{ key: 'cocoa_powder', amount: 2 }, { key: 'rice_flour', amount: 2 }, { key: 'egg', amount: 2 }],
      alternatives: [{ key: 'cocoa_powder', amount: 2 }, { key: 'rice_flour', amount: 2 }, { key: 'warm_butter', amount: 2 }] }
];

// ============================================================
// 状态
// ============================================================
var paniniState = {
    currentPot: [null, null, null, null, null, null],
    isCooking: false,
    cookStartTime: 0,
    cookDuration: 5,
    cookFinishTime: 0,
    cookRecipeId: null,
    totalCooked: 0,
    unlockedRecipes: [],
    recipeCount: 0,
    darkCooked: 0,            // ===== 新增：黑暗料理计数 =====
    _cookingPot: null
};

var paniniTimer = null;
var paniniRecipeBookOpen = false;

// ============================================================
// 工具函数
// ============================================================
function getBackpack() {
    try { return JSON.parse(localStorage.getItem('explore_backpack') || '{}'); } catch(e) { return {}; }
}
function saveBackpack(bp) { localStorage.setItem('explore_backpack', JSON.stringify(bp)); }
function getBackpackItem(key) { return (getBackpack()[key] || 0); }
function setBackpackItem(key, val) { var bp = getBackpack(); bp[key] = val; saveBackpack(bp); }
function addBackpackItem(key, amount) {
    var cur = getBackpackItem(key);
    setBackpackItem(key, cur + amount);
    return cur + amount;
}
function spendBackpackItem(key, amount) {
    var cur = getBackpackItem(key);
    if (cur < amount) return false;
    setBackpackItem(key, cur - amount);
    return true;
}

function getEnergies() {
    try {
        var saved = localStorage.getItem('chocolate_save');
        if (saved) {
            var data = JSON.parse(saved);
            return data.energies || {};
        }
    } catch(e) {}
    return {};
}
function setEnergies(energies) {
    try {
        var saved = localStorage.getItem('chocolate_save');
        var data = saved ? JSON.parse(saved) : {};
        data.energies = energies;
        localStorage.setItem('chocolate_save', JSON.stringify(data));
    } catch(e) {}
}
function getEnergyItem(key) {
    var energies = getEnergies();
    return energies[key] || 0;
}
function addEnergyItem(key, amount) {
    var energies = getEnergies();
    energies[key] = (energies[key] || 0) + amount;
    setEnergies(energies);
    return energies[key];
}
function spendEnergyItem(key, amount) {
    var energies = getEnergies();
    var cur = energies[key] || 0;
    if (cur < amount) return false;
    energies[key] = cur - amount;
    setEnergies(energies);
    return true;
}

function getIngredientCount(key) {
    for (var i = 0; i < PANINI_INGREDIENTS.length; i++) {
        if (PANINI_INGREDIENTS[i].key === key) {
            if (PANINI_INGREDIENTS[i].source === 'energy') {
                return getEnergyItem(key);
            } else {
                return getBackpackItem(key);
            }
        }
    }
    return 0;
}

function spendIngredient(key, amount) {
    for (var i = 0; i < PANINI_INGREDIENTS.length; i++) {
        if (PANINI_INGREDIENTS[i].key === key) {
            if (PANINI_INGREDIENTS[i].source === 'energy') {
                return spendEnergyItem(key, amount);
            } else {
                return spendBackpackItem(key, amount);
            }
        }
    }
    return false;
}

function addIngredient(key, amount) {
    for (var i = 0; i < PANINI_INGREDIENTS.length; i++) {
        if (PANINI_INGREDIENTS[i].key === key) {
            if (PANINI_INGREDIENTS[i].source === 'energy') {
                addEnergyItem(key, amount);
                return true;
            } else {
                addBackpackItem(key, amount);
                return true;
            }
        }
    }
    return false;
}

// ============================================================
// 帕尼尼面板内 Toast（透明，显示在底部）
// ============================================================
function showPaniniToast(msg, duration) {
    duration = duration || 2500;
    var container = document.getElementById('paniniToast');
    if (!container) {
        var mode = document.getElementById('paniniMode');
        if (!mode) {
            if (typeof showMessage === 'function') showMessage(msg, false);
            return;
        }
        container = document.createElement('div');
        container.id = 'paniniToast';
        container.style.cssText = 'font-size:0.75rem;color:#ffd700;text-align:center;padding:4px 0;min-height:24px;';
        mode.appendChild(container);
    }
    container.textContent = msg;
    container.style.color = msg.includes('❌') || msg.includes('不足') || msg.includes('失败') ? '#ff6b6b' : '#ffd700';
    clearTimeout(container._timer);
    container._timer = setTimeout(function() {
        container.textContent = '';
    }, duration);
}

// ============================================================
// 数据持久化
// ============================================================
function loadPaniniData() {
    try {
        var saved = localStorage.getItem('panini_data');
        if (saved) {
            var data = JSON.parse(saved);
            paniniState.currentPot = data.currentPot || [null, null, null, null, null, null];
            paniniState.isCooking = data.isCooking || false;
            paniniState.cookStartTime = data.cookStartTime || 0;
            paniniState.cookDuration = data.cookDuration || 5;
            paniniState.cookFinishTime = data.cookFinishTime || 0;
            paniniState.cookRecipeId = data.cookRecipeId || null;
            paniniState.totalCooked = data.totalCooked || 0;
            paniniState.unlockedRecipes = data.unlockedRecipes || [];
            paniniState.recipeCount = paniniState.unlockedRecipes.length;
            // ===== 新增 =====
            paniniState.darkCooked = data.darkCooked || 0;
            return true;
        }
    } catch(e) { console.warn('加载帕尼尼数据失败:', e); }
    initDefaultPaniniData();
    return false;
}

function initDefaultPaniniData() {
    paniniState.currentPot = [null, null, null, null, null, null];
    paniniState.isCooking = false;
    paniniState.cookStartTime = 0;
    paniniState.cookDuration = 5;
    paniniState.cookFinishTime = 0;
    paniniState.cookRecipeId = null;
    paniniState.totalCooked = 0;
    paniniState.unlockedRecipes = [];
    paniniState.recipeCount = 0;
    paniniState.darkCooked = 0;  // 新增
    savePaniniData();
}

function savePaniniData() {
    try {
        var data = {
            currentPot: paniniState.currentPot,
            isCooking: paniniState.isCooking,
            cookStartTime: paniniState.cookStartTime,
            cookDuration: paniniState.cookDuration,
            cookFinishTime: paniniState.cookFinishTime,
            cookRecipeId: paniniState.cookRecipeId,
            totalCooked: paniniState.totalCooked,
            unlockedRecipes: paniniState.unlockedRecipes,
            darkCooked: paniniState.darkCooked || 0   // 新增
        };
        localStorage.setItem('panini_data', JSON.stringify(data));
    } catch(e) { console.warn('保存帕尼尼数据失败:', e); }
}

// ============================================================
// 食谱匹配
// ============================================================
function matchRecipe(pot) {
    var counts = {};
    pot.forEach(function(slot) {
        if (slot) {
            counts[slot] = (counts[slot] || 0) + 1;
        }
    });

    for (var i = 0; i < PANINI_RECIPES.length; i++) {
        var recipe = PANINI_RECIPES[i];
        if (matchCounts(counts, recipe.ingredients)) {
            return { recipe: recipe, used: recipe.ingredients };
        }
        if (recipe.alternatives && matchCounts(counts, recipe.alternatives)) {
            return { recipe: recipe, used: recipe.alternatives };
        }
    }
    return null;
}

function matchCounts(counts, ingredients) {
    for (var i = 0; i < ingredients.length; i++) {
        var ing = ingredients[i];
        if ((counts[ing.key] || 0) < ing.amount) {
            return false;
        }
    }
    return true;
}

// ============================================================
// 辅助显示函数
// ============================================================
function getIngredientDisplay(ing) {
    for (var i = 0; i < PANINI_INGREDIENTS.length; i++) {
        if (PANINI_INGREDIENTS[i].key === ing) {
            var item = PANINI_INGREDIENTS[i];
            if (item.img) {
                return '<img src="' + item.img + '" class="panini-ingredient-icon" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;border-radius:4px;" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'inline\'"><span class="panini-ingredient-emoji" style="display:none;">' + item.emoji + '</span>';
            } else {
                return '<span class="panini-ingredient-emoji" style="font-size:0.9rem;">' + item.emoji + '</span>';
            }
        }
    }
    return '<span class="panini-ingredient-emoji" style="font-size:0.9rem;">❓</span>';
}

function getIngredientEmoji(ing) {
    for (var i = 0; i < PANINI_INGREDIENTS.length; i++) {
        if (PANINI_INGREDIENTS[i].key === ing) {
            return PANINI_INGREDIENTS[i].emoji;
        }
    }
    return '❓';
}

function getIngredientName(ing) {
    for (var i = 0; i < PANINI_INGREDIENTS.length; i++) {
        if (PANINI_INGREDIENTS[i].key === ing) {
            return PANINI_INGREDIENTS[i].name;
        }
    }
    return ing;
}

function getFoodName(recipeId) {
    for (var i = 0; i < PANINI_RECIPES.length; i++) {
        if (PANINI_RECIPES[i].id === recipeId) {
            return PANINI_RECIPES[i].name;
        }
    }
    return recipeId;
}

function isRecipeUnlocked(recipeId) {
    return paniniState.unlockedRecipes.indexOf(recipeId) !== -1;
}

// ============================================================
// 核心操作（全部改用 showPaniniToast）
// ============================================================
function addToPot(ingredientKey) {
    if (paniniRecipeBookOpen) closeRecipeBook();
    if (paniniState.isCooking) {
        showPaniniToast('⏳ 烹饪中，请等待完成', 1500);
        return;
    }
    var count = getIngredientCount(ingredientKey);
    if (count <= 0) {
        showPaniniToast('❌ 背包中没有 ' + getIngredientName(ingredientKey), 1500);
        return;
    }
    var emptyIndex = -1;
    for (var i = 0; i < paniniState.currentPot.length; i++) {
        if (paniniState.currentPot[i] === null) {
            emptyIndex = i;
            break;
        }
    }
    if (emptyIndex === -1) {
        showPaniniToast('⚠️ 锅已满（6/6），请先清空', 1500);
        return;
    }
    if (!spendIngredient(ingredientKey, 1)) {
        showPaniniToast('❌ 食材不足', 1500);
        return;
    }
    paniniState.currentPot[emptyIndex] = ingredientKey;
    savePaniniData();
    renderPaniniUI();
}

function removeFromPot(index) {
    if (paniniRecipeBookOpen) closeRecipeBook();
    if (paniniState.isCooking) {
        showPaniniToast('⏳ 烹饪中，请等待完成', 1500);
        return;
    }
    var key = paniniState.currentPot[index];
    if (!key) return;
    paniniState.currentPot[index] = null;
    addIngredient(key, 1);
    savePaniniData();
    renderPaniniUI();
}

function clearPot() {
    if (paniniRecipeBookOpen) closeRecipeBook();
    if (paniniState.isCooking) {
        showPaniniToast('⏳ 烹饪中，请等待完成', 1500);
        return;
    }
    var hasItems = false;
    for (var i = 0; i < paniniState.currentPot.length; i++) {
        if (paniniState.currentPot[i]) {
            addIngredient(paniniState.currentPot[i], 1);
            paniniState.currentPot[i] = null;
            hasItems = true;
        }
    }
    if (!hasItems) {
        showPaniniToast('锅已经是空的', 1500);
        return;
    }
    paniniState._cookingPot = null;
    paniniState.isCooking = false;
    paniniState.cookRecipeId = null;
    paniniState.cookStartTime = 0;
    paniniState.cookFinishTime = 0;
    paniniState.cookDuration = 5;
    
    savePaniniData();
    renderPaniniUI();
    showPaniniToast('🗑️ 食材已全部返还', 1500);
}

function startCooking() {
    if (paniniRecipeBookOpen) closeRecipeBook();
    if (paniniState.isCooking) {
        showPaniniToast('⏳ 正在烹饪中...', 1500);
        return;
    }
    var filled = 0;
    for (var i = 0; i < paniniState.currentPot.length; i++) {
        if (paniniState.currentPot[i] !== null) filled++;
    }
    if (filled < 6) {
        showPaniniToast('⚠️ 需要放满 6 种食材（当前 ' + filled + '/6）', 2000);
        return;
    }
    var fuelCount = getBackpackItem('ore_fuel');
    if (fuelCount < 6) {
        showPaniniToast('⛽ 燃料不足！需要 6 个燃料（当前 ' + fuelCount + '）', 2000);
        return;
    }
    if (!spendBackpackItem('ore_fuel', 6)) {
        showPaniniToast('❌ 燃料扣除失败', 1500);
        return;
    }
    var potSnapshot = paniniState.currentPot.slice();
    paniniState._cookingPot = potSnapshot;
    for (var i = 0; i < paniniState.currentPot.length; i++) {
        paniniState.currentPot[i] = null;
    }
    var now = Math.floor(Date.now() / 1000);
    paniniState.isCooking = true;
    paniniState.cookStartTime = now;
    // ===== 添加音效 =====
    if (typeof soundCook === 'function') soundCook();
    // ===== 音效添加结束 =====
    paniniState.cookDuration = 5;
    paniniState.cookFinishTime = now + 5;
    paniniState.cookRecipeId = null;
    savePaniniData();
    renderPaniniUI();
    showPaniniToast('🔥 开始烹饪！等待 5 秒...', 2000);
}

function collectCooking() {
    if (paniniRecipeBookOpen) closeRecipeBook();
    if (!paniniState.isCooking) {
        showPaniniToast('没有正在烹饪的食物', 1500);
        return;
    }
    var now = Math.floor(Date.now() / 1000);
    if (now < paniniState.cookFinishTime) {
        showPaniniToast('⏳ 还没完成，请耐心等待', 1500);
        return;
    }
    var potSnapshot = paniniState._cookingPot || [];
    var match = matchRecipe(potSnapshot);
    var recipe = match ? match.recipe : null;
    var recipeId = recipe ? recipe.id : 'dark_cuisine';
    var foodName = recipe ? recipe.name : '黑暗料理';
    var foodIcon = recipe ? recipe.icon : '💀';

    // ===== 新增：黑暗料理计数 =====
    if (!recipe) {
        paniniState.darkCooked = (paniniState.darkCooked || 0) + 1;
    }
    // ===== 新增结束 =====

    addBackpackItem(recipeId, 1);
    paniniState.totalCooked++;
    // ===== 添加音效 =====
    if (typeof soundWorkshopDone === 'function') soundWorkshopDone();
    // ===== 音效添加结束 =====
    // ===== 挑战塔：烹饪成功 =====
    if (typeof onTowerCooked === 'function') onTowerCooked();
    // ===== 挑战塔结束 =====

    if (typeof window.addReputation === 'function') {
        window.addReputation(3, '帕尼尼制作食物：' + foodName);
    }

    if (recipe && !isRecipeUnlocked(recipeId)) {
        paniniState.unlockedRecipes.push(recipeId);
        paniniState.recipeCount = paniniState.unlockedRecipes.length;
        showPaniniToast('📖 新食谱解锁！' + foodIcon + ' ' + foodName, 3000);
    }
    paniniState.isCooking = false;
    paniniState.cookStartTime = 0;
    paniniState.cookFinishTime = 0;
    paniniState.cookRecipeId = null;
    paniniState._cookingPot = null;
    savePaniniData();
    renderPaniniUI();
    showPaniniToast('🎉 恭喜发明了 ' + foodIcon + ' ' + foodName + '！已存入探险背包', 3000);
}

// ============================================================
// 定时器更新
// ============================================================
function updatePaniniTimer() {
    if (!paniniState.isCooking) return;
    var now = Math.floor(Date.now() / 1000);
    var remaining = Math.max(0, paniniState.cookFinishTime - now);

    var statusEl = document.getElementById('paniniStatusText');
    if (statusEl) {
        if (remaining <= 0) {
            statusEl.innerHTML = '✅ 烹饪完成！点击「收取」领取';
        } else {
            statusEl.innerHTML = '⏳ 烹饪中... <span class="highlight">' + remaining + 's</span> 剩余';
        }
    }

    if (remaining <= 0) {
        renderPaniniUI();
    }
}

// ============================================================
// 食谱书
// ============================================================
function ensureRecipeBookContainer() {
    var container = document.getElementById('paniniRecipeBook');
    if (!container) {
        var parent = document.getElementById('paniniMode');
        if (!parent) return null;
        container = document.createElement('div');
        container.id = 'paniniRecipeBook';
        container.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:10;display:none;pointer-events:none;';
        parent.appendChild(container);
    }
    return container;
}

function openRecipeBook() {
    if (paniniRecipeBookOpen) {
        closeRecipeBook();
        return;
    }
    paniniRecipeBookOpen = true;
    var container = ensureRecipeBookContainer();
    if (!container) return;
    renderRecipeBook();
    container.style.display = 'block';
    container.style.pointerEvents = 'auto';
}

function closeRecipeBook() {
    paniniRecipeBookOpen = false;
    var container = document.getElementById('paniniRecipeBook');
    if (container) {
        container.style.display = 'none';
        container.style.pointerEvents = 'none';
        container.innerHTML = '';
    }
    renderPaniniUI();
}

function renderRecipeBook() {
    var container = document.getElementById('paniniRecipeBook');
    if (!container) return;
    var total = PANINI_RECIPES.length;
    var unlocked = paniniState.unlockedRecipes.length;
    var html = '';
    html += '<div class="recipebook-overlay" onclick="closeRecipeBook()">';
    html += '  <div class="recipebook-modal" onclick="event.stopPropagation()">';
    html += '    <div class="recipebook-header">';
    html += '      <span>📖 食谱书</span>';
    html += '      <button class="recipebook-close" onclick="closeRecipeBook()">✕ 关闭</button>';
    html += '    </div>';
    html += '    <div class="recipebook-stats">已解锁 ' + unlocked + '/' + total + ' 个食谱</div>';
    html += '    <div class="recipebook-list">';
    for (var i = 0; i < PANINI_RECIPES.length; i++) {
        var r = PANINI_RECIPES[i];
        var unlockedFlag = isRecipeUnlocked(r.id);
        html += '<div class="recipebook-item' + (unlockedFlag ? ' unlocked' : ' locked') + '">';
        html += '  <span class="recipebook-icon">' + (unlockedFlag ? r.icon : '❓') + '</span>';
        html += '  <span class="recipebook-name">' + (unlockedFlag ? r.name : '???') + '</span>';
        if (unlockedFlag) {
            var parts = [];
            r.ingredients.forEach(function(ing) {
                parts.push(getIngredientDisplay(ing.key) + '×' + ing.amount);
            });
            html += '  <span class="recipebook-recipe">' + parts.join(' + ');
            if (r.alternatives) {
                var altParts = [];
                r.alternatives.forEach(function(ing) {
                    altParts.push(getIngredientDisplay(ing.key) + '×' + ing.amount);
                });
                html += ' 或 ' + altParts.join(' + ');
            }
            html += '  </span>';
        } else {
            html += '  <span class="recipebook-recipe locked-text">🔒 未解锁</span>';
        }
        html += '</div>';
    }
    html += '    </div>';
    html += '    <div class="recipebook-footer">💡 首次烹饪出对应食物时自动解锁食谱</div>';
    html += '  </div>';
    html += '</div>';
    container.innerHTML = html;
}

// ============================================================
// UI 渲染
// ============================================================
function renderPaniniUI() {
    var container = document.getElementById('paniniMode');
    if (!container) return;

    var now = Math.floor(Date.now() / 1000);
    var fuelCount = getBackpackItem('ore_fuel');
    var unlocked = paniniState.unlockedRecipes.length;
    var total = PANINI_RECIPES.length;

    var html = '';

    // ---- 标题栏 ----
    html += '<div class="panini-header">';
    html += '  <div class="panini-title">🍳 帕尼尼大陆 · 美食实验室</div>';
    html += '  <button class="panini-btn-close" onclick="closePaniniPanel()">✕ 关闭</button>';
    html += '</div>';

    // ---- 顶部信息栏 ----
    html += '<div class="panini-topbar">';
    html += '  <span><img src="images/fuel.png" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;border-radius:4px;" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'inline\'"><span style="display:none;">⛽</span> 燃料 <strong>' + fuelCount + '</strong></span>';
    html += '  <span>📖 已解锁 <strong>' + unlocked + '/' + total + '</strong></span>';
    html += '  <button class="panini-btn-recipebook" onclick="openRecipeBook()" id="paniniRecipeBookBtn">📖 食谱书</button>';
    html += '</div>';

    // ---- 主内容 ----
    html += '<div class="panini-main-content">';

    // ===== 锅卡片 =====
    var isCooking = paniniState.isCooking;
    var isComplete = isCooking && now >= paniniState.cookFinishTime;

    html += '<div class="panini-card panini-pot-card">';
    html += '  <div class="panini-card-title">🍳 你的锅</div>';

    var potClass = 'panini-pot';
    if (isCooking) potClass += ' cooking';
    html += '  <div class="' + potClass + '">';
    for (var i = 0; i < paniniState.currentPot.length; i++) {
        var slot = paniniState.currentPot[i];
        html += '<div class="panini-pot-slot" onclick="removeFromPot(' + i + ')">';
        if (isCooking) {
            html += '<div class="cooking-effect"></div>';
            html += '<span class="cooking-fire">🔥</span>';
        } else if (slot) {
            html += getIngredientDisplay(slot);
        } else {
            html += '<span class="panini-pot-empty">+</span>';
        }
        html += '</div>';
    }
    html += '  </div>';

    // 状态行
    html += '  <div class="panini-pot-status" id="paniniStatusText">';
    if (isCooking) {
        if (isComplete) {
            html += '✅ 烹饪完成！点击「收取」领取';
        } else {
            var remaining = Math.max(0, paniniState.cookFinishTime - now);
            html += '⏳ 烹饪中... <span class="highlight">' + remaining + 's</span> 剩余';
        }
    } else {
        var filled = 0;
        for (var i = 0; i < paniniState.currentPot.length; i++) {
            if (paniniState.currentPot[i] !== null) filled++;
        }
        html += '😴 已放入 ' + filled + '/6 种食材';
    }
    html += '  </div>';

    // 操作行
    var filled = 0;
    for (var i = 0; i < paniniState.currentPot.length; i++) {
        if (paniniState.currentPot[i] !== null) filled++;
    }
    var fuelOk = fuelCount >= 6;
    var canCook = !isCooking && filled === 6 && fuelOk;

    html += '  <div class="panini-pot-actions">';
    html += '    <button class="panini-btn-clear" onclick="clearPot()">🗑️ 清空锅</button>';
    html += '    <span class="panini-fuel-status">';
    if (fuelOk) {
        html += '<img src="images/fuel.png" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;border-radius:4px;" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'inline\'"><span style="display:none;">⛽</span> 燃料充足 <span class="ok">✅</span>';
    } else {
        html += '<img src="images/fuel.png" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;border-radius:4px;" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'inline\'"><span style="display:none;">⛽</span> 需要 ' + (6 - fuelCount) + ' 燃料 <span class="fail">❌</span>';
    }
    html += '    </span>';
    if (isCooking && isComplete) {
        html += '    <button class="panini-btn-collect" id="paniniCollectBtn" onclick="collectCooking()">📦 收取</button>';
    } else if (isCooking) {
        html += '    <button class="panini-btn-cook cooking" disabled>🔥 烹饪中...</button>';
    } else {
        html += '    <button class="panini-btn-cook" onclick="startCooking()" ' + (canCook ? '' : 'disabled') + '>';
        html += '      ' + (filled === 6 ? '🔥 烹饪' : '⚠️ 需要 ' + (6 - filled) + ' 种食材');
        html += '    </button>';
    }
    html += '  </div>';
    html += '</div>';

    // ===== 食材篮卡片 =====
    html += '<div class="panini-card" style="margin-top:10px;">';
    html += '  <div class="panini-card-title">🧺 食材篮（点击放入锅中）</div>';
    html += '  <div class="panini-ingredients-grid">';
    for (var i = 0; i < PANINI_INGREDIENTS.length; i++) {
        var ing = PANINI_INGREDIENTS[i];
        var count = getIngredientCount(ing.key);
        var zeroClass = count <= 0 ? 'zero' : '';
        html += '<div class="panini-ingredient ' + zeroClass + '" onclick="addToPot(\'' + ing.key + '\')">';
        if (ing.img) {
            html += '  <img src="' + ing.img + '" class="panini-ingredient-img" style="width:18px;height:18px;object-fit:contain;border-radius:4px;" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'inline\'">';
            html += '  <span class="ing-emoji" style="display:none;">' + ing.emoji + '</span>';
        } else {
            html += '  <span class="ing-emoji">' + ing.emoji + '</span>';
        }
        html += '  <span class="panini-ingredient-count">×' + count + '</span>';
        html += '</div>';
    }
    html += '  </div>';
    html += '</div>';

    html += '</div>'; // 关闭 main-content

    // ---- 底部提示 ----
    html += '<div class="panini-footer">';
    html += '💡 每次烹饪消耗 6 个燃料，耗时 <strong>5 秒</strong>（测试版）。放入 6 种食材探索不同配方！';
    html += '</div>';

    container.innerHTML = html;
}

// ============================================================
// 定时器
// ============================================================
function startPaniniTimer() {
    if (paniniTimer) clearInterval(paniniTimer);
    paniniTimer = setInterval(function() {
        updatePaniniTimer();
    }, 1000);
}

// ============================================================
// 打开/关闭面板
// ============================================================
function openPaniniPanel() {
    loadPaniniData();
    paniniRecipeBookOpen = false;

    var infoMode = document.getElementById('infoMode');
    var paniniMode = document.getElementById('paniniMode');
    if (!paniniMode) {
        var panel = document.getElementById('infoPanel');
        var mode = document.createElement('div');
        mode.id = 'paniniMode';
        mode.className = 'panini-mode';
        mode.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;z-index:4;padding:10px 16px 44px 16px;overflow-y:auto;border:2px solid #c98f5e;box-shadow:inset 0 0 60px rgba(0,0,0,0.6);background:linear-gradient(145deg,#2d1b0e,#4a2c1a);border-radius:16px;';
        panel.appendChild(mode);
        paniniMode = mode;
    }
    paniniMode.style.display = 'block';
    if (infoMode) infoMode.style.display = 'none';

    ensureRecipeBookContainer();

    renderPaniniUI();
    startPaniniTimer();
}

function closePaniniPanel() {
    var paniniMode = document.getElementById('paniniMode');
    if (paniniMode) paniniMode.style.display = 'none';
    var infoMode = document.getElementById('infoMode');
    if (infoMode) infoMode.style.display = 'flex';
    if (paniniTimer) { clearInterval(paniniTimer); paniniTimer = null; }
    paniniRecipeBookOpen = false;
    if (typeof window.updateInfoPanel === 'function') window.updateInfoPanel();
}

// ============================================================
// 暴露全局接口
// ============================================================
window.openPaniniPanel = openPaniniPanel;
window.closePaniniPanel = closePaniniPanel;
window.addToPot = addToPot;
window.removeFromPot = removeFromPot;
window.clearPot = clearPot;
window.startCooking = startCooking;
window.collectCooking = collectCooking;
window.openRecipeBook = openRecipeBook;
window.closeRecipeBook = closeRecipeBook;
window.renderPaniniUI = renderPaniniUI;
window.PANINI_RECIPES = PANINI_RECIPES;
window.showPaniniToast = showPaniniToast;

// ============================================================
// 初始化
// ============================================================
function initPanini() {
    loadPaniniData();
    console.log('🥪 帕尼尼大陆模块已加载，已解锁食谱: ' + paniniState.unlockedRecipes.length + '/' + PANINI_RECIPES.length);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPanini);
} else {
    initPanini();
}
console.log('🥪 帕尼尼大陆模块加载完成（最终版 + 成就统计）');