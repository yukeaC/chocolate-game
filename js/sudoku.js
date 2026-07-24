// ============================================================
// sudoku.js · 煎蛋海 · 9×9 数独游戏
// ============================================================

console.log('🧩 数独游戏模块加载中...');

// ============================================================
// 配置
// ============================================================
var SUDOKU_CONFIG = {
    medium: { emptyMin: 35, emptyMax: 40, label: '中等', reward: 'egg', rewardName: '鸡蛋', emoji: '🥚' },
    hard: { emptyMin: 45, emptyMax: 50, label: '困难', reward: 'golden_egg', rewardName: '金蛋', emoji: '🥚✨' }
};

// ============================================================
// 状态
// ============================================================
var sudokuState = {
    board: [],
    solution: [],
    puzzle: [],
    selectedRow: -1,
    selectedCol: -1,
    mode: 'medium',
    isComplete: false,
    isGameActive: false,
    rewardClaimed: {
        medium: false,
        hard: false
    },
    hintCount: 0,
    totalHints: 0,
    _submitted: false,
    _errors: null
};

// DOM 缓存
var sdDom = {};

// ============================================================
// 数据持久化（仅保存奖励统计，不保存已领状态）
// ============================================================
function loadSudokuRewards() {
    try {
        var saved = localStorage.getItem('sudoku_rewards');
        if (saved) {
            var data = JSON.parse(saved);
            // 只加载统计信息，不加载已领状态（已领状态每次新游戏重置）
            if (data.totalEggs !== undefined) {
                // 我们不在 sudokuState 中存储统计，而是直接读取背包
            }
        }
    } catch(e) {}
}

function saveSudokuRewards() {
    // 不再持久化已领状态，只统计数据（由背包系统管理）
}

// ============================================================
// 探险背包操作
// ============================================================
function getSudokuBackpack() {
    try {
        var saved = localStorage.getItem('explore_backpack');
        return saved ? JSON.parse(saved) : {};
    } catch(e) { return {}; }
}

function saveSudokuBackpack(backpack) {
    localStorage.setItem('explore_backpack', JSON.stringify(backpack));
}

function addEggToBackpack(type) {
    var backpack = getSudokuBackpack();
    var key = type === 'hard' ? 'golden_egg' : 'egg';
    backpack[key] = (backpack[key] || 0) + 1;
    saveSudokuBackpack(backpack);
    return backpack[key];
}

function getEggCount(type) {
    var backpack = getSudokuBackpack();
    var key = type === 'hard' ? 'golden_egg' : 'egg';
    return backpack[key] || 0;
}

// ============================================================
// 数独生成器
// ============================================================

function isValidSudoku(board, row, col, num) {
    for (var i = 0; i < 9; i++) {
        if (board[row][i] === num) return false;
        if (board[i][col] === num) return false;
    }
    var startRow = Math.floor(row / 3) * 3;
    var startCol = Math.floor(col / 3) * 3;
    for (var r = startRow; r < startRow + 3; r++) {
        for (var c = startCol; c < startCol + 3; c++) {
            if (board[r][c] === num) return false;
        }
    }
    return true;
}

function generateSudokuSolution() {
    var board = [];
    for (var i = 0; i < 9; i++) {
        board.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
    
    function solve(board) {
        for (var row = 0; row < 9; row++) {
            for (var col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    var nums = [1,2,3,4,5,6,7,8,9];
                    for (var i = nums.length - 1; i > 0; i--) {
                        var j = Math.floor(Math.random() * (i + 1));
                        var temp = nums[i];
                        nums[i] = nums[j];
                        nums[j] = temp;
                    }
                    for (var n = 0; n < nums.length; n++) {
                        var num = nums[n];
                        if (isValidSudoku(board, row, col, num)) {
                            board[row][col] = num;
                            if (solve(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
    solve(board);
    return board;
}

function generateSudokuPuzzle(solution, emptyCount) {
    var puzzle = solution.map(function(row) {
        return row.slice();
    });
    
    var positions = [];
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            positions.push([r, c]);
        }
    }
    for (var i = positions.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = positions[i];
        positions[i] = positions[j];
        positions[j] = temp;
    }
    
    var removed = 0;
    for (var p = 0; p < positions.length && removed < emptyCount; p++) {
        var r = positions[p][0];
        var c = positions[p][1];
        puzzle[r][c] = -1;
        removed++;
    }
    
    return puzzle;
}

function generateSudokuGame(mode) {
    var config = SUDOKU_CONFIG[mode] || SUDOKU_CONFIG.medium;
    var emptyCount = config.emptyMin + Math.floor(Math.random() * (config.emptyMax - config.emptyMin + 1));
    
    var solution = generateSudokuSolution();
    var puzzle = generateSudokuPuzzle(solution, emptyCount);
    
    var board = puzzle.map(function(row) {
        return row.slice();
    });
    
    return {
        board: board,
        solution: solution,
        puzzle: puzzle
    };
}

function checkSudokuComplete(board, solution) {
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            if (board[r][c] !== solution[r][c]) {
                return false;
            }
        }
    }
    return true;
}

function getSudokuErrors(board, solution) {
    var errors = [];
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            if (board[r][c] !== -1 && board[r][c] !== solution[r][c]) {
                errors.push([r, c]);
            }
        }
    }
    return errors;
}

function isSudokuCellEmpty(board, row, col) {
    return board[row][col] === -1;
}

function getHintCell(board, solution) {
    var candidates = [];
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            if (board[r][c] === -1) {
                candidates.push([r, c]);
            }
        }
    }
    if (candidates.length === 0) return null;
    var idx = Math.floor(Math.random() * candidates.length);
    var pos = candidates[idx];
    return {
        row: pos[0],
        col: pos[1],
        value: solution[pos[0]][pos[1]]
    };
}

// ============================================================
// 渲染数独游戏UI
// ============================================================
function renderSudokuGame() {
    var container = document.getElementById('sudokuContainer');
    if (!container) return;
    
    var config = SUDOKU_CONFIG[sudokuState.mode];
    var modeLabel = config.label;
    var rewardName = config.rewardName;
    
    var boardHTML = '';
    for (var r = 0; r < 9; r++) {
        boardHTML += '<div class="sd-row">';
        for (var c = 0; c < 9; c++) {
            var value = sudokuState.board[r][c];
            var isGiven = sudokuState.puzzle[r][c] !== -1;
            var display = (value !== -1) ? value : '';
            var cls = 'sd-cell';
            if (isGiven) cls += ' sd-given';
            if (r % 3 === 0) cls += ' sd-border-top';
            if (c % 3 === 0) cls += ' sd-border-left';
            if (r === 8) cls += ' sd-border-bottom';
            if (c === 8) cls += ' sd-border-right';
            if (sudokuState.selectedRow === r && sudokuState.selectedCol === c) {
                cls += ' sd-selected';
            }
            if (sudokuState._submitted && sudokuState._errors) {
                var isError = false;
                for (var e = 0; e < sudokuState._errors.length; e++) {
                    if (sudokuState._errors[e][0] === r && sudokuState._errors[e][1] === c) {
                        isError = true;
                        break;
                    }
                }
                if (isError) cls += ' sd-error';
            }
            boardHTML += '<div class="' + cls + '" data-row="' + r + '" data-col="' + c + '" onclick="onSudokuCellClick(' + r + ',' + c + ')">' + display + '</div>';
        }
        boardHTML += '</div>';
    }
    
    var emptyCount = 0;
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            if (sudokuState.board[r][c] === -1) emptyCount++;
        }
    }
    
    var isComplete = sudokuState.isComplete;
    
    container.innerHTML = `
        <div class="sd-game-container">
            <div class="sd-header">
                <div class="sd-title">
                    <span class="sd-icon">🍳</span>
                    煎蛋数独
                    <span class="sd-mode-badge">${modeLabel}</span>
                </div>
                <div class="sd-stats">
                    <div class="sd-stat">
                        <span class="sd-stat-label">🧩 剩余</span>
                        <span class="sd-stat-value" id="sdRemaining">${emptyCount}</span>
                    </div>
                    <div class="sd-stat">
                        <span class="sd-stat-label">💡 提示</span>
                        <span class="sd-stat-value" id="sdHintCount">${sudokuState.hintCount}</span>
                    </div>
                    <div class="sd-stat">
                        <span class="sd-stat-label">🥚 目标</span>
                        <span class="sd-stat-value" id="sdRewardStatus">🎯${rewardName}</span>
                    </div>
                </div>
                <button class="sd-btn-close" onclick="closeSudokuGame()">✕ 关闭</button>
            </div>
            
            <div class="sd-board-wrapper">
                <div class="sd-board" id="sdBoard">
                    ${boardHTML}
                </div>
            </div>
            
            <div class="sd-actions">
                <div class="sd-number-pad" id="sdNumberPad">
                    ${[1,2,3,4,5,6,7,8,9].map(function(n) {
                        return '<div class="sd-num-btn" onclick="onSudokuNumberInput(' + n + ')">' + n + '</div>';
                    }).join('')}
                    <div class="sd-num-btn sd-erase-btn" onclick="onSudokuErase()">⌫</div>
                </div>
                <div class="sd-controls">
                    <button class="sd-btn sd-btn-hint" onclick="onSudokuHint()">
                        💡 提示 (2⚓)
                    </button>
                    <button class="sd-btn sd-btn-submit" onclick="onSudokuSubmit()" ${isComplete ? 'disabled' : ''}>
                        ✅ 提交
                    </button>
                    <button class="sd-btn sd-btn-reset" onclick="onSudokuReset()">
                        🔄 重来
                    </button>
                </div>
            </div>
            
            <div class="sd-message" id="sdMessage">
                ${isComplete ? '🎉 完成！已获得奖励！点击"重来"再玩一局' : '📝 填入数字 1-9，全部填完后点击提交'}
            </div>
        </div>
    `;
    
    updateSudokuStats();
}

function updateSudokuStats() {
    var remaining = 0;
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            if (sudokuState.board[r][c] === -1) remaining++;
        }
    }
    var remainingEl = document.getElementById('sdRemaining');
    if (remainingEl) remainingEl.textContent = remaining;
    
    var hintEl = document.getElementById('sdHintCount');
    if (hintEl) hintEl.textContent = sudokuState.hintCount;
}

// ============================================================
// 用户交互
// ============================================================

function onSudokuCellClick(row, col) {
    if (!sudokuState.isGameActive) return;
    if (sudokuState.isComplete) return;
    if (sudokuState.puzzle[row][col] !== -1) return;
    
    sudokuState.selectedRow = row;
    sudokuState.selectedCol = col;
    renderSudokuGame();
}

function onSudokuNumberInput(num) {
    if (!sudokuState.isGameActive) return;
    if (sudokuState.isComplete) return;
    if (sudokuState.selectedRow === -1 || sudokuState.selectedCol === -1) {
        showSudokuMessage('请先点击一个空格', 'info');
        return;
    }
    var row = sudokuState.selectedRow;
    var col = sudokuState.selectedCol;
    if (sudokuState.puzzle[row][col] !== -1) {
        showSudokuMessage('这是题目给定的数字，不能修改', 'info');
        return;
    }
    sudokuState.board[row][col] = num;
    sudokuState._submitted = false;
    sudokuState._errors = null;
    // ===== 添加音效 =====
    if (typeof soundNumberInput === 'function') soundNumberInput();
    // ===== 音效添加结束 =====
    renderSudokuGame();
}

function onSudokuErase() {
    if (!sudokuState.isGameActive) return;
    if (sudokuState.isComplete) return;
    if (sudokuState.selectedRow === -1 || sudokuState.selectedCol === -1) return;
    var row = sudokuState.selectedRow;
    var col = sudokuState.selectedCol;
    if (sudokuState.puzzle[row][col] !== -1) {
        showSudokuMessage('这是题目给定的数字，不能擦除', 'info');
        return;
    }
    sudokuState.board[row][col] = -1;
    sudokuState._submitted = false;
    sudokuState._errors = null;
    renderSudokuGame();
}

function onSudokuHint() {
    if (!sudokuState.isGameActive) return;
    if (sudokuState.isComplete) return;
    
    var hasEmpty = false;
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            if (sudokuState.board[r][c] === -1) { hasEmpty = true; break; }
        }
        if (hasEmpty) break;
    }
    if (!hasEmpty) {
        showSudokuMessage('所有格子已填满，直接提交吧！', 'info');
        return;
    }
    
    if (typeof getExploreCoins === 'function') {
        var coins = getExploreCoins();
        if (coins < 2) {
            showSudokuMessage('探险币不足！需要 2 枚探险币', 'error');
            return;
        }
        if (typeof spendExploreCoins === 'function') {
            spendExploreCoins(2);
        }
    } else if (typeof window.getExploreCoins === 'function') {
        var coins = window.getExploreCoins();
        if (coins < 2) {
            showSudokuMessage('探险币不足！需要 2 枚探险币', 'error');
            return;
        }
        if (typeof window.spendExploreCoins === 'function') {
            window.spendExploreCoins(2);
        }
    }
    
    var hint = getHintCell(sudokuState.board, sudokuState.solution);
    if (!hint) {
        showSudokuMessage('没有可提示的空格', 'info');
        return;
    }
    sudokuState.board[hint.row][hint.col] = hint.value;
    sudokuState.hintCount++;
    sudokuState._submitted = false;
    sudokuState._errors = null;
    showSudokuMessage('💡 已填入 ' + hint.value + ' 到 (' + (hint.row+1) + ',' + (hint.col+1) + ')', 'success');
    renderSudokuGame();
    if (typeof updateCoinsDisplay === 'function') {
        updateCoinsDisplay();
    }
}

function onSudokuSubmit() {
    if (!sudokuState.isGameActive) return;
    if (sudokuState.isComplete) return;
    
    var hasEmpty = false;
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            if (sudokuState.board[r][c] === -1) { hasEmpty = true; break; }
        }
        if (hasEmpty) break;
    }
    if (hasEmpty) {
        showSudokuMessage('还有空格未填，请完成全部格子后再提交', 'error');
        return;
    }
    
    var errors = getSudokuErrors(sudokuState.board, sudokuState.solution);
    sudokuState._submitted = true;
    sudokuState._errors = errors;
    
    if (errors.length === 0) {
        sudokuState.isComplete = true;
        var reward = giveSudokuReward(sudokuState.mode);
        // ===== 添加音效 =====
        if (typeof soundSuccess === 'function') soundSuccess();
        // ===== 音效添加结束 =====
        if (reward) {
            var config = SUDOKU_CONFIG[sudokuState.mode];
            showSudokuMessage('🎉 完成！获得 ' + config.rewardName + '！已存入背包 🎒', 'success');
        } else {
            showSudokuMessage('✅ 数独完成！', 'success');
        }
        renderSudokuGame();
        if (typeof renderBackpack === 'function') {
            var modal = document.getElementById('backpackModal');
            if (modal && !modal.classList.contains('hidden')) {
                renderBackpack();
            }
        }
    } else {
        showSudokuMessage('❌ 有 ' + errors.length + ' 个数字不正确，请检查红色标记的位置', 'error');
        // ===== 添加音效 =====
        if (typeof soundError === 'function') soundError();
        // ===== 音效添加结束 =====
        renderSudokuGame();
    }
}

function giveSudokuReward(mode) {
    var config = SUDOKU_CONFIG[mode];
    var itemKey = config.reward;
    var itemName = config.rewardName;

    var count = addEggToBackpack(mode);

    // ===== 添加声望 =====
    if (mode === 'medium' && typeof window.addReputation === 'function') {
        window.addReputation(5, '完成煎蛋数独（中等）');
    } else if (mode === 'hard' && typeof window.addReputation === 'function') {
        window.addReputation(8, '完成煎蛋数独（困难）');
    }
    // ===== 声望添加结束 =====

    if (typeof showMessage === 'function') {
        showMessage('🎉 恭喜你获得 ' + itemName + '！已存入探险背包 🎒', false);
    }
    return true;
}

function onSudokuReset() {
    if (!sudokuState.isGameActive) return;
    // 重置奖励状态（新游戏可以重新获得奖励）
    sudokuState.rewardClaimed[sudokuState.mode] = false;
    var game = generateSudokuGame(sudokuState.mode);
    sudokuState.board = game.board;
    sudokuState.solution = game.solution;
    sudokuState.puzzle = game.puzzle;
    sudokuState.isComplete = false;
    sudokuState.selectedRow = -1;
    sudokuState.selectedCol = -1;
    sudokuState._submitted = false;
    sudokuState._errors = null;
    sudokuState.hintCount = 0;
    showSudokuMessage('🔄 已生成新的数独谜题，加油！', 'info');
    renderSudokuGame();
}

function showSudokuMessage(msg, type) {
    var el = document.getElementById('sdMessage');
    if (!el) return;
    el.textContent = msg;
    el.className = 'sd-message';
    if (type === 'success') el.classList.add('sd-msg-success');
    else if (type === 'error') el.classList.add('sd-msg-error');
    else if (type === 'info') el.classList.add('sd-msg-info');
}

function closeSudokuGame() {
    var container = document.getElementById('sudokuContainer');
    if (container) container.style.display = 'none';
    var infoMode = document.getElementById('infoMode');
    if (infoMode) infoMode.style.display = 'flex';
    if (typeof updateInfoPanel === 'function') {
        updateInfoPanel();
    }
}

// ============================================================
// 打开数独游戏（由 explore.js 调用）
// ============================================================
function openSudokuGame(mode) {
    if (!mode || (mode !== 'medium' && mode !== 'hard')) {
        mode = 'medium';
    }
    
    // 重置奖励状态（每次新游戏都可以获得奖励）
    sudokuState.rewardClaimed = {
        medium: false,
        hard: false
    };
    
    var game = generateSudokuGame(mode);
    sudokuState.mode = mode;
    sudokuState.board = game.board;
    sudokuState.solution = game.solution;
    sudokuState.puzzle = game.puzzle;
    sudokuState.isComplete = false;
    sudokuState.isGameActive = true;
    sudokuState.selectedRow = -1;
    sudokuState.selectedCol = -1;
    sudokuState._submitted = false;
    sudokuState._errors = null;
    sudokuState.hintCount = 0;
    
    var container = document.getElementById('sudokuContainer');
    if (!container) {
        var panel = document.getElementById('infoPanel');
        var modeDiv = document.createElement('div');
        modeDiv.id = 'sudokuContainer';
        modeDiv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;background:linear-gradient(145deg,#2d1b0e,#4a2c1a);border-radius:16px;z-index:4;padding:12px 16px;overflow-y:auto;border:2px solid #c98f5e;box-shadow:inset 0 0 60px rgba(0,0,0,0.6);';
        panel.appendChild(modeDiv);
        container = modeDiv;
    }
    
    container.style.display = 'block';
    var infoMode = document.getElementById('infoMode');
    if (infoMode) infoMode.style.display = 'none';
    
    renderSudokuGame();
    
    document.addEventListener('keydown', onSudokuKeydown);
}

function onSudokuKeydown(e) {
    if (!sudokuState.isGameActive) return;
    var container = document.getElementById('sudokuContainer');
    if (!container || container.style.display === 'none') return;
    
    if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        onSudokuNumberInput(parseInt(e.key));
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        onSudokuErase();
    }
    if (e.key === 'Enter') {
        e.preventDefault();
        onSudokuSubmit();
    }
    if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        onSudokuHint();
    }
}

// ============================================================
// 初始化
// ============================================================
function initSudoku() {
    console.log('🧩 数独游戏已加载');
}

// 暴露全局接口
window.sudoku = {
    open: openSudokuGame,
    close: closeSudokuGame,
    reset: onSudokuReset,
    getState: function() { return sudokuState; }
};

window.openSudokuGame = openSudokuGame;
window.closeSudokuGame = closeSudokuGame;
window.onSudokuCellClick = onSudokuCellClick;
window.onSudokuNumberInput = onSudokuNumberInput;
window.onSudokuErase = onSudokuErase;
window.onSudokuHint = onSudokuHint;
window.onSudokuSubmit = onSudokuSubmit;
window.onSudokuReset = onSudokuReset;
window.renderSudokuGame = renderSudokuGame;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSudoku);
} else {
    setTimeout(initSudoku, 100);
}

console.log('🧩 数独游戏模块加载完成');