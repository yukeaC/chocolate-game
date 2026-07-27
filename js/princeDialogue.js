// ============================================================
// princeDialogue.js · 小王子对话模块（嫑锅半岛）
// 独立模块，避免 explore.js 过大
// ============================================================

console.log('🐧 小王子对话模块加载中...');

// ============================================================
// 对话数据（小王子 × 可可 · 嫑锅半岛）
// ============================================================
var PRINCE_DIALOGUES = [
    {
        speaker: '小王子',
        icon: '🐧',
        tag: '💬 话痨',
        text: '你好。你看起来不像一个大人……你像一朵 <span class="highlight">蘑菇</span>。'
    },
    {
        speaker: '可可',
        icon: '🐻‍🍫',
        tag: '😅 困惑',
        text: '蘑…蘑菇？我第一次被人说像蘑菇……你在这里做什么？'
    },
    {
        speaker: '小王子',
        icon: '🐧',
        tag: '💬 话痨',
        text: '我在等我的玫瑰。她不见了。她一定是被风吹走了。你知道风会把她吹到哪里去吗？我追着风跑了很远很远，可是风跑得比我快。<span class="highlight">它总是这样，永远不等人。</span>'
    },
    {
        speaker: '可可',
        icon: '🐻‍🍫',
        tag: '🤔 认真',
        text: '你的玫瑰……她是什么样的？也许我可以帮你 <span class="highlight-cocoa">留意</span> 一下。'
    },
    {
        speaker: '小王子',
        icon: '🐧',
        tag: '💬 话痨',
        text: '她是一朵红色的玫瑰。她有 <span class="highlight">四根刺</span>，用来保护自己。我每天给她浇水，给她除虫，晚上给她罩上玻璃罩。她很骄傲，也很温柔。她不说话，但我知道她爱我。只是……我可能太笨了，没能好好告诉她。'
    },
    {
        speaker: '可可',
        icon: '🐻‍🍫',
        tag: '😌 温暖',
        text: '听你这么说，她一定很 <span class="highlight-cocoa">特别</span>。你在这里等了多久了？'
    },
    {
        speaker: '小王子',
        icon: '🐧',
        tag: '💬 话痨',
        text: '很久很久了。这里的沙子很软，月亮很圆。我喜欢坐在沙丘上看星星。你知道吗？当我悲伤的时候，我就会看日落。<span class="highlight">有一天，我看了四十四次日落。</span>'
    },
    {
        speaker: '可可',
        icon: '🐻‍🍫',
        tag: '😢 共情',
        text: '四十四次日落……那一定是很 <span class="highlight-cocoa">悲伤</span> 的一天吧。'
    },
    {
        speaker: '小王子',
        icon: '🐧',
        tag: '💬 话痨',
        text: '是的。那是我最悲伤的一天。但今天不一样，今天我遇到了你。你知道吗？<span class="highlight">如果你驯养了我，我们就会彼此需要。</span>对我来说，你就是世界上唯一的了；对你来说，我也是世界上唯一的了。'
    },
    {
        speaker: '可可',
        icon: '🐻‍🍫',
        tag: '❓ 好奇',
        text: '驯养……是什么 <span class="highlight-cocoa">意思</span>？'
    },
    {
        speaker: '小王子',
        icon: '🐧',
        tag: '💬 话痨',
        text: '就是 <span class="highlight">建立联系</span>。你看到那边的麦田了吗？我不吃面包，麦子对我没有用。但是如果你驯养了我，一切都会变得不一样。我会喜欢风吹过麦田的声音，因为你的头发是金色的，我会 <span class="highlight">想起你</span>。'
    },
    {
        speaker: '可可',
        icon: '🐻‍🍫',
        tag: '😊 微笑',
        text: '金色……你说得好像我的头发是 <span class="highlight-cocoa">麦田</span> 一样。'
    },
    {
        speaker: '小王子',
        icon: '🐧',
        tag: '💬 话痨',
        text: '是啊！你的头发就像麦田一样。如果风穿过你的头发，也会发出沙沙的声音。那一定很好听。我喜欢好听的声音。我也喜欢星星。你知道吗？<span class="highlight">当你抬头看星星的时候，因为有一朵花在某个星球上，所有的星星都变成了花。</span>'
    },
    {
        speaker: '可可',
        icon: '🐻‍🍫',
        tag: '😌 微笑',
        text: '你真是个……奇怪的人。你说的话我有时候听得懂，有时候听不懂，但总觉得很有 <span class="highlight-cocoa">道理</span>。'
    },
    {
        speaker: '小王子',
        icon: '🐧',
        tag: '💬 话痨',
        text: '我是个小王子，当然是有点奇怪的。你愿意帮我找玫瑰吗？我一个人找了好久好久，都找不到她。也许是因为我还没有真正学会 <span class="highlight">用眼睛去看</span>。'
    },
    {
        speaker: '可可',
        icon: '🐻‍🍫',
        tag: '💛 承诺',
        text: '好啊，我帮你找。我们 <span class="highlight-cocoa">一起</span> 找。'
    },
    {
        speaker: '小王子',
        icon: '🐧',
        tag: '💛 感动',
        text: '真的吗？太好了！你真是个好人。你看起来不像一个蘑菇了，你像一个 <span class="highlight">会发光的人</span>。✨'
    }
];

// ============================================================
// 随机短句（对话完成后使用）
// ============================================================
var PRINCE_RANDOM_LINES = [
    '🌹 你回来了……她还好吗？',
    '✨ 星星真美，因为有一朵看不见的花。',
    '🌙 你知道吗？沙漠之所以美丽，是因为在某个地方藏着一口井。',
    '💛 真正重要的东西，用眼睛是看不见的。',
    '🌟 我会永远记得你。',
    '🌹 她是我独一无二的玫瑰。',
    '🐧 你今天看起来很开心。',
    '💫 你是我在这个星球上最好的朋友。',
    '🌾 你的头发还是像麦田一样金灿灿的。',
    '☀️ 今天我也看了日落，很美，但是没有你陪我看美。',
    '🌊 你最近去过海边吗？那里的风很大，会把我的思念带到很远的地方。',
    '📖 你知道吗？每颗星星上都住着一个人，他们都在等一个会发光的人。',
    '🍃 风穿过麦田的声音……好像她的笑声。',
    '🌌 当你仰望星空时，所有的星星都变成了花。',
    '💭 你知道吗？等待一个人的时候，时间会变得很慢。',
    '🌹 她曾经说过，她不怕刺，只怕我不懂她。'
];

// ============================================================
// 状态
// ============================================================
var princeDialogueState = {
    currentIndex: 0,
    isCompleted: false,
    hasVisited: false,
    randomIndex: -1,
    isActive: false
};

// DOM 缓存
var pdDom = {};
var princeBubbleTimer = null;

// ============================================================
// 数据持久化
// ============================================================
function loadPrinceDialogueState() {
    try {
        var saved = localStorage.getItem('prince_dialogue_state');
        if (saved) {
            var data = JSON.parse(saved);
            princeDialogueState.currentIndex = data.currentIndex || 0;
            princeDialogueState.isCompleted = data.isCompleted || false;
            princeDialogueState.hasVisited = data.hasVisited || false;
            princeDialogueState.randomIndex = data.randomIndex || -1;
            return true;
        }
    } catch(e) {
        console.warn('加载小王子对话状态失败:', e);
    }
    return false;
}

function savePrinceDialogueState() {
    try {
        var data = {
            currentIndex: princeDialogueState.currentIndex,
            isCompleted: princeDialogueState.isCompleted,
            hasVisited: princeDialogueState.hasVisited,
            randomIndex: princeDialogueState.randomIndex
        };
        localStorage.setItem('prince_dialogue_state', JSON.stringify(data));
    } catch(e) {
        console.warn('保存小王子对话状态失败:', e);
    }
}

function resetPrinceDialogueState() {
    princeDialogueState.currentIndex = 0;
    princeDialogueState.isCompleted = false;
    princeDialogueState.hasVisited = false;
    princeDialogueState.randomIndex = -1;
    localStorage.removeItem('prince_dialogue_state');
    console.log('🔄 小王子对话已重置');
}

// ============================================================
// 获取随机短句
// ============================================================
function getPrinceRandomLine() {
    var available = PRINCE_RANDOM_LINES.filter(function(_, i) {
        return i !== princeDialogueState.randomIndex;
    });
    if (available.length === 0) {
        princeDialogueState.randomIndex = -1;
        return PRINCE_RANDOM_LINES[Math.floor(Math.random() * PRINCE_RANDOM_LINES.length)];
    }
    var line = available[Math.floor(Math.random() * available.length)];
    princeDialogueState.randomIndex = PRINCE_RANDOM_LINES.indexOf(line);
    return line;
}

function getRandomBubbleLine() {
    var idx = Math.floor(Math.random() * PRINCE_RANDOM_LINES.length);
    return PRINCE_RANDOM_LINES[idx];
}

function startPrinceBubbleTimer() {
    if (princeBubbleTimer) {
        clearInterval(princeBubbleTimer);
        princeBubbleTimer = null;
    }
    princeBubbleTimer = setInterval(function() {
        var bubbleEl = document.getElementById('princeBubbleText');
        if (bubbleEl && bubbleEl.offsetParent !== null) {
            bubbleEl.textContent = getRandomBubbleLine();
        } else {
            if (princeBubbleTimer) {
                clearInterval(princeBubbleTimer);
                princeBubbleTimer = null;
            }
        }
    }, 8000 + Math.random() * 4000);
}

function stopPrinceBubbleTimer() {
    if (princeBubbleTimer) {
        clearInterval(princeBubbleTimer);
        princeBubbleTimer = null;
    }
}

// ============================================================
// 四段玫瑰支线剧情（使用本地头像图片）
// ============================================================

// ---- 阶段二：萌芽（30次） ----
var PRINCE_STORY_SPROUT = [
    { speaker: '小王子', avatar: 'prince', text: '她……她发芽了。' },
    { speaker: '可可', avatar: 'cocoa', text: '真的吗？让我看看！真的！好小好嫩的一株绿芽……' },
    { speaker: '嫑嫑', avatar: 'nono', text: '哼，等了30天终于冒了个头，比我还慢。' },
    { speaker: '小王子', avatar: 'prince', text: '她叫"等待"。以前我给她浇水的时候，她也是这样，总是慢吞吞的。' },
    { speaker: '可可', avatar: 'cocoa', text: '"等待"……你给她取过名字吗？' },
    { speaker: '小王子', avatar: 'prince', text: '没有。我只是……在心里这么叫她。因为她总是让我等。' },
    { speaker: '可可', avatar: 'cocoa', text: '那她这次也让你等了很久。但是你看，她终于发芽了。' },
    { speaker: '小王子', avatar: 'prince', text: '谢谢你，可可。谢谢你愿意等我。' },
    { speaker: '嫑嫑', avatar: 'nono', text: '我怎么觉得他在跟玫瑰说话，不是跟可可说话……' },
    { speaker: '可可', avatar: 'cocoa', text: '嫑嫑！你少说两句！' }
];

// ---- 阶段三：含苞（60次） ----
var PRINCE_STORY_BUD = [
    { speaker: '小王子', avatar: 'prince', text: '你看。' },
    { speaker: '可可', avatar: 'cocoa', text: '看什么……哇！她长出花苞了！' },
    { speaker: '小王子', avatar: 'prince', text: '她快开了。我能感觉到。' },
    { speaker: '可可', avatar: 'cocoa', text: '太好了！我还以为还要等很久呢。你开心吗？' },
    { speaker: '小王子', avatar: 'prince', text: '开心……但也有一点害怕。' },
    { speaker: '可可', avatar: 'cocoa', text: '害怕？为什么？' },
    { speaker: '小王子', avatar: 'prince', text: '每一次花开，都意味着……可能又要离别了。' },
    { speaker: '可可', avatar: 'cocoa', text: '你是说……等她开花了，你就要走了吗？' },
    { speaker: '小王子', avatar: 'prince', text: '我的星球在很远的地方。我本来只是路过这里……没想到遇到了你，遇到了她。' },
    { speaker: '嫑嫑', avatar: 'nono', text: '你走了以后……玫瑰怎么办？' },
    { speaker: '小王子', avatar: 'prince', text: '如果她愿意……我想带她走。' },
    { speaker: '可可', avatar: 'cocoa', text: '带她……回你的星球？' },
    { speaker: '小王子', avatar: 'prince', text: '那里有我的日落，有我的星星。我想让她看看。' },
    { speaker: '可可', avatar: 'cocoa', text: '那……我帮你一起等她开花吧。' }
];

// ---- 阶段四：花开（100次 · 第一次收获） ----
var PRINCE_STORY_BLOOM = [
    { speaker: '小王子', avatar: 'prince', text: '她开了。' },
    { speaker: '可可', avatar: 'cocoa', text: '真的……好美。' },
    { speaker: '小王子', avatar: 'prince', text: '她比我想象中的还要红。像火焰，像晚霞……像你头发里那一缕金色的光。' },
    { speaker: '可可', avatar: 'cocoa', text: '你说什么呢……' },
    { speaker: '小王子', avatar: 'prince', text: '谢谢你，可可。谢谢你帮我找回了她，也谢谢你替我照顾了她这么久。' },
    { speaker: '可可', avatar: 'cocoa', text: '你真的要带她走了吗？' },
    { speaker: '小王子', avatar: 'prince', text: '我该回去了。我的星球……和我的日落。' },
    { speaker: '嫑嫑', avatar: 'nono', text: '可可，你花了那么久种出来的玫瑰，就这么让他带走啦？' },
    { speaker: '可可', avatar: 'cocoa', text: '可是……她本来就是他的呀。' },
    { speaker: '小王子', avatar: 'prince', text: '你说得对。她一直都是我的玫瑰。但现在……她也是你的玫瑰了。' },
    { speaker: '可可', avatar: 'cocoa', text: '我的？' },
    { speaker: '小王子', avatar: 'prince', text: '这是留给你的。等你抬头看星星的时候……只要想起她，就能想起我。' },
    { speaker: '可可', avatar: 'cocoa', text: '我会的……' },
    { speaker: '小王子', avatar: 'prince', text: '我该走了。' },
    { speaker: '可可', avatar: 'cocoa', text: '等等！你……你还会回来吗？' },
    { speaker: '小王子', avatar: 'prince', text: '当九颗星辰连成一线，那扇门就会打开……到时候，我会再来找你的。' },
    { speaker: '小王子', avatar: 'prince', text: '再见了，可可。再见了，嫑嫑。谢谢你们……让我找到了回家的路。' }
];

// ---- 获取剧情数据 ----
function getPrinceStory(stage) {
    switch(stage) {
        //case 'seed': return PRINCE_STORY_SEED;
        case 'sprout': return PRINCE_STORY_SPROUT;
        case 'bud': return PRINCE_STORY_BUD;
        case 'bloom': return PRINCE_STORY_BLOOM;
        default: return null;
    }
}

// ---- 播放玫瑰支线剧情 ----
function playPrinceStory(stage, onComplete) {

// ===== 阶段一（种子）直接跳过，不播放对话 =====
    if (stage === 'seed') {
        console.log('🌹 阶段一（种子）已跳过，直接完成');
        if (typeof onComplete === 'function') onComplete();
        return;
    }
    // ===== 跳过结束 =====

    var nodes = getPrinceStory(stage);
    if (!nodes) {
        if (typeof onComplete === 'function') onComplete();
        return;
    }

    var storyNodes = nodes.map(function(node) {
        var isCocoa = node.speaker === '可可';
        var isNono = node.speaker === '嫑嫑';
        var isPrince = node.speaker === '小王子';
        var emoji = isCocoa ? '🐻‍🍫' : (isNono ? '🐧' : '🌹');
        var avatar = node.avatar || (isCocoa ? 'cocoa' : (isNono ? 'nono' : 'prince'));
        return {
            speaker: node.speaker,
            emoji: emoji,
            avatar: avatar,
            text: node.text
        };
    });

    if (typeof window.playCustomStory === 'function') {
        window.playCustomStory(storyNodes, function() {
            if (typeof onComplete === 'function') onComplete();
        });
    } else {
        // 降级方案
        showFallbackDialogue(storyNodes, onComplete);
    }
}

// ============================================================
// 生成星空
// ============================================================
function generatePrinceStars() {
    var html = '';
    var positions = [
        [5, 8, 0], [15, 15, 0.3], [25, 4, 0.6], [40, 12, 0.9],
        [55, 6, 1.2], [70, 18, 0.4], [85, 10, 0.7], [92, 22, 1.0],
        [10, 28, 0.5], [30, 22, 0.8], [50, 30, 0.2], [65, 25, 1.1],
        [80, 35, 0.6], [95, 30, 0.3], [20, 40, 0.9], [45, 45, 0.4],
        [8, 48, 0.7], [35, 50, 0.1], [60, 48, 0.8], [75, 55, 0.5],
        [88, 50, 1.2], [12, 55, 0.3], [28, 58, 0.6], [52, 60, 0.9]
    ];
    for (var i = 0; i < positions.length; i++) {
        var p = positions[i];
        var size = (i % 3 === 0) ? 3 : 2;
        html += '<div class="pd-star" style="top:' + p[0] + '%;left:' + p[1] + '%;width:' + size + 'px;height:' + size + 'px;animation-delay:' + p[2] + 's;"></div>';
    }
    return html;
}

// ============================================================
// 渲染小王子对话（替换 infoMode 内容）
// 修改：沙丘透明度提高，确保可见
// ============================================================
function renderPrinceDialogue() {
    console.log('🐧 renderPrinceDialogue 被调用');
    var infoMode = document.getElementById('infoMode');
    if (!infoMode) {
        console.warn('infoMode 不存在');
        return;
    }

    princeDialogueState.isActive = true;
    loadPrinceDialogueState();

    if (!princeDialogueState.hasVisited) {
        princeDialogueState.hasVisited = true;
        princeDialogueState.currentIndex = 0;
        princeDialogueState.isCompleted = false;
        savePrinceDialogueState();
    }

    var isComplete = princeDialogueState.isCompleted;
    var currentIdx = princeDialogueState.currentIndex;
    var total = PRINCE_DIALOGUES.length;

    var html = '';

    // ===== 背景：沙漠星空 =====
    html += '<div class="pd-scene" style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(180deg,#0a0a2e 0%,#1a1a3e 20%,#3d2b1a 55%,#6a4a2a 80%,#7a5a3a 100%);border-radius:16px;z-index:0;overflow:hidden;">';
    html += '<div class="pd-stars">' + generatePrinceStars() + '</div>';
    html += '<div class="pd-moon" style="position:absolute;top:14px;right:22px;font-size:2.6rem;z-index:1;filter:drop-shadow(0 0 30px rgba(255,215,0,0.12));">🌙</div>';

    // ===== 沙丘：高可见度，绝对定位 =====
    html += '<div class="pd-dunes" style="position:absolute;bottom:0;left:0;width:100%;height:80px;z-index:1;pointer-events:none;overflow:hidden;">';
    html += '<div class="pd-dune" style="position:absolute;bottom:0;left:-10%;width:120%;height:55px;border-radius:50%;background:rgba(200,170,130,0.5);"></div>';
    html += '<div class="pd-dune" style="position:absolute;bottom:10px;left:-5%;width:110%;height:40px;border-radius:50%;background:rgba(180,150,110,0.4);transform:rotate(-1deg);"></div>';
    html += '<div class="pd-dune" style="position:absolute;bottom:20px;left:-15%;width:130%;height:25px;border-radius:50%;background:rgba(160,130,90,0.3);transform:rotate(1deg);"></div>';
    html += '</div>';

    html += '</div>'; // 关闭 pd-scene

    // ===== 主内容 =====
    html += '<div class="pd-content" style="position:relative;z-index:2;width:100%;height:100%;display:flex;flex-direction:column;padding:12px 16px 14px;overflow:hidden;">';

    // 标题栏
    html += '<div class="pd-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;flex-shrink:0;">';
    html += '<span class="pd-title" style="color:rgba(255,215,150,0.35);font-size:0.55rem;letter-spacing:1px;font-weight:300;">🏝️ <strong style="color:rgba(255,215,150,0.55);font-weight:400;">嫑锅半岛</strong> · 沙丘</span>';
    html += '<span class="pd-badge" style="background:' + (isComplete ? 'rgba(111,158,63,0.1)' : 'rgba(255,215,0,0.08)') + ';border:1px solid ' + (isComplete ? 'rgba(111,158,63,0.12)' : 'rgba(255,215,0,0.1)') + ';border-radius:20px;padding:1px 10px;color:' + (isComplete ? '#6f9e3f' : '#ffd700') + ';font-size:0.45rem;font-weight:600;letter-spacing:0.5px;">' + (isComplete ? '💛 已探索' : '✦ 首次到达') + '</span>';
    html += '</div>';

    // 中间区域
    html += '<div class="pd-character-area" style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:2px;min-height:0;padding:2px 0;">';

    // 小王子（含头顶气泡）
    html += '<div class="pd-prince-wrapper" style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;padding:2px 0;" onclick="window.onPrinceClick && window.onPrinceClick()">';

    // 头顶气泡（仅在对话完成后显示）
    if (isComplete) {
        html += '<div id="princeBubble" style="position:absolute;top:-48px;left:50%;transform:translateX(-50%);background:rgba(255,248,240,0.92);backdrop-filter:blur(6px);border-radius:16px 16px 16px 4px;padding:4px 14px;box-shadow:0 4px 20px rgba(0,0,0,0.15);border:1px solid rgba(255,215,150,0.06);max-width:160px;white-space:nowrap;font-size:0.6rem;color:#2d1a0e;text-align:center;pointer-events:none;animation:pdBubblePop 0.4s ease;">';
        html += '  <span id="princeBubbleText" style="display:inline-block;">' + getRandomBubbleLine() + '</span>';
        html += '  <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%) rotate(45deg);width:10px;height:10px;background:rgba(255,248,240,0.92);border-right:1px solid rgba(255,215,150,0.06);border-bottom:1px solid rgba(255,215,150,0.06);"></div>';
        html += '</div>';
        setTimeout(function() {
            startPrinceBubbleTimer();
        }, 500);
    } else {
        stopPrinceBubbleTimer();
    }

    html += '<div class="pd-avatar" style="font-size:3.6rem;line-height:1.2;filter:drop-shadow(0 4px 20px rgba(0,0,0,0.3));' + (!isComplete ? 'animation:pdPrinceFloat 2.5s ease-in-out infinite;' : '') + '">🐧</div>';
    html += '<div class="pd-thought" style="font-size:1.1rem;margin-top:-4px;' + (!isComplete ? 'animation:pdBubbleFloat 2s ease-in-out infinite;' : '') + 'filter:drop-shadow(0 2px 12px rgba(255,215,0,0.08));">' + (isComplete ? '🌹' : '💭') + '</div>';
    html += '</div>';

    // 对话气泡
    html += '<div class="pd-dialogue-wrapper" style="width:100%;max-width:420px;margin-top:2px;flex-shrink:0;">';
    html += '<div class="pd-bubble" style="background:rgba(255,248,240,0.92);backdrop-filter:blur(8px);border-radius:20px 20px 20px 6px;padding:10px 14px;box-shadow:0 6px 24px rgba(0,0,0,0.2);border:1px solid rgba(255,215,150,0.06);min-height:68px;display:flex;flex-direction:column;justify-content:center;">';

    var entry = null;
    if (!isComplete && currentIdx < total) {
        entry = PRINCE_DIALOGUES[currentIdx];
    }

    if (isComplete) {
        html += '<div class="pd-speaker" style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">';
        html += '<span style="font-size:0.95rem;">🐧</span>';
        html += '<span style="font-size:0.6rem;font-weight:600;color:#c98f5e;">小王子</span>';
        html += '<span style="background:rgba(111,158,63,0.1);padding:0 6px;border-radius:12px;font-size:0.45rem;color:#6f9e3f;">💛 朋友</span>';
        html += '</div>';
        html += '<div class="pd-text" id="pdText" style="font-size:0.88rem;line-height:1.6;color:#2d1a0e;min-height:22px;">' + getPrinceRandomLine() + '</div>';
        html += '<div style="text-align:right;font-size:0.4rem;color:rgba(90,46,28,0.08);margin-top:2px;">💛 老朋友</div>';
    } else if (entry) {
        var isCocoa = entry.speaker === '可可';
        html += '<div class="pd-speaker" style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">';
        html += '<span style="font-size:0.95rem;">' + entry.icon + '</span>';
        html += '<span style="font-size:0.6rem;font-weight:600;color:' + (isCocoa ? '#6f9e3f' : '#c98f5e') + ';">' + entry.speaker + '</span>';
        html += '<span style="background:' + (isCocoa ? 'rgba(111,158,63,0.08)' : 'rgba(201,143,94,0.08)') + ';padding:0 6px;border-radius:12px;font-size:0.45rem;color:' + (isCocoa ? '#6f9e3f' : '#c98f5e') + ';">' + entry.tag + '</span>';
        html += '</div>';
        html += '<div class="pd-text" id="pdText" style="font-size:0.88rem;line-height:1.6;color:#2d1a0e;min-height:22px;">' + entry.text + '</div>';

        html += '<div class="pd-progress" style="display:flex;justify-content:flex-end;align-items:center;gap:6px;margin-top:4px;">';
        html += '<span class="pd-hint" style="font-size:0.4rem;color:rgba(90,46,28,0.1);letter-spacing:0.3px;">💡 点击继续</span>';
        html += '<div class="pd-dots" style="display:flex;gap:2px;">';
        for (var d = 0; d < total; d++) {
            var cls = 'pd-dot';
            if (d < currentIdx) cls += ' done';
            else if (d === currentIdx) cls += ' active';
            html += '<span class="' + cls + '" style="width:5px;height:5px;border-radius:50%;background:' + 
                (d < currentIdx ? '#6f9e3f' : d === currentIdx ? '#c98f5e' : 'rgba(90,46,28,0.1)') + 
                ';transition:0.2s;display:inline-block;"></span>';
        }
        html += '</div>';
        html += '</div>';
    }

    html += '</div>';
    html += '</div>';
    html += '</div>';

    // 按钮
    if (!isComplete) {
        html += '<div class="pd-actions" style="display:flex;gap:8px;margin-top:4px;justify-content:center;flex-shrink:0;">';
        html += '<button class="pd-btn pd-btn-primary" id="pdNextBtn" style="padding:4px 20px;border:none;border-radius:30px;background:linear-gradient(135deg,#f7971e,#ffd200);color:#1a1a2e;font-weight:600;font-size:0.7rem;cursor:pointer;box-shadow:0 4px 16px rgba(247,151,30,0.15);transition:0.15s;">' + (currentIdx >= total - 1 ? '💛 接受任务' : '▶ 继续') + '</button>';
        html += '</div>';
    } else {
        html += '<div class="pd-actions" style="display:flex;gap:8px;margin-top:4px;justify-content:center;flex-shrink:0;">';
        html += '<button class="pd-btn pd-btn-ghost" id="pdResetBtn" style="padding:3px 16px;border:none;border-radius:30px;background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.3);font-weight:400;font-size:0.6rem;cursor:pointer;border:1px solid rgba(255,255,255,0.04);transition:0.15s;">↻ 重听</button>';
        html += '</div>';
    }

    html += '</div>'; // 关闭 pd-content

    infoMode.innerHTML = html;
    infoMode.style.display = 'flex';
    infoMode.style.background = 'transparent';
    infoMode.style.border = '2px solid rgba(255,215,150,0.06)';
    infoMode.style.borderRadius = '16px';
    infoMode.style.overflow = 'hidden';
    infoMode.style.padding = '0';
    infoMode.style.position = 'relative';

    console.log('✅ 沙丘 HTML 已生成，长度:', html.length);
    console.log('沙丘片段:', html.substring(html.indexOf('pd-dunes'), html.indexOf('pd-dunes') + 200));

    // 绑定事件...
    var nextBtn = document.getElementById('pdNextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (typeof window.onPrinceClick === 'function') {
                window.onPrinceClick();
            }
        });
    }

    var resetBtn = document.getElementById('pdResetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm('重新听一遍小王子的故事吗？')) {
                resetPrinceDialogueState();
                renderPrinceDialogue();
                refreshPrinceActions();
            }
        });
    }

    infoMode.onclick = function(e) {
        if (e.target.closest('button')) return;
        if (e.target.closest('.pd-dots')) return;
        if (e.target.closest('.pd-progress')) return;
        if (typeof window.onPrinceClick === 'function') {
            window.onPrinceClick();
        }
    };

    if (typeof window.refreshPrinceActions === 'function') {
        window.refreshPrinceActions();
    }
}
// ============================================================
// 点击小王子或继续按钮
// ============================================================
function onPrinceClick() {
    if (princeDialogueState.isCompleted) {
        var line = getPrinceRandomLine();
        var textEl = document.getElementById('pdText');
        if (textEl) {
            textEl.textContent = line;
        }
        savePrinceDialogueState();
        return;
    }

    var total = PRINCE_DIALOGUES.length;
    if (princeDialogueState.currentIndex >= total) {
        princeDialogueState.isCompleted = true;
        princeDialogueState.isActive = false;
        savePrinceDialogueState();
        renderPrinceDialogue();
        refreshPrinceActions();
        return;
    }

    princeDialogueState.currentIndex++;
    if (princeDialogueState.currentIndex >= total) {
        princeDialogueState.isCompleted = true;
        princeDialogueState.isActive = false;
        savePrinceDialogueState();
    } else {
        savePrinceDialogueState();
    }
    renderPrinceDialogue();
    refreshPrinceActions();
}

// ============================================================
// 刷新动作按钮（由 explore.js 调用）
// ============================================================
function refreshPrinceActions() {
    var actionButtons = document.getElementById('actionButtons');
    if (!actionButtons) return;

    actionButtons.innerHTML = '';

    var backBtn = document.createElement('button');
    backBtn.className = 'btn-travel';
    backBtn.textContent = '🗺️ 返回地图';
    backBtn.style.background = 'rgba(255,255,255,0.06)';
    backBtn.style.border = '1px solid rgba(255,255,255,0.04)';
    backBtn.style.color = 'rgba(255,255,255,0.4)';
    backBtn.style.fontSize = '0.6rem';
    backBtn.style.padding = '4px 14px';
    backBtn.onclick = function() {
        exitPrinceDialogue();
    };
    actionButtons.appendChild(backBtn);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'btn-close-map';
    closeBtn.textContent = '✕ 关闭';
    closeBtn.style.background = 'rgba(255,255,255,0.04)';
    closeBtn.style.border = '1px solid rgba(255,255,255,0.04)';
    closeBtn.style.color = 'rgba(255,255,255,0.3)';
    closeBtn.style.fontSize = '0.6rem';
    closeBtn.style.padding = '4px 14px';
    closeBtn.onclick = function() {
        window.location.href = 'index.html';
    };
    actionButtons.appendChild(closeBtn);
}

// ============================================================
// 退出小王子对话（返回普通视图）
// ============================================================
function exitPrinceDialogue() {
    var infoMode = document.getElementById('infoMode');
    if (infoMode) {
        infoMode.innerHTML = '';
        infoMode.style.background = '';
        infoMode.style.border = '';
        infoMode.style.borderRadius = '';
        infoMode.style.overflow = '';
        infoMode.style.padding = '';
        infoMode.style.position = '';
        infoMode.onclick = null;
    }

    princeDialogueState.isActive = false;

    if (typeof window.updateInfoPanel === 'function') {
        if (typeof window.getCurrentRegion === 'function') {
            var current = window.getCurrentRegion();
            if (current) {
                window.updateInfoPanel();
            }
        } else {
            window.updateInfoPanel();
        }
    }
}

// ============================================================
// 检查是否应该显示小王子对话
// ============================================================
function shouldShowPrinceDialogue(regionId) {
    return regionId === 'nomo_peninsula';
}

// ============================================================
// 初始化
// ============================================================
function initPrinceDialogue() {
    loadPrinceDialogueState();
    console.log('🐧 小王子对话模块已加载');
    console.log('📖 共 ' + PRINCE_DIALOGUES.length + ' 句对话');
    console.log('📊 状态: ' + (princeDialogueState.isCompleted ? '已完成' : '进行中 ' + princeDialogueState.currentIndex + '/' + PRINCE_DIALOGUES.length));
}

// ============================================================
// 暴露全局接口
// ============================================================
window.princeDialogue = {
    render: renderPrinceDialogue,
    onPrinceClick: onPrinceClick,
    exit: exitPrinceDialogue,
    reset: resetPrinceDialogueState,
    refreshActions: refreshPrinceActions,
    isActive: function() { return princeDialogueState.isActive; },
    isCompleted: function() { return princeDialogueState.isCompleted; },
    getState: function() { return princeDialogueState; }
};

window.onPrinceClick = onPrinceClick;
window.exitPrinceDialogue = exitPrinceDialogue;
window.refreshPrinceActions = refreshPrinceActions;
window.renderPrinceDialogue = renderPrinceDialogue;
window.playPrinceStory = playPrinceStory;
window.getPrinceStory = getPrinceStory;
window.getRandomBubbleLine = getRandomBubbleLine;
window.startPrinceBubbleTimer = startPrinceBubbleTimer;
window.stopPrinceBubbleTimer = stopPrinceBubbleTimer;

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrinceDialogue);
} else {
    setTimeout(initPrinceDialogue, 100);
}

console.log('🐧 小王子对话模块加载完成（含头顶气泡和玫瑰支线剧情，沙丘已修复可见）');