// ADMIN.JS - PANEL
document.addEventListener('DOMContentLoaded', () => {
  renderAdminDeals();
});

function calculateDiscount() {
  const original = parseFloat(document.getElementById('deal-original-price').value);
  const current = parseFloat(document.getElementById('deal-deal-price').value);
  
  const discountDisplay = document.getElementById('calculated-discount');
  const rarityAuto = document.getElementById('auto-rarity');
  
  if (isNaN(original) || isNaN(current) || original <= 0) {
    discountDisplay.textContent = '—';
    rarityAuto.textContent = 'Introduce los precios';
    return;
  }
  
  const percentage = calculateDiscountPercentage(original, current);
  discountDisplay.textContent = `-${percentage}%`;
  
  // Auto suggest rarity
  let rarity = 'common';
  if (percentage >= 70) rarity = 'legendary';
  else if (percentage >= 40) rarity = 'epic';
  
  rarityAuto.textContent = `Sugerido: ${rarity.toUpperCase()}`;
  selectRarity(rarity);
}

function selectRarity(rarity) {
  document.querySelectorAll('.rarity-btn').forEach(btn => btn.classList.remove('active'));
  const btn = document.querySelector(`.rarity-btn[data-rarity="${rarity}"]`);
  if (btn) btn.classList.add('active');
}

function renderAdminDeals() {
  const list = document.getElementById('recent-deals-list');
  if (!list) return;

  list.innerHTML = DEALS_DATA.map(deal => {
    const discount = calculateDiscountPercentage(deal.originalPrice, deal.dealPrice);
    
    return `
      <div class="admin-deal-item">
        <div class="deal-item-info">
          <span class="deal-item-title">${deal.title}</span>
          <div class="deal-item-meta">
            ${deal.store} · <span class="rarity-badge ${deal.rarity}">${deal.rarity.toUpperCase()}</span>
          </div>
        </div>
        <div class="deal-item-price">
          <div class="deal-current-price">${formatCurrency(deal.dealPrice)}</div>
          <div class="deal-original-price">${formatCurrency(deal.originalPrice)}</div>
        </div>
      </div>
    `;
  }).join('');
}

function handlePublishDeal(e) {
  e.preventDefault();
  
  const toast = document.getElementById('publish-toast');
  toast.style.display = 'flex';
  
  setTimeout(() => {
    toast.style.display = 'none';
    document.getElementById('publish-form').reset();
    document.getElementById('calculated-discount').textContent = '—';
    document.getElementById('auto-rarity').textContent = 'Introduce los precios';
    document.querySelectorAll('.rarity-btn').forEach(btn => btn.classList.remove('active'));
  }, 3000);
}
