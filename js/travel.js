// ============================================================
// travel.js · 可可世界航行系统（持久化航行动画）
// ============================================================

console.log('⛵ 航行系统加载中...');

// ============================================================
// 状态
// ============================================================
var _isTraveling = false;
var _travelAnimationId = null;
var _travelStateRef = null;
var _travelStartTime = 0;

var _travelProgress = null;
var _travelBar = null;
var _travelText = null;
var _shipMarker = null;
var _mapOverlay = null;

// DOM 缓存（在初始化时设置）
function _initTravelDom() {
    _travelProgress = document.getElementById('travelProgress');
    _travelBar = document.getElementById('travelBar');
    _travelText = document.getElementById('travelText');
    _shipMarker = document.getElementById('shipMarker');
    _mapOverlay = document.getElementById('mapOverlay');
}

// ============================================================
// 数据持久化
// ============================================================
function saveTravelState(state) {
    try {
        localStorage.setItem('explore_travel_state', JSON.stringify(state));
    } catch(e) {
        console.warn('保存航行状态失败:', e);
    }
}

function loadTravelState() {
    try {
        var saved = localStorage.getItem('explore_travel_state');
        return saved ? JSON.parse(saved) : null;
    } catch(e) {
        return null;
    }
}

function clearTravelState() {
    localStorage.removeItem('explore_travel_state');
}

// ============================================================
// 工具函数
// ============================================================
function _getRegion(id) {
    if (typeof window.getRegion === 'function') {
        return window.getRegion(id);
    }
    return null;
}

function _getCurrentRegion() {
    if (typeof window.getCurrentRegion === 'function') {
        return window.getCurrentRegion();
    }
    return null;
}

function _showToast(msg, duration) {
    if (typeof window.showToast === 'function') {
        window.showToast(msg, duration);
    } else {
        console.log('⛵ ' + msg);
    }
}

function _handleFirstArrival(regionId) {
    if (typeof window.handleFirstArrival === 'function') {
        window.handleFirstArrival(regionId);
    }
}

function _renderMarkers() {
    if (typeof window.renderMarkers === 'function') {
        window.renderMarkers();
    }
}

function _updateInfoPanel() {
    if (typeof window.updateInfoPanel === 'function') {
        window.updateInfoPanel();
    }
}

function _toPercent(px, py) {
    if (typeof window.toPercent === 'function') {
        return window.toPercent(px, py);
    }
    return { x: (px / 2910) * 100, y: (py / 1280) * 100 };
}

function _saveRegionStatus() {
    if (typeof window.saveRegionStatus === 'function') {
        window.saveRegionStatus();
    }
}

function _showTreasureClaimPanel() {
    if (typeof window.showTreasureClaimPanel === 'function') {
        window.showTreasureClaimPanel();
    }
}

// ============================================================
// 核心航行函数
// ============================================================

function stopTravelAnimation() {
    if (_travelAnimationId) {
        cancelAnimationFrame(_travelAnimationId);
        _travelAnimationId = null;
    }
    _isTraveling = false;
}

function completeTravel(targetId, callback) {
    stopTravelAnimation();

    var target = _getRegion(targetId);
    if (!target) {
        clearTravelState();
        if (_travelProgress) _travelProgress.style.display = 'none';
        _isTraveling = false;
        if (typeof callback === 'function') callback();
        return;
    }

    var oldCurrent = _getCurrentRegion();
    if (oldCurrent && oldCurrent.id !== targetId) {
        oldCurrent.status = 'unlocked';
    }
    target.status = 'current';
    window.selectedRegionId = targetId;

    var finalPos = _toPercent(target.px, target.py);
    if (_shipMarker) {
        _shipMarker.style.left = finalPos.x + '%';
        _shipMarker.style.top = finalPos.y + '%';
    }

    _saveRegionStatus();
    clearTravelState();
    // ===== 添加音效 =====
    if (typeof soundArrive === 'function') soundArrive();
    // ===== 音效添加结束 =====
    _renderMarkers();
    _updateInfoPanel();

    // 处理首次到达
    if (typeof _handleFirstArrival === 'function') {
        _handleFirstArrival(targetId);
    }

    // 高亮标记
    if (_mapOverlay) {
        var markers = _mapOverlay.querySelectorAll('.region-marker:not(.treasure-marker)');
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].dataset.id === targetId) {
                markers[i].style.transform = 'translate(-50%, -50%) scale(1.25)';
                markers[i].style.zIndex = '10';
            } else {
                markers[i].style.transform = 'translate(-50%, -50%) scale(1)';
                markers[i].style.zIndex = '2';
            }
        }
    }

    if (_travelText) {
        _travelText.textContent = '✅ 到达 ' + target.name + '！';
    }
    _showToast('🚢 到达 ' + target.name + '！', 2000);

    setTimeout(function() {
        if (_travelProgress) _travelProgress.style.display = 'none';
        _isTraveling = false;
        _travelAnimationId = null;
        if (typeof callback === 'function') callback();
    }, 1200);
}

function startTravelAnimation(state) {
    if (_isTraveling) {
        stopTravelAnimation();
    }

    _initTravelDom();

    _isTraveling = true;
    _travelStateRef = state;
    _travelStartTime = Date.now();
    // ===== 添加音效 =====
    if (typeof soundSail === 'function') soundSail();
    // ===== 音效添加结束 =====

    if (_travelProgress) _travelProgress.style.display = 'block';
    if (_travelBar) _travelBar.style.width = '0%';
    if (_travelText) {
        _travelText.textContent = '⛵ 起航前往 ' + state.targetName + '...';
    }

    var startX = state.startX;
    var startY = state.startY;
    var targetX = state.targetX;
    var targetY = state.targetY;
    var duration = state.duration;
    var startTime = state.startTime || Date.now();

    var elapsed = Date.now() - startTime;
    var progress = Math.min(100, (elapsed / duration) * 100);

    if (progress >= 100) {
        completeTravel(state.targetId);
        return;
    }

    var t = progress / 100;
    var ease = 1 - Math.pow(1 - t, 3);
    var cx = startX + (targetX - startX) * ease;
    var cy = startY + (targetY - startY) * ease;

    if (_shipMarker) {
        _shipMarker.style.left = cx + '%';
        _shipMarker.style.top = cy + '%';
    }
    if (_travelBar) _travelBar.style.width = progress + '%';

    var remaining = Math.max(0, (duration - elapsed) / 1000);
    if (_travelText) {
        _travelText.textContent = '⛵ 航行中... ' + Math.round(progress) + '% (剩余 ' + Math.ceil(remaining) + 's)';
    }

    function animate() {
        var newElapsed = Date.now() - startTime;
        var newProgress = Math.min(100, (newElapsed / duration) * 100);

        if (newProgress >= 100) {
            completeTravel(state.targetId);
            return;
        }

        var t2 = newProgress / 100;
        var ease2 = 1 - Math.pow(1 - t2, 3);
        var cx2 = startX + (targetX - startX) * ease2;
        var cy2 = startY + (targetY - startY) * ease2;

        if (_shipMarker) {
            _shipMarker.style.left = cx2 + '%';
            _shipMarker.style.top = cy2 + '%';
        }
        if (_travelBar) _travelBar.style.width = newProgress + '%';

        var remaining2 = Math.max(0, (duration - newElapsed) / 1000);
        if (_travelText) {
            _travelText.textContent = '⛵ 航行中... ' + Math.round(newProgress) + '% (剩余 ' + Math.ceil(remaining2) + 's)';
        }

        _travelAnimationId = requestAnimationFrame(animate);
    }

    _travelAnimationId = requestAnimationFrame(animate);
}

function resumeTravelFromState(state) {
    if (!state || !state.isTraveling) {
        return;
    }

    var elapsed = Date.now() - state.startTime;
    var duration = state.duration;

    if (elapsed >= duration) {
        completeTravel(state.targetId);
        return;
    }

    startTravelAnimation(state);
    _showToast('⛵ 继续航行至 ' + state.targetName + '...', 1500);
}

// ============================================================
// 开始航行（主函数）
// ============================================================
function startTravel(targetId, fromX, fromY) {
    if (_isTraveling) {
        var state = loadTravelState();
        if (state && state.targetId === targetId) {
            resumeTravelFromState(state);
            return;
        }
        _showToast('⛵ 航行中，请等待到达', 1500);
        return;
    }

    var target = _getRegion(targetId);
    if (!target) return;
    if (target.status === 'locked') {
        _showToast('🔒 ' + target.name + ' 尚未解锁！', 2000);
        return;
    }
    if (target.status === 'current' && fromX === undefined) {
        _showToast('📍 已经在 ' + target.name + ' 了', 1500);
        return;
    }

    _initTravelDom();

    var currentRegion = _getCurrentRegion();
    var currentPos = _toPercent(
        currentRegion ? currentRegion.px : 1699,
        currentRegion ? currentRegion.py : 930
    );

    var startX = (fromX !== undefined && fromX !== null) ? fromX : (parseFloat(_shipMarker ? _shipMarker.style.left : '0') || currentPos.x);
    var startY = (fromY !== undefined && fromY !== null) ? fromY : (parseFloat(_shipMarker ? _shipMarker.style.top : '0') || currentPos.y);

    var targetPos = _toPercent(target.px, target.py);
    var targetX = targetPos.x;
    var targetY = targetPos.y;

    var dist = Math.sqrt(Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2));
    var speedPercentPerSecond = 8;
    var totalDuration = Math.max(1.5, Math.min(12, dist / speedPercentPerSecond));

    if (dist < 0.01) {
        completeTravel(targetId);
        return;
    }

    var travelState = {
        isTraveling: true,
        startX: startX,
        startY: startY,
        targetX: targetX,
        targetY: targetY,
        targetId: targetId,
        targetName: target.name,
        startTime: Date.now(),
        duration: totalDuration * 1000,
        isReturning: (fromX !== undefined && fromX !== null) || false
    };

    saveTravelState(travelState);
    startTravelAnimation(travelState);
}

// ============================================================
// 航行到坐标点（藏宝图使用）
// ============================================================
function startTravelToPoint(targetX, targetY) {
    if (_isTraveling) {
        _showToast('⛵ 航行中，请等待', 1500);
        return;
    }

    _initTravelDom();

    var currentRegion = _getCurrentRegion();
    var currentPos = _toPercent(
        currentRegion ? currentRegion.px : 1699,
        currentRegion ? currentRegion.py : 930
    );
    var startX = parseFloat(_shipMarker ? _shipMarker.style.left : '0') || currentPos.x;
    var startY = parseFloat(_shipMarker ? _shipMarker.style.top : '0') || currentPos.y;

    var targetPos = _toPercent(targetX, targetY);
    var targetXPercent = targetPos.x;
    var targetYPercent = targetPos.y;

    var dist = Math.sqrt(Math.pow(targetXPercent - startX, 2) + Math.pow(targetYPercent - startY, 2));
    var speedPercentPerSecond = 8;
    var totalDuration = Math.max(1.5, Math.min(12, dist / speedPercentPerSecond));

    if (dist < 0.01) {
        if (typeof _showTreasureClaimPanel === 'function') {
            _showTreasureClaimPanel();
        }
        return;
    }

    var travelState = {
        isTraveling: true,
        startX: startX,
        startY: startY,
        targetX: targetXPercent,
        targetY: targetYPercent,
        targetId: 'random_point',
        targetName: '藏宝地点',
        startTime: Date.now(),
        duration: totalDuration * 1000,
        isReturning: false,
        isTreasure: true
    };

    saveTravelState(travelState);

    _isTraveling = true;
    _travelStateRef = travelState;
    _travelStartTime = Date.now();

    if (_travelProgress) _travelProgress.style.display = 'block';
    if (_travelBar) _travelBar.style.width = '0%';
    if (_travelText) _travelText.textContent = '⛵ 起航前往藏宝地点...';

    function animateTreasure() {
        var elapsed = Date.now() - travelState.startTime;
        var progress = Math.min(100, (elapsed / travelState.duration) * 100);

        if (_travelBar) _travelBar.style.width = progress + '%';
        if (_travelText) {
            var remaining = Math.max(0, (travelState.duration - elapsed) / 1000);
            _travelText.textContent = '⛵ 航行中... ' + Math.round(progress) + '% (剩余 ' + Math.ceil(remaining) + 's)';
        }

        var t = progress / 100;
        var ease = 1 - Math.pow(1 - t, 3);
        var cx = travelState.startX + (travelState.targetX - travelState.startX) * ease;
        var cy = travelState.startY + (travelState.targetY - travelState.startY) * ease;

        if (_shipMarker) {
            _shipMarker.style.left = cx + '%';
            _shipMarker.style.top = cy + '%';
        }

        if (progress >= 100) {
            clearTravelState();
            if (_travelText) _travelText.textContent = '✅ 到达藏宝地点！';
            _showToast('🚢 到达藏宝地点！', 2000);

            setTimeout(function() {
                if (_travelProgress) _travelProgress.style.display = 'none';
                _isTraveling = false;
                if (typeof _showTreasureClaimPanel === 'function') {
                    _showTreasureClaimPanel();
                }
            }, 1200);
            return;
        }

        _travelAnimationId = requestAnimationFrame(animateTreasure);
    }

    _travelAnimationId = requestAnimationFrame(animateTreasure);
}

// ============================================================
// 前往藏宝图（由 explore.js 调用）
// ============================================================
function navigateToTreasure() {
    if (typeof window.treasureState === 'undefined') {
        _showToast('❌ 藏宝图系统未加载', 1500);
        return;
    }
    if (!window.treasureState.hasCompleteMap) {
        _showToast('🗺️ 没有可用的藏宝图', 1500);
        return;
    }

    if (_isTraveling) {
        _showToast('⛵ 航行中，请等待到达', 1500);
        return;
    }

    var regionId = window.treasureState.treasureRegionId;
    var region = _getRegion(regionId);

    if (regionId === 'random' || !region) {
        startTravelToPoint(window.treasureState.treasurePosX, window.treasureState.treasurePosY);
        return;
    }

    if (region.status === 'locked') {
        var canUnlock = false;
        if (typeof window.canUnlockRegion === 'function') {
            canUnlock = window.canUnlockRegion(region);
        }
        if (!canUnlock) {
            _showToast('🔒 需要 Lv.' + region.unlockLevel + ' 解锁 ' + region.name, 2000);
            return;
        }
        if (typeof window.tryUnlockRegion === 'function') {
            window.tryUnlockRegion(region);
        }
        setTimeout(function() {
            if (typeof window.renderMarkers === 'function') {
                window.renderMarkers();
            }
        }, 500);
        return;
    }

    var current = _getCurrentRegion();
    if (current && current.id === regionId) {
        if (typeof _showTreasureClaimPanel === 'function') {
            _showTreasureClaimPanel();
        }
        return;
    }

    _showToast('🚢 正在前往宝藏地点...', 1500);
    window.selectedRegionId = regionId;
    if (typeof _updateInfoPanel === 'function') {
        _updateInfoPanel();
    }
    startTravel(regionId);
}

// ============================================================
// 恢复航行（页面加载时调用）
// ============================================================
function resumeTravelOnLoad() {
    _initTravelDom();
    var state = loadTravelState();
    if (state && state.isTraveling) {
        var target = _getRegion(state.targetId);
        if (target || state.targetId === 'random_point') {
            var elapsed = Date.now() - state.startTime;
            if (elapsed >= state.duration) {
                // 已完成，直接到达
                if (state.isTreasure) {
                    clearTravelState();
                    if (typeof _showTreasureClaimPanel === 'function') {
                        _showTreasureClaimPanel();
                    }
                } else {
                    completeTravel(state.targetId);
                }
                return true;
            }
            resumeTravelFromState(state);
            return true;
        } else {
            clearTravelState();
        }
    }
    return false;
}

// ============================================================
// 检查是否在航行中
// ============================================================
function isTraveling() {
    return _isTraveling;
}

// ============================================================
// 停止航行（用于错误恢复）
// ============================================================
function forceStopTravel() {
    stopTravelAnimation();
    clearTravelState();
    if (_travelProgress) _travelProgress.style.display = 'none';
    _isTraveling = false;
}

// ============================================================
// 暴露全局接口
// ============================================================
window.travel = {
    start: startTravel,
    startToPoint: startTravelToPoint,
    navigateToTreasure: navigateToTreasure,
    resume: resumeTravelFromState,
    resumeOnLoad: resumeTravelOnLoad,
    complete: completeTravel,
    stop: forceStopTravel,
    isTraveling: isTraveling,
    getState: loadTravelState,
    clearState: clearTravelState,
    _initDom: _initTravelDom
};

// 兼容旧接口
window.startTravel = startTravel;
window.startTravelToPoint = startTravelToPoint;
window.navigateToTreasure = navigateToTreasure;
window.resumeTravelFromState = resumeTravelFromState;
window.completeTravel = completeTravel;
window.stopTravelAnimation = stopTravelAnimation;
window.isTraveling = isTraveling;

console.log('⛵ 航行系统加载完成');