// js/fishing.js
// ============================================================
// fishing.js · 钓鱼模块（最终修复版 + 成就统计 + 挑战塔稀有鱼统计）
// ============================================================
console.log('🎣 钓鱼模块加载中...');

var FISH_TYPES = {
    clownfish:   { id: 'clownfish',   name: '小丑鱼', icon: '🐟', rarity: '普通', zoneWidth: 0.50 },
    tuna:        { id: 'tuna',        name: '金枪鱼', icon: '🐠', rarity: '普通', zoneWidth: 0.35 },
    pearlfish:   { id: 'pearlfish',   name: '珍珠鱼', icon: '🐡', rarity: '稀有', zoneWidth: 0.22 },
    bluewhale:   { id: 'bluewhale',   name: '蓝鲸鱼', icon: '🐋', rarity: '稀有', zoneWidth: 0.14 },
    legendfish:  { id: 'legendfish',  name: '传说鱼', icon: '🐉', rarity: '传说', zoneWidth: 0.08 }
};
window.FISH_TYPES = FISH_TYPES;

var fishingState = {
    isActive: false,
    isCasting: false,
    isReeling: false,
    floatPos: 0,
    speed: 0,
    direction: 1,
    animId: null,
    currentFish: null,
    basket: [],
    startTime: 0,
    todayCount: 0,
    todayCatch: 0,
    totalCaught: 0,
    totalLegendary: 0
};

var _popupTimer = null;

function _getBackpack() {
    try { var data = localStorage.getItem('explore_backpack'); return data ? JSON.parse(data) : {}; } catch(e) { return {}; }
}
function _saveBackpack(backpack) { localStorage.setItem('explore_backpack', JSON.stringify(backpack)); }
function _getExploreCoins() {
    try { var saved = localStorage.getItem('explore_coins'); return saved ? parseInt(saved) || 0 : 0; } catch(e) { return 0; }
}
function _saveExploreCoins(amount) { localStorage.setItem('explore_coins', String(amount)); }
function _spendExploreCoins(amount) {
    var current = _getExploreCoins();
    if (current < amount) return false;
    _saveExploreCoins(current - amount);
    return true;
}
function _getTodayDateStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
function _loadDaily() {
    try {
        var saved = localStorage.getItem('fishing_daily');
        if (saved) {
            var data = JSON.parse(saved);
            var today = _getTodayDateStr();
            if (data.date === today) {
                fishingState.todayCount = data.count || 0;
                fishingState.todayCatch = data.catch || 0;
                return;
            }
        }
    } catch(e) {}
    fishingState.todayCount = 0;
    fishingState.todayCatch = 0;
}
function _saveDaily() {
    try {
        var data = { date: _getTodayDateStr(), count: fishingState.todayCount, catch: fishingState.todayCatch };
        localStorage.setItem('fishing_daily', JSON.stringify(data));
    } catch(e) {}
}
function _loadFishingStats() {
    try {
        var stats = JSON.parse(localStorage.getItem('fishing_stats'));
        if (stats) {
            fishingState.totalCaught = stats.totalCaught || 0;
            fishingState.totalLegendary = stats.totalLegendary || 0;
            window.totalFishCaught = fishingState.totalCaught;
            window.totalLegendaryFish = fishingState.totalLegendary;
        }
    } catch(e) {}
}
function _saveFishingStats() {
    try {
        var stats = {
            totalCaught: fishingState.totalCaught,
            totalLegendary: fishingState.totalLegendary
        };
        localStorage.setItem('fishing_stats', JSON.stringify(stats));
        window.totalFishCaught = fishingState.totalCaught;
        window.totalLegendaryFish = fishingState.totalLegendary;
    } catch(e) {}
}

function _updateStatsUI() {
    var todayEl = document.getElementById('todayCountDisplay');
    var catchEl = document.getElementById('todayCatchDisplay');
    var coinEl = document.getElementById('coinDisplay');
    if (todayEl) todayEl.textContent = fishingState.todayCount + '/10';
    if (catchEl) catchEl.textContent = fishingState.todayCatch;
    var coins = _getExploreCoins();
    if (coinEl) coinEl.textContent = coins;
    var topCoin = document.getElementById('exploreCoinDisplay');
    if (topCoin) topCoin.textContent = coins;
}

function _setStatus(text, type) {
    var el = document.getElementById('fishingStatus');
    if (!el) return;
    el.textContent = text;
    el.className = 'status-text';
    if (type === 'success') el.classList.add('success');
    else if (type === 'fail') el.classList.add('fail');
    else if (type === 'highlight') el.classList.add('highlight');
}

function _showPopup(fish) {
    var popup = document.getElementById('catchPopup');
    if (!popup) return;
    var icon = document.getElementById('popupIcon');
    var name = document.getElementById('popupName');
    var desc = document.getElementById('popupDesc');
    if (icon) icon.textContent = fish.icon;
    if (name) name.textContent = fish.name;
    if (desc) desc.textContent = '🧺 鱼篓共 ' + fishingState.basket.length + ' 条';
    popup.style.display = 'block';
    clearTimeout(_popupTimer);
    _popupTimer = setTimeout(function() { if (popup) popup.style.display = 'none'; }, 1800);
}

function _updateFloatPosition(pct) {
    var el = document.getElementById('floatIcon');
    if (el) { el.style.left = pct + '%'; el.style.top = '50%'; }
}

function _updateTargetZone() {
    if (!fishingState.currentFish) return;
    var zone = document.getElementById('targetZone');
    if (!zone) return;
    var width = fishingState.currentFish.zoneWidth * 100;
    var left = (100 - width) / 2;
    zone.style.left = left + '%';
    zone.style.width = width + '%';
    zone.className = 'target-zone visible';
}

function _resetUI() {
    fishingState.isCasting = false;
    fishingState.isReeling = false;
    fishingState.floatPos = 0;
    fishingState.speed = 0;
    fishingState.direction = 1;
    fishingState.currentFish = null;
    if (fishingState.animId) {
        cancelAnimationFrame(fishingState.animId);
        fishingState.animId = null;
    }

    var floatEl = document.getElementById('floatIcon');
    if (floatEl) {
        floatEl.style.left = '5%';
        floatEl.style.top = '50%';
        floatEl.classList.remove('bobbing');
    }
    var mainBtn = document.getElementById('fishMainBtn');
    if (mainBtn) {
        mainBtn.disabled = false;
        mainBtn.innerHTML = '<span class="btn-icon">🎣</span><span class="btn-text">抛竿</span>';
        mainBtn.className = 'fish-btn fish-btn-main';
    }
    var zone = document.getElementById('targetZone');
    if (zone) zone.className = 'target-zone';
    _setStatus('🌊 点击「抛竿」开始钓鱼');
    _updateStatsUI();
}

function _canCast() {
    if (fishingState.todayCount >= 10) {
        if (_getExploreCoins() < 2) {
            _setStatus('❌ 探险币不足！需要 2 枚探险币', 'fail');
            return false;
        }
        return true;
    }
    return true;
}

function _consumeCast() {
    if (fishingState.todayCount < 10) {
        fishingState.todayCount++;
        _saveDaily();
        _updateStatsUI();
        console.log('🎣 今日次数 +1，当前:', fishingState.todayCount);
        return true;
    } else {
        if (_spendExploreCoins(2)) {
            _updateStatsUI();
            return true;
        }
        return false;
    }
}

function _castLine() {
    if (fishingState.isCasting || fishingState.isReeling) {
        console.log('⚠️ 正在钓鱼中，忽略点击');
        return;
    }
    if (typeof soundFishCast === 'function') soundFishCast();
    if (!_canCast()) return;
    if (!_consumeCast()) return;
    _updateStatsUI();

    var keys = Object.keys(FISH_TYPES);
    var randomKey = keys[Math.floor(Math.random() * keys.length)];
    fishingState.currentFish = FISH_TYPES[randomKey];
    _updateTargetZone();

    fishingState.isCasting = true;
    fishingState.isReeling = false;
    fishingState.floatPos = 5;
    fishingState.direction = 1;

    var speedBase = 1.2 + Math.random() * 3.3;
    if (fishingState.currentFish.id === 'legendfish') speedBase = 0.8 + Math.random() * 0.8;
    else if (fishingState.currentFish.id === 'bluewhale') speedBase = 1.0 + Math.random() * 1.0;
    fishingState.speed = 100 / (speedBase * 60);
    fishingState.direction = Math.random() > 0.5 ? 1 : -1;

    _updateFloatPosition(fishingState.floatPos);

    var mainBtn = document.getElementById('fishMainBtn');
    if (mainBtn) {
        mainBtn.disabled = false;
        mainBtn.innerHTML = '<span class="btn-icon">🔥</span><span class="btn-text">收杆</span>';
        mainBtn.className = 'fish-btn fish-btn-main fish-btn-reel';
    }
    var floatEl = document.getElementById('floatIcon');
    if (floatEl) floatEl.classList.add('bobbing');
    _setStatus('🎯 随时点击「收杆」！', 'highlight');

    var startTime = performance.now();
    fishingState.startTime = startTime;

    function animate() {
        if (!fishingState.isCasting) {
            fishingState.animId = null;
            return;
        }
        fishingState.floatPos += fishingState.speed * fishingState.direction;
        if (fishingState.floatPos >= 95) {
            fishingState.floatPos = 95;
            fishingState.direction = -1;
        } else if (fishingState.floatPos <= 5) {
            fishingState.floatPos = 5;
            fishingState.direction = 1;
        }
        _updateFloatPosition(fishingState.floatPos);

        var fish = fishingState.currentFish;
        var zoneWidth = fish.zoneWidth * 100;
        var zoneLeft = (100 - zoneWidth) / 2;
        var zoneRight = zoneLeft + zoneWidth;
        var inZone = (fishingState.floatPos >= zoneLeft && fishingState.floatPos <= zoneRight);
        var zone = document.getElementById('targetZone');
        if (zone) {
            if (inZone) zone.classList.add('hit');
            else zone.classList.remove('hit');
        }

        var elapsed = (performance.now() - startTime) / 1000;
        if (elapsed > 8) {
            if (fishingState.isCasting) {
                fishingState.isCasting = false;
                var btn = document.getElementById('fishMainBtn');
                if (btn) btn.disabled = true;
                if (floatEl) floatEl.classList.remove('bobbing');
                _setStatus('⏰ 时间到！', 'fail');
                if (zone) zone.classList.add('miss');
                if (btn) btn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">超时</span>';
                setTimeout(function() { _resetUI(); }, 1200);
                fishingState.animId = null;
            }
            return;
        }
        fishingState.animId = requestAnimationFrame(animate);
    }
    fishingState.animId = requestAnimationFrame(animate);
}

function _reelLine() {
    if (!fishingState.isCasting || fishingState.isReeling) return;
    fishingState.isReeling = true;
    fishingState.isCasting = false;
    if (fishingState.animId) {
        cancelAnimationFrame(fishingState.animId);
        fishingState.animId = null;
    }

    var zone = document.getElementById('targetZone');
    if (zone) zone.className = 'target-zone';

    var fish = fishingState.currentFish;
    var zoneWidth = fish.zoneWidth * 100;
    var zoneLeft = (100 - zoneWidth) / 2;
    var zoneRight = zoneLeft + zoneWidth;
    var inZone = (fishingState.floatPos >= zoneLeft && fishingState.floatPos <= zoneRight);

    var mainBtn = document.getElementById('fishMainBtn');
    if (mainBtn) {
        mainBtn.disabled = true;
        mainBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">...</span>';
    }
    var floatEl = document.getElementById('floatIcon');

    if (inZone) {
        fishingState.basket.push(fish);
        fishingState.todayCatch++;
        _saveDaily();
        _updateStatsUI();

        // 累计统计
        fishingState.totalCaught++;
        if (fish.id === 'legendfish') {
            fishingState.totalLegendary++;
        }
        window.totalFishCaught = fishingState.totalCaught;
        window.totalLegendaryFish = fishingState.totalLegendary;
        _saveFishingStats();

        var repAmount = 0;
        if (fish.rarity === '普通') repAmount = 1;
        else if (fish.rarity === '稀有') repAmount = 2;
        else if (fish.rarity === '传说') repAmount = 3;
        if (repAmount > 0 && typeof window.addReputation === 'function') {
            window.addReputation(repAmount, '钓鱼(' + fish.name + ')');
        }
        if (typeof window.onFishCaught === 'function') {
            window.onFishCaught(fish, function(result) {
                if (result && result.success && result.message) {
                    _setStatus('🎣 ' + result.message, 'success');
                }
            });
        }
        
        // ===== 挑战塔：钓鱼成功（传入鱼种ID） =====
        if (typeof onTowerFishCaught === 'function') {
            onTowerFishCaught(fish.id);
        }
        
        var total = fishingState.basket.length;
        _setStatus('🎉 钓到了 ' + fish.icon + ' ' + fish.name + ' ！鱼篓共 ' + total + ' 条', 'success');
        _showPopup(fish);
        if (typeof soundFishCatch === 'function') soundFishCatch();
        if (floatEl) {
            floatEl.style.transform = 'translate(-50%,-50%) scale(1.4) rotate(20deg)';
            floatEl.style.transition = '0.2s';
        }
        if (zone) zone.classList.add('hit');
        setTimeout(function() {
            if (floatEl) {
                floatEl.style.transform = 'translate(-50%,-50%) scale(1) rotate(0)';
                floatEl.style.transition = '';
            }
        }, 400);
        setTimeout(function() { _resetUI(); }, 1600);
    } else {
        _setStatus('😅 没中... 再试试', 'fail');
        if (typeof soundError === 'function') soundError();
        if (floatEl) {
            floatEl.style.transform = 'translate(-50%,-50%) scale(0.8)';
            floatEl.style.transition = '0.15s';
        }
        if (zone) zone.classList.add('miss');
        setTimeout(function() {
            if (floatEl) {
                floatEl.style.transform = 'translate(-50%,-50%) scale(1)';
                floatEl.style.transition = '';
            }
        }, 300);
        setTimeout(function() { _resetUI(); }, 1200);
    }
}

function _showBasketModal() {
    var basket = fishingState.basket.slice();
    var html = '<div style="max-width:400px;width:90%;background:#fffaf0;border-radius:48px;padding:24px;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
    html += '<h3 style="margin:0;color:#5a2e1c;">🧺 鱼篓</h3>';
    html += '<button onclick="document.getElementById(\'basketModal\').remove()" style="background:#c98f5e;border:none;border-radius:30px;padding:4px 14px;cursor:pointer;font-size:0.8rem;color:white;font-weight:bold;">关闭</button>';
    html += '</div>';
    if (basket.length === 0) {
        html += '<div style="text-align:center;padding:40px 0;font-size:0.9rem;color:#a56b3a;">🧺 鱼篓空空如也，去钓几条鱼吧！</div>';
    } else {
        var countMap = {};
        basket.forEach(function(f) { countMap[f.id] = (countMap[f.id] || 0) + 1; });
        html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">';
        for (var id in countMap) {
            var fish = FISH_TYPES[id];
            if (!fish) continue;
            html += '<div style="background:#f5ede4;border-radius:16px;padding:12px;text-align:center;border:1px solid #e7c29e;">';
            html += '<div style="font-size:2.2rem;">' + fish.icon + '</div>';
            html += '<div style="font-size:0.7rem;font-weight:bold;color:#5a2e1c;margin-top:2px;">' + fish.name + '</div>';
            html += '<div style="font-size:0.9rem;font-weight:bold;color:#c4651e;">×' + countMap[id] + '</div>';
            html += '</div>';
        }
        html += '</div>';
        html += '<div style="text-align:center;margin-top:12px;font-size:0.7rem;color:#a56b3a;">共 ' + basket.length + ' 条鱼 · 退出时自动转入背包</div>';
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

function _exitFishing() {
    if (fishingState.isCasting) {
        if (!confirm('钓鱼中，确定要退出吗？')) return;
    }
    if (fishingState.basket.length > 0) {
        var backpack = _getBackpack();
        fishingState.basket.forEach(function(f) {
            var key = f.id;
            backpack[key] = (backpack[key] || 0) + 1;
        });
        _saveBackpack(backpack);
        console.log('🎒 鱼获已转入探险背包，共 ' + fishingState.basket.length + ' 条');
        fishingState.basket = [];
        var modal = document.getElementById('backpackModal');
        if (modal && !modal.classList.contains('hidden') && typeof window.renderBackpack === 'function') {
            window.renderBackpack();
        }
        if (typeof window.updateInfoPanel === 'function') {
            window.updateInfoPanel();
        }
    }

    if (fishingState.animId) {
        cancelAnimationFrame(fishingState.animId);
        fishingState.animId = null;
    }
    fishingState.isActive = false;
    fishingState.isCasting = false;
    fishingState.isReeling = false;
    if (window._fishingKeyHandler) {
        document.removeEventListener('keydown', window._fishingKeyHandler);
        window._fishingKeyHandler = null;
    }
    var container = document.getElementById('fishingContainer');
    if (container) container.innerHTML = '';

    var infoMode = document.getElementById('infoMode');
    var fishingMode = document.getElementById('fishingMode');
    if (infoMode) infoMode.style.display = 'flex';
    if (fishingMode) fishingMode.style.display = 'none';
    var modal = document.getElementById('basketModal');
    if (modal) modal.remove();
    _updateStatsUI();
    if (typeof window.updateInfoPanel === 'function') {
        window.updateInfoPanel();
    }
    console.log('🎣 钓鱼已退出');
}

function _initFishing() {
    console.log('🎣 初始化钓鱼...');
    fishingState.basket = [];
    fishingState.isCasting = false;
    fishingState.isReeling = false;
    fishingState.animId = null;
    _loadDaily();
    _loadFishingStats();

    var fishingMode = document.getElementById('fishingMode');
    if (fishingMode) fishingMode.style.display = 'block';
    var container = document.getElementById('fishingContainer');
    if (container) container.style.display = 'block';
    var infoMode = document.getElementById('infoMode');
    if (infoMode) infoMode.style.display = 'none';

    fishingState.isActive = true;

    container.innerHTML = `
        <div class="fishing-wrapper">
            <div class="fishing-stats-bar">
                <div class="stat-item"><span class="stat-icon">🎣</span><span class="stat-label">今日</span><span class="stat-value" id="todayCountDisplay">${fishingState.todayCount}/10</span></div>
                <div class="stat-item"><span class="stat-icon">🐟</span><span class="stat-label">鱼获</span><span class="stat-value" id="todayCatchDisplay">${fishingState.todayCatch}</span></div>
                <div class="stat-item"><span class="stat-icon">⚓</span><span class="stat-label">探险币</span><span class="stat-value" id="coinDisplay">${_getExploreCoins()}</span></div>
                <button class="btn-fishing-close" id="fishingBackBtn">✕ 退出</button>
            </div>
            <div class="fishing-water-area">
                <div class="wave-layer wave1"></div>
                <div class="wave-layer wave2"></div>
                <div class="track-horizontal">
                    <div class="target-zone" id="targetZone"></div>
                    <div class="float-icon" id="floatIcon">🎣</div>
                </div>
                <div class="catch-popup" id="catchPopup">
                    <div class="icon" id="popupIcon">🐟</div>
                    <div class="name" id="popupName">小丑鱼</div>
                    <div class="desc" id="popupDesc" style="font-size:0.55rem;color:rgba(255,255,255,0.3);margin-top:2px;"></div>
                </div>
            </div>
            <div class="status-text" id="fishingStatus">🌊 点击「抛竿」开始钓鱼</div>
            <div class="fishing-actions">
                <button class="fish-btn fish-btn-main" id="fishMainBtn"><span class="btn-icon">🎣</span><span class="btn-text">抛竿</span></button>
                <button class="fish-btn fish-btn-basket" id="basketBtn"><span class="btn-icon">🧺</span><span class="btn-text">鱼篓</span></button>
            </div>
        </div>
    `;

    document.getElementById('fishMainBtn').addEventListener('click', function() {
        if (!fishingState.isCasting) _castLine();
        else _reelLine();
    });
    document.getElementById('basketBtn').addEventListener('click', _showBasketModal);
    document.getElementById('fishingBackBtn').addEventListener('click', _exitFishing);

    if (window._fishingKeyHandler) {
        document.removeEventListener('keydown', window._fishingKeyHandler);
    }
    window._fishingKeyHandler = function(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            var active = document.activeElement;
            if (active && active.tagName === 'BUTTON') return;
            var btn = document.getElementById('fishMainBtn');
            if (btn && !btn.disabled) {
                e.preventDefault();
                if (!fishingState.isCasting) _castLine();
                else _reelLine();
            }
        }
    };
    document.addEventListener('keydown', window._fishingKeyHandler);

    _resetUI();
    _updateStatsUI();
    console.log('🎣 钓鱼模块已启动，今日剩余 ' + Math.max(0, 10 - fishingState.todayCount) + ' 次免费');
}

window.initFishing = _initFishing;
window.fishing = {
    init: _initFishing,
    exit: _exitFishing,
    isActive: function() { return fishingState.isActive; },
    getBasket: function() { return fishingState.basket.slice(); }
};

window.totalFishCaught = fishingState.totalCaught;
window.totalLegendaryFish = fishingState.totalLegendary;

console.log('🎣 钓鱼模块加载完成（最终修复版 + 成就统计 + 挑战塔稀有鱼统计）');