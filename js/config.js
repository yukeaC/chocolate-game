// js/config.js

// 普通产品定义
const PRODUCTS = {
    charlieChocolate: { id: 'charlieChocolate', name: '🍫 查理的巧克力', beanCost: 9, timeSec: 10, basePrice: 5 },
    cherryInfinity:   { id: 'cherryInfinity', name: '🍒 樱有尽有', beanCost: 29, timeSec: 30, basePrice: 12 },
    hawthornStack:    { id: 'hawthornStack', name: '🍡 好事楂堆', beanCost: 99, timeSec: 60, basePrice: 20 },
    sunEggToast:      { id: 'sunEggToast', name: '🍞 小太阳蛋元气吐司', beanCost: 299, timeSec: 180, basePrice: 70 },
    cheeseCocoa:      { id: 'cheeseCocoa', name: '🧀 芝士可可', beanCost: 520, timeSec: 480, basePrice: 160 },
    milkSkinDelight:  { id: 'milkSkinDelight', name: '🥛 万事米丽奶皮子', beanCost: 725, timeSec: 720, basePrice: 220 },
    luckyPeanut:      { id: 'luckyPeanut', name: '🥜 好事花生', beanCost: 929, timeSec: 1200, basePrice: 360 },
    tiramisuCroissant: { id: 'tiramisuCroissant', name: '🥐 提拉米苏可颂', beanCost: 1699, timeSec: 3600, basePrice: 999 }
};

// 能量定义
const ENERGY_TYPES = [
    { id: 'cheese_powder', name: '高塔芝士粉', img: 'images/energy/高塔芝士粉.png' },
    { id: 'inspiration_jelly', name: '灵感啫喱', img: 'images/energy/灵感啫喱.png' },
    { id: 'mimi_seedling', name: '米米苗苗', img: 'images/energy/米米苗苗.png' },
    { id: 'time_pudding', name: '时光布丁', img: 'images/energy/时光布丁.png' },
    { id: 'warm_butter', name: '温暖黄油', img: 'images/energy/温暖黄油.png' },
    { id: 'star_crystal', name: '星晶雪花', img: 'images/energy/星晶雪花.png' }
];

// 隐藏食谱（包含新增4个）
const HIDDEN_RECIPES = [
    {
        id: 'daxi_wang', name: '大喜锅望', img: 'images/delicacy/大喜锅望.png',
        energyCost: [{ id: 'cheese_powder', amount: 1 }, { id: 'inspiration_jelly', amount: 1 }, { id: 'mimi_seedling', amount: 1 }],
        beanCost: 929, goldCost: 929, timeSec: 929, basePrice: 9290
    },
    {
        id: 'dian_guo_luzhe', name: '掂过碌蔗', img: 'images/delicacy/掂过碌蔗.png',
        energyCost: [{ id: 'time_pudding', amount: 1 }, { id: 'inspiration_jelly', amount: 1 }, { id: 'warm_butter', amount: 1 }],
        beanCost: 929, goldCost: 929, timeSec: 929, basePrice: 9290
    },
    {
        id: 'dou_zhi_yang', name: '豆志昂扬', img: 'images/delicacy/豆志昂扬.png',
        energyCost: [{ id: 'cheese_powder', amount: 1 }, { id: 'star_crystal', amount: 1 }, { id: 'mimi_seedling', amount: 1 }],
        beanCost: 929, goldCost: 929, timeSec: 929, basePrice: 9290
    },
    {
        id: 'wei_tong_jiao_la', name: '味同嚼辣', img: 'images/delicacy/味同嚼辣.png',
        energyCost: [{ id: 'time_pudding', amount: 1 }, { id: 'warm_butter', amount: 1 }, { id: 'star_crystal', amount: 1 }],
        beanCost: 929, goldCost: 929, timeSec: 929, basePrice: 9290
    },
    // ===== 新增4个 =====
    {
        id: 'zheng_xiang_da_bai', name: '蒸相大白', img: 'images/delicacy/蒸相大白.png',
        energyCost: [{ id: 'inspiration_jelly', amount: 1 }, { id: 'warm_butter', amount: 1 }, { id: 'star_crystal', amount: 1 }],
        beanCost: 929, goldCost: 929, timeSec: 929, basePrice: 9290
    },
    {
        id: 'zhao_xian_na_shi', name: '招咸纳士', img: 'images/delicacy/招咸纳士.png',
        energyCost: [{ id: 'mimi_seedling', amount: 1 }, { id: 'time_pudding', amount: 1 }, { id: 'star_crystal', amount: 1 }],
        beanCost: 929, goldCost: 929, timeSec: 929, basePrice: 9290
    },
    {
        id: 'xin_shou_nian_lai', name: '信手粘来', img: 'images/delicacy/信手粘来.png',
        energyCost: [{ id: 'inspiration_jelly', amount: 1 }, { id: 'mimi_seedling', amount: 1 }, { id: 'warm_butter', amount: 1 }],
        beanCost: 929, goldCost: 929, timeSec: 929, basePrice: 9290
    },
    {
        id: 'chang_suo_yu_yan', name: '畅所芋言', img: 'images/delicacy/畅所芋言.png',
        energyCost: [{ id: 'time_pudding', amount: 1 }, { id: 'cheese_powder', amount: 1 }, { id: 'star_crystal', amount: 1 }],
        beanCost: 929, goldCost: 929, timeSec: 929, basePrice: 9290
    }
];

const TOTAL_SLOTS = 6;
const ORDER_COUNT = 5;

// 工作狂技能配置
const WORKAHOLIC_CONFIG = {
    maxLevel: 10,
    baseInterval: 10,
    intervalReductionPerLevel: 0.5,
    upgradeBaseCost: 100,
    costMultiplier: 1.4
};

// 经验加成配置
const EXP_BOOST_CONFIG = {
    maxLevel: 10,
    boostPerLevel: 0.02,
    upgradeBaseCost: 80,
    costMultiplier: 20
};