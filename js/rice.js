// ============================================================
// rice.js · 大米洲 · 能量工坊
// 提示显示在 #riceStatus（面板内）
// ============================================================

console.log('🍚 大米洲模块加载中...');

var RICE_ENERGY_TYPES = [
    { id: 'cheese_powder', name: '高塔芝士粉', img: 'images/energy/高塔芝士粉.png' },
    { id: 'inspiration_jelly', name: '灵感啫喱', img: 'images/energy/灵感啫喱.png' },
    { id: 'mimi_seedling', name: '米米苗苗', img: 'images/energy/米米苗苗.png' },
    { id: 'time_pudding', name: '时光布丁', img: 'images/energy/时光布丁.png' },
    { id: 'warm_butter', name: '温暖黄油', img: 'images/energy/温暖黄油.png' },
    { id: 'star_crystal', name: '星晶雪花', img: 'images/energy/星晶雪花.png' }
];

var RICE_CONFIG = {
    PADDY_ROWS: 4, PADDY_COLS: 9, WORKSHOP_COUNT: 3,
    PADDY_UNLOCK_PRICES: [20,20,20,20,20,30,30,30,30,30,45,45,45,45,45,65,65,65,65,65,90,90,90,90,90,120,120,120,120,160],
    WORKSHOP_UNLOCK_PRICES: [0, 300, 600],
    PLANT_COST_BEANS: 10, PLANT_DURATION: 300,
    HARVEST_MIN: 1, HARVEST_MAX: 3,
    GOLDEN_EAR_CHANCE: 0.05,
    PROCESS_COST_RICE: 10, PROCESS_COST_COINS: 9,
    PROCESS_DURATION: 1740,
    GOLDEN_EAR_BONUS_PER: 0.05,
    MAX_GOLDEN_EARS_PER_PROCESS: 10
};

var riceState = {
    paddies: [], workshops: [], paddiesUnlocked: 6, workshopsUnlocked: 1,
    totalHarvested: 0, totalEnergyProduced: 0, totalGoldenEarsHarvested: 0,
    activePanel: null, selectedWorkshop: null, selectedEnergy: null, goldenEarsInput: 0
};

var riceTimer = null;

function getBackpack() {
    try { var data = localStorage.getItem('explore_backpack'); return data ? JSON.parse(data) : {}; } catch(e) { return {}; }
}
function saveBackpack(backpack) { localStorage.setItem('explore_backpack', JSON.stringify(backpack)); }

function getRiceGrain() { var backpack = getBackpack(); return backpack.rice_grain || 0; }
function setRiceGrain(amount) { var backpack = getBackpack(); backpack.rice_grain = amount; saveBackpack(backpack); }
function addRiceGrain(amount) { var current = getRiceGrain(); setRiceGrain(current + amount); return current + amount; }
function spendRiceGrain(amount) { var current = getRiceGrain(); if (current < amount) return false; setRiceGrain(current - amount); return true; }

function getGoldenEars() { var backpack = getBackpack(); return backpack.golden_ear || 0; }
function setGoldenEars(amount) { var backpack = getBackpack(); backpack.golden_ear = amount; saveBackpack(backpack); }
function addGoldenEars(amount) { var current = getGoldenEars(); setGoldenEars(current + amount); return current + amount; }
function spendGoldenEars(amount) { var current = getGoldenEars(); if (current < amount) return false; setGoldenEars(current - amount); return true; }

function loadRiceData() {
    try {
        var saved = localStorage.getItem('rice_data');
        if (saved) {
            var data = JSON.parse(saved);
            riceState.paddies = data.paddies || [];
            riceState.workshops = data.workshops || [];
            riceState.paddiesUnlocked = data.paddiesUnlocked || 6;
            riceState.workshopsUnlocked = data.workshopsUnlocked || 1;
            riceState.totalHarvested = data.totalHarvested || 0;
            riceState.totalEnergyProduced = data.totalEnergyProduced || 0;
            riceState.totalGoldenEarsHarvested = data.totalGoldenEarsHarvested || 0;
            while (riceState.paddies.length < RICE_CONFIG.PADDY_ROWS * RICE_CONFIG.PADDY_COLS) {
                riceState.paddies.push({ unlocked: false, status: 'idle', plantedAt: 0, duration: RICE_CONFIG.PLANT_DURATION, readyAt: 0 });
            }
            while (riceState.workshops.length < RICE_CONFIG.WORKSHOP_COUNT) {
                riceState.workshops.push({ unlocked: false, status: 'idle', energyType: null, startedAt: 0, duration: RICE_CONFIG.PROCESS_DURATION, readyAt: 0, goldenEarsUsed: 0 });
            }
            for (var i = 0; i < Math.min(6, riceState.paddies.length); i++) riceState.paddies[i].unlocked = true;
            if (riceState.workshops.length > 0) riceState.workshops[0].unlocked = true;
            return true;
        }
    } catch(e) { console.warn('加载大米洲数据失败:', e); }
    initDefaultRiceData();
    return false;
}

function initDefaultRiceData() {
    riceState.paddies = [];
    for (var i = 0; i < RICE_CONFIG.PADDY_ROWS * RICE_CONFIG.PADDY_COLS; i++) {
        riceState.paddies.push({ unlocked: (i < 6), status: 'idle', plantedAt: 0, duration: RICE_CONFIG.PLANT_DURATION, readyAt: 0 });
    }
    riceState.workshops = [];
    for (var i = 0; i < RICE_CONFIG.WORKSHOP_COUNT; i++) {
        riceState.workshops.push({ unlocked: (i === 0), status: 'idle', energyType: null, startedAt: 0, duration: RICE_CONFIG.PROCESS_DURATION, readyAt: 0, goldenEarsUsed: 0 });
    }
    riceState.paddiesUnlocked = 6;
    riceState.workshopsUnlocked = 1;
    riceState.totalHarvested = 0;
    riceState.totalEnergyProduced = 0;
    riceState.totalGoldenEarsHarvested = 0;
    saveRiceData();
}

function saveRiceData() {
    try {
        var data = {
            paddies: riceState.paddies, workshops: riceState.workshops,
            paddiesUnlocked: riceState.paddiesUnlocked, workshopsUnlocked: riceState.workshopsUnlocked,
            totalHarvested: riceState.totalHarvested, totalEnergyProduced: riceState.totalEnergyProduced,
            totalGoldenEarsHarvested: riceState.totalGoldenEarsHarvested
        };
        localStorage.setItem('rice_data', JSON.stringify(data));
    } catch(e) { console.warn('保存大米洲数据失败:', e); }
}

function getExploreCoins() {
    try { var saved = localStorage.getItem('explore_coins'); return saved ? parseInt(saved) || 0 : 0; } catch(e) { return 0; }
}
function saveExploreCoins(amount) { localStorage.setItem('explore_coins', String(amount)); }
function spendExploreCoins(amount) { var current = getExploreCoins(); if (current < amount) return false; saveExploreCoins(current - amount); return true; }
function addExploreCoins(amount) { var current = getExploreCoins(); saveExploreCoins(current + amount); return current + amount; }

function getCocoaBeans() {
    try { var saved = localStorage.getItem('chocolate_save'); if (saved) { var data = JSON.parse(saved); return data.cocoaBeans || 0; } } catch(e) {}
    return 0;
}
function setCocoaBeans(amount) {
    try { var saved = localStorage.getItem('chocolate_save'); var data = saved ? JSON.parse(saved) : {}; data.cocoaBeans = amount; localStorage.setItem('chocolate_save', JSON.stringify(data)); } catch(e) {}
}
function spendCocoaBeans(amount) { var current = getCocoaBeans(); if (current < amount) return false; setCocoaBeans(current - amount); return true; }

function getEnergies() {
    try { var saved = localStorage.getItem('chocolate_save'); if (saved) { var data = JSON.parse(saved); return data.energies || {}; } } catch(e) {}
    return {};
}
function setEnergies(energies) {
    try { var saved = localStorage.getItem('chocolate_save'); var data = saved ? JSON.parse(saved) : {}; data.energies = energies; localStorage.setItem('chocolate_save', JSON.stringify(data)); } catch(e) {}
}
function addEnergy(energyType, amount) { var energies = getEnergies(); energies[energyType] = (energies[energyType] || 0) + amount; setEnergies(energies); }

function nowSeconds() { return Math.floor(Date.now() / 1000); }

function getPaddyUnlockPrice(index) {
    var idx = index - 6;
    if (idx < 0) return 0;
    if (idx >= RICE_CONFIG.PADDY_UNLOCK_PRICES.length) return 9999;
    return RICE_CONFIG.PADDY_UNLOCK_PRICES[idx];
}

function getEnergyName(id) {
    for (var i = 0; i < RICE_ENERGY_TYPES.length; i++) {
        if (RICE_ENERGY_TYPES[i].id === id) return RICE_ENERGY_TYPES[i].name;
    }
    return id;
}
function getEnergyImg(id) {
    for (var i = 0; i < RICE_ENERGY_TYPES.length; i++) {
        if (RICE_ENERGY_TYPES[i].id === id) return RICE_ENERGY_TYPES[i].img;
    }
    return '';
}

// ---- 面板状态提示 ----
function showRiceStatus(msg, isError) {
    var el = document.getElementById('riceStatus');
    if (el) {
        el.textContent = msg;
        el.style.color = isError ? '#ff6b6b' : '#ffd700';
        clearTimeout(el._timer);
        el._timer = setTimeout(function() { el.textContent = ''; }, 3000);
    }
}

function plantPaddy(index) {
    var p = riceState.paddies[index];
    if (!p || !p.unlocked) { showRiceStatus('🔒 未解锁', true); return false; }
    if (p.status !== 'idle') { showRiceStatus('已在生长或可收割', true); return false; }
    if (!spendCocoaBeans(RICE_CONFIG.PLANT_COST_BEANS)) { showRiceStatus('可可豆不足', true); return false; }
    var now = nowSeconds();
    p.status = 'growing';
    p.plantedAt = now;
    p.duration = RICE_CONFIG.PLANT_DURATION;
    p.readyAt = now + RICE_CONFIG.PLANT_DURATION;
    saveRiceData();
    // ===== 添加音效 =====
    if (typeof soundPlant === 'function') soundPlant();
    // ===== 音效添加结束 =====
    renderRiceUI();
    showRiceStatus('🌱 种植成功', false);
    return true;
}

function harvestPaddy(index) {
    var p = riceState.paddies[index];
    if (!p || !p.unlocked) { showRiceStatus('🔒 未解锁', true); return false; }
    if (p.status !== 'ready') { showRiceStatus('未成熟', true); return false; }
    var yieldAmount = Math.floor(Math.random() * (RICE_CONFIG.HARVEST_MAX - RICE_CONFIG.HARVEST_MIN + 1)) + RICE_CONFIG.HARVEST_MIN;
    addRiceGrain(yieldAmount);
    riceState.totalHarvested += yieldAmount;
    var goldenEar = false;
    if (Math.random() < RICE_CONFIG.GOLDEN_EAR_CHANCE) {
        addGoldenEars(1);
        riceState.totalGoldenEarsHarvested++;
        goldenEar = true;
    }
    p.status = 'idle';
    p.plantedAt = 0;
    p.readyAt = 0;
    saveRiceData();
    // ===== 添加音效 =====
    if (typeof soundCollect === 'function') soundCollect();
    // ===== 音效添加结束 =====
    renderRiceUI();
    var msg = '🌾 收获 ' + yieldAmount + ' 稻谷';
    if (goldenEar) msg += ' 🌾✨ 获得金色稻穗！';
    showRiceStatus(msg, false);
    return true;
}

function plantAllPaddies() {
    var planted = 0;
    for (var i = 0; i < riceState.paddies.length; i++) {
        if (plantPaddy(i)) planted++;
    }
    if (planted === 0) showRiceStatus('没有空闲稻田或豆子不足', true);
    else showRiceStatus('🌱 种植了 ' + planted + ' 块稻田', false);
}

function harvestAllPaddies() {
    var harvested = 0, totalRice = 0, goldenEarsGained = 0;
    for (var i = 0; i < riceState.paddies.length; i++) {
        var p = riceState.paddies[i];
        if (p.unlocked && p.status === 'ready') {
            var y = Math.floor(Math.random() * (RICE_CONFIG.HARVEST_MAX - RICE_CONFIG.HARVEST_MIN + 1)) + RICE_CONFIG.HARVEST_MIN;
            addRiceGrain(y);
            riceState.totalHarvested += y;
            totalRice += y;
            if (Math.random() < RICE_CONFIG.GOLDEN_EAR_CHANCE) {
                addGoldenEars(1);
                riceState.totalGoldenEarsHarvested++;
                goldenEarsGained++;
            }
            p.status = 'idle';
            p.plantedAt = 0;
            p.readyAt = 0;
            harvested++;
        }
    }
    if (harvested === 0) { showRiceStatus('没有可收割的稻田', true); return; }
    saveRiceData();
    // ===== 添加音效 =====
    if (typeof soundCollect === 'function') soundCollect();
    // ===== 音效添加结束 =====
    renderRiceUI();
    var msg = '🌾 收割了 ' + harvested + ' 块，获得 ' + totalRice + ' 稻谷';
    if (goldenEarsGained > 0) msg += ' 🌾✨ +' + goldenEarsGained + ' 金色稻穗';
    showRiceStatus(msg, false);
}

function unlockPaddy(index) {
    var p = riceState.paddies[index];
    if (!p || p.unlocked) { showRiceStatus('已解锁', true); return false; }
    var price = getPaddyUnlockPrice(index);
    if (price === 0) { p.unlocked = true; riceState.paddiesUnlocked++; saveRiceData(); renderRiceUI(); showRiceStatus('🔓 解锁成功', false); return true; }
    if (!spendExploreCoins(price)) { showRiceStatus('探险币不足，需要 ' + price, true); return false; }
    p.unlocked = true;
    riceState.paddiesUnlocked++;
    saveRiceData();
    renderRiceUI();
    showRiceStatus('🔓 解锁成功，消耗 ' + price + ' 探险币', false);
    return true;
}

function unlockWorkshop(index) {
    var w = riceState.workshops[index];
    if (!w || w.unlocked) { showRiceStatus('已解锁', true); return false; }
    var price = RICE_CONFIG.WORKSHOP_UNLOCK_PRICES[index] || 9999;
    if (!spendExploreCoins(price)) { showRiceStatus('探险币不足，需要 ' + price, true); return false; }
    w.unlocked = true;
    riceState.workshopsUnlocked++;
    saveRiceData();
    renderRiceUI();
    showRiceStatus('🔓 工坊解锁，消耗 ' + price + ' 探险币', false);
    return true;
}

function startProcessing(workshopIndex, energyType, goldenEarsUsed) {
    var w = riceState.workshops[workshopIndex];
    if (!w || !w.unlocked) { showRiceStatus('工坊未解锁', true); return false; }
    if (w.status !== 'idle') { showRiceStatus('工坊忙碌', true); return false; }
    if (!energyType) { showRiceStatus('请选择能量类型', true); return false; }
    if (goldenEarsUsed < 0 || goldenEarsUsed > RICE_CONFIG.MAX_GOLDEN_EARS_PER_PROCESS) { showRiceStatus('金色稻穗数量需0~10', true); return false; }
    if (goldenEarsUsed > getGoldenEars()) { showRiceStatus('金色稻穗不足', true); return false; }
    var normalRiceNeeded = RICE_CONFIG.PROCESS_COST_RICE - goldenEarsUsed;
    if (normalRiceNeeded < 0) normalRiceNeeded = 0;
    if (getRiceGrain() < normalRiceNeeded) { showRiceStatus('普通稻谷不足，需要 ' + normalRiceNeeded, true); return false; }
    if (!spendExploreCoins(RICE_CONFIG.PROCESS_COST_COINS)) { showRiceStatus('探险币不足', true); return false; }
    spendRiceGrain(normalRiceNeeded);
    spendGoldenEars(goldenEarsUsed);
    var now = nowSeconds();
    w.status = 'processing';
    w.energyType = energyType;
    w.startedAt = now;
    w.duration = RICE_CONFIG.PROCESS_DURATION;
    w.readyAt = now + RICE_CONFIG.PROCESS_DURATION;
    w.goldenEarsUsed = goldenEarsUsed;
    saveRiceData();
    renderRiceUI();
    showRiceStatus('⚙️ 开始加工 ' + getEnergyName(energyType), false);
    return true;
}

function collectEnergy(workshopIndex) {
    var w = riceState.workshops[workshopIndex];
    if (!w || !w.unlocked) { showRiceStatus('工坊未解锁', true); return false; }
    if (w.status !== 'completed') { showRiceStatus('未完成', true); return false; }
    var bonus = w.goldenEarsUsed * RICE_CONFIG.GOLDEN_EAR_BONUS_PER;
    var isDouble = Math.random() < bonus;
    var amount = isDouble ? 2 : 1;
    addEnergy(w.energyType, amount);
    riceState.totalEnergyProduced += amount;
    var ename = getEnergyName(w.energyType);
    // ===== 添加音效 =====
    if (typeof soundEnergyComplete === 'function') soundEnergyComplete();
    // ===== 音效添加结束 =====

    // ===== 添加声望 =====
    if (typeof window.addReputation === 'function') {
        window.addReputation(5, '大米洲制作能量：' + ename);
    }
    // ===== 声望添加结束 =====

    w.status = 'idle';
    w.energyType = null;
    w.startedAt = 0;
    w.readyAt = 0;
    w.goldenEarsUsed = 0;
    saveRiceData();
    renderRiceUI();
    var msg = '🎉 获得 ' + amount + ' 个 ' + ename;
    if (isDouble) msg += ' 🌟 暴击！双倍能量！';
    showRiceStatus(msg, false);
    return true;
}

function selectEnergy(energyId) { riceState.selectedEnergy = energyId; renderRiceUI(); }
function updateGoldenEarsInput(value) {
    var val = parseInt(value) || 0;
    if (val < 0) val = 0;
    if (val > RICE_CONFIG.MAX_GOLDEN_EARS_PER_PROCESS) val = RICE_CONFIG.MAX_GOLDEN_EARS_PER_PROCESS;
    riceState.goldenEarsInput = val;
    renderRiceUI();
}

function getRiceStats() { return { riceGrain: getRiceGrain(), goldenEars: getGoldenEars() }; }
window.getRiceStats = getRiceStats;

function renderRiceUI() {
    var container = document.getElementById('riceMode');
    if (!container) return;
    var now = nowSeconds();
    var coins = getExploreCoins();
    var beans = getCocoaBeans();
    var energies = getEnergies();
    var energyHtml = '';
    RICE_ENERGY_TYPES.forEach(function(e) {
        var count = energies[e.id] || 0;
        energyHtml += '<span class="rice-energy-stock-item"><img src="' + e.img + '" class="rice-energy-stock-img" onerror="this.style.display=\'none\'"><span class="rice-energy-stock-count">' + count + '</span></span>';
    });
    var panel = riceState.activePanel;
    var html = '';
    var title = '🍚 大米洲';
    if (panel === 'paddy') title = '🌾 稻田种植';
    else if (panel === 'workshop') title = '⚙️ 能量工坊';
    html += '<div class="rice-header">';
    html += '<div class="rice-title">' + title + '</div>';
    html += '<div class="rice-header-actions"><button class="rice-btn-close" onclick="closeRicePanel()">✕ 关闭</button></div>';
    html += '</div>';
    html += '<div id="riceStatus" style="font-size:0.7rem;color:rgba(255,255,255,0.3);text-align:center;min-height:20px;padding:4px 0;"></div>';
    html += '<div class="rice-stats">';
    html += '<span>🌾 稻谷 <strong>' + getRiceGrain() + '</strong></span>';
    html += '<span>🌾✨ 金色稻穗 <strong>' + getGoldenEars() + '</strong></span>';
    html += '<span>🫘 可可豆 <strong>' + beans + '</strong></span>';
    html += '<span>⚓ 探险币 <strong>' + coins + '</strong></span>';
    html += '</div>';
    if (panel === 'workshop') {
        html += '<div class="rice-energy-stock"><span class="rice-energy-stock-label">能量库存:</span> ' + energyHtml + '</div>';
    }
    html += '<div class="rice-main-content">';
    if (panel === 'paddy') html += renderPaddyPanel(now);
    else if (panel === 'workshop') html += renderWorkshopPanel(now);
    else html += renderPaddyPanel(now);
    html += '</div>';
    html += '<div class="rice-footer">';
    if (panel === 'paddy') html += '💡 点击空闲稻田种植（消耗 10 可可豆），5分钟后收获 1~3 稻谷，5%概率获得金色稻穗';
    else if (panel === 'workshop') html += '💡 消耗 10 稻谷（可含金色稻穗）+ 9 探险币，29分钟产出 1 能量，每投入1金色稻穗 +5% 双倍概率（上限50%）';
    html += '</div>';
    container.innerHTML = html;
}

function renderPaddyPanel(now) {
    var html = '';
    html += '<div class="rice-paddy-container">';
    html += '<div class="rice-paddy-header"><span>已解锁 ' + riceState.paddiesUnlocked + '/36</span>';
    html += '<div class="rice-paddy-actions">';
    html += '<button class="rice-btn-sm" onclick="plantAllPaddies()">🌱 一键种植</button>';
    html += '<button class="rice-btn-sm" onclick="harvestAllPaddies()">🌾 一键收割</button>';
    html += '</div></div>';
    html += '<div class="rice-paddy-grid">';
    for (var i = 0; i < riceState.paddies.length; i++) {
        var p = riceState.paddies[i];
        var cls = 'rice-paddy-cell';
        var content = '';
        var click = '';
        if (!p.unlocked) {
            var price = getPaddyUnlockPrice(i);
            cls += ' locked';
            content = '🔒<br><span class="rice-price">' + price + '⚓</span>';
            click = 'onclick="unlockPaddy(' + i + ')"';
        } else if (p.status === 'idle') {
            cls += ' idle';
            content = '🟫';
            click = 'onclick="plantPaddy(' + i + ')"';
        } else if (p.status === 'growing') {
            var remaining = Math.max(0, p.readyAt - now);
            var mins = Math.floor(remaining / 60);
            var secs = remaining % 60;
            cls += ' growing';
            content = '🌱<br><span class="rice-timer" data-index="' + i + '">' + String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0') + '</span>';
        } else if (p.status === 'ready') {
            cls += ' ready';
            content = '🌾<br><span class="rice-ready-label">可收</span>';
            click = 'onclick="harvestPaddy(' + i + ')"';
        }
        html += '<div class="' + cls + '" ' + click + '>' + content + '</div>';
    }
    html += '</div></div>';
    return html;
}

function renderWorkshopPanel(now) {
    var html = '';
    html += '<div class="workshop-panel-3">';
    for (var i = 0; i < riceState.workshops.length; i++) {
        var w = riceState.workshops[i];
        var cardClass = 'workshop-card';
        var statusText = '';
        var actionHtml = '';
        var extraHtml = '';
        if (!w.unlocked) {
            var price = RICE_CONFIG.WORKSHOP_UNLOCK_PRICES[i] || 9999;
            cardClass += ' locked';
            statusText = '🔒 ' + price + '⚓ 解锁';
            actionHtml = '<button class="primary" onclick="unlockWorkshop(' + i + ')">解锁</button>';
        } else if (w.status === 'idle') {
            cardClass += ' idle';
            statusText = '空闲';
            var isSelected = (riceState.selectedWorkshop === i);
            if (isSelected) actionHtml = '<button class="primary" onclick="riceShowEnergySelect(' + i + ')">收起</button>';
            else actionHtml = '<button class="primary" onclick="riceShowEnergySelect(' + i + ')">选择能量</button>';
            if (isSelected) extraHtml = renderEnergySelector(i);
        } else if (w.status === 'processing') {
            cardClass += ' processing';
            var remaining = Math.max(0, w.readyAt - now);
            var mins = Math.floor(remaining / 60);
            var secs = remaining % 60;
            var ename = getEnergyName(w.energyType);
            statusText = '⏳ ' + ename + ' <span class="workshop-timer" data-index="' + i + '">' + String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0') + '</span> 剩余';
            actionHtml = '<button disabled>加工中</button>';
        } else if (w.status === 'completed') {
            cardClass += ' completed';
            var ename = getEnergyName(w.energyType);
            statusText = '✅ ' + ename + ' 可收取';
            actionHtml = '<button class="primary" onclick="collectEnergy(' + i + ')">收取</button>';
        }
        html += '<div class="' + cardClass + '" data-index="' + i + '">';
        html += '<div class="workshop-info"><div class="workshop-name">工坊 ' + (i+1) + (w.energyType && w.status === 'processing' ? ' · ' + getEnergyName(w.energyType) : '') + '</div><div class="workshop-status">' + statusText + '</div></div>';
        html += '<div class="workshop-action">' + actionHtml + '</div>';
        html += '</div>';
        if (extraHtml) html += extraHtml;
    }
    html += '</div>';
    return html;
}

function renderEnergySelector(workshopIndex) {
    var html = '';
    html += '<div class="energy-selector">';
    html += '<div class="energy-options">';
    RICE_ENERGY_TYPES.forEach(function(e) {
        var selected = (riceState.selectedEnergy === e.id) ? 'selected' : '';
        html += '<span class="energy-option ' + selected + '" onclick="selectEnergy(\'' + e.id + '\')">';
        html += '<img src="' + e.img + '" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;margin-right:4px;" onerror="this.style.display=\'none\'">';
        html += e.name;
        html += '</span>';
    });
    html += '</div>';
    html += '<div class="golden-input">';
    html += '<label>金色稻穗投入:</label>';
    html += '<input type="range" min="0" max="' + RICE_CONFIG.MAX_GOLDEN_EARS_PER_PROCESS + '" value="' + riceState.goldenEarsInput + '" oninput="updateGoldenEarsInput(this.value)">';
    html += '<span>' + riceState.goldenEarsInput + '</span>';
    html += '<button class="primary" onclick="riceConfirmStart(' + workshopIndex + ')">开始加工</button>';
    html += '</div></div>';
    return html;
}

function riceShowEnergySelect(workshopIndex) {
    if (riceState.selectedWorkshop === workshopIndex) {
        riceState.selectedWorkshop = null;
        riceState.selectedEnergy = null;
    } else {
        riceState.selectedWorkshop = workshopIndex;
        riceState.selectedEnergy = null;
        riceState.goldenEarsInput = 0;
    }
    renderRiceUI();
}

function riceConfirmStart(workshopIndex) {
    var idx = workshopIndex !== undefined ? workshopIndex : riceState.selectedWorkshop;
    if (idx === null || idx === undefined) { showRiceStatus('请选择工坊', true); return; }
    if (!riceState.selectedEnergy) { showRiceStatus('请选择能量类型', true); return; }
    var goldenEars = riceState.goldenEarsInput || 0;
    startProcessing(idx, riceState.selectedEnergy, goldenEars);
    riceState.selectedWorkshop = null;
    riceState.selectedEnergy = null;
    riceState.goldenEarsInput = 0;
    renderRiceUI();
}

function updateRiceTimers() {
    var now = nowSeconds();
    var needSave = false;
    for (var i = 0; i < riceState.paddies.length; i++) {
        var p = riceState.paddies[i];
        if (p.unlocked && p.status === 'growing' && now >= p.readyAt) { p.status = 'ready'; needSave = true; }
    }
    for (var i = 0; i < riceState.workshops.length; i++) {
        var w = riceState.workshops[i];
        if (w.unlocked && w.status === 'processing' && now >= w.readyAt) { w.status = 'completed'; needSave = true; }
    }
    if (needSave) { saveRiceData(); var container = document.getElementById('riceMode'); if (container && container.style.display !== 'none') renderRiceUI(); return; }
    var timerSpans = document.querySelectorAll('.rice-timer');
    timerSpans.forEach(function(span) {
        var idx = parseInt(span.dataset.index);
        if (!isNaN(idx) && idx >= 0 && idx < riceState.paddies.length) {
            var p = riceState.paddies[idx];
            if (p && p.status === 'growing') {
                var remaining = Math.max(0, p.readyAt - now);
                var mins = Math.floor(remaining / 60);
                var secs = remaining % 60;
                span.textContent = String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0');
            }
        }
    });
    var workshopTimers = document.querySelectorAll('.workshop-timer');
    workshopTimers.forEach(function(span) {
        var idx = parseInt(span.dataset.index);
        if (!isNaN(idx) && idx >= 0 && idx < riceState.workshops.length) {
            var w = riceState.workshops[idx];
            if (w && w.status === 'processing') {
                var remaining = Math.max(0, w.readyAt - now);
                var mins = Math.floor(remaining / 60);
                var secs = remaining % 60;
                span.textContent = String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0');
            }
        }
    });
}

function openRicePanel(panel) {
    if (panel !== 'paddy' && panel !== 'workshop') panel = 'paddy';
    loadRiceData();
    riceState.activePanel = panel;
    riceState.selectedWorkshop = null;
    riceState.selectedEnergy = null;
    riceState.goldenEarsInput = 0;
    var infoMode = document.getElementById('infoMode');
    var riceMode = document.getElementById('riceMode');
    if (!riceMode) {
        var panelEl = document.getElementById('infoPanel');
        var mode = document.createElement('div');
        mode.id = 'riceMode';
        mode.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;z-index:4;padding:12px 16px;overflow-y:auto;border:2px solid #c98f5e;box-shadow:inset 0 0 60px rgba(0,0,0,0.6);background:linear-gradient(145deg,#3d2b1f,#6a4a2a);border-radius:16px;';
        panelEl.appendChild(mode);
        riceMode = mode;
    }
    riceMode.style.display = 'block';
    if (infoMode) infoMode.style.display = 'none';
    renderRiceUI();
    if (riceTimer) clearInterval(riceTimer);
    riceTimer = setInterval(updateRiceTimers, 1000);
}

function closeRicePanel() {
    var riceMode = document.getElementById('riceMode');
    if (riceMode) riceMode.style.display = 'none';
    var infoMode = document.getElementById('infoMode');
    if (infoMode) infoMode.style.display = 'flex';
    if (riceTimer) { clearInterval(riceTimer); riceTimer = null; }
    riceState.activePanel = null;
    if (typeof window.updateInfoPanel === 'function') window.updateInfoPanel();
}

window.openRicePanel = openRicePanel;
window.closeRicePanel = closeRicePanel;
window.plantPaddy = plantPaddy;
window.harvestPaddy = harvestPaddy;
window.plantAllPaddies = plantAllPaddies;
window.harvestAllPaddies = harvestAllPaddies;
window.unlockPaddy = unlockPaddy;
window.unlockWorkshop = unlockWorkshop;
window.startProcessing = startProcessing;
window.collectEnergy = collectEnergy;
window.selectEnergy = selectEnergy;
window.updateGoldenEarsInput = updateGoldenEarsInput;
window.riceShowEnergySelect = riceShowEnergySelect;
window.riceConfirmStart = riceConfirmStart;
window.getEnergyName = getEnergyName;
window.getEnergyImg = getEnergyImg;
window.getRiceStats = getRiceStats;
window.addRiceGrain = addRiceGrain;
window.addGoldenEars = addGoldenEars;
window.riceState = riceState;

function initRice() { loadRiceData(); console.log('🍚 大米洲模块已加载，稻谷: ' + getRiceGrain() + '，金色稻穗: ' + getGoldenEars()); }

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initRice); } else { initRice(); }
console.log('🍚 大米洲模块加载完成（提示显示在面板内）');