// ============================================================
// adventurer.js · 冒险者等级系统（最终修复版）
// 修复：声望同步、记录列表容器缺失时静默跳过
// ============================================================

console.log('🗺️ 冒险者系统加载中...');

// ============================================================
// 配置
// ============================================================
var ADVENTURER_RANKS = [
    { rank: 1, title: '浅行员', repNeeded: 0 },
    { rank: 2, title: '布浪人', repNeeded: 50 },
    { rank: 3, title: '礁星卫', repNeeded: 120 },
    { rank: 4, title: '深航者', repNeeded: 220 },
    { rank: 5, title: '果汐侍', repNeeded: 350 },
    { rank: 6, title: '白涛士', repNeeded: 520 },
    { rank: 7, title: '蛾影者', repNeeded: 750 },
    { rank: 8, title: '汤沸使', repNeeded: 1050 },
    { rank: 9, title: '可渡师', repNeeded: 1500 }
];

var ADVENTURER_MAX_RANK = 9;
var REPUTATION_RECORD_MAX = 20;

// ============================================================
// 状态
// ============================================================
var adventurerState = {
    rank: 1,
    reputation: 0,
    totalEarnedRep: 0,
    claimedRankRewards: [],
    records: []
};

// ============================================================
// 数据持久化
// ============================================================
function loadAdventurerData() {
    try {
        var saved = localStorage.getItem('adventurer_data');
        if (saved) {
            var data = JSON.parse(saved);
            adventurerState.rank = data.rank || 1;
            adventurerState.reputation = data.reputation || 0;
            adventurerState.totalEarnedRep = data.totalEarnedRep || 0;
            adventurerState.claimedRankRewards = data.claimedRankRewards || [];
            adventurerState.records = data.records || [];
            if (adventurerState.rank > ADVENTURER_MAX_RANK) {
                adventurerState.rank = ADVENTURER_MAX_RANK;
            }
            
            // ===== 修复：声望同步 =====
            if (adventurerState.totalEarnedRep > adventurerState.reputation) {
                adventurerState.reputation = adventurerState.totalEarnedRep;
                console.log('🔄 修复声望不同步: reputation=' + adventurerState.reputation + ', totalEarnedRep=' + adventurerState.totalEarnedRep);
            }
            // ===== 修复结束 =====
            
            console.log('📊 加载冒险者数据: 等级=' + adventurerState.rank + ', 声望=' + adventurerState.reputation);
            return true;
        }
    } catch(e) {
        console.warn('加载冒险者数据失败:', e);
    }
    return false;
}

function saveAdventurerData() {
    try {
        var data = {
            rank: adventurerState.rank,
            reputation: adventurerState.reputation,
            totalEarnedRep: adventurerState.totalEarnedRep,
            claimedRankRewards: adventurerState.claimedRankRewards,
            records: adventurerState.records.slice(-REPUTATION_RECORD_MAX)
        };
        localStorage.setItem('adventurer_data', JSON.stringify(data));
    } catch(e) {
        console.warn('保存冒险者数据失败:', e);
    }
}

// ============================================================
// 核心功能
// ============================================================

function getCurrentTitle() {
    var rank = adventurerState.rank;
    if (rank > ADVENTURER_MAX_RANK) rank = ADVENTURER_MAX_RANK;
    for (var i = 0; i < ADVENTURER_RANKS.length; i++) {
        if (ADVENTURER_RANKS[i].rank === rank) {
            return ADVENTURER_RANKS[i].title;
        }
    }
    return '浅行员';
}

function getNextRankRepNeeded() {
    var currentRank = adventurerState.rank;
    if (currentRank >= ADVENTURER_MAX_RANK) return Infinity;
    for (var i = 0; i < ADVENTURER_RANKS.length; i++) {
        if (ADVENTURER_RANKS[i].rank === currentRank + 1) {
            return ADVENTURER_RANKS[i].repNeeded;
        }
    }
    return Infinity;
}

function getRankProgress() {
    var currentRank = adventurerState.rank;
    if (currentRank >= ADVENTURER_MAX_RANK) return 1;
    var currentRep = adventurerState.reputation;
    var currentNeeded = 0;
    var nextNeeded = getNextRankRepNeeded();
    for (var i = 0; i < ADVENTURER_RANKS.length; i++) {
        if (ADVENTURER_RANKS[i].rank === currentRank) {
            currentNeeded = ADVENTURER_RANKS[i].repNeeded;
            break;
        }
    }
    if (nextNeeded === Infinity || nextNeeded === currentNeeded) return 1;
    return Math.min(1, (currentRep - currentNeeded) / (nextNeeded - currentNeeded));
}

function checkRankUpgrade() {
    var currentRank = adventurerState.rank;
    if (currentRank >= ADVENTURER_MAX_RANK) return false;
    
    var nextRank = currentRank + 1;
    var nextNeeded = 0;
    for (var i = 0; i < ADVENTURER_RANKS.length; i++) {
        if (ADVENTURER_RANKS[i].rank === nextRank) {
            nextNeeded = ADVENTURER_RANKS[i].repNeeded;
            break;
        }
    }
    
    if (adventurerState.reputation >= nextNeeded) {
        adventurerState.rank = nextRank;
        saveAdventurerData();
        var title = getCurrentTitle();
        console.log('🎉 升级！当前等级: ' + adventurerState.rank + ' 称号: ' + title);
        if (typeof showMessage === 'function') {
            showMessage('🎉 恭喜！你已晋升为「' + title + '」！', false);
        }
        if (typeof randomFireworks === 'function') {
            randomFireworks(3);
        }
        triggerAchievementCheck();
        return true;
    }
    return false;
}

function triggerAchievementCheck() {
    if (typeof window.checkAchievements === 'function') {
        console.log('🔍 触发成就检查 (冒险者系统)');
        try {
            window.checkAchievements();
        } catch(e) {
            console.warn('⚠️ 成就检查执行失败:', e.message);
        }
        return;
    }
    console.log('ℹ️ checkAchievements 暂不可用，跳过');
}

function addReputation(amount, source) {
    if (!amount || amount <= 0) return;
    
    adventurerState.reputation += amount;
    adventurerState.totalEarnedRep += amount;
    
    adventurerState.records.push({
        time: Date.now(),
        source: source || '未知来源',
        amount: amount
    });
    
    var upgraded = checkRankUpgrade();
    
    saveAdventurerData();
    updateAdventurerUI();
    
    if (!upgraded && typeof showMessage === 'function') {
        showMessage('⭐ 声望 +' + amount + ' (' + source + ')', false);
    }
    
    triggerAchievementCheck();
    
    return upgraded;
}

function getRankDisplayText() {
    var title = getCurrentTitle();
    var rank = adventurerState.rank;
    var rep = adventurerState.reputation;
    
    if (rank >= ADVENTURER_MAX_RANK) {
        return title + ' · 声望 ∞';
    }
    
    var nextNeeded = getNextRankRepNeeded();
    var progress = getRankProgress();
    var percent = Math.round(progress * 100);
    
    return title + ' · ' + rep + '/' + nextNeeded + ' (' + percent + '%)';
}

// ============================================================
// UI 更新
// ============================================================

function updateAdventurerUI() {
    var title = getCurrentTitle();
    var rank = adventurerState.rank;
    var rep = adventurerState.reputation;
    
    console.log('🔄 更新冒险者UI: 等级=' + rank + ', 称号=' + title + ', 声望=' + rep);
    
    var titleEl = document.getElementById('adventurerTitle');
    var repEl = document.getElementById('adventurerRep');
    var rankEl = document.getElementById('adventurerRank');
    
    if (titleEl) titleEl.textContent = title;
    if (rankEl) rankEl.textContent = '⭐ ' + title;
    if (repEl) {
        if (rank >= ADVENTURER_MAX_RANK) {
            repEl.textContent = '∞';
        } else {
            var nextNeeded = getNextRankRepNeeded();
            repEl.textContent = rep + '/' + nextNeeded;
        }
    }
    
    var detailRank = document.getElementById('detailRank');
    var detailTitle = document.getElementById('detailTitle');
    var detailTotal = document.getElementById('detailTotalRep');
    if (detailRank) detailRank.textContent = rank;
    if (detailTitle) detailTitle.textContent = title;
    if (detailTotal) detailTotal.textContent = adventurerState.totalEarnedRep;
    
    var progressBar = document.getElementById('repProgressBar');
    var progressText = document.getElementById('repProgressText');
    if (progressBar) {
        var progress = getRankProgress();
        progressBar.style.width = (progress * 100) + '%';
        if (rank >= ADVENTURER_MAX_RANK) {
            progressBar.style.background = 'linear-gradient(90deg, #ffd700, #ff6b00)';
        } else {
            progressBar.style.background = 'linear-gradient(90deg, #6f9e3f, #ffd700)';
        }
    }
    if (progressText) {
        if (rank >= ADVENTURER_MAX_RANK) {
            progressText.textContent = '可渡师 · 已达巅峰';
        } else {
            var nextNeeded = getNextRankRepNeeded();
            progressText.textContent = rep + ' / ' + nextNeeded;
        }
    }
    
    // 渲染声望记录（容器不存在时静默跳过）
    renderReputationRecords();
}

function renderReputationRecords() {
    var container = document.getElementById('repRecordsList');
    if (!container) {
        // 静默返回，不报错
        console.log('ℹ️ repRecordsList 容器不存在，跳过渲染');
        return;
    }
    
    container.innerHTML = '';
    var records = adventurerState.records.slice(-REPUTATION_RECORD_MAX).reverse();
    
    if (records.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:20px 0;color:#a56b3a;font-size:0.7rem;">暂无声望记录，去冒险吧！</div>';
        return;
    }
    
    records.forEach(function(record) {
        var item = document.createElement('div');
        item.style.cssText = 'display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(231,194,158,0.3);font-size:0.7rem;color:#5a2e1c;';
        var timeStr = new Date(record.time).toLocaleString('zh-CN', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
        item.innerHTML = 
            '<span>' + timeStr + '</span>' +
            '<span>' + record.source + '</span>' +
            '<span style="color:#6f9e3f;font-weight:bold;">+' + record.amount + '声望</span>';
        container.appendChild(item);
    });
}

// ============================================================
// 冒险者详情面板
// ============================================================

function openAdventurerPanel() {
    updateAdventurerUI();
    var modal = document.getElementById('adventurerModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    } else {
        console.warn('⚠️ 找不到 #adventurerModal');
    }
}

function closeAdventurerPanel() {
    var modal = document.getElementById('adventurerModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

// ============================================================
// 初始化
// ============================================================

function initAdventurer() {
    loadAdventurerData();
    checkRankUpgrade();
    updateAdventurerUI();
    
    triggerAchievementCheck();
    setTimeout(triggerAchievementCheck, 500);
    
    var closeBtn = document.getElementById('closeAdventurerModal');
    if (closeBtn) {
        closeBtn.onclick = closeAdventurerPanel;
    }
    
    console.log('🗺️ 冒险者系统已加载，当前称号: ' + getCurrentTitle() + '，等级: ' + adventurerState.rank);
}

// ============================================================
// 暴露全局接口
// ============================================================
window.adventurerState = adventurerState;
window.ADVENTURER_RANKS = ADVENTURER_RANKS;
window.ADVENTURER_MAX_RANK = ADVENTURER_MAX_RANK;
window.addReputation = addReputation;
window.getCurrentTitle = getCurrentTitle;
window.getRankProgress = getRankProgress;
window.getRankDisplayText = getRankDisplayText;
window.openAdventurerPanel = openAdventurerPanel;
window.closeAdventurerPanel = closeAdventurerPanel;
window.updateAdventurerUI = updateAdventurerUI;
window.initAdventurer = initAdventurer;
window.saveAdventurerData = saveAdventurerData;
window.loadAdventurerData = loadAdventurerData;
window.checkRankUpgrade = checkRankUpgrade;
window.triggerAchievementCheck = triggerAchievementCheck;
window.renderReputationRecords = renderReputationRecords;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdventurer);
} else {
    setTimeout(initAdventurer, 100);
}

console.log('🗺️ 冒险者系统加载完成（静默处理缺失容器）');