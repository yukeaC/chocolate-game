// js/production.js

let currentSlotIndex = null;
let globalProductionTimer = null;
let isStartingProduction = false;

// ============================================
// 加速券覆盖层 - 独立 DOM 管理
// ============================================
var speedUpOverlayData = {};

function removeSpeedUpOverlay(slotIndex) {
    var data = speedUpOverlayData[slotIndex];
    if (data) {
        if (data.timer) {
            clearTimeout(data.timer);
            data.timer = null;
        }
        if (data.element && data.element.parentNode) {
            data.element.parentNode.removeChild(data.element);
        }
        delete speedUpOverlayData[slotIndex];
    }
}

function showSpeedUpOverlay(slotIndex) {
    var slot = slots[slotIndex];
    if (!slot || slot.status !== 'producing') {
        showMessage('该工坊不在生产中', true);
        return;
    }

    if (typeof window.playerBag === 'undefined' || window.playerBag.speed_up <= 0) {
        showMessage('没有加速券，去商城购买', true);
        return;
    }

    removeSpeedUpOverlay(slotIndex);

    var card = document.querySelector('.slot-card[data-slot="' + slotIndex + '"]');
    if (!card) {
        renderSlots();
        card = document.querySelector('.slot-card[data-slot="' + slotIndex + '"]');
        if (!card) return;
    }

    card.style.position = 'relative';

    var overlay = document.createElement('div');
    overlay.className = 'speed-up-overlay';
    overlay.dataset.slot = slotIndex;
    overlay.style.cssText =
        'position:absolute;' +
        'top:0;left:0;width:100%;height:100%;' +
        'display:flex;align-items:center;justify-content:center;' +
        'z-index:20;cursor:pointer;' +
        'pointer-events:auto;' +
        'font-size:2.4rem;font-weight:bold;color:#2e7d32;' +
        'text-shadow:0 0 16px rgba(255,255,255,0.95), 0 0 32px rgba(255,255,255,0.8);' +
        'user-select:none;';

    overlay.innerHTML =
        '<span style="display:block;text-align:center;line-height:1.2;">⏩' +
        '<span style="display:block;font-size:0.7rem;font-weight:bold;color:#1b5e20;text-shadow:0 0 8px rgba(255,255,255,0.9);margin-top:-4px;">(' + window.playerBag.speed_up + ')</span>' +
        '</span>';

    overlay.onclick = function (e) {
        e.stopPropagation();
        var idx = parseInt(this.dataset.slot);
        removeSpeedUpOverlay(idx);
        useSpeedUpOnSlot(idx);
    };

    card.appendChild(overlay);

    speedUpOverlayData[slotIndex] = {
        element: overlay,
        timer: setTimeout(function () {
            removeSpeedUpOverlay(slotIndex);
        }, 3000)
    };
}

// ============================================
// 使用加速券
// ============================================
function useSpeedUpOnSlot(slotIndex) {
    var slot = slots[slotIndex];
    if (!slot || slot.status !== 'producing') {
        showMessage('该工坊不在生产中', true);
        return;
    }

    if (typeof window.playerBag === 'undefined' || window.playerBag.speed_up <= 0) {
        showMessage('没有加速券，去商城购买', true);
        return;
    }

    if (slot.remainingSec <= 0) {
        slot.status = 'completed';
        slot.remainingSec = 0;
        renderSlots();
        if (typeof autoSaveEnabled !== 'undefined' && autoSaveEnabled && typeof saveGame === 'function') saveGame();
        showMessage('✅ 工坊已完成！', false);
        return;
    }

    window.playerBag.speed_up -= 1;
    if (typeof window.savePlayerBag === 'function') window.savePlayerBag();
    if (typeof window.updateBagCount === 'function') window.updateBagCount();

    if (typeof soundItemGet === 'function') soundItemGet();

    var reduce = Math.min(slot.remainingSec, 929);
    slot.remainingSec = slot.remainingSec - reduce;

    if (slot.productionStartTime && slot.totalProductionTime) {
        var elapsed = slot.totalProductionTime - slot.remainingSec;
        slot.productionStartTime = Date.now() - elapsed * 1000;
    }

    if (slot.remainingSec <= 0) {
        slot.status = 'completed';
        slot.remainingSec = 0;
        showMessage('⏩ 加速完成！工坊已完成！', false);
    } else {
        showMessage('⏩ 加速 ' + reduce + ' 秒，剩余 ' + slot.remainingSec + ' 秒', false);
    }

    renderSlots();
    if (typeof autoSaveEnabled !== 'undefined' && autoSaveEnabled && typeof saveGame === 'function') saveGame();
}

// ============================================
// 渲染工坊槽位（支持隐藏商品图片）
// ============================================
function renderSlots() {
    var slotsGrid = document.getElementById('slotsGrid');
    if (!slotsGrid) return;
    slotsGrid.innerHTML = '';

    for (var i = 0; i < TOTAL_SLOTS; i++) {
        var slot = slots[i];
        var card = document.createElement('div');
        card.className = 'slot-card';
        card.dataset.slot = i;

        if (!slot.unlocked) {
            card.classList.add('locked');
            var unlockCost = getSlotUnlockCost(i);
            card.innerHTML =
                '<div class="slot-icon">🔒</div>' +
                '<div class="slot-name">工坊 ' + (i + 1) + '</div>' +
                '<div class="slot-unlock-cost">🔓 ' + unlockCost + '</div>';
            card.onclick = (function (idx) {
                return function () { unlockSlot(idx); };
            })(i);
        } else {
            if (slot.status === 'producing') {
                // ---- 显示产品图标（支持隐藏商品图片） ----
                var productIcon = '';
                var prod = PRODUCTS[slot.productId];
                if (prod) {
                    // 普通产品：取名字第一个字符作为图标
                    productIcon = prod.name.split(' ')[0];
                } else {
                    // 检查是否为隐藏商品
                    var recipe = HIDDEN_RECIPES.find(function (r) { return r.id === slot.productId; });
                    if (recipe) {
                        productIcon = '<img src="' + recipe.img + '" style="width:32px;height:32px;object-fit:contain;border-radius:4px;" onerror="this.style.display=\'none\'; this.parentElement.innerText=\'' + recipe.name.charAt(0) + '\';">';
                    } else {
                        productIcon = '⏳';
                    }
                }

                var remainingSec = slot.remainingSec || 0;
                var hours = Math.floor(remainingSec / 3600);
                var minutes = Math.floor((remainingSec % 3600) / 60);
                var seconds = remainingSec % 60;
                var timeStr = '';
                if (hours > 0) timeStr = hours + '时' + minutes + '分';
                else if (minutes > 0) timeStr = minutes + '分' + seconds + '秒';
                else timeStr = seconds + '秒';

                card.innerHTML =
                    '<div class="slot-icon">' + productIcon + '</div>' +
                    '<div class="slot-name">工坊 ' + (i + 1) + '</div>' +
                    '<div class="slot-status">⏳ ' + timeStr + '</div>';
                card.style.position = 'relative';
                card.style.cursor = 'pointer';

                card.onclick = (function (idx) {
                    return function (e) {
                        if (e.target.closest('.speed-up-overlay')) return;
                        showSpeedUpOverlay(idx);
                    };
                })(i);

                // 如果存在覆盖层数据，重新挂载
                if (speedUpOverlayData[i]) {
                    var oldData = speedUpOverlayData[i];
                    if (oldData.element && oldData.element.parentNode) {
                        oldData.element.parentNode.removeChild(oldData.element);
                    }
                    var overlay = document.createElement('div');
                    overlay.className = 'speed-up-overlay';
                    overlay.dataset.slot = i;
                    overlay.style.cssText =
                        'position:absolute;' +
                        'top:0;left:0;width:100%;height:100%;' +
                        'display:flex;align-items:center;justify-content:center;' +
                        'z-index:20;cursor:pointer;' +
                        'pointer-events:auto;' +
                        'font-size:2.4rem;font-weight:bold;color:#2e7d32;' +
                        'text-shadow:0 0 16px rgba(255,255,255,0.95), 0 0 32px rgba(255,255,255,0.8);' +
                        'user-select:none;';
                    overlay.innerHTML =
                        '<span style="display:block;text-align:center;line-height:1.2;">⏩' +
                        '<span style="display:block;font-size:0.7rem;font-weight:bold;color:#1b5e20;text-shadow:0 0 8px rgba(255,255,255,0.9);margin-top:-4px;">(' + (window.playerBag.speed_up || 0) + ')</span>' +
                        '</span>';
                    overlay.onclick = function (e) {
                        e.stopPropagation();
                        var idx = parseInt(this.dataset.slot);
                        removeSpeedUpOverlay(idx);
                        useSpeedUpOnSlot(idx);
                    };
                    card.appendChild(overlay);
                    speedUpOverlayData[i].element = overlay;
                    if (!speedUpOverlayData[i].timer) {
                        speedUpOverlayData[i].timer = setTimeout(function () {
                            removeSpeedUpOverlay(i);
                        }, 3000);
                    }
                }

            } else if (slot.status === 'completed') {
                card.classList.add('completed');
                // ---- 同样，完成时也要显示隐藏商品图片 ----
                var prodCompleted = PRODUCTS[slot.productId];
                var productIconCompleted = '';
                if (prodCompleted) {
                    productIconCompleted = prodCompleted.name.split(' ')[0];
                } else {
                    var recipeCompleted = HIDDEN_RECIPES.find(function (r) { return r.id === slot.productId; });
                    if (recipeCompleted) {
                        productIconCompleted = '<img src="' + recipeCompleted.img + '" style="width:32px;height:32px;object-fit:contain;border-radius:4px;" onerror="this.style.display=\'none\'; this.parentElement.innerText=\'' + recipeCompleted.name.charAt(0) + '\';">';
                    } else {
                        productIconCompleted = '✅';
                    }
                }
                card.innerHTML =
                    '<div class="slot-icon">' + productIconCompleted + '</div>' +
                    '<div class="slot-name">工坊 ' + (i + 1) + '</div>' +
                    '<div class="slot-status">✅ 待收取</div>';
                card.onclick = (function (idx) {
                    return function () {
                        collectProduct(idx);
                    };
                })(i);
                removeSpeedUpOverlay(i);

            } else {
                card.innerHTML =
                    '<div class="slot-icon">🏭</div>' +
                    '<div class="slot-name">工坊 ' + (i + 1) + '</div>' +
                    '<div class="slot-status">空闲</div>';
                card.onclick = (function (idx) {
                    return function () {
                        openProductSelect(idx);
                    };
                })(i);
                removeSpeedUpOverlay(i);
            }
        }
        slotsGrid.appendChild(card);
    }
}

// ============================================
// 收集产品（增加防御性检查）
// ============================================
function collectProduct(slotIndex) {
    if (slotIndex === undefined || slotIndex === null || typeof slotIndex !== 'number' || slotIndex < 0 || slotIndex >= slots.length) {
        console.warn('collectProduct: 无效的 slotIndex', slotIndex);
        showMessage('工坊索引无效', true);
        return;
    }
    var slot = slots[slotIndex];
    if (!slot) {
        console.warn('collectProduct: slot 未定义', slotIndex);
        showMessage('工坊不存在', true);
        return;
    }
    if (slot.status !== 'completed') {
        showMessage('该工坊还未完成', true);
        return;
    }
    var productId = slot.productId;
    if (!productId) {
        showMessage('产品ID无效', true);
        return;
    }
    var expGain = 0;
    var boost = getActualExpBoost();
    if (PRODUCTS[productId]) {
        inventory[productId] = (inventory[productId] || 0) + 1;
        totalProduced++;
        expGain = getMakeExp(PRODUCTS[productId]);
        expGain = Math.floor(expGain * boost);
        showMessage('✅ 收取 1 个' + PRODUCTS[productId].name + '，已存入仓库（经验 +' + expGain + '）', false);
    } else if (HIDDEN_RECIPES.find(function (r) { return r.id === productId; })) {
        hiddenInventory[productId] = (hiddenInventory[productId] || 0) + 1;
        totalProduced++;
        var recipe = HIDDEN_RECIPES.find(function (r) { return r.id === productId; });
        expGain = getMakeExp(recipe);
        expGain = Math.floor(expGain * boost);
        showMessage('✨ 收取 1 个隐藏美食，已存入仓库（经验 +' + expGain + '）✨', false);
    } else {
        console.warn('未知产品', productId);
        showMessage('未知产品，请联系管理员', true);
        return;
    }
    if (expGain > 0 && typeof addExp === 'function') addExp(expGain);
    slot.status = 'idle';
    slot.productId = null;
    slot.remainingSec = 0;
    if (typeof soundCollect === 'function') soundCollect();
    slot.totalProductionTime = null;
    slot.productionStartTime = null;
    removeSpeedUpOverlay(slotIndex);
    if (slotIntervals[slotIndex]) {
        clearInterval(slotIntervals[slotIndex]);
        slotIntervals[slotIndex] = null;
    }
    renderSlots();
    refreshUI();
    if (autoSaveEnabled) saveGame();
    // ===== 挑战塔：制作成功（完美挑战） =====
    if (typeof onTowerPerfectProduce === 'function') onTowerPerfectProduce();
    // ===== 挑战塔结束 =====
}

// ============================================
// 解锁工坊
// ============================================
function unlockSlot(index) {
    if (slots[index].unlocked) return;
    var cost = getSlotUnlockCost(index);
    if (gold >= cost) {
        gold -= cost;
        slots[index].unlocked = true;
        slots[index].status = 'idle';
        if (typeof soundUnlock === 'function') soundUnlock();
        removeSpeedUpOverlay(index);
        showMessage('🔓 解锁工坊 ' + (index + 1) + '！', false);
        refreshUI();
        if (autoSaveEnabled) saveGame();
    } else {
        showMessage('金币不足 ' + cost + '，无法解锁', true);
    }
}

// ============================================
// 选择产品（修改隐藏产品遍历方式）
// ============================================

function openProductSelect(slotIndex) {
    if (!slots[slotIndex].unlocked || slots[slotIndex].status !== 'idle') return;
    currentSlotIndex = slotIndex;
    var productOptionsDiv = document.getElementById('productOptions');
    if (!productOptionsDiv) return;
    productOptionsDiv.innerHTML = '';
    
    var allProducts = [];
    
    // ---- 普通产品（固定顺序） ----
    var normalOrder = [
        { id: 'charlieChocolate', name: '查理的巧克力' },
        { id: 'hawthornStack', name: '好事楂堆' },
        { id: 'cheeseCocoa', name: '芝士可可' },
        { id: 'luckyPeanut', name: '好事花生' },
        { id: 'cherryInfinity', name: '樱有尽有' },
        { id: 'sunEggToast', name: '小太阳蛋元气吐司' },
        { id: 'milkSkinDelight', name: '万事米丽奶皮子' },
        { id: 'tiramisuCroissant', name: '提拉米苏可颂' }
    ];
    for (var ni = 0; ni < normalOrder.length; ni++) {
        var item = normalOrder[ni];
        var prod = PRODUCTS[item.id];
        if (prod) allProducts.push({ type: 'normal', data: prod, id: item.id });
    }
    
    // ---- 隐藏产品（自动遍历 HIDDEN_RECIPES） ----
    if (level >= 5) {
        for (var hi = 0; hi < HIDDEN_RECIPES.length; hi++) {
            var recipe = HIDDEN_RECIPES[hi];
            allProducts.push({ type: 'hidden', data: recipe, id: recipe.id });
        }
    }
    
    // ---- 渲染选择网格 ----
    var gridContainer = document.createElement('div');
    gridContainer.className = 'product-options-unified-grid';
    
    for (var ai = 0; ai < allProducts.length; ai++) {
        var item = allProducts[ai];
        var canMake = false;
        if (item.type === 'normal') {
            var prod = item.data;
            canMake = cocoaBeans >= getActualBeanCost(prod.beanCost);
        } else {
            var recipe = item.data;
            var energyOk = true;
            for (var ec = 0; ec < recipe.energyCost.length; ec++) {
                if ((energies[recipe.energyCost[ec].id] || 0) < recipe.energyCost[ec].amount) { energyOk = false; break; }
            }
            canMake = energyOk && cocoaBeans >= recipe.beanCost && gold >= recipe.goldCost;
        }
        
        var option = document.createElement('div');
        option.className = 'product-option ' + (canMake ? 'available' : '');
        option.style.cursor = 'pointer';
        
        if (item.type === 'normal') {
            var prod = item.data;
            var actualCost = getActualBeanCost(prod.beanCost);
            var actualPrice = getActualPrice(prod.basePrice);
            var actualTime = getActualTime(prod.timeSec);
            var expGain = getMakeExp(prod);
            option.innerHTML =
                '<div class="product-name">' + prod.name + '</div>' +
                '<div class="product-desc">🫘 ' + actualCost + ' 豆 | ⏱️ ' + actualTime + 's | 🪙 ' + actualPrice + ' | ✨经验 ' + expGain + '</div>';
            option.onclick = (function (sIdx, pId, makeable) {
                return function () {
                    if (makeable) {
                        startProduction(sIdx, pId);
                    } else {
                        var prodCost = PRODUCTS[pId].beanCost;
                        showMessage('豆子不足！需要 ' + getActualBeanCost(prodCost) + ' 颗', true);
                    }
                };
            })(slotIndex, item.id, canMake);
        } else {
            var recipe = item.data;
            var actualTime = getActualTime(recipe.timeSec);
            var actualPrice = getActualPrice(recipe.basePrice);
            var expGain = getMakeExp(recipe);
            var energyText = '';
            for (var ec = 0; ec < recipe.energyCost.length; ec++) {
                var en = ENERGY_TYPES.find(function (e) { return e.id === recipe.energyCost[ec].id; });
                energyText += en.name + ' x' + recipe.energyCost[ec].amount + ' ';
            }
            option.innerHTML =
                '<div class="product-name">' + recipe.name + '</div>' +
                '<div class="product-desc">✨ 消耗: ' + energyText + '<br>🫘 ' + recipe.beanCost + ' 豆 | 🪙 ' + recipe.goldCost + ' 金币 | ⏱️ ' + actualTime + 's<br>🪙 售价 ' + actualPrice + ' | ✨经验 ' + expGain + '</div>';
            option.onclick = (function (sIdx, r, makeable) {
                return function () {
                    if (makeable) {
                        startHiddenProduction(sIdx, r);
                    } else {
                        var reason = '';
                        for (var ec = 0; ec < r.energyCost.length; ec++) {
                            if ((energies[r.energyCost[ec].id] || 0) < r.energyCost[ec].amount) {
                                var en = ENERGY_TYPES.find(function (e) { return e.id === r.energyCost[ec].id; });
                                reason = '缺少 ' + en.name + ' x' + r.energyCost[ec].amount;
                                break;
                            }
                        }
                        if (!reason && cocoaBeans < r.beanCost) reason = '可可豆不足！需要 ' + r.beanCost + ' 颗';
                        if (!reason && gold < r.goldCost) reason = '金币不足！需要 ' + r.goldCost + ' 金币';
                        showMessage(reason, true);
                    }
                };
            })(slotIndex, recipe, canMake);
        }
        gridContainer.appendChild(option);
    }
    
    productOptionsDiv.appendChild(gridContainer);
    var productModal = document.getElementById('productModal');
    if (productModal) productModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
}


// ============================================
// 开始生产（普通）
// ============================================
function startProduction(slotIndex, productId) {
    if (isStartingProduction) {
        showMessage('正在处理中，请稍候...', true);
        return;
    }
    var prod = PRODUCTS[productId];
    var actualCost = getActualBeanCost(prod.beanCost);
    if (cocoaBeans < actualCost) {
        showMessage('豆子不足！需要 ' + actualCost + ' 颗', true);
        return;
    }
    var slot = slots[slotIndex];
    if (slot.status !== 'idle') {
        showMessage('该工坊当前不可用', true);
        return;
    }
    isStartingProduction = true;
    try {
        cocoaBeans -= actualCost;
        totalBeansHarvested += actualCost;
	if (typeof soundWorkshopStart === 'function') soundWorkshopStart();
        slot.productId = productId;
        var actualTime = getActualTime(prod.timeSec);
        var startTime = Date.now();
        slot.totalProductionTime = actualTime;
        slot.productionStartTime = startTime;
        slot.remainingSec = actualTime;
        slot.status = 'producing';
        var makeExp = getMakeExp(prod);
        renderSlots();
        refreshUI();
        var productModal = document.getElementById('productModal');
        if (productModal) productModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        showMessage('开始制作 ' + prod.name + '，需要 ' + actualTime + ' 秒（经验 +' + makeExp + '）', false);
        if (autoSaveEnabled) saveGame();
        startGlobalProductionTimer();
    } catch (err) {
        console.error('开始生产失败:', err);
        showMessage('生产失败，请重试', true);
    } finally {
        isStartingProduction = false;
    }
}

function startHiddenProduction(slotIndex, recipe) {
    for (var ec = 0; ec < recipe.energyCost.length; ec++) {
        if ((energies[recipe.energyCost[ec].id] || 0) < recipe.energyCost[ec].amount) {
            var en = ENERGY_TYPES.find(function (e) { return e.id === recipe.energyCost[ec].id; });
            showMessage('缺少 ' + en.name + ' x' + recipe.energyCost[ec].amount, true);
            return;
        }
    }
    if (cocoaBeans < recipe.beanCost) {
        showMessage('可可豆不足！需要 ' + recipe.beanCost + ' 颗', true);
        return;
    }
    if (gold < recipe.goldCost) {
        showMessage('金币不足！需要 ' + recipe.goldCost + ' 金币', true);
        return;
    }
    for (var ec = 0; ec < recipe.energyCost.length; ec++) {
        energies[recipe.energyCost[ec].id] -= recipe.energyCost[ec].amount;
    }
    cocoaBeans -= recipe.beanCost;
    gold -= recipe.goldCost;
    var slot = slots[slotIndex];
    slot.productId = recipe.id;
    var actualTime = getActualTime(recipe.timeSec);
    var startTime = Date.now();
    slot.totalProductionTime = actualTime;
    slot.productionStartTime = startTime;
    slot.remainingSec = actualTime;
    slot.status = 'producing';
    var makeExp = getMakeExp(recipe);
    renderSlots();
    refreshUI();
    var productModal = document.getElementById('productModal');
    if (productModal) productModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    showMessage('开始制作 ' + recipe.name + '，需要 ' + actualTime + ' 秒（经验 +' + makeExp + '）', false);
    if (autoSaveEnabled) saveGame();
    startGlobalProductionTimer();
}

// ============================================
// 全局计时器
// ============================================
function startGlobalProductionTimer() {
    if (globalProductionTimer) {
        clearInterval(globalProductionTimer);
        globalProductionTimer = null;
    }
    globalProductionTimer = setInterval(function () {
        var needUpdate = false;
        var needSave = false;
        var now = Date.now();
        for (var i = 0; i < TOTAL_SLOTS; i++) {
            var slot = slots[i];
            if (!slot || slot.status !== 'producing') continue;
            if (slot.productionStartTime && slot.totalProductionTime) {
                var elapsed = Math.floor((now - slot.productionStartTime) / 1000);
                var remaining = Math.max(0, slot.totalProductionTime - elapsed);
                if (slot.remainingSec !== remaining) {
                    slot.remainingSec = remaining;
                    needUpdate = true;
                }
                if (remaining <= 0 && slot.status === 'producing') {
                    slot.status = 'completed';
                    slot.remainingSec = 0;
                    removeSpeedUpOverlay(i);
		    if (!slot._notified) {
            slot._notified = true;
            if (typeof soundWorkshopDone === 'function') soundWorkshopDone();
        }
                    needUpdate = true;
                    needSave = true;
                    console.log('✅ 槽位 ' + (i + 1) + ' 生产完成');
                }
            }
        }
        if (needUpdate && typeof renderSlots === 'function') {
            renderSlots();
        }
        if (needSave && autoSaveEnabled) {
            saveGame();
        }
    }, 500);
}

function stopGlobalProductionTimer() {
    if (globalProductionTimer) {
        clearInterval(globalProductionTimer);
        globalProductionTimer = null;
    }
}

function restartSlotTimer(slotIndex) {
    var slot = slots[slotIndex];
    if (!slot || slot.status !== 'producing') return;
    if (slot.remainingSec <= 0) {
        slot.status = 'completed';
        slot.remainingSec = 0;
        removeSpeedUpOverlay(slotIndex);
        renderSlots();
        if (autoSaveEnabled) saveGame();
        return;
    }
    startGlobalProductionTimer();
    console.log('🔄 槽位 ' + (slotIndex + 1) + ' 已加入全局计时器，剩余 ' + slot.remainingSec + ' 秒');
}

function recalcAllProducingSlots() {
    var now = Date.now();
    var needSave = false;
    for (var i = 0; i < TOTAL_SLOTS; i++) {
        var slot = slots[i];
        if (slot.status === 'producing' && slot.productionStartTime && slot.totalProductionTime) {
            var elapsed = Math.floor((now - slot.productionStartTime) / 1000);
            var remaining = Math.max(0, slot.totalProductionTime - elapsed);
            slot.remainingSec = remaining;
            if (remaining === 0) {
                slot.status = 'completed';
                removeSpeedUpOverlay(i);
                needSave = true;
                console.log('📦 槽位 ' + (i + 1) + ' 离线期间已完成生产');
            } else {
                console.log('📦 槽位 ' + (i + 1) + ' 剩余 ' + remaining + ' 秒');
            }
        }
    }
    if (needSave && autoSaveEnabled) saveGame();
    startGlobalProductionTimer();
}

// ============================================
// 暴露全局接口
// ============================================
window.renderSlots = renderSlots;
window.restartSlotTimer = restartSlotTimer;
window.recalcAllProducingSlots = recalcAllProducingSlots;
window.stopGlobalProductionTimer = stopGlobalProductionTimer;
window.startGlobalProductionTimer = startGlobalProductionTimer;
window.useSpeedUpOnSlot = useSpeedUpOnSlot;
window.showSpeedUpOverlay = showSpeedUpOverlay;
window.removeSpeedUpOverlay = removeSpeedUpOverlay;
window.speedUpOverlayData = speedUpOverlayData;
window.collectProduct = collectProduct;