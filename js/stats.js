// ============================================================
// stats.js · 游戏统计面板（字体调大版 + 分享功能）
// ============================================================

console.log('📊 统计系统加载中...');

// ============================================================
// 统计面板渲染
// ============================================================

function renderStatsPanel() {
    var container = document.getElementById('statsModalContent');
    if (!container) return;

    var stats = collectAllStats();

    var html = '';
    
    // ---- 标题 ----
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
    html += '  <h3 style="margin:0;color:#4a2a1a;font-family:Georgia,serif;font-size:1.2rem;">📊 游戏统计</h3>';
    html += '  <div style="display:flex;gap:8px;">';
    html += '    <button id="shareStatsBtn" style="background:#f39c12;border:none;border-radius:30px;padding:6px 18px;cursor:pointer;font-size:0.9rem;color:white;font-weight:bold;">📤 分享</button>';
    html += '    <button id="closeStatsModalBtn" style="background:#c98f5e;border:none;border-radius:30px;padding:6px 18px;cursor:pointer;font-size:0.9rem;color:white;font-weight:bold;">关闭</button>';
    html += '  </div>';
    html += '</div>';

    // ---- 统计网格 ----
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;">';

    html += createStatCard('👤', '昵称', stats.nickname, '');
    html += createStatCard('🫘', '巧克力豆', stats.beans, '当前存量');
    html += createStatCard('🪙', '金币', stats.gold, '当前存量');
    html += createStatCard('⭐', '等级', stats.level, '当前等级');
    html += createStatCard('🏭', '总制作', stats.totalProduced, '累计');
    html += createStatCard('💰', '总销售', stats.totalSold, '累计');
    html += createStatCard('📈', '总盈利', stats.totalEarned, '累计');
    html += createStatCard('🗺️', '已解锁岛屿', stats.unlockedRegions + '/' + stats.totalRegions, '进度');
    html += createStatCard('⚓', '探险币', stats.exploreCoins, '当前存量');
    html += createStatCard('⭐', '声望', stats.reputation, '累计');
    html += createStatCard('🏅', '冒险者等级', stats.adventurerRank + '级', '当前等级');
    html += createStatCard('🎣', '总钓鱼数', stats.totalFish, '累计');
    html += createStatCard('🐉', '传说鱼', stats.legendaryFish, '累计');
    html += createStatCard('🪨', '铁矿', stats.totalIron, '累计');
    html += createStatCard('💎', '钻石', stats.totalDiamond, '累计');
    html += createStatCard('🕳️', '挖矿深度', stats.miningDepth, '当前进度');
    html += createStatCard('🍳', '烹饪总数', stats.totalCooked, '累计');
    html += createStatCard('📖', '已解锁食谱', stats.unlockedRecipes + '/' + stats.totalRecipes, '进度');
    html += createStatCard('💀', '黑暗料理', stats.darkCooked, '累计');
    html += createStatCard('⚡', '能量生产', stats.totalEnergy, '累计');
    html += createStatCard('🏪', '交易次数', stats.tradeCount, '累计');
    html += createStatCard('🌾', '已解锁农田', stats.farmUnlocked + '/' + stats.farmTotal, '进度');
    html += createStatCard('🏆', '成就解锁', stats.achievementUnlocked + '/' + stats.achievementTotal, '进度');
    html += createStatCard('⏰', '游戏时间', formatTime(stats.gameTime), '累计');

    html += '</div>';

    // ---- 底部提示 ----
    html += '<div style="margin-top:14px;font-size:0.65rem;color:#a08060;text-align:center;border-top:1px solid rgba(200,160,120,0.1);padding-top:10px;">';
    html += '💡 数据每 30 秒自动更新 · 部分数据为累计值，部分为当前存量';
    html += '</div>';

    container.innerHTML = html;

    var closeBtn = document.getElementById('closeStatsModalBtn');
    if (closeBtn) {
        closeBtn.onclick = closeStatsModal;
    }

    var shareBtn = document.getElementById('shareStatsBtn');
    if (shareBtn) {
        shareBtn.onclick = function() {
            shareStats();
        };
    }

    var modal = document.getElementById('statsModal');
    if (modal) {
        modal.onclick = function(e) {
            if (e.target === this) closeStatsModal();
        };
    }
}

function createStatCard(icon, label, value, type) {
    var displayValue = (value !== undefined && value !== null) ? value : '0';
    if (typeof displayValue === 'number' && displayValue > 999) {
        displayValue = displayValue.toLocaleString();
    }
    var typeColor = {
        '累计': '#6f9e3f',
        '当前存量': '#c98f5e',
        '当前等级': '#4a90d9',
        '进度': '#9b59b6',
        '待领取': '#e7a05e'
    }[type] || '#8b7a6a';
    var typeLabel = type || '';
    return '<div style="background:rgba(255,248,240,0.3);border-radius:12px;padding:10px 8px;text-align:center;border:1px solid rgba(200,160,120,0.06);">' +
        '<div style="font-size:1.6rem;line-height:1.2;">' + icon + '</div>' +
        '<div style="font-size:0.95rem;font-weight:bold;color:#4a2a1a;">' + displayValue + '</div>' +
        '<div style="font-size:0.65rem;color:#8b7a6a;">' + label + '</div>' +
        (typeLabel ? '<div style="font-size:0.5rem;color:' + typeColor + ';margin-top:1px;">' + typeLabel + '</div>' : '') +
        '</div>';
}

// ============================================================
// 收集所有统计数据
// ============================================================

function collectAllStats() {
    var stats = {};

    stats.beans = typeof cocoaBeans !== 'undefined' ? cocoaBeans : 0;
    stats.gold = typeof gold !== 'undefined' ? gold : 0;
    stats.level = typeof level !== 'undefined' ? level : 1;
    stats.exp = typeof exp !== 'undefined' ? exp : 0;
    stats.expNeeded = typeof getExpNeeded === 'function' ? getExpNeeded(stats.level) : 100;
    stats.totalProduced = typeof totalProduced !== 'undefined' ? totalProduced : 0;
    stats.totalSold = typeof totalSold !== 'undefined' ? totalSold : 0;
    stats.totalEarned = typeof totalEarned !== 'undefined' ? Math.floor(totalEarned) : 0;
    stats.totalBeansHarvested = typeof totalBeansHarvested !== 'undefined' ? totalBeansHarvested : 0;
    stats.nickname = (typeof userProfile !== 'undefined' && userProfile.nickname) ? userProfile.nickname : '冒险者';

    // 冒险者
    if (typeof window.adventurerState !== 'undefined' && window.adventurerState) {
        stats.adventurerRank = window.adventurerState.rank || 1;
        stats.reputation = window.adventurerState.reputation || 0;
    } else if (typeof adventurerState !== 'undefined' && adventurerState) {
        stats.adventurerRank = adventurerState.rank || 1;
        stats.reputation = adventurerState.reputation || 0;
    } else {
        stats.adventurerRank = 1;
        stats.reputation = 0;
    }

    // 探险
    stats.exploreCoins = 0;
    try {
        var coins = localStorage.getItem('explore_coins');
        stats.exploreCoins = coins ? parseInt(coins) || 0 : 0;
    } catch(e) {}

    stats.unlockedRegions = 0;
    stats.totalRegions = 0;
    if (typeof window.regions !== 'undefined' && window.regions) {
        stats.totalRegions = window.regions.length;
        for (var i = 0; i < window.regions.length; i++) {
            if (window.regions[i].status !== 'locked') stats.unlockedRegions++;
        }
    } else {
        try {
            var statusMap = JSON.parse(localStorage.getItem('explore_region_status') || '{}');
            var regionKeys = ['welcome','nocean','nomo_peninsula','friedegg','croissant','dumbpan','baxian','rice','panini','nomo_ocean'];
            stats.totalRegions = regionKeys.length;
            stats.unlockedRegions = 0;
            for (var i = 0; i < regionKeys.length; i++) {
                if (statusMap[regionKeys[i]] && statusMap[regionKeys[i]] !== 'locked') {
                    stats.unlockedRegions++;
                }
            }
        } catch(e) {
            stats.unlockedRegions = 0;
            stats.totalRegions = 10;
        }
    }

    // 钓鱼
    stats.totalFish = 0;
    stats.legendaryFish = 0;
    if (typeof window.totalFishCaught !== 'undefined') {
        stats.totalFish = window.totalFishCaught || 0;
        stats.legendaryFish = window.totalLegendaryFish || 0;
    } else {
        try {
            var fishingStats = JSON.parse(localStorage.getItem('fishing_stats') || '{}');
            stats.totalFish = fishingStats.totalCaught || 0;
            stats.legendaryFish = fishingStats.totalLegendary || 0;
        } catch(e) {}
    }

    // 挖矿
    stats.totalIron = 0;
    stats.totalDiamond = 0;
    stats.miningDepth = 0;
    if (typeof window.totalIronOre !== 'undefined') {
        stats.totalIron = window.totalIronOre || 0;
        stats.totalDiamond = window.totalDiamond || 0;
    }
    if (typeof window.miningState !== 'undefined' && window.miningState) {
        stats.miningDepth = window.miningState.depth || 0;
    }
    try {
        var miningData = JSON.parse(localStorage.getItem('mining_data') || '{}');
        if (!stats.totalIron) stats.totalIron = miningData.totalIron || 0;
        if (!stats.totalDiamond) stats.totalDiamond = miningData.totalDiamond || 0;
        if (!stats.miningDepth) stats.miningDepth = miningData.depth || 0;
    } catch(e) {}

    // 烹饪
    stats.totalCooked = 0;
    stats.unlockedRecipes = 0;
    stats.totalRecipes = 0;
    stats.darkCooked = 0;
    if (typeof window.paniniState !== 'undefined' && window.paniniState) {
        stats.totalCooked = window.paniniState.totalCooked || 0;
        stats.unlockedRecipes = (window.paniniState.unlockedRecipes && window.paniniState.unlockedRecipes.length) || 0;
        stats.darkCooked = window.paniniState.darkCooked || 0;
    }
    if (typeof window.PANINI_RECIPES !== 'undefined') {
        stats.totalRecipes = window.PANINI_RECIPES.length || 0;
    } else {
        stats.totalRecipes = 29;
    }

    // 能量
    stats.totalEnergy = 0;
    if (typeof window.riceState !== 'undefined' && window.riceState) {
        stats.totalEnergy = window.riceState.totalEnergyProduced || 0;
    }

    // 交易
    stats.tradeCount = 0;
    if (typeof window.tradeTotalCount !== 'undefined') {
        stats.tradeCount = window.tradeTotalCount || 0;
    } else {
        try {
            var tradeCount = localStorage.getItem('trade_total_count');
            stats.tradeCount = tradeCount ? parseInt(tradeCount) || 0 : 0;
        } catch(e) {}
    }

    // 农场
    stats.farmUnlocked = 0;
    stats.farmTotal = 24;
    try {
        var farmData = JSON.parse(localStorage.getItem('farm_data') || '{}');
        if (farmData.lands) {
            stats.farmUnlocked = 0;
            for (var i = 0; i < farmData.lands.length; i++) {
                if (farmData.lands[i].unlocked) stats.farmUnlocked++;
            }
        }
    } catch(e) {}

    // 成就
    stats.achievementUnlocked = 0;
    stats.achievementTotal = 0;
    stats.achievementUnclaimed = 0;
    if (typeof window.getAchievementStats === 'function') {
        var achStats = window.getAchievementStats();
        stats.achievementUnlocked = achStats.unlocked || 0;
        stats.achievementTotal = achStats.total || 0;
        stats.achievementUnclaimed = achStats.unclaimed || 0;
    } else {
        try {
            var achData = JSON.parse(localStorage.getItem('achievement_data') || '{}');
            var unlocked = achData.unlocked || [];
            var claimed = achData.claimed || [];
            var defs = window.ACHIEVEMENT_DEFS || {};
            stats.achievementTotal = Object.keys(defs).length;
            stats.achievementUnlocked = unlocked.length + claimed.length;
            stats.achievementUnclaimed = unlocked.length;
        } catch(e) {}
    }

    // 游戏时间
    stats.gameTime = 0;
    if (typeof window.gameTimeStats !== 'undefined' && window.gameTimeStats) {
        stats.gameTime = window.gameTimeStats.totalSeconds || 0;
    } else {
        try {
            var achData = JSON.parse(localStorage.getItem('achievement_data') || '{}');
            stats.gameTime = (achData.gameTimeStats && achData.gameTimeStats.totalSeconds) || 0;
        } catch(e) {}
    }

    return stats;
}

// ============================================================
// 格式化时间
// ============================================================

function formatTime(seconds) {
    if (!seconds || seconds < 0) return '0秒';
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = seconds % 60;
    if (hours > 0) {
        return hours + '时' + minutes + '分';
    } else if (minutes > 0) {
        return minutes + '分' + secs + '秒';
    } else {
        return secs + '秒';
    }
}

// ============================================================
// 打开/关闭统计面板
// ============================================================

function openStatsModal() {
    var modal = document.getElementById('statsModal');
    if (!modal) {
        createStatsModal();
        modal = document.getElementById('statsModal');
    }
    renderStatsPanel();
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
}

function closeStatsModal() {
    var modal = document.getElementById('statsModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

function createStatsModal() {
    var modal = document.createElement('div');
    modal.id = 'statsModal';
    modal.className = 'modal hidden';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:none;align-items:center;justify-content:center;z-index:1000;';
    modal.innerHTML = `
        <div class="stats-modal-content" style="
            max-width:600px;
            width:95%;
            background:#faf0e0;
            background-image:radial-gradient(ellipse at 30% 20%, #faf0e0 0%, #f5e6c8 60%, #e8d5b8 100%);
            border-radius:48px;
            padding:24px 28px;
            max-height:85vh;
            overflow-y:auto;
            scrollbar-width:none;
            -ms-overflow-style:none;
            box-shadow:0 20px 60px rgba(60,40,20,0.25);
            border:1px solid #dcc8b0;
            position:relative;
        ">
            <style>
                .stats-modal-content::-webkit-scrollbar {
                    display: none !important;
                    width: 0 !important;
                    height: 0 !important;
                }
                .stats-modal-content {
                    scrollbar-width: none !important;
                    -ms-overflow-style: none !important;
                }
            </style>
            <div id="statsModalContent"></div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ============================================================
// 自动更新
// ============================================================

var statsAutoUpdateTimer = null;

function startStatsAutoUpdate() {
    if (statsAutoUpdateTimer) clearInterval(statsAutoUpdateTimer);
    statsAutoUpdateTimer = setInterval(function() {
        var modal = document.getElementById('statsModal');
        if (modal && !modal.classList.contains('hidden') && modal.style.display !== 'none') {
            renderStatsPanel();
            console.log('📊 统计面板已自动刷新');
        }
    }, 30000);
}

// ============================================================
// 分享功能（生成统计图片）
// ============================================================

function shareStats() {
    var stats = collectAllStats();
    
    // 显示加载提示
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:30%;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);color:#ffefb0;padding:8px 24px;border-radius:40px;font-size:0.9rem;z-index:9999;pointer-events:none;';
    toast.textContent = '⏳ 正在生成分享图片...';
    document.body.appendChild(toast);
    
    var canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 820;
    var ctx = canvas.getContext('2d');
    
    // 1. 羊皮纸背景
    var gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f5e6c8');
    gradient.addColorStop(1, '#e8d5b8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 装饰边框
    ctx.strokeStyle = '#d4b898';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    
    // ---- 标题（只有一个巧克力 emoji） ----
    ctx.font = 'bold 72px Georgia, serif';
    ctx.fillStyle = '#4a2a1a';
    ctx.fillText('🍫', 50, 100);
    
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#4a2a1a';
    ctx.font = 'bold 46px Georgia, serif';
    ctx.fillText('可可的巧克力工坊', 145, 90);
    
    // ---- 分隔线 ----
    ctx.strokeStyle = '#d4b898';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 150);
    ctx.lineTo(canvas.width - 40, 150);
    ctx.stroke();
    
    // ---- 统计项（包含昵称在内） ----
    var items = [
        ['👤 昵称', stats.nickname],
        ['⭐ 等级', stats.level],
        ['🪙 金币', stats.gold.toLocaleString()],
        ['🫘 巧克力豆', stats.beans.toLocaleString()],
        ['⚓ 探险币', stats.exploreCoins.toLocaleString()],
        ['⭐ 声望', stats.reputation],
        ['🏅 冒险者等级', stats.adventurerRank + '级'],
        ['🏆 成就', stats.achievementUnlocked + '/' + stats.achievementTotal],
        ['🏭 总制作', stats.totalProduced],
        ['💰 总销售', stats.totalSold],
        ['📈 总盈利', stats.totalEarned.toLocaleString()],
        ['🎣 总钓鱼数', stats.totalFish],
        ['🐉 传说鱼', stats.legendaryFish],
        ['🪨 铁矿', stats.totalIron],
        ['💎 钻石', stats.totalDiamond],
        ['🕳️ 挖矿深度', stats.miningDepth],
        ['🍳 烹饪总数', stats.totalCooked],
        ['📖 已解锁食谱', stats.unlockedRecipes + '/' + stats.totalRecipes],
        ['💀 黑暗料理', stats.darkCooked],
        ['⚡ 能量生产', stats.totalEnergy],
        ['🏪 交易次数', stats.tradeCount],
        ['🗺️ 已解锁岛屿', stats.unlockedRegions + '/' + stats.totalRegions],
        ['🌾 已解锁农田', stats.farmUnlocked + '/' + stats.farmTotal],
        ['⏰ 游戏时间', formatTime(stats.gameTime)]
    ];
    
    var leftColX = 60;
    var rightColX = canvas.width / 2 + 40;
    var lineHeight = 40;
    var yStart = 185;
    var half = Math.ceil(items.length / 2);
    
    for (var i = 0; i < items.length; i++) {
        var col = i < half ? 0 : 1;
        var row = i < half ? i : i - half;
        var x = col === 0 ? leftColX : rightColX;
        var yPos = yStart + row * lineHeight;
        var label = items[i][0];
        var value = items[i][1];
        // 标签
        ctx.fillStyle = '#5a3a2a';
        ctx.font = '20px Georgia, serif';
        ctx.fillText(label + '：', x, yPos);
        // 数值
        ctx.fillStyle = '#3d2b1a';
        ctx.font = 'bold 20px Georgia, serif';
        ctx.fillText(value, x + 160, yPos);
    }
    
    // ---- 底部信息 ----
    var now = new Date();
    var dateStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
    ctx.fillStyle = '#8b7a6a';
    ctx.font = '18px Georgia, serif';
    ctx.fillText('📅 生成时间：' + dateStr, 40, canvas.height - 40);
    ctx.fillStyle = 'rgba(180,150,120,0.3)';
    ctx.font = '14px Georgia, serif';
    ctx.fillText('可可巧克力工坊 · 自动生成', canvas.width - 280, canvas.height - 40);
    
    // ---- 生成下载 ----
    var link = document.createElement('a');
    link.download = '可可工坊_统计_' + dateStr.replace(/[/:]/g, '') + '.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.textContent = '✅ 图片已生成！';
    toast.style.background = 'rgba(46,204,113,0.8)';
    setTimeout(function() {
        if (document.body.contains(toast)) document.body.removeChild(toast);
    }, 1500);
}

// ============================================================
// 暴露全局接口
// ============================================================

window.openStatsModal = openStatsModal;
window.closeStatsModal = closeStatsModal;
window.renderStatsPanel = renderStatsPanel;
window.collectAllStats = collectAllStats;
window.shareStats = shareStats;

startStatsAutoUpdate();

console.log('📊 统计系统加载完成（字体已调大 + 分享功能）');