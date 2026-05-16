// APP.JS - HOME PAGE
document.addEventListener('DOMContentLoaded', async () => {
  await getDealsFromSupabase();
  renderFeaturedDeals();
  updateLastUpdateTime();
});

function renderFeaturedDeals() {
  const grid = document.getElementById('featured-deals-grid');
  if (!grid) return;

  // Take first 3 deals for the homepage
  const featured = DEALS_DATA.slice(0, 3);

  grid.innerHTML = featured.map(deal => {
    const discount = calculateDiscountPercentage(deal.originalPrice, deal.dealPrice);
    
    return `
      <div class="floating-card card-${deal.rarity}">
        <div class="card-badge ${deal.rarity}-badge">${getRarityLabel(deal.rarity)}</div>
        <div class="discount-badge">-${discount}%</div>
        <div style="height: 180px; background: url('${deal.imageUrl}') center/cover; border-radius: var(--radius-md) var(--radius-md) 0 0; margin: -var(--space-lg) -var(--space-lg) var(--space-md) -var(--space-lg);"></div>
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: var(--space-sm);">
          <span style="color: var(--on-surface-variant); font-size: 0.9rem;">${deal.store}</span>
        </div>
        <h4 style="font-family: var(--font-headline); font-weight: 700; margin-bottom: var(--space-sm);">${deal.title}</h4>
        <div style="display: flex; align-items: baseline; gap: var(--space-sm);">
          <span style="font-family: var(--font-headline); font-size: 1.5rem; font-weight: 800; color: var(--primary);">${formatCurrency(deal.dealPrice)}</span>
          <span style="text-decoration: line-through; color: var(--on-surface-variant); font-size: 0.9rem;">${formatCurrency(deal.originalPrice)}</span>
        </div>
        ${deal.stock ? `<p style="color: #ef4444; font-size: 0.8rem; font-weight: 600; margin-top: 4px;"><span class="material-icons" style="font-size: 12px;">timer</span> ¡Solo quedan ${deal.stock} unidades!</p>` : ''}
        <a href="${deal.url}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="width: 100%; justify-content: center; margin-top: var(--space-md);">Ir a la Oferta</a>
      </div>
    `;
  }).join('');
}

function updateLastUpdateTime() {
  const element = document.getElementById('last-update');
  if (element) {
    element.textContent = Math.floor(Math.random() * 10) + 1;
  }
}

function handleSubscribe(event) {
  event.preventDefault();
  const email = document.getElementById('email-input').value;
  alert(`¡Gracias! Te has suscrito con: ${email}`);
  document.getElementById('newsletter-form').reset();
}
