function renderEnergyModal() {
    const energyListDiv = document.getElementById('energyList');
    if (!energyListDiv) return;
    energyListDiv.innerHTML = '';
    for (let e of ENERGY_TYPES) {
        const count = energies[e.id] || 0;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'energy-item';
        itemDiv.innerHTML = `
            <img class="energy-img" src="${e.img}" alt="${e.name}" onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2245%22%20fill%3D%22%23f1c40f%22%2F%3E%3C%2Fsvg%3E';">
            <span class="energy-name">${e.name}</span>
            <span class="energy-count">x ${count}</span>
        `;
        energyListDiv.appendChild(itemDiv);
    }
}

function openEnergyModal() {
    if (level < 5) {
        showMessage(`🔒 能量宝库需要等级 5 才能开启，当前等级 ${level}`, true);
        return;
    }
    renderEnergyModal();
    const modal = document.getElementById('energyModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
    }
}

function closeEnergyModal() {
    const modal = document.getElementById('energyModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }
}