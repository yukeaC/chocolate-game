// js/sell.js

let currentSellProduct = null;
let currentQuantity = 1;
let isSelling = false;  // 出售锁，防止重复点击

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
// 确认出售（添加防重复锁 + 经验加成）
// ============================================
async function confirmSell() {
    // 防止重复点击
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
        
        // 二次校验库存
        if (qty < amount) {
            showMessage(`${productName} 库存不足，当前库存: ${qty}`, true);
            const sellModal = document.getElementById('sellModal');
            if (sellModal) sellModal.classList.add('hidden');
            isSelling = false;
            return;
        }
        
        // 计算收益
        const revenue = price * amount;
        gold += revenue;
        totalEarned += revenue;
        totalSold += amount;
        
        // 扣减库存
        if (!currentSellProduct.isHidden) {
            inventory[productId] -= amount;
        } else {
            hiddenInventory[productId] -= amount;
        }
        
        // 计算经验（应用经验加成）
        let expGain = getSellExp(revenue);
        const boost = getActualExpBoost();
        const finalExp = Math.floor(expGain * boost);
        
        showMessage(`💰 卖出 ${amount} 个${productName}，获得 ${revenue} 金币（经验 +${finalExp}）`, false);
        addExp(finalExp);
        refreshUI();

	if (typeof soundCoin === 'function') soundCoin();
    if (typeof soundSuccess === 'function') soundSuccess();
        
        // 关闭模态框
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

function cancelSell() {
    const sellModal = document.getElementById('sellModal');
    if (sellModal) sellModal.classList.add('hidden');
}

// ============================================
// 全部卖出（添加防重复锁 + 经验加成）
// ============================================
async function sellAllProducts() {
    if (isSelling) {
        showMessage('正在处理中，请稍候...', true);
        return;
    }
    
    isSelling = true;
    
    try {
        let totalRevenue = 0, totalCount = 0;
        
        // 先检查是否有产品可卖
        let hasStock = false;
        for (const [id, prod] of Object.entries(PRODUCTS)) {
            if ((inventory[id] || 0) > 0) { hasStock = true; break; }
        }
        if (!hasStock) {
            for (let recipe of HIDDEN_RECIPES) {
                if ((hiddenInventory[recipe.id] || 0) > 0) { hasStock = true; break; }
            }
        }
        
        if (!hasStock) {
            showMessage("仓库空空，没有可卖的产品", true);
            isSelling = false;
            return;
        }
        
        // 计算普通产品
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
        
        // 计算隐藏产品
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
    } finally {
        isSelling = false;
    }
}

// ============================================
// 导出全局函数
// ============================================
window.renderQuickSell = renderQuickSell;
window.openSellModal = openSellModal;
window.changeQuantity = changeQuantity;
window.confirmSell = confirmSell;
window.cancelSell = cancelSell;
window.sellAllProducts = sellAllProducts;