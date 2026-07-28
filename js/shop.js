// ============================================================
// 商城系统（完整修复版）
// 修复：每日库存凌晨4点自动重置
// 路径: js/shop.js
// ============================================================

console.log('🏪 商城系统加载中...');

// ============================================================
// 配置
// ============================================================

var SIGN_IN_REWARDS = [
    { day: 1, type: 'beans', amount: 10, label: '🫘10' },
    { day: 2, type: 'gold', amount: 5, label: '🪙5' },
    { day: 3, type: 'beans', amount: 15, label: '🫘15' },
    { day: 4, type: 'gold', amount: 8, label: '🪙8' },
    { day: 5, type: 'beans', amount: 20, label: '🫘20' },
    { day: 6, type: 'gold', amount: 12, label: '🪙12' },
    { day: 7, type: 'special', amount: 1, label: '🎁' }
];

var SHOP_ITEMS = {
    speed_up: {
        id: 'speed_up',
        name: '加速券',
        icon: '⏩',
        price: 200,
        maxStock: 1,
        desc: '加速工坊929秒',
        effect: 'speed_up',
        type: 'item'
    },
    refresh: {
        id: 'refresh',
        name: '刷新券',
        icon: '🔄',
        price: 150,
        maxStock: 1,
        desc: '刷新每日订单',
        effect: 'refresh_orders',
        type: 'item'
    },
    lucky_box: {
        id: 'lucky_box',
        name: '幸运盒子',
        icon: '🎰',
        price: 50,
        maxStock: 3,
        desc: '随机获得10~99金币',
        effect: 'lucky_box',
        type: 'instant'
    },
    exp_book: {
        id: 'exp_book',
        name: '经验书',
        icon: '📖',
        price: 60,
        maxStock: 2,
        desc: '立即获得20经验',
        effect: 'add_exp',
        type: 'instant'
    },
    beans_pack: {
        id: 'beans_pack',
        name: '豆子礼包',
        icon: '🫘',
        price: 10,
        maxStock: 5,
        desc: '立即获得29颗豆子',
        effect: 'add_beans',
        type: 'instant'
    },
    energy_box: {
        id: 'energy_box',
        name: '能量宝箱',
        icon: '🎁',
        price: 929,
        maxStock: 1,
        desc: '随机获得1个能量',
        effect: 'random_energy',
        type: 'item'
    }
};

// ============================================================
// 状态
// ============================================================

var shopState = {
    signIn: {
        lastDate: null,
        consecutiveDays: 0,
        signedToday: false
    },
    inventory: {},
    resetDate: null
};

var playerBag = {
    speed_up: 0,
    refresh: 0,
    lucky_box: 0,
    energy_box: 0
};

var shopModalLoaded = false;
var _shopRefreshTimer = null;
var _shopRefreshBadge = null;

// ============================================================
// 初始化
// ============================================================

function initShop() {
    console.log('🏪 初始化商城...');
    loadShopData();
    loadPlayerBag();
    
    // ===== 应用启动时检查每日重置（loadShopData 中已触发） =====
    var wasReset = checkDailyReset();
    if (wasReset) {
        console.log('🔄 商城库存已每日重置（凌晨4点刷新）');
    }
    
    // ===== 每小时检查一次日期变化 =====
    if (_shopRefreshTimer) {
        clearInterval(_shopRefreshTimer);
    }
    _shopRefreshTimer = setInterval(function() {
        var reset = checkDailyReset();
        if (reset) {
            console.log('🔄 商城库存已自动重置（定时检查，凌晨4点刷新）');
            // 如果商城已打开，刷新UI
            var modal = document.getElementById('shopModal');
            if (modal && !modal.classList.contains('hidden')) {
                renderShopUI();
            }
        }
    }, 3600000); // 每小时检查一次
    
    createShopModal();
    console.log('✅ 商城初始化完成');
}

// ============================================================
// 数据持久化
// ============================================================

function loadShopData() {
    try {
        var saved = localStorage.getItem('shop_data');
        if (saved) {
            var data = JSON.parse(saved);
            shopState.signIn = data.signIn || { lastDate: null, consecutiveDays: 0, signedToday: false };
            shopState.inventory = data.inventory || {};
            shopState.resetDate = data.resetDate || null;
        } else {
            shopState.signIn = { lastDate: null, consecutiveDays: 0, signedToday: false };
            shopState.inventory = {};
            shopState.resetDate = null;
        }
    } catch(e) {
        console.warn('加载商城数据失败:', e);
        shopState.signIn = { lastDate: null, consecutiveDays: 0, signedToday: false };
        shopState.inventory = {};
        shopState.resetDate = null;
    }
    
    // 确保所有道具都有库存字段
    for (var id in SHOP_ITEMS) {
        if (shopState.inventory[id] === undefined) {
            shopState.inventory[id] = SHOP_ITEMS[id].maxStock;
        }
    }
    
    // ===== 关键修复：加载后立即检查每日重置 =====
    checkDailyReset();
    
    // 如果没有保存过数据，立即保存
    var saved = localStorage.getItem('shop_data');
    if (!saved) {
        saveShopData();
    }
}

function saveShopData() {
    try {
        var data = {
            signIn: shopState.signIn,
            inventory: shopState.inventory,
            resetDate: shopState.resetDate
        };
        localStorage.setItem('shop_data', JSON.stringify(data));
    } catch(e) {
        console.warn('保存商城数据失败:', e);
    }
}

// ============================================================
// 每日重置检查（凌晨4点刷新）
// ============================================================

function checkDailyReset() {
    var now = new Date();
    var today = getTodayDateStr();
    var today4am = new Date();
    today4am.setHours(4, 0, 0, 0);
    
    // ===== 情况1：首次使用（resetDate 为 null）直接重置 =====
    if (shopState.resetDate === null) {
        for (var id in SHOP_ITEMS) {
            shopState.inventory[id] = SHOP_ITEMS[id].maxStock;
        }
        shopState.resetDate = today;
        saveShopData();
        console.log('🔄 商城首次初始化，库存已设置');
        showShopRefreshBadge();
        return true;
    }
    
    // ===== 情况2：如果当前时间还没到凌晨4点，不触发重置 =====
    if (now < today4am) {
        return false;
    }
    
    // ===== 情况3：已过4点，检查日期是否变化 =====
    if (shopState.resetDate !== today) {
        for (var id in SHOP_ITEMS) {
            shopState.inventory[id] = SHOP_ITEMS[id].maxStock;
        }
        shopState.resetDate = today;
        saveShopData();
        console.log('🔄 商城每日库存已重置（凌晨4点）');
        showShopRefreshBadge();
        return true;
    }
    
    return false;
}

// ============================================================
// 商城红点提示
// ============================================================

function showShopRefreshBadge() {
    var shopBtn = document.getElementById('shopBtn');
    if (!shopBtn) return;
    
    // 移除旧红点
    removeShopRefreshBadge();
    
    // 添加新红点
    var badge = document.createElement('span');
    badge.id = 'shopRefreshBadge';
    badge.style.cssText = [
        'position:absolute',
        'top:-2px',
        'right:-2px',
        'width:12px',
        'height:12px',
        'background:#4CAF50',
        'border-radius:50%',
        'border:2px solid #f5ede4',
        'animation:badgePulse 1.5s ease-in-out infinite',
        'z-index:5',
        'pointer-events:none'
    ].join(';');
    shopBtn.style.position = 'relative';
    shopBtn.appendChild(badge);
    _shopRefreshBadge = badge;
}

function removeShopRefreshBadge() {
    if (_shopRefreshBadge && _shopRefreshBadge.parentNode) {
        _shopRefreshBadge.parentNode.removeChild(_shopRefreshBadge);
        _shopRefreshBadge = null;
    }
}

function clearShopRefreshBadge() {
    removeShopRefreshBadge();
    // 记录已查看
    localStorage.setItem('shop_refresh_seen', getTodayDateStr());
}

// ============================================================
// 玩家背包
// ============================================================

function loadPlayerBag() {
    try {
        var saved = localStorage.getItem('player_bag');
        if (saved) {
            var data = JSON.parse(saved);
            for (var id in playerBag) {
                if (data[id] !== undefined) {
                    playerBag[id] = data[id];
                }
            }
        }
    } catch(e) {
        console.warn('加载背包数据失败:', e);
    }
}

function savePlayerBag() {
    try {
        localStorage.setItem('player_bag', JSON.stringify(playerBag));
    } catch(e) {
        console.warn('保存背包数据失败:', e);
    }
}

function addToBag(itemId, amount) {
    if (playerBag[itemId] !== undefined) {
        playerBag[itemId] += amount;
        savePlayerBag();
        updateBagCount();
        console.log('🎒 已存入背包: ' + itemId + ' x' + amount);
    }
}

function getBagCount() {
    var total = 0;
    for (var id in playerBag) {
        total += playerBag[id];
    }
    return total;
}

function updateBagCount() {
    var el = document.getElementById('bagCount');
    if (el) {
        el.textContent = getBagCount();
    }
}

// ============================================================
// 日期工具
// ============================================================

function getTodayDateStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// ============================================================
// 创建商城模态框
// ============================================================

function createShopModal() {
    if (document.getElementById('shopModal')) {
        return;
    }
    
    var html = getShopHTML();
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    var modalContent = tempDiv.firstElementChild;
    if (modalContent) {
        document.body.appendChild(modalContent);
        bindShopEvents();
        shopModalLoaded = true;
    }
}

// ============================================================
// 签到系统
// ============================================================

function getSignInStatus() {
    var today = getTodayDateStr();
    var lastDate = shopState.signIn.lastDate;
    
    var signedToday = (lastDate === today);
    var consecutive = shopState.signIn.consecutiveDays;
    
    if (lastDate) {
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        var yesterdayStr = yesterday.toISOString().slice(0, 10);
        if (lastDate !== today && lastDate !== yesterdayStr) {
            consecutive = 0;
        }
    }

    return {
        consecutiveDays: consecutive,
        signedToday: signedToday,
        canSignIn: !signedToday
    };
}

function doSignIn() {
    var today = getTodayDateStr();
    var lastDate = shopState.signIn.lastDate;
    
    if (lastDate === today) {
        if (typeof showMessage === 'function') {
            showMessage('今天已经签到过了！', true);
        }
        return false;
    }

    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var yesterdayStr = yesterday.toISOString().slice(0, 10);
    
    var consecutive = shopState.signIn.consecutiveDays;
    
    if (lastDate === yesterdayStr) {
        consecutive = consecutive + 1;
    } else {
        consecutive = 1;
    }
    
    if (consecutive > 7) {
        consecutive = 1;
    }

    var day = consecutive;
    var reward = SIGN_IN_REWARDS[day - 1];
    var rewardMsg = '';

    if (reward.type === 'beans') {
        if (typeof cocoaBeans !== 'undefined') {
            cocoaBeans += reward.amount;
            if (typeof totalBeansHarvested !== 'undefined') {
                totalBeansHarvested += reward.amount;
            }
        }
        rewardMsg = '🫘 +' + reward.amount + ' 颗豆子';
    } else if (reward.type === 'gold') {
        if (typeof gold !== 'undefined') {
            gold += reward.amount;
        }
        rewardMsg = '🪙 +' + reward.amount + ' 金币';
    } else if (reward.type === 'special') {
        if (typeof gold !== 'undefined') {
            gold += 20;
        }
        if (typeof cocoaBeans !== 'undefined') {
            cocoaBeans += 50;
            if (typeof totalBeansHarvested !== 'undefined') {
                totalBeansHarvested += 50;
            }
        }
        rewardMsg = '🎁 20金币 + 50颗豆子';
    }

    shopState.signIn.lastDate = today;
    shopState.signIn.consecutiveDays = consecutive;

    saveShopData();
    renderShopUI();
    if (typeof refreshUI === 'function') refreshUI();
    if (typeof saveGame === 'function') saveGame();

    if (typeof showMessage === 'function') {
        showMessage('✅ 签到成功！连续签到 ' + consecutive + ' 天，获得 ' + rewardMsg, false);
    }

    if (day === 7 && typeof randomFireworks === 'function') {
        randomFireworks(5);
        if (typeof showMessage === 'function') {
            showMessage('🎉 恭喜完成7天连续签到！', false);
        }
    }

    if (typeof checkAchievements === 'function') {
        setTimeout(function() {
            checkAchievements();
        }, 300);
    }

    return true;
}

// ============================================================
// 道具购买
// ============================================================

function purchaseItem(itemId) {
    var item = SHOP_ITEMS[itemId];
    if (!item) {
        if (typeof showMessage === 'function') showMessage('商品不存在', true);
        return false;
    }

    var stock = shopState.inventory[itemId] || 0;
    if (stock <= 0) {
        if (typeof showMessage === 'function') showMessage('今日库存已售罄！明天4点后补货', true);
        return false;
    }

    if (typeof gold === 'undefined' || gold < item.price) {
        if (typeof showMessage === 'function') {
            showMessage('❌ 金币不足！需要 ' + item.price + ' 金币，当前只有 ' + Math.floor(gold || 0) + ' 金币', true);
        }
        return false;
    }

    gold -= item.price;
    shopState.inventory[itemId] = stock - 1;

    if (item.type === 'instant') {
        applyInstantEffect(itemId);
    } else {
        addToBag(itemId, 1);
        if (typeof showMessage === 'function') {
            showMessage('🎒 ' + item.name + ' 已存入背包！', false);
        }
    }

    saveShopData();
    renderShopUI();
    if (typeof refreshUI === 'function') refreshUI();
    if (typeof saveGame === 'function') saveGame();

    if (item.type !== 'instant') {
        if (typeof showMessage === 'function') {
            showMessage('✅ 购买成功！' + item.name + ' 已存入背包', false);
        }
    }
    return true;
}

// ============================================================
// 显示幸运盒子结果
// ============================================================

function showLuckyBoxResult(goldGain) {
    if (!document.getElementById('luckyBoxStyle')) {
        var style = document.createElement('style');
        style.id = 'luckyBoxStyle';
        style.textContent = 
            '@keyframes luckyResultPop {' +
            '  0% { transform: scale(0.3); opacity: 0; }' +
            '  60% { transform: scale(1.2); }' +
            '  100% { transform: scale(1); opacity: 1; }' +
            '}';
        document.head.appendChild(style);
    }
    
    var resultArea = document.getElementById('luckyBoxResultArea');
    if (!resultArea) return;
    
    var emoji = '';
    if (goldGain >= 80) emoji = '🌟';
    else if (goldGain >= 50) emoji = '😊';
    else if (goldGain >= 30) emoji = '🙂';
    else emoji = '😅';
    
    resultArea.innerHTML = 
        '<span style="display:inline-block;animation:luckyResultPop 0.5s ease;background:linear-gradient(135deg,#e8f5e9,#a5d6a7);padding:4px 12px;border-radius:20px;border:2px solid #43a047;font-size:0.8rem;white-space:nowrap;color:#1b5e20;font-weight:bold;">' +
        '🪙+' + goldGain + ' ' + emoji +
        '</span>';
    
    if (window._luckyBoxTimer) clearTimeout(window._luckyBoxTimer);
    window._luckyBoxTimer = setTimeout(function() {
        resultArea.style.opacity = '0';
        resultArea.style.transition = 'opacity 0.5s';
        setTimeout(function() {
            resultArea.innerHTML = '';
            resultArea.style.opacity = '1';
        }, 500);
    }, 3500);
}

// ============================================================
// 立即生效效果
// ============================================================

function applyInstantEffect(itemId) {
    switch(itemId) {
        case 'lucky_box':
            var goldGain = Math.floor(Math.random() * 90) + 10;
            if (typeof gold !== 'undefined') {
                gold += goldGain;
            }
            
            if (typeof luckyBoxStats !== 'undefined') {
                if (goldGain > luckyBoxStats.maxGold) {
                    luckyBoxStats.maxGold = goldGain;
                    if (typeof saveAchievementData === 'function') {
                        saveAchievementData();
                    }
                    if (typeof checkAchievements === 'function') {
                        setTimeout(function() {
                            checkAchievements();
                        }, 300);
                    }
                }
            }
            
            if (typeof showMessage === 'function') {
                showMessage('🎰 幸运盒子开出 🪙 ' + goldGain + ' 金币！', false);
            }
            showLuckyBoxResult(goldGain);
            break;

        case 'exp_book':
            if (typeof addExp === 'function') {
                addExp(20);
            } else if (typeof exp !== 'undefined') {
                exp += 20;
                if (typeof refreshUI === 'function') refreshUI();
            }
            if (typeof showMessage === 'function') {
                showMessage('📖 获得 20 经验！', false);
            }
            break;

        case 'beans_pack':
            if (typeof cocoaBeans !== 'undefined') {
                cocoaBeans += 29;
                if (typeof totalBeansHarvested !== 'undefined') {
                    totalBeansHarvested += 29;
                }
            }
            if (typeof showMessage === 'function') {
                showMessage('🫘 获得 29 颗豆子！', false);
            }
            break;

        default:
            if (typeof showMessage === 'function') {
                showMessage('未知道具效果', true);
            }
    }
}

// ============================================================
// 使用背包道具
// ============================================================

function useBagItem(itemId) {
    var item = SHOP_ITEMS[itemId];
    if (!item) {
        if (typeof showMessage === 'function') showMessage('道具不存在', true);
        return false;
    }

    if (playerBag[itemId] <= 0) {
        if (typeof showMessage === 'function') showMessage('背包中没有该道具', true);
        return false;
    }

    playerBag[itemId] -= 1;
    savePlayerBag();
    updateBagCount();

    switch(itemId) {
        case 'speed_up':
            var accelerated = false;
            if (typeof slots !== 'undefined') {
                for (var i = 0; i < slots.length; i++) {
                    if (slots[i].status === 'producing' && slots[i].remainingSec > 0) {
                        var remaining = slots[i].remainingSec;
                        var reduce = Math.min(remaining, 929);
                        slots[i].remainingSec = remaining - reduce;
                        if (slots[i].remainingSec <= 0) {
                            slots[i].status = 'completed';
                            slots[i].remainingSec = 0;
                        }
                        accelerated = true;
                        if (typeof showMessage === 'function') {
                            showMessage('⏩ 工坊 ' + (i + 1) + ' 加速 ' + reduce + ' 秒', false);
                        }
                        break;
                    }
                }
            }
            if (!accelerated && typeof showMessage === 'function') {
                showMessage('没有正在生产的工坊可加速', true);
                playerBag[itemId] += 1;
                savePlayerBag();
                updateBagCount();
                return false;
            }
            break;

        case 'refresh':
            if (typeof forceRefreshOrders === 'function') {
                forceRefreshOrders();
                if (typeof showMessage === 'function') {
                    showMessage('🔄 订单已刷新！', false);
                }
            } else {
                if (typeof showMessage === 'function') {
                    showMessage('刷新功能暂不可用', true);
                }
                playerBag[itemId] += 1;
                savePlayerBag();
                updateBagCount();
                return false;
            }
            break;

        case 'lucky_box':
            var goldGain = Math.floor(Math.random() * 90) + 10;
            if (typeof gold !== 'undefined') {
                gold += goldGain;
            }
            
            if (typeof luckyBoxStats !== 'undefined') {
                if (goldGain > luckyBoxStats.maxGold) {
                    luckyBoxStats.maxGold = goldGain;
                    if (typeof saveAchievementData === 'function') {
                        saveAchievementData();
                    }
                    if (typeof checkAchievements === 'function') {
                        setTimeout(function() {
                            checkAchievements();
                        }, 300);
                    }
                }
            }
            
            if (typeof showMessage === 'function') {
                showMessage('🎰 幸运盒子开出 🪙 ' + goldGain + ' 金币！', false);
            }
            showLuckyBoxResult(goldGain);
            break;

        case 'energy_box':
            if (typeof ENERGY_TYPES !== 'undefined' && typeof energies !== 'undefined') {
                var randomIndex = Math.floor(Math.random() * ENERGY_TYPES.length);
                var energy = ENERGY_TYPES[randomIndex];
                energies[energy.id] = (energies[energy.id] || 0) + 1;
                if (typeof showMessage === 'function') {
                    showMessage('🎁 获得 ' + energy.name + ' x1！', false);
                }
            }
            break;

        default:
            if (typeof showMessage === 'function') {
                showMessage('未知道具', true);
            }
            playerBag[itemId] += 1;
            savePlayerBag();
            updateBagCount();
            return false;
    }

    if (typeof refreshUI === 'function') refreshUI();
    if (typeof saveGame === 'function') saveGame();
    renderShopUI();
    return true;
}

function getBagItemCount(itemId) {
    return playerBag[itemId] || 0;
}

// ============================================================
// 绑定事件
// ============================================================
function bindShopEvents() {
    var closeBtn = document.getElementById('closeShopModalBtn');
    if (closeBtn) {
        closeBtn.onclick = closeShop;
    }
    
    var signBtn = document.getElementById('signInBtn');
    if (signBtn) {
        signBtn.onclick = function() {
            doSignIn();
        };
    }
    
    document.querySelectorAll('.shop-buy-btn').forEach(function(btn) {
        btn.onclick = function() {
            var itemId = this.dataset.item;
            purchaseItem(itemId);
        };
    });
}

// ============================================================
// 打开商城（增强版）
// ============================================================
function openShop() {
    // ===== 检查每日重置 =====
    var wasReset = checkDailyReset();
    
    // 如果刚重置，显示提示
    if (wasReset) {
        if (typeof showMessage === 'function') {
            showMessage('🔄 商城库存已刷新！', false);
        }
        // 清除红点（用户已打开商城查看）
        clearShopRefreshBadge();
    }
    
    if (!document.getElementById('shopModal')) {
        createShopModal();
    } else {
        bindShopEvents();
    }
    renderShopUI();
    updateBagCount();
    showShopModal();
}

function showShopModal() {
    var modal = document.getElementById('shopModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
        renderShopUI();
        updateBagCount();
    }
}

function closeShop() {
    var modal = document.getElementById('shopModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }
}

// ============================================================
// 渲染UI
// ============================================================

function renderShopUI() {
    var goldEl = document.getElementById('shopGoldAmount');
    if (goldEl) {
        goldEl.textContent = Math.floor(typeof gold !== 'undefined' ? gold : 0);
    }

    updateBagCount();

    var status = getSignInStatus();
    var statusEl = document.getElementById('signInStatus');
    if (statusEl) {
        statusEl.textContent = '已连续签到 ' + status.consecutiveDays + ' 天';
    }

    for (var i = 1; i <= 7; i++) {
        var el = document.getElementById('signDay' + i);
        if (el) {
            el.className = '';
            el.style.textAlign = 'center';
            el.style.fontSize = '0.9rem';
            el.style.background = '#f5ede4';
            el.style.borderRadius = '8px';
            el.style.padding = '4px 0';
            el.style.border = '2px solid #e7c29e';

            if (i <= status.consecutiveDays) {
                el.style.background = '#d4edda';
                el.style.borderColor = '#28a745';
                el.style.opacity = '0.7';
                el.textContent = '✅';
            } else if (i === status.consecutiveDays + 1 && !status.signedToday) {
                el.style.borderColor = '#e7a05e';
                el.style.boxShadow = '0 0 0 2px #ffb347';
                el.textContent = SIGN_IN_REWARDS[i - 1].label;
            } else {
                el.style.opacity = '0.5';
                el.textContent = SIGN_IN_REWARDS[i - 1].label;
            }
        }
    }

    var signBtn = document.getElementById('signInBtn');
    if (signBtn) {
        signBtn.disabled = status.signedToday;
        signBtn.textContent = status.signedToday ? '✅ 已签到' : '签到领取';
        if (status.signedToday) {
            signBtn.style.background = '#ccc';
        } else {
            signBtn.style.background = '#e7a05e';
        }
    }

    for (var id in SHOP_ITEMS) {
        var stockEl = document.getElementById('shopStock_' + id);
        if (stockEl) {
            var stock = shopState.inventory[id] || 0;
            stockEl.textContent = stock;
        }
        var btns = document.querySelectorAll('.shop-buy-btn[data-item="' + id + '"]');
        btns.forEach(function(btn) {
            var stock = shopState.inventory[id] || 0;
            var price = SHOP_ITEMS[id].price;
            var goldAmount = typeof gold !== 'undefined' ? gold : 0;
            btn.disabled = stock <= 0 || goldAmount < price;
            if (stock <= 0) {
                btn.textTitle = '已售罄';
                btn.textContent = '已售罄';
                btn.style.background = '#ccc';
            } else if (goldAmount < price) {
                btn.textContent = '金币不足';
                btn.style.background = '#d9534f';
            } else {
                btn.textContent = '购买';
                btn.style.background = '#6f9e3f';
            }
        });
    }
}

// ============================================================
// 商城HTML内容
// ============================================================

function getShopHTML() {
    return `
<div id="shopModal" class="modal hidden">
    <div class="shop-modal-content" style="max-width:500px;width:95%;background:#fffaf0;border-radius:48px;padding:24px;max-height:90vh;overflow-y:auto;position:relative;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3 style="margin:0;">🏪 商城</h3>
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="font-size:0.7rem;color:#a56b3a;">🎒 <span id="bagCount">0</span></span>
                <button id="closeShopModalBtn" style="background:#c98f5e;border:none;border-radius:30px;padding:4px 14px;cursor:pointer;font-size:0.8rem;">关闭</button>
            </div>
        </div>

        <div style="text-align:right;font-size:0.85rem;font-weight:bold;color:#5a2e1c;margin-bottom:12px;background:#f5ede4;padding:4px 14px;border-radius:20px;display:inline-block;float:right;">
            🪙 <span id="shopGoldAmount">0</span>
        </div>
        <div style="clear:both;"></div>

        <!-- 每日签到 -->
        <div style="background:#f8f0e6;border-radius:24px;padding:16px 18px;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <div style="font-weight:bold;font-size:1rem;color:#5a2e1c;">📅 每日签到</div>
                <div style="font-size:0.7rem;color:#a56b3a;" id="signInStatus">已连续签到 0 天</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px;">
                <div style="text-align:center;font-size:0.55rem;color:#a56b3a;">D1</div>
                <div style="text-align:center;font-size:0.55rem;color:#a56b3a;">D2</div>
                <div style="text-align:center;font-size:0.55rem;color:#a56b3a;">D3</div>
                <div style="text-align:center;font-size:0.55rem;color:#a56b3a;">D4</div>
                <div style="text-align:center;font-size:0.55rem;color:#a56b3a;">D5</div>
                <div style="text-align:center;font-size:0.55rem;color:#a56b3a;">D6</div>
                <div style="text-align:center;font-size:0.55rem;color:#a56b3a;">D7</div>
                <div id="signDay1" style="text-align:center;font-size:0.9rem;background:#f5ede4;border-radius:8px;padding:4px 0;border:2px solid #e7c29e;">🫘10</div>
                <div id="signDay2" style="text-align:center;font-size:0.9rem;background:#f5ede4;border-radius:8px;padding:4px 0;border:2px solid #e7c29e;">🪙5</div>
                <div id="signDay3" style="text-align:center;font-size:0.9rem;background:#f5ede4;border-radius:8px;padding:4px 0;border:2px solid #e7c29e;">🫘15</div>
                <div id="signDay4" style="text-align:center;font-size:0.9rem;background:#f5ede4;border-radius:8px;padding:4px 0;border:2px solid #e7c29e;">🪙8</div>
                <div id="signDay5" style="text-align:center;font-size:0.9rem;background:#f5ede4;border-radius:8px;padding:4px 0;border:2px solid #e7c29e;">🫘20</div>
                <div id="signDay6" style="text-align:center;font-size:0.9rem;background:#f5ede4;border-radius:8px;padding:4px 0;border:2px solid #e7c29e;">🪙12</div>
                <div id="signDay7" style="text-align:center;font-size:0.9rem;background:#f5ede4;border-radius:8px;padding:4px 0;border:2px solid #e7c29e;">🎁</div>
            </div>
            <div style="display:flex;justify-content:center;align-items:center;">
                <button id="signInBtn" style="background:#e7a05e;border:none;border-radius:30px;padding:8px 40px;color:white;font-weight:bold;cursor:pointer;font-size:0.9rem;">签到领取</button>
            </div>
        </div>

        <!-- 道具商店 -->
        <div style="font-weight:bold;font-size:1rem;color:#5a2e1c;margin-bottom:10px;">🛒 道具商店</div>
        <div style="font-size:0.65rem;color:#a56b3a;margin-bottom:10px;">每天凌晨4点自动补货</div>

        <div style="display:flex;flex-direction:column;gap:8px;">
            <!-- 加速券 -->
            <div style="background:#f5ede4;border-radius:16px;padding:10px 14px;display:flex;align-items:center;gap:12px;border:1px solid #e7c29e;">
                <div style="font-size:1.8rem;flex-shrink:0;">⏩</div>
                <div style="flex:1;">
                    <div style="font-weight:bold;font-size:0.85rem;color:#5a2e1c;">加速券</div>
                    <div style="font-size:0.65rem;color:#a56b3a;">加速工坊929秒 <span style="color:#6f9e3f;">🎒</span></div>
                </div>
                <div style="text-align:right;flex-shrink:0;">
                    <div style="font-size:0.7rem;color:#7b4a2a;font-weight:bold;">🪙200</div>
                    <div style="font-size:0.55rem;color:#a56b3a;">今日库存: <span id="shopStock_speed_up">1</span></div>
                </div>
                <button class="shop-buy-btn" data-item="speed_up" style="background:#6f9e3f;border:none;border-radius:30px;padding:4px 16px;color:white;font-weight:bold;cursor:pointer;font-size:0.7rem;flex-shrink:0;">购买</button>
            </div>
            <!-- 刷新券 -->
            <div style="background:#f5ede4;border-radius:16px;padding:10px 14px;display:flex;align-items:center;gap:12px;border:1px solid #e7c29e;">
                <div style="font-size:1.8rem;flex-shrink:0;">🔄</div>
                <div style="flex:1;">
                    <div style="font-weight:bold;font-size:0.85rem;color:#5a2e1c;">刷新券</div>
                    <div style="font-size:0.65rem;color:#a56b3a;">刷新每日订单 <span style="color:#6f9e3f;">🎒</span></div>
                </div>
                <div style="text-align:right;flex-shrink:0;">
                    <div style="font-size:0.7rem;color:#7b4a2a;font-weight:bold;">🪙150</div>
                    <div style="font-size:0.55rem;color:#a56b3a;">今日库存: <span id="shopStock_refresh">1</span></div>
                </div>
                <button class="shop-buy-btn" data-item="refresh" style="background:#6f9e3f;border:none;border-radius:30px;padding:4px 16px;color:white;font-weight:bold;cursor:pointer;font-size:0.7rem;flex-shrink:0;">购买</button>
            </div>
            <!-- 幸运盒子 -->
            <div style="background:#f5ede4;border-radius:16px;padding:10px 14px;display:flex;align-items:center;gap:12px;border:1px solid #e7c29e;position:relative;">
                <div style="font-size:1.8rem;flex-shrink:0;">🎰</div>
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:bold;font-size:0.85rem;color:#5a2e1c;">幸运盒子</div>
                    <div style="font-size:0.65rem;color:#a56b3a;">随机获得10~99金币 <span style="color:#e7a05e;">⚡</span></div>
                </div>
                <div id="luckyBoxResultArea" style="flex-shrink:0;min-width:60px;text-align:center;font-weight:bold;font-size:0.85rem;color:#d4a017;transition:all 0.3s;"></div>
                <div style="text-align:right;flex-shrink:0;">
                    <div style="font-size:0.7rem;color:#7b4a2a;font-weight:bold;">🪙50</div>
                    <div style="font-size:0.55rem;color:#a56b3a;">今日库存: <span id="shopStock_lucky_box">3</span></div>
                </div>
                <button class="shop-buy-btn" data-item="lucky_box" style="background:#6f9e3f;border:none;border-radius:30px;padding:4px 16px;color:white;font-weight:bold;cursor:pointer;font-size:0.7rem;flex-shrink:0;">购买</button>
            </div>
            <!-- 经验书 -->
            <div style="background:#f5ede4;border-radius:16px;padding:10px 14px;display:flex;align-items:center;gap:12px;border:1px solid #e7c29e;">
                <div style="font-size:1.8rem;flex-shrink:0;">📖</div>
                <div style="flex:1;">
                    <div style="font-weight:bold;font-size:0.85rem;color:#5a2e1c;">经验书</div>
                    <div style="font-size:0.65rem;color:#a56b3a;">立即获得20经验 <span style="color:#e7a05e;">⚡</span></div>
                </div>
                <div style="text-align:right;flex-shrink:0;">
                    <div style="font-size:0.7rem;color:#7b4a2a;font-weight:bold;">🪙60</div>
                    <div style="font-size:0.55rem;color:#a56b3a;">今日库存: <span id="shopStock_exp_book">2</span></div>
                </div>
                <button class="shop-buy-btn" data-item="exp_book" style="background:#6f9e3f;border:none;border-radius:30px;padding:4px 16px;color:white;font-weight:bold;cursor:pointer;font-size:0.7rem;flex-shrink:0;">购买</button>
            </div>
            <!-- 豆子礼包 -->
            <div style="background:#f5ede4;border-radius:16px;padding:10px 14px;display:flex;align-items:center;gap:12px;border:1px solid #e7c29e;">
                <div style="font-size:1.8rem;flex-shrink:0;">🫘</div>
                <div style="flex:1;">
                    <div style="font-weight:bold;font-size:0.85rem;color:#5a2e1c;">豆子礼包</div>
                    <div style="font-size:0.65rem;color:#a56b3a;">立即获得29颗豆子 <span style="color:#e7a05e;">⚡</span></div>
                </div>
                <div style="text-align:right;flex-shrink:0;">
                    <div style="font-size:0.7rem;color:#7b4a2a;font-weight:bold;">🪙10</div>
                    <div style="font-size:0.55rem;color:#a56b3a;">今日库存: <span id="shopStock_beans_pack">5</span></div>
                </div>
                <button class="shop-buy-btn" data-item="beans_pack" style="background:#6f9e3f;border:none;border-radius:30px;padding:4px 16px;color:white;font-weight:bold;cursor:pointer;font-size:0.7rem;flex-shrink:0;">购买</button>
            </div>
            <!-- 能量宝箱 -->
            <div style="background:#f5ede4;border-radius:16px;padding:10px 14px;display:flex;align-items:center;gap:12px;border:1px solid #e7c29e;">
                <div style="font-size:1.8rem;flex-shrink:0;">🎁</div>
                <div style="flex:1;">
                    <div style="font-weight:bold;font-size:0.85rem;color:#5a2e1c;">能量宝箱</div>
                    <div style="font-size:0.65rem;color:#a56b3a;">随机获得1个能量 <span style="color:#6f9e3f;">🎒</span></div>
                </div>
                <div style="text-align:right;flex-shrink:0;">
                    <div style="font-size:0.7rem;color:#7b4a2a;font-weight:bold;">🪙929</div>
                    <div style="font-size:0.55rem;color:#a56b3a;">今日库存: <span id="shopStock_energy_box">1</span></div>
                </div>
                <button class="shop-buy-btn" data-item="energy_box" style="background:#6f9e3f;border:none;border-radius:30px;padding:4px 16px;color:white;font-weight:bold;cursor:pointer;font-size:0.7rem;flex-shrink:0;">购买</button>
            </div>
        </div>
        <div style="margin-top:12px;font-size:0.55rem;color:#a56b3a;text-align:center;border-top:1px solid #f1dbb2;padding-top:8px;">
            💡 每天凌晨4点自动补货 · 所有道具即买即用
        </div>
    </div>
</div>
    `;
}

// ============================================================
// 清除商城数据
// ============================================================

function clearShopData() {
    console.log('🗑️ 开始清除商城数据...');
    
    localStorage.removeItem('shop_data');
    localStorage.removeItem('player_bag');
    
    shopState = {
        signIn: {
            lastDate: null,
            consecutiveDays: 0,
            signedToday: false
        },
        inventory: {},
        resetDate: null
    };
    
    for (var id in SHOP_ITEMS) {
        shopState.inventory[id] = SHOP_ITEMS[id].maxStock;
    }
    
    for (var id in playerBag) {
        playerBag[id] = 0;
    }
    
    renderShopUI();
    updateBagCount();
    
    console.log('🗑️ 商城数据已彻底清除，签到已重置为0天');
}

// ============================================================
// 暴露全局接口
// ============================================================

window.SHOP_ITEMS = SHOP_ITEMS;
window.shopState = shopState;
window.playerBag = playerBag;
window.initShop = initShop;
window.openShop = openShop;
window.closeShop = closeShop;
window.doSignIn = doSignIn;
window.purchaseItem = purchaseItem;
window.renderShopUI = renderShopUI;
window.clearShopData = clearShopData;
window.useBagItem = useBagItem;
window.getBagItemCount = getBagItemCount;
window.showLuckyBoxResult = showLuckyBoxResult;
window.checkDailyReset = checkDailyReset;
window.clearShopRefreshBadge = clearShopRefreshBadge;

console.log('🏪 商城系统加载完成（凌晨4点补货版）');

// ============================================================
// 自动初始化
// ============================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initShop, 500);
    });
} else {
    setTimeout(initShop, 500);
}