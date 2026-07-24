// js/main.js

console.log('main.js 开始执行');

let keyboardEventsBound = false;
let autoBeanTimer = null;

// ============================================
// 升级函数
// ============================================
function upgradeMiao() {
    if (miaoBargainLevel >= 10) {
        showMessage("议价已达顶级（10级）", true);
        return;
    }
    const cost = getMiaoUpgradeCost();
    if (gold < cost) {
        showMessage(`金币不足 ${cost}，请努力赚钱！`, true);
        return;
    }
    gold -= cost;
    miaoBargainLevel++;
    showMessage(`💰 议价升级 Lv.${miaoBargainLevel}，所有产品售价提高2金币`, false);
    refreshUI();
    if (autoSaveEnabled) saveGame();
}

function upgradeSpeed() {
    if (productionSpeedLevel >= 10) {
        showMessage("生产效率已达顶级（10级）", true);
        return;
    }
    const cost = getSpeedUpgradeCost();
    if (gold < cost) {
        showMessage(`金币不足 ${cost}，请努力赚钱！`, true);
        return;
    }
    gold -= cost;
    productionSpeedLevel++;
    showMessage(`⏱️ 自动化升级 Lv.${productionSpeedLevel}，所有产品制作时间减少3%`, false);
    refreshUI();
    if (autoSaveEnabled) saveGame();
}

function upgradeWorkaholic() {
    if (workaholicLevel >= WORKAHOLIC_CONFIG.maxLevel) {
        showMessage("工作狂技能已达顶级", true);
        return;
    }
    const cost = getWorkaholicUpgradeCost();
    if (gold < cost) {
        showMessage(`金币不足 ${cost}，无法升级`, true);
        return;
    }
    gold -= cost;
    workaholicLevel++;
    showMessage(`⚡ 工作狂升级 Lv.${workaholicLevel}，挂机速度提升！`, false);
    refreshUI();
    if (autoSaveEnabled) saveGame();
    restartAutoBeanTimer();
}

function upgradeExpBoost() {
    if (expBoostLevel >= EXP_BOOST_CONFIG.maxLevel) {
        showMessage("经验加成已达顶级", true);
        return;
    }
    const cost = getExpBoostUpgradeCost();
    if (gold < cost) {
        showMessage(`金币不足 ${cost}，请努力赚钱！`, true);
        return;
    }
    gold -= cost;
    expBoostLevel++;
    const boostPercent = Math.round(expBoostLevel * EXP_BOOST_CONFIG.boostPerLevel * 100);
    showMessage(`⭐ 经验加成升级 Lv.${expBoostLevel}，经验获取+${boostPercent}%`, false);
    refreshUI();
    if (autoSaveEnabled) saveGame();
}

function exitGame() {
    if (confirm('确定要退出游戏吗？游戏进度会自动保存。')) {
        if (typeof saveGame === 'function') saveGame();
        setTimeout(() => {
            window.location.href = 'start.html';
        }, 200);
    }
}

// ============================================
// 自动挂机定时器
// ============================================
function startAutoBeanTimer() {
    if (autoBeanTimer) clearInterval(autoBeanTimer);
    const intervalSec = getAutoBeanInterval();
    if (intervalSec <= 0) return;
    autoBeanTimer = setInterval(() => {
        cocoaBeans++;
        totalBeansHarvested++;
        showMessage(`🫘 挂机获得 +1 巧克力豆 (工作狂 Lv.${workaholicLevel})`, false);
        refreshUI();
        if (autoSaveEnabled) saveGame();
    }, intervalSec * 1000);
    console.log(`挂机定时器已启动，间隔 ${intervalSec} 秒`);
}

function restartAutoBeanTimer() {
    if (autoBeanTimer) {
        clearInterval(autoBeanTimer);
        autoBeanTimer = null;
    }
    startAutoBeanTimer();
}

// ============================================
// 键盘快捷键
// ============================================
function setupKeyboardShortcuts() {
    if (keyboardEventsBound) return;
    console.log('设置键盘快捷键...');
    window.addEventListener('keydown', function(e) {
        if (e.key === 'F5') {
            e.preventDefault();
            return false;
        }
        if ((e.ctrlKey && e.key === 'r') || (e.ctrlKey && e.key === 'R')) {
            e.preventDefault();
            return false;
        }
    });
    keyboardEventsBound = true;
}

// ============================================
// 检查并领取翻牌配对游戏的奖励
// ============================================
function checkCardMatchReward() {
    try {
        var rewardStr = localStorage.getItem('cardmatch_reward_beans');
        if (rewardStr) {
            var rewardAmount = parseInt(rewardStr);
            if (rewardAmount > 0) {
                cocoaBeans += rewardAmount;
                totalBeansHarvested += rewardAmount;
                showMessage('🎉 从翻牌配对游戏获得 🫘 ' + rewardAmount + ' 颗豆子！', false);
                console.log('✅ 已领取翻牌配对奖励: +' + rewardAmount + ' 豆子');
                localStorage.removeItem('cardmatch_reward_beans');
                localStorage.removeItem('cardmatch_reward_amount');
                localStorage.removeItem('cardmatch_reward_time');
                if (typeof refreshUI === 'function') refreshUI();
                if (autoSaveEnabled) saveGame();
            }
        }
    } catch(e) {
        console.warn('检查翻牌奖励失败:', e);
    }
}

// ============================================
// 事件绑定
// ============================================
function bindEvents() {
    console.log('🔗 绑定事件...');

    // 仓库按钮
    var warehouseBtn = document.getElementById('openWarehouseBtn');
    if (warehouseBtn) {
        warehouseBtn.onclick = function() {
            console.log('📦 点击仓库按钮');
            renderWarehouseModal();
            var modal = document.getElementById('warehouseModal');
            if (modal) {
                modal.classList.remove('hidden');
                document.body.classList.add('modal-open');
            }
        };
    }

    var closeWarehouse = document.getElementById('closeWarehouseModal');
    if (closeWarehouse) {
        closeWarehouse.onclick = function() {
            var modal = document.getElementById('warehouseModal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            }
        };
    }

    // 设置面板
    var settingsToggle = document.getElementById('settingsToggleBtn');
    var settingsPanel = document.getElementById('settingsPanel');
    if (settingsToggle) {
        settingsToggle.onclick = function(e) {
            e.stopPropagation();
            if (settingsPanel) {
                settingsPanel.classList.toggle('hidden');
            }
        };
    }

    // 游戏中心按钮
    var gameCenterBtn = document.getElementById('gameCenterBtn');
    if (gameCenterBtn) {
        gameCenterBtn.onclick = function() {
            console.log('🎮 点击游戏中心按钮');
            var modal = document.getElementById('gameCenterModal');
            if (modal) {
                modal.classList.remove('hidden');
                document.body.classList.add('modal-open');
            }
        };
    }

    var closeGameCenterBtn = document.getElementById('closeGameCenterModal');
    if (closeGameCenterBtn) {
        closeGameCenterBtn.onclick = function() {
            var modal = document.getElementById('gameCenterModal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            }
        };
    }

   // 翻牌配对按钮 - 跳转到 cardmatch.html
var gameCardMatchBtn = document.getElementById('gameCardMatchBtn');
if (gameCardMatchBtn) {
    gameCardMatchBtn.onclick = function() {
        console.log('🃏 点击翻牌配对');
        var modal = document.getElementById('gameCenterModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }
        window.location.href = 'cardmatch.html';
    };
}

// 连连看按钮 - 跳转到 linkgame.html
var gameLinkMatchBtn = document.getElementById('gameLinkMatchBtn');
if (gameLinkMatchBtn) {
    gameLinkMatchBtn.onclick = function() {
        console.log('🧩 点击连连看');
        var modal = document.getElementById('gameCenterModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }
        window.location.href = 'linkgame.html';
    };
}

// 探险区域按钮
var exploreBtn = document.getElementById('exploreBtn');
if (exploreBtn) {
    exploreBtn.onclick = function() {
        console.log('🗺️ 点击探险区域');
        window.location.href = 'explore.html';
    };
}

    // 商城按钮
    var shopBtn = document.getElementById('shopBtn');
    if (shopBtn) {
        shopBtn.onclick = function() {
            console.log('🏪 点击商城按钮');
            if (typeof openShop === 'function') {
                openShop();
            } else {
                if (typeof showMessage === 'function') {
                    showMessage('商城加载中...', false);
                }
            }
        };
    }

    // ============================================
    // 成就按钮 - 修复显示问题
    // ============================================
    var achievementBtn = document.getElementById('achievementBtn');
    if (achievementBtn) {
        achievementBtn.onclick = function() {
            console.log('🏆 点击成就按钮');
            // 调用全局函数打开成就面板
            if (typeof openAchievementModal === 'function') {
                openAchievementModal();
            } else {
                console.error('❌ openAchievementModal 未定义');
                // 降级方案：手动执行
                var modal = document.getElementById('achievementModal');
                if (modal) {
                    if (typeof loadAchievementData === 'function') loadAchievementData();
                    if (typeof renderCategoryTabs === 'function') renderCategoryTabs();
                    if (typeof renderAchievementList === 'function') renderAchievementList('production');
                    if (typeof updateAchievementStats === 'function') updateAchievementStats();
                    modal.classList.remove('hidden');
                    modal.style.display = 'flex';
                    document.body.classList.add('modal-open');
                }
            }
        };
    }

    var closeAchievementBtn = document.getElementById('closeAchievementModal');
    if (closeAchievementBtn) {
        closeAchievementBtn.onclick = function() {
            var modal = document.getElementById('achievementModal');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        };
    }

    var achievementModal = document.getElementById('achievementModal');
    if (achievementModal) {
        achievementModal.onclick = function(e) {
            if (e.target === this) {
                this.classList.add('hidden');
                this.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        };
    }

    // 能量按钮
    var energyBtn = document.getElementById('energyBtn');
    if (energyBtn) {
        energyBtn.onclick = function() {
            console.log('✨ 点击能量按钮');
            if (typeof openEnergyModal === 'function') {
                openEnergyModal();
            }
        };
    }

    var closeEnergyBtn = document.getElementById('closeEnergyModal');
    if (closeEnergyBtn) {
        closeEnergyBtn.onclick = function() {
            if (typeof closeEnergyModal === 'function') {
                closeEnergyModal();
            }
        };
    }

    // 音乐按钮
    var musicBtn = document.getElementById('musicBtn');
    if (musicBtn) {
        musicBtn.onclick = function() {
            showMessage('音乐功能暂未实现', false);
        };
    }

    // 全部卖出
    var sellAllBtn = document.getElementById('sellAllBtn');
    if (sellAllBtn) {
        sellAllBtn.onclick = function() {
            console.log('📦 点击全部卖出');
            if (typeof sellAllProducts === 'function') {
                sellAllProducts();
            }
        };
    }

    // 订单按钮
    var orderBtn = document.getElementById('orderBtn');
    if (orderBtn) {
        orderBtn.onclick = function() {
            console.log('📋 点击订单按钮');
            if (typeof openOrderModal === 'function') {
                openOrderModal();
            }
        };
    }

    var closeOrderBtn = document.getElementById('closeOrderModal');
    if (closeOrderBtn) {
        closeOrderBtn.onclick = function() {
            if (typeof closeOrderModal === 'function') {
                closeOrderModal();
            }
        };
    }

    // 升级按钮
    var upgradeMiaoBtn = document.getElementById('upgradeMiaoBtn');
    if (upgradeMiaoBtn) {
        upgradeMiaoBtn.onclick = function() {
            if (typeof upgradeMiao === 'function') {
                upgradeMiao();
            }
        };
    }

    var upgradeSpeedBtn = document.getElementById('upgradeSpeedBtn');
    if (upgradeSpeedBtn) {
        upgradeSpeedBtn.onclick = function() {
            if (typeof upgradeSpeed === 'function') {
                upgradeSpeed();
            }
        };
    }

    var upgradeWorkaholicBtn = document.getElementById('upgradeWorkaholicBtn');
    if (upgradeWorkaholicBtn) {
        upgradeWorkaholicBtn.onclick = function() {
            if (typeof upgradeWorkaholic === 'function') {
                upgradeWorkaholic();
            }
        };
    }

    var upgradeExpBoostBtn = document.getElementById('upgradeExpBoostBtn');
    if (upgradeExpBoostBtn) {
        upgradeExpBoostBtn.onclick = function() {
            if (typeof upgradeExpBoost === 'function') {
                upgradeExpBoost();
            }
        };
    }

    // 出售模态框
    var decBtn = document.getElementById('decBtn');
    if (decBtn) {
        decBtn.onclick = function() {
            if (typeof changeQuantity === 'function') {
                changeQuantity(-1);
            }
        };
    }

    var incBtn = document.getElementById('incBtn');
    if (incBtn) {
        incBtn.onclick = function() {
            if (typeof changeQuantity === 'function') {
                changeQuantity(1);
            }
        };
    }

    var confirmSellBtn = document.getElementById('confirmSellBtn');
    if (confirmSellBtn) {
        confirmSellBtn.onclick = function() {
            if (typeof confirmSell === 'function') {
                confirmSell();
            }
        };
    }

    var cancelSellBtn = document.getElementById('cancelSellBtn');
    if (cancelSellBtn) {
        cancelSellBtn.onclick = function() {
            if (typeof cancelSell === 'function') {
                cancelSell();
            }
        };
    }

    // 产品选择模态框
    var closeProductBtn = document.getElementById('closeProductModal');
    if (closeProductBtn) {
        closeProductBtn.onclick = function() {
            var modal = document.getElementById('productModal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            }
        };
    }

    // 兑换
    var exchangeBtn = document.getElementById('exchangeBtn');
    if (exchangeBtn) {
        exchangeBtn.onclick = function() {
            if (typeof exchangeBeansToGold === 'function') {
                exchangeBeansToGold();
            }
        };
    }

    var exchangeIncBtn = document.getElementById('exchangeIncBtn');
    if (exchangeIncBtn) {
        exchangeIncBtn.onclick = function() {
            if (typeof increaseExchangeQuantity === 'function') {
                increaseExchangeQuantity();
            }
        };
    }

    var exchangeDecBtn = document.getElementById('exchangeDecBtn');
    if (exchangeDecBtn) {
        exchangeDecBtn.onclick = function() {
            if (typeof decreaseExchangeQuantity === 'function') {
                decreaseExchangeQuantity();
            }
        };
    }

    var exchangeQuantityInput = document.getElementById('exchangeQuantity');
    if (exchangeQuantityInput) {
        exchangeQuantityInput.addEventListener('change', function() {
            var val = parseInt(this.value) || 1;
            if (val < 1) val = 1;
            this.value = val;
        });
        exchangeQuantityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && typeof exchangeBeansToGold === 'function') {
                exchangeBeansToGold();
            }
        });
    }

    // 经验卡片 - 打开个人信息
    var expCard = document.getElementById('expCard');
    if (expCard) {
        expCard.onclick = function() {
            if (typeof showProfileModal === 'function') {
                showProfileModal();
            }
        };
    }

    // 个人信息
    var closeProfileBtn = document.getElementById('closeProfileModal');
    if (closeProfileBtn) {
        closeProfileBtn.onclick = function() {
            if (typeof closeProfileModal === 'function') {
                closeProfileModal();
            }
        };
    }

    var editNicknameBtn = document.getElementById('editNicknameBtn');
    if (editNicknameBtn) {
        editNicknameBtn.onclick = function() {
            if (typeof editNickname === 'function') {
                editNickname();
            }
        };
    }

    var confirmNicknameBtn = document.getElementById('confirmNicknameBtn');
    if (confirmNicknameBtn) {
        confirmNicknameBtn.onclick = function() {
            if (typeof confirmEditNickname === 'function') {
                confirmEditNickname();
            }
        };
    }

    var cancelNicknameBtn = document.getElementById('cancelNicknameBtn');
    if (cancelNicknameBtn) {
        cancelNicknameBtn.onclick = function() {
            if (typeof cancelEditNickname === 'function') {
                cancelEditNickname();
            }
        };
    }

    // 游戏说明按钮
    var helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.onclick = function() {
            var modal = document.getElementById('helpModal');
            if (modal) {
                modal.classList.remove('hidden');
                document.body.classList.add('modal-open');
            }
        };
    }

    var closeHelpBtn = document.getElementById('closeHelpModal');
    if (closeHelpBtn) {
        closeHelpBtn.onclick = function() {
            var modal = document.getElementById('helpModal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            }
        };
    }

    var helpModal = document.getElementById('helpModal');
    if (helpModal) {
        helpModal.onclick = function(e) {
            if (e.target === this) {
                this.classList.add('hidden');
                document.body.classList.remove('modal-open');
            }
        };
    }

    // 农场按钮
    var farmBtn = document.getElementById('farmBtn');
    if (farmBtn) {
        farmBtn.onclick = function() {
            console.log('🌱 点击农场按钮');
            if (typeof openFarm === 'function') {
                openFarm();
            }
        };
    }

    var closeFarmBtn = document.getElementById('closeFarmModal');
    if (closeFarmBtn) {
        closeFarmBtn.onclick = function() {
            if (typeof closeFarm === 'function') {
                closeFarm();
            }
        };
    }

    var harvestAllBtn = document.getElementById('farmHarvestAllBtn');
    if (harvestAllBtn) {
        harvestAllBtn.onclick = function() {
            if (typeof harvestAllLands === 'function') {
                harvestAllLands();
            }
        };
    }

    var plantAllBtn = document.getElementById('farmPlantAllBtn');
    if (plantAllBtn) {
        plantAllBtn.onclick = function() {
            if (typeof plantAllLands === 'function') {
                plantAllLands();
            }
        };
    }

    // 清除存档
    var clearAllDataBtn = document.getElementById('clearAllDataBtn');
    if (clearAllDataBtn) {
        clearAllDataBtn.onclick = function() {
            if (confirm('⚠️ 清除所有存档将删除您的游戏进度，确定吗？')) {
                var wasAutoSaveEnabled = autoSaveEnabled;
                autoSaveEnabled = false;
                showMessage('正在清除存档...', false);

                for (var i = 0; i < TOTAL_SLOTS; i++) {
                    if (slotTimers[i]) clearTimeout(slotTimers[i]);
                    if (slotIntervals[i]) clearInterval(slotIntervals[i]);
                    slotTimers[i] = null;
                    slotIntervals[i] = null;
                }

                localStorage.removeItem('chocolate_save');
                localStorage.removeItem('order_date');
                localStorage.removeItem('savedOrders');
                localStorage.removeItem('farm_data');
                localStorage.removeItem('cardmatch_reward_beans');
                localStorage.removeItem('cardmatch_reward_amount');
                localStorage.removeItem('cardmatch_reward_time');
                localStorage.removeItem('double_gold_active');

                // 清除商城数据
                localStorage.removeItem('shop_data');
                localStorage.removeItem('player_bag');
                if (typeof shopState !== 'undefined') {
                    shopState = {
                        signIn: {
                            lastDate: null,
                            consecutiveDays: 0,
                            signedToday: false
                        },
                        inventory: {},
                        resetDate: null
                    };
                    if (typeof SHOP_ITEMS !== 'undefined') {
                        for (var id in SHOP_ITEMS) {
                            shopState.inventory[id] = SHOP_ITEMS[id].maxStock;
                        }
                    }
                }
                if (typeof playerBag !== 'undefined') {
                    for (var id in playerBag) {
                        playerBag[id] = 0;
                    }
                }

                // 重置游戏数据
                cocoaBeans = 0;
                gold = 0;
                miaoBargainLevel = 0;
                productionSpeedLevel = 0;
                workaholicLevel = 0;
                expBoostLevel = 0;
                totalProduced = 0;
                totalSold = 0;
                totalEarned = 0;
                totalBeansHarvested = 0;
                exp = 0;
                level = 1;

                for (var id in PRODUCTS) inventory[id] = 0;
                for (var r of HIDDEN_RECIPES) hiddenInventory[r.id] = 0;
                for (var e of ENERGY_TYPES) energies[e.id] = 0;

                for (var i = 0; i < TOTAL_SLOTS; i++) {
                    slots[i] = { unlocked: (i === 0), productId: null, remainingSec: 0, status: 'idle' };
                }

                if (typeof generateFreshOrders === 'function') {
                    currentOrders = generateFreshOrders();
                }
                localStorage.setItem('order_date', getTodayDateStr());
                if (currentOrders) localStorage.setItem('savedOrders', JSON.stringify(currentOrders));

                if (typeof updateOrderStatusDisplay === 'function') updateOrderStatusDisplay();
                userProfile = { nickname: generateRandomNickname(), nicknameChanged: false, nicknameChangeCount: 0 };

                if (typeof resetFarmLands === 'function') resetFarmLands();
                if (typeof renderShopUI === 'function') renderShopUI();
                if (typeof clearAchievementData === 'function') clearAchievementData();

                if (typeof refreshUI === 'function') refreshUI();
                showMessage('✅ 所有存档已清除，游戏已重置！', false);

                autoSaveEnabled = wasAutoSaveEnabled;
                setTimeout(function() {
                    location.reload();
                }, 2000);
            }
        };
    }

    // 退出游戏
    var exitGameBtn = document.getElementById('exitGameBtn');
    if (exitGameBtn) {
        exitGameBtn.onclick = function() {
            exitGame();
        };
    }

    console.log('✅ 事件绑定完成');
}

// ============================================
// UI 初始化函数
// ============================================
function initGameUI() {
    window._gameInitialized = true;
    console.log('initGameUI 开始执行...');

    for (var i = 0; i < TOTAL_SLOTS; i++) {
        if (!slots[i]) slots[i] = { unlocked: (i === 0), productId: null, remainingSec: 0, status: 'idle' };
        if (slotTimers[i]) clearTimeout(slotTimers[i]);
        if (slotIntervals[i]) clearInterval(slotIntervals[i]);
        slotTimers[i] = null;
        slotIntervals[i] = null;
    }

    if (!userProfile || !userProfile.nickname || userProfile.nickname === '[object Promise]') {
        userProfile = { nickname: generateRandomNickname(), nicknameChanged: false, nicknameChangeCount: 0 };
        console.log('生成新昵称:', userProfile.nickname);
    }

    if (!currentOrders || currentOrders.length === 0) {
        if (typeof generateFreshOrders === 'function') {
            currentOrders = generateFreshOrders();
        }
    }

    if (typeof updateOrderStatusDisplay === 'function') updateOrderStatusDisplay();
    if (typeof refreshUI === 'function') refreshUI();

    // 检查翻牌配对游戏的奖励
    checkCardMatchReward();

    // 初始化成就系统
    if (typeof loadAchievementData === 'function') {
        loadAchievementData();
    }
    if (typeof checkAchievements === 'function') {
        setTimeout(function() {
            checkAchievements();
        }, 500);
    }

    bindEvents();
    setupKeyboardShortcuts();
    startAutoBeanTimer();

    showMessage('✨ 游戏已启动，第5级开始可获得隐藏能量，10级解锁隐藏食谱 ✨', false);
    console.log('initGameUI 执行完成');
}

window.initGameUI = initGameUI;

// 超时后备
setTimeout(function() {
    if (!window._gameInitialized && document.getElementById('slotsGrid')) {
        console.log('⚠️ 超时强制初始化游戏 UI');
        if (typeof window.initGameUI === 'function') {
            window.initGameUI();
        }
    }
}, 3000);

window.addEventListener('beforeunload', function() {
    if (autoBeanTimer) clearInterval(autoBeanTimer);
    if (typeof stopGlobalProductionTimer === 'function') stopGlobalProductionTimer();
});

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            if (typeof window.initGameUI === 'function' && document.getElementById('slotsGrid')) {
                window.initGameUI();
            }
        }, 500);
    });
} else {
    setTimeout(function() {
        if (typeof window.initGameUI === 'function' && document.getElementById('slotsGrid')) {
            window.initGameUI();
        }
    }, 500);
}

// ============================================
// 导出全局接口
// ============================================
window.upgradeMiao = upgradeMiao;
window.upgradeSpeed = upgradeSpeed;
window.upgradeWorkaholic = upgradeWorkaholic;
window.upgradeExpBoost = upgradeExpBoost;
window.exitGame = exitGame;
window.startAutoBeanTimer = startAutoBeanTimer;
window.restartAutoBeanTimer = restartAutoBeanTimer;
window.setupKeyboardShortcuts = setupKeyboardShortcuts;
window.bindEvents = bindEvents;
window.initGameUI = initGameUI;
window.checkCardMatchReward = checkCardMatchReward;

console.log('✅ main.js 加载完成');