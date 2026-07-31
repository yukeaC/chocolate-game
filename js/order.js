// js/order.js

let isCompletingOrder = false;
let orderModalTimer = null;

// ============================================
// 使用刷新券
// ============================================

function useRefreshTicket() {
    if (typeof playerBag === 'undefined' || playerBag.refresh <= 0) {
        showMessage('没有刷新券，去商城购买', true);
        return;
    }
    
    playerBag.refresh -= 1;
    if (typeof savePlayerBag === 'function') {
        savePlayerBag();
    }
    if (typeof updateBagCount === 'function') {
        updateBagCount();
    }
    
    if (typeof forceRefreshOrders === 'function') {
        forceRefreshOrders();
        renderOrders();
        updateRefreshButton();
        showMessage('🔄 订单已刷新！', false);
        if (typeof soundSwitch === 'function') soundSwitch();
        if (autoSaveEnabled && typeof saveGame === 'function') saveGame();
    } else {
        showMessage('刷新功能暂不可用', true);
        playerBag.refresh += 1;
        if (typeof savePlayerBag === 'function') {
            savePlayerBag();
        }
        if (typeof updateBagCount === 'function') {
            updateBagCount();
        }
    }
}

// ============================================
// 更新刷新按钮状态
// ============================================

function updateRefreshButton() {
    var refreshBtn = document.getElementById('refreshOrderBtn');
    if (refreshBtn) {
        var hasRefresh = (typeof playerBag !== 'undefined' && playerBag.refresh > 0);
        if (hasRefresh) {
            refreshBtn.style.display = 'inline-block';
            refreshBtn.disabled = false;
            refreshBtn.textContent = '🔄 刷新订单 (' + playerBag.refresh + ')';
            refreshBtn.style.background = '#6f9e3f';
        } else {
            refreshBtn.style.display = 'none';
        }
    }
}

// ============================================
// 更新订单倒计时显示
// ============================================

function updateOrderTimerDisplay() {
    var timerEl = document.getElementById('orderTimerDisplay');
    if (!timerEl) return;
    
    var now = new Date();
    var nextRefresh = getNextRefreshTime();
    var diffMs = nextRefresh - now;
    
    if (diffMs <= 0) {
        timerEl.textContent = '🕒 00:00:00 后订单刷新';
        return;
    }
    
    var h = Math.floor(diffMs / 3600000);
    var m = Math.floor((diffMs % 3600000) / 60000);
    var s = Math.floor((diffMs % 60000) / 1000);
    timerEl.textContent = '🕒 ' + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + ' 后订单刷新';
}

// ============================================
// 完成订单
// ============================================

function completeOrderByProduct(productId, requiredQty, rewardGold, rewardExp, productName) {
    if (isCompletingOrder) {
        showMessage('正在处理中，请稍候...', true);
        return;
    }
    
    var currentQty = inventory[productId] || 0;
    if (currentQty < requiredQty) {
        showMessage('库存不足，需要 ' + requiredQty + ' 个 ' + productName + '，当前库存 ' + currentQty, true);
        return;
    }
    
    isCompletingOrder = true;
    
    try {
        inventory[productId] -= requiredQty;
        gold += rewardGold;
        totalEarned += rewardGold;
        if (typeof addExp === 'function') addExp(rewardExp);
        
        // ★★★ 新增：累加订单完成总数（用于成就） ★★★
        totalOrdersCompleted = (totalOrdersCompleted || 0) + 1;
        
        showMessage('✅ 完成订单：' + productName + ' x' + requiredQty + '，获得 ' + rewardGold + ' 金币 + ' + rewardExp + ' 经验！', false);
        if (typeof soundOrderComplete === 'function') soundOrderComplete();
        
        var order = currentOrders.find(function(o) { return o.id === productId && o.quantity === requiredQty && !o.completed; });
        if (order) order.completed = true;
        
        updateOrderStatusDisplay();
        persistOrders();

        // ===== 挑战塔：订单完成 =====
        if (typeof onTowerOrderCompleted === 'function') onTowerOrderCompleted();
        // ===== 挑战塔结束 =====
        
        var orderModal = document.getElementById('orderModal');
        if (orderModal && !orderModal.classList.contains('hidden')) {
            renderOrders();
        }
        refreshUI();
        if (autoSaveEnabled && typeof saveGame === 'function') saveGame();
        
    } catch (err) {
        console.error('完成订单失败:', err);
        showMessage('操作失败，请重试', true);
    } finally {
        isCompletingOrder = false;
    }
}

// ============================================
// 日期工具函数
// ============================================

function getTodayDateStr() {
    var today = new Date();
    return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
}

function getNextRefreshTime() {
    var now = new Date();
    var next = new Date(now);
    next.setHours(4, 0, 0, 0);
    if (now >= next) {
        next.setDate(next.getDate() + 1);
    }
    return next;
}

// ============================================================
// 改用时间戳存储上次刷新时间
// ============================================================

function getLastRefreshTimestamp() {
    var raw = localStorage.getItem('last_refresh_date');
    if (!raw) {
        return 0;
    }
    
    var timestamp = parseInt(raw);
    
    // 兼容旧存档：如果是日期字符串，转换为时间戳
    if (isNaN(timestamp) || raw.indexOf('-') !== -1) {
        var parts = raw.split('-');
        if (parts.length === 3) {
            var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            d.setHours(4, 0, 0, 0);
            var newTimestamp = d.getTime();
            localStorage.setItem('last_refresh_date', String(newTimestamp));
            console.log('🔄 已将旧日期格式转换为时间戳:', newTimestamp);
            return newTimestamp;
        }
        return 0;
    }
    
    return timestamp;
}

function setLastRefreshTimestamp(timestamp) {
    localStorage.setItem('last_refresh_date', String(timestamp));
}

// ============================================================
// 订单刷新（使用时间戳比较）
// ============================================================

function refreshOrdersIfNeeded() {
    var now = new Date();
    var today4am = new Date();
    today4am.setHours(4, 0, 0, 0);
    var today4amTimestamp = today4am.getTime();
    
    var lastRefresh = getLastRefreshTimestamp();
    
    // 如果当前时间 >= 今天凌晨4点 且 上次刷新时间 < 今天凌晨4点 → 触发刷新
    if (now.getTime() >= today4amTimestamp && lastRefresh < today4amTimestamp) {
        currentOrders = generateFreshOrders();
        localStorage.setItem('order_date', getTodayDateStr());
        localStorage.setItem('savedOrders', JSON.stringify(currentOrders));
        setLastRefreshTimestamp(now.getTime());
        updateOrderStatusDisplay();
        
        var orderModal = document.getElementById('orderModal');
        if (orderModal && !orderModal.classList.contains('hidden') && typeof renderOrders === 'function') {
            renderOrders();
        }
        showMessage('📋 新一天的订单已刷新！', false);
        return true;
    }
    return false;
}

function forceRefreshOrders() {
    var todayStr = getTodayDateStr();
    currentOrders = generateFreshOrders();
    localStorage.setItem('order_date', todayStr);
    localStorage.setItem('savedOrders', JSON.stringify(currentOrders));
    setLastRefreshTimestamp(Date.now());
    updateOrderStatusDisplay();
    var orderModal = document.getElementById('orderModal');
    if (orderModal && !orderModal.classList.contains('hidden') && typeof renderOrders === 'function') {
        renderOrders();
    }
    showMessage('📋 订单已手动刷新！', false);
}

// ============================================
// 订单刷新计时器
// ============================================

function updateOrderRefreshTimer() {
    updateOrderTimerDisplay();
    updateRefreshButton();
}

// ============================================
// 生成订单
// ============================================

function generateFreshOrders() {
    var orders = [];
    var productIds = Object.keys(PRODUCTS);
    for (var i = 0; i < ORDER_COUNT; i++) {
        var randomId = productIds[Math.floor(Math.random() * productIds.length)];
        var product = PRODUCTS[randomId];
        var quantity = Math.floor(Math.random() * 5) + 1;
        var rewardGold = product.basePrice * quantity * 2;
        var rewardExp = Math.floor(quantity * product.timeSec / 10) + 5;
        orders.push({
            id: randomId,
            name: product.name,
            quantity: quantity,
            rewardGold: rewardGold,
            rewardExp: rewardExp,
            completed: false
        });
    }
    return orders;
}

// ============================================
// 加载订单
// ============================================

function loadOrInitOrders() {
    var savedDate = localStorage.getItem('order_date');
    var savedOrders = localStorage.getItem('savedOrders');
    var today = getTodayDateStr();
    
    if (savedDate === today && savedOrders) {
        try {
            currentOrders = JSON.parse(savedOrders);
        } catch(e) {
            currentOrders = generateFreshOrders();
        }
    } else {
        currentOrders = generateFreshOrders();
        localStorage.setItem('order_date', today);
        localStorage.setItem('savedOrders', JSON.stringify(currentOrders));
    }
    updateOrderStatusDisplay();
    
    // 兼容旧存档
    getLastRefreshTimestamp();
    
    // 定时器：每小时检查一次
    if (window.orderDateTimer) clearInterval(window.orderDateTimer);
    window.orderDateTimer = setInterval(function() {
        refreshOrdersIfNeeded();
    }, 3600000);
}

function persistOrders() {
    localStorage.setItem('savedOrders', JSON.stringify(currentOrders));
    if (autoSaveEnabled && typeof saveGame === 'function') saveGame();
}

// ============================================
// 更新主界面订单状态
// ============================================

function updateOrderStatusDisplay() {
    var orderStatusSpan = document.getElementById('orderStatus');
    if (orderStatusSpan) {
        var activeCount = currentOrders.filter(function(o) { return !o.completed; }).length;
        if (activeCount === 0) {
            orderStatusSpan.innerText = '已完成';
        } else {
            orderStatusSpan.innerText = activeCount + ' 个待完成';
        }
    }
}

// ============================================
// 渲染订单列表
// ============================================

function renderOrders() {
    var orderListDiv = document.getElementById('orderList');
    if (!orderListDiv) return;
    orderListDiv.innerHTML = '';
    var activeOrders = currentOrders.filter(function(o) { return !o.completed; });
    if (activeOrders.length === 0) {
        orderListDiv.innerHTML = '<div class="order-placeholder">🎉 所有订单已完成！明天再来吧 🎉</div>';
        return;
    }
    for (var i = 0; i < activeOrders.length; i++) {
        var order = activeOrders[i];
        var currentQty = inventory[order.id] || 0;
        var canComplete = currentQty >= order.quantity;
        var orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = 
            '<div class="order-info">' +
                '<div class="order-desc">' + order.name + ' x ' + order.quantity + '</div>' +
                '<div class="order-reward">💰 +' + order.rewardGold + ' 金币 & ✨ +' + order.rewardExp + ' 经验</div>' +
            '</div>' +
            '<button class="order-complete-btn ' + (canComplete ? 'available' : '') + '" data-id="' + order.id + '" data-qty="' + order.quantity + '" data-gold="' + order.rewardGold + '" data-exp="' + order.rewardExp + '" data-name="' + order.name + '">完成订单</button>';
        orderListDiv.appendChild(orderItem);
    }
    document.querySelectorAll('.order-complete-btn').forEach(function(btn) {
        btn.onclick = function() {
            var productId = this.dataset.id;
            var requiredQty = parseInt(this.dataset.qty);
            var rewardGold = parseInt(this.dataset.gold);
            var rewardExp = parseInt(this.dataset.exp);
            var productName = this.dataset.name;
            completeOrderByProduct(productId, requiredQty, rewardGold, rewardExp, productName);
        };
    });
}

// ============================================
// 打开订单模态框
// ============================================

function openOrderModal() {
    refreshOrdersIfNeeded();
    renderOrders();
    
    var orderNote = document.querySelector('.order-note');
    if (orderNote) {
        orderNote.innerHTML = '';
        
        var container = document.createElement('div');
        container.style.cssText = 'display:flex;justify-content:center;align-items:center;position:relative;width:100%;';
        
        var timerSpan = document.createElement('span');
        timerSpan.id = 'orderTimerDisplay';
        timerSpan.style.cssText = 'font-size:0.65rem;color:#a56b3a;text-align:center;';
        timerSpan.textContent = '🕒 00:00:00 后订单刷新';
        container.appendChild(timerSpan);
        
        var hasRefresh = (typeof playerBag !== 'undefined' && playerBag.refresh > 0);
        var refreshBtn = document.createElement('button');
        refreshBtn.id = 'refreshOrderBtn';
        refreshBtn.style.cssText = 
            'position:absolute;right:0;background:#6f9e3f;border:none;border-radius:20px;padding:3px 16px;' +
            'color:white;font-weight:bold;cursor:pointer;font-size:0.7rem;' +
            (hasRefresh ? '' : 'display:none;');
        refreshBtn.textContent = hasRefresh ? '🔄 刷新订单 (' + playerBag.refresh + ')' : '🔄 刷新订单';
        refreshBtn.onclick = function() {
            if (typeof useRefreshTicket === 'function') {
                useRefreshTicket();
            }
        };
        container.appendChild(refreshBtn);
        
        orderNote.appendChild(container);
        
        updateOrderTimerDisplay();
    }
    
    if (orderModalTimer) clearInterval(orderModalTimer);
    orderModalTimer = setInterval(function() {
        var modal = document.getElementById('orderModal');
        if (modal && !modal.classList.contains('hidden')) {
            updateOrderTimerDisplay();
            updateRefreshButton();
        } else {
            if (orderModalTimer) {
                clearInterval(orderModalTimer);
                orderModalTimer = null;
            }
        }
    }, 1000);
    
    var orderModal = document.getElementById('orderModal');
    if (orderModal) {
        orderModal.classList.remove('hidden');
        document.body.classList.add('modal-open');
    }
}

// ============================================
// 关闭订单模态框
// ============================================

function closeOrderModal() {
    var orderModal = document.getElementById('orderModal');
    if (orderModal) {
        orderModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }
    if (orderModalTimer) {
        clearInterval(orderModalTimer);
        orderModalTimer = null;
    }
}

// ============================================
// 页面关闭清理
// ============================================

window.addEventListener('beforeunload', function() {
    if (window.orderDateTimer) clearInterval(window.orderDateTimer);
    if (orderModalTimer) clearInterval(orderModalTimer);
});

// ============================================
// 导出全局函数
// ============================================

window.useRefreshTicket = useRefreshTicket;
window.updateRefreshButton = updateRefreshButton;
window.updateOrderTimerDisplay = updateOrderTimerDisplay;
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;
window.renderOrders = renderOrders;
window.updateOrderStatusDisplay = updateOrderStatusDisplay;
window.forceRefreshOrders = forceRefreshOrders;
window.refreshOrdersIfNeeded = refreshOrdersIfNeeded;
window.completeOrderByProduct = completeOrderByProduct;
window.generateFreshOrders = generateFreshOrders;
window.persistOrders = persistOrders;
window.getTodayDateStr = getTodayDateStr;