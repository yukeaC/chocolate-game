// js/sell.js

let currentSellProduct = null;
let currentQuantity = 1;
let isSelling = false;  // 出售锁，防止重复点击

// ============================================
// 渲染快速出售
// ============================================
function renderQuickSell() {
    const quickSellGrid = document.getElementById('quickSellGrid');
    if (!quickSellGrid) return;
    quickSellGrid.innerHTML = '';
    
    for (const [id, prod] of Object.entries(PRODUCTS)) {
        const qty = inventory[id] || 0;
        const price = getActualPrice(prod.basePrice);
        const expGain = getSellExp(price);
        const itemDiv = document.createElement('div');
        itemDiv.className = 'sell-item';
        itemDiv.innerHTML = `
            <div class="sell-emoji">${prod.name.split(' ')[0]}</div>
            <div class="sell-info">
                <div class="sell-price">💰 ${price} <span class="sell-exp">✨${expGain}</span></div>
                <div class="sell-stock">📦 ${qty}</div>
            </div>
        `;
        itemDiv.onclick = (function(pid, pname, pprice, pstock) {
            return function() { openSellModal(pid, pname, pprice, pstock); };
        })(id, prod.name, price, qty);
        quickSellGrid.appendChild(itemDiv);
    }
    
    if (level >= 5) {
        for (let recipe of HIDDEN_RECIPES) {
            const qty = hiddenInventory[recipe.id] || 0;
            const price = getActualPrice(recipe.basePrice);
            const expGain = getSellExp(price);
            const itemDiv = document.createElement('div');
            itemDiv.className = 'sell-item hidden-item';
            itemDiv.innerHTML = `
                <img src="${recipe.img}" style="width: 32px; height: 32px; object-fit: contain; border-radius: 8px; margin: 0 auto 4px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
                <span style="display:none;">${recipe.name.split(' ')[0]}</span>
                <div class="sell-info">
                    <div class="sell-price">💰 ${price} <span class="sell-exp">✨${expGain}</span></div>
                    <div class="sell-stock">📦 ${qty}</div>
                </div>
            `;
            itemDiv.onclick = (function(rid, rname, rprice, rqty) {
                return function() { openSellModal(rid, rname, rprice, rqty, true); };
            })(recipe.id, recipe.name, price, qty);
            quickSellGrid.appendChild(itemDiv);
        }
    }
}

// ============================================
// 打开出售模态框
// ============================================
function openSellModal(productId, productName, price, maxStock, isHidden = false) {
    if (maxStock <= 0) {
        showMessage(`${productName} 库存不足，无法出售`, true);
        return;
    }
    currentSellProduct = { id: productId, name: productName, price: price, maxStock: maxStock, isHidden: isHidden };
    currentQuantity = 1;
    updateSellModalDisplay();
    const sellModal = document.getElementById('sellModal');
    if (sellModal) sellModal.classList.remove('hidden');
}

// ============================================
// 更新出售模态框显示
// ============================================
function updateSellModalDisplay() {
    if (!currentSellProduct) return;
    const sellModalTitle = document.getElementById('sellModalTitle');
    const sellModalInfo = document.getElementById('sellModalInfo');
    const sellQuantityInput = document.getElementById('sellQuantityInput');
    const sellTotalPriceSpan = document.getElementById('sellTotalPrice');
    const decBtn = document.getElementById('decBtn');
    const incBtn = document.getElementById('incBtn');
    if (sellModalTitle) sellModalTitle.innerText = `出售 ${currentSellProduct.name}`;
    if (sellModalInfo) sellModalInfo.innerHTML = `库存: ${currentSellProduct.maxStock}<br>单价: ${currentSellProduct.price} 金币`;
    if (sellQuantityInput) {
        sellQuantityInput.value = currentQuantity;
        sellQuantityInput.max = currentSellProduct.maxStock;
        sellQuantityInput.min = 1;
    }
    const total = currentQuantity * currentSellProduct.price;
    if (sellTotalPriceSpan) sellTotalPriceSpan.innerText = `总价: ${total} 金币`;
    if (decBtn) decBtn.disabled = (currentQuantity <= 1);
    if (incBtn) incBtn.disabled = (currentQuantity >= currentSellProduct.maxStock);
}

// ============================================
// 修改数量
// ============================================
function changeQuantity(delta) {
    if (!currentSellProduct) return;
    let newQty = currentQuantity + delta;
    if (newQty < 1) newQty = 1;
    if (newQty > currentSellProduct.maxStock) newQty = currentSellProduct.maxStock;
    if (newQty !== currentQuantity) {
        currentQuantity = newQty;
        updateSellModalDisplay();
    }
}

// 绑定数量输入框事件
const sellQuantityInput = document.getElementById('sellQuantityInput');
if (sellQuantityInput) {
    sellQuantityInput.addEventListener('input', function(e) {
        if (!currentSellProduct) return;
        let val = parseInt(e.target.value);
        if (isNaN(val)) val = 1;
        if (val < 1) val = 1;
        if (val > currentSellProduct.maxStock) val = currentSellProduct.maxStock;
        currentQuantity = val;
        e.target.value = val;
        updateSellModalDisplay();
    });
    sellQuantityInput.addEventListener('keydown', function(e) {
        const key = e.key;
        if (key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Tab') return;
        if (!/^[0-9]$/.test(key)) e.preventDefault();
    });
}

// ============================================
// 确认出售
// ============================================
async function confirmSell() {
    if (isSelling) {
        showMessage('正在处理中，请稍候...', true);
        return;
    }
    
    if (!currentSellProduct) {
        showMessage('请选择要出售的商品', true);
        return;
    }
    
    isSelling = true;
    
    try {
        const productId = currentSellProduct.id;
        const amount = currentQuantity;
        const productName = currentSellProduct.name;
        const price = currentSellProduct.price;
        let qty;
        if (!currentSellProduct.isHidden) {
            qty = inventory[productId] || 0;
        } else {
            qty = hiddenInventory[productId] || 0;
        }
        
        if (qty < amount) {
            showMessage(`${productName} 库存不足，当前库存: ${qty}`, true);
            const sellModal = document.getElementById('sellModal');
            if (sellModal) sellModal.classList.add('hidden');
            isSelling = false;
            return;
        }
        
        const revenue = price * amount;
        gold += revenue;
        totalEarned += revenue;
        totalSold += amount;
        
        if (!currentSellProduct.isHidden) {
            inventory[productId] -= amount;
        } else {
            hiddenInventory[productId] -= amount;
        }
        
        let expGain = getSellExp(revenue);
        const boost = getActualExpBoost();
        const finalExp = Math.floor(expGain * boost);
        
        showMessage(`💰 卖出 ${amount} 个${productName}，获得 ${revenue} 金币（经验 +${finalExp}）`, false);
        addExp(finalExp);
        refreshUI();

        if (typeof soundCoin === 'function') soundCoin();
        if (typeof soundSuccess === 'function') soundSuccess();
        
        const sellModal = document.getElementById('sellModal');
        if (sellModal) sellModal.classList.add('hidden');
        
        if (autoSaveEnabled) saveGame();
        
    } catch (err) {
        console.error('出售失败:', err);
        showMessage('出售失败，请重试', true);
    } finally {
        isSelling = false;
    }
}

// ============================================
// 取消出售
// ============================================
function cancelSell() {
    const sellModal = document.getElementById('sellModal');
    if (sellModal) sellModal.classList.add('hidden');
}

// ============================================
// 全部卖出（含自定义模态框 + 音效）
// 无库存时弹出“仓库空空”提示，有库存时弹出确认框
// ============================================
async function sellAllProducts() {
    // 1. 防重复点击
    if (isSelling) {
        showMessage('正在处理中，请稍候...', true);
        if (typeof soundError === 'function') soundError();
        return;
    }

    // 2. 检查是否有库存
    let hasStock = false;

    // 检查普通产品
    for (const [id, prod] of Object.entries(PRODUCTS)) {
        if ((inventory[id] || 0) > 0) {
            hasStock = true;
            break;
        }
    }

    // 检查隐藏产品
    if (!hasStock) {
        for (let recipe of HIDDEN_RECIPES) {
            if ((hiddenInventory[recipe.id] || 0) > 0) {
                hasStock = true;
                break;
            }
        }
    }

    // 3. 无库存 → 弹窗提示（不显示取消按钮）
    if (!hasStock) {
        await showConfirmModal({
            icon: '📦',
            title: '仓库空空',
            message: '当前没有任何产品可以出售！\n先去工坊制作一些产品吧。',
            okText: '知道了',
            showCancel: false,
            okColor: 'linear-gradient(135deg,#6f9e3f,#4c7a2a)'
        });
        if (typeof soundError === 'function') soundError();
        return;
    }

    // 4. 有库存 → 弹出确认框（有确定和取消）
    var confirmed = await showConfirmModal({
        icon: '📦',
        title: '全部卖出',
        message: '确定要卖出所有产品吗？\n此操作不可撤销！',
        okText: '全部卖出',
        cancelText: '取消',
        okColor: 'linear-gradient(135deg,#e7a05e,#c98f5e)'
    });

    if (!confirmed) {
        if (typeof soundCancel === 'function') soundCancel();
        return;
    }

    // 5. 执行卖出
    try {
        let totalRevenue = 0, totalCount = 0;

        // 普通产品
        for (const [id, prod] of Object.entries(PRODUCTS)) {
            const qty = inventory[id] || 0;
            if (qty > 0) {
                const price = getActualPrice(prod.basePrice);
                totalRevenue += price * qty;
                totalCount += qty;
                totalEarned += price * qty;
                totalSold += qty;
                inventory[id] = 0;
            }
        }

        // 隐藏产品
        for (let recipe of HIDDEN_RECIPES) {
            const qty = hiddenInventory[recipe.id] || 0;
            if (qty > 0) {
                const price = getActualPrice(recipe.basePrice);
                totalRevenue += price * qty;
                totalCount += qty;
                totalEarned += price * qty;
                totalSold += qty;
                hiddenInventory[recipe.id] = 0;
            }
        }

        gold += totalRevenue;

        // 计算经验（应用经验加成）
        let expGain = getSellExp(totalRevenue);
        const boost = getActualExpBoost();
        const finalExp = Math.floor(expGain * boost);

        showMessage(`🐧 嫑嫑全部卖出！共 ${totalCount} 件，获得 ${totalRevenue} 金币（经验 +${finalExp}）`, false);
        addExp(finalExp);
        refreshUI();

        if (typeof soundCoin === 'function') soundCoin();
        if (typeof soundSuccess === 'function') soundSuccess();
        if (autoSaveEnabled) saveGame();

    } catch (err) {
        console.error('全部卖出失败:', err);
        showMessage('操作失败，请重试', true);
        if (typeof soundError === 'function') soundError();
    } finally {
        isSelling = false;
    }
}

// ============================================
// 导出全局接口
// ============================================
window.renderQuickSell = renderQuickSell;
window.openSellModal = openSellModal;
window.changeQuantity = changeQuantity;
window.confirmSell = confirmSell;
window.cancelSell = cancelSell;
window.sellAllProducts = sellAllProducts;