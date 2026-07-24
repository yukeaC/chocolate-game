const upgradeOverlay = document.getElementById('upgradeOverlay');
let upgradeAutoCloseTimer = null;

function clearUpgradeAutoClose() {
    if (upgradeAutoCloseTimer) {
        clearTimeout(upgradeAutoCloseTimer);
        upgradeAutoCloseTimer = null;
    }
}

function closeUpgradeAnimation() {
    if (!upgradeOverlay || !upgradeOverlay.classList.contains('show')) return;
    clearUpgradeAutoClose();
    upgradeOverlay.classList.add('fade-out');
    setTimeout(() => {
        if (upgradeOverlay) upgradeOverlay.classList.remove('show', 'fade-out');
    }, 500);
}

function showUpgradeAnimation(goldReward, beanReward, newLevel, energyReward) {
    if (!upgradeOverlay) return;
    const goldSpan = document.getElementById('upgradeGoldReward');
    const beanSpan = document.getElementById('upgradeBeanReward');
    const energyItem = document.getElementById('upgradeEnergyRewardItem');
    const energyImg = document.getElementById('upgradeEnergyImg');
    const energyNameSpan = document.getElementById('upgradeEnergyName');
    const energyValueSpan = document.getElementById('upgradeEnergyReward');
    const levelSpan = document.getElementById('upgradeLevelNumber');

    if (goldSpan) goldSpan.innerText = `+${goldReward}`;
    if (beanSpan) beanSpan.innerText = `+${beanReward}`;
    if (levelSpan) levelSpan.innerText = newLevel;

    const existingMsg = document.getElementById('specialLevel5Msg');
    if (existingMsg) existingMsg.remove();

    if (energyReward && energyReward.amount > 0 && energyItem) {
        const energyType = ENERGY_TYPES.find(e => e.name === energyReward.name);
        if (energyType) {
            energyImg.src = energyType.img;
            energyImg.alt = energyReward.name;
        }
        energyNameSpan.innerText = energyReward.name;
        energyValueSpan.innerText = `+${energyReward.amount}`;
        energyItem.style.display = 'flex';

        if (newLevel === 5) {
            const rewardList = document.querySelector('#upgradeOverlay .reward-list');
            if (rewardList) {
                const msgDiv = document.createElement('div');
                msgDiv.id = 'specialLevel5Msg';
                msgDiv.className = 'reward-item';
                msgDiv.style.background = 'rgba(0,0,0,0.45)';
                msgDiv.style.borderRadius = '60px';
                msgDiv.style.padding = '8px 14px';
                msgDiv.style.marginBottom = '8px';
                msgDiv.style.textAlign = 'center';
                msgDiv.innerHTML = '<span style="width:100%; color:#ffefb0;">✨ 恭喜你发现隐藏能量 ✨</span>';
                rewardList.insertBefore(msgDiv, rewardList.firstChild);
            }
        }
    } else {
        if (energyItem) energyItem.style.display = 'none';
    }

    upgradeOverlay.classList.remove('fade-out');
    upgradeOverlay.classList.add('show');
    clearUpgradeAutoClose();
    upgradeAutoCloseTimer = setTimeout(closeUpgradeAnimation, 3000);
}

if (upgradeOverlay) {
    upgradeOverlay.addEventListener('click', (e) => {
        if (e.target === upgradeOverlay) closeUpgradeAnimation();
    });
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && upgradeOverlay && upgradeOverlay.classList.contains('show')) {
        closeUpgradeAnimation();
    }
});