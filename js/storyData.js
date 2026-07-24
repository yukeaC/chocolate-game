// ============================================================
// storyData.js · 可可世界区域剧情数据（完整版 · 已删除嫑界洋）
// ============================================================

var STORY_DATA = {

    // ============================================================
    // 欢迎米来湾 · 新手村剧情
    // ============================================================
    welcome: {
        id: 'welcome',
        regionName: '欢迎米来湾',
        icon: '🌊',
        completed: false,
        mapRevealed: false,
        nodes: [
            {
                id: 'node_1',
                speaker: '嫑嫑',
                text: '？！这是什么地方',
                avatar: 'nono'
            },
            {
                id: 'node_2',
                speaker: '可可',
                text: '嘘，你看那边，有个老先生，看起来像是本地人。我们过去问问他吧。',
                avatar: 'cocoa'
            },
            {
                id: 'node_3',
                speaker: '喀哺',
                text: '欢迎你们，小家伙们！欢迎来到 "欢迎米来湾" —— 所有伟大航程的起点！别紧张，你们可不是第一个迷迷糊糊被海浪卷到这里来的小冒险家。',
                avatar: 'captain'
            },
            {
                id: 'node_4',
                speaker: '可可',
                text: '原来这里叫"欢迎米来湾"啊……老爷爷，我们该怎么回去呀？',
                avatar: 'cocoa'
            },
            {
                id: 'node_5',
                speaker: '喀哺',
                text: '回去？年轻人，被大海选中，来到这儿，可不是为了回去的！看你们一脸迷茫，一定还没看过真正的航海图吧？',
                avatar: 'captain'
            },
            {
                id: 'node_6',
                type: 'action',
                action: 'showMap',
                text: '（点击地图显示全貌）'
            },
            {
                id: 'node_7',
                speaker: '喀哺',
                text: '这是一张我年轻时候用过的"初航者海图"，上面标注了附近最安全也最有趣的几个小岛。既然有缘，就送给你们了！',
                avatar: 'captain'
            },
            {
                id: 'node_8',
                speaker: '喀哺',
                text: '喏，接着！这是给你们的 —— 10枚 "探险币" ！',
                avatar: 'captain'
            },
            {
                id: 'node_9',
                speaker: '可可',
                text: '谢谢喀哺爷爷！我们记住了！',
                avatar: 'cocoa'
            },
            {
                id: 'node_10',
                speaker: '嫑嫑',
                text: '可可！快看！这艘小船好像就是给我们准备的！我们这就出海探险吧！',
                avatar: 'nono'
            },
            {
                id: 'node_11',
                speaker: '喀哺',
                text: '去吧去吧！记住，风是朋友，浪是考验。欢迎米来湾的日出，永远等着勇敢的水手回家！下次见面，可要给我讲讲你们的奇遇啊！',
                avatar: 'captain'
            }
        ],
        rewards: {
            coins: 10,
            rep: 20
        }
    },

    // ============================================================
    // 可以就这洋 · 完整剧情
    // ============================================================
    nocean: {
        id: 'nocean',
        regionName: '可以就这洋',
        icon: '🎣',
        completed: false,
        mapRevealed: false,
        nodes: [
            {
                id: 'node_1',
                speaker: '可可',
                text: '这里就是"可以就这洋"吗？海面好平静啊，跟欢迎米来湾完全不一样。',
                avatar: 'cocoa'
            },
            {
                id: 'node_2',
                speaker: '嫑嫑',
                text: '看！那边有个人在钓鱼！我们过去问问吧。',
                avatar: 'nono'
            },
            {
                id: 'node_3',
                speaker: '渔夫 · 阿就',
                text: '哟，新面孔！你们是从欢迎米来湾过来的吧？那老喀哺还好吗？',
                avatar: 'fisherman'
            },
            {
                id: 'node_4',
                speaker: '可可',
                text: '您好！喀哺爷爷给了我们一张海图，我们就顺着航路找过来了。他说这里的鱼很特别，我们想来见识见识。',
                avatar: 'cocoa'
            },
            {
                id: 'node_5',
                speaker: '渔夫 · 阿就',
                text: '哈哈哈，喀哺那老家伙还记得这片海啊……没错，这片海叫"可以就这洋"，名字是怪了点，但鱼是真多。',
                avatar: 'fisherman'
            },
            {
                id: 'node_6',
                speaker: '渔夫 · 阿就',
                text: '你们看那边——水面泛着银光的地方，就是鱼群。运气好的话，能钓到蓝鲸鱼，甚至传说鱼。',
                avatar: 'fisherman'
            },
            {
                id: 'node_7',
                speaker: '嫑嫑',
                text: '传说鱼？！真的存在吗？',
                avatar: 'nono'
            },
            {
                id: 'node_8',
                speaker: '渔夫 · 阿就',
                text: '我在这片海钓了三十多年，也只见过三次。不过嘛——只要你有耐心，总有相遇的一天。',
                avatar: 'fisherman'
            },
            {
                id: 'node_9',
                speaker: '渔夫 · 阿就',
                text: '想学钓鱼吗？我这儿刚好有根备用的鱼竿。第一次不收你钱，算是见面礼。',
                avatar: 'fisherman'
            },
            {
                id: 'node_10',
                speaker: '可可',
                text: '真的可以吗？谢谢阿就爷爷！',
                avatar: 'cocoa'
            },
            {
                id: 'node_11',
                speaker: '渔夫 · 阿就',
                text: '叫我阿就就行。钓鱼要领就一个——抛竿要准，收竿要快。你多练几次就摸到门道了。',
                avatar: 'fisherman'
            },
            {
                id: 'node_12',
                speaker: '嫑嫑',
                text: '可可！我们快去试试吧！我已经等不及要钓一条大鱼了！',
                avatar: 'nono'
            },
            {
                id: 'node_13',
                speaker: '渔夫 · 阿就',
                text: '去吧去吧，钓到传说鱼记得请我喝一杯！',
                avatar: 'fisherman'
            }
        ],
        rewards: {
            coins: 5,
            rep: 10
        }
    },

    // ============================================================
    // 嫑锅半岛 · 小王子剧情
    // ============================================================
    nomo_peninsula: {
        id: 'nomo_peninsula',
        regionName: '嫑锅半岛',
        icon: '🐧',
        completed: false,
        mapRevealed: false,
        nodes: [
            {
                id: 'node_1',
                speaker: '小王子',
                text: '你好。你看起来不像一个大人……你像一朵 <span style="color:#ffd700;">蘑菇</span>。',
                avatar: 'prince'
            },
            {
                id: 'node_2',
                speaker: '可可',
                text: '蘑…蘑菇？我第一次被人说像蘑菇……你在这里做什么？',
                avatar: 'cocoa'
            },
            {
                id: 'node_3',
                speaker: '小王子',
                text: '我在等我的玫瑰。她不见了。她一定是被风吹走了。你知道风会把她吹到哪里去吗？<span style="color:#ffd700;">它总是这样，永远不等人。</span>',
                avatar: 'prince'
            },
            {
                id: 'node_4',
                speaker: '可可',
                text: '你的玫瑰……她是什么样的？也许我可以帮你 <span style="color:#6f9e3f;">留意</span> 一下。',
                avatar: 'cocoa'
            },
            {
                id: 'node_5',
                speaker: '小王子',
                text: '她是一朵红色的玫瑰。她有 <span style="color:#ffd700;">四根刺</span>，用来保护自己。我很爱她，但我太笨了，没能好好告诉她。',
                avatar: 'prince'
            },
            {
                id: 'node_6',
                speaker: '可可',
                text: '听你这么说，她一定很 <span style="color:#6f9e3f;">特别</span>。你在这里等了多久了？',
                avatar: 'cocoa'
            },
            {
                id: 'node_7',
                speaker: '小王子',
                text: '很久了。这里的沙子很软，月亮很圆。你知道吗？当我悲伤的时候，我就会看日落。<span style="color:#ffd700;">有一天，我看了四十四次日落。</span>',
                avatar: 'prince'
            },
            {
                id: 'node_8',
                speaker: '可可',
                text: '四十四次日落……那一定是很 <span style="color:#6f9e3f;">悲伤</span> 的一天吧。',
                avatar: 'cocoa'
            },
            {
                id: 'node_9',
                speaker: '小王子',
                text: '是的。但今天不一样，今天我遇到了你。你知道吗？<span style="color:#ffd700;">如果你驯养了我，我们就会彼此需要。</span>',
                avatar: 'prince'
            },
            {
                id: 'node_10',
                speaker: '可可',
                text: '驯养……是什么 <span style="color:#6f9e3f;">意思</span>？',
                avatar: 'cocoa'
            },
            {
                id: 'node_11',
                speaker: '小王子',
                text: '就是 <span style="color:#ffd700;">建立联系</span>。如果你驯养了我，我会喜欢风吹过麦田的声音，因为你的头发是金色的。',
                avatar: 'prince'
            },
            {
                id: 'node_12',
                speaker: '可可',
                text: '金色……你说得好像我的头发是 <span style="color:#6f9e3f;">麦田</span> 一样。',
                avatar: 'cocoa'
            },
            {
                id: 'node_13',
                speaker: '小王子',
                text: '是啊！你的头发就像麦田一样。我喜欢星星。<span style="color:#ffd700;">当你抬头看星星的时候，所有的星星都变成了花。</span>',
                avatar: 'prince'
            },
            {
                id: 'node_14',
                speaker: '可可',
                text: '你真是个……奇怪的人。你说的话我有时候听得懂，有时候听不懂，但总觉得很有 <span style="color:#6f9e3f;">道理</span>。',
                avatar: 'cocoa'
            },
            {
                id: 'node_15',
                speaker: '小王子',
                text: '我是个小王子，当然是有点奇怪的。你愿意帮我找玫瑰吗？我一个人找了好久，都找不到她。',
                avatar: 'prince'
            },
            {
                id: 'node_16',
                speaker: '可可',
                text: '好啊，我帮你找。我们 <span style="color:#6f9e3f;">一起</span> 找。',
                avatar: 'cocoa'
            },
            {
                id: 'node_17',
                speaker: '小王子',
                text: '真的吗？太好了！你看起来不像一个蘑菇了，你像一个 <span style="color:#ffd700;">会发光的人</span>。✨',
                avatar: 'prince'
            }
        ],
        rewards: {
            coins: 10,
            rep: 15
        }
    },

    // ============================================================
    // 煎蛋海 · 煎蛋大师剧情
    // ============================================================
    friedegg: {
        id: 'friedegg',
        regionName: '煎蛋海',
        icon: '🍳',
        completed: false,
        mapRevealed: false,
        nodes: [
            {
                id: 'node_1',
                speaker: '可可',
                text: '这里就是煎蛋海吗？海面看起来……像煎蛋？',
                avatar: 'cocoa'
            },
            {
                id: 'node_2',
                speaker: '嫑嫑',
                text: '你看那边！有个老爷爷在煎蛋！好大一个煎蛋！',
                avatar: 'nono'
            },
            {
                id: 'node_3',
                speaker: '煎蛋大师',
                text: '哈哈哈！欢迎来到煎蛋海！我是这里的煎蛋大师，这片海是我用秘制的蛋液调出来的！',
                avatar: 'eggking'
            },
            {
                id: 'node_4',
                speaker: '可可',
                text: '用蛋液调出来的海？！好厉害！那这些波浪都是……蛋花吗？',
                avatar: 'cocoa'
            },
            {
                id: 'node_5',
                speaker: '煎蛋大师',
                text: '聪明！我在这片海里养了最特别的蛋，每一颗都饱含了我的厨艺精华。你们想试试吗？',
                avatar: 'eggking'
            },
            {
                id: 'node_6',
                speaker: '嫑嫑',
                text: '想！我们最爱吃蛋了！',
                avatar: 'nono'
            },
            {
                id: 'node_7',
                speaker: '煎蛋大师',
                text: '那好！我这儿有两个挑战——中等和困难。完成我的数独挑战，就能获得我特制的煎蛋！',
                avatar: 'eggking'
            },
            {
                id: 'node_8',
                speaker: '可可',
                text: '数独挑战？听起来好有趣！完成挑战可以获得什么煎蛋呀？',
                avatar: 'cocoa'
            },
            {
                id: 'node_9',
                speaker: '煎蛋大师',
                text: '中等难度奖励 <span style="color:#ffd700;">🥚 鸡蛋</span>，困难难度奖励 <span style="color:#ffd700;">🥚✨ 金蛋</span>！金蛋可是能在可颂大陆卖出好价钱的！',
                avatar: 'eggking'
            },
            {
                id: 'node_10',
                speaker: '嫑嫑',
                text: '金蛋！可可！我们快去挑战吧！',
                avatar: 'nono'
            },
            {
                id: 'node_11',
                speaker: '煎蛋大师',
                text: '不急不急，先把我的数独规则记住——每个数字在每行、每列、每个小九宫格里只能出现一次。填满所有空格，就能获得奖励！',
                avatar: 'eggking'
            },
            {
                id: 'node_12',
                speaker: '可可',
                text: '我们记住了！谢谢煎蛋大师！',
                avatar: 'cocoa'
            },
            {
                id: 'node_13',
                speaker: '煎蛋大师',
                text: '去吧去吧！煎蛋海永远欢迎你们！记得常来挑战！',
                avatar: 'eggking'
            }
        ],
        rewards: {
            coins: 8,
            rep: 12
        }
    },

    // ============================================================
    // 可颂大陆 · 老可颂剧情
    // ============================================================
    croissant: {
        id: 'croissant',
        regionName: '可颂大陆',
        icon: '🥐',
        completed: false,
        mapRevealed: false,
        nodes: [
            {
                id: 'node_1',
                speaker: '老可颂',
                text: '哦？新面孔！我是老可颂，这片大陆最早的商人。',
                avatar: 'laokesong'
            },
            {
                id: 'node_2',
                speaker: '可可',
                text: '您好！我们是从欢迎米来湾过来的。',
                avatar: 'cocoa'
            },
            {
                id: 'node_3',
                speaker: '老可颂',
                text: '欢迎米来湾？哈哈哈！我年轻的时候啊，经常去那里进货。那时候的鱼啊，又大又肥，不像现在……',
                avatar: 'laokesong'
            },
            {
                id: 'node_4',
                speaker: '可可',
                text: '您在这里做生意很久了吗？',
                avatar: 'cocoa'
            },
            {
                id: 'node_5',
                speaker: '老可颂',
                text: '三十年了。我见过无数的冒险者，有的满载而归，有的两手空空。做生意嘛，眼光比运气更重要。',
                avatar: 'laokesong'
            },
            {
                id: 'node_6',
                speaker: '可可',
                text: '这里真的是"世界的贸易中心"啊……',
                avatar: 'cocoa'
            },
            {
                id: 'node_7',
                speaker: '老可颂',
                text: '没错！不管是鱼、蛋，还是稀奇古怪的东西，你都能在这里找到买家或者卖家。',
                avatar: 'laokesong'
            },
            {
                id: 'node_8',
                speaker: '可可',
                text: '那……您这里收什么东西？',
                avatar: 'cocoa'
            },
            {
                id: 'node_9',
                speaker: '老可颂',
                text: '什么都收！只要你有的，我都能给你一个好价钱。当然，我的货也是最好的。',
                avatar: 'laokesong'
            },
            {
                id: 'node_10',
                speaker: '可可',
                text: '那我们可以交易吗？',
                avatar: 'cocoa'
            },
            {
                id: 'node_11',
                speaker: '老可颂',
                text: '哈哈哈！当然可以！来，看看我的货，再看看你的背包——咱们公平交易。',
                avatar: 'laokesong'
            },
            {
                id: 'node_12',
                speaker: '可可',
                text: '那就麻烦您了！',
                avatar: 'cocoa'
            },
            {
                id: 'node_13',
                speaker: '老可颂',
                text: '不麻烦不麻烦！我这个人啊，最喜欢和年轻人做生意了。你有眼光！',
                avatar: 'laokesong'
            }
        ],
        rewards: {
            coins: 10,
            rep: 15
        }
    },

    // ============================================================
    // 沙锅洲 · 老矿工剧情
    // ============================================================
    dumbpan: {
        id: 'dumbpan',
        regionName: '沙锅洲',
        icon: '🍲',
        completed: false,
        mapRevealed: false,
        nodes: [
            {
                id: 'node_1',
                speaker: '可可',
                text: '这里就是沙锅洲吗？看起来好荒凉啊……只有一座矿井。',
                avatar: 'cocoa'
            },
            {
                id: 'node_2',
                speaker: '嫑嫑',
                text: '你看那边！有个老爷爷在敲石头！',
                avatar: 'nono'
            },
            {
                id: 'node_3',
                speaker: '老矿工 · 锅叔',
                text: '哟！新面孔！我是锅叔，在这沙锅洲挖了四十多年的矿了！你们是来挖矿的？',
                avatar: 'miner'
            },
            {
                id: 'node_4',
                speaker: '可可',
                text: '您好！我们是从欢迎米来湾过来的。这里真的能挖到好东西吗？',
                avatar: 'cocoa'
            },
            {
                id: 'node_5',
                speaker: '老矿工 · 锅叔',
                text: '哈哈哈！沙锅洲的矿脉深不见底，只要你肯挖，什么都能挖出来！',
                avatar: 'miner'
            },
            {
                id: 'node_6',
                speaker: '老矿工 · 锅叔',
                text: '你看这矿井——越往下挖，好东西越多！铁矿、钻石，都是宝贝！',
                avatar: 'miner'
            },
            {
                id: 'node_7',
                speaker: '嫑嫑',
                text: '钻石？！真的吗？！',
                avatar: 'nono'
            },
            {
                id: 'node_8',
                speaker: '老矿工 · 锅叔',
                text: '当然是真的！我年轻时挖到过一颗鸡蛋大的钻石，卖了老多钱呢！',
                avatar: 'miner'
            },
            {
                id: 'node_9',
                speaker: '老矿工 · 锅叔',
                text: '喏，这把旧镐头送你们了。每天都可以来领免费的镐头，多挖多赚！',
                avatar: 'miner'
            },
            {
                id: 'node_10',
                speaker: '可可',
                text: '谢谢锅叔！我们这就下去试试！',
                avatar: 'cocoa'
            },
            {
                id: 'node_11',
                speaker: '老矿工 · 锅叔',
                text: '记住！挖到的铁矿可以拿去八仙锅海粉碎，钻石在可颂大陆能卖个好价钱！',
                avatar: 'miner'
            },
            {
                id: 'node_12',
                speaker: '嫑嫑',
                text: '我们记住了！锅叔再见！',
                avatar: 'nono'
            },
            {
                id: 'node_13',
                speaker: '老矿工 · 锅叔',
                text: '去吧去吧！挖到钻石记得请我喝酒！',
                avatar: 'miner'
            }
        ],
        rewards: {
            coins: 5,
            rep: 10
        }
    },

    // ============================================================
    // 八仙锅海 · 小楼剧情
    // ============================================================
    baxian: {
        id: 'baxian',
        regionName: '八仙锅海',
        icon: '🧂',
        completed: false,
        mapRevealed: false,
        nodes: [
            {
                speaker: '可可',
                text: '这里就是八仙锅海吗？好浓的机油味……还有蒸汽！',
                avatar: 'cocoa'
            },
            {
                speaker: '嫑嫑',
                text: '你看那边！有个……机器人？他在敲什么东西？',
                avatar: 'nono'
            },
            {
                speaker: '小楼',
                text: '叮——检测到生命体接近。身份：可可，嫑嫑。欢迎光临八仙锅海粉碎工厂。',
                avatar: 'xiaolou'
            },
            {
                speaker: '可可',
                text: '哇！你会说话？还会知道我们的名字？',
                avatar: 'cocoa'
            },
            {
                speaker: '小楼',
                text: '哔——喀哺爷爷已经提前录入你们的资料。我是小楼，负责管理这台万能粉碎机。',
                avatar: 'xiaolou'
            },
            {
                speaker: '嫑嫑',
                text: '万能粉碎机？那是干什么用的呀？',
                avatar: 'nono'
            },
            {
                speaker: '小楼',
                text: '任何原材料，只要放进我的粉碎机，都能变成更高级的材料。可可豆→可可粉，米米苗苗→面粉，铁矿石→燃料。',
                avatar: 'xiaolou'
            },
            {
                speaker: '可可',
                text: '哇！那这些材料有什么用呢？',
                avatar: 'cocoa'
            },
            {
                speaker: '小楼',
                text: '哔——可可粉和面粉可以在帕尼尼大陆制作美食，燃料可以在嫑界洋驱动蒸汽机械。都是好东西。',
                avatar: 'xiaolou'
            },
            {
                speaker: '嫑嫑',
                text: '那我们正需要这些！快教我们怎么用！',
                avatar: 'nono'
            },
            {
                speaker: '小楼',
                text: '很简单。选择你要粉碎的材料，输入数量，每份消耗 2 探险币作为机器维护费。哔——要试试吗？',
                avatar: 'xiaolou'
            },
            {
                speaker: '可可',
                text: '好！我们这就开始！',
                avatar: 'cocoa'
            },
            {
                speaker: '小楼',
                text: '叮——祝你们粉碎愉快。有任何问题，随时找我小楼。铁子，冲！',
                avatar: 'xiaolou'
            }
        ],
        rewards: {
            coins: 10,
            rep: 20
        }
    },

    // ============================================================
    // 大米洲 · 完整剧情
    // ============================================================
    rice: {
        id: 'rice',
        regionName: '大米洲',
        icon: '🍚',
        completed: false,
        mapRevealed: false,
        nodes: [
            {
                speaker: '嫑嫑',
                text: '这是哪里，哇！金灿灿的，像金色的海洋一样！',
                avatar: 'nono'
            },
            {
                speaker: '可可',
                text: '地图上显示这是大米洲，看，这儿有个人。',
                avatar: 'cocoa'
            },
            {
                speaker: '嫑嫑',
                text: '那我们去问问他。',
                avatar: 'nono'
            },
            {
                speaker: '可可',
                text: '你好，请问这儿是生产水稻的地方吗？',
                avatar: 'cocoa'
            },
            {
                speaker: '农民',
                text: '呵哈哈，你好，第一次来吧，欢迎你们来到大米洲！',
                avatar: 'default'
            },
            {
                speaker: '农民',
                text: '我们大米洲有神奇的稻米，这些稻米都是通过可可豆能量转换种出来的。',
                avatar: 'default'
            },
            {
                speaker: '可可',
                text: '可可豆，我们有不少欸。',
                avatar: 'cocoa'
            },
            {
                speaker: '农民',
                text: '在我们大米洲种出来的稻米是可以制作隐藏能量的。',
                avatar: 'default'
            },
            {
                speaker: '嫑嫑',
                text: '哇，好神奇！可可我们正需要隐藏能量呢。',
                avatar: 'nono'
            },
            {
                speaker: '农民',
                text: '你们来得正好，我这里有刚收割的新鲜稻谷，送给你们一些作为启动资金。',
                avatar: 'default'
            },
            {
                speaker: '可可',
                text: '真的吗？太感谢您了！',
                avatar: 'cocoa'
            },
            {
                speaker: '农民',
                text: '记住，先在稻田里种下稻谷，等它们成熟后收割，再用能量工坊加工成你需要的能量。要是有金色稻谷还有惊喜。',
                avatar: 'default'
            }
        ],
        rewards: {
            riceGrain: 10,
            rep: 10
        }
    },

    // ============================================================
    // 帕尼尼大陆 · 老帕剧情（完整）
    // ============================================================
    panini: {
        id: 'panini',
        regionName: '帕尼尼大陆',
        icon: '🥪',
        completed: false,
        mapRevealed: false,
        nodes: [
            {
                speaker: '可可',
                text: '这里就是帕尼尼大陆吗？好香啊！像是烤面包的味道！',
                avatar: 'cocoa'
            },
            {
                speaker: '嫑嫑',
                text: '你看那边！有个大厨房！还有人在里面忙活！',
                avatar: 'nono'
            },
            {
                speaker: '美食家 · 老帕',
                text: '哟，新面孔！欢迎欢迎！我是老帕，帕尼尼大陆首席美食家！',
                avatar: 'default'
            },
            {
                speaker: '可可',
                text: '您好！我们听喀哺爷爷说这里可以做出神奇的食物？',
                avatar: 'cocoa'
            },
            {
                speaker: '美食家 · 老帕',
                text: '哈哈，没错！这里是可可世界的美食实验室。只要你有创意，什么美味都能做出来！',
                avatar: 'default'
            },
            {
                speaker: '嫑嫑',
                text: '真的吗？那我们能做些什么呢？',
                avatar: 'nono'
            },
            {
                speaker: '美食家 · 老帕',
                text: '很简单！看见那口大锅了吗？把6种你喜欢的食材放进去，再加点燃料加热，9分钟后就能得到一份全新的美食！',
                avatar: 'default'
            },
            {
                speaker: '可可',
                text: '6种食材随意搭配？那岂不是有无数种可能？',
                avatar: 'cocoa'
            },
            {
                speaker: '美食家 · 老帕',
                text: '对！但只有特定的搭配才能做出真正的美食，其他的嘛……会变成黑暗料理，💀 嘿嘿，也算是一种"探索"吧。',
                avatar: 'default'
            },
            {
                speaker: '嫑嫑',
                text: '哇，好有趣！那我们做出来的食物能干什么呀？',
                avatar: 'nono'
            },
            {
                speaker: '美食家 · 老帕',
                text: '可以留着，以后会有大用处！说不定能打开通往某个神秘地方的大门……不过现在嘛，先享受烹饪的乐趣吧！',
                avatar: 'default'
            },
            {
                speaker: '可可',
                text: '那我们赶紧试试！谢谢老帕！',
                avatar: 'cocoa'
            },
            {
                speaker: '美食家 · 老帕',
                text: '等等，第一次来，我送你们一点燃料做启动资金。记住：6种食材，缺一不可，燃料也要备足！',
                avatar: 'default'
            },
            {
                speaker: '可可',
                text: '我们记住了！',
                avatar: 'cocoa'
            },
            {
                speaker: '嫑嫑',
                text: '冲呀！去探索美味啦！',
                avatar: 'nono'
            }
        ],
        rewards: {
            coins: 10,
            rep: 20,
            ore_fuel: 10
        }
    }
};

// 导出到全局
window.STORY_DATA = STORY_DATA;