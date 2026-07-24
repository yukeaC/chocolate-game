// ============================================================
// princeGame.js · 小王子 · 三杯一球（嫑锅半岛小游戏）
// ============================================================

console.log('🐧 小王子游戏模块加载中...');

// ============================================================
// 状态
// ============================================================
var princeGameState = {
    isOpen: false,
    betAmount: 1,
    streak: 0,
    cups: [],
    ballIndex: -1,
    selectedIndex: -1,
    phase: 'idle', // idle, betting, revealing, swapping, choosing, result_win, result_lose
    swapTimer: null,
    swapCount: 0,
    swapInterval: 800,
    isGameOver: false
};

// DOM 缓存
var pgDom = {};

// ============================================================
// 获取/设置探险币（与主游戏共享，不在此处重置）
// ============================================================
function getExploreCoins() {
    try {
        var saved = localStorage.getItem('explore_coins');
        return saved ? parseInt(saved) || 0 : 0;
    } catch(e) { return 0; }
}

function saveExploreCoins(amount) {
    localStorage.setItem('explore_coins', String(amount));
    // 同步更新导航栏
    if (typeof window.updateCoinsDisplay === 'function') {
        window.updateCoinsDisplay();
    }
}

function addExploreCoins(amount) {
    var current = getExploreCoins();
    var newTotal = current + amount;
    saveExploreCoins(newTotal);
    return newTotal;
}

function spendExploreCoins(amount) {
    var current = getExploreCoins();
    if (current < amount) return false;
    saveExploreCoins(current - amount);
    return true;
}

// ============================================================
// 渲染游戏UI（内联样式，确保布局和背景）
// ============================================================
function renderPrinceGame() {
    var container = document.getElementById('princeGameContainer');
    if (!container) return;

    // 确保容器背景色（内联）
    container.style.background = 'linear-gradient(145deg, #2d1b0e, #4a2c1a)';
    container.style.border = '2px solid #c98f5e';
    container.style.boxShadow = 'inset 0 0 60px rgba(0,0,0,0.6)';

    var coins = getExploreCoins();

    container.innerHTML = `
        <div class="pg-game-container">
            <!-- 头部：左右分离 -->
            <div class="pg-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 10px;">
                <div class="pg-title-area" style="display: flex; flex-direction: column; align-items: flex-start; gap: 6px;">
                    <div class="pg-title" style="display: flex; align-items: center; gap: 8px; color: #ffefcf; font-size: 18px; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">
                        <span class="pg-icon" style="font-size: 22px;">🐧</span>
                        小王子 · 三杯一球
                    </div>
                    <div class="pg-stats" style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <div class="pg-stat-item" style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.4); padding: 2px 10px 2px 6px; border-radius: 40px; color: #e8e8e8; font-size: 12px; font-weight: 500; border: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(4px);">
                            <span class="pg-label" style="opacity: 0.6; font-weight: 400;">⚓</span>
                            <span class="pg-value pg-coins" id="pgCoinsDisplay" style="font-weight: 700; font-size: 13px; min-width: 14px; text-align: center; color: #ffd700;">${coins}</span>
                        </div>
                        <div class="pg-stat-item" style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.4); padding: 2px 10px 2px 6px; border-radius: 40px; color: #e8e8e8; font-size: 12px; font-weight: 500; border: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(4px);">
                            <span class="pg-label" style="opacity: 0.6; font-weight: 400;">🎲 下注</span>
                            <span class="pg-value pg-bet" id="pgBetDisplay" style="font-weight: 700; font-size: 13px; min-width: 14px; text-align: center; color: #7ecfff;">1</span>
                        </div>
                        <div class="pg-stat-item" style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.4); padding: 2px 10px 2px 6px; border-radius: 40px; color: #e8e8e8; font-size: 12px; font-weight: 500; border: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(4px);">
                            <span class="pg-label" style="opacity: 0.6; font-weight: 400;">🔥 连胜</span>
                            <span class="pg-value pg-streak" id="pgStreakDisplay" style="font-weight: 700; font-size: 13px; min-width: 14px; text-align: center; color: #ff7eb3;">0</span>
                        </div>
                    </div>
                </div>
                <button class="pg-btn-exit" id="pgExitBtn" style="flex-shrink: 0; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 30px; padding: 2px 14px; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 13px; line-height: 28px; transition: 0.15s; margin-top: 2px;">✕ 退出</button>
            </div>

            <!-- 杯子舞台 -->
            <div class="pg-stage" id="pgStage" style="position: relative; width: 100%; height: 150px; margin: 10px 0 6px; display: flex; justify-content: center; align-items: flex-end; background: rgba(0,0,0,0.15); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.05);">
                <!-- 杯子由JS生成 -->
            </div>

            <!-- 消息 -->
            <div class="pg-message-area" style="text-align: center; padding: 8px 10px 4px; min-height: 48px;">
                <div class="pg-message" id="pgMainMsg" style="font-size: 16px; font-weight: 500; color: rgba(255,255,255,0.85); line-height: 1.4; text-shadow: 0 1px 4px rgba(0,0,0,0.4);">🎯 点击 <span class="pg-highlight" style="color: #ffd700; font-weight: 700;">继续</span> 开始</div>
                <div class="pg-sub-message" id="pgSubMsg" style="font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 2px;">下注 1 探险币，猜中得 2 探险币</div>
            </div>

            <!-- 按钮 -->
            <div class="pg-actions" style="display: flex; justify-content: center; gap: 10px; margin-top: 8px; flex-wrap: wrap;">
                <button class="pg-btn pg-btn-primary pg-btn-glow" id="pgContinueBtn" style="padding: 8px 22px; border: none; border-radius: 40px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.3); background: linear-gradient(135deg, #f7971e, #ffd200); color: #1a1a2e; animation: pgGlowPulse 1.8s ease-in-out infinite;">▶ 继续</button>
                <button class="pg-btn pg-btn-danger hidden" id="pgRestartBtn" style="padding: 8px 22px; border: none; border-radius: 40px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.3); background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff;">🔄 重来</button>
            </div>
        </div>
    `;

    // 缓存DOM
    pgDom.container = container;
    pgDom.coinsDisplay = document.getElementById('pgCoinsDisplay');
    pgDom.betDisplay = document.getElementById('pgBetDisplay');
    pgDom.streakDisplay = document.getElementById('pgStreakDisplay');
    pgDom.stage = document.getElementById('pgStage');
    pgDom.mainMsg = document.getElementById('pgMainMsg');
    pgDom.subMsg = document.getElementById('pgSubMsg');
    pgDom.continueBtn = document.getElementById('pgContinueBtn');
    pgDom.restartBtn = document.getElementById('pgRestartBtn');
    pgDom.exitBtn = document.getElementById('pgExitBtn');

    // 绑定事件
    pgDom.continueBtn.addEventListener('click', pgContinueGame);
    pgDom.restartBtn.addEventListener('click', pgRestartGame);
    pgDom.exitBtn.addEventListener('click', pgCloseGame);

    // 初始化游戏（生成杯子）
    pgResetGame();

    // 按钮悬浮效果
    document.querySelectorAll('.pg-btn').forEach(function(btn) {
        btn.addEventListener('mouseenter', function() {
            if (!this.disabled) this.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// ============================================================
// 杯子相关（所有样式内联，确保可见）
// ============================================================
function pgInitCups() {
    var stage = pgDom.stage || document.getElementById('pgStage');
    if (!stage) {
        console.error('pgStage not found');
        return [];
    }
    stage.innerHTML = '';
    var positions = [10, 45, 80];
    var cupData = [];
    for (var i = 0; i < 3; i++) {
        var wrapper = document.createElement('div');
        wrapper.className = 'pg-cup-wrapper';
        wrapper.dataset.index = i;
        // 关键样式：定位、尺寸、鼠标
        wrapper.style.position = 'absolute';
        wrapper.style.bottom = '0';
        wrapper.style.left = positions[i] + '%';
        wrapper.style.transform = 'translateX(-50%)';
        wrapper.style.width = '90px';
        wrapper.style.height = '110px';
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';
        wrapper.style.cursor = 'pointer';
        wrapper.style.transition = 'left 0.4s cubic-bezier(0.34, 1.0, 0.64, 1)';
        wrapper.style.zIndex = '1';

        // 杯子
        var cup = document.createElement('div');
        cup.className = 'pg-cup';
        cup.style.width = '72px';
        cup.style.height = '90px';
        cup.style.position = 'relative';
        cup.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
        cup.style.transformOrigin = 'bottom center';
        cup.innerHTML = `
            <div class="pg-cup-body" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:70px;height:76px;background:linear-gradient(160deg,#f0e6d3,#d4c5a0);clip-path:polygon(8% 0%,92% 0%,100% 100%,0% 100%);border-radius:0 0 10px 10px;box-shadow:0 6px 20px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.06) inset;"></div>
            <div class="pg-cup-rim" style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:66px;height:12px;background:radial-gradient(ellipse at center,rgba(255,255,255,0.15),rgba(200,180,150,0.05));border-radius:50%;box-shadow:0 -2px 8px rgba(0,0,0,0.2),0 0 0 2px rgba(255,255,255,0.04) inset;border-top:1px solid rgba(255,255,255,0.1);"></div>
            <div class="pg-cup-shine" style="position:absolute;top:12%;left:15%;width:18%;height:40%;background:radial-gradient(ellipse,rgba(255,255,255,0.2) 0%,transparent 70%);border-radius:50%;transform:rotate(-20deg);pointer-events:none;"></div>
        `;

        // 球
        var ball = document.createElement('div');
        ball.className = 'pg-ball pg-ball-hidden';
        ball.style.position = 'absolute';
        ball.style.bottom = '-4px';
        ball.style.left = '50%';
        ball.style.transform = 'translateX(-50%) scale(0)';
        ball.style.width = '34px';
        ball.style.height = '34px';
        ball.style.borderRadius = '50%';
        ball.style.background = 'radial-gradient(circle at 35% 30%, #ffec8a, #f7b731 50%, #d4891b 90%)';
        ball.style.boxShadow = '0 6px 20px rgba(247,183,49,0.4), 0 0 0 2px rgba(255,215,0,0.1) inset';
        ball.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s';
        ball.style.zIndex = '5';
        ball.style.pointerEvents = 'none';
        ball.innerHTML = '<div style="position:absolute;top:8%;left:18%;width:35%;height:30%;background:radial-gradient(ellipse,rgba(255,255,255,0.6) 0%,transparent 70%);border-radius:50%;transform:rotate(-30deg);"></div>';

        wrapper.appendChild(cup);
        wrapper.appendChild(ball);

        cupData.push({
            wrapper: wrapper,
            ball: ball,
            index: i,
            hasBall: false
        });
        stage.appendChild(wrapper);
    }
    return cupData;
}

function pgUpdateCupPositions() {
    var positions = [10, 45, 80];
    princeGameState.cups.forEach(function(cup, idx) {
        cup.wrapper.style.left = positions[idx] + '%';
        cup.wrapper.style.transform = 'translateX(-50%)';
        cup.index = idx;
    });
}

function pgResetCupsVisual(keepBallHidden) {
    princeGameState.cups.forEach(function(c) {
        c.wrapper.classList.remove('pg-raised', 'pg-show-ball', 'pg-disabled', 'pg-highlight-correct', 'pg-highlight-wrong', 'pg-shake');
        if (keepBallHidden) {
            c.ball.classList.add('pg-ball-hidden');
            c.ball.style.transform = 'translateX(-50%) scale(0)';
        } else {
            c.ball.classList.remove('pg-ball-hidden');
            c.ball.style.transform = 'translateX(-50%) scale(1)';
        }
    });
}

function pgRevealBall(index, show) {
    var cup = princeGameState.cups[index];
    if (show) {
        cup.wrapper.classList.add('pg-raised', 'pg-show-ball');
        cup.ball.classList.remove('pg-ball-hidden');
        cup.ball.style.transform = 'translateX(-50%) scale(1)';
    } else {
        cup.wrapper.classList.remove('pg-raised', 'pg-show-ball');
        cup.ball.classList.add('pg-ball-hidden');
        cup.ball.style.transform = 'translateX(-50%) scale(0)';
    }
}

function pgSetCupsEnabled(enabled) {
    princeGameState.cups.forEach(function(c) {
        if (enabled) {
            c.wrapper.classList.remove('pg-disabled');
        } else {
            c.wrapper.classList.add('pg-disabled');
        }
    });
}

// ============================================================
// 游戏核心逻辑
// ============================================================
function pgUpdateUI() {
    if (pgDom.coinsDisplay) pgDom.coinsDisplay.textContent = getExploreCoins();
    if (pgDom.betDisplay) pgDom.betDisplay.textContent = princeGameState.betAmount;
    if (pgDom.streakDisplay) pgDom.streakDisplay.textContent = princeGameState.streak;
}

function pgSetMessage(text, type) {
    var cls = type === 'win' ? 'pg-win' : type === 'lose' ? 'pg-lose' : 'pg-info';
    pgDom.mainMsg.innerHTML = text;
    pgDom.mainMsg.className = 'pg-message ' + cls;
}

function pgSetSubMessage(text) {
    pgDom.subMsg.textContent = text;
}

function pgPerformSwap() {
    var idx1 = Math.floor(Math.random() * 3);
    var idx2 = Math.floor(Math.random() * 3);
    while (idx1 === idx2) {
        idx2 = Math.floor(Math.random() * 3);
    }
    var left1 = princeGameState.cups[idx1].wrapper.style.left;
    var left2 = princeGameState.cups[idx2].wrapper.style.left;
    princeGameState.cups[idx1].wrapper.style.left = left2;
    princeGameState.cups[idx2].wrapper.style.left = left1;
    var tmpIdx = princeGameState.cups[idx1].index;
    princeGameState.cups[idx1].index = princeGameState.cups[idx2].index;
    princeGameState.cups[idx2].index = tmpIdx;
}

function pgStartSwaps() {
    princeGameState.swapCount = 0;
    var totalSwaps = 6;
    var interval = princeGameState.swapInterval;

    pgSetCupsEnabled(false);
    pgSetMessage('🔄 杯子开始交换...', 'info');
    pgSetSubMessage('共交换 ' + totalSwaps + ' 次');

    if (princeGameState.swapTimer) {
        clearInterval(princeGameState.swapTimer);
        princeGameState.swapTimer = null;
    }

    princeGameState.swapTimer = setInterval(function() {
        if (princeGameState.swapCount >= totalSwaps) {
            clearInterval(princeGameState.swapTimer);
            princeGameState.swapTimer = null;
            pgOnSwapsComplete();
            return;
        }
        pgPerformSwap();
        princeGameState.swapCount++;
        pgSetSubMessage('交换中 ' + princeGameState.swapCount + '/' + totalSwaps);
    }, interval);
}

function pgOnSwapsComplete() {
    princeGameState.phase = 'choosing';
    pgSetCupsEnabled(true);
    pgSetMessage('🤔 球在哪个杯子下面？点击选择！', 'info');
    pgSetSubMessage('选对则继续翻倍，选错则失去下注币');
}

// ============================================================
// 游戏流程控制（重来：只重置内部状态，不影响探险币）
// ============================================================
function pgResetGame() {
    princeGameState.betAmount = 1;
    princeGameState.streak = 0;
    princeGameState.swapInterval = 800;
    princeGameState.isGameOver = false;
    princeGameState.phase = 'idle';
    princeGameState.selectedIndex = -1;
    princeGameState.swapCount = 0;

    if (princeGameState.swapTimer) {
        clearInterval(princeGameState.swapTimer);
        princeGameState.swapTimer = null;
    }

    // 重新生成杯子
    princeGameState.cups = pgInitCups();
    var ballIdx = Math.floor(Math.random() * 3);
    princeGameState.cups.forEach(function(c, i) {
        c.hasBall = (i === ballIdx);
    });
    princeGameState.ballIndex = ballIdx;
    pgResetCupsVisual(true);
    princeGameState.cups.forEach(function(c) { c.ball.classList.add('pg-ball-hidden'); });
    pgRevealBall(ballIdx, false);

    pgSetCupsEnabled(false);

    pgDom.continueBtn.classList.remove('hidden');
    pgDom.continueBtn.disabled = false;
    pgDom.continueBtn.textContent = '▶ 继续';
    pgDom.restartBtn.classList.add('hidden');

    pgSetMessage('🎯 点击 <span class="pg-highlight">继续</span> 开始游戏', 'info');
    pgSetSubMessage('下注 1 探险币，猜中得 2 探险币');
    pgUpdateUI(); // 刷新显示（但不修改探险币）
    pgUpdateCupPositions();
}

// 重来：重置游戏状态，但不重置探险币
function pgRestartGame() {
    if (princeGameState.swapTimer) {
        clearInterval(princeGameState.swapTimer);
        princeGameState.swapTimer = null;
    }
    pgResetGame();
    pgSetMessage('🔄 游戏已重置，点击 <span class="pg-highlight">继续</span> 开始', 'info');
    pgSetSubMessage('下注 1 探险币，猜中得 2 探险币');
    pgUpdateUI(); // 确保探险币显示最新
}

function pgContinueGame() {
    if (pgDom.continueBtn.disabled) return;
    
    if (princeGameState.phase === 'result_win') {
        var nextBet = princeGameState.betAmount * 2;
        var currentCoins = getExploreCoins();
        if (currentCoins < nextBet) {
            pgSetMessage('💰 探险币不足，无法继续', 'lose');
            pgSetSubMessage('需要 ' + nextBet + ' 探险币，你只有 ' + currentCoins + ' 探险币');
            pgDom.continueBtn.disabled = true;
            pgDom.continueBtn.textContent = '💰 币不足';
            return;
        }
        princeGameState.betAmount = nextBet;
        princeGameState.phase = 'idle';
        pgDom.continueBtn.textContent = '▶ 继续';
        pgStartBetRound();
        return;
    }

    if (princeGameState.phase === 'idle' || princeGameState.phase === 'result_lose') {
        pgStartBetRound();
        return;
    }
}

function pgStartBetRound() {
    var currentCoins = getExploreCoins();
    if (currentCoins < princeGameState.betAmount) {
        pgSetMessage('💔 探险币不够了！点击 <span class="pg-highlight">重来</span>', 'lose');
        pgSetSubMessage('需要 ' + princeGameState.betAmount + ' 探险币，你只有 ' + currentCoins + ' 探险币');
        pgDom.continueBtn.classList.add('hidden');
        pgDom.restartBtn.classList.remove('hidden');
        return;
    }

    if (!spendExploreCoins(princeGameState.betAmount)) {
        return;
    }
    // ===== 添加音效 =====
    if (typeof soundBet === 'function') soundBet();
    // ===== 音效添加结束 =====

    princeGameState.isGameOver = false;
    princeGameState.phase = 'betting';
    princeGameState.selectedIndex = -1;

    princeGameState.cups = pgInitCups();
    var ballIdx = Math.floor(Math.random() * 3);
    princeGameState.cups.forEach(function(c, i) {
        c.hasBall = (i === ballIdx);
    });
    princeGameState.ballIndex = ballIdx;
    pgUpdateCupPositions();
    pgResetCupsVisual(true);
    princeGameState.cups.forEach(function(c) { c.ball.classList.add('pg-ball-hidden'); });
    pgRevealBall(ballIdx, false);

    pgSetCupsEnabled(false);

    pgDom.continueBtn.disabled = true;
    pgDom.continueBtn.textContent = '⏳ 游戏中...';
    pgDom.restartBtn.classList.add('hidden');

    pgSetMessage('👀 看仔细了！球在哪个杯子下？', 'info');
    pgSetSubMessage('下注 ' + princeGameState.betAmount + ' 探险币，猜中得 ' + (princeGameState.betAmount * 2) + ' 探险币');
    pgRevealBall(ballIdx, true);
    princeGameState.phase = 'revealing';

    var self = this;
    setTimeout(function() {
        pgRevealBall(ballIdx, false);
        princeGameState.phase = 'swapping';
        pgStartSwaps();
    }, 1200);

    pgUpdateUI();
}

function pgSelectCup(index) {
    if (princeGameState.phase !== 'choosing' || princeGameState.isGameOver) return;
    if (princeGameState.selectedIndex !== -1) return;

    princeGameState.selectedIndex = index;
    princeGameState.phase = 'result';
    pgSetCupsEnabled(false);

    princeGameState.cups.forEach(function(c, i) {
        c.wrapper.classList.add('pg-raised');
        if (c.hasBall) {
            c.ball.classList.remove('pg-ball-hidden');
            c.ball.style.transform = 'translateX(-50%) scale(1)';
            c.wrapper.classList.add('pg-show-ball');
        } else {
            c.ball.classList.add('pg-ball-hidden');
            c.ball.style.transform = 'translateX(-50%) scale(0)';
            c.wrapper.classList.remove('pg-show-ball');
        }
    });

    var selected = princeGameState.cups[index];
    var isWin = selected.hasBall;

    if (isWin) {
        var winAmount = princeGameState.betAmount * 2;
        addExploreCoins(winAmount);
        // ===== 添加音效 =====
        if (typeof soundVictory === 'function') soundVictory();
        // ===== 音效添加结束 =====
        princeGameState.streak += 1;
        princeGameState.swapInterval = Math.max(200, 800 - princeGameState.streak * 80);

        selected.wrapper.classList.add('pg-highlight-correct');
        pgSetMessage('🎉 赢了！获得 <span class="pg-highlight">' + winAmount + '</span> 探险币！', 'win');
        pgSetSubMessage('连胜 ' + princeGameState.streak + ' 场！下注翻倍为 ' + (princeGameState.betAmount * 2) + ' 探险币');

        princeGameState.phase = 'result_win';
        pgDom.continueBtn.disabled = false;
        pgDom.continueBtn.classList.remove('hidden');
        pgDom.continueBtn.textContent = '▶ 继续 (' + (princeGameState.betAmount * 2) + ' 探险币)';
        pgDom.restartBtn.classList.add('hidden');

        var nextBet = princeGameState.betAmount * 2;
        if (getExploreCoins() < nextBet) {
            pgDom.continueBtn.disabled = true;
            pgDom.continueBtn.textContent = '💰 币不足';
            pgSetSubMessage('需要 ' + nextBet + ' 探险币继续，你只有 ' + getExploreCoins() + ' 探险币');
        }

        pgUpdateUI();

    } else {
        princeGameState.isGameOver = true;
        princeGameState.streak = 0;
        // ===== 添加音效 =====
        if (typeof soundError === 'function') soundError();
        // ===== 音效添加结束 =====
        selected.wrapper.classList.add('pg-highlight-wrong', 'pg-shake');
        princeGameState.cups.forEach(function(c) {
            if (c.hasBall) {
                c.wrapper.classList.add('pg-highlight-correct');
            }
        });

        var lostAmount = princeGameState.betAmount;
        pgSetMessage('💔 猜错了。失去了 ' + lostAmount + ' 探险币', 'lose');
        pgSetSubMessage('连胜终止，点击重来');

        princeGameState.phase = 'result_lose';
        pgDom.continueBtn.classList.add('hidden');
        pgDom.restartBtn.classList.remove('hidden');

        if (getExploreCoins() <= 0) {
            pgSetMessage('💀 你输光了所有探险币！点击 <span class="pg-highlight">重来</span>', 'lose');
            pgSetSubMessage('重来将重新开始游戏（探险币保留）');
        }
        pgUpdateUI();
    }
}

function pgCloseGame() {
    if (princeGameState.swapTimer) {
        clearInterval(princeGameState.swapTimer);
        princeGameState.swapTimer = null;
    }
    princeGameState.isOpen = false;
    var container = document.getElementById('princeGameContainer');
    if (container) container.style.display = 'none';
    var infoMode = document.getElementById('infoMode');
    if (infoMode) infoMode.style.display = 'flex';
}

// ============================================================
// 打开游戏（由外部调用）
// ============================================================
function openPrinceGame() {
    var container = document.getElementById('princeGameContainer');
    if (!container) {
        var panel = document.getElementById('infoPanel');
        var mode = document.createElement('div');
        mode.id = 'princeGameContainer';
        // 内联样式直接设置背景色、边框、阴影
        mode.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;background:linear-gradient(145deg,#2d1b0e,#4a2c1a);border-radius:16px;z-index:4;padding:12px 16px;overflow-y:auto;border:2px solid #c98f5e;box-shadow:inset 0 0 60px rgba(0,0,0,0.6);';
        panel.appendChild(mode);
        container = mode;
    } else {
        // 如果已存在，确保显示并更新背景
        container.style.display = 'block';
        container.style.background = 'linear-gradient(145deg,#2d1b0e,#4a2c1a)';
        container.style.border = '2px solid #c98f5e';
        container.style.boxShadow = 'inset 0 0 60px rgba(0,0,0,0.6)';
    }

    var infoMode = document.getElementById('infoMode');
    if (infoMode) infoMode.style.display = 'none';

    princeGameState.isOpen = true;
    renderPrinceGame();

    // 事件绑定
    setTimeout(function() {
        var stage = document.getElementById('pgStage');
        if (stage) {
            stage.removeEventListener('click', pgStageClickHandler);
            stage.addEventListener('click', pgStageClickHandler);
        }
    }, 50);

    document.addEventListener('keydown', pgKeyHandler);
}

// 独立的stage点击处理函数
function pgStageClickHandler(e) {
    var wrapper = e.target.closest('.pg-cup-wrapper');
    if (!wrapper) return;
    if (wrapper.classList.contains('pg-disabled')) return;
    var index = parseInt(wrapper.dataset.index);
    if (isNaN(index)) return;
    pgSelectCup(index);
}

function pgKeyHandler(e) {
    if (!princeGameState.isOpen) return;
    if (e.key >= '1' && e.key <= '3') {
        var idx = parseInt(e.key) - 1;
        if (princeGameState.phase === 'choosing' && !princeGameState.isGameOver) {
            pgSelectCup(idx);
        }
    }
    if (e.key === 'Enter' || e.key === ' ') {
        if (!pgDom.continueBtn.classList.contains('hidden') && !pgDom.continueBtn.disabled) {
            pgDom.continueBtn.click();
        } else if (!pgDom.restartBtn.classList.contains('hidden')) {
            pgDom.restartBtn.click();
        }
    }
}

// ============================================================
// 暴露全局接口
// ============================================================
window.princeGame = {
    open: openPrinceGame,
    close: pgCloseGame,
    isOpen: function() { return princeGameState.isOpen; }
};

window.openPrinceGame = openPrinceGame;

console.log('🐧 小王子 · 三杯一球游戏已加载（背景修复+重来不重置币）');