// js/ui.js
console.log('📦 ui.js 加载中...');

// ============================================
// 防御性检查：确保全局变量已定义（不用 var 重新声明）
// ============================================
if (typeof workaholicLevel === 'undefined') {
    console.warn('⚠️ workaholicLevel 未定义，初始化为 0');
    workaholicLevel = 0;
}
if (typeof expBoostLevel === 'undefined') {
    console.warn('⚠️ expBoostLevel 未定义，初始化为 0');
    expBoostLevel = 0;
}
if (typeof productionSpeedLevel === 'undefined') {
    console.warn('⚠️ productionSpeedLevel 未定义，初始化为 0');
    productionSpeedLevel = 0;
}
if (typeof miaoBargainLevel === 'undefined') {
    console.warn('⚠️ miaoBargainLevel 未定义，初始化为 0');
    miaoBargainLevel = 0;
}
if (typeof cocoaBeans === 'undefined') {
    console.warn('⚠️ cocoaBeans 未定义，初始化为 0');
    cocoaBeans = 0;
}
if (typeof gold === 'undefined') {
    console.warn('⚠️ gold 未定义，初始化为 0');
    gold = 0;
}
if (typeof level === 'undefined') {
    console.warn('⚠️ level 未定义，初始化为 1');
    level = 1;
}
if (typeof exp === 'undefined') {
    console.warn('⚠️ exp 未定义，初始化为 0');
    exp = 0;
}
if (typeof totalProduced === 'undefined') {
    console.warn('⚠️ totalProduced 未定义，初始化为 0');
    totalProduced = 0;
}
if (typeof totalSold === 'undefined') {
    console.warn('⚠️ totalSold 未定义，初始化为 0');
    totalSold = 0;
}
if (typeof totalEarned === 'undefined') {
    console.warn('⚠️ totalEarned 未定义，初始化为 0');
    totalEarned = 0;
}
if (typeof totalBeansHarvested === 'undefined') {
    console.warn('⚠️ totalBeansHarvested 未定义，初始化为 0');
    totalBeansHarvested = 0;
}

// ============================================
// Toast 提示
// ============================================
function showLightToast(msg) {
    let toast = document.querySelector('.light-toast');
    if (toast) toast.remove();
    toast = document.createElement('div');
    toast.className = 'light-toast';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}
window.showLightToast = showLightToast;

// ============================================
// 兑换功能
// ============================================
function exchangeBeansToGold() {
    const exchangeQuantityInput = document.getElementById('exchangeQuantity');
    if (!exchangeQuantityInput) {
        if (cocoaBeans >= 50) {
            cocoaBeans -= 50;
            gold += 1;
            // ★★★ 新增：累加兑换次数（用于成就） ★★★
            totalExchanges = (totalExchanges || 0) + 1;
            showMessage('✨ 成功兑换 1 金币！剩余豆子: ' + cocoaBeans, false);
            refreshUI();
            if (autoSaveEnabled) saveGame();
            if (typeof soundCoin === 'function') soundCoin();
        } else {
            showMessage('豆子不足！需要 50 颗巧克力豆，当前只有 ' + cocoaBeans + ' 颗', true);
        }
        return;
    }
    let quantity = parseInt(exchangeQuantityInput.value) || 1;
    if (quantity < 1) quantity = 1;
    const beansNeeded = quantity * 50;
    if (cocoaBeans < beansNeeded) {
        showMessage('豆子不足！需要 ' + beansNeeded + ' 颗巧克力豆，当前只有 ' + cocoaBeans + ' 颗', true);
        return;
    }
    cocoaBeans -= beansNeeded;
    gold += quantity;
    // ★★★ 新增：累加兑换次数（用于成就） ★★★
    totalExchanges = (totalExchanges || 0) + quantity;
    showMessage('✨ 成功兑换 ' + quantity + ' 金币！消耗 ' + beansNeeded + ' 豆子，剩余豆子: ' + cocoaBeans, false);
    refreshUI();
    if (autoSaveEnabled) saveGame();
    if (typeof soundCoin === 'function') soundCoin();
}
window.exchangeBeansToGold = exchangeBeansToGold;

function increaseExchangeQuantity() {
    const input = document.getElementById('exchangeQuantity');
    if (!input) return;
    let val = parseInt(input.value) || 1;
    val++;
    input.value = val;
}
window.increaseExchangeQuantity = increaseExchangeQuantity;

function decreaseExchangeQuantity() {
    const input = document.getElementById('exchangeQuantity');
    if (!input) return;
    let val = parseInt(input.value) || 1;
    if (val > 1) val--;
    input.value = val;
}
window.decreaseExchangeQuantity = decreaseExchangeQuantity;

// ============================================
// 刷新UI（含防御性检查 + 经验卡片悬浮提示）
// ============================================
function refreshUI() {
    // ===== 防御性检查：确保所有全局变量已定义（不用 var） =====
    if (typeof cocoaBeans === 'undefined') cocoaBeans = 0;
    if (typeof gold === 'undefined') gold = 0;
    if (typeof totalProduced === 'undefined') totalProduced = 0;
    if (typeof totalSold === 'undefined') totalSold = 0;
    if (typeof totalEarned === 'undefined') totalEarned = 0;
    if (typeof totalBeansHarvested === 'undefined') totalBeansHarvested = 0;
    if (typeof level === 'undefined') level = 1;
    if (typeof exp === 'undefined') exp = 0;
    if (typeof miaoBargainLevel === 'undefined') miaoBargainLevel = 0;
    if (typeof productionSpeedLevel === 'undefined') productionSpeedLevel = 0;
    if (typeof workaholicLevel === 'undefined') workaholicLevel = 0;
    if (typeof expBoostLevel === 'undefined') expBoostLevel = 0;
    // ===== 防御性检查结束 =====

    const beanSpan = document.getElementById('beanAmount');
    const goldSpan = document.getElementById('goldAmount');
    const totalProducedSpan = document.getElementById('totalProduced');
    const totalSoldSpan = document.getElementById('totalSold');
    const totalEarnedSpan = document.getElementById('totalEarned');
    const totalBeansSpan = document.getElementById('totalBeansHarvested');
    const miaoDesc = document.getElementById('miaoDesc');
    const speedDesc = document.getElementById('speedDesc');
    const miaoCostDisplay = document.getElementById('miaoCostDisplay');
    const speedCostDisplay = document.getElementById('speedCostDisplay');
    const upgradeMiaoBtn = document.getElementById('upgradeMiaoBtn');
    const upgradeSpeedBtn = document.getElementById('upgradeSpeedBtn');
    const workaholicDesc = document.getElementById('workaholicDesc');
    const workaholicCostDisplay = document.getElementById('workaholicCostDisplay');
    const upgradeWorkaholicBtn = document.getElementById('upgradeWorkaholicBtn');
    const expBoostDesc = document.getElementById('expBoostDesc');
    const expBoostCostDisplay = document.getElementById('expBoostCostDisplay');
    const upgradeExpBoostBtn = document.getElementById('upgradeExpBoostBtn');

    if (beanSpan) beanSpan.innerText = Math.floor(cocoaBeans);
    if (goldSpan) goldSpan.innerText = Math.floor(gold);
    if (totalProducedSpan) totalProducedSpan.innerText = totalProduced;
    if (totalSoldSpan) totalSoldSpan.innerText = totalSold;
    if (totalEarnedSpan) totalEarnedSpan.innerText = Math.floor(totalEarned);
    if (totalBeansSpan) totalBeansSpan.innerText = totalBeansHarvested;

    const expNeeded = getExpNeeded(level);
    const expPercent = Math.min(100, (exp / expNeeded) * 100);
    const expBar = document.getElementById('expBar');
    if (expBar) expBar.style.width = expPercent + '%';
    const expTextSpan = document.getElementById('expText');
    if (expTextSpan) expTextSpan.innerText = exp + '/' + expNeeded;
    const expLevelSpan = document.getElementById('expLevel');
    if (expLevelSpan) expLevelSpan.innerText = 'Lv.' + level;

    // ===== 经验卡片悬浮提示 =====
    const expCard = document.getElementById('expCard');
    if (expCard) {
        const nextLevel = level + 1;
        const nextGoldReward = 50 + nextLevel * 10;
        const nextBeanReward = nextLevel * 2;
        const rewardText = '下一级金币+' + nextGoldReward + ' 豆子+' + nextBeanReward;
        expCard.dataset.reward = rewardText;

        let oldTooltip = document.getElementById('expCardTooltip');
        let oldArrow = document.getElementById('expCardArrow');
        if (oldTooltip) oldTooltip.remove();
        if (oldArrow) oldArrow.remove();

        const tooltip = document.createElement('div');
        tooltip.id = 'expCardTooltip';
        tooltip.textContent = rewardText;
        Object.assign(tooltip.style, {
            position: 'fixed',
            background: 'rgba(40, 28, 18, 0.94)',
            color: '#f5e6c8',
            padding: '6px 16px',
            borderRadius: '16px',
            fontSize: '0.75rem',
            fontWeight: '600',
            border: '1px solid rgba(200, 160, 120, 0.2)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            pointerEvents: 'none',
            zIndex: '99999',
            opacity: '0',
            visibility: 'hidden',
            transition: 'opacity 0.2s ease, visibility 0.2s ease',
            whiteSpace: 'nowrap',
            fontFamily: "'Georgia', 'Segoe UI', serif",
            letterSpacing: '0.3px',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
        });
        document.body.appendChild(tooltip);

        const arrow = document.createElement('div');
        arrow.id = 'expCardArrow';
        Object.assign(arrow.style, {
            position: 'fixed',
            width: '10px',
            height: '10px',
            background: 'rgba(40, 28, 18, 0.94)',
            transform: 'rotate(45deg)',
            borderRight: '1px solid rgba(200, 160, 120, 0.2)',
            borderBottom: '1px solid rgba(200, 160, 120, 0.2)',
            pointerEvents: 'none',
            zIndex: '99999',
            opacity: '0',
            visibility: 'hidden',
            transition: 'opacity 0.2s ease, visibility 0.2s ease'
        });
        document.body.appendChild(arrow);

        expCard.addEventListener('mouseenter', function(e) {
            const rect = this.getBoundingClientRect();
            const tooltipEl = document.getElementById('expCardTooltip');
            const arrowEl = document.getElementById('expCardArrow');
            if (!tooltipEl || !arrowEl) return;

            const tw = tooltipEl.offsetWidth || 200;
            let left = rect.left + rect.width / 2 - tw / 2;
            if (left < 10) left = 10;
            if (left + tw > window.innerWidth - 10) {
                left = window.innerWidth - tw - 10;
            }
            const top = rect.top - 10;

            tooltipEl.style.left = left + 'px';
            tooltipEl.style.top = top + 'px';
            tooltipEl.style.opacity = '1';
            tooltipEl.style.visibility = 'visible';

            const arrowLeft = rect.left + rect.width / 2 - 5;
            const arrowTop = rect.top - 6;
            arrowEl.style.left = arrowLeft + 'px';
            arrowEl.style.top = arrowTop + 'px';
            arrowEl.style.opacity = '1';
            arrowEl.style.visibility = 'visible';
        });

        expCard.addEventListener('mouseleave', function() {
            const tooltipEl = document.getElementById('expCardTooltip');
            const arrowEl = document.getElementById('expCardArrow');
            if (tooltipEl) {
                tooltipEl.style.opacity = '0';
                tooltipEl.style.visibility = 'hidden';
            }
            if (arrowEl) {
                arrowEl.style.opacity = '0';
                arrowEl.style.visibility = 'hidden';
            }
        });
    }
    // ===== 经验卡片悬浮提示结束 =====

    // ---- 更新升级描述 ----
    if (miaoDesc) {
        if (miaoBargainLevel >= 10) {
            miaoDesc.innerText = 'Lv.10/10 已达顶级 (售价+20)';
        } else {
            miaoDesc.innerText = 'Lv.' + miaoBargainLevel + '/10 下一级：售价 +2 (当前加成' + (miaoBargainLevel * 2) + ')';
        }
    }
    if (miaoCostDisplay) {
        const cost = getMiaoUpgradeCost();
        miaoCostDisplay.innerHTML = '💰 ' + (cost === Infinity ? 'MAX' : cost);
    }
    if (upgradeMiaoBtn) upgradeMiaoBtn.disabled = (miaoBargainLevel >= 10);

    if (speedDesc) {
        if (productionSpeedLevel >= 10) {
            speedDesc.innerText = 'Lv.10/10 已达顶级 (时间-30%)';
        } else {
            speedDesc.innerText = 'Lv.' + productionSpeedLevel + '/10 下一级：时间 -3% (当前' + (productionSpeedLevel * 3) + '%)';
        }
    }
    if (speedCostDisplay) {
        const cost = getSpeedUpgradeCost();
        speedCostDisplay.innerHTML = '💰 ' + (cost === Infinity ? 'MAX' : cost);
    }
    if (upgradeSpeedBtn) upgradeSpeedBtn.disabled = (productionSpeedLevel >= 10);

    if (workaholicDesc) {
        const interval = getAutoBeanInterval();
        if (workaholicLevel < WORKAHOLIC_CONFIG.maxLevel) {
            const nextInterval = getAutoBeanIntervalForLevel(workaholicLevel + 1);
            workaholicDesc.innerText = 'Lv.' + workaholicLevel + '/' + WORKAHOLIC_CONFIG.maxLevel + ' 当前每' + interval + '秒+1豆，下一级每' + nextInterval + '秒+1豆';
        } else {
            workaholicDesc.innerText = 'Lv.' + workaholicLevel + '/' + WORKAHOLIC_CONFIG.maxLevel + ' 已达顶级，每' + interval + '秒+1豆';
        }
    }
    if (workaholicCostDisplay) {
        const cost = getWorkaholicUpgradeCost();
        workaholicCostDisplay.innerHTML = '💰 ' + (cost === Infinity ? 'MAX' : cost);
    }
    if (upgradeWorkaholicBtn) upgradeWorkaholicBtn.disabled = (workaholicLevel >= WORKAHOLIC_CONFIG.maxLevel);

    if (expBoostDesc) {
        if (expBoostLevel >= EXP_BOOST_CONFIG.maxLevel) {
            expBoostDesc.innerText = 'Lv.' + expBoostLevel + '/' + EXP_BOOST_CONFIG.maxLevel + ' 已达顶级 (经验+' + Math.round(EXP_BOOST_CONFIG.maxLevel * EXP_BOOST_CONFIG.boostPerLevel * 100) + '%)';
        } else {
            const currentBoost = Math.round(expBoostLevel * EXP_BOOST_CONFIG.boostPerLevel * 100);
            const nextBoost = Math.round((expBoostLevel + 1) * EXP_BOOST_CONFIG.boostPerLevel * 100);
            expBoostDesc.innerText = 'Lv.' + expBoostLevel + '/' + EXP_BOOST_CONFIG.maxLevel + ' 当前经验+' + currentBoost + '%，下一级+' + nextBoost + '%';
        }
    }
    if (expBoostCostDisplay) {
        const cost = getExpBoostUpgradeCost();
        expBoostCostDisplay.innerHTML = '💰 ' + (cost === Infinity ? 'MAX' : cost);
    }
    if (upgradeExpBoostBtn) {
        upgradeExpBoostBtn.disabled = (expBoostLevel >= EXP_BOOST_CONFIG.maxLevel);
    }

    // ---- 能量按钮状态 ----
    const energyBtn = document.getElementById('energyBtn');
    if (energyBtn) {
        if (level >= 5) {
            energyBtn.classList.remove('locked');
            energyBtn.disabled = false;
        } else {
            energyBtn.classList.add('locked');
            energyBtn.disabled = false;
        }
    }

    // ---- 渲染子模块 ----
    if (typeof renderSlots === 'function') renderSlots();
    if (typeof renderQuickSell === 'function') renderQuickSell();
    if (typeof renderWarehouseModal === 'function') renderWarehouseModal();

    // ---- 检查成就 ----
    if (typeof checkAchievements === 'function') {
        checkAchievements();
    }

    // ---- 更新个人信息模态框（如果打开） ----
    const profileModal = document.getElementById('profileModal');
    if (profileModal && !profileModal.classList.contains('hidden')) {
        const levelSpan = document.getElementById('profileLevel');
        if (levelSpan) levelSpan.innerText = level;
        const expNeededVal = getExpNeeded(level);
        const expSpan = document.getElementById('profileExp');
        if (expSpan) expSpan.innerText = exp + '/' + expNeededVal;
        const producedSpan = document.getElementById('profileTotalProduced');
        if (producedSpan) producedSpan.innerText = totalProduced;
        const soldSpan = document.getElementById('profileTotalSold');
        if (soldSpan) soldSpan.innerText = totalSold;
        const earnedSpan = document.getElementById('profileTotalEarned');
        if (earnedSpan) earnedSpan.innerText = Math.floor(totalEarned);
        const beansSpan = document.getElementById('profileTotalBeans');
        if (beansSpan) beansSpan.innerText = totalBeansHarvested;
    }
}
window.refreshUI = refreshUI;

// ============================================
// 仓库（含背包道具使用）
// ============================================
function renderWarehouseModal() {
    const warehouseProductList = document.getElementById('warehouseProductList');
    if (!warehouseProductList) return;
    warehouseProductList.innerHTML = '';

    // 普通产品
    for (const [id, prod] of Object.entries(PRODUCTS)) {
        const qty = inventory[id] || 0;
        if (qty === 0) continue;
        const square = document.createElement('div');
        square.className = 'product-square';
        square.innerHTML = '<div class="product-emoji">' + prod.name.split(' ')[0] + '</div><div class="product-count">' + qty + '</div>';
        warehouseProductList.appendChild(square);
    }

    // 隐藏产品
    if (level >= 5) {
        for (let recipe of HIDDEN_RECIPES) {
            const qty = hiddenInventory[recipe.id] || 0;
            if (qty === 0) continue;
            const square = document.createElement('div');
            square.className = 'product-square hidden-product-square';
            square.innerHTML = '<img src="' + recipe.img + '" style="width:40px;height:40px;object-fit:contain;border-radius:8px;margin-bottom:2px;" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'inline-block\';"><span style="display:none;">' + recipe.name.split(' ')[0] + '</span><div class="product-count">' + qty + '</div>';
            warehouseProductList.appendChild(square);
        }
    }

    // 背包道具
    if (typeof playerBag !== 'undefined') {
        var bagItems = {
            speed_up: { icon: '⏩', name: '加速券', type: 'disabled' },
            refresh: { icon: '🔄', name: '刷新券', type: 'disabled' },
            lucky_box: { icon: '🎰', name: '幸运盒子', type: 'clickable' },
            energy_box: { icon: '🎁', name: '能量宝箱', type: 'clickable' }
        };

        for (var id in bagItems) {
            var qty = playerBag[id] || 0;
            if (qty > 0) {
                var square = document.createElement('div');
                square.className = 'product-square';

                if (bagItems[id].type === 'disabled') {
                    square.style.cursor = 'default';
                    square.style.background = '#f5f0ea';
                    square.style.borderColor = '#e7c29e';
                    square.style.opacity = '0.8';
                    square.innerHTML =
                        '<div style="font-size:1.8rem;">' + bagItems[id].icon + '</div>' +
                        '<div style="font-size:0.6rem;font-weight:bold;color:#a56b3a;text-align:center;">' + bagItems[id].name + '</div>' +
                        '<div class="product-count" style="color:#a56b3a;">' + qty + '</div>';
                } else {
                    square.style.cursor = 'pointer';
                    square.style.background = '#e8f5e9';
                    square.style.borderColor = '#6f9e3f';
                    square.style.transition = '0.15s';
                    square.innerHTML =
                        '<div style="font-size:1.8rem;">' + bagItems[id].icon + '</div>' +
                        '<div style="font-size:0.6rem;font-weight:bold;color:#5a2e1c;text-align:center;">' + bagItems[id].name + '</div>' +
                        '<div class="product-count" style="color:#2d7a1e;">' + qty + '</div>';
                    square.onmouseover = function() { this.style.transform = 'scale(1.05)'; };
                    square.onmouseout = function() { this.style.transform = 'scale(1)'; };
                    square.onclick = (function(itemId) {
                        return function() {
                            if (typeof useBagItem === 'function') {
                                useBagItem(itemId);
                                renderWarehouseModal();
                                if (typeof refreshUI === 'function') refreshUI();
                                if (typeof soundItemGet === 'function') soundItemGet();
                            }
                        };
                    })(id);
                }
                warehouseProductList.appendChild(square);
            }
        }
    }
}
window.renderWarehouseModal = renderWarehouseModal;

// ============================================
// 经验系统
// ============================================
function addExp(amount) {
    exp += amount;
    let leveled = false;
    let expNeeded = getExpNeeded(level);
    while (exp >= expNeeded) {
        exp -= expNeeded;
        level++;
        const goldReward = 50 + level * 10;
        const beanReward = level * 2;
        gold += goldReward;
        cocoaBeans += beanReward;
        let energyReward = null;
        if (level >= 5) {
            const randomIndex = Math.floor(Math.random() * ENERGY_TYPES.length);
            const energy = ENERGY_TYPES[randomIndex];
            const amountEnergy = 1;
            energies[energy.id] += amountEnergy;
            energyReward = { name: energy.name, amount: amountEnergy };
        }
        if (typeof randomFireworks === 'function') randomFireworks(4);
        if (typeof showUpgradeAnimation === 'function') showUpgradeAnimation(goldReward, beanReward, level, energyReward);
        leveled = true;
        expNeeded = getExpNeeded(level);
        refreshUI();
    }
    if (leveled || amount > 0) refreshUI();
    if (autoSaveEnabled) saveGame();
}
window.addExp = addExp;

// ============================================
// 个人信息
// ============================================
function showProfileModal() {
    const profileModal = document.getElementById('profileModal');
    if (!profileModal) return;
    const nicknameSpan = document.getElementById('profileNickname');
    if (nicknameSpan) nicknameSpan.innerText = userProfile.nickname;
    const levelSpan = document.getElementById('profileLevel');
    if (levelSpan) levelSpan.innerText = level;
    const expNeeded = getExpNeeded(level);
    const expSpan = document.getElementById('profileExp');
    if (expSpan) expSpan.innerText = exp + '/' + expNeeded;
    const producedSpan = document.getElementById('profileTotalProduced');
    if (producedSpan) producedSpan.innerText = totalProduced;
    const soldSpan = document.getElementById('profileTotalSold');
    if (soldSpan) soldSpan.innerText = totalSold;
    const earnedSpan = document.getElementById('profileTotalEarned');
    if (earnedSpan) earnedSpan.innerText = Math.floor(totalEarned);
    const beansSpan = document.getElementById('profileTotalBeans');
    if (beansSpan) beansSpan.innerText = totalBeansHarvested;
    profileModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
}
window.showProfileModal = showProfileModal;

function closeProfileModal() {
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        profileModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }
}
window.closeProfileModal = closeProfileModal;

// ============================================
// 昵称修改
// ============================================
function editNickname() {
    const currentCount = userProfile.nicknameChangeCount || 0;
    if (currentCount >= 2) {
        showLightToast('您已经修改过两次昵称，不能再修改了！');
        return;
    }
    const modal = document.getElementById('editNicknameModal');
    const input = document.getElementById('newNicknameInput');
    if (modal && input) {
        input.value = userProfile.nickname;
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
    } else {
        showLightToast('无法打开昵称编辑窗口，请刷新页面重试');
    }
}
window.editNickname = editNickname;

function confirmEditNickname() {
    const modal = document.getElementById('editNicknameModal');
    const input = document.getElementById('newNicknameInput');
    if (!modal || !input) return;
    const newName = input.value.trim();
    if (!newName) {
        showLightToast('昵称不能为空');
        return;
    }
    if (newName.length > 12) {
        showLightToast('昵称不能超过12个字符');
        return;
    }
    const currentCount = userProfile.nicknameChangeCount || 0;
    if (currentCount >= 2) {
        showLightToast('您已经修改过两次昵称，不能再修改了！');
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        return;
    }
    userProfile.nickname = newName;
    userProfile.nicknameChanged = true;
    userProfile.nicknameChangeCount = currentCount + 1;
    const nicknameSpan = document.getElementById('profileNickname');
    if (nicknameSpan) nicknameSpan.innerText = userProfile.nickname;
    saveGame();
    showLightToast('昵称已修改为 ' + userProfile.nickname + '（剩余修改次数：' + (1 - currentCount) + '次）');
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
}
window.confirmEditNickname = confirmEditNickname;

function cancelEditNickname() {
    const modal = document.getElementById('editNicknameModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }
}
window.cancelEditNickname = cancelEditNickname;

function showConfirmModal(options) {
    return new Promise(function(resolve) {
        var modal = document.getElementById('customConfirmModal');
        var icon = document.getElementById('confirmIcon');
        var title = document.getElementById('confirmTitle');
        var message = document.getElementById('confirmMessage');
        var okBtn = document.getElementById('confirmOkBtn');
        var cancelBtn = document.getElementById('confirmCancelBtn');

        if (!modal) {
            console.warn('⚠️ 确认模态框不存在，使用原生 confirm');
            resolve(confirm(options.message || '确定执行此操作吗？'));
            return;
        }

        // 设置内容
        icon.textContent = options.icon || '⚠️';
        title.textContent = options.title || '确认操作';
        message.textContent = options.message || '确定要执行此操作吗？此操作不可撤销。';
        okBtn.textContent = options.okText || '确定';
        okBtn.style.background = options.okColor || 'linear-gradient(135deg,#d9534f,#c0392b)';

        // 控制取消按钮显示
        var showCancel = options.showCancel !== undefined ? options.showCancel : true;
        if (showCancel) {
            cancelBtn.style.display = 'inline-block';
            cancelBtn.textContent = options.cancelText || '取消';
        } else {
            cancelBtn.style.display = 'none';
        }

        // 移除旧监听
        var newOkBtn = okBtn.cloneNode(true);
        var newCancelBtn = cancelBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newOkBtn, okBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        modal.classList.remove('hidden');
        modal.style.display = 'flex';

        function close(result) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            document.removeEventListener('keydown', keyHandler);
            resolve(result);
        }

        newOkBtn.addEventListener('click', function() { close(true); });
        newCancelBtn.addEventListener('click', function() { close(false); });

        modal.addEventListener('click', function(e) {
            if (e.target === modal) close(false);
        });

        function keyHandler(e) {
            if (e.key === 'Enter') close(true);
            else if (e.key === 'Escape') close(false);
        }
        document.addEventListener('keydown', keyHandler);
    });
}
window.showConfirmModal = showConfirmModal;

// ============================================
// 自定义确认模态框（Promise 风格）
// ============================================

function showConfirmModal(options) {
    return new Promise(function(resolve) {
        var modal = document.getElementById('customConfirmModal');
        var icon = document.getElementById('confirmIcon');
        var title = document.getElementById('confirmTitle');
        var message = document.getElementById('confirmMessage');
        var okBtn = document.getElementById('confirmOkBtn');
        var cancelBtn = document.getElementById('confirmCancelBtn');

        if (!modal) {
            console.warn('⚠️ 确认模态框不存在，使用原生 confirm');
            resolve(confirm(options.message || '确定执行此操作吗？'));
            return;
        }

        // 设置内容
        icon.textContent = options.icon || '⚠️';
        title.textContent = options.title || '确认操作';
        message.textContent = options.message || '确定要执行此操作吗？此操作不可撤销。';
        
        // 设置按钮颜色
        okBtn.style.background = options.okColor || 'linear-gradient(135deg,#d9534f,#c0392b)';
        okBtn.textContent = options.okText || '确定';
        cancelBtn.textContent = options.cancelText || '取消';

        // 移除旧的事件监听（避免重复绑定）
        var newOkBtn = okBtn.cloneNode(true);
        var newCancelBtn = cancelBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newOkBtn, okBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        // 显示模态框
        modal.classList.remove('hidden');
        modal.style.display = 'flex';

        // 确定按钮
        newOkBtn.addEventListener('click', function() {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            resolve(true);
        });

        // 取消按钮
        newCancelBtn.addEventListener('click', function() {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            resolve(false);
        });

        // 点击背景关闭（只关闭不执行）
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
                resolve(false);
            }
        });

        // 键盘快捷键：Enter = 确定，Escape = 取消
        function keyHandler(e) {
            if (e.key === 'Enter') {
                modal.classList.add('hidden');
                modal.style.display = 'none';
                document.removeEventListener('keydown', keyHandler);
                resolve(true);
            } else if (e.key === 'Escape') {
                modal.classList.add('hidden');
                modal.style.display = 'none';
                document.removeEventListener('keydown', keyHandler);
                resolve(false);
            }
        }
        document.addEventListener('keydown', keyHandler);
    });
}

window.showConfirmModal = showConfirmModal;



// ============================================
// 升级动画
// ============================================
if (typeof window._ui_upgradeAnimInited === 'undefined') {
    window._ui_upgradeAnimInited = true;

    var ui_upgradeOverlay = document.getElementById('upgradeOverlay');
    var ui_upgradeAutoCloseTimer = null;

    function ui_clearUpgradeAutoClose() {
        if (ui_upgradeAutoCloseTimer) {
            clearTimeout(ui_upgradeAutoCloseTimer);
            ui_upgradeAutoCloseTimer = null;
        }
    }

    function closeUpgradeAnimation() {
        if (!ui_upgradeOverlay || !ui_upgradeOverlay.classList.contains('show')) return;
        ui_clearUpgradeAutoClose();
        ui_upgradeOverlay.classList.add('fade-out');
        setTimeout(function() {
            if (ui_upgradeOverlay) ui_upgradeOverlay.classList.remove('show', 'fade-out');
        }, 500);
    }

    function showUpgradeAnimation(goldReward, beanReward, newLevel, energyReward) {
        if (!ui_upgradeOverlay) return;
        var goldSpan = document.getElementById('upgradeGoldReward');
        var beanSpan = document.getElementById('upgradeBeanReward');
        var energyItem = document.getElementById('upgradeEnergyRewardItem');
        var energyImg = document.getElementById('upgradeEnergyImg');
        var energyNameSpan = document.getElementById('upgradeEnergyName');
        var energyValueSpan = document.getElementById('upgradeEnergyReward');
        var levelSpan = document.getElementById('upgradeLevelNumber');

        if (goldSpan) goldSpan.innerText = '+' + goldReward;
        if (beanSpan) beanSpan.innerText = '+' + beanReward;
        if (levelSpan) levelSpan.innerText = newLevel;

        var existingMsg = document.getElementById('specialLevel5Msg');
        if (existingMsg) existingMsg.remove();

        if (typeof soundLevelUp === 'function') soundLevelUp();

        if (energyReward && energyReward.amount > 0 && energyItem) {
            var energyType = ENERGY_TYPES.find(function(e) { return e.name === energyReward.name; });
            if (energyType) {
                energyImg.src = energyType.img;
                energyImg.alt = energyReward.name;
            }
            energyNameSpan.innerText = energyReward.name;
            energyValueSpan.innerText = '+' + energyReward.amount;
            energyItem.style.display = 'flex';

            if (newLevel === 5) {
                var rewardList = document.querySelector('#upgradeOverlay .reward-list');
                if (rewardList) {
                    var msgDiv = document.createElement('div');
                    msgDiv.id = 'specialLevel5Msg';
                    msgDiv.className = 'reward-item';
                    msgDiv.style.background = 'rgba(0,0,0,0.45)';
                    msgDiv.style.borderRadius = '60px';
                    msgDiv.style.padding = '8px 14px';
                    msgDiv.style.marginBottom = '8px';
                    msgDiv.style.textAlign = 'center';
                    msgDiv.innerHTML = '<span style="width:100%; color:#ffefb0;">✨ 恭喜你发现隐藏能量 ✨</span>';
                    rewardList.insertBefore(msgDiv, rewardList.firstChild);
                }
            }
        } else {
            if (energyItem) energyItem.style.display = 'none';
        }

        ui_upgradeOverlay.classList.remove('fade-out');
        ui_upgradeOverlay.classList.add('show');
        ui_clearUpgradeAutoClose();
        ui_upgradeAutoCloseTimer = setTimeout(closeUpgradeAnimation, 3000);
    }

    if (ui_upgradeOverlay) {
        ui_upgradeOverlay.addEventListener('click', function(e) {
            if (e.target === ui_upgradeOverlay) closeUpgradeAnimation();
        });
    }
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && ui_upgradeOverlay && ui_upgradeOverlay.classList.contains('show')) {
            closeUpgradeAnimation();
        }
    });

    window.closeUpgradeAnimation = closeUpgradeAnimation;
    window.showUpgradeAnimation = showUpgradeAnimation;
}

console.log('✅ ui.js 加载完成（含防御性检查和经验卡片悬浮提示）');