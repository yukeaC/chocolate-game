// ============================================
// index.html 入口脚本
// 路径: js/index.js
// ============================================

console.log('📄 index.js 加载完成');

// ============================================
// 强制初始化 UI
// ============================================
function forceInitUI() {
    if (typeof window.initGameUI === 'function') {
        if (document.getElementById('slotsGrid') && document.getElementById('slotsGrid').children.length === 0) {
            console.log('强制调用 initGameUI');
            window.initGameUI();
        }
    } else {
        setTimeout(forceInitUI, 500);
    }
}

// ============================================
// 清除存档
// ============================================
function setupClearData() {
    var clearBtn = document.getElementById('clearAllDataBtn');
    if (!clearBtn) return;
    clearBtn.addEventListener('click', function() {
        if (confirm('确定要清除所有存档吗？此操作不可恢复！')) {
            // 清除 localStorage
            localStorage.removeItem('chocolate_save');
            localStorage.removeItem('order_date');
            localStorage.removeItem('savedOrders');
            localStorage.removeItem('farm_data');
            localStorage.removeItem('cardmatch_reward_beans');
            localStorage.removeItem('cardmatch_reward_amount');
            localStorage.removeItem('cardmatch_reward_time');

            if (typeof clearAllGameDataLocal === 'function') {
                clearAllGameDataLocal();
            } else {
                // 手动重置游戏数据
                if (typeof cocoaBeans !== 'undefined') cocoaBeans = 0;
                if (typeof gold !== 'undefined') gold = 0;
                if (typeof miaoBargainLevel !== 'undefined') miaoBargainLevel = 0;
                if (typeof productionSpeedLevel !== 'undefined') productionSpeedLevel = 0;
                if (typeof workaholicLevel !== 'undefined') workaholicLevel = 0;
                if (typeof totalProduced !== 'undefined') totalProduced = 0;
                if (typeof totalSold !== 'undefined') totalSold = 0;
                if (typeof totalEarned !== 'undefined') totalEarned = 0;
                if (typeof totalBeansHarvested !== 'undefined') totalBeansHarvested = 0;
                if (typeof exp !== 'undefined') exp = 0;
                if (typeof level !== 'undefined') level = 1;

                if (typeof inventory !== 'undefined') {
                    for (var id in PRODUCTS) inventory[id] = 0;
                }
                if (typeof hiddenInventory !== 'undefined') {
                    for (var r of HIDDEN_RECIPES) hiddenInventory[r.id] = 0;
                }
                if (typeof energies !== 'undefined') {
                    for (var e of ENERGY_TYPES) energies[e.id] = 0;
                }
                if (typeof slots !== 'undefined') {
                    for (var i = 0; i < TOTAL_SLOTS; i++) {
                        slots[i] = { unlocked: (i === 0), productId: null, remainingSec: 0, status: 'idle' };
                        if (slotTimers[i]) clearTimeout(slotTimers[i]);
                        if (slotIntervals[i]) clearInterval(slotIntervals[i]);
                        slotTimers[i] = null;
                        slotIntervals[i] = null;
                    }
                }
                if (typeof userProfile !== 'undefined') {
                    userProfile = { nickname: generateRandomNickname(), nicknameChanged: false, nicknameChangeCount: 0 };
                }
                if (typeof currentOrders !== 'undefined') {
                    currentOrders = generateFreshOrders();
                }
                if (typeof resetFarmLands === 'function') resetFarmLands();
            }

            if (typeof refreshUI === 'function') refreshUI();
            if (typeof renderSlots === 'function') renderSlots();
            if (typeof renderQuickSell === 'function') renderQuickSell();
            if (typeof showMessage === 'function') {
                showMessage('✅ 所有存档已清除，游戏已重置！', false);
            }
            setTimeout(function() {
                location.reload();
            }, 1500);
        }
    });
}

// ============================================
// 退出游戏
// ============================================
function setupExitGame() {
    var exitBtn = document.getElementById('exitGameBtn');
    if (!exitBtn) return;
    exitBtn.addEventListener('click', function() {
        if (confirm('确定要退出游戏吗？进度将自动保存。')) {
            if (typeof saveGame === 'function') saveGame();
            window.location.href = 'start.html';
        }
    });
}

// ============================================
// 个人信息关闭
// ============================================
function setupProfileClose() {
    var closeBtn = document.getElementById('closeProfileModal');
    if (!closeBtn) return;
    closeBtn.addEventListener('click', function() {
        if (typeof closeProfileModal === 'function') {
            closeProfileModal();
        } else {
            var modal = document.getElementById('profileModal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            }
        }
    });
}

// ============================================
// 兑换数量控制
// ============================================
function setupExchangeControls() {
    var incBtn = document.getElementById('exchangeIncBtn');
    var decBtn = document.getElementById('exchangeDecBtn');
    var exchangeBtn = document.getElementById('exchangeBtn');
    var quantityInput = document.getElementById('exchangeQuantity');

    if (incBtn) {
        incBtn.addEventListener('click', function() {
            if (typeof increaseExchangeQuantity === 'function') increaseExchangeQuantity();
        });
    }
    if (decBtn) {
        decBtn.addEventListener('click', function() {
            if (typeof decreaseExchangeQuantity === 'function') decreaseExchangeQuantity();
        });
    }
    if (exchangeBtn) {
        exchangeBtn.addEventListener('click', function() {
            if (typeof exchangeBeansToGold === 'function') exchangeBeansToGold();
        });
    }
    if (quantityInput) {
        quantityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && typeof exchangeBeansToGold === 'function') {
                exchangeBeansToGold();
            }
        });
        quantityInput.addEventListener('change', function() {
            var val = parseInt(this.value) || 1;
            if (val < 1) val = 1;
            this.value = val;
        });
    }
}

// ============================================
// 成就系统
// ============================================
function setupAchievements() {
    var openBtn = document.getElementById('achievementBtn');
    var closeBtn = document.getElementById('closeAchievementModal');

    if (openBtn) {
        openBtn.addEventListener('click', function() {
            var modal = document.getElementById('achievementModal');
            if (!modal) return;

            if (typeof getAchievementStats === 'function' && typeof getAchievementList === 'function') {
                var stats = getAchievementStats();
                var statsEl = document.getElementById('achievementStats');
                if (statsEl) {
                    statsEl.innerHTML = '已解锁 <strong>' + stats.unlocked + '</strong> / ' + stats.total + ' 个成就 (' + stats.progress + '%)';
                }

                var list = getAchievementList();
                var container = document.getElementById('achievementList');
                if (container) {
                    container.innerHTML = '';
                    list.forEach(function(ach) {
                        var div = document.createElement('div');
                        div.style.cssText =
                            'display:flex;align-items:center;gap:12px;padding:10px 14px;margin-bottom:8px;' +
                            'background:' + (ach.unlocked ? '#f0f7e8' : '#f5f0ea') + ';' +
                            'border-radius:24px;border:1px solid ' + (ach.unlocked ? '#a8e6a8' : '#e7c29e') + ';' +
                            'opacity:' + (ach.unlocked ? 1 : 0.6) + ';';
                        div.innerHTML =
                            '<span style="font-size:1.8rem;">' + ach.icon + '</span>' +
                            '<div style="flex:1;">' +
                                '<div style="font-weight:bold;font-size:0.9rem;color:#5a2e1c;">' + ach.name + '</div>' +
                                '<div style="font-size:0.7rem;color:#a56b3a;">' + ach.description + '</div>' +
                            '</div>' +
                            '<span style="font-size:0.8rem;color:' + (ach.unlocked ? '#5cb85c' : '#aaa') + ';">' +
                                (ach.unlocked ? '✅ 已解锁' : '🔒 未解锁') +
                            '</span>';
                        container.appendChild(div);
                    });
                }
            }

            modal.classList.remove('hidden');
            document.body.classList.add('modal-open');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            var modal = document.getElementById('achievementModal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            }
        });
    }
}

// ============================================
// 农场系统
// ============================================
function setupFarm() {
    var farmBtn = document.getElementById('farmBtn');
    var closeBtn = document.getElementById('closeFarmModal');
    var harvestAllBtn = document.getElementById('farmHarvestAllBtn');
    var plantAllBtn = document.getElementById('farmPlantAllBtn');

    if (farmBtn) {
        farmBtn.addEventListener('click', function() {
            if (typeof openFarm === 'function') openFarm();
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            if (typeof closeFarm === 'function') closeFarm();
        });
    }
    if (harvestAllBtn) {
        harvestAllBtn.addEventListener('click', function() {
            if (typeof harvestAllLands === 'function') harvestAllLands();
        });
    }
    if (plantAllBtn) {
        plantAllBtn.addEventListener('click', function() {
            if (typeof plantAllLands === 'function') plantAllLands();
        });
    }
}

// ============================================
// 自动保存
// ============================================
function setupAutoSave() {
    // 关闭前保存
    window.addEventListener('beforeunload', function() {
        if (typeof saveGame === 'function') saveGame();
    });

    // 自动保存（每60秒）
    setInterval(function() {
        if (typeof saveGame === 'function' && typeof autoSaveEnabled !== 'undefined' && autoSaveEnabled) {
            saveGame();
            console.log('⏰ 自动保存');
        }
    }, 60000);
}

// ============================================
// 初始化所有功能
// ============================================
function initIndexPage() {
    console.log('📄 初始化 index 页面...');

    // 延迟初始化 UI
    window.addEventListener('load', function() {
        setTimeout(forceInitUI, 1000);
    });
    setTimeout(forceInitUI, 2000);

    // 设置各个功能
    setupClearData();
    setupExitGame();
    setupProfileClose();
    setupExchangeControls();
    setupAchievements();
    setupFarm();
    setupAutoSave();

    console.log('✅ index 页面初始化完成');
}

// ============================================
// 页面加载完成后执行
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIndexPage);
} else {
    initIndexPage();
}

// 在 initIndexPage 或页面加载完成后添加
if (typeof loadAchievementData === 'function') {
    loadAchievementData();
}
if (typeof checkAchievements === 'function') {
    setTimeout(function() {
        checkAchievements();
    }, 1000);
}

// ============================================
// 导出全局接口
// ============================================
window.forceInitUI = forceInitUI;
window.setupClearData = setupClearData;
window.setupExitGame = setupExitGame;
window.setupProfileClose = setupProfileClose;
window.setupExchangeControls = setupExchangeControls;
window.setupAchievements = setupAchievements;
window.setupFarm = setupFarm;
window.setupAutoSave = setupAutoSave;
window.initIndexPage = initIndexPage;

console.log('✅ index.js 执行完成');