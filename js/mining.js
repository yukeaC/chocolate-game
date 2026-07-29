// ============================================================
// mining.js · 沙锅洲 · 挖矿小游戏（含成就统计 + 挑战塔钩子）
// ============================================================
console.log('⛏️ 挖矿系统加载中...');

var MINING_CONFIG = {
    COLS: 7,
    ROWS: 6,
    RARITY: { DIRT: 0.70, IRON: 0.20, DIAMOND: 0.10 },
    FREE_PICKAXE_DAILY: 10
};

var miningState = {
    depth: 0,
    rows: [],
    currentRowIndex: 0,
    tools: { pickaxe: 0, firecracker: 0, dynamite: 0 },
    selectedTool: 'pickaxe',
    lastClaimDate: null,
    isActive: false,
    isMining: false,
    basket: [],
    totalIron: 0,
    totalDiamond: 0
};

function saveMiningData() {
    try {
        var data = {
            depth: miningState.depth,
            rows: miningState.rows,
            currentRowIndex: miningState.currentRowIndex,
            basket: miningState.basket,
            tools: miningState.tools,
            lastClaimDate: miningState.lastClaimDate,
            totalIron: miningState.totalIron,
            totalDiamond: miningState.totalDiamond
        };
        localStorage.setItem('mining_data', JSON.stringify(data));
        window.totalIronOre = miningState.totalIron;
        window.totalDiamond = miningState.totalDiamond;
    } catch(e) { console.warn('保存矿洞数据失败:', e); }
}

function loadMiningData() {
    try {
        var saved = localStorage.getItem('mining_data');
        if (saved) {
            var data = JSON.parse(saved);
            miningState.depth = data.depth || 0;
            miningState.rows = data.rows || [];
            miningState.currentRowIndex = data.currentRowIndex || 0;
            miningState.basket = data.basket || [];
            miningState.tools = data.tools || { pickaxe: 0, firecracker: 0, dynamite: 0 };
            miningState.lastClaimDate = data.lastClaimDate || null;
            miningState.totalIron = data.totalIron || 0;
            miningState.totalDiamond = data.totalDiamond || 0;
            window.totalIronOre = miningState.totalIron;
            window.totalDiamond = miningState.totalDiamond;

            // 补全旧存档中缺少 content 的格子
            for (var r = 0; r < miningState.rows.length; r++) {
                var row = miningState.rows[r];
                if (row && row.cells) {
                    for (var c = 0; c < row.cells.length; c++) {
                        var cell = row.cells[c];
                        if (cell && cell.content === undefined) {
                            cell.content = getRandomResult();
                        }
                    }
                }
            }
            return true;
        }
    } catch(e) { console.warn('加载矿洞数据失败:', e); }
    return false;
}

function clearMiningData() { localStorage.removeItem('mining_data'); }

function getMiningBackpack() {
    try { var data = localStorage.getItem('explore_backpack'); return data ? JSON.parse(data) : {}; } catch(e) { return {}; }
}

function saveMiningBackpack(backpack) { localStorage.setItem('explore_backpack', JSON.stringify(backpack)); }

function getIronOreCount() { var backpack = getMiningBackpack(); return backpack.iron_ore || 0; }

function getDiamondCount() { var backpack = getMiningBackpack(); return backpack.diamond || 0; }

function getExploreCoins() {
    try { var saved = localStorage.getItem('explore_coins'); return saved ? parseInt(saved) || 0 : 0; } catch(e) { return 0; }
}

function addExploreCoins(amount) {
    var current = getExploreCoins();
    var newTotal = current + amount;
    localStorage.setItem('explore_coins', String(newTotal));
    if (typeof window.updateExploreCoinsDisplay === 'function') window.updateExploreCoinsDisplay();
    return newTotal;
}

function spendExploreCoins(amount) {
    var current = getExploreCoins();
    if (current < amount) return false;
    localStorage.setItem('explore_coins', String(current - amount));
    if (typeof window.updateExploreCoinsDisplay === 'function') window.updateExploreCoinsDisplay();
    return true;
}

function getTodayDateStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function canClaimFreePickaxe() {
    var today = getTodayDateStr();
    return miningState.lastClaimDate !== today;
}

function claimFreePickaxe() {
    if (!canClaimFreePickaxe()) {
        showMiningStatus('⏳ 今天已经领取过免费镐头了！', true);
        return false;
    }
    miningState.tools.pickaxe += MINING_CONFIG.FREE_PICKAXE_DAILY;
    miningState.lastClaimDate = getTodayDateStr();
    saveMiningData();
    showMiningStatus('⛏️ 领取了 ' + MINING_CONFIG.FREE_PICKAXE_DAILY + ' 个免费镐头！当前 ' + miningState.tools.pickaxe + ' 个', false);
    updateMiningUI();
    return true;
}

function addTool(toolType, amount) {
    if (miningState.tools[toolType] !== undefined) {
        miningState.tools[toolType] += amount;
        saveMiningData();
        updateMiningUI();
        return true;
    }
    return false;
}

function spendTool(toolType, amount) {
    if (miningState.tools[toolType] === undefined) return false;
    if (miningState.tools[toolType] < amount) return false;
    miningState.tools[toolType] -= amount;
    saveMiningData();
    updateMiningUI();
    return true;
}

function getRandomResult() {
    var rand = Math.random();
    if (rand < MINING_CONFIG.RARITY.DIRT) return { type: 'dirt', icon: null, name: '土块', isRecorded: false };
    else if (rand < MINING_CONFIG.RARITY.DIRT + MINING_CONFIG.RARITY.IRON) return { type: 'iron', icon: '🪨', name: '铁矿', isRecorded: true };
    else return { type: 'diamond', icon: '💎', name: '钻石', isRecorded: true };
}

function createEmptyCell() {
    var result = getRandomResult();
    return { 
        state: 'hidden', 
        content: result
    };
}

function createRow() {
    var cells = [];
    for (var c = 0; c < MINING_CONFIG.COLS; c++) cells.push(createEmptyCell());
    return { cells: cells, mined: false };
}

function initMiningGrid() {
    miningState.rows = [];
    miningState.depth = 0;
    for (var r = 0; r < MINING_CONFIG.ROWS; r++) miningState.rows.push(createRow());
    var firstRow = miningState.rows[0];
    for (var c = 0; c < MINING_CONFIG.COLS; c++) {
        firstRow.cells[c].state = 'revealed';
    }
    miningState.currentRowIndex = 0;
}

function getCurrentRow() {
    if (miningState.rows.length === 0) initMiningGrid();
    return miningState.rows[miningState.currentRowIndex];
}

function addToBasket(item) { miningState.basket.push(item); updateMiningUI(); }

function getBasketCount() { return miningState.basket.length; }

function getBasketItems() {
    var items = {};
    miningState.basket.forEach(function(item) {
        var key = item.type;
        if (!items[key]) items[key] = { icon: item.icon, name: item.name, count: 0 };
        items[key].count++;
    });
    return items;
}

function showBasketModal() {
    var basketItems = getBasketItems();
    var totalCount = getBasketCount();
    var html = '<div style="max-width:380px;width:90%;background:#fffaf0;border-radius:48px;padding:24px;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
    html += '<h3 style="margin:0;color:#5a2e1c;">🧺 背篓</h3>';
    html += '<button onclick="document.getElementById(\'basketModal\').remove()" style="background:#c98f5e;border:none;border-radius:30px;padding:4px 14px;cursor:pointer;font-size:0.8rem;color:white;font-weight:bold;">关闭</button>';
    html += '</div>';
    if (totalCount === 0) {
        html += '<div style="text-align:center;padding:40px 0;font-size:0.9rem;color:#a56b3a;">🧺 背篓空空如也，去挖矿吧！</div>';
    } else {
        html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">';
        for (var key in basketItems) {
            var item = basketItems[key];
            html += '<div style="background:#f5ede4;border-radius:16px;padding:12px;text-align:center;border:1px solid #e7c29e;">';
            html += '<div style="font-size:2.2rem;">' + item.icon + '</div>';
            html += '<div style="font-size:0.7rem;font-weight:bold;color:#5a2e1c;margin-top:2px;">' + item.name + '</div>';
            html += '<div style="font-size:0.9rem;font-weight:bold;color:#c4651e;">×' + item.count + '</div>';
            html += '</div>';
        }
        html += '</div>';
        html += '<div style="text-align:center;margin-top:12px;font-size:0.7rem;color:#a56b3a;">共 ' + totalCount + ' 件 · 退出时自动转入背包</div>';
    }
    html += '</div>';
    var oldModal = document.getElementById('basketModal');
    if (oldModal) oldModal.remove();
    var modal = document.createElement('div');
    modal.id = 'basketModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;justify-content:center;align-items:center;z-index:1001;';
    modal.innerHTML = html;
    modal.addEventListener('click', function(e) { if (e.target === this) this.remove(); });
    document.body.appendChild(modal);
}

function transferBasketToBackpack() {
    if (miningState.basket.length === 0) return;
    var backpack = getMiningBackpack();
    miningState.basket.forEach(function(item) {
        if (item.type === 'iron') backpack.iron_ore = (backpack.iron_ore || 0) + 1;
        else if (item.type === 'diamond') backpack.diamond = (backpack.diamond || 0) + 1;
    });
    saveMiningBackpack(backpack);
    var count = miningState.basket.length;
    miningState.basket = [];
    showMiningStatus('🎒 ' + count + ' 件物品已转入探险背包！', false);
    updateMiningUI();
}

function revealNeighbors(rowIndex, colIndex) {
    var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (var d = 0; d < dirs.length; d++) {
        var nr = rowIndex + dirs[d][0];
        var nc = colIndex + dirs[d][1];
        if (nr < 0 || nr >= miningState.rows.length) continue;
        if (nc < 0 || nc >= MINING_CONFIG.COLS) continue;
        var neighbor = miningState.rows[nr].cells[nc];
        if (neighbor.state === 'hidden') {
            neighbor.state = 'revealed';
        }
    }
}

function isCellMineable(rowIndex, colIndex) {
    var row = miningState.rows[rowIndex];
    if (!row) return false;
    var cell = row.cells[colIndex];
    if (!cell) return false;
    if (cell.state !== 'revealed') return false;
    return true;
}

function isToolValidForCell(rowIndex, colIndex) {
    var row = miningState.rows[rowIndex];
    if (!row) return false;
    var cell = row.cells[colIndex];
    if (!cell) return false;
    if (cell.state !== 'mined_dirt') return false;
    return true;
}

// ============================================================
// mineSingleCell · 挖矿核心逻辑（含挑战塔钩子）
// ============================================================
function mineSingleCell(rowIndex, colIndex) {
    var row = miningState.rows[rowIndex];
    if (!row) return;
    var cell = row.cells[colIndex];
    if (!cell) return;
    if (cell.state === 'mined_dirt' || cell.state === 'mined_item') return;

    var rowHasMined = false;
    for (var c = 0; c < MINING_CONFIG.COLS; c++) {
        var cellState = row.cells[c].state;
        if (cellState === 'mined_dirt' || cellState === 'mined_item') {
            rowHasMined = true;
            break;
        }
    }
    if (!rowHasMined) {
        miningState.depth++;
        row.mined = true;
        saveMiningData();
    }

    var result = cell.content;
    if (!result) {
        result = getRandomResult();
        cell.content = result;
    }
    
    if (result.type === 'dirt') {
        cell.state = 'mined_dirt';
        cell.content = null;
    } else {
        cell.state = 'mined_item';
        showCollectPopup(result);
        if (typeof soundItemGet === 'function') soundItemGet();
        if (result.type === 'iron') {
            miningState.totalIron++;
            if (typeof window.addReputation === 'function') {
                window.addReputation(2, '挖矿获得铁矿');
            }
            // ===== 挑战塔：挖到铁矿 =====
            if (typeof onTowerMined === 'function') {
                onTowerMined('iron');
            }
        } else if (result.type === 'diamond') {
            miningState.totalDiamond++;
            if (typeof window.addReputation === 'function') {
                window.addReputation(5, '挖矿获得钻石');
            }
            // ===== 挑战塔：挖到钻石 =====
            if (typeof onTowerMined === 'function') {
                onTowerMined('diamond');
            }
        }
        window.totalIronOre = miningState.totalIron;
        window.totalDiamond = miningState.totalDiamond;
    }

    revealNeighbors(rowIndex, colIndex);
    saveMiningData();
}

function advanceRow() {
    var oldRows = miningState.rows.slice();
    miningState.rows.shift();
    var newRow = createRow();
    var aboveRow = oldRows[oldRows.length - 1];
    for (var c = 0; c < MINING_CONFIG.COLS; c++) {
        if (aboveRow.cells[c].state === 'mined_dirt' || aboveRow.cells[c].state === 'mined_item') {
            newRow.cells[c].state = 'revealed';
        }
    }
    miningState.rows.push(newRow);
    miningState.currentRowIndex = miningState.rows.length - 1;
    saveMiningData();
}

var collectPopupTimer = null;

function showCollectPopup(item) {
    var oldPopup = document.querySelector('.mining-collect-popup');
    if (oldPopup) oldPopup.remove();
    if (collectPopupTimer) { clearTimeout(collectPopupTimer); collectPopupTimer = null; }
    var popup = document.createElement('div');
    popup.className = 'mining-collect-popup';
    popup.innerHTML = '<div class="popup-icon">' + item.icon + '</div><div class="popup-name">' + item.name + '</div><div class="popup-hint">点击格子收入背篓</div>';
    document.body.appendChild(popup);
    collectPopupTimer = setTimeout(function() { if (popup.parentNode) popup.remove(); collectPopupTimer = null; }, 2000);
}

function showMiningStatus(msg, isError) {
    var statusEl = document.getElementById('miningStatus');
    if (statusEl) {
        statusEl.textContent = msg;
        statusEl.style.color = isError ? '#ff6b6b' : '#ffd700';
        statusEl.style.fontSize = '0.85rem';
        statusEl.style.fontWeight = 'bold';
        statusEl.style.background = 'transparent';
        clearTimeout(statusEl._timer);
        statusEl._timer = setTimeout(function() {
            statusEl.textContent = '⛏️ 点击浅棕色格子挖掘';
            statusEl.style.color = 'rgba(255,255,255,0.2)';
            statusEl.style.fontSize = '0.6rem';
            statusEl.style.fontWeight = 'normal';
        }, 3000);
    }
}

function initMining() {
    console.log('⛏️ 进入挖矿模式...');
    var hasSavedData = loadMiningData();
    if (!hasSavedData || miningState.rows.length === 0) {
        console.log('🆕 没有保存的矿洞数据，初始化新矿洞');
        initMiningGrid();
        miningState.tools = { pickaxe: 0, firecracker: 0, dynamite: 0 };
        miningState.lastClaimDate = null;
        saveMiningData();
    } else {
        console.log('📂 已加载保存的矿洞数据，深度: ' + miningState.depth);
        if (miningState.rows.length === 0) { initMiningGrid(); saveMiningData(); }
    }
    var today = getTodayDateStr();
    if (miningState.lastClaimDate !== today) {
        miningState.tools.pickaxe += MINING_CONFIG.FREE_PICKAXE_DAILY;
        miningState.lastClaimDate = today;
        saveMiningData();
        showMiningStatus('⛏️ 每日免费镐头已自动领取！(+10) 当前 ' + miningState.tools.pickaxe + ' 个', false);
    } else {
        if (miningState.tools.pickaxe <= 0) {
            showMiningStatus('⛏️ 今日已领取过免费镐头，但已用完。可去可颂大陆商店购买，或明天再来领取', true);
        } else {
            showMiningStatus('⛏️ 当前镐头 ' + miningState.tools.pickaxe + ' 个，点击浅棕色格子挖掘', false);
        }
    }
    var miningMode = document.getElementById('miningMode');
    if (miningMode) { miningMode.style.display = 'block'; } else { console.error('❌ miningMode 不存在'); return; }
    var infoMode = document.getElementById('infoMode');
    if (infoMode) infoMode.style.display = 'none';
    miningState.isActive = true;
    renderMiningUI();
    console.log('⛏️ 挖矿模式已启动，当前镐头: ' + miningState.tools.pickaxe + '，深度: ' + miningState.depth);
}

function exitMining() {
    if (miningState.basket.length > 0) transferBasketToBackpack();
    saveMiningData();
    miningState.isActive = false;
    var container = document.getElementById('miningContainer');
    if (container) container.innerHTML = '';
    var miningMode = document.getElementById('miningMode');
    if (miningMode) miningMode.style.display = 'none';
    var infoMode = document.getElementById('infoMode');
    if (infoMode) infoMode.style.display = 'flex';
    if (typeof window.updateInfoPanel === 'function') window.updateInfoPanel();
    if (typeof window.renderBackpack === 'function') {
        var modal = document.getElementById('backpackModal');
        if (modal && !modal.classList.contains('hidden')) window.renderBackpack();
    }
    var basketModal = document.getElementById('basketModal');
    if (basketModal) basketModal.remove();
    console.log('⛏️ 挖矿模式已退出，深度: ' + miningState.depth);
}

function mineCell(rowIndex, colIndex) {
    if (miningState.isMining) return false;
    var toolType = miningState.selectedTool;
    var toolNames = { pickaxe: '镐头', firecracker: '鞭炮', dynamite: '炸药' };
    var toolEmojis = { pickaxe: '⛏️', firecracker: '🧨', dynamite: '💣' };
    var toolCount = miningState.tools[toolType] || 0;
    if (toolCount <= 0) {
        var msg = toolEmojis[toolType] + ' ' + toolNames[toolType] + '不足！当前 0 个';
        if (toolType === 'pickaxe') msg += '，每天进入沙锅洲自动领取 10 个免费镐头';
        else msg += '，可前往可颂大陆商店购买';
        showMiningStatus(msg, true);
        return false;
    }
    if (toolType === 'pickaxe') {
        if (!isCellMineable(rowIndex, colIndex)) {
            showMiningStatus('⛏️ 只能挖掘浅棕色格子（已揭示的矿层）', true);
            return false;
        }
    }
    if (toolType === 'firecracker' || toolType === 'dynamite') {
        if (!isToolValidForCell(rowIndex, colIndex)) {
            var toolNames2 = { firecracker: '鞭炮', dynamite: '炸药' };
            showMiningStatus('⛏️ ' + toolNames2[toolType] + ' 只能放在已挖空的格子上', true);
            return false;
        }
    }
    if (!spendTool(toolType, 1)) {
        showMiningStatus('❌ 工具扣除失败，请重试', true);
        return false;
    }
    miningState.isMining = true;
    var cellsToMine = [];
    if (typeof soundMine === 'function') soundMine();
    if (toolType === 'pickaxe') {
        cellsToMine.push([rowIndex, colIndex]);
    } else if (toolType === 'firecracker') {
        var row = miningState.rows[rowIndex];
        if (row) {
            var minedCount = 0;
            for (var c = 0; c < MINING_CONFIG.COLS; c++) {
                if (row.cells[c].state !== 'mined_dirt' && row.cells[c].state !== 'mined_item') {
                    cellsToMine.push([rowIndex, c]);
                    minedCount++;
                }
            }
            if (minedCount === 0) {
                showMiningStatus('🧨 这一行没有可挖掘的格子了', true);
                miningState.tools[toolType] += 1;
                saveMiningData();
                miningState.isMining = false;
                return false;
            }
        }
    } else if (toolType === 'dynamite') {
        var totalMined = 0;
        for (var dr = -1; dr <= 1; dr++) {
            for (var dc = -1; dc <= 1; dc++) {
                var r = rowIndex + dr;
                var c = colIndex + dc;
                if (r < 0 || r >= miningState.rows.length) continue;
                if (c < 0 || c >= MINING_CONFIG.COLS) continue;
                var cell = miningState.rows[r].cells[c];
                if (cell.state !== 'mined_dirt' && cell.state !== 'mined_item') {
                    cellsToMine.push([r, c]);
                    totalMined++;
                }
            }
        }
        if (totalMined === 0) {
            showMiningStatus('💣 周围没有可挖掘的格子了', true);
            miningState.tools[toolType] += 1;
            saveMiningData();
            miningState.isMining = false;
            return false;
        }
    }
    if (cellsToMine.length === 0) {
        showMiningStatus('⛏️ 没有可挖掘的格子', true);
        miningState.tools[toolType] += 1;
        saveMiningData();
        miningState.isMining = false;
        return false;
    }
    var lastRowMined = false;
    var lastRowIndex = miningState.rows.length - 1;
    var foundIron = false;
    var foundDiamond = false;
    for (var i = 0; i < cellsToMine.length; i++) {
        var r = cellsToMine[i][0];
        var c = cellsToMine[i][1];
        var cellBefore = miningState.rows[r].cells[c];
        var wasEmpty = (cellBefore.state === 'hidden' || cellBefore.state === 'revealed');
        mineSingleCell(r, c);
        var cellAfter = miningState.rows[r].cells[c];
        if (cellAfter.state === 'mined_item' && cellAfter.content) {
            if (cellAfter.content.type === 'iron') foundIron = true;
            if (cellAfter.content.type === 'diamond') foundDiamond = true;
        }
        if (r === lastRowIndex && wasEmpty) lastRowMined = true;
    }
    var resultMsg = '';
    if (foundDiamond) resultMsg += '💎 挖到钻石！';
    if (foundIron) resultMsg += (resultMsg ? ' ' : '') + '🪨 挖到铁矿！';
    if (!foundIron && !foundDiamond) {
        var foundDirt = false;
        for (var i = 0; i < cellsToMine.length; i++) {
            var r = cellsToMine[i][0];
            var c = cellsToMine[i][1];
            if (miningState.rows[r].cells[c].state === 'mined_dirt') { foundDirt = true; break; }
        }
        if (foundDirt) resultMsg = '🟫 挖到了土块...继续努力！';
        else resultMsg = '⛏️ 挖掘完成！';
    }
    if (resultMsg) showMiningStatus(resultMsg, false);
    if (lastRowMined) {
        showMiningStatus('⬇️ 已深入下一层！深度 +1', false);
        advanceRow();
    }
    miningState.isMining = false;
    renderMiningGrid();
    updateMiningUI();
    return true;
}

function collectItem(rowIndex, colIndex) {
    var row = miningState.rows[rowIndex];
    if (!row) return;
    var cell = row.cells[colIndex];
    if (!cell) return;
    if (cell.state !== 'mined_item') return;
    if (!cell.content) return;
    var item = cell.content;
    addToBasket(item);
    cell.state = 'mined_dirt';
    cell.content = null;
    renderMiningGrid();
    updateMiningUI();
    saveMiningData();
    showMiningStatus('📥 ' + item.icon + ' ' + item.name + ' 已收入背篓！', false);
}

function renderMiningGridHTML() {
    var html = '';
    var totalRows = miningState.rows.length;
    var lastRowIndex = totalRows - 1;
    for (var r = 0; r < totalRows; r++) {
        var row = miningState.rows[r];
        html += '<div class="mining-row ' + (r === lastRowIndex ? 'current-row' : '') + '" data-row="' + r + '">';
        for (var c = 0; c < MINING_CONFIG.COLS; c++) {
            var cell = row.cells[c];
            var state = cell.state || 'hidden';
            var contentHtml = '';
            
            if (state === 'revealed' && cell.content && cell.content.type !== 'dirt') {
                contentHtml = '<span class="item-icon revealed-item" style="opacity:0.35;font-size:1.2rem;filter:brightness(1.6) saturate(0.5);transition:all 0.3s;">' + cell.content.icon + '</span>';
            } else if (state === 'mined_item' && cell.content) {
                contentHtml = '<span class="item-icon">' + cell.content.icon + '</span>';
            }
            
            html += '<div class="mining-cell ' + state + '" data-row="' + r + '" data-col="' + c + '">' + contentHtml + '</div>';
        }
        html += '</div>';
    }
    return html;
}

function renderMiningGrid() {
    var grid = document.getElementById('miningGrid');
    if (!grid) return;
    grid.innerHTML = renderMiningGridHTML();
    updateMiningUI();
}

function renderMiningUI() {
    var container = document.getElementById('miningContainer');
    if (!container) return;
    if (miningState.rows.length === 0) initMiningGrid();
    container.style.display = 'block';
    var ironCount = getIronOreCount();
    var diamondCount = getDiamondCount();
    var basketCount = getBasketCount();
    var depth = miningState.depth;
    container.innerHTML = `
        <div class="mining-wrapper">
            <div class="mining-stats-bar">
                <div class="mining-stat"><span class="mining-stat-icon">⛏️</span><span class="mining-stat-label">深度</span><span class="mining-stat-value" id="miningDepth">${depth}</span></div>
                <div class="mining-stat"><span class="mining-stat-icon">🪨</span><span class="mining-stat-label">铁矿</span><span class="mining-stat-value" id="miningIronCount">${ironCount}</span></div>
                <div class="mining-stat"><span class="mining-stat-icon">💎</span><span class="mining-stat-label">钻石</span><span class="mining-stat-value" id="miningDiamondCount">${diamondCount}</span></div>
                <button class="mining-btn-close" id="miningCloseBtn">✕ 退出</button>
            </div>
            <div class="mining-game-area">
                <div class="mining-left-side">
                    <div class="mining-tools-side" id="miningToolsSide">
                        <button class="mining-tool-side-btn ${miningState.selectedTool === 'pickaxe' ? 'active' : ''}" data-tool="pickaxe">
                            <span class="tool-icon">⛏️</span><span class="tool-name">镐头</span><span class="tool-count" id="toolCountPickaxe">${miningState.tools.pickaxe}</span>
                        </button>
                        <button class="mining-tool-side-btn ${miningState.selectedTool === 'firecracker' ? 'active' : ''}" data-tool="firecracker">
                            <span class="tool-icon">🧨</span><span class="tool-name">鞭炮</span><span class="tool-count" id="toolCountFirecracker">${miningState.tools.firecracker}</span>
                        </button>
                        <button class="mining-tool-side-btn ${miningState.selectedTool === 'dynamite' ? 'active' : ''}" data-tool="dynamite">
                            <span class="tool-icon">💣</span><span class="tool-name">炸药</span><span class="tool-count" id="toolCountDynamite">${miningState.tools.dynamite}</span>
                        </button>
                    </div>
                    <div class="mining-basket-btn-container">
                        <button class="mining-basket-btn" id="miningBasketBtn">🧺 背篓<br><span class="basket-count">${basketCount}</span></button>
                    </div>
                </div>
                <div class="mining-grid-wrapper">
                    <div class="mining-grid" id="miningGrid">${renderMiningGridHTML()}</div>
                </div>
            </div>
            <div class="mining-status" id="miningStatus">⛏️ 点击浅棕色格子挖掘</div>
        </div>
    `;
    document.querySelectorAll('.mining-tool-side-btn').forEach(function(btn) {
        btn.onclick = function() { miningState.selectedTool = this.dataset.tool; renderMiningUI(); };
    });
    document.getElementById('miningBasketBtn').onclick = function() { showBasketModal(); };
    document.getElementById('miningCloseBtn').onclick = function() { exitMining(); };
    var grid = document.getElementById('miningGrid');
    if (grid) {
        grid.onclick = function(e) {
            var cell = e.target.closest('.mining-cell');
            if (!cell) return;
            var row = parseInt(cell.dataset.row);
            var col = parseInt(cell.dataset.col);
            if (isNaN(row) || isNaN(col)) return;
            var state = miningState.rows[row].cells[col].state;
            if (state === 'mined_item') { collectItem(row, col); return; }
            mineCell(row, col);
        };
    }
    updateMiningUI();
}

function updateMiningUI() {
    var toolCounts = {
        pickaxe: document.getElementById('toolCountPickaxe'),
        firecracker: document.getElementById('toolCountFirecracker'),
        dynamite: document.getElementById('toolCountDynamite')
    };
    if (toolCounts.pickaxe) toolCounts.pickaxe.textContent = miningState.tools.pickaxe;
    if (toolCounts.firecracker) toolCounts.firecracker.textContent = miningState.tools.firecracker;
    if (toolCounts.dynamite) toolCounts.dynamite.textContent = miningState.tools.dynamite;
    var ironEl = document.getElementById('miningIronCount');
    if (ironEl) ironEl.textContent = getIronOreCount();
    var diamondEl = document.getElementById('miningDiamondCount');
    if (diamondEl) diamondEl.textContent = getDiamondCount();
    var depthEl = document.getElementById('miningDepth');
    if (depthEl) depthEl.textContent = miningState.depth;
    var basketBtn = document.getElementById('miningBasketBtn');
    if (basketBtn) {
        var countSpan = basketBtn.querySelector('.basket-count');
        if (countSpan) countSpan.textContent = getBasketCount();
    }
}

function resetMiningData() {
    if (confirm('确定要重置矿洞数据吗？这将清除所有进度！')) {
        clearMiningData();
        if (miningState.isActive) {
            initMiningGrid();
            miningState.tools = { pickaxe: 0, firecracker: 0, dynamite: 0 };
            miningState.lastClaimDate = null;
            saveMiningData();
            renderMiningUI();
        }
        showMiningStatus('🔄 矿洞数据已重置', false);
    }
}

window.mining = {
    init: initMining, exit: exitMining, isActive: function() { return miningState.isActive; },
    getState: function() { return miningState; }, getIronOre: getIronOreCount, getDiamond: getDiamondCount,
    claimFree: claimFreePickaxe, addTool: addTool, getTools: function() { return miningState.tools; },
    showBasket: showBasketModal, reset: resetMiningData
};

window.initMining = initMining;
window.exitMining = exitMining;
window.claimFreePickaxe = claimFreePickaxe;
window.getIronOreCount = getIronOreCount;
window.getDiamondCount = getDiamondCount;
window.addTool = addTool;
window.showBasketModal = showBasketModal;
window.resetMiningData = resetMiningData;

window.totalIronOre = miningState.totalIron;
window.totalDiamond = miningState.totalDiamond;

console.log('⛏️ 挖矿系统加载完成（含挑战塔钩子）');