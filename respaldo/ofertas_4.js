// OFERTAS.JS - WALL PAGE
document.addEventListener('DOMContentLoaded', async () => {
  await dealsLoadedPromise;
  renderDeals(DEALS_DATA);
  updateResultsCount(DEALS_DATA.length);
});

function closeSubscribeBar() {
  const bar = document.getElementById('subscribe-bar');
  if (bar) {
    bar.style.display = 'none';
  }
}

function renderDeals(deals) {
  const grid = document.getElementById('deals-grid');
  if (!grid) return;

  console.log('Rendering deals in grid:', deals);

  if (deals.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: var(--space-xl);">
        <span class="material-icons" style="font-size: 3rem; color: var(--outline);">search_off</span>
        <h3 style="margin-top: var(--space-md);">No se encontraron ofertas</h3>
        <p style="color: var(--on-surface-variant);">Prueba a cambiar los filtros</p>
      </div>
    `;
    return;
  }

  // ORDENAR: Por ID (Cronológico, más reciente primero)
  const sortedDeals = [...deals].sort((a, b) => b.id - a.id);

  grid.innerHTML = sortedDeals.map(deal => {
    const discount = calculateDiscountPercentage(deal.originalPrice, deal.dealPrice);
    
    return `
      <div class="floating-card card-${deal.rarity}">
        <div class="card-badge ${deal.rarity}-badge">${getRarityLabel(deal.rarity)}</div>
        <div class="discount-badge">-${discount}%</div>
        <div style="height: 150px; background: url('${deal.imageUrl}') center/cover; border-radius: var(--radius-md) var(--radius-md) 0 0; margin: -var(--space-lg) -var(--space-lg) var(--space-md) -var(--space-lg);"></div>
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: var(--space-sm);">
          <span style="color: var(--on-surface-variant); font-size: 0.8rem;">${deal.store}</span>
        </div>
        <h4 style="font-family: var(--font-headline); font-weight: 700; margin-bottom: var(--space-sm); font-size: 1rem;">${deal.title}</h4>
        <div style="display: flex; align-items: baseline; gap: var(--space-sm);">
          <span style="font-family: var(--font-headline); font-size: 1.2rem; font-weight: 800; color: var(--primary);">${formatCurrency(deal.dealPrice)}</span>
          <span style="text-decoration: line-through; color: var(--on-surface-variant); font-size: 0.8rem;">${formatCurrency(deal.originalPrice)}</span>
        </div>
        ${deal.stock ? `<p style="color: #ef4444; font-size: 0.8rem; font-weight: 600; margin-top: 4px;"><span class="material-icons" style="font-size: 12px;">timer</span> ¡Solo quedan ${deal.stock} unidades!</p>` : ''}
        <div class="share-container">
          <a href="detalle.html?id=${deal.id}" class="btn-primary" style="flex: 2; justify-content: center; padding: 8px; margin-top: 0;">Ver Detalles</a>
          <button onclick="shareTelegram('${deal.title.replace(/'/g, "\\'")}', ${deal.id})" class="btn-share btn-tg" title="Compartir en Telegram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.28 7.68-7.05c.34-.3-.07-.46-.52-.15L7.69 12.18l-4.14-1.3c-.9-.28-.92-.9.19-1.34l16.16-6.29c.75-.28 1.4.17 1.15.96l-2.75 13.14c-.2.92-.75 1.15-1.52.72l-4.2-3.1-2.03 1.98c-.23.23-.42.42-.86.42z"/></svg>
          </button>
          <button onclick="shareInstagram('${deal.title.replace(/'/g, "\\'")}', ${deal.id})" class="btn-share btn-ig" title="Compartir en Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function updateResultsCount(count) {
  const element = document.getElementById('results-count');
  if (element) {
    element.textContent = `Mostrando ${count} ofertas`;
  }
}

function applyFilters() {
  const legendaryCheck = document.querySelector('.legendary-check input').checked;
  const epicCheck = document.querySelector('.epic-check input').checked;
  const commonCheck = document.querySelector('.common-check input').checked;
  
  const selectedCategory = document.querySelector('input[name="category"]:checked').value;
  const minDiscount = parseInt(document.getElementById('discount-range').value);

  const filtered = DEALS_DATA.filter(deal => {
    // Filter by rarity
    if (deal.rarity === 'legendary' && !legendaryCheck) return false;
    if (deal.rarity === 'epic' && !epicCheck) return false;
    if (deal.rarity === 'common' && !commonCheck) return false;
    
    // Filter by category
    if (selectedCategory !== 'all' && deal.category !== selectedCategory) return false;
    
    // Filter by discount
    const discount = calculateDiscountPercentage(deal.originalPrice, deal.dealPrice);
    if (discount < minDiscount) return false;
    
    return true;
  });

  renderDeals(filtered);
  updateResultsCount(filtered.length);
}

function updateDiscountFilter(val) {
  document.getElementById('range-value').textContent = `${val}%+`;
  applyFilters();
}

function selectChip(el) {
  document.querySelectorAll('.category-chips .chip').forEach(c => c.classList.remove('chip-active'));
  el.classList.add('chip-active');
  
  const cat = el.dataset.cat;
  const radio = document.querySelector(`input[name="category"][value="${cat}"]`);
  if (radio) {
    radio.checked = true;
    applyFilters();
  }
}

function toggleSubscribeModal() {
  const modal = document.getElementById('subscribe-modal');
  modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function closeModal(e) {
  if (e.target.id === 'subscribe-modal') {
    toggleSubscribeModal();
  }
}

function handleSubscribeModal(e) {
  e.preventDefault();
  
  const email = document.getElementById('modal-email').value;
  const countryCode = document.getElementById('country-code').value;
  const phoneNumber = document.getElementById('modal-phone').value;
  const phone = phoneNumber ? (countryCode + ' ' + phoneNumber) : '';
  
  const preferences = [];
  if (document.getElementById('notif-legendary').checked) preferences.push('Legendary');
  if (document.getElementById('notif-epic').checked) preferences.push('Epic');
  if (document.getElementById('notif-common').checked) preferences.push('Common');

  const formData = new URLSearchParams();
  formData.append('email', email);
  formData.append('phone', phone);
  formData.append('preferences', preferences.join(', '));

  const button = e.submitter;
  const originalText = button ? button.innerHTML : 'Activar Alertas';
  if (button) {
    button.innerHTML = '<span class="material-icons">hourglass_empty</span> Enviando...';
    button.disabled = true;
  }

  fetch('https://script.google.com/macros/s/AKfycbzwT8NZZ02jUktMuq-YiACf7L9O6IOeabnG0j1HKbk28y30EdPfElYVHuWrHk--ic46Zw/exec', {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  })
  .then(() => {
    alert('¡Alertas activadas con éxito!');
    toggleSubscribeModal();
    e.target.reset();
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Hubo un error al guardar los datos.');
  })
  .finally(() => {
    button.innerHTML = originalText;
    button.disabled = false;
  });
}

function setView(viewType) {
  const grid = document.getElementById('deals-grid');
  const btnGrid = document.getElementById('btn-grid-view');
  const btnList = document.getElementById('btn-list-view');
  
  if (!grid || !btnGrid || !btnList) return;

  if (viewType === 'grid') {
    grid.classList.remove('list-view');
    grid.classList.add('grid-view');
    btnGrid.classList.add('active');
    btnList.classList.remove('active');
  } else {
    grid.classList.remove('grid-view');
    grid.classList.add('list-view');
    btnList.classList.add('active');
    btnGrid.classList.remove('active');
  }
}
