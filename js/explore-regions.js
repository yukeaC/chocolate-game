// ============================================================
// explore-regions.js · 各区域特殊UI（对话数据 + 渲染）
// ============================================================

console.log('🗺️ 区域特殊UI加载中...');

// ============================================================
// 小王子对话数据（头像使用本地图片）
// ============================================================
var PRINCE_DIALOGUES_DATA = [
    { speaker: '小王子', avatar: 'images/prince.png', text: '你好。你看起来不像一个大人……你像一朵 <span style="color:#ffd700;">蘑菇</span>。' },
    { speaker: '可可', avatar: 'images/coco.png', text: '蘑…蘑菇？我第一次被人说像蘑菇……你在这里做什么？' },
    { speaker: '小王子', avatar: 'images/prince.png', text: '我在等我的玫瑰。她不见了。她一定是被风吹走了。你知道风会把她吹到哪里去吗？<span style="color:#ffd700;">它总是这样，永远不等人。</span>' },
    { speaker: '可可', avatar: 'images/coco.png', text: '你的玫瑰……她是什么样的？也许我可以帮你 <span style="color:#6f9e3f;">留意</span> 一下。' },
    { speaker: '小王子', avatar: 'images/prince.png', text: '她是一朵红色的玫瑰。她有 <span style="color:#ffd700;">四根刺</span>，用来保护自己。我很爱她，但我太笨了，没能好好告诉她。' },
    { speaker: '可可', avatar: 'images/coco.png', text: '听你这么说，她一定很 <span style="color:#6f9e3f;">特别</span>。你在这里等了多久了？' },
    { speaker: '小王子', avatar: 'images/prince.png', text: '很久了。这里的沙子很软，月亮很圆。你知道吗？当我悲伤的时候，我就会看日落。<span style="color:#ffd700;">有一天，我看了四十四次日落。</span>' },
    { speaker: '可可', avatar: 'images/coco.png', text: '四十四次日落……那一定是很 <span style="color:#6f9e3f;">悲伤</span> 的一天吧。' },
    { speaker: '小王子', avatar: 'images/prince.png', text: '是的。但今天不一样，今天我遇到了你。你知道吗？<span style="color:#ffd700;">如果你驯养了我，我们就会彼此需要。</span>' },
    { speaker: '可可', avatar: 'images/coco.png', text: '驯养……是什么 <span style="color:#6f9e3f;">意思</span>？' },
    { speaker: '小王子', avatar: 'images/prince.png', text: '就是 <span style="color:#ffd700;">建立联系</span>。如果你驯养了我，我会喜欢风吹过麦田的声音，因为你的头发是金色的。' },
    { speaker: '可可', avatar: 'images/coco.png', text: '金色……你说得好像我的头发是 <span style="color:#6f9e3f;">麦田</span> 一样。' },
    { speaker: '小王子', avatar: 'images/prince.png', text: '是啊！你的头发就像麦田一样。我喜欢星星。<span style="color:#ffd700;">当你抬头看星星的时候，所有的星星都变成了花。</span>' },
    { speaker: '可可', avatar: 'images/coco.png', text: '你真是个……奇怪的人。你说的话我有时候听得懂，有时候听不懂，但总觉得很有 <span style="color:#6f9e3f;">道理</span>。' },
    { speaker: '小王子', avatar: 'images/prince.png', text: '我是个小王子，当然是有点奇怪的。你愿意帮我找玫瑰吗？我一个人找了好久，都找不到她。' },
    { speaker: '可可', avatar: 'images/coco.png', text: '好啊，我帮你找。我们 <span style="color:#6f9e3f;">一起</span> 找。' },
    { speaker: '小王子', avatar: 'images/prince.png', text: '真的吗？太好了！你看起来不像一个蘑菇了，你像一个 <span style="color:#ffd700;">会发光的人</span>。✨' }
];

var PRINCE_SHORT_LINES_DATA = [
    '🌹 你回来了……她还好吗？',
    '✨ 星星真美，因为有一朵看不见的花。',
    '🌙 你知道吗？沙漠之所以美丽，是因为在某个地方藏着一口井。',
    '💛 真正重要的东西，用眼睛是看不见的。',
    '🌟 我会永远记得你。',
    '🌹 她是我独一无二的玫瑰。',
    '🐧 你今天看起来很开心。',
    '💫 你是我在这个星球上最好的朋友。',
    '🌾 你的头发还是像麦田一样金灿灿的。',
    '☀️ 今天我也看了日落，很美。'
];

// ============================================================
// 可颂大陆对话数据（老可颂头像使用 images/default.png）
// ============================================================
var CROISSANT_DIALOGUES = [
    { speaker: '老可颂', avatar: 'images/default.png', text: '哦？新面孔！我是老可颂，这片大陆最早的商人。' },
    { speaker: '可可', avatar: 'images/coco.png', text: '您好！我们是从欢迎米来湾过来的。' },
    { speaker: '老可颂', avatar: 'images/default.png', text: '欢迎米来湾？哈哈哈！我年轻的时候啊，经常去那里进货。那时候的鱼啊，又大又肥，不像现在……' },
    { speaker: '可可', avatar: 'images/coco.png', text: '您在这里做生意很久了吗？' },
    { speaker: '老可颂', avatar: 'images/default.png', text: '三十年了。我见过无数的冒险者，有的满载而归，有的两手空空。做生意嘛，眼光比运气更重要。' },
    { speaker: '可可', avatar: 'images/coco.png', text: '这里真的是"世界的贸易中心"啊……' },
    { speaker: '老可颂', avatar: 'images/default.png', text: '没错！不管是鱼、蛋，还是稀奇古怪的东西，你都能在这里找到买家或者卖家。' },
    { speaker: '可可', avatar: 'images/coco.png', text: '那……您这里收什么东西？' },
    { speaker: '老可颂', avatar: 'images/default.png', text: '什么都收！只要你有的，我都能给你一个好价钱。当然，我的货也是最好的。' },
    { speaker: '可可', avatar: 'images/coco.png', text: '那我们可以交易吗？' },
    { speaker: '老可颂', avatar: 'images/default.png', text: '哈哈哈！当然可以！来，看看我的货，再看看你的背包——咱们公平交易。' },
    { speaker: '可可', avatar: 'images/coco.png', text: '那就麻烦您了！' },
    { speaker: '老可颂', avatar: 'images/default.png', text: '不麻烦不麻烦！我这个人啊，最喜欢和年轻人做生意了。你有眼光！' }
];

var CROISSANT_SHORT_LINES = [
    '又来啦？今天带了什么好东西？',
    '我的货永远是最好的，你看看。',
    '价格公道，童叟无欺！',
    '你运气好，今天刚进了一批新鲜货。',
    '我年轻的时候啊，可比现在能跑多了。',
    '做生意嘛，诚信最重要。'
];

// ============================================================
// 小王子状态管理
// ============================================================
var princeLocalState = {
    currentIndex: 0,
    isCompleted: false,
    hasVisited: false,
    randomIndex: -1
};

function loadPrinceLocalState() {
    try {
        var saved = localStorage.getItem('prince_dialogue_state');
        if (saved) {
            var data = JSON.parse(saved);
            princeLocalState.currentIndex = data.currentIndex || 0;
            princeLocalState.isCompleted = data.isCompleted || false;
            princeLocalState.hasVisited = data.hasVisited || false;
            princeLocalState.randomIndex = data.randomIndex || -1;
            return true;
        }
    } catch(e) {}
    return false;
}

function savePrinceLocalState() {
    try {
        var data = {
            currentIndex: princeLocalState.currentIndex,
            isCompleted: princeLocalState.isCompleted,
            hasVisited: princeLocalState.hasVisited,
            randomIndex: princeLocalState.randomIndex
        };
        localStorage.setItem('prince_dialogue_state', JSON.stringify(data));
    } catch(e) {}
}

function getPrinceShortLine() {
    var available = PRINCE_SHORT_LINES_DATA.filter(function(_, i) {
        return i !== princeLocalState.randomIndex;
    });
    if (available.length === 0) {
        princeLocalState.randomIndex = -1;
        return PRINCE_SHORT_LINES_DATA[Math.floor(Math.random() * PRINCE_SHORT_LINES_DATA.length)];
    }
    var line = available[Math.floor(Math.random() * available.length)];
    princeLocalState.randomIndex = PRINCE_SHORT_LINES_DATA.indexOf(line);
    return line;
}

// ============================================================
// 可颂大陆状态管理
// ============================================================
var croissantState = {
    currentIndex: 0,
    isCompleted: false,
    hasVisited: false,
    randomIndex: -1
};

function loadCroissantState() {
    try {
        var saved = localStorage.getItem('croissant_state');
        if (saved) {
            var data = JSON.parse(saved);
            croissantState.currentIndex = data.currentIndex || 0;
            croissantState.isCompleted = data.isCompleted || false;
            croissantState.hasVisited = data.hasVisited || false;
            croissantState.randomIndex = data.randomIndex || -1;
            return true;
        }
    } catch(e) {}
    return false;
}

function saveCroissantState() {
    try {
        var data = {
            currentIndex: croissantState.currentIndex,
            isCompleted: croissantState.isCompleted,
            hasVisited: croissantState.hasVisited,
            randomIndex: croissantState.randomIndex
        };
        localStorage.setItem('croissant_state', JSON.stringify(data));
    } catch(e) {}
}

function getCroissantShortLine() {
    var available = CROISSANT_SHORT_LINES.filter(function(_, i) {
        return i !== croissantState.randomIndex;
    });
    if (available.length === 0) {
        croissantState.randomIndex = -1;
        return CROISSANT_SHORT_LINES[Math.floor(Math.random() * CROISSANT_SHORT_LINES.length)];
    }
    var line = available[Math.floor(Math.random() * available.length)];
    croissantState.randomIndex = CROISSANT_SHORT_LINES.indexOf(line);
    return line;
}

// ============================================================
// 渲染对话头像辅助函数
// ============================================================
function getAvatarHTML(avatarPath, size) {
    size = size || 40;
    if (!avatarPath) {
        return '<span style="font-size:' + (size * 0.8) + 'px;">👤</span>';
    }
    return '<img src="' + avatarPath + '" style="width:' + size + 'px;height:' + size + 'px;object-fit:contain;border-radius:50%;background:rgba(0,0,0,0.1);" onerror="this.style.display=\'none\'; this.parentElement.innerHTML=\'<span style=font-size:' + (size * 0.8) + 'px;>👤</span>\';">';
}

// ============================================================
// 导出到全局
// ============================================================
window.PRINCE_DIALOGUES_DATA = PRINCE_DIALOGUES_DATA;
window.PRINCE_SHORT_LINES_DATA = PRINCE_SHORT_LINES_DATA;
window.princeLocalState = princeLocalState;
window.loadPrinceLocalState = loadPrinceLocalState;
window.savePrinceLocalState = savePrinceLocalState;
window.getPrinceShortLine = getPrinceShortLine;

window.CROISSANT_DIALOGUES = CROISSANT_DIALOGUES;
window.CROISSANT_SHORT_LINES = CROISSANT_SHORT_LINES;
window.croissantState = croissantState;
window.loadCroissantState = loadCroissantState;
window.saveCroissantState = saveCroissantState;
window.getCroissantShortLine = getCroissantShortLine;

window.getAvatarHTML = getAvatarHTML;

console.log('🗺️ 区域特殊UI数据加载完成（头像使用本地图片）');