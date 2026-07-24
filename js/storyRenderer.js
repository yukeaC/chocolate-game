// ============================================================
// storyRenderer.js · 剧情播放器（底部对话框 + 左右头像 + 地图展开）
// ============================================================

var storyState = {
    regionId: null,
    currentNodeIndex: 0,
    isPlaying: false,
    isComplete: false,
    isSkipping: false,
    isWaitingForMapClick: false,
    mapRevealed: false
};

var storyOverlay = null;
var storyDialog = null;
var storySpeaker = null;
var storyText = null;
var storyEmoji = null;
var storyRow = null;
var storyTextWrapper = null;
var storyProgress = null;
var storyClickHint = null;
var storySkipBtn = null;
var mapRevealLayer = null;

// ============================================================
// 头像路径映射（含老矿工）
// ============================================================
var AVATAR_PATHS = {
    cocoa: 'images/cocotou.png',
    nono: 'images/nonotou.png',
    captain: 'images/kabutou.png',
    fisherman: 'images/fisherman.png',
    prince: 'images/prince.png',
    eggking: 'images/eggking.png',
    laokesong: 'images/laokesong.png',
    miner: 'images/guoshu.png',
    xiaolou: 'images/xiaolou.png',
    default: null
};

function getAvatarType(node) {
    if (node.avatar) return node.avatar;
    var speaker = (node.speaker || '').toLowerCase();
    
    if (speaker.includes('喀哺') || speaker.includes('老船长') || speaker.includes('船长')) return 'captain';
    if (speaker.includes('可可')) return 'cocoa';
    if (speaker.includes('嫑嫑')) return 'nono';
    if (speaker.includes('渔夫') || speaker.includes('阿就')) return 'fisherman';
    if (speaker.includes('小王子')) return 'prince';
    if (speaker.includes('煎蛋大师')) return 'eggking';
    if (speaker.includes('老可颂')) return 'laokesong';
    if (speaker.includes('锅叔') || speaker.includes('老矿工')) return 'miner';
    
    return 'default';
}

function initStoryRenderer() {
    if (document.getElementById('storyOverlay')) {
        storyOverlay = document.getElementById('storyOverlay');
        storyDialog = document.getElementById('storyDialog');
        storySpeaker = document.getElementById('storySpeaker');
        storyText = document.getElementById('storyText');
        storyEmoji = document.getElementById('storyEmoji');
        storyRow = document.getElementById('storyRow');
        storyTextWrapper = document.getElementById('storyTextWrapper');
        storyProgress = document.getElementById('storyProgress');
        storyClickHint = document.getElementById('storyClickHint');
        storySkipBtn = document.getElementById('storySkipBtn');
        mapRevealLayer = document.getElementById('mapRevealLayer');
        return;
    }

    if (!document.getElementById('storyAnimStyle')) {
        var style = document.createElement('style');
        style.id = 'storyAnimStyle';
        style.textContent = `
            @keyframes storyFadeIn {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }
            @keyframes storySlideUp {
                0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
                100% { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            @keyframes hintPulse {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 0.6; }
            }
            @keyframes mapEmojiPulse {
                0%, 100% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.1); opacity: 1; }
            }
            @keyframes mapRevealFadeIn {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }
            @keyframes pdTwinkle {
                0% { opacity: 0.2; transform: scale(0.8); }
                100% { opacity: 1; transform: scale(1.2); }
            }
            @keyframes pdMoonGlow {
                0% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.06)); }
                100% { filter: drop-shadow(0 0 40px rgba(255, 215, 0, 0.18)); }
            }
        `;
        document.head.appendChild(style);
    }

    var overlay = document.createElement('div');
    overlay.id = 'storyOverlay';
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(6px);
        z-index: 50;
        display: none;
        pointer-events: auto;
        transition: background 0.6s ease, backdrop-filter 0.6s ease;
    `;

    var revealLayer = document.createElement('div');
    revealLayer.id = 'mapRevealLayer';
    revealLayer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 60;
        cursor: pointer;
        background: rgba(0,0,0,0.3);
        animation: mapRevealFadeIn 0.5s ease;
    `;
    revealLayer.innerHTML = `
        <div style="
            font-size: 6rem;
            text-shadow: 0 0 60px rgba(255,215,0,0.5);
            animation: mapEmojiPulse 1.5s ease-in-out infinite;
            transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease;
        " id="mapEmoji">🗺️</div>
    `;

    var dialog = document.createElement('div');
    dialog.id = 'storyDialog';
    dialog.style.cssText = `
        position: absolute;
        bottom: 40px;
        left: 50%;
        width: 88%;
        max-width: 540px;
        background: rgba(16, 28, 44, 0.94);
        backdrop-filter: blur(12px);
        border-radius: 20px;
        padding: 16px 20px 12px;
        border: 1px solid rgba(255, 215, 150, 0.1);
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
        animation: storySlideUp 0.3s ease both;
        pointer-events: auto;
        cursor: pointer;
        z-index: 70;
        will-change: transform, opacity;
    `;
    dialog.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span id="storyProgress" style="font-size:0.5rem;color:rgba(255,255,255,0.2);">1 / 11</span>
            <button id="storySkipBtn" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);border-radius:30px;color:rgba(255,255,255,0.25);padding:1px 12px;cursor:pointer;font-size:0.5rem;display:none;">跳过</button>
        </div>
        <div id="storyRow" style="display:flex;align-items:flex-start;gap:12px;">
            <div id="storyEmoji" style="
                font-size:2.4rem;
                flex-shrink:0;
                width:48px;
                height:48px;
                display:flex;
                align-items:center;
                justify-content:center;
                background:rgba(255,255,255,0.05);
                border-radius:50%;
                border:1px solid rgba(255,255,255,0.06);
                order:0;
                overflow:hidden;
            ">
                <img id="storyAvatarImg" src="" style="width:100%;height:100%;object-fit:cover;display:none;">
                <span id="storyEmojiText">🧓</span>
            </div>
            <div id="storyTextWrapper" style="flex:1;min-width:0;order:1;">
                <div id="storySpeaker" style="font-size:0.7rem;font-weight:bold;color:#ffd700;margin-bottom:3px;">喀哺 · 老船长</div>
                <div id="storyText" style="font-size:0.9rem;color:rgba(255,255,255,0.9);line-height:1.6;min-height:2.6em;">
                    欢迎你们，小家伙们！
                </div>
            </div>
        </div>
        <div id="storyClickHint" style="
            text-align:center;
            font-size:0.55rem;
            color:rgba(255,255,255,0.2);
            margin-top:6px;
            animation: hintPulse 1.5s ease-in-out infinite;
        ">
            [ 点击继续 ]
        </div>
    `;

    overlay.appendChild(revealLayer);
    overlay.appendChild(dialog);

    var mapArea = document.querySelector('.map-area');
    if (mapArea) {
        mapArea.appendChild(overlay);
    } else {
        document.body.appendChild(overlay);
    }

    storyOverlay = overlay;
    mapRevealLayer = revealLayer;
    storyDialog = dialog;
    storySpeaker = document.getElementById('storySpeaker');
    storyText = document.getElementById('storyText');
    storyEmoji = document.getElementById('storyEmoji');
    storyRow = document.getElementById('storyRow');
    storyTextWrapper = document.getElementById('storyTextWrapper');
    storyProgress = document.getElementById('storyProgress');
    storyClickHint = document.getElementById('storyClickHint');
    storySkipBtn = document.getElementById('storySkipBtn');

    storyDialog.addEventListener('click', function(e) {
        e.stopPropagation();
        if (storyState.isWaitingForMapClick) return;
        advanceStory();
    });

    storyOverlay.addEventListener('click', function(e) {
        if (e.target === storyOverlay) {
            if (storyState.isWaitingForMapClick) return;
            advanceStory();
        }
    });

    mapRevealLayer.addEventListener('click', function(e) {
        if (storyState.isWaitingForMapClick) {
            handleMapReveal();
        }
    });

    storySkipBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (storyState.isWaitingForMapClick) return;
        skipStory();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            if (storyState.isPlaying && !storyState.isComplete) {
                if (storyState.isWaitingForMapClick) {
                    handleMapReveal();
                    return;
                }
                e.preventDefault();
                advanceStory();
            }
        }
    });

    console.log('📖 底部剧情播放器已初始化（含老矿工头像）');
}

// ============================================================
// 播放剧情（含王子星空背景）
// ============================================================
function playStory(regionId) {
    var story = STORY_DATA[regionId];
    if (!story) {
        console.warn('未找到区域剧情:', regionId);
        return;
    }
    if (story.completed) {
        showToast('📖 已探索过 ' + story.regionName + ' 的剧情', 1500);
        return;
    }

    storyState.mapRevealed = false;
    storyState.isWaitingForMapClick = false;

    initStoryRenderer();
    if (!storyOverlay) {
        console.error('❌ 剧情覆盖层未初始化');
        return;
    }

    storyState.regionId = regionId;
    storyState.currentNodeIndex = 0;
    storyState.isPlaying = true;
    storyState.isComplete = false;
    storyState.isSkipping = false;

    // 隐藏底部信息面板
    var infoMode = document.getElementById('infoMode');
    if (infoMode) {
        infoMode.style.display = 'none';
    }

    storyOverlay.style.display = 'block';

    // ===== 修改点：去掉王子剧情特殊背景 =====
    // 统一使用默认深色背景，不添加星空、月亮、沙丘等
    storyOverlay.style.background = 'rgba(0, 0, 0, 0.9)';
    storyOverlay.style.backdropFilter = 'blur(6px)';
    // 移除可能残留的王子背景元素
    var oldBg = document.getElementById('princeSceneBg');
    if (oldBg) oldBg.remove();
    // 确保对话框层级正常
    storyDialog.style.zIndex = '70';
    mapRevealLayer.style.zIndex = '60';
    // ===== 修改结束 =====

    mapRevealLayer.style.display = 'none';
    storyDialog.style.display = 'block';

    storyEmoji.style.order = '0';
    storyTextWrapper.style.order = '1';

    requestAnimationFrame(function() {
        renderStoryNode(regionId, 0);
    });

    console.log('📖 剧情开始: ' + story.regionName);
}

function handleMapReveal() {
    if (!storyState.isWaitingForMapClick) return;
    console.log('🗺️ 展开地图...');

    storyState.mapRevealed = true;
    storyState.isWaitingForMapClick = false;

    var emojiEl = document.getElementById('mapEmoji');
    if (emojiEl) {
        emojiEl.style.transform = 'scale(3)';
        emojiEl.style.opacity = '0';
    }

    storyOverlay.style.background = 'rgba(0, 0, 0, 0)';
    storyOverlay.style.backdropFilter = 'blur(0px)';

    setTimeout(function() {
        mapRevealLayer.style.display = 'none';
        storyDialog.style.display = 'block';
        if (storyClickHint) {
            storyClickHint.textContent = '[ 点击继续 ]';
            storyClickHint.style.color = 'rgba(255,255,255,0.2)';
        }
        advanceStory();
    }, 800);
}

function renderStoryNode(regionId, index) {
    var story = STORY_DATA[regionId];
    if (!story) return;

    var nodes = story.nodes;
    if (index >= nodes.length) {
        completeStory(regionId);
        return;
    }

    var node = nodes[index];
    if (!node) {
        completeStory(regionId);
        return;
    }

    if (storyProgress) {
        storyProgress.textContent = (index + 1) + ' / ' + nodes.length;
    }

    if (node.type === 'action' && node.action === 'showMap') {
        if (storyState.mapRevealed) {
            setTimeout(function() {
                advanceStory();
            }, 300);
            return;
        }

        storyDialog.style.display = 'none';
        mapRevealLayer.style.display = 'flex';
        var emojiEl = document.getElementById('mapEmoji');
        if (emojiEl) {
            emojiEl.style.transform = 'scale(1)';
            emojiEl.style.opacity = '1';
        }
        if (storyClickHint) {
            storyClickHint.textContent = '🗺️ 点击地图查看全貌';
            storyClickHint.style.color = 'rgba(255, 215, 0, 0.6)';
        }
        if (storyProgress) {
            storyProgress.textContent = '🗺️ 查看海图';
        }
        storyState.isWaitingForMapClick = true;
        return;
    }

    if (storyState.mapRevealed) {
        storyOverlay.style.background = 'rgba(0, 0, 0, 0)';
        storyOverlay.style.backdropFilter = 'blur(0px)';
    }

    storyDialog.style.display = 'block';

    if (storySpeaker) {
        storySpeaker.textContent = node.speaker || '???';
    }
    if (storyText) {
        storyText.innerHTML = node.text || '……';
    }

    var avatarType = getAvatarType(node);
    var avatarImg = document.getElementById('storyAvatarImg');
    var emojiText = document.getElementById('storyEmojiText');

    if (node.emoji) {
        avatarImg.style.display = 'none';
        emojiText.style.display = 'block';
        emojiText.textContent = node.emoji;
    } else if (avatarType && avatarType !== 'default' && AVATAR_PATHS[avatarType]) {
        avatarImg.src = AVATAR_PATHS[avatarType];
        avatarImg.style.display = 'block';
        avatarImg.onerror = function() {
            this.style.display = 'none';
            if (emojiText) {
                emojiText.style.display = 'block';
                emojiText.textContent = node.emoji || '🧓';
            }
        };
        if (emojiText) emojiText.style.display = 'none';
    } else {
        avatarImg.style.display = 'none';
        if (emojiText) {
            emojiText.style.display = 'block';
            emojiText.textContent = node.emoji || '💬';
        }
    }

    var speaker = (node.speaker || '').toLowerCase();
    var avatarContainer = storyEmoji;
    var textWrapper = storyTextWrapper;

    if (avatarContainer && textWrapper) {
        var isCaptain = speaker.includes('喀哺') || speaker.includes('老船长') || speaker.includes('船长');
        var isCocoa = speaker.includes('可可') || speaker.includes('嫑嫑');
        var isNPC = speaker.includes('渔夫') || speaker.includes('阿就') || 
                    speaker.includes('小王子') || speaker.includes('煎蛋大师') || 
                    speaker.includes('老可颂') || speaker.includes('锅叔') || speaker.includes('老矿工');

        if (isCaptain || isNPC) {
            avatarContainer.style.order = '0';
            textWrapper.style.order = '1';
        } else if (isCocoa) {
            avatarContainer.style.order = '1';
            textWrapper.style.order = '0';
        } else {
            avatarContainer.style.order = '0';
            textWrapper.style.order = '1';
        }
    }

    var isLast = (index === nodes.length - 1);
    if (storyClickHint) {
        storyClickHint.textContent = isLast ? '[ 点击完成 ]' : '[ 点击继续 ]';
        storyClickHint.style.color = 'rgba(255,255,255,0.2)';
    }
    if (storyProgress && storyProgress.textContent !== '🗺️ 查看海图') {
        storyProgress.textContent = (index + 1) + ' / ' + nodes.length;
    }
}

function advanceStory() {
    if (storyState.isSkipping) return;
    if (!storyState.isPlaying) return;
    if (storyState.isComplete) return;
    if (storyState.isWaitingForMapClick) return;

    var story = STORY_DATA[storyState.regionId];
    if (!story) return;

    var nextIndex = storyState.currentNodeIndex + 1;

    if (nextIndex < story.nodes.length) {
        storyState.currentNodeIndex = nextIndex;
        renderStoryNode(storyState.regionId, nextIndex);
    } else {
        completeStory(storyState.regionId);
    }
}

// ============================================================
// 完成剧情（奖励改为声望）
// ============================================================
function completeStory(regionId) {
    var story = STORY_DATA[regionId];
    if (!story) return;

    story.completed = true;
    storyState.isComplete = true;
    storyState.isPlaying = false;
    storyState.isWaitingForMapClick = false;

    if (mapRevealLayer) mapRevealLayer.style.display = 'none';

    var rewards = story.rewards || {};
    
    // ---- 探险币奖励 ----
    if (rewards.coins) {
        addExploreCoins(rewards.coins);
        showToast('⚓ 获得 ' + rewards.coins + ' 探险币！', 2000);
    }
    
    // ---- 声望奖励（新增） ----
    if (rewards.rep) {
        if (typeof addReputation === 'function') {
            addReputation(rewards.rep, '完成剧情：' + story.regionName);
        }
        showToast('⭐ 获得 ' + rewards.rep + ' 声望！', 1500);
    }
    
    // ---- 稻谷奖励 ----
    if (rewards.riceGrain) {
        if (typeof window.addRiceGrain === 'function') {
            window.addRiceGrain(rewards.riceGrain);
            showToast('🌾 获得 ' + rewards.riceGrain + ' 个稻谷！', 2000);
        }
    }
    
    // ---- 燃料奖励 ----
    if (rewards.ore_fuel) {
        if (typeof addBackpackItem === 'function') {
            addBackpackItem('ore_fuel', rewards.ore_fuel);
            showToast('⛽ 获得 ' + rewards.ore_fuel + ' 个燃料！', 2000);
        } else if (typeof window.addBackpackItem === 'function') {
            window.addBackpackItem('ore_fuel', rewards.ore_fuel);
            showToast('⛽ 获得 ' + rewards.ore_fuel + ' 个燃料！', 2000);
        }
    }

    // ---- 移除经验奖励（已删除 exp 处理） ----

    // 移除王子背景
    var princeBg = document.getElementById('princeSceneBg');
    if (princeBg) {
        princeBg.remove();
    }

    if (storyOverlay) {
        storyOverlay.style.display = 'none';
        storyOverlay.style.background = 'rgba(0, 0, 0, 0)';
        storyOverlay.style.backdropFilter = 'blur(0px)';
    }

    // 恢复底部信息面板
    var infoMode = document.getElementById('infoMode');
    if (infoMode) {
        infoMode.style.display = 'flex';
    }

    // 刷新地图标记和UI
    if (typeof renderMarkers === 'function') {
        renderMarkers();
    }
    if (typeof updateInfoPanel === 'function') {
        updateInfoPanel();
    }
    
    // ★ 刷新冒险者UI（确保声望显示更新）
    if (typeof updateAdventurerUI === 'function') {
        setTimeout(function() {
            updateAdventurerUI();
        }, 300);
    }

    saveStoryProgress();
    console.log('✅ 剧情完成: ' + story.regionName);
}

function skipStory() {
    if (!storyState.isPlaying) return;
    if (storyState.isComplete) return;
    if (storyState.isWaitingForMapClick) {
        handleMapReveal();
        return;
    }

    if (confirm('跳过剧情将直接获得奖励，确定吗？')) {
        storyState.isSkipping = true;
        completeStory(storyState.regionId);
        storyState.isSkipping = false;
    }
}

var exploreCoins = 0;

function loadExploreCoins() {
    try {
        var saved = localStorage.getItem('explore_coins');
        if (saved) {
            exploreCoins = parseInt(saved) || 0;
        }
    } catch(e) {
        exploreCoins = 0;
    }
    return exploreCoins;
}

function saveExploreCoins() {
    try {
        localStorage.setItem('explore_coins', String(exploreCoins));
    } catch(e) {}
}

function addExploreCoins(amount) {
    exploreCoins += amount;
    saveExploreCoins();
    var coinDisplay = document.getElementById('exploreCoinDisplay');
    if (coinDisplay) {
        coinDisplay.textContent = exploreCoins;
    }
    return exploreCoins;
}

function getExploreCoins() {
    return exploreCoins;
}

function saveStoryProgress() {
    try {
        var progress = {};
        for (var key in STORY_DATA) {
            progress[key] = STORY_DATA[key].completed;
        }
        localStorage.setItem('story_progress', JSON.stringify(progress));
    } catch(e) {}
}

function loadStoryProgress() {
    try {
        var saved = localStorage.getItem('story_progress');
        if (saved) {
            var progress = JSON.parse(saved);
            for (var key in progress) {
                if (STORY_DATA[key]) {
                    STORY_DATA[key].completed = progress[key];
                }
            }
        }
    } catch(e) {}
}

function checkAndPlayStory(regionId) {
    var story = STORY_DATA[regionId];
    if (!story) return false;
    if (story.completed) return false;

    var region = getRegion(regionId);
    if (!region) return false;
    if (region.status === 'locked') return false;

    playStory(regionId);
    return true;
}

// ============================================================
// ⭐ 播放自定义剧情（用于玫瑰种子对话等）
// ============================================================
function playCustomStory(nodes, onComplete) {
    if (!nodes || nodes.length === 0) {
        if (typeof onComplete === 'function') onComplete();
        return;
    }
    
    if (typeof initStoryRenderer !== 'function') {
        console.warn('⚠️ storyRenderer 未初始化，使用降级方案');
        showFallbackDialogue(nodes, onComplete);
        return;
    }
    
    window.STORY_DATA = window.STORY_DATA || {};
    
    var tempId = '_temp_' + Date.now();
    
    var tempStory = {
        id: tempId,
        regionName: '玫瑰种子',
        completed: false,
        mapRevealed: false,
        nodes: nodes,
        rewards: {}
    };
    
    var originalStory = window.STORY_DATA;
    var originalComplete = tempStory.completed;
    
    window.STORY_DATA[tempId] = tempStory;
    
    if (typeof window.playStory === 'function') {
        initStoryRenderer();
        
        window.playStory(tempId);
        
        var checkInterval = setInterval(function() {
            if (tempStory.completed) {
                clearInterval(checkInterval);
                delete window.STORY_DATA[tempId];
                if (typeof onComplete === 'function') onComplete();
                console.log('✅ 自定义剧情完成');
            }
        }, 300);
        
        setTimeout(function() {
            clearInterval(checkInterval);
            if (!tempStory.completed) {
                tempStory.completed = true;
                delete window.STORY_DATA[tempId];
                if (typeof onComplete === 'function') onComplete();
                console.log('⏰ 自定义剧情超时，强制完成');
            }
        }, 30000);
        
    } else {
        delete window.STORY_DATA[tempId];
        showFallbackDialogue(nodes, onComplete);
    }
}

// ============================================================
// ⭐ 降级方案：简易对话显示
// ============================================================
function showFallbackDialogue(nodes, onComplete) {
    var index = 0;
    var total = nodes.length;
    
    function showNext() {
        if (index >= total) {
            if (typeof onComplete === 'function') onComplete();
            return;
        }
        var node = nodes[index];
        var msg = node.speaker + '：' + node.text;
        if (typeof showToast === 'function') {
            showToast('💬 ' + msg, 3000);
        } else {
            console.log('💬 ' + msg);
        }
        index++;
        setTimeout(showNext, 3200);
    }
    showNext();
}

// 暴露到全局
window.playCustomStory = playCustomStory;
window.showFallbackDialogue = showFallbackDialogue;

loadExploreCoins();
loadStoryProgress();

window.STORY_DATA = STORY_DATA;
window.playStory = playStory;
window.getExploreCoins = getExploreCoins;
window.addExploreCoins = addExploreCoins;
window.loadStoryProgress = loadStoryProgress;
window.saveStoryProgress = saveStoryProgress;
window.storyState = storyState;
window.checkAndPlayStory = checkAndPlayStory;
window.advanceStory = advanceStory;
window.handleMapReveal = handleMapReveal;

console.log('📖 底部剧情系统已加载（所有NPC头像，剧情奖励改为声望）');