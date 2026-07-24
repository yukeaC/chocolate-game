// js/utils.js

// ============================================
// 自动挂机相关
// ============================================
function getAutoBeanInterval() {
    // ===== 添加防御性检查 =====
    if (typeof workaholicLevel === 'undefined') {
        console.warn('⚠️ workaholicLevel 未定义，使用默认值 0');
        workaholicLevel = 0;
    }
    // ===== 防御性检查结束 =====
    
    var interval = WORKAHOLIC_CONFIG.baseInterval - workaholicLevel * WORKAHOLIC_CONFIG.intervalReductionPerLevel;
    return Math.max(1, interval);
}

function getAutoBeanIntervalForLevel(level) {
    // ===== 添加防御性检查 =====
    if (typeof workaholicLevel === 'undefined') {
        console.warn('⚠️ workaholicLevel 未定义，使用默认值 0');
        workaholicLevel = 0;
    }
    // ===== 防御性检查结束 =====
    
    var interval = WORKAHOLIC_CONFIG.baseInterval - level * WORKAHOLIC_CONFIG.intervalReductionPerLevel;
    return Math.max(1, interval);
}



let msgTimer = null;

// ============================================
// 经验相关
// ============================================
function getExpNeeded(currentLevel) {
    return 100 + Math.pow(currentLevel - 1, 2) * 4;
}

function getMakeExp(prod) {
    const base = Math.floor(prod.basePrice / 10) + Math.floor(prod.timeSec / 30) + 1;
    return Math.max(1, base);
}

function getSellExp(revenue) {
    return Math.max(1, Math.floor(revenue / 20));
}

// ============================================
// 价格和时间
// ============================================
function getActualBeanCost(baseCost) { return baseCost; }
function getActualPrice(basePrice) { return basePrice + miaoBargainLevel * 2; }

// 自动化生产：每级 -3%，满级 -30%
function getActualTime(baseTime) {
    let reduced = baseTime;
    for (let i = 0; i < productionSpeedLevel; i++) {
        reduced = Math.floor(reduced * 0.97);
    }
    return Math.max(5, reduced);
}

// ============================================
// 升级成本
// ============================================
function getMiaoUpgradeCost() {
    if (miaoBargainLevel >= 10) return Infinity;
    return 50 + miaoBargainLevel * 20;
}

function getSpeedUpgradeCost() {
    if (productionSpeedLevel >= 10) return Infinity;
    return 60 + productionSpeedLevel * 25;
}

function getWorkaholicUpgradeCost() {
    if (workaholicLevel >= WORKAHOLIC_CONFIG.maxLevel) return Infinity;
    let cost = WORKAHOLIC_CONFIG.upgradeBaseCost * Math.pow(1.4, workaholicLevel);
    return Math.floor(cost);
}

function getExpBoostUpgradeCost() {
    if (expBoostLevel >= EXP_BOOST_CONFIG.maxLevel) return Infinity;
    return EXP_BOOST_CONFIG.upgradeBaseCost + expBoostLevel * EXP_BOOST_CONFIG.costMultiplier;
}

function getSlotUnlockCost(index) { return index === 0 ? 0 : 400 + (index-1) * 300; }

// ============================================
// 经验加成
// ============================================
function getActualExpBoost() {
    return 1 + expBoostLevel * EXP_BOOST_CONFIG.boostPerLevel;
}

// ============================================
// 自动挂机相关
// ============================================
function getAutoBeanInterval() {
    let interval = WORKAHOLIC_CONFIG.baseInterval - workaholicLevel * WORKAHOLIC_CONFIG.intervalReductionPerLevel;
    return Math.max(1, interval);
}

function getAutoBeanIntervalForLevel(level) {
    let interval = WORKAHOLIC_CONFIG.baseInterval - level * WORKAHOLIC_CONFIG.intervalReductionPerLevel;
    return Math.max(1, interval);
}

// ============================================
// 消息提示
// ============================================
function showMessage(msg, isErr = false) {
    const msgDiv = document.getElementById('gameMsg');
    if (!msgDiv) return;
    if (msgTimer) clearTimeout(msgTimer);
    if (isErr && typeof soundError === 'function') {
        soundError();
    }
    msgDiv.innerHTML = isErr ? `⚠️ ${msg}` : `✨ ${msg}`;
    msgTimer = setTimeout(() => {
        if (msgDiv) msgDiv.innerHTML = '💬 点击空闲工坊选择产品，完成后点击工坊收取';
        msgTimer = null;
    }, 2500);
}

function showLightToast(msg) {
    let toast = document.querySelector('.light-toast');
    if (toast) toast.remove();
    toast = document.createElement('div');
    toast.className = 'light-toast';
    toast.innerText = msg;
    // 确保在最顶层
    toast.style.zIndex = '99999';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}


// ============================================
// 昵称生成
// ============================================
function generateRandomNickname() {
    const randomNum = Math.floor(Math.random() * 100000000);
    return `米-${randomNum.toString().padStart(8, '0')}`;
}

// ============================================
// 日期
// ============================================
function getTodayDateStr() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

// ============================================
// 导出全局接口
// ============================================
window.getExpNeeded = getExpNeeded;
window.getMakeExp = getMakeExp;
window.getSellExp = getSellExp;
window.getActualBeanCost = getActualBeanCost;
window.getActualPrice = getActualPrice;
window.getActualTime = getActualTime;
window.getMiaoUpgradeCost = getMiaoUpgradeCost;
window.getSpeedUpgradeCost = getSpeedUpgradeCost;
window.getWorkaholicUpgradeCost = getWorkaholicUpgradeCost;
window.getExpBoostUpgradeCost = getExpBoostUpgradeCost;
window.getActualExpBoost = getActualExpBoost;
window.getSlotUnlockCost = getSlotUnlockCost;
window.getAutoBeanInterval = getAutoBeanInterval;
window.getAutoBeanIntervalForLevel = getAutoBeanIntervalForLevel;
window.showMessage = showMessage;
window.showLightToast = showLightToast;
window.generateRandomNickname = generateRandomNickname;
window.getTodayDateStr = getTodayDateStr;