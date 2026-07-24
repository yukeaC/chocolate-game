// 全局升级等级
let miaoBargainLevel = 0;
let productionSpeedLevel = 0;
let expBoostLevel = 0;  // 经验加成等级
var workaholicLevel = 0;

// 经验与等级
let exp = 0;
let level = 1;

// 能量存储
let energies = {};
for (let e of ENERGY_TYPES) { energies[e.id] = 0; }

// 坑位相关
let slots = [];
let slotTimers = [];
let slotIntervals = [];

// 普通产品库存
let inventory = {};
for (let id in PRODUCTS) { inventory[id] = 0; }

// 隐藏产品库存
let hiddenInventory = {};
for (let r of HIDDEN_RECIPES) { hiddenInventory[r.id] = 0; }

// 基础资源
let cocoaBeans = 0;
let gold = 0;
let totalProduced = 0;
let totalSold = 0;
let totalEarned = 0;
let totalBeansHarvested = 0;

// 自动保存开关
let autoSaveEnabled = true;

// 订单系统变量
let currentOrders = [];

// 用户个人信息
let userProfile = {
    nickname: (typeof generateRandomNickname === 'function') ? generateRandomNickname() : '米-00000000',
    nicknameChanged: false,
    nicknameChangeCount: 0
};

// 初始化槽位结构（6个，第一个解锁）
for (let i = 0; i < TOTAL_SLOTS; i++) {
    slots.push({ unlocked: (i === 0), productId: null, remainingSec: 0, status: 'idle' });
    slotTimers.push(null);
    slotIntervals.push(null);
}

// 初始化农场
if (typeof initFarm === 'function') {
    initFarm();
}