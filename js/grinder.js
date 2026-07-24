// ============================================================
// grinder.js · 八仙锅海 · 粉碎机
// 提示显示在 #grinderStatus（面板内）
// ============================================================

console.log('🧂 粉碎机模块加载中...');

var GRINDER_RECIPES = {
    cocoa_powder: {
        id: 'cocoa_powder', name: '可可粉', icon: '🍫', img: 'images/cocopowder.png',
        inputType: 'cocoa_bean', inputAmount: 9, inputName: '可可豆', inputIcon: '🫘',
        outputKey: 'cocoa_powder', outputName: '可可粉'
    },
    rice_flour: {
        id: 'rice_flour', name: '面粉', icon: '🌾', img: 'images/flour.png',
        inputType: 'mimi_seedling', inputAmount: 1, inputName: '米米苗苗', inputIcon: 'images/energy/米米苗苗.png',
        outputKey: 'rice_flour', outputName: '面粉'
    },
    ore_fuel: {
        id: 'ore_fuel', name: '燃料', icon: '⛽', img: 'images/fuel.png',
        inputType: 'iron_ore', inputAmount: 9, inputName: '铁矿', inputIcon: '🪨',
        outputKey: 'ore_fuel', outputName: '燃料'
    }
};

var grinderState = { selectedRecipe: null, quantity: 1, isProcessing: false };

function getBackpack() {
    try { return JSON.parse(localStorage.getItem('explore_backpack') || '{}'); } catch(e) { return {}; }
}
function saveBackpack(bp) { localStorage.setItem('explore_backpack', JSON.stringify(bp)); }
function getBackpackItem(key) { return (getBackpack()[key] || 0); }
function setBackpackItem(key, val) { var bp = getBackpack(); bp[key] = val; saveBackpack(bp); }
function addBackpackItem(key, amount) { var cur = getBackpackItem(key); setBackpackItem(key, cur + amount); return cur + amount; }
function spendBackpackItem(key, amount) { var cur = getBackpackItem(key); if (cur < amount) return false; setBackpackItem(key, cur - amount); return true; }

function getExploreCoins() { try { return parseInt(localStorage.getItem('explore_coins') || '0'); } catch(e) { return 0; } }
function saveExploreCoins(v) { localStorage.setItem('explore_coins', String(v)); }
function spendExploreCoins(amount) { var cur = getExploreCoins(); if (cur < amount) return false; saveExploreCoins(cur - amount); return true; }

function getCocoaBeans() {
    try { var data = JSON.parse(localStorage.getItem('chocolate_save') || '{}'); return data.cocoaBeans || 0; } catch(e) { return 0; }
}
function setCocoaBeans(v) { var data = JSON.parse(localStorage.getItem('chocolate_save') || '{}'); data.cocoaBeans = v; localStorage.setItem('chocolate_save', JSON.stringify(data)); }
function spendCocoaBeans(amount) { var cur = getCocoaBeans(); if (cur < amount) return false; setCocoaBeans(cur - amount); return true; }

function getEnergies() {
    try { var data = JSON.parse(localStorage.getItem('chocolate_save') || '{}'); return data.energies || {}; } catch(e) { return {}; }
}
function setEnergies(e) { var data = JSON.parse(localStorage.getItem('chocolate_save') || '{}'); data.energies = e; localStorage.setItem('chocolate_save', JSON.stringify(data)); }
function spendEnergy(type, amount) { var e = getEnergies(); var cur = e[type] || 0; if (cur < amount) return false; e[type] = cur - amount; setEnergies(e); return true; }

function checkCanGrind(recipeId, quantity) {
    var recipe = GRINDER_RECIPES[recipeId];
    if (!recipe) return { success: false, msg: '无效配方' };
    var qty = quantity || 1;
    var totalCost = qty * 2;
    if (getExploreCoins() < totalCost) return { success: false, msg: '探险币不足！需要 ' + totalCost + ' 探险币' };
    if (recipe.inputType === 'cocoa_bean') {
        var needed = recipe.inputAmount * qty;
        if (getCocoaBeans() < needed) return { success: false, msg: '可可豆不足！需要 ' + needed + ' 颗' };
    } else if (recipe.inputType === 'mimi_seedling') {
        var needed = recipe.inputAmount * qty;
        if ((getEnergies()['mimi_seedling'] || 0) < needed) return { success: false, msg: '米米苗苗不足！需要 ' + needed + ' 个' };
    } else if (recipe.inputType === 'iron_ore') {
        var needed = recipe.inputAmount * qty;
        if (getBackpackItem('iron_ore') < needed) return { success: false, msg: '铁矿不足！需要 ' + needed + ' 块' };
    }
    return { success: true };
}

// ---- 面板状态提示 ----
function showGrinderStatus(msg, isError) {
    var el = document.getElementById('grinderStatus');
    if (el) {
        el.textContent = msg;
        el.style.color = isError ? '#ff6b6b' : '#ffd700';
        clearTimeout(el._timer);
        el._timer = setTimeout(function() { el.textContent = ''; }, 3000);
    }
}

function executeGrind(recipeId, quantity) {
    if (grinderState.isProcessing) { showGrinderStatus('⏳ 正在粉碎中，请稍候...', true); return; }
    var recipe = GRINDER_RECIPES[recipeId];
    if (!recipe) { showGrinderStatus('❌ 无效配方', true); return; }
    var qty = quantity || 1;
    if (qty < 1) qty = 1;
    var check = checkCanGrind(recipeId, qty);
    if (!check.success) { showGrinderStatus('❌ ' + check.msg, true); return; }
    var totalCost = qty * 2;
    if (!spendExploreCoins(totalCost)) { showGrinderStatus('❌ 探险币扣除失败', true); return; }
    if (recipe.inputType === 'cocoa_bean') {
        var needed = recipe.inputAmount * qty;
        if (!spendCocoaBeans(needed)) { saveExploreCoins(getExploreCoins() + totalCost); showGrinderStatus('❌ 可可豆扣除失败', true); return; }
    } else if (recipe.inputType === 'mimi_seedling') {
        var needed = recipe.inputAmount * qty;
        if (!spendEnergy('mimi_seedling', needed)) { saveExploreCoins(getExploreCoins() + totalCost); showGrinderStatus('❌ 米米苗苗扣除失败', true); return; }
    } else if (recipe.inputType === 'iron_ore') {
        var needed = recipe.inputAmount * qty;
        if (!spendBackpackItem('iron_ore', needed)) { saveExploreCoins(getExploreCoins() + totalCost); showGrinderStatus('❌ 铁矿扣除失败', true); return; }
    }
    addBackpackItem(recipe.outputKey, qty);
    showGrinderStatus('🎉 粉碎完成！已获得 ' + qty + ' 个 ' + recipe.outputName, false);
    // ===== 添加音效 =====
    if (typeof soundGrind === 'function') soundGrind();
    // ===== 音效添加结束 =====
    updateStatsDisplay();
    updateActionDisplay();
}

function updateStatsDisplay() {
    var statsEl = document.querySelector('.grinder-stats');
    if (!statsEl) return;
    var coins = getExploreCoins();
    var beans = getCocoaBeans();
    var iron = getBackpackItem('iron_ore');
    var mimi = getEnergies()['mimi_seedling'] || 0;
    statsEl.innerHTML = '<span>🫘 可可豆 <strong>' + beans + '</strong></span><span><img src="images/energy/米米苗苗.png" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;border-radius:4px;" onerror="this.style.display=\'none\'"> 米米苗苗 <strong>' + mimi + '</strong></span><span>🪨 铁矿 <strong>' + iron + '</strong></span><span>⚓ 探险币 <strong>' + coins + '</strong></span>';
}

function updateActionDisplay() {
    var recipe = grinderState.selectedRecipe ? GRINDER_RECIPES[grinderState.selectedRecipe] : null;
    if (!recipe) return;
    var qty = grinderState.quantity || 1;
    var totalCost = qty * 2;
    var check = checkCanGrind(recipe.id, qty);
    var canGrind = check.success;
    var actionEl = document.querySelector('.grinder-action');
    if (!actionEl) return;
    var inputAmount = recipe.inputAmount * qty;
    var inputDisplay = recipe.inputName;
    if (recipe.inputType === 'mimi_seedling') {
        inputDisplay = '<img src="images/energy/米米苗苗.png" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;border-radius:4px;" onerror="this.style.display=\'none\'"> ' + recipe.inputName;
    }
    actionEl.innerHTML = `
        <div class="grinder-action-info"><span class="grinder-action-label">已选：${recipe.outputName}</span>
        <div class="grinder-qty-control"><button class="grinder-qty-btn" onclick="changeGrinderQty(-1)">−</button>
        <input type="number" id="grinderQtyInput" value="${qty}" min="1" max="99" onchange="updateGrinderQty(this.value)" onfocus="this.select()">
        <button class="grinder-qty-btn" onclick="changeGrinderQty(1)">+</button></div></div>
        <div class="grinder-action-cost">需要：${inputAmount} ${inputDisplay}  |  消耗：${totalCost} 探险币</div>
        <div class="grinder-action-output">产出：${qty} 个 ${recipe.outputName}</div>
        <button class="grinder-btn-grind ${canGrind ? '' : 'disabled'}" onclick="executeGrind('${recipe.id}', ${qty})" ${canGrind ? '' : 'disabled'}>${canGrind ? '⚙️ 开始粉碎' : '❌ 材料不足'}</button>
    `;
}

function updateCardSelection(selectedId) {
    document.querySelectorAll('.grinder-recipe-card').forEach(function(card) {
        var id = card.dataset.recipeId;
        card.classList.toggle('selected', id === selectedId);
    });
}

function selectGrinderRecipe(recipeId) {
    if (grinderState.isProcessing) { showGrinderStatus('⏳ 正在粉碎中，请稍候...', true); return; }
    grinderState.selectedRecipe = (grinderState.selectedRecipe === recipeId) ? null : recipeId;
    grinderState.quantity = 1;
    updateCardSelection(grinderState.selectedRecipe);
    var wrapper = document.querySelector('.grinder-action-wrapper');
    if (!wrapper) return;
    var recipe = grinderState.selectedRecipe ? GRINDER_RECIPES[grinderState.selectedRecipe] : null;
    if (recipe) {
        var qty = 1;
        var totalCost = 2;
        var check = checkCanGrind(recipe.id, qty);
        var canGrind = check.success;
        var inputAmount = recipe.inputAmount;
        var inputDisplay = recipe.inputName;
        if (recipe.inputType === 'mimi_seedling') {
            inputDisplay = '<img src="images/energy/米米苗苗.png" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;border-radius:4px;" onerror="this.style.display=\'none\'"> ' + recipe.inputName;
        }
        wrapper.innerHTML = `
            <div class="grinder-action">
                <div class="grinder-action-info"><span class="grinder-action-label">已选：${recipe.outputName}</span>
                <div class="grinder-qty-control"><button class="grinder-qty-btn" onclick="changeGrinderQty(-1)">−</button>
                <input type="number" id="grinderQtyInput" value="1" min="1" max="99" onchange="updateGrinderQty(this.value)" onfocus="this.select()">
                <button class="grinder-qty-btn" onclick="changeGrinderQty(1)">+</button></div></div>
                <div class="grinder-action-cost">需要：${inputAmount} ${inputDisplay}  |  消耗：2 探险币</div>
                <div class="grinder-action-output">产出：1 个 ${recipe.outputName}</div>
                <button class="grinder-btn-grind ${canGrind ? '' : 'disabled'}" onclick="executeGrind('${recipe.id}', 1)" ${canGrind ? '' : 'disabled'}>${canGrind ? '⚙️ 开始粉碎' : '❌ 材料不足'}</button>
            </div>
        `;
    } else {
        wrapper.innerHTML = '<div class="grinder-action-placeholder">👆 请选择要粉碎的材料</div>';
    }
    var input = document.getElementById('grinderQtyInput');
    if (input) input.value = 1;
    grinderState.quantity = 1;
}

function changeGrinderQty(delta) {
    var input = document.getElementById('grinderQtyInput');
    if (!input) return;
    var val = parseInt(input.value) || 1;
    val = Math.max(1, val + delta);
    if (val > 99) val = 99;
    input.value = val;
    grinderState.quantity = val;
    updateActionDisplay();
    updateStatsDisplay();
}

function updateGrinderQty(value) {
    var val = parseInt(value) || 1;
    if (val < 1) val = 1;
    if (val > 99) val = 99;
    grinderState.quantity = val;
    updateActionDisplay();
    updateStatsDisplay();
}

function openGrinderPanel() {
    grinderState.selectedRecipe = null;
    grinderState.quantity = 1;
    grinderState.isProcessing = false;
    var infoMode = document.getElementById('infoMode');
    var grinderMode = document.getElementById('grinderMode');
    if (!grinderMode) {
        var panel = document.getElementById('infoPanel');
        var mode = document.createElement('div');
        mode.id = 'grinderMode';
        mode.className = 'grinder-mode';
        mode.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;z-index:4;padding:12px 16px 56px 16px;overflow-y:auto;border:2px solid #c98f5e;box-shadow:inset 0 0 60px rgba(0,0,0,0.6);background:linear-gradient(145deg,#1a2a3a,#0d1b2a);border-radius:16px;';
        panel.appendChild(mode);
        grinderMode = mode;
    }
    grinderMode.style.display = 'block';
    if (infoMode) infoMode.style.display = 'none';
    renderGrinderUI();
}

function closeGrinderPanel() {
    var grinderMode = document.getElementById('grinderMode');
    if (grinderMode) grinderMode.style.display = 'none';
    var infoMode = document.getElementById('infoMode');
    if (infoMode) infoMode.style.display = 'flex';
    grinderState.selectedRecipe = null;
    grinderState.isProcessing = false;
    if (typeof window.updateInfoPanel === 'function') window.updateInfoPanel();
}

function renderGrinderUI() {
    var container = document.getElementById('grinderMode');
    if (!container) return;
    var coins = getExploreCoins();
    var beans = getCocoaBeans();
    var iron = getBackpackItem('iron_ore');
    var mimi = getEnergies()['mimi_seedling'] || 0;
    var html = '';
    html += '<div class="steam-particles">';
    for (var i = 0; i < 6; i++) html += '<div class="steam-particle"></div>';
    html += '</div>';
    html += '<div class="gear-deco">⚙</div><div class="gear-deco">⚙</div><div class="gear-deco">⚙</div>';
    html += '<div class="pipe-line"></div><div class="pipe-line"></div><div class="pipe-line"></div>';
    html += '<div class="grinder-header"><div class="grinder-title">八仙锅海 · 粉碎工厂</div><button class="grinder-btn-close" onclick="closeGrinderPanel()">✕ 关闭</button></div>';
    html += '<div id="grinderStatus" style="font-size:0.7rem;color:rgba(255,255,255,0.3);text-align:center;min-height:20px;padding:4px 0;"></div>';
    html += '<div class="grinder-stats">';
    html += '<span>🫘 可可豆 <strong>' + beans + '</strong></span>';
    html += '<span><img src="images/energy/米米苗苗.png" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;border-radius:4px;" onerror="this.style.display=\'none\'"> 米米苗苗 <strong>' + mimi + '</strong></span>';
    html += '<span>🪨 铁矿 <strong>' + iron + '</strong></span>';
    html += '<span>⚓ 探险币 <strong>' + coins + '</strong></span>';
    html += '</div>';
    html += '<div class="grinder-recipes">';
    for (var id in GRINDER_RECIPES) {
        var r = GRINDER_RECIPES[id];
        var isSelected = (grinderState.selectedRecipe === id);
        var check = checkCanGrind(id, 1);
        var canMake = check.success;
        var statusText = canMake ? '✅ 可制作' : '❌ 材料不足';
        html += '<div class="grinder-recipe-card ' + (isSelected ? 'selected' : '') + (canMake ? '' : ' disabled') + '" data-recipe-id="' + id + '" onclick="selectGrinderRecipe(\'' + id + '\')">';
        if (r.img) { html += '<img src="' + r.img + '" class="grinder-recipe-img" onerror="this.style.display=\'none\'; this.parentElement.querySelector(\'.grinder-recipe-icon\').style.display=\'block\'"><span class="grinder-recipe-icon" style="display:none;">' + r.icon + '</span>'; }
        else { html += '<span class="grinder-recipe-icon">' + r.icon + '</span>'; }
        html += '<div class="grinder-recipe-name">' + r.outputName + '</div>';
        html += '<div class="grinder-recipe-cost">' + r.inputAmount + ' ' + r.inputName + ' → 1</div>';
        html += '<div class="grinder-recipe-status">' + statusText + '</div></div>';
    }
    html += '</div>';
    html += '<div class="grinder-action-wrapper">';
    var recipe = grinderState.selectedRecipe ? GRINDER_RECIPES[grinderState.selectedRecipe] : null;
    if (recipe) {
        var qty = grinderState.quantity || 1;
        var totalCost = qty * 2;
        var check = checkCanGrind(recipe.id, qty);
        var canGrind = check.success;
        var inputAmount = recipe.inputAmount * qty;
        var inputDisplay = recipe.inputName;
        if (recipe.inputType === 'mimi_seedling') {
            inputDisplay = '<img src="images/energy/米米苗苗.png" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;border-radius:4px;" onerror="this.style.display=\'none\'"> ' + recipe.inputName;
        }
        html += '<div class="grinder-action">';
        html += '<div class="grinder-action-info"><span class="grinder-action-label">已选：' + recipe.outputName + '</span>';
        html += '<div class="grinder-qty-control"><button class="grinder-qty-btn" onclick="changeGrinderQty(-1)">−</button>';
        html += '<input type="number" id="grinderQtyInput" value="' + qty + '" min="1" max="99" onchange="updateGrinderQty(this.value)" onfocus="this.select()">';
        html += '<button class="grinder-qty-btn" onclick="changeGrinderQty(1)">+</button></div></div>';
        html += '<div class="grinder-action-cost">需要：' + inputAmount + ' ' + inputDisplay + '  |  消耗：' + totalCost + ' 探险币</div>';
        html += '<div class="grinder-action-output">产出：' + qty + ' 个 ' + recipe.outputName + '</div>';
        html += '<button class="grinder-btn-grind ' + (canGrind ? '' : 'disabled') + '" onclick="executeGrind(\'' + recipe.id + '\', ' + qty + ')" ' + (canGrind ? '' : 'disabled') + '>' + (canGrind ? '⚙️ 开始粉碎' : '❌ 材料不足') + '</button>';
        html += '</div>';
    } else {
        html += '<div class="grinder-action-placeholder">👆 请选择要粉碎的材料</div>';
    }
    html += '</div>';
    html += '<div class="grinder-footer">💡 每制作 1 个产物消耗 2 探险币，支持批量制作，产出物存入探险背包</div>';
    container.innerHTML = html;
}

window.openGrinderPanel = openGrinderPanel;
window.closeGrinderPanel = closeGrinderPanel;
window.selectGrinderRecipe = selectGrinderRecipe;
window.changeGrinderQty = changeGrinderQty;
window.updateGrinderQty = updateGrinderQty;
window.executeGrind = executeGrind;
window.GRINDER_RECIPES = GRINDER_RECIPES;

console.log('🧂 粉碎机模块加载完成（提示显示在面板内）');